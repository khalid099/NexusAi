# AI Rules — NexusAI

## Core Principle
All AI calls go through `AIService` model router — never call Claude/OpenAI/Gemini directly from controllers or other services.

## Model Routing Logic
```typescript
// AIService.route(task: AITask): Promise<AIResponse>
if task.type === 'code'       → claude-opus-4-6 (best for code/reasoning)
if task.type === 'chat'       → claude-sonnet-4-6 (balanced speed/quality)
if task.type === 'fast'       → claude-haiku-4-5  (low latency, cheap)
if task.type === 'analysis'   → claude-opus-4-6   (deep analysis)
if task.type === 'general'    → gpt-4o             (fallback/alternative)
```

## Streaming (SSE)
- All chat responses stream via SSE — never return full response for chat
- Use `@Sse()` decorator in NestJS for SSE endpoints
- Emit `data: {token}\n\n` format
- Always emit `data: [DONE]\n\n` to signal stream end
- Frontend subscribes via `EventSource` or RTK Query `fetchBaseQuery` with streaming

## RAG (Retrieval Augmented Generation)
- Vector DB: Pinecone (production) / Weaviate (self-hosted fallback)
- Embeddings: `text-embedding-3-small` (OpenAI) for all text
- Chunk size: 512 tokens with 64-token overlap
- Always inject retrieved context before user message in prompt
- Max context chunks per query: 5

## Session Memory
- Chat history stored in Redis (key: `session:{sessionId}:messages`)
- TTL: 24 hours per session
- Max messages in context: 20 (summarize older ones)
- Persist final session summary to PostgreSQL on session end

## Prompt Engineering Rules
- System prompts in `src/ai/prompts/` as TypeScript template strings
- Never hardcode prompts inline in services
- Always include: role definition, output format, constraints
- Use `{variable}` placeholders for dynamic content
- Test prompts with edge cases before deploying

## Agent Execution
- Each agent run is a BullMQ job in `agent-execution` queue
- Steps execute sequentially — pass data via `job.data`
- Each step logs to analytics: `{ stepId, duration, tokens, status }`
- On failure: retry 3x with exponential backoff, then mark as failed
- User receives job ID immediately; result delivered via WebSocket/SSE

## Cost Control
- Log token usage per request: `{ model, inputTokens, outputTokens, userId }`
- Enforce per-user monthly token limits based on subscription plan
- Free: 50K tokens/month | Pro: 500K | Enterprise: unlimited
- Reject requests over limit with 402 Payment Required

## Forbidden
- Direct API calls to Claude/OpenAI outside `AIService`
- Storing API keys anywhere except environment variables via `ConfigService`
- Streaming from controllers — always use dedicated SSE service
- Logging prompt contents containing user PII
