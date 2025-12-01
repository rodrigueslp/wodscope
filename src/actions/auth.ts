'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function signUp(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string

  console.log('[SignUp] Tentando cadastrar:', email)

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
      },
      // Se você quiser pular confirmação de email (dev only):
      // emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/auth/callback`,
    },
  })

  if (error) {
    console.error('[SignUp] Erro:', error.message)
    return { error: error.message, success: false }
  }

  console.log('[SignUp] Resposta:', JSON.stringify(data, null, 2))

  // Verificar se precisa de confirmação de email
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    console.log('[SignUp] Usuário já existe')
    return { 
      error: 'Este email já está cadastrado. Tente fazer login.', 
      success: false 
    }
  }

  // Se o email precisa de confirmação
  if (data.user && !data.session) {
    console.log('[SignUp] Email precisa de confirmação')
    return { 
      success: true, 
      needsEmailConfirmation: true,
      message: 'Verifique seu email para confirmar o cadastro!' 
    }
  }

  // Criar perfil inicial com 1 crédito grátis
  if (data.user) {
    console.log('[SignUp] Criando perfil para:', data.user.id)
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      full_name: name,
      credits: 1,
      subscription_status: 'free',
    })
    
    if (profileError) {
      console.error('[SignUp] Erro ao criar perfil:', profileError.message)
      // Não retorna erro, pois o usuário foi criado
    }
  }

  revalidatePath('/', 'layout')
  
  console.log('[SignUp] Sucesso, redirecionando para onboarding')
  return { success: true, redirectTo: '/onboarding' }
}

export async function signIn(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  console.log('[SignIn] Tentando login:', email)

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('[SignIn] Erro:', error.message)
    
    // Traduzir erros comuns
    if (error.message === 'Invalid login credentials') {
      return { error: 'Email ou senha incorretos', success: false }
    }
    if (error.message === 'Email not confirmed') {
      return { error: 'Confirme seu email antes de fazer login', success: false }
    }
    
    return { error: error.message, success: false }
  }

  console.log('[SignIn] Sucesso para:', data.user?.email)

  // Verificar se o perfil existe, se não, criar
  if (data.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', data.user.id)
      .single()

    if (!profile) {
      console.log('[SignIn] Criando perfil para usuário existente')
      await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: data.user.user_metadata?.full_name || email.split('@')[0],
        credits: 1,
        subscription_status: 'free',
      })
      
      revalidatePath('/', 'layout')
      return { success: true, redirectTo: '/onboarding' }
    }
  }

  revalidatePath('/', 'layout')
  
  return { success: true, redirectTo: '/dashboard' }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function signInWithGoogle() {
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/auth/callback`,
    },
  })

  if (error) {
    console.error('[Google] Erro:', error.message)
    return { error: error.message, url: null }
  }

  return { url: data.url }
}

export async function signInWithGitHub() {
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/auth/callback`,
    },
  })

  if (error) {
    console.error('[GitHub] Erro:', error.message)
    return { error: error.message, url: null }
  }

  return { url: data.url }
}

export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
