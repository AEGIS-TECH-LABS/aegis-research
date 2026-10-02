const fetch = require('node-fetch');

async function search(query, opts = {}) {
  const key = process.env.SERPAPI_KEY;
  if (!key) throw new Error('SERPAPI_KEY not set');

  const url = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${key}&num=${opts.limit || 10}`;
  const res = await fetch(url, { timeout: 15000 });
  if (!res.ok) throw new Error(`SerpApi HTTP ${res.status}`);
  const data = await res.json();
  return (data.organic_results || []).map(r => ({
    title: r.title,
    url: r.link,
    snippet: r.snippet || '',
    source: 'serpapi'
  }));
}

module.exports = { search };
