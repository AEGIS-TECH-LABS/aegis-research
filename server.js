require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');

const { botFilter } = require('./middleware/botFilter');
const { auth } = require('./middleware/auth');
const { publicConfig } = require('./lib/supabase');
const searchRoute = require('./routes/search');
const keysRoute = require('./routes/keys');

const app = express();
app.set('trust proxy', 1);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// Serve static frontend
app.use(express.static(path.join(__dirname, 'public')));

// Public config for frontend (anon key only)
app.get('/config', (req, res) => {
  res.json({
    supabase_url: publicConfig.url,
    supabase_anon_key: publicConfig.anonKey
  });
});

// Health (wake + monitoring)
app.get('/health', (req, res) => res.json({ ok: true, ts: Date.now() }));

// Protected API surface
app.use('/api', botFilter);
app.use('/api/search', auth, searchRoute);
app.use('/api/keys', auth, keysRoute);

// Fallback: serve index.html for any non-API route
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Not found' });
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const port = process.env.PORT || 10000;
app.listen(port, '0.0.0.0', () => {
  console.log(`[aegis] listening on ${port}`);
});
