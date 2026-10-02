const $ = id => document.getElementById(id);

function getKey() { return localStorage.getItem('aegis_key') || ''; }

$('saveMaster').addEventListener('click', () => {
  localStorage.setItem('aegis_key', $('master').value.trim());
  alert('Saved.');
});

$('create').addEventListener('click', async () => {
  const res = await fetch('/api/keys', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': getKey() },
    body: JSON.stringify({ label: $('label').value.trim() })
  });
  const data = await res.json();
  if (!res.ok) return alert(data.error);
  $('newKey').textContent = data.key + '\n\n' + data.note;
  loadKeys();
});

$('refresh').addEventListener('click', loadKeys);

async function loadKeys() {
  const res = await fetch('/api/keys', { headers: { 'X-API-Key': getKey() } });
  const data = await res.json();
  if (!res.ok) return alert(data.error);

  $('keyList').innerHTML = (data.keys || []).map(k => `
    <li>
      <code>${k.key_prefix}…</code> — ${k.label || 'no label'}
      ${k.revoked ? '(revoked)' : ''}
      <button onclick="revoke('${k.id}')">Revoke</button>
    </li>
  `).join('');
}

async function revoke(id) {
  await fetch('/api/keys/' + id + '/revoke', {
    method: 'POST',
    headers: { 'X-API-Key': getKey() }
  });
  loadKeys();
}

window.revoke = revoke;
loadKeys();
