import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const makeSupabaseAdmin = (): SupabaseClient => {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
};

export const makeSupabaseAnon = (): SupabaseClient => {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_ANON_KEY!;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
};
