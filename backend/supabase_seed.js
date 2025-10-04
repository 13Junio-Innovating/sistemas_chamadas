import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!SUPABASE_URL) {
  console.error('Erro: SUPABASE_URL não está definido no backend/.env');
  process.exit(1);
}
if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Erro: SUPABASE_SERVICE_ROLE_KEY não está definido no backend/.env');
  console.error('Dica: Pegue a Service Role Key em Supabase → Project Settings → API e cole no backend/.env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const modeVerify = process.argv.includes('--verify');

async function ensureUser(email, password, metadata) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: metadata,
  });
  if (error) {
    // 422 geralmente indica usuário já existente
    if (error.status === 422) {
      console.log(`Usuário já existe: ${email}`);
      return null;
    }
    throw error;
  }
  console.log(`✅ Usuário criado: ${email}`);
  return data?.user ?? null;
}

async function verifyUsers() {
  const expectedEmails = [
    'admin@costao.com',
    ...Array.from({ length: 10 }, (_, i) => `guiche${i + 1}@costao.com`),
  ];

  const found = new Set();
  let page = 1;
  const perPage = 100;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const users = data?.users || [];

    for (const u of users) {
      if (u?.email && expectedEmails.includes(u.email)) {
        found.add(u.email);
      }
    }

    if (users.length < perPage) break;
    page++;
  }

  const present = expectedEmails.filter((e) => found.has(e));
  const missing = expectedEmails.filter((e) => !found.has(e));

  console.log('Usuários presentes:', present);
  console.log('Usuários faltando:', missing);

  if (missing.length === 0) {
    console.log('✅ Todos os usuários esperados estão presentes no Supabase.');
  } else {
    console.log(`⚠️ Faltam ${missing.length} usuários esperados no Supabase.`);
    console.log('Dica: execute "npm run seed:supabase" para criar os usuários ausentes.');
  }
}

async function main() {
  if (modeVerify) {
    await verifyUsers();
    return;
  }

  // Admin
  await ensureUser('admin@costao.com', 'admin@123', { name: 'Administrador', role: 'admin' });

  // Guichês
  const senhaGuiche = 'asd123';
  for (let i = 1; i <= 10; i++) {
    const email = `guiche${i}@costao.com`;
    await ensureUser(email, senhaGuiche, { name: `Atendente GUICHE${i}`.toUpperCase(), role: 'atendente', guiche: `guiche${i}` });
  }

  console.log('Seeding de usuários Supabase finalizado.');
}

main().catch((e) => {
  console.error('Erro no seeding Supabase:', e);
  process.exit(1);
});