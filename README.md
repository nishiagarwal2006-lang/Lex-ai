# LexAI — AI-Powered Legal Intelligence Platform

> **Understand any legal document in seconds.**
> Powered by Grok-3 AI · Built with React + Vite · Firebase Authentication

[![Tests](https://img.shields.io/badge/tests-passing-30d158?style=flat-square)](./src/utils/lexai.test.js)
[![Security](https://img.shields.io/badge/security-zero--trust-6366f1?style=flat-square)](#-security-model)
[![Accessibility](https://img.shields.io/badge/a11y-WCAG%202.1%20AA-00f5ff?style=flat-square)](#-accessibility)
[![License](https://img.shields.io/badge/license-MIT-white?style=flat-square)](./LICENSE)

---

## 📑 Table of Contents

1. [Problem Statement](#-problem-statement)
2. [Solution Overview](#-solution-overview)
3. [Feature Breakdown](#-feature-breakdown)
4. [Architecture](#-architecture)
5. [Security Model](#-security-model)
6. [Quick Start](#-quick-start)
7. [Environment Configuration](#-environment-configuration)
8. [Testing](#-testing)
9. [Accessibility](#-accessibility)
10. [Deployment](#-deployment)

---

## 🎯 Problem Statement

Legal documents are dense, opaque, and deliberately complex. Most people sign contracts, leases, and agreements without fully understanding:

- What they are **agreeing to**
- What **risks** they are accepting
- What **obligations** they are taking on
- When **critical deadlines** apply

Traditional legal assistance is expensive and time-consuming. LexAI bridges this gap by making legal intelligence **instant, accessible, and free**.

---

## 💡 Solution Overview

LexAI is a **four-tool legal intelligence platform** built around the xAI Grok-3 API:

`
Upload Document
    │
    ├─► Risk Analysis      — Identifies hidden liabilities & scores risk 0–100
    ├─► Clause Simplifier  — Translates legalese into plain English
    ├─► Document Compare   — AI-powered diff with change significance scoring
    └─► Smart Q&A          — Ask anything, get cited answers in seconds
`

**Key Design Principles:**

| Principle | Implementation |
|-----------|----------------|
| **Accessible** | No sign-up required to analyse documents; Google Sign-In optional for future history features |
| **Transparent** | AI disclaimers on every output; never replaces professional advice |
| **Secure** | API key never logged or transmitted beyond xAI; input sanitised and truncated |
| **Fast** | Three analyses fire in parallel via Promise.allSettled; independent loading states per feature |

---

## ⚡ Feature Breakdown

### 1. 🛡️ Risk Analysis
- Scores overall document risk **0–100** with animated radial meter
- Categorises each risk: **HIGH / MEDIUM / LOW** severity
- Per-risk explanations and **actionable recommendations**
- Exact clause excerpts highlighted for quick scanning

### 2. 📄 Clause Simplifier
- Converts legalese into **plain English**
- Classifies clauses: Obligations · Rights · Payments · Termination
- Extracts **key dates and deadlines** automatically
- Summarises your **rights** and **obligations** in bullet form

### 3. 🔍 Document Comparison
- Side-by-side **AI diff** across two documents (PDF, DOCX, or TXT)
- Detects **added, removed, and modified** sections
- Similarity score with **significance rating** per change
- Clear recommendation: which document is more favourable

### 4. 💬 Smart Q&A
- Chat interface — ask any plain-English question
- AI answers with **clause references** and confidence score
- Suggested starter questions for common legal concerns
- Legal disclaimer automatically appended to every response

### 5. ✅ Action Checklist
- Prioritised actions: **Immediate → Short-term → Long-term**
- **Lawyer questions** — pre-drafted to take to your attorney
- **Red flags** requiring urgent attention

---

## 🏗️ Architecture

\\\
Browser (React 18 + Vite + Tailwind CSS)
    │
    ├─ AuthProvider (Firebase Google Auth)
    ├─ useGrokAPI hook (per-feature independent loading states)
    ├─ grokService (sanitised API calls, AbortController timeout, retry logic)
    └─ documentParser (PDF.js + Mammoth DOCX + native TXT)
                 │
                 └──► xAI Grok-3 API
                       (response_format: json_object enforced)
\\\

### Parallel Analysis
All three Analyze-page requests (nalyzeRisk, simplifyClauses, generateChecklist)
fire **simultaneously** via Promise.allSettled — each with its own hook instance
and independent loading state so partial results are shown as they arrive.

---

## 🔒 Security Model

| Threat | Mitigation |
|--------|-----------|
| **API key exposure** | Stored in .env (git-ignored); injected at build time via Vite; never logged or proxied to a third party |
| **Prompt injection** | Document text is truncated to 12 000 chars; esponse_format: json_object enforced on every call |
| **XSS** | React's virtual DOM escapes all user/AI output by default; no dangerouslySetInnerHTML usage |
| **Auth spoofing** | Firebase ID-token verification flow; Google OAuth 2.0 PKCE via popup |
| **Unhandled errors** | All service errors surface a user-readable message; raw API errors are never forwarded to the UI |

---

## 🚀 Quick Start

### Prerequisites

- Node.js **18+** (
ode -v)
- npm **9+** (
pm -v)
- Grok API key from [console.x.ai](https://console.x.ai)

### 1 — Clone & install

\\\ash
git clone https://github.com/your-username/lexai.git
cd lexai/Lex-ai
npm install
\\\

### 2 — Configure environment

\\\ash
cp .env.example .env
\\\

Edit .env:

\\\env
VITE_GROK_API_KEY=your_grok_api_key_here
VITE_GROK_API_URL=https://api.x.ai/v1/chat/completions
VITE_GROK_MODEL=grok-3-latest
\\\

### 3 — Start dev server

\\\ash
npm run dev
# → http://localhost:5173
\\\

---

## 🌍 Environment Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| VITE_GROK_API_KEY | ✅ Yes | — | xAI API key |
| VITE_GROK_API_URL | No | https://api.x.ai/v1/chat/completions | API endpoint |
| VITE_GROK_MODEL | No | grok-3-latest | Model identifier |

> ⚠️ **Never commit .env to version control.**
> The .gitignore already excludes it.

---

## 🧪 Testing

\\\ash
# Run all tests once
npm run test:run

# Watch mode (interactive)
npm test
\\\

### Test Coverage

| Module | Tests | Coverage |
|--------|-------|----------|
| iskScorer.js | 18 | All public functions + edge cases |
| documentParser helpers | 10 | getFileMetadata, 	runcateForDisplay |
| Edge cases | 4 | Boundary values, null/undefined inputs |

Tests use [Vitest](https://vitest.dev) with jsdom environment.
No external services are called during testing — the test suite runs fully offline.

---

## ♿ Accessibility

LexAI targets **WCAG 2.1 Level AA** compliance:

- **Skip navigation link** — keyboard users jump straight to content
- **ARIA roles** — 
avigation, main, menubar, menuitem on all interactive regions
- **ARIA labels** — every icon-only button has an ria-label
- **Focus-visible outlines** — all interactive elements show a visible neon-indigo focus ring
- **Colour contrast** — all text/background pairs exceed 4.5:1 ratio
- **Loading announcements** — skeleton loaders use ria-label for screen readers
- **No ARIA violations** — semantic HTML elements used where possible (<nav>, <main>, <ol>, <button>)

---

## 🚢 Deployment

### Vercel / Netlify (recommended)

\\\ash
npm run build
# Outputs to dist/ — deploy as a static site
\\\

Set VITE_GROK_API_KEY in the platform's environment-variable dashboard.

### Docker

\\\dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_GROK_API_KEY
ENV VITE_GROK_API_KEY=\
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
\\\

\\\ash
docker build --build-arg VITE_GROK_API_KEY=your_key -t lexai .
docker run -p 8080:80 lexai
\\\

---

## 📁 Project Structure

\\\
src/
├── components/
│   ├── analysis/       # RiskAnalysis, ClauseSummary, QASection, ActionChecklist, DocumentComparison
│   ├── dashboard/      # AnalysisDashboard (tabbed results view)
│   ├── layout/         # Navbar, Footer, BackgroundOrbs
│   ├── ui/             # GlassCard, NeonButton, Badge, RiskBadge, Spinner, SkeletonLoader, ApiKeySetup
│   └── upload/         # DocumentUpload, TextInput
├── context/
│   └── AuthContext.jsx # Firebase auth provider + useAuth hook
├── hooks/
│   ├── useDocumentParser.js  # File → text extraction state
│   └── useGrokAPI.js         # In-flight counter, per-instance loading state
├── pages/
│   ├── Home.jsx        # Landing page with features and stats
│   ├── Analyze.jsx     # Main analysis page (parallel API calls)
│   ├── Compare.jsx     # Document diff page
│   └── QA.jsx          # Q&A chat page
├── services/
│   └── grokService.js  # Sanitised, typed Grok API functions
├── utils/
│   ├── documentParser.js     # PDF.js + Mammoth + TXT parsing
│   ├── riskScorer.js         # Pure scoring/colour utility functions
│   └── lexai.test.js         # Comprehensive test suite (Vitest)
├── firebase.js         # Firebase app initialisation
├── App.jsx             # Root router + AuthProvider
└── main.jsx            # React entry point + BrowserRouter
\\\

---

## 📜 Legal Disclaimer

LexAI provides **informational assistance only** and is not a substitute for
professional legal advice. Always consult a qualified attorney for decisions
with legal consequences.

---

*LexAI · Built for the xAI Hackathon · MIT License*
