# Security Rules — NexusAI

## Authentication
- JWT access token: 15 min expiry
- JWT refresh token: 7 days expiry, stored in httpOnly cookie
- Never store tokens in localStorage or sessionStorage
- OAuth (Google/GitHub) via Passport.js strategies
- All auth routes are rate-limited: 5 attempts per 15 minutes

## Authorization
- Default: all endpoints require valid JWT (`JwtAuthGuard` applied globally)
- Use `@Public()` decorator to explicitly opt-out (landing page, OAuth callbacks)
- Role-based: `@Roles('admin')` + `RolesGuard` for protected admin routes
- Resource ownership: always verify `userId === resource.userId` before mutations

## API Key Management
- All secrets in `.env` — never in code, comments, or git history
- Access via `ConfigService` only — never `process.env` directly in business logic
- AI provider keys (Anthropic, OpenAI) only used in `AIService`
- Stripe keys only used in `BillingService`
- Rotate keys immediately if exposed

## Input Validation
- All user input validated with `class-validator` before processing
- Sanitize HTML input before storage — use `DOMPurify` or `sanitize-html`
- File uploads: validate MIME type + size server-side (not just client)
- Never pass raw user input to: SQL queries, shell commands, eval(), AI prompts without sanitization

## OWASP Top 10 Prevention
| Threat | Mitigation |
|--------|-----------|
| SQL Injection | Prisma parameterized queries only |
| XSS | CSP headers + input sanitization + React escaping |
| CSRF | SameSite=Strict cookie + CSRF token on forms |
| Broken Auth | Short JWT expiry + refresh rotation |
| Sensitive Data Exposure | HTTPS only + no secrets in logs/responses |
| Rate Limiting | `@nestjs/throttler` on all public endpoints |
| Broken Access Control | RolesGuard + ownership checks on all mutations |

## Logging & Monitoring
- Log: request method, path, userId, status code, duration
- Never log: passwords, tokens, API keys, full request body, PII
- Use structured logging (JSON) via Winston
- Alert on: 5xx errors spike, unusual token usage, failed auth attempts > threshold

## Headers (NestJS Helmet)
```typescript
app.use(helmet({
  contentSecurityPolicy: true,
  crossOriginEmbedderPolicy: true,
}))
```

## Forbidden
- `eval()` anywhere
- `exec()` or child_process with user input
- Returning stack traces in production API responses
- Disabling SSL/TLS verification
- Committing `.env` files
- Using `SELECT *` — always specify columns in Prisma `select:`
