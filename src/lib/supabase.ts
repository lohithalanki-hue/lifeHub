import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

type TokenGetter = () => Promise<string | null>;

export function createLifeHubSupabaseClient(getToken: TokenGetter) {
  if (!url || !publishableKey) return null;

  return createClient(url, publishableKey, {
    accessToken: async () => getToken(),
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
