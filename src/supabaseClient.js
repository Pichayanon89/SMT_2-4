import { createClient } from "@supabase/supabase-js";

const defaultSupabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const defaultSupabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;
const clientCache = new Map();

function clientCacheKey(url, key) {
  return `${url || ""}:${key || ""}`;
}

export function createSupabaseClient(url = defaultSupabaseUrl, key = defaultSupabaseKey) {
  if (!url || !key) {
    throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY");
  }

  return createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

export function getSupabaseClient(url = defaultSupabaseUrl, key = defaultSupabaseKey) {
  const cacheKey = clientCacheKey(url, key);
  if (!clientCache.has(cacheKey)) {
    clientCache.set(cacheKey, createSupabaseClient(url, key));
  }
  return clientCache.get(cacheKey);
}

export const supabase = getSupabaseClient();
