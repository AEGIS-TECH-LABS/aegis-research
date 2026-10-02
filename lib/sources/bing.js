const fetch = require('node-fetch');
const cheerio = require('cheerio');

// Decode Bing's click-tracking URL back to the real destination
function decodeBingUrl(href) {
  if (!href) return href;
  try {
    const u = new URL(href, 'https://www.bing.com');
    const encoded = u.searchParams.get('u');
    if (!encoded) return href;

    // Bing's 'u' param starts with 'a1' followed by base64
    let b64 = encoded.startsWith('a1') ? encoded.slice(2) : encoded;
    // Add padding if needed
    while (b64.length % 4) b64 += '=';
    const decoded = Buffer.from(b64, 'base64').toString('utf8');
    return decoded.startsWith('http') ? decoded : href;
  } catch {
    return href;
  }
}

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
    const rawLink = $(el).find('h2 a').attr('href') || '';
    const link = decodeBingUrl(rawLink);
    const snippet = $(el).find('.b_caption p').text().trim();
    if (title && link) {
      results.push({ title, url: link, snippet, source: 'bing' });
    }
  });

  return results;
}

module.exports = { search };
