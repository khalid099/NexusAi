# Skill: Prisma Schema Design

## When to Use
When designing or extending the PostgreSQL database schema.

## Prompt Template
```
Generate a Prisma schema for NexusAI covering these models:
{MODEL_LIST}

Requirements:
- Use UUIDs as primary keys (@default(uuid()))
- Add createdAt / updatedAt timestamps on all models
- Define proper relations (one-to-many, many-to-many)
- Add @@index on frequently queried fields
- Include enums for status fields (e.g., PlanType, WorkflowStatus)
- Add @map / @@map for snake_case DB column names
```

## Core Models (Always Include)
```prisma
User, Tool, Category, Prompt, ChatSession, Message, Agent, Workflow, Subscription
```

## Example Usage
```bash
claude "Design Prisma schema for Agent and Workflow models with execution history, step results stored as JSON, and relation to User"
```
