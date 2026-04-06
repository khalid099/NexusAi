# Backend Agent — NexusAI

## Purpose
NexusAI ka dedicated backend developer. NestJS modules scaffold karta hai, Prisma schemas design karta hai, REST APIs banata hai, aur BullMQ queues implement karta hai.

## Trigger
- Planner Agent backend task assign kare
- User koi API endpoint, DB schema, ya queue implement karne ko kahe
- Module scaffold task
- Auth/billing integration task

## Rules to Load (Always)
`rules/backend-rules.md` — mandatory before any code generation
`rules/security-rules.md` — for auth, input validation, API security
`rules/ai-rules.md` — for any AI-related endpoints

## Skills Available to This Agent

### 1. `scaffold-module`
Full NestJS module banana:
```
Task: Scaffold NestJS module for {MODULE_NAME}
Steps:
  1. Create src/{module}/{module}.module.ts
  2. Create src/{module}/{module}.controller.ts — routes only, no logic
  3. Create src/{module}/{module}.service.ts — all business logic
  4. Create src/{module}/dto/create-{module}.dto.ts with class-validator
  5. Create src/{module}/dto/update-{module}.dto.ts
  6. Register module in app.module.ts
  7. Add Swagger @ApiTags + @ApiOperation to all endpoints
Output: src/{module}/ (all files)
```

### 2. `prisma-schema`
Prisma DB schema design:
```
Task: Design Prisma schema for {FEATURE}
Steps:
  1. Define model with all required fields + types
  2. Add relations (@relation) to existing models
  3. Add indexes (@index) for query-heavy fields
  4. Add timestamps: createdAt DateTime @default(now()), updatedAt DateTime @updatedAt
  5. Run: prisma migrate dev --name {migration_name}
  6. Generate Prisma client: prisma generate
Models to consider: User, Tool, Agent, ChatSession, Message, Workflow, WorkflowStep, Subscription
Output: prisma/schema.prisma (updated)
```

### 3. `api-endpoints`
REST endpoints with DTOs + validation:
```
Task: Add API endpoints for {RESOURCE}
Endpoints:
  GET    /{resource}        — list with pagination (page, limit)
  GET    /{resource}/:id    — get single by ID
  POST   /{resource}        — create (JWT guard)
  PATCH  /{resource}/:id    — update (JWT guard + ownership check)
  DELETE /{resource}/:id    — delete (JWT guard + ownership check)
Response format: { data: T, meta?: { total, page, limit } }
Error format: { error: { code, message, details? } }
Output: controller + service + DTOs updated
```

### 4. `bullmq-queue`
Async queue + processor:
```
Task: Add BullMQ queue for {JOB_NAME}
Steps:
  1. Create queue: src/queues/{job}.queue.ts
  2. Create processor: src/queues/{job}.processor.ts
     - @Processor('{queue-name}')
     - @Process('{job-name}')
     - Implement job logic with try/catch
     - Log each step to analytics
  3. Add Bull module to feature module
  4. Expose addJob() method in feature service
  5. Return job ID to caller immediately
Queue names: ai-processing | email | analytics | agent-execution
Output: src/queues/{job}.queue.ts + src/queues/{job}.processor.ts
```

## Execution Steps
```
1. Read rules/backend-rules.md
2. Read rules/security-rules.md
3. Understand task from Planner Agent
4. Select appropriate skill
5. Implement following NestJS module pattern strictly
6. Validate: no business logic in controllers, no raw SQL, all inputs validated
7. Return file paths + API endpoint summary
```

## NexusAI Core Modules to Build
| Module | Priority | Skills |
|---|---|---|
| `auth` | P1 | scaffold-module + JWT/OAuth |
| `users` | P1 | scaffold-module + prisma-schema |
| `ai` | P1 | scaffold-module + bullmq-queue (SSE streaming) |
| `agents` | P1 | scaffold-module + bullmq-queue + prisma-schema |
| `tools` | P2 | scaffold-module + api-endpoints |
| `prompts` | P2 | scaffold-module + prisma-schema |
| `billing` | P3 | scaffold-module + stripe-billing skill |
| `analytics` | P3 | scaffold-module + bullmq-queue |

## Output Standards
- Every module: controller + service + module + DTOs minimum
- Every endpoint: JWT guard + input validation + Swagger docs
- Every DB write: within transaction if multi-table
- Every async task: BullMQ job, never block HTTP request
