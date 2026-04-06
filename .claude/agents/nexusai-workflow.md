# NexusAI Agentic Workflow — Master Flow

## Overview
Multi-agent orchestration system. Planner Agent analysis aur delegation karta hai, Frontend/Backend agents specialized tasks execute karte hain, AI layer sab processing handle karta hai.

## Agent Hierarchy
```
┌─────────────────────────────────┐
│         PLANNER AGENT           │
│  (Analyze → Plan → Delegate)    │
└────────────┬────────────────────┘
             │
    ┌────────┴─────────┐
    ▼                  ▼
┌──────────┐    ┌──────────────┐
│ FRONTEND │    │   BACKEND    │
│  AGENT   │    │    AGENT     │
├──────────┤    ├──────────────┤
│ui-clone  │    │scaffold-mod  │
│component │    │prisma-schema │
│state-mgmt│    │api-endpoints │
└──────────┘    │bullmq-queue  │
                └──────┬───────┘
                       │
              ┌────────┴────────┐
              ▼                 ▼
        ┌──────────┐    ┌──────────────┐
        │  CHAT    │    │  WORKFLOW    │
        │  AGENT   │    │    AGENT     │
        └──────────┘    └──────────────┘
```

## Full Execution Flow

### Phase 1 — Intake & Analysis (Planner Agent)
```
User Request
   ↓
Planner Agent loads:
  - NexusAI-Dashboard-Updated.html (design reference)
  - https://nexusai-db.netlify.app/ (live site)
  - rules/frontend-rules.md
  - rules/backend-rules.md
  - rules/security-rules.md
   ↓
Analyzes: what exists vs what's needed
   ↓
Produces: Sprint Plan (tasks + agent assignments + skill assignments)
```

### Phase 2 — Frontend Execution (Frontend Agent)
```
Receives: UI task from Planner
   ↓
Loads: rules/frontend-rules.md
   ↓
Selects skill:
  HTML section → ui-clone skill
  New component → component-builder skill
  API wiring → state-management skill
   ↓
Generates: Next.js TypeScript component
   ↓
Output: app/components/{category}/{ComponentName}.tsx
```

### Phase 3 — Backend Execution (Backend Agent)
```
Receives: API/DB task from Planner
   ↓
Loads: rules/backend-rules.md + rules/security-rules.md
   ↓
Selects skill:
  New feature → scaffold-module skill
  DB design → prisma-schema skill
  Endpoints → api-endpoints skill
  Async job → bullmq-queue skill
   ↓
Generates: NestJS module + Prisma schema + DTOs
   ↓
Output: src/{module}/ + prisma/schema.prisma
```

### Phase 4 — AI Processing Layer
```
Any AI request routes through AIService:
   ↓
Model Router:
  code/reasoning → claude-opus-4-6
  chat/balanced → claude-sonnet-4-6
  fast/cheap → claude-haiku-4-5
  fallback → gpt-4o
   ↓
If chat: stream via SSE (Chat Agent)
If background: queue via BullMQ (Workflow Agent)
   ↓
Response: { stream | job_id + webhook }
```

## Build Phases

### Phase 1 — Foundation
```
Backend Agent:
  scaffold-module: auth, users
  prisma-schema: User, Session, Subscription
Frontend Agent:
  ui-clone: Navbar, Hero, Landing page
  component-builder: AuthModal, PricingCard
```

### Phase 2 — Core AI Layer
```
Backend Agent:
  scaffold-module: ai (AIService + model router)
  scaffold-module: chat (SSE streaming)
  bullmq-queue: ai-processing queue
Frontend Agent:
  ui-clone: ChatHub (#chat-view)
  state-management: chatApi + chatSlice
```

### Phase 3 — Agent Engine
```
Backend Agent:
  scaffold-module: agents
  prisma-schema: Agent, Workflow, WorkflowStep, WorkflowExecution
  bullmq-queue: agent-execution queue
Frontend Agent:
  ui-clone: AgentsView (#agents-view)
  ui-clone: AgentBuilderModal (#agent-flow-overlay)
  ui-clone: ComputerAgentPanel (#computer-agent-panel)
```

### Phase 4 — Marketplace
```
Backend Agent:
  scaffold-module: tools, prompts
  prisma-schema: Tool, Prompt, Category
  api-endpoints: GET /tools, GET /tools/:id, search
Frontend Agent:
  ui-clone: MarketplaceGrid (#marketplace-view)
  component-builder: ToolCard, ModelCard
  state-management: toolsApi
```

### Phase 5 — Billing & Deployment
```
Backend Agent:
  scaffold-module: billing
  stripe-billing skill: plans + usage metering
Frontend Agent:
  component-builder: PricingCard, UsageMeter
  state-management: billingApi
DevOps (manual):
  Deploy FE → Vercel
  Deploy BE → Railway/Render
  DB → Supabase/RDS
  Storage → S3
```

## Agent Decision Matrix
| Task Type | Agent | Rule File | Skill |
|---|---|---|---|
| UI component | Frontend | frontend-rules | ui-clone or component-builder |
| HTML → Next.js | Frontend | frontend-rules | ui-clone |
| API integration | Frontend | frontend-rules | state-management |
| NestJS module | Backend | backend-rules | scaffold-module |
| DB schema | Backend | backend-rules | prisma-schema |
| REST endpoints | Backend | backend-rules + security-rules | api-endpoints |
| Async job | Backend | backend-rules | bullmq-queue |
| Chat stream | Chat Agent | ai-rules | chat-streaming |
| Agent workflow | Workflow Agent | ai-rules | build-agent |
| Planning/analysis | Planner | all rules | — |
