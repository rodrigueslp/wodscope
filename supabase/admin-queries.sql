-- ==============================================
-- QUERIES ADMINISTRATIVAS - WodScope
-- Execute no Supabase Dashboard > SQL Editor
-- ==============================================

-- ============================================
-- 1. UPGRADE USUÁRIO PARA PRO (após pagamento)
-- ============================================

-- Por email:
UPDATE profiles 
SET subscription_status = 'pro' 
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'email@exemplo.com'
);

-- Por ID do usuário:
UPDATE profiles 
SET subscription_status = 'pro' 
WHERE id = 'uuid-do-usuario-aqui';


-- ============================================
-- 2. ADICIONAR CRÉDITOS EXTRAS
-- ============================================

-- Adicionar 5 créditos para um usuário:
UPDATE profiles 
SET credits = credits + 5 
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'email@exemplo.com'
);


-- ============================================
-- 3. LISTAR TODOS OS USUÁRIOS E STATUS
-- ============================================

SELECT 
  u.email,
  p.full_name,
  p.subscription_status,
  p.credits,
  u.created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;


-- ============================================
-- 4. LISTAR APENAS USUÁRIOS PRO
-- ============================================

SELECT 
  u.email,
  p.full_name,
  u.created_at
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE p.subscription_status = 'pro'
ORDER BY u.created_at DESC;


-- ============================================
-- 5. USUÁRIOS SEM CRÉDITOS (potenciais conversões)
-- ============================================

SELECT 
  u.email,
  p.full_name,
  (SELECT COUNT(*) FROM wods w WHERE w.user_id = u.id) as total_analises,
  u.created_at
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE p.subscription_status = 'free' 
  AND p.credits = 0
ORDER BY total_analises DESC;


-- ============================================
-- 6. MÉTRICAS GERAIS
-- ============================================

SELECT 
  COUNT(*) FILTER (WHERE subscription_status = 'pro') as usuarios_pro,
  COUNT(*) FILTER (WHERE subscription_status = 'free') as usuarios_free,
  COUNT(*) FILTER (WHERE subscription_status = 'free' AND credits = 0) as sem_creditos,
  COUNT(*) as total_usuarios
FROM profiles;


-- ============================================
-- 7. ANÁLISES POR DIA (últimos 7 dias)
-- ============================================

SELECT 
  DATE(created_at) as data,
  COUNT(*) as total_analises
FROM wods
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY data DESC;


-- ============================================
-- 8. DOWNGRADE USUÁRIO (cancelamento)
-- ============================================

UPDATE profiles 
SET subscription_status = 'free', credits = 0
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'email@exemplo.com'
);

