'use server'

import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { WodAnalysis, AnalysisResult } from '@/lib/ai.types'
import { getFormattedHistory } from '@/actions/wods'

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

    // 2. Buscar perfil do usuário (PRs, lesões e dados físicos)
    const { data: profile } = await supabase
      .from('profiles')
      .select('prs, injuries, full_name, age, gender, height, experience_years')
      .eq('id', user.id)
      .single()

    const profileData = profile as { 
      prs: Record<string, number> | null
      injuries: string | null
      full_name: string | null
      age: number | null
      gender: string | null
      height: number | null
      experience_years: number | null
    } | null
    
    const userPRs = profileData?.prs || {}
    const userInjuries = profileData?.injuries || 'Nenhuma informada'
    
    // Formatação dos dados físicos
    const genderLabel = profileData?.gender === 'male' ? 'Masculino' : 
                        profileData?.gender === 'female' ? 'Feminino' : 
                        profileData?.gender === 'other' ? 'Outro' : 'Não informado'
    
    const experienceLabel = !profileData?.experience_years ? 'Não informado' :
                            profileData.experience_years < 1 ? 'Iniciante (menos de 1 ano)' :
                            profileData.experience_years < 3 ? 'Intermediário (1-3 anos)' :
                            profileData.experience_years < 5 ? 'Avançado (3-5 anos)' : 'Elite (5+ anos)'

    // 2.1 Buscar histórico de treinos
    const wodHistory = await getFormattedHistory()

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
    const athleteName = profileData?.full_name?.split(' ')[0] || 'Atleta' // Pega só o primeiro nome
    
    const systemPrompt = `Você é um Head Coach de CrossFit experiente e carismático. Você está falando DIRETAMENTE com ${athleteName}, seu atleta.

IMPORTANTE: Sempre use a 2ª pessoa (você/seu/sua). Fale como se estivesse ao lado do atleta, motivando e orientando. Seja direto, amigável e use um tom de coach que conhece bem o atleta.

PERFIL DO ATLETA ${athleteName.toUpperCase()}:
- Idade: ${profileData?.age || 'Não informada'} anos
- Sexo: ${genderLabel}
- Altura: ${profileData?.height ? `${profileData.height}cm` : 'Não informada'}
- Experiência: ${experienceLabel}
- PRs (Personal Records em kg): ${JSON.stringify(userPRs)}
- Lesões/Limitações: ${userInjuries}

CONSIDERAÇÕES BASEADAS NO PERFIL:
${profileData?.gender === 'female' ? '- Use pesos RX femininos como referência (ex: KB 16kg, barbell 35kg)' : profileData?.gender === 'male' ? '- Use pesos RX masculinos como referência (ex: KB 24kg, barbell 43kg)' : ''}
${profileData?.age && profileData.age > 40 ? '- Atleta master: considere recuperação mais longa e aquecimento mais completo' : ''}
${profileData?.age && profileData.age < 25 ? '- Atleta jovem: pode trabalhar com intensidades mais altas' : ''}
${profileData?.experience_years && profileData.experience_years < 1 ? '- Iniciante: priorize movimentos básicos e técnica sobre intensidade' : ''}
${profileData?.experience_years && profileData.experience_years >= 5 ? '- Atleta experiente: pode utilizar estratégias avançadas de pacing' : ''}

HISTÓRICO DE TREINOS RECENTES:
${wodHistory}

Use o histórico para entender os padrões de ${athleteName} (pontos fortes, fracos, progressão) e personalizar ainda mais a estratégia.

SEU OBJETIVO:
1. Identifique o treino na foto da lousa
2. Analise o estímulo pretendido
3. Crie uma estratégia de pacing personalizada para ${athleteName}
4. Sugira escalas/adaptações baseadas nas lesões
5. Calcule cargas sugeridas baseadas nos PRs (use % do 1RM)

SAÍDA OBRIGATÓRIA (JSON estrito, sem markdown):
{
  "workout_summary": "Resumo do treino identificado (nome se houver + descrição)",
  "intent": "Qual o estímulo esperado - fale diretamente com o atleta (ex: 'Hoje você vai trabalhar sua capacidade cardiorrespiratória...')",
  "strategy": "Estratégia tática detalhada FALANDO DIRETAMENTE COM O ATLETA (ex: 'Comece controlado nos primeiros rounds. Quebre os thrusters em sets de 7...')",
  "scaling_options": [
    {
      "exercise": "Nome do exercício",
      "suggestion": "Alternativa sugerida",
      "reason": "Motivo da adaptação falando com o atleta (ex: 'Por causa da sua lesão no ombro, substitua por...')"
    }
  ],
  "suggested_weights": "Cargas sugeridas FALANDO DIRETAMENTE (ex: 'Use 43kg no thruster - isso é 65% do seu 1RM e vai te permitir manter o ritmo...')",
  "movements": ["lista", "de", "movimentos", "identificados no WOD em inglês para busca de tutoriais (ex: 'snatch', 'muscle up', 'double under', 'thruster', 'pull up')"]
}

REGRAS:
- SEMPRE fale em 2ª pessoa (você/seu/sua), NUNCA em 3ª pessoa (ele/o atleta/o Luiz)
- Seja motivador mas realista
- Se não conseguir identificar o treino, informe no workout_summary
- Se não houver PRs cadastrados, sugira cargas para iniciante/intermediário/avançado
- Se não houver lesões, mantenha scaling_options vazio []
- Sempre responda em português brasileiro
- Seja específico, prático e direto nas dicas
- IMPORTANTE: No campo "movements", liste os principais movimentos em INGLÊS (ex: "snatch", "clean and jerk", "muscle up", "box jump", "double under"). Máximo 5 movimentos mais relevantes.`

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
      .select('prs, injuries, full_name, age, gender, height, experience_years')
      .eq('id', user.id)
      .single()

    const profileData = profile as { 
      prs: Record<string, number> | null
      injuries: string | null
      full_name: string | null
      age: number | null
      gender: string | null
      height: number | null
      experience_years: number | null
    } | null
    
    const userPRs = profileData?.prs || {}
    const userInjuries = profileData?.injuries || 'Nenhuma informada'
    
    const genderLabel = profileData?.gender === 'male' ? 'Masculino' : 
                        profileData?.gender === 'female' ? 'Feminino' : 
                        profileData?.gender === 'other' ? 'Outro' : 'Não informado'
    
    const experienceLabel = !profileData?.experience_years ? 'Não informado' :
                            profileData.experience_years < 1 ? 'Iniciante (menos de 1 ano)' :
                            profileData.experience_years < 3 ? 'Intermediário (1-3 anos)' :
                            profileData.experience_years < 5 ? 'Avançado (3-5 anos)' : 'Elite (5+ anos)'

    // Buscar histórico de treinos
    const wodHistory = await getFormattedHistory()
    
    const athleteName = profileData?.full_name?.split(' ')[0] || 'Atleta'

    const systemPrompt = `Você é um Head Coach de CrossFit experiente e carismático. Você está falando DIRETAMENTE com ${athleteName}, seu atleta.

IMPORTANTE: Sempre use a 2ª pessoa (você/seu/sua). Fale como se estivesse ao lado do atleta, motivando e orientando.

PERFIL DO ATLETA ${athleteName.toUpperCase()}:
- Idade: ${profileData?.age || 'Não informada'} anos
- Sexo: ${genderLabel}
- Altura: ${profileData?.height ? `${profileData.height}cm` : 'Não informada'}
- Experiência: ${experienceLabel}
- PRs (Personal Records em kg): ${JSON.stringify(userPRs)}
- Lesões/Limitações: ${userInjuries}

CONSIDERAÇÕES BASEADAS NO PERFIL:
${profileData?.gender === 'female' ? '- Use pesos RX femininos como referência (ex: KB 16kg, barbell 35kg)' : profileData?.gender === 'male' ? '- Use pesos RX masculinos como referência (ex: KB 24kg, barbell 43kg)' : ''}
${profileData?.age && profileData.age > 40 ? '- Atleta master: considere recuperação mais longa e aquecimento mais completo' : ''}
${profileData?.age && profileData.age < 25 ? '- Atleta jovem: pode trabalhar com intensidades mais altas' : ''}
${profileData?.experience_years && profileData.experience_years < 1 ? '- Iniciante: priorize movimentos básicos e técnica sobre intensidade' : ''}
${profileData?.experience_years && profileData.experience_years >= 5 ? '- Atleta experiente: pode utilizar estratégias avançadas de pacing' : ''}

HISTÓRICO DE TREINOS RECENTES:
${wodHistory}

SAÍDA OBRIGATÓRIA (JSON estrito):
{
  "workout_summary": "Resumo do treino",
  "intent": "Estímulo esperado - fale diretamente com o atleta",
  "strategy": "Estratégia tática FALANDO DIRETAMENTE COM O ATLETA (use você/seu/sua)",
  "scaling_options": [
    {
      "exercise": "Nome do exercício",
      "suggestion": "Alternativa sugerida",
      "reason": "Motivo falando com o atleta"
    }
  ],
  "suggested_weights": "Cargas sugeridas FALANDO DIRETAMENTE com o atleta",
  "movements": ["lista de movimentos em INGLÊS para busca de tutoriais (ex: 'snatch', 'clean', 'muscle up')"]
}

REGRAS:
- SEMPRE fale em 2ª pessoa (você/seu/sua), NUNCA em 3ª pessoa
- Responda em português brasileiro
- Seja específico, prático e motivador
- No campo "movements", liste os principais movimentos em INGLÊS. Máximo 5.`

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

