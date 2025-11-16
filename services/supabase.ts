import { createClient, SupabaseClient } from '@supabase/supabase-js';

// FIX: Hardcode Supabase credentials to resolve the "Cannot read properties of undefined" error.
// This ensures the application can connect to Supabase immediately in the current environment
// without needing environment variables to be configured.
const supabaseUrl = "https://supabasecontabo.mglautomacoes.com.br";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzE1MDUwODAwLAogICJleHAiOiAxODcyODE3MjAwCn0.KqQkYvVu4QP4Ubeo35suKDA-WTmKdeE3JWkO5bNDq6k";

let supabaseInstance: SupabaseClient | null = null;
let error: string | null = null;

if (!supabaseUrl || !supabaseAnonKey) {
  // This block is now unlikely to be hit, but kept for safety.
  error = "As credenciais do Supabase não foram definidas diretamente no código.";
} else {
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
    },
  });
}

export const supabase = supabaseInstance;
export const supabaseInitializationError = error;
