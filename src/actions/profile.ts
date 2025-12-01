'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ProfileUpdate, PRs } from '@/lib/database.types'

/**
 * Busca o perfil do usuário logado
 */
export async function getProfile() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Não autenticado', data: null }
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 = not found
    return { error: error.message, data: null }
  }

  return { error: null, data }
}

/**
 * Cria ou atualiza o perfil do usuário (upsert)
 */
export async function upsertProfile(formData: {
  full_name?: string
  prs?: PRs
  injuries?: string
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Não autenticado', success: false }
  }

  const profileData: ProfileUpdate = {
    id: user.id,
    full_name: formData.full_name,
    prs: formData.prs,
    injuries: formData.injuries,
  }

  const { error } = await supabase
    .from('profiles')
    .upsert(profileData as never, { onConflict: 'id' })

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath('/profile')
  revalidatePath('/dashboard')
  
  return { error: null, success: true }
}

/**
 * Atualiza apenas os PRs do usuário
 */
export async function updatePRs(prs: PRs) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Não autenticado', success: false }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ prs } as never)
    .eq('id', user.id)

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath('/profile')
  
  return { error: null, success: true }
}

/**
 * Atualiza apenas as lesões do usuário
 */
export async function updateInjuries(injuries: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Não autenticado', success: false }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ injuries } as never)
    .eq('id', user.id)

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath('/profile')
  
  return { error: null, success: true }
}

/**
 * Atualiza o nome do usuário
 */
export async function updateName(full_name: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Não autenticado', success: false }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ full_name } as never)
    .eq('id', user.id)

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath('/profile')
  revalidatePath('/dashboard')
  
  return { error: null, success: true }
}

