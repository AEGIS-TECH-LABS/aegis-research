const $ = id => document.getElementById(id);

function getKey() {
  return localStorage.getItem('aegis_key') || '';
}

async function search() {
  const q = $('q').value.trim();
  if (!q) return;

  // honeypot check
  if ($('hp') && $('hp').value) return;

  $('status').textContent = 'Searching…';
  $('results').innerHTML = '';

  const key = getKey();
  if (!key) {
    $('status').textContent = 'No API key set. Open /dashboard.html to add one.';
    return;
  }

  try {
    const res = await fetch('/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': key
      },
      body: JSON.stringify({ query: q, limit: parseInt($('limit').value) || 10 })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed');

    $('status').textContent = `${data.count} results from ${data.sources_used.join(', ')} in ${data.duration_ms}ms`;

    $('results').innerHTML = data.results.map(r => `
      <article class="result">
        <h3><a href="${r.url}" target="_blank" rel="noopener">${escapeHtml(r.title)}</a></h3>
        <p>${escapeHtml(r.snippet || '')}</p>
        <small>${r.source} · ${r.url}</small>
      </article>
    `).join('');
  } catch (err) {
    $('status').textContent = 'Error: ' + err.message;
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}

$('go').addEventListener('click', search);
$('q').addEventListener('keydown', e => { if (e.key === 'Enter') search(); });
