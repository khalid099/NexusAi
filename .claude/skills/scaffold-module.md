# Skill: Scaffold NestJS Module

## When to Use
When creating a new backend feature module (e.g., `auth`, `ai`, `agents`, `billing`).

## Prompt Template
```
Generate a complete NestJS module for `{MODULE_NAME}` with:
- {MODULE_NAME}.module.ts    — imports, providers, exports
- {MODULE_NAME}.controller.ts — REST endpoints with proper decorators
- {MODULE_NAME}.service.ts    — business logic
- {MODULE_NAME}.dto.ts        — CreateDto + UpdateDto with class-validator
- {MODULE_NAME}.entity.ts     — Prisma-compatible entity or TypeORM entity

Requirements:
- TypeScript strict mode
- JWT guard on protected routes
- Swagger @ApiTags + @ApiOperation decorators
- Constructor injection for dependencies
- Return proper HTTP status codes
```

## Example Usage
```bash
claude "Scaffold NestJS module for 'agents' with CRUD endpoints, JWT guard, and BullMQ job dispatch on create"
```
