# Skill: UI Clone — HTML to Next.js

## Owner Agent
Frontend Agent

## When to Use
Jab HTML prototype (`NexusAI-Dashboard-Updated.html`) ke kisi section ko Next.js component mein convert karna ho, exact visual fidelity ke saath.

## Prompt Template
```
Convert the following HTML section to a Next.js component:

Source file: NexusAI-Dashboard-Updated.html
Section: {SECTION_ID or description}
Target: app/components/{category}/{ComponentName}.tsx

Requirements:
1. TypeScript: strict types, props interface, named export
2. Styling: MUI sx prop only — no separate CSS files
3. Map CSS variables to MUI theme equivalents:
   --accent (#C8622A) → theme.palette.primary.main
   --text (#1C1A16) → theme.palette.text.primary
   --bg (#F4F2EE) → theme.palette.background.default
   --card (#FFFFFF) → theme.palette.background.paper
4. Convert JS behavior to React hooks:
   - Toggle states → useState
   - DOM manipulation → controlled components
   - Event listeners → React event handlers
5. Fonts: Syne (headings), Instrument Sans (body) via next/font
6. Animations: CSS @keyframes via sx prop keyframes syntax
7. Responsive: use MUI breakpoints (xs/sm/md/lg)

Preserve exactly:
- Layout structure and spacing
- Color scheme and visual hierarchy
- Animation behavior (pulse, slide, fade)
- Interactive states (hover, active, focus)
```

## Folder Target Rules
| Component type | Target folder |
|---|---|
| Hero, search, stats | `components/home/` |
| Nav, tabs, footer | `components/layout/` |
| Buttons, cards, modals, badges | `components/ui/` |
| Chat, messages, input | `components/chat/` |
| Model grid, filter, cards | `components/marketplace/` |
| Agent panels, builder | `components/agents/` |

## MUI Package Imports (use tree-shaking)
```tsx
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import Fade from '@mui/material/Fade';
```

## Example Usage
```bash
claude "Use ui-clone skill: convert the #agents-view section from NexusAI-Dashboard-Updated.html to components/agents/AgentsView.tsx"
```

## Key HTML → React Mappings
| HTML Pattern | React Equivalent |
|---|---|
| `onclick="fn()"` | `onClick={() => fn()}` |
| `classList.toggle('open')` | `const [open, setOpen] = useState(false)` |
| `document.getElementById` | `useRef` or controlled state |
| `style="display:none"` | conditional render `{condition && <Component/>}` |
| CSS `:hover` | MUI `sx={{ '&:hover': {...} }}` |
| `@keyframes` | MUI `keyframes` import from `@mui/system` |

## Output Checklist
- [ ] TypeScript interface for all props
- [ ] Named export (not default)
- [ ] No hardcoded colors (use theme tokens)
- [ ] No `document.` or `window.` access
- [ ] Loading + empty states handled
- [ ] Mobile responsive
