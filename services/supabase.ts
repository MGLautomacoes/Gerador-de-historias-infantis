import { createClient, SupabaseClient } from '@supabase/supabase-js';

// FIX: Read Supabase credentials from environment variables for security and best practices.
// VITE_ prefix is necessary for Vite to expose these variables to the client-side app.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabaseInstance: SupabaseClient | null = null;
let error: string | null = null;

if (!supabaseUrl || !supabaseAnonKey) {
  error = "As credenciais do Supabase (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY) não foram encontradas nas variáveis de ambiente.";
} else {
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
    },
  });
}

export const supabase = supabaseInstance;
export const supabaseInitializationError = error;