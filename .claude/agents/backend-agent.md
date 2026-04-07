# Backend Agent — NexusAI

## Purpose
Dedicated backend engineer for the NexusAI platform. Responsible for scaffolding NestJS modules, designing Prisma schemas, implementing REST APIs, and building BullMQ async queues following enterprise-grade patterns.

## Trigger Conditions
- Planner Agent delegates a backend task
- User requests an API endpoint, database schema, or queue implementation
- Module scaffold task is required
- Auth or billing integration work is assigned

## Rules to Load (Mandatory)
- `rules/backend-rules.md` — load before any code generation
- `rules/security-rules.md` — load for auth, input validation, and API security
- `rules/ai-rules.md` — load for any AI-related endpoints or streaming logic

---

## Skills Available to This Agent

### 1. `scaffold-module`
Generates a complete, self-contained NestJS feature module.

```
Task: Scaffold NestJS module for {MODULE_NAME}

Steps:
  1. Create src/{module}/{module}.module.ts
  2. Create src/{module}/{module}.controller.ts   — HTTP routes only, no business logic
  3. Create src/{module}/{module}.service.ts       — all business logic here
  4. Create src/{module}/dto/create-{module}.dto.ts with class-validator decorators
  5. Create src/{module}/dto/update-{module}.dto.ts
  6. Register the new module in app.module.ts
  7. Add Swagger @ApiTags + @ApiOperation to all endpoints

Output: src/{module}/ (all files)
```

---

### 2. `prisma-schema`
Designs and migrates Prisma database schemas.

```
Task: Design Prisma schema for {FEATURE}

Steps:
  1. Define model with all required fields and TypeScript-compatible types
  2. Add @relation decorators linking to existing models
  3. Add @index on all query-heavy fields
  4. Include timestamps: createdAt DateTime @default(now()), updatedAt DateTime @updatedAt
  5. Run: prisma migrate dev --name {migration_name}
  6. Regenerate Prisma client: prisma generate

Models to consider: User, Tool, Agent, ChatSession, Message, Workflow, WorkflowStep, Subscription

Output: prisma/schema.prisma (updated)
```

---

### 3. `api-endpoints`
Implements full RESTful CRUD endpoints with DTOs and input validation.

```
Task: Add API endpoints for {RESOURCE}

Endpoints:
  GET    /{resource}        — paginated list (page, limit query params)
  GET    /{resource}/:id    — fetch single record by ID
  POST   /{resource}        — create (JWT guard required)
  PATCH  /{resource}/:id    — update (JWT guard + ownership check)
  DELETE /{resource}/:id    — delete (JWT guard + ownership check)

Response envelope: { data: T, meta?: { total, page, limit } }
Error envelope:    { error: { code, message, details? } }

Output: controller + service + DTOs (updated)
```

---

### 4. `bullmq-queue`
Implements async BullMQ job queues and processors.

```
Task: Add BullMQ queue for {JOB_NAME}

Steps:
  1. Create queue definition:   src/queues/{job}.queue.ts
  2. Create processor:          src/queues/{job}.processor.ts
       - @Processor('{queue-name}')
       - @Process('{job-name}')
       - Implement job logic with try/catch error handling
       - Log each step to the analytics service: { stepId, duration, tokens, status }
  3. Register Bull module in the relevant feature module
  4. Expose addJob() method on the feature service
  5. Return job ID immediately to the HTTP caller — never block the request

Queue names: ai-processing | email | analytics | agent-execution

Output: src/queues/{job}.queue.ts + src/queues/{job}.processor.ts
```

---

## Execution Workflow

```
1. Load rules/backend-rules.md
2. Load rules/security-rules.md
3. Understand the task from the Planner Agent or user
4. Select the appropriate skill from the list above
5. Implement strictly following the NestJS module pattern
6. Validate output:
     - No business logic in controllers
     - No raw SQL in application code
     - All inputs validated with class-validator
7. Return a summary of created file paths and exposed API endpoints
```

---

## Core Modules — Build Priority

| Module       | Priority | Skills Required                              |
|---|---|---|
| `auth`       | P1       | scaffold-module + JWT/OAuth strategies       |
| `users`      | P1       | scaffold-module + prisma-schema              |
| `ai`         | P1       | scaffold-module + bullmq-queue (SSE)         |
| `agents`     | P1       | scaffold-module + bullmq-queue + prisma-schema |
| `tools`      | P2       | scaffold-module + api-endpoints              |
| `prompts`    | P2       | scaffold-module + prisma-schema              |
| `billing`    | P3       | scaffold-module + stripe-billing skill       |
| `analytics`  | P3       | scaffold-module + bullmq-queue               |

---

## Output Standards

- Every module must include: controller + service + module file + DTOs (minimum)
- Every endpoint must have: JWT guard + class-validator input validation + Swagger documentation
- Every multi-table write must be wrapped in a Prisma transaction (`prisma.$transaction`)
- Every long-running or async task must be dispatched as a BullMQ job — never block an HTTP request
