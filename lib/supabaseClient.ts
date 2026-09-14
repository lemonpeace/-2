
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const getEnv = (key: string) => {
  // Helper to support both Vite (import.meta.env) and standard process.env
  try {
    const meta = import.meta as any;
    if (typeof meta !== 'undefined' && meta.env) {
      return meta.env[key] || '';
    }
  } catch (e) {
    // Ignore error if import.meta is not available
  }

  try {
    // @ts-ignore
    return process.env[key] || '';
  } catch {
    return '';
  }
};

// Try to get config from environment (build time) or local storage (runtime setup)
const localUrl = typeof window !== 'undefined' ? localStorage.getItem('sb_url') : '';
const localKey = typeof window !== 'undefined' ? localStorage.getItem('sb_key') : '';

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || getEnv('REACT_APP_SUPABASE_URL') || localUrl || '';
const supabaseKey = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('REACT_APP_SUPABASE_ANON_KEY') || localKey || '';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseKey);

// Only initialize client if credentials exist to prevent "supabaseUrl is required" error
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export const saveSupabaseConfig = (url: string, key: string) => {
  localStorage.setItem('sb_url', url);
  localStorage.setItem('sb_key', key);
  window.location.reload();
};
