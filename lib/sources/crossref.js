const fetch = require('node-fetch');

async function search(query, opts = {}) {
  const url = `https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=${opts.limit || 5}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'AegisResearch/1.0 (mailto:you@example.com)' },
    timeout: 10000
  });
  if (!res.ok) throw new Error(`Crossref HTTP ${res.status}`);
  const data = await res.json();
  return (data.message?.items || []).map(item => ({
    title: (item.title || ['Untitled'])[0],
    url: item.URL,
    snippet: (item.abstract || '').replace(/<[^>]+>/g, '').slice(0, 300),
    source: 'crossref'
  }));
}

module.exports = { search };
