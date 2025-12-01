-- Adiciona colunas do Stripe na tabela profiles
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- Adicionar colunas para integração com Stripe
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Criar índice para busca rápida por customer_id
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id 
ON profiles(stripe_customer_id);

-- Comentários para referência
COMMENT ON COLUMN profiles.stripe_customer_id IS 'ID do cliente no Stripe (cus_xxx)';
COMMENT ON COLUMN profiles.stripe_subscription_id IS 'ID da assinatura ativa no Stripe (sub_xxx)';

