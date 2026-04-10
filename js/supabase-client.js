import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const config = window.__SUPABASE_CONFIG__ || {};

if (!config.url || !config.anonKey || config.url === "YOUR_SUPABASE_URL") {
  console.error("Supabase is not configured. Update js/supabase-config.js");
}

export const supabase = createClient(config.url, config.anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
