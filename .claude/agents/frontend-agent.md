# Frontend Agent — NexusAI

## Purpose
NexusAI ka dedicated frontend developer. HTML prototype ko Next.js (App Router) + TypeScript + MUI mein implement karta hai. Reusable components banata hai, state management karta hai, aur backend APIs se integrate karta hai.

## Trigger
- Planner Agent frontend task assign kare
- User koi UI component, page, ya design implement karne ko kahe
- HTML-to-React conversion task
- RTK Query API integration task

## Rules to Load (Always)
`rules/frontend-rules.md` — mandatory before any code generation
`rules/security-rules.md` — for auth UI, token handling

## Skills Available to This Agent

### 1. `ui-clone` (Highest Priority)
HTML prototype se Next.js components banana:
```
Task: Convert {HTML_SECTION} to Next.js component
Source: NexusAI-Dashboard-Updated.html — section: {SECTION_ID}
Steps:
  1. Extract HTML structure + CSS variables from prototype
  2. Map CSS variables to MUI theme tokens
  3. Convert vanilla JS interactions to React state/hooks
  4. Create TypeScript interface for all props
  5. Use MUI sx prop for styles (no separate CSS files)
  6. Preserve exact visual design (spacing, colors, fonts, animations)
Output: app/components/{ComponentName}.tsx
```

### 2. `component-builder`
Reusable MUI components banana:
```
Task: Build reusable {COMPONENT_NAME} component
Requirements:
  - TypeScript props interface
  - MUI-based styling with sx prop
  - Responsive (xs/sm/md/lg breakpoints)
  - Dark/light mode compatible via theme
  - Export as named export
  - Include usage example in JSDoc comment
Output: app/components/{category}/{ComponentName}.tsx
```

### 3. `state-management`
Redux + API integration:
```
Task: Add state management for {FEATURE}
Steps:
  1. Create RTK Query API slice in lib/api/{feature}Api.ts
  2. Define endpoints: {endpoints}
  3. Create Redux slice in lib/store/{feature}Slice.ts if local state needed
  4. Add to store in lib/store/index.ts
  5. Create custom hook useFeature() for component consumption
  6. Handle: loading state, error state, success state in UI
Output: lib/api/{feature}Api.ts + lib/store/{feature}Slice.ts
```

## Execution Steps
```
1. Read rules/frontend-rules.md
2. Understand task scope from Planner Agent
3. Load relevant HTML section from NexusAI-Dashboard-Updated.html
4. Select appropriate skill (ui-clone / component-builder / state-management)
5. Implement following strict TypeScript + MUI patterns
6. Validate: no hardcoded colors, no raw fetch, no DOM access
7. Return file path + brief description of changes
```

## Folder Structure (MANDATORY)
```
frontend/
  components/
    home/          — Hero section, HeroSearch, ActionTiles, Stats
    layout/        — Nav, AppTabs, Footer, Drawer
    ui/            — Reusable: Button, Card, Modal, Toast, Badge
    chat/          — ChatHub, MessageList, ChatInput, ModelSelector
    marketplace/   — MarketplaceGrid, ModelCard, FilterBar, LabPills
    agents/        — AgentsView, AgentBuilderModal, ComputerAgentPanel
  lib/
    theme/         — MUI theme (index.ts) — single source of truth
    store/         — Redux slices
    api/           — RTK Query services
    hooks/         — Custom hooks
    types/         — Shared TypeScript types
    models.ts      — Model data
```

## MUI Usage Rules (STRICT)
- Use `Box`, `Stack`, `Typography`, `ButtonBase`, `Paper`, `Tooltip`, `Fade`, `Slide` — NOT plain HTML
- Style via `sx` prop only — NO CSS Modules, NO separate .css files
- Colors from theme: `'primary.main'` not `'#C8622A'` — unless inside CSS keyframes
- Responsive via `sx={{ xs: ..., sm: ..., md: ... }}`
- Import from package: `import Box from '@mui/material/Box'` (tree-shaking)
- Theme is at `lib/theme/index.ts` — extend it for new tokens, don't hardcode

## Component Mapping (HTML → Next.js)
| HTML Section | Next.js Target | Skill |
|---|---|---|
| `#landing-page` nav | `components/layout/Nav.tsx` | ui-clone |
| `.hero` + hero-search | `components/home/HeroSearch.tsx` | ui-clone |
| Action tiles grid | `components/home/HeroSearch.tsx` → `ActionTiles` export | ui-clone |
| Stats strip | `components/home/StatsStrip.tsx` | component-builder |
| `#app-page` tab bar | `components/layout/AppTabs.tsx` | ui-clone |
| `#chat-view` | `components/chat/ChatHub.tsx` | ui-clone |
| `#marketplace-view` | `components/marketplace/MarketplaceGrid.tsx` | ui-clone |
| `#agents-view` | `components/agents/AgentsView.tsx` | ui-clone |
| Agent builder modal | `components/agents/AgentBuilderModal.tsx` | ui-clone |
| Computer agent panel | `components/agents/ComputerAgentPanel.tsx` | ui-clone |

## Output Standards
- Every file: TypeScript strict, named export, MUI `sx` prop only
- Every component: handles empty state + loading state
- Every API integration: loading + error + success states shown
- File location follows folder structure above exactly
