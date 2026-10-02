const sources = {
  duckduckgo: require('./sources/duckduckgo'),
  bing: require('./sources/bing'),
  wikipedia: require('./sources/wikipedia'),
  arxiv: require('./sources/arxiv'),
  crossref: require('./sources/crossref'),
  hackernews: require('./sources/hackernews'),
  serpapi: require('./sources/serpapi')
};

// Choose sources based on query signals
function pickSources(query) {
  const q = query.toLowerCase();
  const chosen = ['duckduckgo']; // always

  if (/\b(study|paper|research|journal|arxiv|doi)\b/.test(q)) {
    chosen.push('arxiv', 'crossref');
  }
  if (/\b(define|definition|who is|what is|history)\b/.test(q)) {
    chosen.push('wikipedia');
  }
  if (/\b(code|programming|hacker|tech|startup|javascript|python)\b/.test(q)) {
    chosen.push('hackernews');
  }
  // Bing as secondary general source
  if (chosen.length < 3) chosen.push('bing');

  return [...new Set(chosen)];
}

async function runOne(name, query, opts) {
  const start = Date.now();
  try {
    const results = await sources[name].search(query, opts);
    return { name, results, duration: Date.now() - start, ok: true };
  } catch (err) {
    return { name, results: [], duration: Date.now() - start, ok: false, error: err.message };
  }
}

async function route(query, opts = {}) {
  const limit = opts.limit || 10;
  const primary = pickSources(query);

  // Run primary sources in parallel
  const runs = await Promise.all(primary.map(n => runOne(n, query, { limit })));

  let merged = [];
  const usedSources = [];
  for (const run of runs) {
    if (run.ok && run.results.length) {
      merged = merged.concat(run.results);
      usedSources.push(run.name);
    }
  }

  // Deduplicate by URL
  const seen = new Set();
  merged = merged.filter(r => {
    if (!r.url || seen.has(r.url)) return false;
    seen.add(r.url);
    return true;
  });

  // Fallback to SerpApi if primary returned nothing
  if (merged.length === 0 && process.env.SERPAPI_KEY) {
    const fallback = await runOne('serpapi', query, { limit });
    if (fallback.ok) {
      merged = fallback.results;
      usedSources.push('serpapi');
    }
  }

  return {
    query,
    sources_used: usedSources,
    count: merged.length,
    results: merged.slice(0, limit * 2)
  };
}

module.exports = { route };
