import { createClient } from "@supabase/supabase-js";

// Supabase client configuration for client-side queries
const meta = import.meta as any;
const supabaseUrl = meta.env?.VITE_SUPABASE_URL || "";
const supabaseAnonKey = meta.env?.VITE_SUPABASE_ANON_KEY || "";

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Helper to check if Supabase is properly configured in the frontend
 */
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey);
}
