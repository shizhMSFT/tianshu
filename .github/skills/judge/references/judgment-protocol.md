# Idea judgment protocol

Use this protocol to decide whether an unchanged idea is worth expanding for a stated use. The protocol produces one primary verdict and may also expose useful secondary outputs.

## Judgment state

Maintain these logical records while evaluating:

| Record | Purpose |
| --- | --- |
| `ideaSource` | Inline request or repository-relative path |
| `originalIdea` | The unchanged idea being judged |
| `evaluatedInterpretation` | Neutral statement of the idea's proposed action or claim |
| `intendedUse` | The outcome against which expansion has value |
| `suppliedEvidence` | User observations, cited facts, assumptions, and hypotheses |
| `candidateModels` | Durable artifacts considered and why they may apply |
| `selectedModels` | Relevant artifacts and canonical claims used |
| `modelConflicts` | Scope, mechanism, or implication disagreements that may change the verdict |
| `reasoningTrace` | Mapping from idea through model to consequence |
| `primaryVerdict` | Exactly one of `expand`, `do not expand`, or `park` |
| `derivedIdeas` | Optional materially distinct ideas produced by the reasoning |
| `modelContributions` | Optional candidate changes or additions for the mental-model system |
| `nextAction` | The smallest useful expansion, stop condition, or resumption input |

## Basis gate

A judgment may pass to a substantive verdict only when every gate passes:

| Gate | Pass condition | Failure result |
| --- | --- | --- |
| Idea | The original proposal or claim is identifiable without rewriting it | `park` and request the missing idea |
| Intended use | Success or usefulness can be evaluated for one concrete use | `park` and request the decision-changing use |
| Durable basis | At least one relevant standalone artifact exists under `mental-models/` | `park` and identify the missing model basis |
| Relevance | The artifact's intended use, mechanism, and scope apply to the idea | `park` or select a different artifact |
| Mechanism mapping | The idea's assumptions and action can be walked through the model | `park` and identify the missing link |
| Boundary resolution | No unresolved boundary or model conflict controls the result | `park` and name the discriminator |
| Premise status | Every verdict-controlling premise has an explicit epistemic status and is either supported or worth resolving through a bounded test under the model | `park` when the missing premise also prevents deciding whether that test is useful |

A `park` result is not a weak rejection. It records that the current basis cannot distinguish expansion from stopping.

## Selecting mental models

Use `mental-models/README.md` as an index, not as sufficient evidence. A title, purpose summary, or shared term may identify candidates but cannot support the verdict.

For each candidate:

1. Read the complete artifact.
2. Identify its type, status, audience, intended use, one-sentence model, mechanism, worked cases, boundaries, epistemic items, open questions, and next test.
3. Read direct dependencies or constituents whose canonical claims the candidate consumes.
4. Record the exact claim that bears on the idea.
5. Check whether the idea matches the claim's starting conditions and remains inside its boundaries.

An artifact with status `exploring`, `refining`, or `parked` can inform a judgment, but its unresolved issue must lower confidence or force `park` when that issue controls the result. Do not treat `done` as proof that the model applies outside its stated purpose.

When selected models disagree:

- Prefer the model whose stated scope and intended use match the idea more closely.
- Preserve genuine disagreement rather than inventing a synthesis.
- If one obtainable observation distinguishes the models, use `park` and name it.
- If the choice depends on which intended use matters, ask one focused question through `ask_user`.

## Reasoning trace

Build the trace before choosing a verdict:

| Step | Required content |
| --- | --- |
| 1. Idea claim | What the unchanged idea proposes and which result it expects |
| 2. Starting conditions | Assumptions and observations required for the idea to enter the model |
| 3. Mechanism mapping | How the model says the proposal interacts with relevant conditions |
| 4. Predicted consequence | What follows for the stated intended use |
| 5. Boundary and contrast | Where the mapping may fail, plus a real contrast or clearly labeled illustration when available |
| 6. Decision implication | Why expansion, stopping, or parking follows |
| 7. Discriminator | The smallest observation or test that could change the decision |

Label each consequential item as `verified fact`, `user observation`, `model claim`, `inference`, `hypothesis`, or `illustration`. Link a model claim to the artifact section that canonically states it. Do not cite the index summary as the canonical claim.

## Primary verdict rules

### `expand`

Choose `expand` only when:

- Every basis gate passes.
- The model implies a useful consequence or a worthwhile discriminating test for the intended use.
- The consequence adds a meaningful distinction, decision, prediction, application, or test rather than restating the model or idea.
- A bounded next expansion or test can be named.
- Remaining uncertainty is visible and does not erase the expected value of that next step.

### `do not expand`

Choose `do not expand` only when:

