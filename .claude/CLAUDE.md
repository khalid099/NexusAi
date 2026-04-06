# NexusAI — Claude Code Configuration

## Project Overview
NexusAI is a full-stack AI tools marketplace + agent platform + chat system + workflow automation hub (hybrid SaaS + AI infra).

## Tech Stack
- **Frontend**: Next.js (App Router) + TypeScript + MUI + Redux Toolkit
- **Backend**: NestJS (modular, type-safe, enterprise-ready)
- **Database**: PostgreSQL (primary) + Redis (cache/queue) + Pinecone/Weaviate (Vector DB)
- **Auth**: JWT + OAuth (Google, GitHub)
- **Payments**: Stripe
- **Deployment**: Vercel (FE) + Railway/Render (BE) + Supabase/RDS (DB) + S3 (Storage)

## Design Reference
- **HTML Prototype**: `NexusAI-Dashboard-Updated.html` — primary source of truth for UI
- **Live Site**: https://nexusai-db.netlify.app/
- Pages: Landing (hero, features, pricing) + App (Chat Hub, Marketplace, Agents)

## Backend Module Structure
```
src/
 ├── auth/
 ├── users/
 ├── ai/
 ├── agents/
 ├── tools/
 ├── prompts/
 ├── billing/
 ├── analytics/
```

## Agentic Flow — Multi-Agent System
```
User Request
   ↓
[Planner Agent] — analyze, plan, delegate
   ↓         ↓
[Frontend    [Backend
 Agent]       Agent]
   ↓               ↓
ui-clone       scaffold-module
component-     prisma-schema
builder        api-endpoints
state-mgmt     bullmq-queue
   ↓               ↓
Next.js        NestJS
Components     Modules
   ↓               ↓
         [AI Processing]
         AIService → Claude/GPT/Gemini
         SSE Stream → User
```

## Agent Routing
```
if task === "analyze" or "plan"    → Planner Agent
if task === "UI" or "component"    → Frontend Agent
if task === "API" or "DB" or "module" → Backend Agent
if task === "AI" or "streaming"    → Backend Agent + ai-rules
if task === "auth" or "security"   → Backend Agent + security-rules
```

## Directory Conventions
- `agents/` — Claude Code agent definitions (planner, frontend, backend, chat, workflow)
- `skills/` — Reusable skill prompts, each owned by a specific agent
- `rules/` — Project coding rules, loaded by agents before code generation

## Active Agents
Load from `.claude/agents/`:
- `planner-agent.md` — Full orchestrator: analyze HTML/URL → plan → delegate
- `frontend-agent.md` — Next.js/MUI/Redux work, owns FE skills
- `backend-agent.md` — NestJS/Prisma/BullMQ work, owns BE skills
- `chat-agent.md` — Multi-model chat with SSE streaming + memory
- `workflow-agent.md` — BullMQ workflow execution engine

## Active Skills (Agent-Owned)
### Frontend Agent Skills (`.claude/skills/`):
- `ui-clone.md` — HTML prototype → Next.js component conversion
- `component-builder.md` — Reusable MUI component creation
- `state-management.md` — RTK Query + Redux slice + custom hook

### Backend Agent Skills (`.claude/skills/`):
- `scaffold-module.md` — Full NestJS module generation
- `schema-design.md` — Prisma schema design + migrations
- `chat-streaming.md` — SSE chat with session memory (Redis)
- `stripe-billing.md` — Stripe plans + usage tracking
- `build-agent.md` — BullMQ agentic workflow creation

## Active Rules (Always Load)
Load from `.claude/rules/` based on task:
- `frontend-rules.md` → any frontend/UI task
- `backend-rules.md` → any backend/API/DB task
- `ai-rules.md` → any AI, model routing, or agent execution task
- `security-rules.md` → always load for auth, sensitive data, or deployment tasks

## HOW TO HANDLE EVERY USER REQUEST — MANDATORY WORKFLOW

When the user gives ANY task (UI, API, feature, fix, etc.), you MUST follow this exact flow every time:

```
STEP 1 — ROUTE the task:
  - UI / component / page / design    → Frontend Agent
  - API / DB / module / queue         → Backend Agent
  - AI / streaming / agents           → Backend Agent + ai-rules
  - auth / security                   → Backend Agent + security-rules
  - analyze / plan / full feature     → Planner Agent first, then delegate

STEP 2 — LOAD rules (no exceptions):
  - Frontend task  → read rules/frontend-rules.md + rules/security-rules.md
  - Backend task   → read rules/backend-rules.md + rules/security-rules.md
  - AI task        → also read rules/ai-rules.md

STEP 3 — READ the HTML prototype:
  - File: NexusAI-Dashboard-Updated.html
  - Extract the relevant section for the task
  - Match colors, fonts, spacing EXACTLY from CSS variables in prototype
  - CSS vars: --bg:#F4F2EE, --accent:#C8622A, --text:#1C1A16, --text2:#5A5750
  - Fonts: 'Syne' for headings, 'Instrument Sans' for body

STEP 4 — EXECUTE using the correct skill:
  Frontend:
    - UI/page → ui-clone skill (HTML → MUI sx prop, NO CSS files)
    - New component → component-builder skill
    - State/API → state-management skill (RTK Query)
  Backend:
    - New feature → scaffold-module skill
    - DB model → prisma-schema skill
    - Async job → bullmq-queue skill

STEP 5 — VALIDATE before finishing:
  Frontend: no hardcoded hex colors, no CSS files, no raw fetch(), no DOM access
  Backend: no business logic in controllers, no raw SQL, all inputs validated with class-validator
  Both: no `any` type, no console.log, no hardcoded secrets
```

## Core Coding Principles
- TypeScript strict mode everywhere — no `any`
- NestJS modules: self-contained (service + controller + module + DTOs)
- All DB via Prisma — no raw SQL in application code
- All AI calls via `AIService` model router — never call providers directly
- BullMQ + Redis for all async/long-running tasks
- SSE for all chat streaming
- Never expose API keys — always use `ConfigService`
- JWT guard on all endpoints by default (`@Public()` to opt-out)

## Frontend Styling — STRICT RULES
- Use MUI `Box`, `Typography`, `Stack`, `Grid`, `Button`, `Paper` — NOT plain HTML divs
- Style ONLY via `sx` prop — NO separate CSS/module files
- Colors from MUI theme — define custom palette matching HTML prototype vars
- Responsive via MUI breakpoints: `xs`, `sm`, `md`, `lg`
- Fonts: import Syne + Instrument Sans in theme, apply via `fontFamily` token
