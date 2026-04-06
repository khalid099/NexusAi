# Backend Rules — NexusAI

## Framework & Language
- **NestJS** modular architecture — every feature is an independent module
- **TypeScript strict mode** — all services, controllers, DTOs fully typed
- **Prisma ORM** — all DB access goes through Prisma; no raw SQL except in migrations

## Module Structure (mandatory for every module)
```
src/{module}/
  {module}.module.ts      — imports, providers, exports
  {module}.controller.ts  — HTTP routes only, no business logic
  {module}.service.ts     — all business logic here
  dto/
    create-{module}.dto.ts
    update-{module}.dto.ts
  entities/
    {module}.entity.ts    — Prisma model type alias (not TypeORM)
```

## Controller Rules
- Controllers only: validate input, call service, return response
- Use `class-validator` decorators on all DTOs (`@IsString`, `@IsEmail`, etc.)
- Always use `@ApiTags` + `@ApiOperation` for Swagger documentation
- Never put business logic in controllers

## Service Rules
- Services own all business logic
- Never call another module's service directly — use DI (inject via constructor)
- All async methods return `Promise<T>` with explicit type
- Wrap external calls (AI, Stripe, S3) in try/catch with proper error types

## API Design
- RESTful endpoints: `GET /resource`, `POST /resource`, `PATCH /resource/:id`, `DELETE /resource/:id`
- All responses use standard envelope: `{ data, meta?, error? }`
- HTTP status codes: 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 404 (Not Found), 500 (Server Error)
- Pagination on all list endpoints: `page`, `limit`, `total` in meta

## Database (Prisma)
- Schema lives in `prisma/schema.prisma`
- Never use `prisma.{model}.create` without selecting specific fields (`select:` or `omit:`)
- Use transactions (`prisma.$transaction`) for multi-table writes
- Migrations: `prisma migrate dev --name {description}` — never edit migration files manually

## Queue (BullMQ)
- All async/long-running tasks go into BullMQ queues
- Queue names: `ai-processing`, `email`, `analytics`, `agent-execution`
- Every job has: `jobId`, `userId`, `createdAt`, `payload`
- Processors handle one responsibility only — never chain business logic inside a processor

## Auth & Security
- JWT guard on all routes by default — use `@Public()` decorator to opt out
- Role-based access: `@Roles('admin', 'pro')` decorator + `RolesGuard`
- Never log or return passwords, tokens, or API keys
- Rate limiting via `@nestjs/throttler` on auth + AI endpoints

## Forbidden
- `any` type — use `unknown` and narrow with type guards
- Business logic in controllers
- Direct DB calls in controllers — always go through service
- Hardcoded secrets — always use `ConfigService`
- Circular module dependencies
