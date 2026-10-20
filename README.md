# Manospring — Mental Healthcare Demo

React + TypeScript frontend with an optional Express backend.

Most features use **mock data** (specialists, booking, consultations, patient portal). The site is configured for free **GitHub Pages** hosting as a static website.

---

## Can this run on GitHub Pages?

**Yes — as a static demo.** GitHub Pages only serves HTML/CSS/JS (no Node/Express). For Pages builds (`VITE_STATIC=true`):

- Specialists, booking, sessions, clinician login, contact, and privacy forms run entirely in the browser with mock data
- AI chat uses the built-in **local wellness engine** (compassionate offline replies + crisis helplines)
- **No API key** is embedded in the frontend and none is required for Pages

### Live Groq AI chat (optional)

Calling Groq needs a **server** so the key stays private. GitHub Pages cannot do that. Simplest free alternative:

1. Keep this static site on GitHub Pages for the UI, **or**
2. Deploy the full app (`npm run build` + `npm start`) on [Render](https://render.com/) free tier and set `GROQ_API_KEY` in the Render dashboard

Local full-stack with live AI: put your key in gitignored `secrets.json` (see below) and run `npm run dev`.

---

## Quick start (local)

```bash
npm install
npm run dev          # full stack at http://localhost:3000
```

Optional live AI (server only — never commit this file):

```bash
cp secrets.example.json secrets.json
# edit secrets.json → groqApiKey
```

Preview the GitHub Pages static build locally:

```bash
npm run build:pages
npm run preview:pages
# open http://localhost:4173/manospring-site/
```

---

## Host on GitHub Pages (free)

Repo: [greatestbharat/manospring-site](https://github.com/greatestbharat/manospring-site)

1. In GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**
2. Push to `main` (workflow `.github/workflows/deploy-pages.yml` runs automatically)
3. Site URL: **https://greatestbharat.github.io/manospring-site/**

Build settings used by the workflow:

| Setting | Value |
|--------|--------|
| Command | `npm run build:pages` |
| Env | `VITE_STATIC=true`, `VITE_BASE=/manospring-site/` |
| Output | `dist/client` (+ `404.html` for SPA routes) |

---

## Tests

```bash
npm test
```

---

## Project layout

```text
manospring/
├── src/                 # React frontend (mock API when VITE_STATIC=true)
├── server/              # Express + Groq (local / Render only — not on Pages)
├── .github/workflows/   # GitHub Pages deploy
├── secrets.example.json # Template for local Groq key
└── secrets.json         # Your key (gitignored)
```

---

## Disclaimer

Demo only. In a real crisis in India, call Tele-MANAS **14416** or emergency **112**.
