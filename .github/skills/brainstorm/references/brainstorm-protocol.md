# Grounded brainstorming protocol

Use this protocol to turn one problem into a small, traceable portfolio of domain-grounded candidates and independently judge each candidate against the durable mental-model system.

## Brainstorm state

Maintain these logical records:

| Record | Purpose |
| --- | --- |
| `problemFrame` | Concrete problem, intended outcome, audience, constraints, non-goals, and success conditions |
| `knowledgeSources` | Repository pages, user context, and exceptional validated external sources considered |
| `groundingMap` | Consequential claims, epistemic statuses, exact support, relevance, and limitations |
| `knowledgeGaps` | Missing or conflicting information and whether each gap can change a verdict |
| `candidateModels` | Durable mental models that may apply to one or more candidates |
| `candidates` | Stable IDs, unchanged statements, distinct mechanisms, assumptions, expected consequences, boundaries, and discriminators |
| `judgments` | One complete `judge` result for each candidate |
| `recommendation` | Best-supported next candidate or a grounded reason no candidate should currently expand |
| `captureSelection` | Candidate IDs explicitly selected by the user for the separate `idea` workflow |

Do not put this state into repository files. It exists to keep the reasoning traceable during the brainstorm.

## Grounding contract

### Source priority

Use sources in this order:

1. Relevant generated learning materials under `docs/`, preserving their cited scope and limitations.
2. User-provided facts and observations, retaining their supplied epistemic status.
3. Other named repository evidence directly relevant to the problem.
4. Validated authoritative external sources, only under the verdict-changing gap gate.

The language model's memory is not a source. It may suggest where to look, but it cannot support a consequential domain claim.

### Repository knowledge selection

Start from `docs/README.md` when available. Select topic roots and modules by their stated learning goal, mechanism, prerequisites, and boundaries. Read the selected pages rather than relying on index summaries.

For each consequential item, record:

| Field | Required content |
| --- | --- |
| ID | Stable `K-*` identifier |
| Claim | Concise claim actually supported by the source |
| Epistemic status | `repository knowledge`, `verified external fact`, `user observation`, `mental-model claim`, `inference`, `hypothesis`, or `illustration` |
| Support | Exact repository-relative page and section, user statement, or validated external citation |
| Relevance | How the item bears on the problem or candidate mechanism |
| Limitation | Scope, version, uncertainty, contradiction, or `None identified` |

Do not promote an inference, exercise result, analogy, or mental-model claim into domain fact.

### Verdict-changing external research gate

External research is allowed only when all of these conditions hold:

1. A specific missing or conflicting premise has been identified.
2. The premise can change whether at least one otherwise grounded candidate receives `expand`, `do not expand`, or `park`.
3. The question can be investigated without broadening the brainstorm into a new learning curriculum.
4. An authoritative primary or first-party source can plausibly resolve or narrow it.

Research only the bounded question. Open every cited source, confirm it supports the nearby claim, preserve version and scope limits, and cross-check a consequential or disputed claim when possible.

If the gate fails, leave the gap visible. Constrain or park the affected candidate instead of researching freely.

When repository knowledge is too thin to generate defensible candidates at all, stop and identify the smallest `/learn` topic or user-supplied evidence needed. Do not use external research to silently construct an entire substitute knowledge base.

## Divergence contract

### Candidate count

Generate three to five candidates by default. A smaller portfolio is correct when fewer distinct mechanisms are supported. State the limiting evidence or constraint instead of creating filler.

### Material difference test

Two candidates are materially different only when at least one of these differs in a way that changes the expected consequence or decision:

- The mechanism producing the outcome.
- The intervention point.
- The resource or capability being changed.
- The feedback, incentive, information, or control relationship.
- The boundary conditions under which the candidate should work.
- The smallest discriminating test.

Differences in wording, branding, presentation, sequencing, implementation technology, or scale do not establish a separate idea when the mechanism and decision implication remain the same.

### Candidate record

Every candidate must contain:

| Field | Required content |
| --- | --- |
| Candidate ID | Stable `B-*` identifier |
| Label | Concise descriptive name |
| Candidate statement | One unchanged proposal or claim |
| Distinct mechanism | How it differs causally or structurally from the other candidates |
| Grounding | Relevant `K-*` items and what each contributes |
| Assumptions | Required conditions with explicit epistemic statuses |
| Expected consequence | Predicted effect on the intended outcome |
| Boundary or risk | Material condition that could make the candidate fail or cease to apply |
| Smallest discriminator | Smallest observation, experiment, or decision that distinguishes its usefulness |

The candidate statement is immutable during judgment. If judgment reveals a stronger alternative, record it as a derived idea under the `judge` contract or assign it a new candidate ID and judge it separately.

## Judgment composition contract

Use the `judge` skill and its judgment protocol as the canonical source for model selection, basis gates, reasoning traces, verdicts, confidence, secondary outputs, and failure behavior. This protocol does not weaken or replace those requirements.

Apply judgment independently:

