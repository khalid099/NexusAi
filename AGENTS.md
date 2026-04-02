# NexusAI — Codex Configuration

## Project Overview
NexusAI is a full-stack AI tools marketplace + agent platform + chat system + workflow automation hub (hybrid SaaS + AI infra).

## Tech Stack
- **Frontend**: Next.js (App Router) + TypeScript + MUI + Redux Toolkit
- **Backend**: NestJS (modular, type-safe, enterprise-ready)
- **Database**: PostgreSQL (primary) + Redis (cache/queue) + Pinecone/Weaviate (Vector DB)
- **Auth**: JWT + OAuth (Google, GitHub)
- **Payments**: Stripe
- **Deployment**: Vercel (FE) + Railway/Render (BE) + Supabase/RDS (DB) + S3 (Storage)

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

## Agentic Workflow
```
Trigger (User Input)
   ↓
Step 1: Fetch / Validate Data
   ↓
Step 2: AI Processing (Model Router → Codex / GPT / Gemini)
   ↓
Step 3: Generate Output
   ↓
Return Result (Stream / JSON)
```

## Core Coding Rules
- Always use TypeScript with strict mode
- NestJS modules must be self-contained (service + controller + module file)
- Use Prisma ORM for all DB operations
- All AI calls go through the `AIService` model router — never call OpenAI/Codex directly from controllers
- Use BullMQ + Redis for all async/queue-based agent tasks
- Stream chat responses via SSE (Server-Sent Events)
- Never expose raw API keys — use ConfigService / environment variables
- All endpoints require JWT guard unless explicitly marked public
- Write unit tests for services, e2e tests for critical flows

## Directory Conventions
- `agents/` — agentic workflow definitions and execution engine
- `skills/` — reusable Codex skill prompts for common dev tasks
- `roles/` — role-based personas Codex should adopt per task context

## Active Roles
Load the appropriate role from `.Codex/roles/` based on task:
- `backend-engineer.md` — NestJS/Prisma/API work
- `frontend-engineer.md` — Next.js/React/MUI work
- `ai-engineer.md` — AI service, model routing, RAG, agents
- `devops-engineer.md` — deployment, infra, CI/CD
- `product-architect.md` — system design, module planning

## Active Skills
Load from `.Codex/skills/` for targeted tasks:
- `scaffold-module.md` — generate a full NestJS module
- `build-agent.md` — create an agentic workflow
- `schema-design.md` — design Prisma schema
- `stripe-billing.md` — implement Stripe plans + usage tracking
- `chat-streaming.md` — implement SSE chat with session memory
