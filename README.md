# MindBridge — GenAI Mental Wellness Companion for Indian Exam Aspirants

> **Hackathon Vertical:** Mental Health & EdTech  
> A production-ready, AI-powered journaling and wellness companion built exclusively for students preparing for India's most competitive exams — NEET, JEE, CUET, CAT, GATE, and UPSC.

---

## Chosen Vertical

**Mental Wellness × EdTech** — India has over 3 million students in high-stakes exam preparation every year. Burnout, anxiety, and unaddressed psychological distress are endemic, yet there is almost no tooling that speaks to their specific context: syllabus pressure, parental expectations, peer competition, and the uniquely Indian experience of "one chance" exams.

MindBridge addresses this gap: an intelligent, empathetic journaling companion that reads what a student writes, understands the emotional subtext, and responds with hyper-personalised coping strategies, mindfulness exercises, and motivational support — all without ever replacing professional mental health care.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (Client)                          │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────┐  │
│  │ Journal  │  │ Insights │  │   Chat   │  │  Mindfulness   │  │
│  │  Page    │  │  Page    │  │   Page   │  │     Page       │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────────────────┘  │
│       │             │             │                              │
│  ┌────▼─────────────▼─────────────▼─────────────────────────┐   │
│  │               Custom Hooks Layer                          │   │
│  │   useJournal · useMoodHistory · useChat · useDebounce     │   │
│  └───────────────────────────┬───────────────────────────────┘   │
│                              │  localStorage (typed StorageService)│
│  ┌───────────────────────────▼───────────────────────────────┐   │
│  │               Lib Utilities (pure functions)               │   │
│  │  storage · sanitize · crisisDetector · aggregations        │   │
│  └───────────────────────────────────────────────────────────┘   │
└───────────────────────────────┬─────────────────────────────────┘
                                │ POST /api/analyze
                                │ POST /api/chat
                                │ (HTTPS, rate-limited, Zod-validated)
┌───────────────────────────────▼─────────────────────────────────┐
│                   Next.js Server (API Routes)                     │
│                                                                  │
│  ┌───────────────────────┐     ┌───────────────────────────┐    │
│  │  /api/analyze         │     │  /api/chat                │    │
│  │  · Zod input validate │     │  · Zod input validate     │    │
│  │  · Sliding-window RL  │     │  · Sliding-window RL      │    │
│  │  · Crisis override    │     │  · Crisis note injection  │    │
│  │  · LLM call           │     │  · LLM call               │    │
│  │  · JSON parse+valid   │     │  · Response delivery      │    │
│  └───────────┬───────────┘     └─────────────┬─────────────┘    │
└──────────────┼──────────────────────────────┼──────────────────┘
               │                              │
┌──────────────▼──────────────────────────────▼──────────────────┐
│       Groq API  (llama-3.3-70b-versatile / llama-3.1-8b-instant) │
│       Server-side only — API key never in client bundle          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Approach & Logic

### 1. Context-Aware AI Analysis
Every journal submission sends the student's **exam type**, **days until exam**, **current mood (1-5)**, **selected stress tags**, and their **last 7 mood scores** to the LLM. The model is instructed to analyse the *emotional subtext*, not just surface keywords — e.g. "I can't understand organic chemistry" implies academic inadequacy anxiety, not just chemistry confusion.

The system prompt enforces a strict JSON schema response. If the model returns malformed JSON, `aiResponseParser.ts` strips markdown fences and falls back to a safe default — the app never crashes on a bad AI response.

### 2. Dual-Layer Crisis Detection
Crisis language is detected at two independent layers:
- **Client-side** (`lib/crisisDetector.ts`): regex scan on keydown, shows `SafetyBanner` with India helplines (Tele-MANAS 14416, iCall 9152987821) before submission
- **Server-side** (`/api/analyze`): same regex runs post-submission; if AI returns `riskLevel: low` but crisis language is present, the server upgrades it to `moderate`

This redundancy means no single point of failure can miss a distress signal.

