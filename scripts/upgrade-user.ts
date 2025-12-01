/**
 * Script para fazer upgrade manual de usuário para Pro
 * 
 * Como usar:
 * 1. Configure SUPABASE_URL e SUPABASE_SERVICE_KEY no .env
 * 2. Execute: npx ts-node scripts/upgrade-user.ts <email-do-usuario>
 * 
 * Ou use diretamente no Supabase Dashboard > SQL Editor:
 * 
 * UPDATE profiles 
 * SET subscription_status = 'pro' 
 * WHERE id = (SELECT id FROM auth.users WHERE email = 'email@exemplo.com');
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY // Usar service key para admin

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Configure SUPABASE_URL e SUPABASE_SERVICE_KEY no .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function upgradeUser(email: string) {
  console.log(`🔍 Buscando usuário: ${email}`)

  // Busca o usuário pelo email
  const { data: userData, error: userError } = await supabase
    .from('auth.users')
    .select('id')
    .eq('email', email)
    .single()

  if (userError || !userData) {
    console.error('❌ Usuário não encontrado:', userError?.message)
    process.exit(1)
  }

  const userId = userData.id
  console.log(`✅ Usuário encontrado: ${userId}`)

  // Atualiza para Pro
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ subscription_status: 'pro' })
    .eq('id', userId)

  if (updateError) {
    console.error('❌ Erro ao fazer upgrade:', updateError.message)
    process.exit(1)
  }

  console.log(`🎉 Usuário ${email} atualizado para PRO!`)
}

// Pega email do argumento
const email = process.argv[2]

if (!email) {
  console.log(`
📋 Uso: npx ts-node scripts/upgrade-user.ts <email>

Exemplo:
  npx ts-node scripts/upgrade-user.ts joao@email.com

Ou via SQL no Supabase Dashboard:
  UPDATE profiles 
  SET subscription_status = 'pro' 
  WHERE id = (SELECT id FROM auth.users WHERE email = 'joao@email.com');
  `)
  process.exit(0)
}

upgradeUser(email)

