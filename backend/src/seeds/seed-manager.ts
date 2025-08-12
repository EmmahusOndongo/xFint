/* eslint-disable no-console */
import * as bcrypt from 'bcrypt';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';


async function run() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !key) throw new Error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing');

  const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  const email = 'manager@supherman.com';
  const password = 'Suph3rm4n!';
  const hash = await bcrypt.hash(password, 10);

  // upsert manager
  const { error: upsertErr } = await sb
    .from('users')
    .upsert(
      { email, role: 'MANAGER', password_hash: hash, must_set_password: false },
      { onConflict: 'email' }
    );
  if (upsertErr) throw upsertErr;

  console.log('✅ Manager ready:', email);
}

run().catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
      .then(() => process.exit(0));
