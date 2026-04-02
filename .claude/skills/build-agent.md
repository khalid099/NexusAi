# Skill: Build Agentic Workflow

## When to Use
When implementing a new automated workflow or adding a new agent to the Agent Engine.

## Prompt Template
```
Create an agentic workflow for `{WORKFLOW_NAME}` that:
- Trigger: {TRIGGER_DESCRIPTION}
- Steps:
  1. {STEP_1}
  2. {STEP_2}
  3. {STEP_3}
- Output: {OUTPUT_DESCRIPTION}

Implementation requirements:
- Use BullMQ for queue-based execution
- Each step is a separate processor function
- Steps pass data via job.data object
- Failed steps retry up to 3 times with exponential backoff
- Log each step result to analytics service
- Return job ID immediately, emit result via WebSocket/SSE when done
```

## Example Usage
```bash
claude "Build agentic workflow for SWOT analysis: trigger=user submits company name, steps=[fetch company data from web, run SWOT prompt via Claude, format output as structured JSON], output=rendered SWOT dashboard"
```