- Every basis gate passes.
- The selected model supplies a clear reason the original idea will not serve the intended use.
- The reason is robust to the model's material boundaries and open questions.
- No small, unresolved discriminator is likely to reverse the result.
- Stopping avoids work that is duplicate, trivial, mis-scoped, unsupported, or directed through a failed mechanism.

Use one or more precise reason codes:

| Reason | Meaning |
| --- | --- |
| `contradicted premise` | A verdict-controlling premise conflicts with a supported fact or applicable model claim |
| `mechanism failure` | The proposed action does not produce the expected consequence under the model |
| `boundary mismatch` | The idea applies the model where its required conditions do not hold |
| `duplicate restatement` | The idea repeats an existing canonical claim without a new case, implication, or test |
| `trivial consequence` | Expansion adds no decision-relevant or explanatory distinction for the intended use |
| `no useful testable consequence` | No bounded observation, prediction, or action follows from the proposal |

A derivative idea may be worth pursuing even when the original receives `do not expand`. Keep that as a secondary output rather than upgrading the original verdict.

### `park`

Choose `park` when any basis gate fails, relevant artifacts conflict on a verdict-controlling implication, or the model's unresolved uncertainty prevents a defensible decision.

Name:

1. The exact blocker.
2. Why it can change the verdict.
3. The smallest clarification, observation, source check, model, or model refinement needed to resume.

Do not use `park` to avoid a well-supported negative judgment.

## Confidence

Assign `high`, `medium`, or `low` confidence to the primary verdict:

- `high`: the relevant model and its support directly cover the idea's conditions, and no material boundary or open question threatens the decision.
- `medium`: the mapping is supported but depends on a bounded inference or non-controlling uncertainty.
- `low`: the verdict is mostly a navigation decision, normally `park`, because a missing fact, weak model, or conflict could reverse it.

Confidence describes support for the verdict, not enthusiasm for the idea.

## Secondary outputs

### Derived ideas

A derived idea must contain:

- A concise candidate statement.
- The model implication, boundary, counterexample, inversion, or tension that generated it.
- Its material difference from the original idea.
- Its intended use and smallest discriminating test.

Reject a candidate that is only a paraphrase, stylistic rewrite, broader slogan, or unsupported brainstorm.

### Mental-model contribution candidates

Classify each candidate:

| Type | Required contribution |
| --- | --- |
| `evidence` | A labeled observation or validated source that bears on an existing claim |
| `boundary` | A condition that narrows or qualifies where an existing model applies |
| `counterexample` | A case that conflicts with the model's expected implication |
| `correction` | A specific claim or mechanism that may be wrong, with the conflicting support |
| `application` | A bounded context that consumes one or more existing core models |
| `open question` | An unresolved question that could change confidence, scope, or use |
| `new-model seed` | A concrete friction or mechanism not represented by a relevant durable artifact |

For an existing target, link the artifact and canonical section affected. State the candidate's current epistemic status and what validation or approval remains. For a `new-model seed`, state the concrete missing decision basis without pretending a standalone model already exists.

Do not write the contribution into `mental-models/`. A later user request must be handled by `build-mental-model`.

## Complete result format

```markdown
# Judgment: <concise idea label>

## Primary verdict

- Verdict: `expand`, `do not expand`, or `park`
- Confidence: `high`, `medium`, or `low`
- Decision: <one-sentence conclusion for the intended use>
- Reason code: <required for `do not expand`; otherwise `Not applicable`>

## Idea and intended use

- Source: <inline or repository-relative path>
- Original idea: <unchanged idea, safely abbreviated only when sensitive>
- Evaluated interpretation: <neutral interpretation used for judgment>
- Intended use: <concrete outcome>

## Mental-model basis

| Artifact | Canonical claim used | Applicability | Status or limitation |
| --- | --- | --- | --- |

## Reasoning trace

| Step | Item | Epistemic status | Support or limitation |
| --- | --- | --- | --- |

## Derived ideas

<Candidate table with derivation, distinction, intended use, and smallest test, or `None`.>

## Mental-model contribution candidates

<Candidate table with type, target, contribution, epistemic status, and remaining validation, or `None`.>

## Next action

<Smallest useful expansion or test, reason to stop, or exact input needed to resume.>
```

When the verdict is `park` because no relevant artifact exists, the mental-model basis must say `No relevant durable artifact found` rather than presenting an empty table as evidence.

## Completion check

- All basis gates were evaluated.
- The cited artifacts, canonical claims, and relevant dependencies were read.
- The reasoning trace distinguishes the idea, model claims, evidence, and inference.
- Exactly one primary verdict appears and its confidence is justified.
- A negative verdict has a precise reason code.
- A parked verdict has a verdict-changing blocker and resumption input.
- Secondary outputs are optional, traceable, and do not silently replace the original idea.
- No repository artifact was modified by the judgment.
