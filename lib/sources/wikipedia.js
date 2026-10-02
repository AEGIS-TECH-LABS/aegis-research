const fetch = require('node-fetch');

async function search(query, opts = {}) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&srlimit=${opts.limit || 5}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'AegisResearch/1.0' },
    timeout: 8000
  });
  if (!res.ok) throw new Error(`Wikipedia HTTP ${res.status}`);
  const data = await res.json();
  return (data.query?.search || []).map(r => ({
    title: r.title,
    url: `https://en.wikipedia.org/wiki/${encodeURIComponent(r.title)}`,
    snippet: r.snippet.replace(/<[^>]+>/g, ''),
    source: 'wikipedia'
  }));
}

module.exports = { search };
