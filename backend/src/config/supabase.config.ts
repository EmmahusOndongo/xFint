import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Crée un client Supabase avec la clé "service role"
// ⚠️ Cette clé a tous les droits (administration), à utiliser uniquement côté serveur
export const makeSupabaseAdmin = (): SupabaseClient => {
  const url = process.env.SUPABASE_URL!; // URL du projet Supabase
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Clé service role (admin)
  
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false, // Pas de rafraîchissement automatique des tokens
      persistSession: false,   // Pas de stockage de session côté client
    },
  });
};

// Crée un client Supabase avec la clé "anon"
// ✅ Cette clé est limitée et peut être utilisée côté client (navigateur)
export const makeSupabaseAnon = (): SupabaseClient => {
  const url = process.env.SUPABASE_URL!; // URL du projet Supabase
  const key = process.env.SUPABASE_ANON_KEY!; // Clé publique (anon)
  
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false, // Pas de rafraîchissement automatique des tokens
      persistSession: false,   // Pas de stockage de session côté client
    },
  });
};
