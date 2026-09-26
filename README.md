# ⚖️ LexAI — AI-Powered Legal Intelligence Platform

> **Understand any legal document in seconds.**  
> Powered by Groq API · Built with React 18 + Vite + Tailwind CSS · Firebase Authentication

[![Tests](https://img.shields.io/badge/Tests-32%20passing-30d158?style=flat-square)](./src/utils/lexai.test.js)
[![Security](https://img.shields.io/badge/Security-Zero--Trust-6366f1?style=flat-square)](#-security-model)
[![Accessibility](https://img.shields.io/badge/WCAG-2.1%20AA-00f5ff?style=flat-square)](#-accessibility)
[![License](https://img.shields.io/badge/License-MIT-white?style=flat-square)](./LICENSE)

---

## 📑 Table of Contents

1. [Problem Statement](#1-problem-statement)
2. [Solution Overview](#2-solution-overview)
3. [Feature Breakdown](#3-feature-breakdown)
4. [Architecture](#4-architecture)
5. [Security Model](#5-security-model)
6. [Quick Start](#6-quick-start)
7. [Environment Configuration](#7-environment-configuration)
8. [Testing](#8-testing)
9. [Accessibility](#9-accessibility)
10. [Deployment](#10-deployment)
11. [Project Structure](#11-project-structure)

---

## 1. Problem Statement

Legal documents are dense, opaque, and deliberately complex. Most people sign contracts, leases, and agreements without fully understanding:

- What they are **agreeing to**
- What **risks** they are accepting
- What **obligations** they are taking on
- When **critical deadlines** apply

Traditional legal assistance costs $200–$600/hour and is slow. LexAI bridges this gap by making legal intelligence **instant, accessible, and free**.

---

## 2. Solution Overview

LexAI is a **five-tool legal intelligence platform** built around the Groq API (`openai/gpt-oss-120b`):

```
Upload Document  (PDF · DOCX · TXT — parsed entirely in the browser)
      │
      ├─► Risk Analysis      — Scores overall risk 0–100; flags each clause HIGH / MEDIUM / LOW
      ├─► Clause Simplifier  — Translates legalese into plain English + extracts key dates
      ├─► Document Compare   — AI diff with similarity score and per-change significance
      ├─► Smart Q&A          — Ask anything; AI answers with clause references + confidence score
      └─► Action Checklist   — Prioritised actions + lawyer questions + red-flag warnings
```

**Key design principles:**

| Principle | Implementation |
|-----------|----------------|
| **Accessible** | No sign-up required for all analysis tools; Google Sign-In optional |
| **Transparent** | Legal disclaimer appended to every AI output; never replaces professional advice |
| **Secure** | API key stays in `.env`, never committed; input sanitised and truncated to 12 000 chars |
| **Fast** | Three analyses fire in parallel via `Promise.allSettled`; independent loading state per feature |

---

## 3. Feature Breakdown

### 🛡️ Risk Analysis
- Scores overall document risk **0–100** with animated radial meter
- Categorises each risk: **HIGH / MEDIUM / LOW** severity
- Per-risk explanations with **actionable recommendations**
- Exact clause excerpts highlighted for quick scanning

### 📄 Clause Simplifier
- Converts legalese into **plain English**
- Classifies clauses: Obligations · Rights · Payments · Termination
- Extracts **key dates and deadlines** automatically
- Summarises your **rights** and **obligations** in bullet form

### 🔍 Document Comparison
- Side-by-side **AI diff** across two documents (PDF, DOCX, or TXT)
- Detects **added, removed, and modified** sections
- Similarity score with **significance rating** per change
- Clear recommendation: which document is more favourable

### 💬 Smart Q&A
- Chat interface — ask any plain-English question about a loaded document
- AI answers with **clause references** and a confidence score (0–100)
- Legal disclaimer automatically appended to every response

### ✅ Action Checklist
- Prioritised actions: **Immediate → Short-term → Long-term**
- **Lawyer questions** — pre-drafted to take to your attorney
- **Red flags** requiring urgent attention

---

## 4. Architecture

```
Browser (React 18 + Vite + Tailwind CSS)
    │
    ├─ AuthProvider          Firebase Google Auth (opt-in)
    ├─ useGrokAPI hook        Per-feature independent loading states
    ├─ grokService.js        Sanitised API calls · AbortController timeout · friendly errors
    └─ documentParser.js     PDF.js + Mammoth DOCX + native TXT
                 │
                 └──► Groq API (openai/gpt-oss-120b)
                       response_format: json_object enforced on every call
```

### Parallel Analysis

On the Analyze page, `analyzeRisk`, `simplifyClauses`, and `generateChecklist` fire **simultaneously** via `Promise.allSettled` — each through its own `useGrokAPI` hook instance with an independent loading state, so partial results are shown as they arrive.

### Data Flow

```
File drop / paste
      │
      ▼
documentParser.js  ──►  raw text  ──►  sanitiseText()  ──►  Groq prompt
                                          (12 000 char cap)
                                                │
                                                ▼
                                      JSON response (typed)
                                                │
                                                ▼
                                      React state ──► UI components
```

---

## 5. Security Model

| Threat | Mitigation |
|--------|------------|
| **API key exposure** | Stored in `.env` (git-ignored); injected at build time via Vite; never logged or proxied to a third party |
| **Prompt injection** | Document text truncated to 12 000 chars; `response_format: json_object` enforced on every call |
| **Oversized payloads** | `sanitiseText()` hard-caps input before it leaves the browser |
| **XSS** | React's virtual DOM escapes all user/AI output by default; no `dangerouslySetInnerHTML` usage |
| **Auth spoofing** | Firebase ID-token verification; Google OAuth 2.0 PKCE via popup |
| **Unhandled errors** | `friendlyError()` in `grokService.js` surfaces readable messages; raw API errors are never forwarded to the UI |
| **Privacy** | PDF.js parses files entirely client-side — raw file bytes are never transmitted to any server |

---

## 6. Quick Start

### Prerequisites

- **Node.js** 18+ (`node -v`)
- **npm** 9+ (`npm -v`)
- **Groq API key** — free from [console.groq.com](https://console.groq.com)
- **Firebase project** *(optional — only needed for Google Sign-In)*

### 1 — Clone & install

```bash
git clone https://github.com/your-username/lexai.git
cd lexai/Lex-ai
npm install
```

### 2 — Configure environment

```bash
cp .env.example .env
# Edit .env and add your VITE_GROQ_API_KEY
```

`.env` must contain:

```env
VITE_GROQ_API_KEY=gsk_your_groq_api_key_here
VITE_GROQ_API_URL=https://api.groq.com/openai/v1/chat/completions
VITE_GROQ_MODEL=openai/gpt-oss-120b
```

### 3 — Run tests

```bash
npm run test:run
```

All tests should pass before starting the dev server.

### 4 — Start dev server

```bash
npm run dev
# → http://localhost:5173
```

### Firebase Setup *(optional)*

1. Firebase Console → Authentication → Sign-in method → enable **Google**.
2. Add `localhost` to **Authorized domains**.
3. Update [`src/firebase.js`](./src/firebase.js) with your project's `firebaseConfig`.

Core analysis features work **without** Firebase — auth only gates the optional save/history feature.

---

## 7. Environment Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_GROQ_API_KEY` | ✅ Yes | — | Groq API key |
| `VITE_GROQ_API_URL` | No | `https://api.groq.com/openai/v1/chat/completions` | API endpoint |
| `VITE_GROQ_MODEL` | No | `openai/gpt-oss-120b` | Model identifier |

> ⚠️ **Never commit `.env` to version control.** The `.gitignore` already excludes it.

---

## 8. Testing

```bash
# Run all tests once (CI mode)
npm run test:run

# Interactive watch mode
npm test
```

### Test Coverage

| Module | Tests | What's covered |
|--------|-------|----------------|
| [`riskScorer.js`](./src/utils/riskScorer.js) | 18 | `severityToColor`, `severityToHex`, `scoreToColor`, `scoreToHex`, `scoreToLabel` — all branches + edge cases (null, out-of-range, case variants) |
| [`documentParser.js`](./src/utils/documentParser.js) helpers | 10 | `getFileMetadata` (word count, reading time, edge cases), `truncateForDisplay` (boundary, custom limit, ellipsis marker) |
| Edge cases | 4 | Negative scores, scores > 100, extra whitespace |

Tests use [Vitest](https://vitest.dev) with jsdom. No external services are called — the suite runs **fully offline**.

---

## 9. Accessibility

LexAI targets **WCAG 2.1 Level AA** compliance:

- **Skip navigation link** — keyboard users jump straight to main content
- **ARIA roles** — `navigation`, `main`, `menubar`, `menuitem` on all interactive regions
- **ARIA labels** — every icon-only button has an `aria-label`
- **Focus-visible outlines** — all interactive elements show a visible neon-indigo focus ring
- **Colour contrast** — all text/background pairs exceed the 4.5:1 minimum ratio
- **Loading announcements** — skeleton loaders carry `aria-label` for screen readers
- **Semantic HTML** — `<nav>`, `<main>`, `<ol>`, `<button>` used throughout; no ARIA overrides where native semantics suffice

---

## 10. Deployment

### Vercel / Netlify (recommended)

```bash
npm run build
# Outputs to dist/ — deploy as a static site
```

Set `VITE_GROQ_API_KEY` in the platform's environment-variable dashboard.

### Docker

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_GROQ_API_KEY
ENV VITE_GROQ_API_KEY=$VITE_GROQ_API_KEY
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
```

```bash
docker build --build-arg VITE_GROQ_API_KEY=your_key -t lexai .
docker run -p 8080:80 lexai
```

---

## 11. Project Structure

```
Lex-ai/
├── index.html                     # Vite entry HTML
├── vite.config.js                 # Vite + React plugin config
├── tailwind.config.js             # Tailwind design tokens
├── postcss.config.js
├── eslint.config.js
├── .env.example                   # Environment variable template
├── metadata.json                  # Machine-readable project metadata
│
├── src/
│   ├── App.jsx                    # Root router + AuthProvider
│   ├── main.jsx                   # React entry point + BrowserRouter
│   ├── firebase.js                # Firebase app initialisation
│   ├── index.css                  # Global styles (Tailwind base)
│   │
│   ├── components/
│   │   ├── analysis/
│   │   │   ├── RiskAnalysis.jsx       # Risk score meter + risk cards
│   │   │   ├── ClauseSummary.jsx      # Simplified clauses + key dates
│   │   │   ├── DocumentComparison.jsx # Diff view with change badges
│   │   │   ├── QASection.jsx          # Q&A chat interface
│   │   │   └── ActionChecklist.jsx    # Prioritised checklist
│   │   ├── dashboard/
│   │   │   └── AnalysisDashboard.jsx  # Tabbed results view
│   │   ├── layout/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── BackgroundOrbs.jsx
│   │   ├── ui/
│   │   │   ├── GlassCard.jsx
│   │   │   ├── NeonButton.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── RiskBadge.jsx
│   │   │   ├── Spinner.jsx
│   │   │   ├── SkeletonLoader.jsx
│   │   │   └── ApiKeySetup.jsx
│   │   └── upload/
│   │       ├── DocumentUpload.jsx     # react-dropzone wrapper
│   │       └── TextInput.jsx          # Paste plain text
│   │
│   ├── context/
│   │   └── AuthContext.jsx            # Firebase auth provider + useAuth hook
│   │
│   ├── hooks/
│   │   ├── useAuthContext.jsx         # Auth consumer hook
│   │   ├── useDocumentParser.js       # File → text extraction state machine
│   │   └── useGrokAPI.js              # In-flight counter + per-instance loading state
│   │
│   ├── pages/
│   │   ├── Home.jsx                   # Landing page with features and stats
│   │   ├── Analyze.jsx                # Main analysis page (parallel API calls)
│   │   ├── Compare.jsx                # Document diff page
│   │   └── QA.jsx                     # Q&A chat page
│   │
│   ├── services/
│   │   └── grokService.js             # Sanitised, typed Groq API functions
│   │
│   └── utils/
│       ├── documentParser.js          # PDF.js + Mammoth + TXT parsing
│       ├── riskScorer.js              # Pure scoring / colour utility functions
│       ├── riskScorer.test.js         # riskScorer unit tests (Vitest)
│       └── lexai.test.js              # documentParser + riskScorer integration tests
│
└── public/                            # Static assets
```

---

## 📜 Legal Disclaimer

LexAI provides **informational assistance only** and is not a substitute for professional legal advice. Always consult a qualified attorney for decisions with legal consequences.

---

*LexAI · MIT License*
