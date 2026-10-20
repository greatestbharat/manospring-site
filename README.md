# 🌿 Manospring — Mental Healthcare Platform (Demo)

A modern, confidential healthcare platform built with **React 19**, **TypeScript**, **Tailwind CSS v4**, and an **Express 5** backend.

Features a patient-centred healthcare homepage, verified clinician directory, interactive 4-step appointment booking wizard, private consultation suite, multi-language support (**English**, **हिन्दी**, **ಕನ್ನಡ**), and a dynamic light/dark theme.

---

## 💡 About this Demo Project

- **Zero Database Setup:** 95% of features (specialist directory, appointments, consultation video rooms, patient portal) run on rich built-in mock data in memory. You do **not** need to install or configure a database to explore the complete experience.
- **AI Chat (Personal Wellness Guide):** The only feature that connects to a live external API is the Personal Wellness Guide. It uses the fast, free [Groq Cloud API](https://console.groq.com/).
- **Security & Privacy:** The API key is stored exclusively on the backend via a local `.env` file. It is **never** bundled into frontend client code and is blocked by `.gitignore` so it is never pushed to GitHub.
- **Offline Fallback:** If you do not provide a Groq API key, the Personal Wellness Guide automatically falls back to built-in compassionate local responses with active listening and grounding exercises.

---

## ⚡ Quick Start (Run Locally in 3 Steps)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional — For Live AI Chat)
Copy the template to create your local `.env`:
```bash
cp .env.example .env
```

Open `.env` in any text editor and add your Groq API key:
```ini
PORT=3000
NODE_ENV=development
GROQ_API_KEY=gsk_your_actual_key_here
GROQ_MODEL=openai/gpt-oss-20b
```

> **How to get a free Groq API key:**
> 1. Sign up for free at [https://console.groq.com/](https://console.groq.com/)
> 2. Go to **API Keys** → click **Create API Key**
> 3. Paste it into your local `.env` file as `GROQ_API_KEY=gsk_...`

### 3. Run the App

**For Development (with live client & server reload):**
```bash
npm run dev
```

**For Production Mode:**
```bash
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Automated Tests

Run the complete 16-test automated integration suite:
```bash
npm test
```
All 16 tests verify health checks, clinician filters, 4-step booking, teleconsultation room generation, emergency crisis escalation (14416 / 112), and security headers.

---

## 🚀 How to Push to GitHub (Simplest Steps)

1. Create a new empty repository on [GitHub](https://github.com/new) (e.g. `manospring`). Do **not** initialize it with a README or `.gitignore` (we already have them).

2. In your terminal, run:
```bash
# 1. Stage all project files (safe: .env and node_modules are already ignored)
git add .

# 2. Commit the files
git commit -m "Initial commit: Manospring healthcare demo platform"

# 3. Link your new GitHub repository (replace with your actual GitHub URL)
git remote add origin https://github.com/YOUR_USERNAME/manospring.git

# 4. Push to GitHub
git push -u origin main
```

> 🔒 **Security Guarantee:** Your local `.env` file is excluded by `.gitignore`. Your API keys will **never** be uploaded to GitHub.

---

## 🌐 Simplest Production Hosting (Free & 1-Click)

### Option 1: Render (Recommended — Easiest for Full-Stack)

Render natively runs both the Express backend and React SPA on a single free web service:

1. Sign up for free at [render.com](https://render.com/).
2. Click **New +** → **Web Service** → Select your GitHub repository.
3. Set the following settings:
   - **Name:** `manospring`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** `Free`
4. Under **Environment Variables**, click **Add Environment Variable**:
   - `NODE_ENV` = `production`
   - `GROQ_API_KEY` = *(paste your Groq API key here)*
5. Click **Deploy Web Service**. Your site will be live with free SSL at `https://your-app.onrender.com`.

*(Or use Render's 1-click Blueprint by selecting the included `render.yaml` file).*

---

### Option 2: Railway

1. Sign up at [railway.app](https://railway.app/).
2. Click **New Project** → **Deploy from GitHub repo** → choose `manospring`.
3. Add the environment variable `GROQ_API_KEY` in the project settings.
4. Railway automatically detects `npm run build` and `npm start` and deploys your site with an instant public URL.

---

## 📁 Project Structure

```text
manospring/
├── src/                         # React 19 + TypeScript Frontend
│   ├── app/                     # App shell, i18n context, theme context
│   ├── components/layout/       # Full-width Header, TopEmergencyBar, Footer
│   ├── features/
│   │   ├── home/                # Hero, Explore Topics, How It Works, Trust sections
│   │   ├── specialists/         # Verified Clinician Directory & Bio Modals
│   │   ├── appointments/        # 4-Step Intake & Booking Modal (with tab validation)
│   │   ├── ai-chat/             # Personal Wellness Guide (Floating chat)
│   │   └── patient/             # Patient Portal & Telehealth Sessions
│   └── locales/                 # Standard JSON translations (en.json, hi.json, kn.json)
├── server/                      # Express 5 + Node.js Backend
│   └── src/
│       ├── modules/             # Specialists, Chat, Appointments, Consultations
│       ├── services/            # Groq API client with local compassionate fallback
│       └── server.ts            # Server entrypoint with graceful shutdown
├── tests/                       # Automated API integration test suite
├── .env.example                 # Safe environment template (NO secrets)
├── .gitignore                   # Watertight ignore rules (.env, node_modules, dist)
└── render.yaml                  # 1-click cloud deployment blueprint
```

---

## ⚖️ Disclaimer
Manospring is a demonstration telemedicine platform. Emergency psychological crisis support in India is provided 24/7 by Tele-MANAS (Govt. of India) at **14416** or National Emergency at **112**.