- One candidate statement becomes one original idea.
- The brainstorm's intended outcome becomes its intended use.
- Shared domain knowledge may be reused, but model applicability and mechanism mapping must be evaluated separately.
- Every candidate receives exactly one primary verdict.
- A candidate without an applicable durable mental model receives `park`, not an inferred verdict.
- Conflicting models remain visible; do not flatten them into agreement to force a decision.
- A derived idea does not improve or replace the original candidate's verdict.

Preserve the complete judgment fields for every candidate:

- Verdict, confidence, decision, and negative reason code when applicable.
- Original candidate and evaluated interpretation.
- Intended use.
- Mental-model artifacts and canonical claims used, or the explicit missing basis.
- Full reasoning trace with epistemic statuses.
- Derived ideas and mental-model contribution candidates when present.
- Smallest next action.

In the judgment reasoning trace, use the epistemic labels required by `judge`. A repository or external claim may become `verified fact` only when its underlying support establishes that status; retain the exact source and its limitations. Keep repository synthesis, analogy, and uncertainty labeled as inference, hypothesis, illustration, or another accurate status rather than promoting them because they appear under `docs/`.

## Complete output format

Present the result as:

```markdown
# Brainstorm: <concise problem label>

## Problem frame

- Problem: <concrete problem>
- Intended outcome: <desired result>
- Audience: <affected user or decision maker>
- Constraints: <material constraints or `None supplied`>
- Non-goals: <explicit exclusions or `None supplied`>
- Success conditions: <observable conditions>

## Grounding map

| ID | Claim | Epistemic status | Support | Relevance | Limitation |
| --- | --- | --- | --- | --- | --- |

## Knowledge gaps

| Gap | Why it matters | Verdict-changing? | Treatment |
| --- | --- | --- | --- |

## Candidate portfolio

### B-01: <label>

- Candidate statement: <unchanged statement>
- Distinct mechanism: <mechanism>
- Grounding: <K-* references and contribution>
- Assumptions: <status-labeled assumptions>
- Expected consequence: <effect on intended outcome>
- Boundary or risk: <material limit>
- Smallest discriminator: <observation, experiment, or decision>

#### Judgment

- Verdict: `expand`, `do not expand`, or `park`
- Confidence: `high`, `medium`, or `low`
- Decision: <one-sentence conclusion>
- Reason code: <required for `do not expand`; otherwise `Not applicable`>
- Source: `Brainstorm candidate B-01`
- Original idea: <the unchanged candidate statement>
- Evaluated interpretation: <neutral interpretation used for judgment>
- Intended use: <the brainstorm's intended outcome>

##### Mental-model basis

| Artifact | Canonical claim used | Applicability | Status or limitation |
| --- | --- | --- | --- |

<When no relevant artifact exists, write `No relevant durable artifact found` instead of presenting an empty table as evidence.>

##### Reasoning trace

| Step | Item | Epistemic status | Support or limitation |
| --- | --- | --- | --- |

##### Derived ideas

<Candidate table with derivation, distinction, intended use, and smallest test, or `None`.>

##### Mental-model contribution candidates

<Candidate table with type, target, contribution, epistemic status, and remaining validation, or `None`.>

##### Next action

<Smallest useful expansion, test, stop condition, or resumption input.>

<Repeat for every candidate.>

## Portfolio view

| Candidate | Distinct mechanism | Verdict | Confidence | Main limitation | Next action |
| --- | --- | --- | --- | --- | --- |

## Recommendation

<Best-supported candidate and why it serves the intended outcome, or why no candidate should currently expand. Preserve material uncertainty.>
```

After rendering the complete result, use `ask_user` to ask which candidate, if any, should be saved. Include stable IDs and labels in the choices. Do not place the only copy of the portfolio in hidden reasoning or an unseen artifact.

## Capture handoff

A candidate is selected only when the user identifies its stable ID or unchanged statement after seeing the portfolio. A prior request such as "save the best idea" is not selection because the unchanged candidate did not yet exist for the user to inspect.

For a selected candidate:

1. Keep the candidate statement unchanged.
2. Retain the intended outcome as capture context.
3. Load `idea` and follow its complete secret check, collision handling, raw-idea fidelity, and validation rules.
4. Keep the judgment in the brainstorm result; do not append it to the raw idea unless a future idea schema explicitly owns that metadata.
5. Report the created path without implying that capture changed the candidate's verdict.

If the user selects several candidates, process only the explicitly named set and preserve each as a separate idea record. If the selection is ambiguous, ask one focused question.

## Completion check

- The problem frame is concrete enough to select knowledge and evaluate usefulness.
- The grounding map contains every consequential domain premise used by a candidate.
- Repository support links to exact pages or sections rather than index summaries.
- External research passed the verdict-changing gate and remained bounded.
- Each candidate passes the material difference test.
- Each candidate record contains all required fields.
- Candidate statements did not change during judgment.
- Every candidate has one complete judgment with a relevant model basis or explicit missing basis.
- Parked and negative candidates remain visible.
- The recommendation follows the judgments and does not hide uncertainty.
- The complete portfolio was shown before capture selection.
- No candidate was saved without an explicit post-portfolio selection.
- Every selected candidate was handed to `idea` unchanged and saved separately.

When a check fails, correct the output if the existing evidence supports the correction. Otherwise expose the gap, park the affected candidate, or stop without generating or saving unsupported material.
