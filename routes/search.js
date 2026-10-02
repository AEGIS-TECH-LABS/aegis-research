const express = require('express');
const { route } = require('../lib/router');
const { supabaseAdmin } = require('../lib/supabase');

const router = express.Router();

router.post('/', async (req, res) => {
  const { query, limit } = req.body || {};
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'query is required' });
  }

  const start = Date.now();
  try {
    const result = await route(query, { limit: Math.min(parseInt(limit) || 10, 25) });
    const duration = Date.now() - start;

    if (supabaseAdmin) {
      supabaseAdmin.from('usage_logs').insert({
        key_hash: req.user?.keyHash || null,
        user_id: req.user?.id || null,
        query,
        source_used: result.sources_used.join(','),
        duration_ms: duration,
        status: 'ok'
      }).then(() => {}).catch(() => {});
    }

    res.json({ ...result, duration_ms: duration });
  } catch (err) {
    res.status(500).json({ error: 'Search failed', detail: err.message });
  }
});

module.exports = router;
