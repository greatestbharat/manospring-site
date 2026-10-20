# Manospring — Mental Healthcare Demo

React + TypeScript frontend with an Express 5 backend. Most features use **in-memory mock data**. The Personal Wellness Guide uses **live Groq AI** when a server-side API key is configured.

**Production hosting (recommended):** [Render](https://render.com/) from GitHub — full stack with live AI.

**Static demo only:** GitHub Pages (no Express / no live Groq).

---

## Local setup

```bash
npm install
cp secrets.example.json secrets.json
# edit secrets.json → set groqApiKey (get a free key at https://console.groq.com/keys)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

`secrets.json` is gitignored and used **only in local development**. Never commit it.

Production-style check:

```bash
npm run build
NODE_ENV=production GROQ_API_KEY=your_key npm start
```

Tests:

```bash
npm test
```

---

## Deploy on Render (full production)

Repository: [greatestbharat/manospring-site](https://github.com/greatestbharat/manospring-site)

### Exact service settings

| Setting | Value |
|--------|--------|
| **Service type** | Web Service |
| **Repository** | `greatestbharat/manospring-site` |
| **Branch** | `main` |
| **Root directory** | `.` (leave blank / repo root) |
| **Runtime** | Node |
| **Build command** | `NPM_CONFIG_PRODUCTION=false npm ci && npm run build` |
| **Start command** | `npm start` |
| **Health check path** | `/api/health` |
| **Plan** | Free (or Starter) |

### Environment variables (Render Dashboard)

| Key | Value | Notes |
|-----|--------|--------|
| `NODE_ENV` | `production` | Required |
| `GROQ_API_KEY` | *(your Groq key)* | **Required for live AI chat** — set as Secret |
| `GROQ_MODEL` | `openai/gpt-oss-20b` | Optional (this is the default) |
| `NODE_VERSION` | `20.18.1` | Optional if `.node-version` is detected |

Render injects `PORT` automatically — do not hardcode it.

### Manual steps in the Render Dashboard

1. Sign in at [dashboard.render.com](https://dashboard.render.com/) and connect the GitHub account that owns `greatestbharat/manospring-site`.
2. **New → Web Service** → select `greatestbharat/manospring-site` → branch `main`.
3. Enter the build/start/health-check values from the table above (or apply the included `render.yaml` Blueprint).
4. Under **Environment**, add `GROQ_API_KEY` with your Groq key (mark as secret). Add `NODE_ENV=production` if not already set.
5. Click **Create Web Service** / **Deploy**.
6. After deploy succeeds, open the Render URL (e.g. `https://manospring.onrender.com`) and confirm:
   - Site loads
   - `/api/health` returns `"ok": true` and `"aiConfigured": true`
   - Wellness Guide chat returns live replies (not a connection error)

Free-tier services may sleep after inactivity; the first request after sleep can take ~30–60 seconds.

### Why this works on Render

- Frontend is built with Vite (`base: '/'`) and served by Express from `dist/client`
- Browser calls relative `/api/...` (same origin) — no public API key in client code
- Server reads `GROQ_API_KEY` from Render env vars only in production
- Conversation history is sent with each chat request; failures show an error + retry in the UI

---

## GitHub Pages (static demo only)

Pages cannot run Node or keep a Groq key private. The Actions workflow deploys a static build with client-side mocks and an offline wellness engine.

Site: [greatestbharat.github.io/manospring-site](https://greatestbharat.github.io/manospring-site/)

For **live AI**, use Render (above).

---

## Project layout

```text
manospring/
├── src/                   # React frontend (API via /api; no secrets)
├── server/                # Express API + Groq (server-side key only)
├── secrets.example.json   # Local template (safe to commit)
├── secrets.json           # Local key only (gitignored)
├── render.yaml            # Render Blueprint
└── .github/workflows/     # Optional GitHub Pages static deploy
```

---

## Disclaimer

Demo only. In a real crisis in India, call Tele-MANAS **14416** or emergency **112**.
