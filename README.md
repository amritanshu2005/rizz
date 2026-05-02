# RIZZ AI Assistant

RIZZ AI Assistant is a polished, production-ready single-page app that helps you turn ordinary dating app conversations into witty, flirty, confident, or direct replies.

Features

- Modern Vite + React + Tailwind frontend with mobile-first design
- Node.js + Express backend with `/generate` and `/generate-opener`
- Google Gemini integration (optional) with mock fallback
- Tone selector, example autofill, bio opener, copy-to-clipboard, toasts, dark mode
- AI usage logs stored under `/ai-logs`

Demo & Screenshots

- Open `http://localhost:5173` after following setup steps. (Add screenshots in `assets/` and update this README for contest submission.)

Quick start (two terminals)

Backend:

```powershell
cd backend
npm install
# copy .env.example to .env and set GEMINI_API_KEY if you have one
# Example .env:
# PORT=4000
# GEMINI_API_KEY=YOUR_GOOGLE_GEMINI_BEARER_TOKEN
npm run dev
```

Frontend:

```powershell
cd frontend
npm install
npm run dev
```

API

- `POST /generate` JSON { conversation, tone } → { replies: [] }
- `POST /generate-opener` JSON { bio, style } → { openers: [] }

AI logs

- The app writes prompts and responses to `/ai-logs` to make the prompt engineering visible. See `ai-logs/log1.txt` and `ai-logs/log2.txt` for examples.

How AI was used during development

- Prompts were iteratively crafted to produce natural, Gen-Z friendly replies that avoid robotic phrasing. Logs capture prompts, iterations, and improvements.

Notes on Gemini

- The backend attempts to call Google Generative Language when `GEMINI_API_KEY` is present. If absent or call fails, a deterministic mock generator returns safe responses for offline/demo use.

Submission checklist

- [ ] Demo running locally at `http://localhost:5173`
- [ ] `ai-logs/` included with examples
- [ ] README updated with screenshots and project overview

If you'd like, I can:

- Add screenshots to `assets/` and update the README for final submission
- Create a lightweight Dockerfile or a single `npm start` script that runs both servers
