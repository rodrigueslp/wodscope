import Stripe from 'stripe'

// Lazy initialization para evitar erros no build
let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY não configurada')
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-11-17.clover',
      typescript: true,
    })
  }
  return _stripe
}

// IDs dos produtos/preços do Stripe
// Configure esses valores após criar os produtos no Stripe Dashboard
export const STRIPE_CONFIG = {
  // Preço da assinatura mensal (criar no Stripe Dashboard)
  priceId: process.env.STRIPE_PRICE_ID || '',
  
  // URL do seu site
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001',
  
  // Webhook secret (obtido ao criar webhook no Stripe)
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
}
