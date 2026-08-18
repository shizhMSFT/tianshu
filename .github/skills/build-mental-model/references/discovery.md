# Blank-slate discovery

Use this reference while turning a blank slate, concrete itch, or conversation-grown seed into a model that can stand on its own. Do not write under `mental-models/` until the readiness gate passes and the complete artifact proposal is approved.

## Interaction contract

- Use `ask_user` for every question.
- Ask one focused question at a time.
- Prefer recognizable choices when the user does not have vocabulary for the problem.
- Ask for one concrete case before requesting a general rule.
- Ask only about information that can change the framing, boundary, evidence, artifact type, or next test.
- Preserve prior answers, rejected framings, and unresolved tensions across revisions.
- Never ask the user to name or invent a mental model.
- Never ask whether to continue when the next useful discovery step is already clear.

## Discovery state

Maintain these logical records throughout the conversation:

| Record | Purpose |
| --- | --- |
| `audience` | The person expected to use and understand the model |
| `intendedUse` | Whether the model should help explain, predict, decide, communicate, or design |
| `frictions` | Concrete recurring decisions, surprises, failures, trade-offs, or unstable rules of thumb |
| `cases` | Real situations and their relevant starting conditions, actions, and outcomes |
| `contrasts` | Near misses, counterexamples, or cases with different outcomes |
| `observations` | What the user directly observed, separated from interpretation |
| `candidateFramings` | Competing minimal claims, mechanisms, trade-offs, and discriminating observations |
| `decisions` | Chosen and rejected framings with reasons |
| `boundaries` | Conditions where the model may not apply or may mislead |
| `epistemicItems` | Verified facts, user observations, inference, hypotheses, and illustrations |
| `openQuestions` | Unresolved questions that materially affect confidence or usefulness |
| `nextTests` | Small observations or checks that could change confidence |

Reuse these records when the user changes direction. Do not repeat a question whose answer is already represented unless the user explicitly revises it.

## Blank-slate entry

If the user says they have no idea, help them recognize a starting signal. Ask which category is closest:

1. A recurring decision that is harder than it should be.
2. A repeated outcome they cannot explain.
3. An approach that works in some cases and fails in others.
4. A trade-off they keep encountering.
5. A rule of thumb they use but do not fully trust.

These are discovery handles, not model categories. After the user selects one, ask for one recent concrete instance. Do not propose an abstraction before a case exists.

If the user cannot identify an instance, ask for the environment or activity where they want better judgment and then offer narrower, recognizable categories from that context. If no concrete signal emerges, park the attempt and identify the smallest observation to collect.

## Discovery loop

### 1. Establish intended use

Infer the likely audience and whether the desired outcome is explanation, prediction, decision support, communication, or design. Ask for correction only when a different answer would change the model.

A model may serve more than one use, but choose one primary use for the first artifact. Avoid a universal model whose success criteria cannot be stated.

### 2. Capture one case

For one real case, distinguish:

1. The relevant starting conditions.
2. What changed, acted, or was compared.
3. The observed outcome.
4. What was surprising, costly, or difficult to decide.
5. The user's current interpretation, if any.

Do not silently convert interpretation into observation.

### 3. Find a contrast

Seek a counterexample, near miss, or similar case with a different outcome. A contrast often exposes which condition or relationship the model must represent.

If no contrasting case is available, record that limitation. Do not invent one. A hypothetical may be used only when labeled as an illustration or proposed test.

### 4. Generate candidate framings

Create two to four framings from the current user's material. Each must differ in its organizing mechanism or relationship, not only its label.

For each framing, state:

| Field | Requirement |
| --- | --- |
| Minimal claim | The smallest useful statement the framing asks the user to hold |
| Case mapping | How the framing accounts for the concrete case |
| Intended use | What it could help explain, predict, or decide |
| Preserves | Which observations or distinctions remain visible |
| Sacrifices | Which detail or alternative interpretation it intentionally omits |
| Discriminator | An observation that would favor or weaken it relative to another framing |

Do not add formal notation unless it makes a distinction testable or prevents ambiguity.

### 5. Narrow with evidence or decision

When an obtainable observation can distinguish the candidates, ask for or propose that observation before requesting a preference.

When the remaining choice depends on desired use or acceptable trade-offs, use `ask_user`. Recommend the framing that best serves the stated use while preserving the observed cases and uncertainty. Keep rejected framings and reasons in `decisions`.

### 6. Explain the mechanism

Walk the chosen framing through the concrete case:

1. State the relevant initial condition.
2. Identify what acts, changes, or is compared.
3. Explain why the transition follows under the model.
4. State the resulting observation, prediction, or decision implication.
5. Identify where evidence ends and inference begins.

If the chain cannot be explained without phrases such as "it just works," the model is not ready. Ask about the smallest missing link.

### 7. Stress the model

Apply the framing to:

- The original case.
- A contrast, counterexample, or near miss when available.
- One nearby hypothetical labeled as an illustration when it exposes a boundary.

Record where the model becomes uncertain, loses predictive value, or requires an assumption. A model with explicit limits is stronger than a broader model that hides them.

### 8. Choose the next test

Define the smallest observation, comparison, source check, or bounded experiment that could materially raise or lower confidence. The test must name:

- What will be observed.
- Which claim or assumption it bears on.
- What result would raise confidence.
- What result would lower confidence or trigger reframing.

Do not prescribe a test that is costly, unsafe, or impossible for the user merely to make the artifact appear rigorous.

## Readiness gate

A seed is ready for a durable proposal only when all of the following are true:

- The problem or intended use is concrete.
- The model can be stated in one sentence without relying on unexplained conversation.
- The mechanism or organizing relationship can be walked through step by step.
- At least one real worked case maps to the mechanism.
- At least one boundary, failure mode, or material uncertainty is visible.
- Observations, external facts, inference, hypotheses, and illustrations can be distinguished.
- The remaining open questions are explicit.
- A smallest next test is named, or there is a justified reason no test is currently useful.
- The artifact can be read by its intended audience without the chat transcript.

Do not waive a missing element because the prose sounds polished. Do not require every uncertainty to be resolved; `exploring` exists for standalone models with honest open questions.

## Parking and resumption

Park when the conversation lacks a concrete case, a meaningful distinction, a defensible mechanism, or an obtainable next step.

For a pre-artifact seed:

- Keep it out of `mental-models/`.
- Summarize the concrete material already learned.
- Name the exact missing input.
- Give one smallest observation or decision that would allow resumption.

For an existing standalone artifact:

- Preserve the artifact.
- Set its status to `parked` only after approval.
- Record the blocker and resumption condition in its open questions or next-test content.

On resumption, restore the discovery state and ask only about newly available information.

## Neutral process example

The following is an interaction shape, not a supplied mental model:

1. The user has no starting idea.
2. Ask them to choose a recognizable starting signal such as `<recurring decision>` or `<unexplained outcome>`.
3. Ask for one recent `<case>` with a starting condition and observed outcome.
4. Ask for a `<contrast>` or record that none is known.
5. Generate `<framing A>` and `<framing B>`, each with a different mechanism, preserved detail, sacrificed detail, and discriminator.
6. Ask one question that selects between the framings or clarifies the intended use.
7. Walk the chosen framing through the case, expose `<boundary>`, and define `<next test>`.
8. Apply the readiness gate before proposing any file.

Do not replace placeholders in this reference with a methodology source repository's domain content.