### 3. Personalised Mindfulness
The AI returns a `mindfulnessExercise` object (title, step-by-step instructions, duration) tailored to the student's current emotional state. This is not a fixed library lookup — it is generated fresh each time based on what the student wrote, ensuring the exercise matches the exact stressor described.

### 4. Persistent Mood Intelligence
All journal entries are persisted to `localStorage` with their AI analysis. The Insights page aggregates this into:
- A mood trend line chart (Recharts) showing emotional arc over time
- A trigger frequency bar chart showing recurring stressors
- A weekly summary card (average mood, journaling streak, top trigger)

### 5. Empathetic Chat Companion
The chat API maintains conversation history (capped at 10 turns) and injects the student's exam context and current mood into every system prompt. If crisis language appears in a chat message, a `[SYSTEM NOTE]` is prepended to alert the model without the student seeing it — the model then naturally steers toward safety resources.

---

## How the Solution Works

### User Journey
```
1. Onboarding  →  Set name, exam type, target date
2. Journal     →  Write freely; pick mood (1-5); select stress tags
3. Analysis    →  AI reads entry, returns triggers, coping strategies,
                   mindfulness exercise, encouragement, risk level
4. Reflection  →  View AI insights; launch guided mindfulness player
5. Chat        →  Talk to the AI companion for ongoing support
6. Insights    →  Review mood trends, trigger patterns, weekly summary
```

### Data Flow
- **No backend database.** All user data stays in the browser's `localStorage`. Nothing is stored server-side.
- The journal entry text is sent (over HTTPS) to `/api/analyze` only during analysis. It is never logged or persisted by MindBridge's server.
- The Groq API receives only the journal text and anonymised exam context — no name, no identifying information.

---

## Assumptions

1. Students have access to a modern browser (Chrome 90+, Firefox 88+, Safari 14+).
2. The exam target date is set once at onboarding and assumed reasonably accurate.
3. Journal entries are personal and private; no multi-user or cloud sync is in scope.
4. `localStorage` (~5 MB typical browser quota) is sufficient for journaling history; entries are not size-capped beyond Zod's 5000-character input limit.
5. The AI model (Llama 3.3 70B via Groq) is capable enough to infer emotional nuance from short-form journal text without fine-tuning.
6. Crisis detection patterns cover common English phrasing; regional-language or highly coded expressions of distress are out of scope for the regex layer (but the LLM may still catch them).
7. Rate limiting uses an in-memory store, which resets on server restart — appropriate for a demo/hackathon context; production would use Redis.

---

## Setup & Run

