import * as bcrypt from 'bcrypt';
import { makeSupabaseAdmin } from '../config/supabase.config';

async function run() {
  const sb = makeSupabaseAdmin();
  const email = 'manager@supherman.com';
  const password = 'Suph3rm4n!';
  const hash = await bcrypt.hash(password, 10);

  const { data: existing } = await sb.from('users').select('*').eq('email', email).maybeSingle();
  if (existing) {
    await sb.from('users').update({ role: 'MANAGER', password_hash: hash, must_set_password: false }).eq('email', email);
    console.log('✅ Manager updated');
  } else {
    await sb.from('users').insert({
      email, role: 'MANAGER', password_hash: hash, must_set_password: false
    });
    console.log('✅ Manager created');
  }
}
run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
