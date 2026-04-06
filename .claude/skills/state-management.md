# Skill: State Management — RTK Query + Redux

## Owner Agent
Frontend Agent

## When to Use
Jab component ko backend API se data lena ho, ya global state manage karni ho.

## Prompt Template
```
Add state management for {FEATURE} in NexusAI frontend:

API Base: process.env.NEXT_PUBLIC_API_URL

RTK Query API Slice — lib/api/{feature}Api.ts:
Endpoints:
  - GET    /{resource}          → list{Resource}s (with page, limit)
  - GET    /{resource}/{id}     → get{Resource}ById
  - POST   /{resource}          → create{Resource}
  - PATCH  /{resource}/{id}     → update{Resource}
  - DELETE /{resource}/{id}     → delete{Resource}

Tag-based invalidation:
  - providesTags: [{type: '{Resource}', id: 'LIST'}]
  - invalidatesTags on mutations

Redux Slice (if local UI state needed) — lib/store/{feature}Slice.ts:
State:
  {LIST_STATE_FIELDS}
Actions:
  {LIST_ACTIONS}

Custom Hook — lib/hooks/use{Feature}.ts:
  Export: { data, isLoading, error, create{Resource}, update{Resource}, delete{Resource} }
  Handle: loading skeleton, error toast, success notification

Store Registration — lib/store/index.ts:
  Add {feature}Api.reducer + {feature}Api.middleware
```

## NexusAI Feature → API Mapping
| Feature | RTK API File | Endpoints |
|---|---|---|
| Agents | `agentsApi.ts` | CRUD + `/agents/:id/run` |
| Tools/Marketplace | `toolsApi.ts` | list + get + search |
| Chat | `chatApi.ts` | sessions CRUD + streaming |
| Prompts | `promptsApi.ts` | CRUD + categories |
| User/Auth | `authApi.ts` | login, register, refresh, me |
| Billing | `billingApi.ts` | plans, subscribe, usage |

## Streaming (Chat)
```typescript
// SSE streaming with RTK Query
const chatApi = createApi({
  endpoints: (builder) => ({
    streamChat: builder.query<void, { sessionId: string; message: string }>({
      queryFn: () => ({ data: undefined }),
      async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded }) {
        const es = new EventSource(`${API_URL}/chat/stream?...`)
        es.onmessage = (e) => updateCachedData(draft => { /* append token */ })
      }
    })
  })
})
```

## Output Checklist
- [ ] RTK Query API slice with all CRUD endpoints
- [ ] Proper cache tag invalidation
- [ ] Custom hook exports clean interface
- [ ] Loading + error states handled
- [ ] Store registered in index.ts
