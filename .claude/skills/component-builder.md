# Skill: Component Builder

## Owner Agent
Frontend Agent

## When to Use
Reusable MUI component banana jab ek pattern multiple jagah use hoga (cards, buttons, modals, badges, etc.)

## Prompt Template
```
Build a reusable {COMPONENT_NAME} component for NexusAI:

Category: {ui | agents | marketplace | chat | layout}
File: app/components/{category}/{ComponentName}.tsx

Props interface:
{LIST_PROPS_AND_TYPES}

Design reference: NexusAI-Dashboard-Updated.html — {REFERENCE_SECTION}

Requirements:
1. Named TypeScript export with explicit Props interface
2. MUI-based: Box, Typography, Button, Card, etc.
3. sx prop for all custom styles
4. Variants: {LIST_VARIANTS if applicable}
5. Responsive at xs/sm/md breakpoints
6. Accessible: aria-label, role, keyboard nav
7. JSDoc comment with usage example

NexusAI Design Tokens (map to MUI theme):
- Primary: #C8622A (accent orange)
- Text: #1C1A16 (primary), #5A5750 (secondary), #9E9B93 (muted)
- Background: #F4F2EE (page), #FFFFFF (card)
- Border radius: 12px (default), 8px (sm), 20px (lg), 28px (xl)
- Shadow: 0 1px 4px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.04)
```

## Common Components for NexusAI
| Component | Props | Usage |
|---|---|---|
| `ToolCard` | title, description, badge, icon, price, onClick | Marketplace grid |
| `AgentCard` | name, status, lastRun, tools, onClick | Agents list |
| `StatusBadge` | label, color | Tool/agent status |
| `ModelSelector` | models, selected, onChange | Chat hub |
| `PricingCard` | plan, price, features, cta, highlighted | Pricing section |
| `SearchBar` | value, onChange, onSubmit, attachments | Hero + chat |

## Output Checklist
- [ ] Props interface with all types
- [ ] Named export
- [ ] Handles `undefined`/optional props gracefully
- [ ] Variant support if needed
- [ ] Usage example in JSDoc
