# NexusAI Agentic Workflow

## Overview
This agent orchestrates the full NexusAI build across all phases — scaffold, AI layer, agent engine, marketplace, and deployment.

## Trigger
User requests a build task (feature, module, fix, or deployment step).

## Workflow Phases

### Phase 1 — Project Scaffold
**Goal**: Initialize monorepo, DB schema, auth
```
Step 1: Create NestJS backend + Next.js frontend monorepo
Step 2: Set up Prisma schema (users, tools, chat_sessions, agents, workflows, subscriptions)
Step 3: Configure Redis (sessions + BullMQ queues)
Step 4: Implement JWT auth + OAuth (Google / GitHub)
```

### Phase 2 — Core AI Layer
**Goal**: Build the heart of NexusAI — multi-model AI routing + chat
```
Step 1: Create AIService with model router (Claude / OpenAI / Gemini)
Step 2: Implement ChatService with SSE streaming + Redis session memory
Step 3: Connect Pinecone Vector DB for RAG + semantic search
Step 4: Build prompt template system
```

### Phase 3 — Agent Engine
**Goal**: Workflow automation (Trigger → Steps → Output)
```
Step 1: Design WorkflowExecution engine
Step 2: Integrate BullMQ for queue-based processing
Step 3: Create AgentBuilder API (CRUD workflows)
Step 4: Implement multi-step execution with error handling + retries
```

### Phase 4 — Marketplace & Features
**Goal**: Tools listing, prompt library, strategy engine
```
Step 1: Tools listing API (JSON-based MVP → DB later)
Step 2: Prompt Library CRUD with categories
Step 3: Strategy/Analysis Engine (SWOT, BCG, Financial models)
Step 4: SEO-optimized tool detail pages (Next.js)
```

### Phase 5 — Billing & Deployment
**Goal**: Monetization + production deployment
```
Step 1: Stripe integration (Free / Pro / Enterprise plans)
Step 2: API usage tracking per user + billing meter
Step 3: Deploy frontend to Vercel
Step 4: Deploy backend to Railway/Render
Step 5: Set up Supabase/RDS PostgreSQL + S3 storage
```

## Agent Decision Logic
```
if task.type === "chat"       → load ai-engineer role + chat-streaming skill
if task.type === "module"     → load backend-engineer role + scaffold-module skill
if task.type === "schema"     → load backend-engineer role + schema-design skill
if task.type === "agent"      → load ai-engineer role + build-agent skill
if task.type === "billing"    → load backend-engineer role + stripe-billing skill
if task.type === "deploy"     → load devops-engineer role
if task.type === "ui"         → load frontend-engineer role
```

## Data Flow
```
User Input
  ↓
[Route Agent] — classify task type
  ↓
[Load Role + Skill]
  ↓
[Execute Step(s)]
  ↓
[Validate Output]
  ↓
[Return Result / Stream]
```
