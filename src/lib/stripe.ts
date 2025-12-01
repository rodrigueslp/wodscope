import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY não configurada')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
})

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

