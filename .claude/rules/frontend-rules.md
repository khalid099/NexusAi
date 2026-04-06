# Frontend Rules — NexusAI

## Framework & Language
- **Next.js 14+ App Router** — all pages in `app/` directory
- **TypeScript strict mode** — no `any`, explicit return types on all functions
- **MUI v5** — use `sx` prop for one-off styles, theme tokens for repeated values
- **Redux Toolkit** — all global state via slices; local UI state via `useState`

## Component Standards
- All components are **functional** with TypeScript interfaces for props
- File naming: `PascalCase.tsx` for components, `camelCase.ts` for utils/hooks
- One component per file — no barrel exports unless explicitly needed
- Use `React.FC<Props>` only when children are needed, otherwise plain function
- Export components as **named exports**, not default

## HTML-to-Next.js Conversion Rules
- Preserve exact visual design (colors, spacing, fonts, layout) from HTML prototype
- Replace vanilla JS with React state/hooks equivalents
- CSS variables from HTML → MUI theme tokens
- Inline styles → `sx` prop or `styled()` components
- JavaScript DOM manipulation → React controlled components

## API Integration
- All API calls via **RTK Query** (`createApi`) — no raw fetch/axios in components
- API base URL from `process.env.NEXT_PUBLIC_API_URL`
- Handle loading, error, success states in every component that fetches data
- Never store tokens in localStorage — use httpOnly cookies

## File Structure
```
app/
  (auth)/login/page.tsx
  (dashboard)/
    agents/page.tsx
    marketplace/page.tsx
    chat/page.tsx
  layout.tsx
components/
  ui/          — generic reusable (Button, Card, Modal)
  agents/      — agent-specific components
  marketplace/ — tool listing components
  chat/        — chat UI components
lib/
  store/       — Redux store + slices
  api/         — RTK Query services
  hooks/       — custom hooks
```

## Styling Rules
- Use MUI `theme.palette` for colors — no hardcoded hex in components
- Responsive via MUI breakpoints: `xs`, `sm`, `md`, `lg`
- Font: `Syne` for headings, `Instrument Sans` for body (match HTML prototype)
- Animation: use `@keyframes` via `sx` or MUI `Fade`/`Slide` transitions
- No Tailwind — pure MUI + CSS-in-JS only

## Forbidden
- `document.getElementById` or any direct DOM access
- Raw `fetch()` in components — always use RTK Query
- Hardcoded API URLs — always use env vars
- `console.log` in production code
- CSS files (except `globals.css` for resets)
