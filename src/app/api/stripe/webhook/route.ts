import { NextRequest, NextResponse } from 'next/server'
import { getStripe, STRIPE_CONFIG } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Função para criar cliente Supabase admin (lazy initialization)
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  const stripe = getStripe()
  const supabaseAdmin = getSupabaseAdmin()
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    console.error('[Webhook] Sem assinatura')
    return NextResponse.json({ error: 'Sem assinatura' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      STRIPE_CONFIG.webhookSecret
    )
  } catch (err) {
    console.error('[Webhook] Erro na verificação:', err)
    return NextResponse.json({ error: 'Webhook inválido' }, { status: 400 })
  }

  console.log(`[Webhook] Evento recebido: ${event.type}`)

  try {
    switch (event.type) {
      // Assinatura criada com sucesso
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.mode === 'subscription' && session.subscription) {
          const userId = session.metadata?.supabase_user_id
          
          if (userId) {
            console.log(`[Webhook] Ativando PRO para user: ${userId}`)
            
            await supabaseAdmin
              .from('profiles')
              .update({
                subscription_status: 'pro',
                stripe_subscription_id: session.subscription as string,
                stripe_customer_id: session.customer as string,
              } as never)
              .eq('id', userId)
          }
        }
        break
      }

      // Pagamento recorrente bem-sucedido
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string | null }
        
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription)
          const userId = subscription.metadata?.supabase_user_id
          
          if (userId) {
            console.log(`[Webhook] Renovação confirmada para user: ${userId}`)
            
            // Garantir que continua PRO
            await supabaseAdmin
              .from('profiles')
              .update({ subscription_status: 'pro' } as never)
              .eq('id', userId)
          }
        }
        break
      }

      // Pagamento falhou
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string | null }
        
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription)
          const userId = subscription.metadata?.supabase_user_id
          
          if (userId) {
            console.log(`[Webhook] Pagamento falhou para user: ${userId}`)
            // Não desativa imediatamente - Stripe tentará novamente
            // Pode enviar email de aviso aqui
          }
        }
        break
      }

      // Assinatura cancelada ou expirada
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.supabase_user_id
        
        if (userId) {
          console.log(`[Webhook] Assinatura cancelada para user: ${userId}`)
          
          await supabaseAdmin
            .from('profiles')
            .update({
              subscription_status: 'free',
              stripe_subscription_id: null,
            } as never)
            .eq('id', userId)
        }
        break
      }

      // Assinatura atualizada (upgrade/downgrade)
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.supabase_user_id
        
        if (userId) {
          const isActive = ['active', 'trialing'].includes(subscription.status)
          
          console.log(`[Webhook] Assinatura atualizada para user: ${userId}, status: ${subscription.status}`)
          
          await supabaseAdmin
            .from('profiles')
            .update({
              subscription_status: isActive ? 'pro' : 'free',
            } as never)
            .eq('id', userId)
        }
        break
      }

      default:
        console.log(`[Webhook] Evento não tratado: ${event.type}`)
    }

    return NextResponse.json({ received: true })
    
  } catch (error) {
    console.error('[Webhook] Erro ao processar:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
