'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const FREE_CREDITS = 1 // Número de análises grátis

export interface CreditStatus {
  hasCredits: boolean
  credits: number
  isPro: boolean
  canAnalyze: boolean
}

/**
 * Verifica o status de créditos do usuário
 */
export async function checkCredits(): Promise<CreditStatus> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { hasCredits: false, credits: 0, isPro: false, canAnalyze: false }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('credits, subscription_status')
    .eq('id', user.id)
    .single()

  type ProfileData = { credits: number; subscription_status: string } | null
  const profileData = profile as ProfileData

  // Se não existe perfil, cria com créditos grátis
  if (!profileData) {
    await supabase.from('profiles').insert({
      id: user.id,
      credits: FREE_CREDITS,
      subscription_status: 'free'
    } as never)
    return { hasCredits: true, credits: FREE_CREDITS, isPro: false, canAnalyze: true }
  }

  const isPro = profileData.subscription_status === 'pro'
  const credits = profileData.credits ?? 0
  const hasCredits = credits > 0
  const canAnalyze = isPro || hasCredits

  return { hasCredits, credits, isPro, canAnalyze }
}

/**
 * Consome um crédito do usuário (chamado após análise bem-sucedida)
 */
export async function consumeCredit(): Promise<{ success: boolean; error?: string; remainingCredits: number }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Não autenticado', remainingCredits: 0 }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('credits, subscription_status')
    .eq('id', user.id)
    .single()

  type ProfileData = { credits: number; subscription_status: string } | null
  const profileData = profile as ProfileData

  if (!profileData) {
    return { success: false, error: 'Perfil não encontrado', remainingCredits: 0 }
  }

  // Pro users têm créditos ilimitados
  if (profileData.subscription_status === 'pro') {
    return { success: true, remainingCredits: -1 } // -1 = ilimitado
  }

  const currentCredits = profileData.credits ?? 0
  
  if (currentCredits <= 0) {
    return { success: false, error: 'Sem créditos disponíveis', remainingCredits: 0 }
  }

  // Decrementa crédito
  const newCredits = currentCredits - 1
  
  const { error } = await supabase
    .from('profiles')
    .update({ credits: newCredits } as never)
    .eq('id', user.id)

  if (error) {
    return { success: false, error: error.message, remainingCredits: currentCredits }
  }

  revalidatePath('/dashboard')
  
  return { success: true, remainingCredits: newCredits }
}

/**
 * Adiciona créditos ao usuário (para uso admin/manual)
 */
export async function addCredits(userId: string, amount: number): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('credits')
    .eq('id', userId)
    .single()

  const currentCredits = profile?.credits ?? 0
  const newCredits = currentCredits + amount

  const { error } = await supabase
    .from('profiles')
    .update({ credits: newCredits } as never)
    .eq('id', userId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Atualiza usuário para Pro (para uso admin/manual após pagamento)
 */
export async function upgradeToPro(userId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('profiles')
    .update({ subscription_status: 'pro' } as never)
    .eq('id', userId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/profile')
  
  return { success: true }
}

