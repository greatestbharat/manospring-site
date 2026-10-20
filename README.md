# Manospring — Mental Healthcare Demo

Demo mental healthcare site: React + TypeScript frontend, Express backend.

Most features use **mock data** (specialists, booking, consultations, patient portal). Only the **Personal Wellness Guide** (AI chat) needs a real API key. Without a key, chat still works with built-in offline replies.

The API key stays on the **server only** — never in frontend code, never committed to GitHub.

---

## Quick start

### 1. Install

```bash
npm install
```

### 2. Add your Groq key (optional — for live AI chat)

```bash
cp secrets.example.json secrets.json
```

Open `secrets.json` and paste your key:

```json
{
  "groqApiKey": "gsk_your_actual_key_here",
  "groqModel": "openai/gpt-oss-20b"
}
```

Get a free key: [console.groq.com](https://console.groq.com/) → API Keys → Create API Key.

`secrets.json` is listed in `.gitignore` and will not be pushed to GitHub.

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Production-style run:

```bash
npm run build
npm start
```

---

## Tests

```bash
npm test
```

---

## Push to GitHub

1. Create an empty repo on [GitHub](https://github.com/new) (no README / .gitignore).

2. From this project folder:

```bash
git add .
git status   # confirm secrets.json is NOT listed
git commit -m "Initial commit: Manospring healthcare demo"
git remote add origin https://github.com/YOUR_USERNAME/manospring.git
git branch -M main
git push -u origin main
```

If `origin` already exists, use:

```bash
git remote set-url origin https://github.com/YOUR_USERNAME/manospring.git
git push -u origin main
```

---

## Host (simplest: Render)

1. Sign up at [render.com](https://render.com/) and connect GitHub.
2. **New** → **Web Service** → pick this repo.
3. Settings:
   - **Build:** `npm install && npm run build`
   - **Start:** `npm start`
   - **Plan:** Free
4. Add env var (hosting cannot use your local `secrets.json`):
   - `GROQ_API_KEY` = your Groq key
5. Deploy → open the Render URL.

Railway works the same way: deploy from GitHub, set `GROQ_API_KEY` in the dashboard.

---

## Project layout

```text
manospring/
├── src/                 # React frontend (no API keys)
├── server/              # Express API + Groq chat (server-side only)
├── secrets.example.json # Template for local AI key
├── secrets.json         # Your real key (gitignored — create locally)
├── render.yaml          # Optional Render blueprint
└── Dockerfile           # Optional container deploy
```

---

## Disclaimer

Demo only. In a real crisis in India, call Tele-MANAS **14416** or emergency **112**.
