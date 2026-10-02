# Aegis Research

Personal research API — multi-source search with bot filtering.

## Sources
- DuckDuckGo HTML (keyless, primary)
- Bing HTML (keyless, secondary)
- Wikipedia (keyless)
- arXiv (keyless, academic)
- Crossref (keyless, scholarly)
- Hacker News (keyless, tech)
- SerpApi (fallback, requires key)

## Deploy on Render

1. Push this repo to GitHub.
2. Render → New → Web Service → connect repo.
3. Build: `npm install` — Start: `node server.js`.
4. Add env vars from `.env.example`.
5. Deploy.

## Supabase setup

1. Create project.
2. SQL Editor → paste `supabase-schema.sql` → Run.
3. Auth → Providers → Email → **disable "Confirm email"**.
4. Copy URL, anon key, service_role key into Render env vars.

## Local run

```bash
cp .env.example .env
# fill in values
npm install
npm start
