# Import Pipeline — Design Spec

This document specifies the architecture, data flow, and API for importing recipes from URLs and files. It covers the backend job model, the AI extraction approach, and the interactive review UI.

---

## Goals

- Import recipes from web URLs and static files (PDF, images) without manual data entry.
- Extract structured recipe data using an LLM, with the user remaining in full control throughout.
- Allow the user to review, correct, and re-run any step before committing a recipe to the library.
- Never commit anything to the library without explicit user approval.

---

## Backend: Spring Batch job as state machine

Each import is a Spring Batch job. The job is not merely a runner — it is the authoritative state machine for the import lifecycle. Every step writes its output into the `JobExecutionContext` before completing, which is what makes rewind possible.

### Steps

```
FETCH  →  EXTRACT  →  CLARIFY (optional)  →  REVIEW  →  COMMIT
```

| Step | What it does |
|---|---|
| `FETCH` | Downloads the URL or reads the uploaded file. Stores raw content in context. |
| `EXTRACT` | Runs the AI extraction pipeline. Stores a versioned draft in context (see below). |
| `CLARIFY` | Pauses the job. Presents questions to the user. Resumes when answers are submitted. |
| `REVIEW` | User inspects the final draft and may edit fields directly. No AI involved. |
| `COMMIT` | Writes the approved recipe to the database. Terminal step. |

### Job status values

```
STARTED  →  WAITING_FOR_INPUT  →  STARTED  →  COMPLETED
                                            ↘  FAILED
                                            ↘  STOPPED  (user-initiated)
```

`WAITING_FOR_INPUT` is not a native Spring Batch status — it is stored as a discriminator in the import record alongside the batch `BatchStatus`. The step sets `BatchStatus.STOPPED` and writes `waitingForInput: true` to the context before halting.

---

## AI extraction: user-controlled tool execution

The `EXTRACT` step uses Spring AI with **user-controlled tool execution** (`internalToolExecutionEnabled = false`). This is necessary because tool calls must be logged, inspected, and potentially re-run interactively — the synchronous `@Tool` shortcut is insufficient here.

### Execution loop

```java
ToolCallingManager toolCallingManager = ToolCallingManager.builder().build();

ChatOptions chatOptions = ToolCallingChatOptions.builder()
    .toolCallbacks(new RecipeExtractionTools())
    .internalToolExecutionEnabled(false)
    .build();

Prompt prompt = new Prompt(buildExtractionPrompt(rawContent), chatOptions);
ChatResponse chatResponse = chatModel.call(prompt);

while (chatResponse.hasToolCalls()) {
    ToolExecutionResult toolExecutionResult =
        toolCallingManager.executeToolCalls(prompt, chatResponse);

    prompt = new Prompt(toolExecutionResult.conversationHistory(), chatOptions);
    chatResponse = chatModel.call(prompt);
}

RecipeDraft draft = parseDraft(chatResponse.getResult().getOutput().getText());
```

Each iteration of the loop is logged to the `JobExecutionContext`. If clarification is needed, the loop is suspended and the current conversation history is persisted so it can be resumed without losing context.

### Clarification questions

During extraction, the LLM may indicate that it needs additional information (ambiguous units, missing yield, unclear technique). When this occurs:

1. The step writes the questions to the context under `pendingQuestions`.
2. The job transitions to `WAITING_FOR_INPUT`.
3. The user submits answers via `POST /imports/{id}/answers`.
4. The answers are appended to the conversation history in the context.
5. `JobOperator.restart()` resumes the job; the extraction loop continues from where it stopped.

---

## Versioned drafts

Every time the `EXTRACT` step runs — on first execution or after a rewind — the resulting draft is **appended** to a list in the context rather than overwriting the previous draft.

```
context.drafts = [
  { version: 1, extractedAt: ..., data: { ... } },
  { version: 2, extractedAt: ..., data: { ... } }   ← current
]
```

This costs negligible storage and provides:
- A full audit trail of what the LLM produced at each attempt.
- A version comparison UI so the user can see what changed between runs.
- Safe rewind: the user can always reference what v1 looked like even after re-running extraction.

---

## Rewind

The user may rewind to any completed step and re-run from that point. This discards all steps after the target step and re-executes.

