# AI Resume ↔ Job Match Optimizer — Project Blueprint

**Stack constraints locked in:** Google Gemini free-tier API (switched from OpenAI, which has no real free API tier) · Netlify (frontend) · Render (backend) · $0 budget, fully free A-to-Z

> **Update:** OpenAI does not offer a genuine ongoing free API tier — every request is billed per token, with no way around it. Since the goal is fully free, this blueprint uses **Google Gemini's free tier** instead (Gemini Flash), which is currently the most capable model available at $0 with no credit card required. See §3 for full reasoning and honest trade-offs.

---

## 1. What we're building

A webapp where a user uploads a resume + pastes a job description, and gets back:
- A visual **match score** (radar/gauge chart)
- A **keyword gap list** (what's missing, ranked by importance)
- An **AI bullet-point rewriter** (click a resume line → get 2-3 improved versions)
- A **downloadable optimized resume** (PDF/DOCX)

Monetization: freemium (1 free scan/month → paid unlimited), added later once the product works.

---

## 2. Tech stack (researched for your constraints)

| Layer | Choice | Why |
|---|---|---|
| Frontend | React + Vite + Tailwind | Fast build, cheap to host as static site |
| Charts | Recharts | Free, handles radar/gauge charts well |
| Backend | Node.js + Express (or FastAPI if you prefer Python) | Simple REST API, deploys cleanly to Render |
| AI | **Google Gemini free tier** (Gemini Flash model) | Genuinely free with no credit card, unlike OpenAI (see §3) |
| Resume parsing | `pdf-parse` (PDF) + `mammoth` (DOCX) | Free, no external API needed |
| Database | **Supabase (Postgres) free tier** — not Render's free Postgres | Render's free DB auto-deletes after 30 days; Supabase's free tier doesn't expire |
| Auth | Supabase Auth (free) | Bundled with the DB choice, saves integrating a separate service |
| Payments | Stripe (test mode, free until you go live) | Industry standard, no cost until you process real transactions |
| Frontend hosting | **Netlify free tier** | Static site hosting, generous enough for an MVP |
| Backend hosting | **Render free tier** | Persistent Node/Python server, unlike Netlify which is static-first |

### Important free-tier gotchas to design around
- **Render free web services spin down after 15 minutes of inactivity** and take ~30-60s to "cold start" back up. Your first API call after idle time will feel slow — plan for a loading state in the UI, not a bug.
- **Render's free Postgres expires after 30 days.** Don't use it — use Supabase's free Postgres instead, which persists indefinitely.
- **Netlify's free tier runs on a monthly credit budget** (300 credits: deploys, bandwidth, and function calls all draw from the same pool). Fine for an MVP with low traffic, but avoid triggering excessive rebuilds.
- Neither platform requires a credit card for their free tier, so there's no risk of surprise charges from hosting — only from OpenAI usage, which you control directly.

---

## 3. Solving the "I want this fully free" requirement

**OpenAI does not have a real ongoing free API tier.** New accounts sometimes get a small one-time credit, but after that every request is billed — there's no way around this if you use OpenAI. So for a genuinely $0 stack, we switch the AI provider.

### Free AI providers (real, no credit card required)

| Provider | What you get free | Best for |
|---|---|---|
| **Google Gemini (AI Studio)** ⭐ recommended | Free tier on Gemini Flash with a generous daily request quota | Best model quality available for $0 — this is the pick |
| **Groq** | Free API key, very fast open-weight models (Llama, etc.) | Good backup/fallback provider, less nuanced than Gemini |
| **OpenRouter free models** | ~20-25 models free, rate-limited (~20 req/min, 50-200/day) | Good for testing multiple models, thin for real traffic |

**Recommendation: build on Google Gemini's free tier.** It's an OpenAI-compatible-ish setup conceptually (structured JSON output works the same way), handles the resume-scoring task well, and the free quota comfortably covers an MVP with a small number of users.

### The honest trade-offs of "free" AI
- **Rate limits, not unlimited access.** Fine for development and a modest early user base. If the app gets real traffic, you'll hit the daily/per-minute cap — that's the point where "free" ends and you'd need to either add a paid fallback or accept the cap.
- **Free-tier usage is typically used to improve the provider's models.** This is standard across free LLM tiers, not unique to Google. Since resumes contain personal data, plan to disclose this in your privacy policy before launch, and avoid sending anything a user wouldn't want logged.
- **No SLA.** Free tiers can be slower or occasionally unavailable during peak load — build a loading/retry state in the UI rather than assuming instant, guaranteed responses.

### Keeping it efficient regardless of provider
1. **Force structured JSON output** with a tight system prompt (score, gaps, suggestions) instead of open-ended prose — cheaper/faster and easier to render into charts.
2. **Truncate/clean resume text before sending it** — strip whitespace, headers/footers, formatting noise.
3. **Cache job-description analysis** if the same posting gets scanned by multiple users — reuse instead of re-calling the API.
4. **Set a hard per-user rate limit** (e.g., 1-3 scans/day) at the backend from day one — protects your shared free quota from being exhausted by one user.
5. **Design a fallback path** (e.g., Gemini → Groq) for when you hit a rate limit, so the app degrades gracefully instead of failing outright.

---

## 4. Architecture overview

```
[React frontend on Netlify]
        │  (HTTPS requests)
        ▼
[Node/Express API on Render]
        │
        ├──► OpenAI API (resume scoring, gap analysis, rewriting)
        ├──► Supabase Postgres (users, scan history, saved resumes)
        └──► Supabase Auth (login/signup)
        │
[Stripe] ◄── (added in a later phase, test mode first)
```

---

## 5. Build phases

This is the order I'd recommend, each phase producing something you can actually see/test before moving to the next. You said you'll tell me when to generate the prompts/code for each phase — here's what each one covers so you know what to ask for.

### Phase 0 — Setup & scaffolding
- Create GitHub repo (monorepo: `/frontend`, `/backend`)
- Set up Netlify project (connected to `/frontend`)
- Set up Render project (connected to `/backend`)
- Set up Supabase project (DB + Auth)
- Set up OpenAI API key + billing limit (set a hard monthly spend cap in the OpenAI dashboard — first thing to do, before writing any code)

### Phase 1 — Resume upload & parsing
- Frontend: file upload UI (drag-and-drop, PDF/DOCX)
- Backend: endpoint to receive file, extract raw text (`pdf-parse`/`mammoth`)
- Output: raw resume text displayed back to confirm parsing works
- **No AI calls yet** — this phase is just proving the pipeline works

### Phase 2 — AI scoring engine
- Frontend: job description textarea
- Backend: endpoint that sends resume text + job description to OpenAI, requests structured JSON (score breakdown, matched keywords, missing keywords)
- Test with a few real resume/job-description pairs, tune the prompt for consistent JSON
- This is the core value of the product — worth spending the most iteration time here

### Phase 3 — Visual dashboard
- Radar/gauge chart for match score (Recharts)
- Color-coded keyword gap list
- Resume text with keyword highlighting overlay
- This is the "wow" visual moment — polish matters here

### Phase 4 — Bullet-point rewriter
- Click-to-rewrite UI on individual resume lines
- Backend endpoint: sends one bullet + job context, returns 2-3 rewritten versions
- Before/after comparison UI

### Phase 5 — Auth & persistence
- Supabase Auth: signup/login
- Save scan history per user
- Enforce free-tier usage limit (e.g., 1 scan/month) at the backend

### Phase 6 — Export
- Generate downloadable optimized resume (PDF/DOCX) with accepted rewrites applied

### Phase 7 — Payments
- Stripe integration (test mode)
- Paywall: free tier limit → upgrade prompt → subscription checkout
- Webhook handling for subscription status

### Phase 8 — Deploy & polish
- Deploy frontend to Netlify, backend to Render (production configs, environment variables, CORS)
- Add loading states for Render's cold-start delay
- Error handling, empty states, mobile responsiveness pass
- Basic analytics (optional, free tier of something like Plausible or Umami)

### Phase 9 — Launch prep
- Landing page copy/SEO basics
- Terms of service / privacy policy (needed once you're processing payments and resumes)
- Soft launch to a small test group before wider release
