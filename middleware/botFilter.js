const BOT_SIGNATURES = [
  'curl', 'wget', 'python-requests', 'python-urllib',
  'scrapy', 'httpclient', 'go-http-client', 'java/',
  'libwww-perl', 'axios/', 'node-fetch', 'okhttp',
  'postmanruntime', 'insomnia', 'headlesschrome'
];

// Requests per IP per minute (in-memory, resets on restart)
const ipHits = new Map();
const WINDOW_MS = 60 * 1000;
const MAX_HITS = 60;

function getIp(req) {
  return (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
    || req.socket.remoteAddress
    || 'unknown';
}

function botFilter(req, res, next) {
  const ua = (req.headers['user-agent'] || '').toLowerCase();
  const ip = getIp(req);

  // 1. Missing UA = likely script
  if (!ua) {
    return res.status(403).json({ error: 'Missing User-Agent' });
  }

  // 2. Known bot signatures
  if (BOT_SIGNATURES.some(sig => ua.includes(sig))) {
    return res.status(403).json({ error: 'Automated clients not permitted' });
  }

  // 3. Honeypot header check (frontend never sets this)
  if (req.headers['x-honeypot'] === '1') {
    return res.status(403).json({ error: 'Blocked' });
  }

  // 4. Per-IP sliding window
  const now = Date.now();
  const entry = ipHits.get(ip) || { count: 0, start: now };
  if (now - entry.start > WINDOW_MS) {
    entry.count = 0;
    entry.start = now;
  }
  entry.count += 1;
  ipHits.set(ip, entry);

  if (entry.count > MAX_HITS) {
    return res.status(429).json({ error: 'Too many requests from this IP' });
  }

  next();
}

module.exports = { botFilter };
