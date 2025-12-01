import { NextResponse } from 'next/server'
import { stripe, STRIPE_CONFIG } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = await createClient()
    
    // Verificar autenticação
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Buscar customer_id do usuário
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    const profileData = profile as { stripe_customer_id: string | null } | null

    if (!profileData?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'Nenhuma assinatura encontrada' },
        { status: 404 }
      )
    }

    // Criar sessão do portal do cliente
    const session = await stripe.billingPortal.sessions.create({
      customer: profileData.stripe_customer_id,
      return_url: `${STRIPE_CONFIG.siteUrl}/profile`,
    })

    return NextResponse.json({ url: session.url })
    
  } catch (error) {
    console.error('[Stripe Portal] Erro:', error)
    return NextResponse.json(
      { error: 'Erro ao abrir portal' },
      { status: 500 }
    )
  }
}
