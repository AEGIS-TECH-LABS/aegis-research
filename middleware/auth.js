const crypto = require('crypto');
const { supabaseAdmin } = require('../lib/supabase');

function hashKey(raw) {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

async function auth(req, res, next) {
  // Path 1: X-API-Key header
  const raw = req.headers['x-api-key'];
  if (raw) {
    // Master key for personal use
    if (process.env.PERSONAL_API_KEY && raw === process.env.PERSONAL_API_KEY) {
      req.user = { tier: 'owner', method: 'master', id: 'owner' };
      return next();
    }

    // DB-issued key
    if (supabaseAdmin) {
      const hash = hashKey(raw);
      const { data } = await supabaseAdmin
        .from('api_keys')
        .select('*')
        .eq('key_hash', hash)
        .eq('revoked', false)
        .maybeSingle();

      if (data) {
        req.user = {
          tier: data.tier || 'personal',
          method: 'key',
          id: data.user_id,
          keyHash: hash
        };
        return next();
      }
    }
    return res.status(401).json({ error: 'Invalid API key' });
  }

  // Path 2: Supabase session
  const token = req.cookies?.sb_token
    || (req.headers.authorization || '').replace('Bearer ', '');

  if (token && supabaseAdmin) {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (!error && data?.user) {
      req.user = {
        tier: 'personal',
        method: 'session',
        id: data.user.id
      };
      return next();
    }
  }

  return res.status(401).json({ error: 'Authentication required' });
}

module.exports = { auth, hashKey };
