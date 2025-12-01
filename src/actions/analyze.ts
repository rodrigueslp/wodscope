'use server'

import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { WodAnalysis, AnalysisResult } from '@/lib/ai.types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Analisa uma foto de lousa de WOD usando GPT-4 Vision
 * e retorna análise estruturada em JSON
 */
export async function analyzeWod(formData: FormData): Promise<AnalysisResult> {
  try {
    const supabase = await createClient()
    
    // 1. Verificar autenticação
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Não autenticado' }
    }

    // 2. Buscar perfil do usuário (PRs e lesões)
    const { data: profile } = await supabase
      .from('profiles')
      .select('prs, injuries, full_name')
      .eq('id', user.id)
      .single()

    const profileData = profile as { prs: Record<string, number> | null; injuries: string | null; full_name: string | null } | null
    const userPRs = profileData?.prs || {}
    const userInjuries = profileData?.injuries || 'Nenhuma informada'

    // 3. Extrair imagem do FormData
    const imageFile = formData.get('image') as File | null
    const imageUrl = formData.get('imageUrl') as string | null
    
    let imageContent: OpenAI.Chat.Completions.ChatCompletionContentPartImage

    if (imageFile) {
      // Converter File para base64
      const bytes = await imageFile.arrayBuffer()
      const base64 = Buffer.from(bytes).toString('base64')
      const mimeType = imageFile.type || 'image/jpeg'
      
      imageContent = {
        type: 'image_url',
        image_url: {
          url: `data:${mimeType};base64,${base64}`,
          detail: 'high'
        }
      }
    } else if (imageUrl) {
      imageContent = {
        type: 'image_url',
        image_url: {
          url: imageUrl,
          detail: 'high'
        }
      }
    } else {
      return { success: false, error: 'Nenhuma imagem fornecida' }
    }

    // 4. Montar o prompt do sistema
    const systemPrompt = `Você é um Head Coach de CrossFit experiente e especialista em fisiologia do exercício.
Seu objetivo é analisar a foto de uma lousa de treino (WOD - Workout of the Day) e personalizá-la para o atleta.

DADOS DO ATLETA:
- Nome: ${profileData?.full_name || 'Atleta'}
- PRs (Personal Records em kg): ${JSON.stringify(userPRs)}
- Lesões/Limitações: ${userInjuries}

INSTRUÇÕES:
1. Identifique o treino na foto da lousa
2. Analise o estímulo pretendido
3. Crie uma estratégia de pacing personalizada
4. Sugira escalas/adaptações baseadas nas lesões
5. Calcule cargas sugeridas baseadas nos PRs (use % do 1RM)

SAÍDA OBRIGATÓRIA (JSON estrito, sem markdown):
{
  "workout_summary": "Resumo do treino identificado (nome se houver + descrição)",
  "intent": "Qual o estímulo esperado (ex: potência, resistência, cardio metabólico)",
  "strategy": "Estratégia tática detalhada com dicas de pacing e quebra de séries",
  "scaling_options": [
    {
      "exercise": "Nome do exercício",
      "suggestion": "Alternativa sugerida",
      "reason": "Motivo da adaptação"
    }
  ],
  "suggested_weights": "Cargas sugeridas em KG com justificativa baseada nos PRs"
}

REGRAS:
- Se não conseguir identificar o treino, informe no workout_summary
- Se não houver PRs cadastrados, sugira cargas para iniciante/intermediário/avançado
- Se não houver lesões, mantenha scaling_options vazio []
- Sempre responda em português brasileiro
- Seja específico e prático nas dicas`

    // 5. Chamar a API da OpenAI com GPT-4 Vision
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analise esta lousa de treino e me dê a análise personalizada em JSON:'
            },
            imageContent
          ]
        }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 2000,
      temperature: 0.7,
    })

    // 6. Parsear a resposta JSON
    const content = response.choices[0]?.message?.content
    
    if (!content) {
      return { success: false, error: 'Resposta vazia da IA' }
    }

    let analysis: WodAnalysis
    
    try {
      analysis = JSON.parse(content) as WodAnalysis
    } catch {
      return { success: false, error: 'Erro ao processar resposta da IA' }
    }

    // 7. Fazer upload da imagem para o Supabase Storage (opcional)
    let storedImageUrl: string | null = null
    
    if (imageFile) {
      const fileName = `${user.id}/${Date.now()}-${imageFile.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('wod-images')
        .upload(fileName, imageFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (!uploadError && uploadData) {
        const { data: urlData } = supabase.storage
          .from('wod-images')
          .getPublicUrl(uploadData.path)
        
        storedImageUrl = urlData.publicUrl
      }
    }

    // 8. Salvar no banco de dados
    const { data: wod, error: wodError } = await supabase
      .from('wods')
      .insert({
        user_id: user.id,
        image_url: storedImageUrl || imageUrl,
        original_text: analysis.workout_summary,
        ai_analysis: analysis as unknown as Record<string, unknown>
      } as never)
      .select('id')
      .single()

    const wodData = wod as { id: string } | null

    if (wodError || !wodData) {
      // Mesmo com erro no banco, retornamos a análise
      console.error('Erro ao salvar WOD:', wodError)
      return {
        success: true,
        data: {
          wodId: 'temp-' + Date.now(),
          analysis
        }
      }
    }

    revalidatePath('/dashboard')
    revalidatePath('/history')

    return {
      success: true,
      data: {
        wodId: wodData.id,
        analysis
      }
    }

  } catch (error) {
    console.error('Erro na análise:', error)
    
    if (error instanceof OpenAI.APIError) {
      if (error.status === 401) {
        return { success: false, error: 'Chave da API OpenAI inválida' }
      }
      if (error.status === 429) {
        return { success: false, error: 'Limite de requisições excedido. Tente novamente em alguns minutos.' }
      }
      return { success: false, error: `Erro na API: ${error.message}` }
    }
    
    return { success: false, error: 'Erro interno ao processar análise' }
  }
}

/**
 * Analisa WOD a partir de texto (sem imagem)
 */
export async function analyzeWodFromText(wodText: string): Promise<AnalysisResult> {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Não autenticado' }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('prs, injuries, full_name')
      .eq('id', user.id)
      .single()

    const profileData = profile as { prs: Record<string, number> | null; injuries: string | null; full_name: string | null } | null
    const userPRs = profileData?.prs || {}
    const userInjuries = profileData?.injuries || 'Nenhuma informada'

    const systemPrompt = `Você é um Head Coach de CrossFit experiente e especialista em fisiologia do exercício.
Seu objetivo é analisar um treino de CrossFit (WOD) e personalizá-lo para o atleta.

DADOS DO ATLETA:
- Nome: ${profileData?.full_name || 'Atleta'}
- PRs (Personal Records em kg): ${JSON.stringify(userPRs)}
- Lesões/Limitações: ${userInjuries}

SAÍDA OBRIGATÓRIA (JSON estrito):
{
  "workout_summary": "Resumo do treino",
  "intent": "Estímulo esperado",
  "strategy": "Estratégia tática detalhada",
  "scaling_options": [
    {
      "exercise": "Nome do exercício",
      "suggestion": "Alternativa sugerida",
      "reason": "Motivo"
    }
  ],
  "suggested_weights": "Cargas sugeridas em KG"
}

Responda em português brasileiro. Seja específico e prático.`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Analise este WOD:\n\n${wodText}` }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 2000,
      temperature: 0.7,
    })

    const content = response.choices[0]?.message?.content
    
    if (!content) {
      return { success: false, error: 'Resposta vazia da IA' }
    }

    const analysis = JSON.parse(content) as WodAnalysis

    const { data: wod, error: wodError } = await supabase
      .from('wods')
      .insert({
        user_id: user.id,
        original_text: wodText,
        ai_analysis: analysis as unknown as Record<string, unknown>
      } as never)
      .select('id')
      .single()

    const wodData = wod as { id: string } | null

    if (wodError || !wodData) {
      return {
        success: true,
        data: { wodId: 'temp-' + Date.now(), analysis }
      }
    }

    revalidatePath('/dashboard')
    revalidatePath('/history')

    return {
      success: true,
      data: { wodId: wodData.id, analysis }
    }

  } catch (error) {
    console.error('Erro na análise:', error)
    return { success: false, error: 'Erro ao processar análise' }
  }
}

