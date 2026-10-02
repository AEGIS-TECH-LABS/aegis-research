const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.warn('[supabase] Missing SUPABASE_URL or SERVICE_ROLE_KEY — DB features disabled');
}

// Admin client — backend only. Never expose to frontend.
const supabaseAdmin = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  : null;

// Public client info for frontend usage
const publicConfig = {
  url: supabaseUrl,
  anonKey: anonKey
};

module.exports = { supabaseAdmin, publicConfig };
