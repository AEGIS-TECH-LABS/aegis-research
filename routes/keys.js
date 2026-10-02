const express = require('express');
const crypto = require('crypto');
const { supabaseAdmin } = require('../lib/supabase');
const { hashKey } = require('../middleware/auth');

const router = express.Router();

router.post('/', async (req, res) => {
  if (!supabaseAdmin) return res.status(503).json({ error: 'DB not configured' });

  const { label } = req.body || {};
  const raw = 'sk_live_' + crypto.randomBytes(24).toString('hex');
  const hash = hashKey(raw);
  const prefix = raw.slice(0, 14);

  const { error } = await supabaseAdmin.from('api_keys').insert({
    user_id: req.user?.id && req.user.id !== 'owner' ? req.user.id : null,
    key_hash: hash,
    key_prefix: prefix,
    label: label || 'personal',
    tier: 'personal'
  });

  if (error) return res.status(500).json({ error: error.message });

  res.json({ key: raw, prefix, note: 'Store this now. It will not be shown again.' });
});

router.get('/', async (req, res) => {
  if (!supabaseAdmin) return res.status(503).json({ error: 'DB not configured' });
  const { data } = await supabaseAdmin
    .from('api_keys')
    .select('id, key_prefix, label, tier, revoked, created_at, requests_today')
    .order('created_at', { ascending: false });
  res.json({ keys: data || [] });
});

router.post('/:id/revoke', async (req, res) => {
  if (!supabaseAdmin) return res.status(503).json({ error: 'DB not configured' });
  const { error } = await supabaseAdmin
    .from('api_keys')
    .update({ revoked: true })
    .eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

module.exports = router;
