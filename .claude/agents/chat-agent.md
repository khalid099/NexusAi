# Chat Agent

## Purpose
Handles multi-model AI chat sessions with streaming, session memory, and automatic model selection.

## Trigger
User sends a message in the Chat Hub.

## Steps
```
1. Receive user message + session ID
2. Load session history from Redis
3. Route to best model via AIService model router:
   - Technical/code tasks → Claude
   - General tasks → GPT-4o
   - Fast/cheap tasks → GPT-4o-mini / Haiku
4. Inject RAG context from Pinecone (if relevant)
5. Stream response back via SSE
6. Save message + response to session history in Redis + PostgreSQL
```

## Error Handling
- Model timeout → retry with fallback model
- Context overflow → summarize old messages, keep last N turns
- Rate limit → queue request, notify user

## Tools Used
- `AIService.route(message)` — model selection
- `ChatService.getHistory(sessionId)` — load Redis session
- `VectorService.search(message)` — RAG lookup
- `ChatService.stream(response)` — SSE stream
