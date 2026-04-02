# Skill: Chat Streaming (SSE + Session Memory)

## When to Use
When implementing or modifying the Chat Hub — streaming AI responses with persistent session memory.

## Prompt Template
```
Implement NestJS chat streaming for NexusAI:

Controller: POST /chat/message
- Accept: { sessionId, message, modelPreference? }
- Return: SSE stream (text/event-stream)

ChatService:
- loadHistory(sessionId): fetch last N messages from Redis
- saveMessage(sessionId, role, content): persist to Redis + PostgreSQL
- stream(messages, model): call AIService, yield chunks

AIService model routing:
- 'claude'  → Anthropic claude-sonnet-4-6
- 'gpt'     → OpenAI gpt-4o
- 'auto'    → select based on message classification

Requirements:
- Use @Sse() decorator for streaming endpoint
- Handle client disconnect gracefully
- Inject RAG context from VectorService if similarity score > 0.75
- Session expires from Redis after 24h (TTL)
```

## Example Usage
```bash
claude "Implement chat streaming endpoint with Redis session memory, auto model routing, and RAG context injection from Pinecone"
```
