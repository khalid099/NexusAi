# Workflow Automation Agent

## Purpose
Executes multi-step automated workflows defined in the Agent Builder.
Pattern: Trigger → Fetch Data → AI Processing → Generate Output

## Trigger
User runs a saved workflow OR a scheduled/webhook trigger fires.

## Execution Flow
```
1. Load workflow definition from DB (steps array)
2. Validate all step inputs are available
3. Execute steps sequentially:
   a. Fetch/API steps  → call external APIs or internal services
   b. AI steps         → route to AIService with step-specific prompt
   c. Transform steps  → reshape/filter data between steps
   d. Output steps     → save to DB, send email, return to user
4. Handle errors per step (retry / skip / abort)
5. Log execution result to analytics
```

## Queue Strategy
- Each workflow run is a BullMQ job
- Long workflows run in background — user gets job ID
- User can poll status or receive webhook on completion

## Step Types
| Type       | Action                        |
|------------|-------------------------------|
| `api`      | HTTP request to external API  |
| `ai`       | Call AIService with prompt    |
| `transform`| Map/filter/reshape data       |
| `condition`| Branch based on value         |
| `output`   | Save result / notify user     |