/**
 * Gera feedback pós-WOD baseado no resultado do atleta
 */
export async function generatePostWodFeedback(
  wodId: string,
  wodSummary: string,
  resultType: string,
  resultValue: string,
  feeling: number,
  athleteNotes?: string
): Promise<{ success: boolean; feedback?: string; error?: string }> {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Não autenticado' }
    }

    // Buscar perfil do usuário
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    const profileData = profile as { full_name: string | null } | null
    const athleteName = profileData?.full_name?.split(' ')[0] || 'Atleta'
    
    const feelingText = ['muito difícil', 'normal', 'bom', 'excelente'][feeling - 1] || 'normal'

    const systemPrompt = `Você é um coach de CrossFit carismático e motivador. ${athleteName} acabou de completar um WOD e você vai dar um feedback rápido e personalizado.

REGRAS:
- Fale DIRETAMENTE com ${athleteName} (use você/seu/sua)
- Seja breve (máximo 3-4 frases)
- Seja motivador mas honesto
- Reconheça o esforço
- Dê uma dica específica para o próximo treino se fizer sentido
- Use emojis com moderação (1-2 no máximo)

DADOS DO TREINO:
- WOD: ${wodSummary}
- Resultado: ${resultValue} (${resultType})
- Como se sentiu: ${feelingText}
${athleteNotes ? `- Comentário do atleta: "${athleteNotes}"` : ''}

Responda com um feedback direto e motivador em português brasileiro. Não use JSON, apenas texto corrido.`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Modelo mais rápido e barato para feedbacks curtos
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Dê o feedback para o atleta.' }
      ],
      max_tokens: 300,
      temperature: 0.8,
    })

    const feedback = response.choices[0]?.message?.content

    if (!feedback) {
      return { success: false, error: 'Não foi possível gerar feedback' }
    }

    // Salvar feedback no WOD
    const { error: updateError } = await supabase
      .from('wods')
      .update({ post_wod_feedback: feedback } as never)
      .eq('id', wodId)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Erro ao salvar feedback:', updateError)
      return { success: false, error: updateError.message }
    }

    return { success: true, feedback }

  } catch (error) {
    console.error('Erro ao gerar feedback:', error)
    return { success: false, error: 'Erro ao gerar feedback' }
  }
}

