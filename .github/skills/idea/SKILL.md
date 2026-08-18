---
name: idea
description: Capture a user's raw idea, clarify its intention only when needed to understand it, and save a concise durable record under ideas/. Use when a user asks to record, capture, save, note, or remember an idea, including when they invoke /idea.
---

# Idea

Turn the user's idea into a faithful, durable note without expanding or evaluating it.

## Inputs

The current user request supplies the idea. It may also include the idea's purpose, intended audience, problem, desired outcome, or constraints.

The idea is required. If `/idea` is used as an invocation prefix, exclude only that prefix from the raw idea. When the user explicitly frames the content with wording such as "record this idea:", preserve the idea content rather than the framing request. Do not rewrite, correct, or complete the user's idea.

## Non-negotiable behavior

- Preserve the raw idea's wording, ordering, punctuation, and line breaks.
- Keep the raw idea visibly separate from the agent's understanding.
- Infer clear context instead of forcing the user through a questionnaire.
- Use `ask_user` for every question, one question at a time.
- Ask about intention only when it is unclear and different plausible intentions would materially change the understanding.
- Capture and clarify only. Do not brainstorm, expand, rank, judge, research, or assess whether the idea is worth pursuing unless the user separately requests that work.
- Write one Markdown file per idea under `ideas/`.
- Never overwrite or silently modify an existing idea record.
- Do not write credentials, tokens, private keys, or other secrets into an idea record.

## Workflow

### 1. Extract the raw idea

Identify the exact idea content in the current request.

If no idea content is present, use `ask_user` to request it. If the boundary between the request and the idea is materially ambiguous, use `ask_user` to ask which text should be recorded. Do not manufacture missing idea content.

Retain the extracted text unchanged for the `Raw idea` section.

### 2. Form a working understanding

Write a concise, neutral restatement of what the idea appears to propose. Capture only information supported by the user's text or existing conversation context.

The understanding should make the proposed concept and its apparent purpose legible without adding features, recommendations, feasibility claims, or value judgments.

### 3. Resolve intention only when necessary

Determine whether the idea's intention is explicit or can be safely inferred.

- If the intention is explicit, record it concisely.
- If one interpretation is clearly supported, record the inferred intention without asking.
- If intention is absent but does not affect the working understanding, record `Not specified`.
- If multiple plausible intentions would materially change the working understanding, use `ask_user` to ask one focused intention question. Prefer concrete choices when the likely alternatives are known.

After an answer, update the understanding only as needed. Do not request approval of the note or ask optional follow-up questions.

### 4. Choose a safe destination

Use the user's local current date and derive a short, descriptive kebab-case slug from the idea:

```text
ideas/YYYY-MM-DD-<slug>.md
```

Keep the slug specific enough to recognize the idea without turning it into a summary. If the path already exists, append the next available numeric suffix, starting with `-2`:

```text
ideas/YYYY-MM-DD-<slug>-2.md
```

Create `ideas/` when it does not exist. Never replace, merge with, or edit an existing record as part of a new capture.

### 5. Check for secrets

Before writing, inspect the raw idea for credentials, tokens, private keys, or equivalent secrets.

If any are present, do not write the file. Use `ask_user` to request a redacted version of the idea. Preserve the redacted replacement as the raw idea; never reproduce the detected secret in the question or final response.

### 6. Write the idea record

Use this structure:

```markdown
# <Concise descriptive title>

- Captured: YYYY-MM-DD

## Raw idea

<Exact idea text>

## Understanding

<Concise neutral restatement>

## Intention

<Explicit or safely inferred intention, or `Not specified`>
```

The title and understanding are interpretations; the `Raw idea` section is not. Do not add metadata, analysis, next steps, open questions, sources, or generated elaboration that the user did not request.

### 7. Validate and finish

Before completion, verify:

- The file is under `ideas/` and follows the dated naming convention.
- No existing file was overwritten or modified.
- The `Raw idea` text matches the extracted user text exactly.
- The understanding is concise, neutral, and grounded only in supplied context.
- The intention follows the conditional clarification rules.
- No secret or unsupported expansion was written.

End with the created repository-relative path and a one-sentence description of what was captured.

## Failure rules

- Do not write a record when the idea itself is missing.
- Do not guess when ambiguity would materially change what gets recorded.
- Do not treat silence as an answer to a necessary clarification.
- Do not claim a file was saved if the write failed.
- Do not expose private or confidential content outside the requested repository record.
