'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { WodInsert, Json, WodResult, ResultType } from '@/lib/database.types'

/**
 * Busca todos os WODs do usuário logado
 */
export async function getWods(limit?: number) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Não autenticado', data: null }
  }

  let query = supabase
    .from('wods')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data }
}

/**
 * Busca um WOD específico por ID
 */
export async function getWodById(id: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Não autenticado', data: null }
  }

  const { data, error } = await supabase
    .from('wods')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id) // Garante que o usuário só acessa seus próprios WODs
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data }
}

/**
 * Cria um novo WOD
 */
export async function createWod(wodData: {
  image_url?: string
  original_text?: string
  ai_analysis?: Json
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Não autenticado', data: null }
  }

  const newWod: WodInsert = {
    user_id: user.id,
    image_url: wodData.image_url,
    original_text: wodData.original_text,
    ai_analysis: wodData.ai_analysis,
  }

  const { data, error } = await supabase
    .from('wods')
    .insert(newWod as never)
    .select()
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard')
  revalidatePath('/history')
  
  return { error: null, data }
}

/**
 * Atualiza a análise de IA de um WOD existente
 */
export async function updateWodAnalysis(id: string, ai_analysis: Json) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Não autenticado', success: false }
  }

  const { error } = await supabase
    .from('wods')
    .update({ ai_analysis } as never)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath(`/analysis/${id}`)
  
  return { error: null, success: true }
}

/**
 * Deleta um WOD
 */
export async function deleteWod(id: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Não autenticado', success: false }
  }

  const { error } = await supabase
    .from('wods')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath('/dashboard')
  revalidatePath('/history')
  
  return { error: null, success: true }
}

/**
 * Salva o resultado de um WOD (tempo, reps, sensação, comentário)
 */
export async function saveWodResult(wodId: string, result: WodResult) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Não autenticado', success: false }
  }

  const { error } = await supabase
    .from('wods')
    .update({
      result_type: result.result_type,
      result_value: result.result_value,
      feeling: result.feeling,
      athlete_notes: result.athlete_notes || null,
      completed_at: new Date().toISOString()
    } as never)
    .eq('id', wodId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath(`/analysis/${wodId}`)
  revalidatePath('/dashboard')
  revalidatePath('/history')
  
  return { error: null, success: true }
}

/**
 * Busca histórico de resultados do usuário (para alimentar a IA)
 */
export async function getWodHistory(limit: number = 10) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Não autenticado', data: null }
  }

  const { data, error } = await supabase
    .from('wods')
    .select('*')
    .eq('user_id', user.id)
    .not('result_type', 'is', null) // Apenas WODs com resultado registrado
    .order('completed_at', { ascending: false })
    .limit(limit)

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data }
}

/**
 * Formata o histórico para o prompt da IA
 */
export async function getFormattedHistory(): Promise<string> {
  const result = await getWodHistory(10)
  
  if (!result.data || result.data.length === 0) {
    return 'Nenhum histórico de treinos registrado ainda.'
  }

  const historyData = result.data as Array<{
    original_text: string | null
    result_type: ResultType | null
    result_value: string | null
    feeling: number | null
    athlete_notes: string | null
    completed_at: string | null
  }>

  const history = historyData.map((wod, index) => {
    const feeling = wod.feeling ? ['😫 Muito difícil', '😐 Normal', '😊 Bom', '🔥 Excelente'][wod.feeling - 1] : 'N/A'
    return `${index + 1}. WOD: ${wod.original_text?.substring(0, 50) || 'N/A'}...
   Resultado: ${wod.result_value || 'N/A'} (${wod.result_type || 'N/A'})
   Sensação: ${feeling}
   ${wod.athlete_notes ? `Comentário: "${wod.athlete_notes}"` : ''}`
  }).join('\n\n')

  return history
}