### Prerequisites
- Node.js 18+
- A **free** Groq API key — get one in 30 seconds (no credit card) at [console.groq.com/keys](https://console.groq.com/keys)

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.local.example .env.local
# Paste your Groq key:
# GROQ_API_KEY=gsk_...
```

### 3. Start development server
```bash
npm run dev
# Open http://localhost:3000
```

### 4. Run all tests (11 test files, 110+ assertions)
```bash
npm test
```

### 5. Lint & format
```bash
npm run lint
npm run format
```

### 6. Type check
```bash
npx tsc --noEmit
```

---

## How We Addressed Each Scoring Criterion

### Code Quality *(High Impact)*
| Practice | Implementation |
|----------|---------------|
| Strict TypeScript | `strict: true` in tsconfig; no `any`; all domain types in `/types/index.ts` |
| Clean layered architecture | `/lib` pure functions → `/hooks` state/effects → `/components` UI → `/app` routes |
| Zod schemas | API I/O validated in `/types/schemas.ts`; AI response validated in `aiResponseParser.ts` |
| Shared constants | `/constants/exams.ts`, `helplines.ts`, `mindfulness.ts` — no magic strings in components |
| Error handling | `ErrorBoundary` in `app/error.tsx`; try/catch on every async path; fallback AI response |
| Formatting | Prettier config committed; consistent across all 70+ source files |

### Security *(High Impact)*
| Threat | Mitigation |
|--------|-----------|
| API key exposure | Read only inside server-side routes; `serverRuntimeConfig`; never in client bundle |
| Malicious input | `lib/sanitize.ts` strips HTML tags, script protocols, null bytes before any processing |
| Schema attacks | Zod validates all API inputs: types, lengths, enum values, array sizes |
| Excessive requests | Sliding-window rate limiter (20 req/min per IP) in `lib/rateLimiter.ts` |
| Clickjacking | `X-Frame-Options: DENY` + `frame-ancestors 'none'` in CSP |
| XSS | Strict CSP; no `dangerouslySetInnerHTML`; no `eval`; no raw HTML rendering |
| Protocol downgrade | `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` (HSTS) |
| Interest tracking | `Permissions-Policy` disables camera, microphone, geolocation, interest-cohort |
| Data leakage | Generic error messages to client; detailed errors logged server-side only |

### Efficiency *(Medium Impact)*
| Optimisation | Detail |
|-------------|--------|
| Debounced autosave | 600 ms debounce in `JournalForm` via `useDebounce` hook |
| Memoised aggregations | `useMemo` for mood data points, trigger frequency, weekly summary in `useMoodHistory` |
| Lazy dynamic imports | `MoodChart` and `MindfulnessLibrary` loaded via `next/dynamic` (SSR=false) |
| Token budgets | `max_tokens: 1200` for analysis; `max_tokens: 600` for chat; last 7 moods / 10 turns only |
| Render optimisation | `React.memo` on list items; `useCallback` for all handlers passed as props |
| Chat history cap | `chatStorage` retains only last 50 messages, preventing unbounded localStorage growth |

### Testing *(Medium Impact)*
```
11 test files · 110+ test cases · 100% pass rate
────────────────────────────────────────────────
sanitize.test.ts         ·  HTML stripping, length caps, protocol removal
aiResponseParser.test.ts ·  Valid JSON, malformed JSON, fallback, riskLevel
aggregations.test.ts     ·  Average mood, streak logic, trigger frequency, weekly summary
rateLimiter.test.ts      ·  Allow under limit, block at limit, window reset
crisisDetector.test.ts   ·  All 13 crisis patterns, safe text, edge cases
storage.test.ts          ·  Profile CRUD, entry add/update/prepend, chat cap, draft
utils.test.ts            ·  cn() merging, generateId() uniqueness, formatTimestamp, daysUntil
useMoodHistory.test.ts   ·  Empty state, sorted data points, average mood, trigger frequency
JournalForm.test.tsx     ·  Submit validation, mood error, successful flow
MoodSelector.test.tsx    ·  Radio rendering, keyboard nav, onChange callback
SafetyBanner.test.tsx    ·  Renders helpline numbers, role=alert, dismissal
```
Run: `npm test`

### Accessibility *(WCAG 2.1 AA)*
- **Semantic HTML5**: `<header>`, `<main>`, `<nav>`, `<section>`, `<aside>`, `<footer>`
- **Keyboard-first controls**: Mood selector uses `<fieldset>` + `<input type="radio">`; tag selector uses `<input type="checkbox">` — fully operable without a mouse
- **ARIA**: `aria-live="polite"` on AI results; `aria-describedby` + `aria-invalid` on form fields; `aria-label` on all icon buttons; `aria-hidden` on decorative icons
- **Focus management**: Focus trap + Esc-to-close in mindfulness modal (`ExercisePlayer`); visible focus rings via `:focus-visible`
- **Motion safety**: `prefers-reduced-motion` media query disables all animations in `globals.css`
- **Colour contrast**: ≥ 4.5:1 for all text/background pairs (slate-800 on white, indigo-700 on indigo-100)
- **Skip link**: Visually hidden "Skip to main content" link in `layout.tsx`; visible on focus; targets `id="main-content"` on every page's `<main>` element
- **Unique landmark labels**: Desktop nav uses `aria-label="Main navigation"`, mobile nav uses `aria-label="Mobile navigation"` — no duplicate landmark names

### Problem Statement Alignment *(High Impact)*
- **Hyper-personalised AI**: every prompt includes exam type, days to exam, mood history — advice is never generic
- **Contextual trigger detection**: model identifies implied stressors (mock test failure, comparison with peers, parental pressure) beyond surface keywords
- **Layered crisis safety**: dual detection (regex + AI) → `SafetyBanner` → India-specific helplines (Tele-MANAS 14416, iCall 9152987821)
- **Adaptive mindfulness**: exercise generated fresh per entry, matched to the student's stated emotional state
- **Longitudinal insights**: mood trend chart + trigger heatmap aggregated across the full history
- **Empathetic design**: warm colour palette, non-clinical language, encouraging micro-copy throughout

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS (glassmorphism design) |
| AI — Analysis | Groq API · `llama-3.3-70b-versatile` |
| AI — Chat | Groq API · `llama-3.1-8b-instant` |
| AI Client | OpenAI SDK (Groq-compatible endpoint) |
| Charts | Recharts |
| Validation | Zod |
| Icons | lucide-react |
| Persistence | Browser localStorage (client-only) |
| Testing | Vitest + React Testing Library |
| Linting | ESLint (Next.js config) + Prettier |

---

## Folder Structure

```
mindbridge/
├── app/                         # Next.js 14 App Router
│   ├── api/analyze/route.ts     # AI analysis endpoint (server-side only)
│   ├── api/chat/route.ts        # Chat endpoint (server-side only)
│   ├── journal/page.tsx         # Main journal + reflection page
│   ├── insights/page.tsx        # Mood trends + trigger dashboard
│   ├── chat/page.tsx            # Conversational AI companion
│   ├── mindfulness/page.tsx     # Mindfulness exercise library
│   ├── onboarding/page.tsx      # First-run profile setup
│   ├── layout.tsx               # Root layout + security metadata
│   ├── error.tsx                # Error boundary
│   └── globals.css              # Tailwind base + reduced-motion overrides
├── components/
│   ├── chat/                    # ChatInterface, ChatMessage, ChatInput
│   ├── insights/                # MoodChart, TriggerFrequency, WeeklySummary
│   ├── journal/                 # JournalForm, MoodSelector, TagSelector, JournalHistory
│   ├── layout/                  # Navigation, Footer
│   ├── mindfulness/             # MindfulnessLibrary, ExercisePlayer
│   ├── onboarding/              # OnboardingForm
│   ├── reflection/              # ReflectionPanel, MindfulnessPlayer
│   └── ui/                      # Button, Card, Skeleton, SafetyBanner
├── hooks/                       # useJournal, useMoodHistory, useChat, useDebounce
├── lib/                         # Pure utility functions
│   ├── aggregations.ts          # Mood average, streak, trigger frequency
│   ├── aiResponseParser.ts      # JSON parse + Zod validation of AI output
│   ├── crisisDetector.ts        # Regex-based crisis language detection
│   ├── rateLimiter.ts           # Sliding-window in-memory rate limiter
│   ├── sanitize.ts              # Input stripping and length caps
│   ├── storage.ts               # Type-safe localStorage wrapper (SSR-safe)
│   └── utils.ts                 # cn(), generateId(), formatTimestamp(), daysUntil()
├── types/
│   ├── index.ts                 # All domain types (UserProfile, JournalEntry, etc.)
│   └── schemas.ts               # Zod schemas for API I/O validation
├── constants/
│   ├── exams.ts                 # Exam options, mood labels
│   ├── helplines.ts             # India crisis helplines
│   └── mindfulness.ts           # Fallback exercise library
└── __tests__/                   # Vitest + RTL — 10 files, 95+ tests
```

---

## Safety & Ethics

**MindBridge is a supportive companion, not a substitute for professional mental health care.**

- All journal and chat data is stored exclusively in the user's browser `localStorage`. Nothing is transmitted to or retained by MindBridge's server beyond the current request.
- When indicators of serious distress are detected, MindBridge displays a persistent `SafetyBanner` with India's national mental health helplines (Tele-MANAS: 14416 | iCall: 9152987821).
- The AI is explicitly instructed never to diagnose, never to prescribe, and to always recommend professional help for serious distress.
- Crisis detection operates at two independent layers (client regex + server override) to ensure no single point of failure can miss a genuine distress signal.

---

*Built with care for the mental well-being of every exam aspirant in India.*
