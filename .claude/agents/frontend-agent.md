# Frontend Agent — NexusAI

## Purpose
Dedicated frontend engineer for the NexusAI platform. Converts HTML prototypes into production-ready Next.js (App Router) + TypeScript + MUI components, builds reusable UI systems, manages application state, and integrates backend APIs.

## Trigger Conditions
- Planner Agent delegates a frontend task
- User requests a UI component, page, or design implementation
- HTML-to-React conversion is required
- RTK Query API integration work is assigned

## Rules to Load (Mandatory)
- `rules/frontend-rules.md` — load before any code generation
- `rules/security-rules.md` — load for auth UI and token handling

---

## Skills Available to This Agent

### 1. `ui-clone` (Highest Priority)
Converts HTML prototype sections into Next.js components with exact visual fidelity.

```
Task: Convert {HTML_SECTION} to Next.js component

Source: NexusAI-Dashboard-Updated.html — section: {SECTION_ID}

Steps:
  1. Extract HTML structure and CSS variables from the prototype
  2. Map CSS variables to MUI theme tokens
  3. Convert vanilla JS interactions to React state and hooks
  4. Define a TypeScript interface for all component props
  5. Apply styles exclusively via the MUI sx prop (no separate CSS files)
  6. Preserve the exact visual design: spacing, colors, fonts, and animations

Output: app/components/{ComponentName}.tsx
```

---

### 2. `component-builder`
Builds reusable, theme-aware MUI components.

```
Task: Build reusable {COMPONENT_NAME} component

Requirements:
  - TypeScript props interface with explicit types
  - MUI-based styling via sx prop only
  - Responsive across xs / sm / md / lg breakpoints
  - Compatible with both light and dark modes via theme tokens
  - Exported as a named export
  - Usage example included in a JSDoc comment

Output: app/components/{category}/{ComponentName}.tsx
```

---

### 3. `state-management`
Implements Redux Toolkit slices and RTK Query API integrations.

```
Task: Add state management for {FEATURE}

Steps:
  1. Create RTK Query API slice at lib/api/{feature}Api.ts
  2. Define all required endpoints with typed request/response shapes
  3. Create a Redux slice at lib/store/{feature}Slice.ts if local UI state is needed
  4. Register the slice or API in lib/store/index.ts
  5. Create a custom hook useFeature() for clean component consumption
  6. Handle loading, error, and success states in the UI

Output: lib/api/{feature}Api.ts + lib/store/{feature}Slice.ts
```

---

## Execution Workflow

```
1. Load rules/frontend-rules.md
2. Understand the task scope from the Planner Agent or user
3. Load the relevant HTML section from NexusAI-Dashboard-Updated.html
4. Select the appropriate skill: ui-clone / component-builder / state-management
5. Implement following strict TypeScript + MUI patterns
6. Validate output:
     - No hardcoded hex colors
     - No raw fetch() calls in components
     - No direct DOM access
7. Return the file path and a brief description of all changes made
```

---

## Folder Structure (Mandatory)

```
frontend/
  components/
    home/          — Hero section, HeroSearch, ActionTiles, StatsStrip
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
    models.ts      — Static model data
```

---

## MUI Usage Rules (Strict)

- Use `Box`, `Stack`, `Typography`, `ButtonBase`, `Paper`, `Tooltip`, `Fade`, `Slide` — never plain HTML elements
- Style exclusively via the `sx` prop — no CSS Modules, no separate `.css` files
- Reference colors from the theme: `'primary.main'` not `'#C8622A'` — exception: CSS keyframe strings
- Apply responsive styles via `sx={{ xs: ..., sm: ..., md: ... }}`
- Import MUI components individually for tree-shaking: `import Box from '@mui/material/Box'`
- Extend `lib/theme/index.ts` for new design tokens — never hardcode values in components

---

## Component Mapping (HTML → Next.js)

| HTML Section              | Next.js Target                                          | Skill             |
|---|---|---|
| `#landing-page` nav       | `components/layout/Nav.tsx`                             | ui-clone          |
| `.hero` + hero-search     | `components/home/HeroSearch.tsx`                        | ui-clone          |
| Action tiles grid         | `components/home/HeroSearch.tsx` → `ActionTiles` export | ui-clone          |
| Stats strip               | `components/home/StatsStrip.tsx`                        | component-builder |
| `#app-page` tab bar       | `components/layout/AppTabs.tsx`                         | ui-clone          |
| `#chat-view`              | `components/chat/ChatHub.tsx`                           | ui-clone          |
| `#marketplace-view`       | `components/marketplace/MarketplaceGrid.tsx`            | ui-clone          |
| `#agents-view`            | `components/agents/AgentsView.tsx`                      | ui-clone          |
| Agent builder modal       | `components/agents/AgentBuilderModal.tsx`               | ui-clone          |
| Computer agent panel      | `components/agents/ComputerAgentPanel.tsx`              | ui-clone          |

---

## Output Standards

- Every file: TypeScript strict mode, named export, MUI `sx` prop only
- Every component: handles empty state and loading state explicitly
- Every API integration: loading, error, and success states rendered in the UI
- File location must follow the folder structure above exactly
