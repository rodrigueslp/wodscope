import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // Verificar se o perfil existe, se não, criar
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single()

      if (!profile) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
          credits: 1,
          subscription_status: 'free',
        } as never)
        // Novo usuário vai para onboarding
        return NextResponse.redirect(`${origin}/onboarding`)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Erro no OAuth
  return NextResponse.redirect(`${origin}/auth?error=Could not authenticate`)
}

