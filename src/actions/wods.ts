'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { WodInsert, Json } from '@/lib/database.types'

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

