const fetch = require('node-fetch');
const cheerio = require('cheerio');

async function search(query, opts = {}) {
  const url = `http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=${opts.limit || 5}`;
  const res = await fetch(url, { timeout: 10000 });
  if (!res.ok) throw new Error(`arXiv HTTP ${res.status}`);
  const xml = await res.text();
  const $ = cheerio.load(xml, { xmlMode: true });
  const results = [];

  $('entry').each((i, el) => {
    results.push({
      title: $(el).find('title').text().trim(),
      url: $(el).find('id').text().trim(),
      snippet: $(el).find('summary').text().trim().slice(0, 300),
      source: 'arxiv'
    });
  });
  return results;
}

module.exports = { search };
