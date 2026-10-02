const fetch = require('node-fetch');

async function search(query, opts = {}) {
  const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&hitsPerPage=${opts.limit || 5}`;
  const res = await fetch(url, { timeout: 8000 });
  if (!res.ok) throw new Error(`HN HTTP ${res.status}`);
  const data = await res.json();
  return (data.hits || []).map(h => ({
    title: h.title || h.story_title || 'Untitled',
    url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
    snippet: (h.story_text || h.comment_text || '').replace(/<[^>]+>/g, '').slice(0, 250),
    source: 'hackernews'
  }));
}

module.exports = { search };
