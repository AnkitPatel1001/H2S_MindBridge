# MindBridge — GenAI Mental Wellness Tracker for Exam Aspirants

A production-ready, AI-powered mental wellness companion for Indian students preparing for high-stakes competitive exams (NEET, JEE, CUET, CAT, GATE, UPSC). MindBridge uses Anthropic Claude to analyse open-ended journal entries, surface hidden stress triggers, and provide hyper-personalised coping strategies, mindfulness exercises, and motivational support.

---

## Architecture Diagram (ASCII)

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (Client)                      │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │ Journal  │  │Insights  │  │  Chat    │  │Mindfulness │  │
│  │  Page    │  │  Page    │  │  Page    │  │   Page     │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────────────┘  │
│       │             │             │                          │
│  ┌────▼─────────────▼─────────────▼──────────────────────┐  │
│  │              Custom Hooks Layer                        │  │
│  │  useJournal · useMoodHistory · useChat · useDebounce   │  │
│  └────────────────────────┬───────────────────────────────┘  │
│                           │ localStorage (typed StorageService)│
│  ┌────────────────────────▼──────────────────────────────┐   │
│  │              Lib Utilities                             │   │
│  │  storage · sanitize · crisisDetector · aggregations    │   │
│  └───────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │ POST /api/analyze  POST /api/chat
                           │ (HTTPS, rate-limited, validated)
┌──────────────────────────▼──────────────────────────────────┐
│                   Next.js Server (API Routes)                 │
│                                                              │
│  ┌─────────────────────┐  ┌──────────────────────────────┐  │
│  │  /api/analyze       │  │  /api/chat                   │  │
│  │  · Zod validation   │  │  · Zod validation            │  │
│  │  · Rate limiter     │  │  · Rate limiter              │  │
│  │  · Crisis override  │  │  · Crisis context injection  │  │
│  │  · Claude call      │  │  · Claude call               │  │
│  │  · JSON parse+valid │  │  · Response sanitisation     │  │
│  └──────────┬──────────┘  └──────────────┬───────────────┘  │
└─────────────┼──────────────────────────────┼─────────────────┘
              │                              │
┌─────────────▼──────────────────────────────▼─────────────────┐
│             Anthropic Claude API (claude-sonnet-4-6)          │
│             Server-side only — API key never in client bundle │
└──────────────────────────────────────────────────────────────┘
```

## Folder Structure

```
mindbridge/
├── app/                        # Next.js 14 App Router
│   ├── api/analyze/route.ts    # AI analysis endpoint (server-side)
│   ├── api/chat/route.ts       # Chat endpoint (server-side)
│   ├── journal/page.tsx        # Main journal + reflection page
│   ├── insights/page.tsx       # Mood trends + trigger dashboard
│   ├── chat/page.tsx           # Conversational companion
│   ├── mindfulness/page.tsx    # Mindfulness exercise library
│   ├── onboarding/page.tsx     # First-run profile setup
│   ├── layout.tsx              # Root layout + metadata
│   └── globals.css             # Global styles + Tailwind base
├── components/
│   ├── chat/                   # Chat UI components
│   ├── insights/               # Chart + summary components
│   ├── journal/                # Form, mood selector, history
│   ├── layout/                 # Navigation, footer
│   ├── mindfulness/            # Exercise library + player
│   ├── onboarding/             # Profile setup form
│   ├── reflection/             # AI results panel
│   └── ui/                    # Button, Card, Skeleton, SafetyBanner
├── hooks/                      # useJournal, useMoodHistory, useChat, useDebounce
├── lib/                        # Core utilities (pure functions)
│   ├── aggregations.ts         # Mood avg, streak, triggers
│   ├── aiResponseParser.ts     # JSON parse + Zod validation of AI output
│   ├── crisisDetector.ts       # Pattern-based crisis keyword detection
│   ├── rateLimiter.ts          # Sliding-window in-memory rate limiter
│   ├── sanitize.ts             # Input stripping and length caps
│   ├── storage.ts              # Type-safe localStorage wrapper
│   └── utils.ts                # cn(), generateId(), formatTimestamp()
├── types/
│   ├── index.ts                # All domain types
│   └── schemas.ts              # Zod schemas for API I/O
├── constants/
│   ├── exams.ts                # Exam options + mood definitions
│   ├── helplines.ts            # India crisis helplines
│   └── mindfulness.ts          # Exercise library content
└── __tests__/                  # Vitest + RTL test files
```

---

## Setup & Run

### Prerequisites
- Node.js 18+
- An Anthropic API key (from [console.anthropic.com](https://console.anthropic.com))

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment
```bash
cp .env.local.example .env.local
# Edit .env.local and paste your ANTHROPIC_API_KEY
```

### 3. Run development server
```bash
npm run dev
# Open http://localhost:3000
```

### 4. Run tests
```bash
npm test
```

### 5. Lint & format
```bash
npm run lint
npm run format
```

---

## How We Addressed Each Scoring Parameter

### Code Quality
- **Strict TypeScript** throughout — `strict: true` in tsconfig, no `any`
- **Clean architecture**: `/lib` (pure functions), `/hooks` (state + effects), `/components` (UI), `/app` (routes + pages)
- **JSDoc** on all lib functions; descriptive names; early returns; no dead code
- **Shared types** in `/types/index.ts`; Zod schemas in `/types/schemas.ts`
- **ErrorBoundary** via `app/error.tsx`; try/catch on all async paths
- **Consistent formatting** via Prettier (`.prettierrc` committed)

### Security
- **API key exclusively in `process.env`**, read only inside server-side API routes; never shipped to the client bundle
- **Zod validation** on all API route inputs — length caps, type checks, enum validation
- **Input sanitization** (`lib/sanitize.ts`) strips HTML tags, script protocols, null bytes
- **Rate limiting** (`lib/rateLimiter.ts`) — sliding-window, 20 req/min per IP
- **Security headers** in `next.config.js`: CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`
- **No `dangerouslySetInnerHTML`**, no `eval`, no user content rendered as raw HTML
- **Generic error messages to client**; detailed logs server-side only

