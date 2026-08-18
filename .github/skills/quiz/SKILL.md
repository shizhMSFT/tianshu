---
name: quiz
description: Turn learning materials previously generated under docs/ by the learn skill into an interactive, source-grounded Knowledge Study Canvas with flashcards, multiple-choice questions, weak-area review, and mastery scoring. Use when a user invokes /quiz or asks to test, quiz, review, or assess their understanding of generated learning materials.
---

# Quiz

Build an interactive quiz from existing `/learn` output without researching or rewriting the curriculum.

## Inputs

The user may provide:

- A topic name or `docs/<topic>/` path.
- A topic name or a specific lesson path. Tracks remain an internal content detail.
- A specific lesson path.

Infer a unique topic or explicit track when possible. Do not ask questions whose answers are already present in the request or repository.

## Workflow

### 1. Resolve the learning source

Inspect `docs/README.md` and topic directories under `docs/`.

- If no generated topic exists, tell the user to run `/learn <topic>` first.
- If exactly one topic exists and the user did not name one, use it.
- If several topics match, use `ask_user` to select one.
- If the user supplies a specific lesson, use its parent track.

### 2. Start with a diagnostic pack

Do not ask the learner to select `quick` or `deep`. Start with the `quick` track as the foundation diagnostic pack. The Knowledge Study Canvas uses mastery to decide whether the learner should continue with targeted practice or progress to advanced material.

### 3. Build the Knowledge Pack

Run the bundled adapter from the repository root:

```powershell
node .github\skills\quiz\scripts\build-knowledge-pack.mjs --topic "<topic-root>" --track "quick"
```

The adapter deterministically creates:

```text
.learning/quiz/<topic-id>-<track>/
  manifest.json
  knowledge.md
```

Do not manually rewrite `knowledge.md`, invoke a model to summarize the lessons, or perform new research. The adapter maps each lesson to one stable H2 concept and copies only the authored `Why it matters`, `Core concepts`, and checkpoint knowledge. This preserves the approved curriculum while presenting the structure expected by Knowledge Study.

If generation fails, surface the adapter error and fix the source or adapter. Do not silently fall back to an unvalidated pack.

### 4. Open Knowledge Study

Read the adapter's JSON output and use its absolute `knowledgePackPath`.

Open:

```json
{
  "canvasId": "knowledge-study",
  "instanceId": "study-<topic-id>-<track>",
  "input": {
    "knowledgePackPath": "<absolute path returned by the adapter>"
  }
}
```

If `knowledge-study` is unavailable, state that the Knowledge Study Canvas extension must be installed. Do not paste generated quiz JSON into chat as a fallback.

### 5. Generate the study set

Invoke the Canvas action `generate_study_set` on the opened instance. The Canvas will request model-backed question generation, validate grounding against the derived `knowledge.md`, and update itself when ready.

End after confirming that the interactive Canvas is open and generation has started.

## Contract

- The `/learn` skill owns curriculum, research, citations, and lesson content.
- This skill owns deterministic lesson-to-pack adaptation and Canvas launch.
- The `knowledge-study` Canvas owns question generation, interaction, progress, and mastery.
- `.learning/quiz/` is generated output and may be regenerated when source lessons change.
- Never modify source files under `docs/`.
