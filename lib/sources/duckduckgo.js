const fetch = require('node-fetch');
const cheerio = require('cheerio');

async function search(query, opts = {}) {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9'
    },
    timeout: 10000
  });

  if (!res.ok) throw new Error(`DDG HTTP ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);
  const results = [];

  $('.result__body').each((i, el) => {
    if (results.length >= (opts.limit || 10)) return;
    const title = $(el).find('.result__a').text().trim();
    const link = $(el).find('.result__a').attr('href') || '';
    const snippet = $(el).find('.result__snippet').text().trim();

    // Decode DDG redirect
    let cleanLink = link;
    try {
      const u = new URL(link, 'https://duckduckgo.com');
      const uddg = u.searchParams.get('uddg');
      if (uddg) cleanLink = decodeURIComponent(uddg);
    } catch (_) {}

    if (title && cleanLink) {
      results.push({ title, url: cleanLink, snippet, source: 'duckduckgo' });
    }
  });

  return results;
}

module.exports = { search };
