const fetch = require('node-fetch');
const cheerio = require('cheerio');

async function search(query, opts = {}) {
  const url = `https://www.bing.com/search?q=${encodeURIComponent(query)}&count=${opts.limit || 10}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9'
    },
    timeout: 10000
  });

  if (!res.ok) throw new Error(`Bing HTTP ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);
  const results = [];

  $('li.b_algo').each((i, el) => {
    if (results.length >= (opts.limit || 10)) return;
    const title = $(el).find('h2 a').text().trim();
    const link = $(el).find('h2 a').attr('href') || '';
    const snippet = $(el).find('.b_caption p').text().trim();
    if (title && link) {
      results.push({ title, url: link, snippet, source: 'bing' });
    }
  });

  return results;
}

module.exports = { search };