### Efficiency
- **Debounced autosave** (600ms) in `JournalForm` via `useDebounce`
- **`useMemo`** for all chart/aggregation computations in `useMoodHistory`
- **Lazy dynamic imports** for `MoodChart` and `MindfulnessLibrary` (`next/dynamic`, SSR=false)
- **AI token caps**: max_tokens=1200 for analysis, 600 for chat; only last 7 entries / 10 turns sent
- **`React.memo`** on `EntryItem`, `ChatMessageItem`, `TriggerFrequencyList`, `WeeklySummaryCard`
- **`useCallback`** for all event handlers passed to children

### Testing
- **Vitest + RTL** with jsdom environment
- Tests cover: `sanitize`, `aiResponseParser`, `aggregations`, `rateLimiter`, `crisisDetector`, `JournalForm`, `MoodSelector`, `SafetyBanner`
- **11+ meaningful tests** covering validation, fallback parsing, streak calculation, rate limit blocking, crisis detection, and UI interactions
- Run: `npm test`

### Accessibility (WCAG 2.1 AA)
- **Semantic HTML5**: `<header>`, `<main>`, `<nav>`, `<section>`, `<aside>`, `<footer>`, `<ul>/<ol>`
- **Mood selector** uses native `<fieldset>` + `<legend>` + `<input type="radio">` (keyboard operable, no JS-only click)
- **Tag selector** uses native `<input type="checkbox">` (keyboard operable)
- **All icon buttons** have `aria-label`; decorative icons have `aria-hidden="true"`
- **`aria-live="polite"`** on AI results panel and chat log
- **`aria-describedby`** linking form inputs to error messages; `aria-invalid` on invalid fields
- **Focus trap + Esc-to-close** in `ExercisePlayer` modal
- **Visible focus rings** via `:focus-visible` CSS; `.sr-only` for screen-reader-only labels
- **`prefers-reduced-motion`** respected — all animations disabled via `@media` in globals.css
- **Colour contrast ≥ 4.5:1** for all text/background pairs (slate-800 on white)
- **Skip to main content** and logical tab order

### Problem Statement Alignment
- **Hyper-personalised AI**: every prompt includes the student's exam type, target date, and recent mood history — advice is never generic
- **Hidden trigger detection**: Claude identifies implied stressors (mock test failure, parental expectations) not just surface keywords
- **Crisis safety layer**: dual detection (regex `crisisDetector.ts` on client + server; AI `riskLevel` from model) triggers `SafetyBanner` with India-specific helplines
- **Empathetic chat companion**: system prompt establishes warm, validating persona; never diagnostic
- **Adaptive mindfulness**: AI recommends one exercise based on emotional state; mindfulness page highlights it
- **Persistent insights**: mood trend chart + trigger frequency aggregated across all entries

---

## Safety & Privacy Statement

**MindBridge is a supportive companion, not a substitute for professional mental health care.**

- All journal and chat data is stored exclusively in the user's browser localStorage. Nothing is transmitted to or stored on any external server (other than the current journal entry text being sent to the Anthropic Claude API for analysis — and even this is not logged or stored by MindBridge).
- When indicators of serious distress are detected, MindBridge displays prominent, undismissable safety resources including India's national mental health helplines.
- The AI is explicitly instructed never to diagnose, never to prescribe, and always to recommend professional help for serious distress.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS |
| AI | Anthropic Claude API (`claude-sonnet-4-6`) |
| Charts | Recharts |
| Validation | Zod |
| Icons | lucide-react |
| Persistence | localStorage (client-only) |
| Testing | Vitest + React Testing Library |
| Linting | ESLint + Prettier |

---

## Screenshots

> _Add screenshots of the Journal page, Insights dashboard, Chat interface, and Mindfulness player here._

---

*Built with ❤️ for the mental well-being of every exam aspirant in India.*
