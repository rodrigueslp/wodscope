-- Adiciona coluna de créditos na tabela profiles
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- Adicionar coluna credits com valor padrão de 1 (uma análise grátis)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 1;

-- Atualizar usuários existentes para terem 1 crédito
UPDATE profiles 
SET credits = 1 
WHERE credits IS NULL;

-- Comentário para referência
COMMENT ON COLUMN profiles.credits IS 'Número de análises de WOD disponíveis. Pro users têm ilimitado (verificado pelo subscription_status)';