- All drafts produced after the rewind point are removed from the active draft (but remain in the `drafts` list for reference under prior versions).
- Clarification answers provided after the rewind point are cleared.
- The user is warned before a rewind is executed.
- `JobOperator.restart()` is called with the context modified to reflect the rewound state.

---

## Frontend interaction model

The UI shows one card per import. Each card reflects the current step and status.

### Card states

| Status | What the user sees |
|---|---|
| `STARTED` | Step indicator with a spinner on the active step. |
| `WAITING_FOR_INPUT` | Clarification panel with the LLM's questions and answer fields. |
| `REVIEW` | Full draft editor. Version pills for each draft version. Rewind controls per step. |
| `COMPLETED` | Link to the committed recipe. |
| `FAILED` | Error message and a retry button. |

### Live updates

The UI subscribes to server-sent events (SSE) on `GET /imports/events` (or per-import at `GET /imports/{id}/events`). The backend publishes events via Spring's `ApplicationEventPublisher` whenever a job transitions state. The frontend does not poll; it reacts to events.

---

## API

| Method | Path | Description |
|---|---|---|
| `POST` | `/imports` | Submit a URL or file. Launches the batch job. Returns `importId`. |
| `GET` | `/imports` | List all imports with current status. |
| `GET` | `/imports/{id}` | Full detail: step history, pending questions, draft versions. |
| `POST` | `/imports/{id}/answers` | Submit answers to clarification questions. Resumes the job. |
| `PATCH` | `/imports/{id}/steps/{stepIndex}` | Rewind to a specific step. Triggers restart from that step. |
| `GET` | `/imports/events` | SSE stream of import status change events. |

### `POST /imports`

```json
{
  "url": "https://example.com/some-recipe",
  "sourceType": "URL"
}
```

or

```json
{
  "fileId": "upload-abc123",
  "sourceType": "PDF"
}
```

Returns:

```json
{
  "importId": "imp-7f3a1c",
  "status": "STARTED",
  "currentStep": "FETCH"
}
```

### `GET /imports/{id}`

```json
{
  "importId": "imp-7f3a1c",
  "status": "WAITING_FOR_INPUT",
  "currentStep": "CLARIFY",
  "steps": [
    { "name": "FETCH",   "status": "COMPLETED", "completedAt": "..." },
    { "name": "EXTRACT", "status": "COMPLETED", "completedAt": "..." },
    { "name": "CLARIFY", "status": "STARTED",   "startedAt":   "..." }
  ],
  "pendingQuestions": [
    { "id": "q1", "text": "The recipe lists '2 cups flour' — should this be treated as bread flour or all-purpose?" }
  ],
  "drafts": [
    { "version": 1, "extractedAt": "...", "data": { "..." } }
  ]
}
```

### `POST /imports/{id}/answers`

```json
{
  "answers": [
    { "questionId": "q1", "text": "Bread flour." }
  ]
}
```

Returns the updated import state (same shape as `GET /imports/{id}`).

### `PATCH /imports/{id}/steps/{stepIndex}`

```json
{
  "action": "rewind"
}
```

Returns the updated import state. The response includes a `warning` field if any answers or drafts will be discarded.

---

## Data model (sketch)

```
imports
  id             uuid  PK
  source_url     text
  source_file_id uuid  FK → uploads
  status         text  (STARTED | WAITING_FOR_INPUT | COMPLETED | FAILED | STOPPED)
  current_step   text
  batch_job_id   bigint  FK → Spring Batch BATCH_JOB_INSTANCE
  created_at     timestamptz
  updated_at     timestamptz

import_drafts
  id             uuid  PK
  import_id      uuid  FK → imports
  version        int
  extracted_at   timestamptz
  data           jsonb

import_questions
  id             uuid  PK
  import_id      uuid  FK → imports
  question_text  text
  answer_text    text  (null until answered)
  created_at     timestamptz
```

The `JobExecutionContext` (stored by Spring Batch in `BATCH_JOB_EXECUTION_CONTEXT`) is the source of truth for the batch runtime. The `import_drafts` and `import_questions` tables are a projected read model for the API layer; they are populated by the batch steps and are never written to directly by the API.

---

## Out of scope for this spec

- Authentication and multi-user support (single-user app).
- File upload mechanics (handled separately).
- The downstream recipe data model (handled in a separate spec).
