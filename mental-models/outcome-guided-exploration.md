# Outcome-Guided Exploration

| Field | Value |
| --- | --- |
| Type | `core` |
| Status | `exploring` |
| Audience | Tianshu users and skill authors choosing the next action when a request or desired outcome is incomplete |
| Created | 2026-08-19 |
| Updated | 2026-08-19 |
| Depends on | None |

## Problem and intended use

Broad requests often hide several possible transformations. Choosing a familiar skill too early can optimize the wrong state change, while planning the entire path can create false confidence before decisive unknowns are exposed.

This model helps a reader decide the next action when the acceptable outcome, the route to it, or the evidence required is incomplete. It is intended to keep progress and learning coupled without turning every request into an open-ended investigation.

## Model in one sentence

When the desired outcome is incomplete, choose a bounded next action that can both move toward an acceptable result and reduce decision-relevant uncertainty; preserve what the result teaches, then stop, repeat, hand off, or park according to explicit evidence.

## Definitions

- **Acceptable outcome:** A provisional description of success plus the evidence that would make it credible. It may become more precise as work proceeds.
- **Bounded next action:** A limited, authorized, and reversible action whose cost and possible outcomes can be stated before it runs.
- **Decision-relevant uncertainty:** An unknown whose resolution could change the next action, the success criteria, or whether work should continue.
- **Preserved learning:** An observed result, changed constraint, or rationale retained in the state owned by the current workflow rather than left only in transient reasoning.

## Mechanism

1. **State a provisional acceptable outcome.** Describe what should be different and what evidence would count. Mark any part that remains a hypothesis or preference.
2. **Generate distinct bounded actions.** Identify actions that differ in what they change or reveal. Do not disguise one plan as several wording variants.
3. **Compare the actions.** Consider expected movement toward the outcome, reduction of a decision-relevant unknown, cost, reversibility, authority to act, and available validation. Reject an action whose result cannot be interpreted well enough to guide the next decision.
4. **Execute one bounded action.** Keep its scope narrow enough that its observed result can be attributed without treating the expected result as fact.
5. **Classify the result.** Record whether the observation supports the current direction, contradicts it, leaves the decisive uncertainty unresolved, or exposes a blocker.
6. **Preserve changed state.** Retain the evidence, revised constraint, and relevant rationale in the artifact or workflow that owns them. Do not silently promote an observation into a general claim.
7. **Choose the transition.** Stop when the acceptable outcome is supported; repeat when another justified action can reduce a remaining uncertainty; hand off when another owner must change state; or park when no justified next action exists.

The mechanism values an action for both movement and learning, but it does not require both to be maximal. A small diagnostic action may be preferable when it can prevent a large commitment to the wrong outcome. A direct transformation may be preferable when the outcome and validation are already clear.

## Worked case: choosing a model for an uncertain goal

On 2026-08-19, a user asked Tianshu to form a reusable core model but did not initially specify which decision the model should optimize.

### Observed sequence

1. The request did not identify the intended use of the model or an existing destination artifact.
2. A bounded discovery pass gathered relevant constraints, candidate mechanisms, and boundaries before any durable artifact was changed.
3. Inspection of Tianshu showed that no `mental-models/` index existed and that durable models require a concrete use, independent grounding, explicit epistemic status, and approval before persistence.
4. Four Tianshu-grounded framings were compared by intended use. The user selected choosing the next action under uncertain goals.
5. A complete core-artifact proposal was presented and approved before files were created.

### Model interpretation

The initial discovery action was useful because it both advanced the request and reduced a decisive uncertainty: which decision the model should serve. Local inspection then established the constraints of a valid artifact. Comparing framings exposed the remaining choice about primary use, and the user's selection made the artifact type and mechanism concrete.

The case did not justify treating the first plausible framing as authoritative. The supported next action was to create an independently grounded Tianshu core with honest provenance and an `exploring` status.

## Boundaries and failure modes

- **Fully specified transformations:** When the input, output, owner, and validation are already clear, exploration adds ceremony. Execute the owning contract directly.
- **Weak or misleading validation:** A result can appear to reduce uncertainty while only confirming an inadequate success criterion. Validation strength must remain visible.
- **Irreversible or high-risk actions:** Information value does not authorize action. Safety, approval, and ownership gates take precedence.
- **Expensive or delayed feedback:** The model may not determine how much to invest before evidence arrives. Parallel work can also make attribution harder.
- **Changing or adversarial conditions:** A provisional outcome or validation method may become stale or be manipulated. This model does not supply a threat model.
- **Authority and dependency:** Choosing an informative action does not decide which artifact owns the result or which dependency direction is valid. Tianshu's artifact contracts still govern those questions.
- **Generic-checklist misuse:** If every action is described as informative after the fact, the model loses discriminatory value. The decisive uncertainty and possible confidence-changing outcomes must be named before acting.

## Evidence and epistemic status

| Claim or item | Status | Support | Confidence or limitation |
| --- | --- | --- | --- |
| Tianshu skills have distinct outputs, owners, gates, and valid terminal states. | `verified fact` | [Tianshu overview](../README.md), [System and artifact model](../docs/tianshu/deep/01-system-and-artifact-model.md), and [Cross-skill orchestration](../docs/tianshu/deep/07-cross-skill-orchestration.md) | Verified against repository documentation current on 2026-08-19; runtime behavior may change with the contracts. |
| Tianshu requires a concrete use, mechanism, real case, boundaries, epistemic separation, and approval before a durable model is written. | `verified fact` | [Mental-model lifecycle](../docs/tianshu/deep/03-mental-model-lifecycle.md) and the repository's build-mental-model contract | This establishes the artifact requirements, not the truth of this model's central hypothesis. |
| The selected primary use was choosing the next action under uncertain goals. | `user observation` | The explicit framing selection on 2026-08-19 | Describes this case only. |
| A bounded action should be valued for both progress and reduction of a decision-relevant unknown. | `inference` | The worked case and Tianshu's documented use of gates, feedback, explicit handoffs, and honest stopping | Plausible across Tianshu workflows but not yet tested prospectively across several real requests. |
| This mechanism will choose better next actions than selecting a skill by name alone on ambiguous requests. | `hypothesis` | Derived from the mismatch between broad requests and Tianshu's narrow skill contracts | Requires prospective comparison; "better" must be judged by clarity, avoided rework, and honest stopping rather than task completion alone. |
| Regenerating a quiz from already approved lessons should bypass exploration and invoke the quiz contract directly. | `illustration` | Constructed from Tianshu's documented quiz boundary | Explains a boundary; it is not evidence from an observed run. |

## Open questions

- How should movement toward the outcome and uncertainty reduction be traded off when they favor different actions?
- When is conversational state sufficient, and when must learning become a durable artifact before another action?
- Does the model remain discriminating when validation is expensive, delayed, or only partially aligned with the acceptable outcome?

## Next smallest test

Apply the model prospectively to two real Tianshu requests: one whose desired outcome is ambiguous and one deterministic transformation with clear validation.

Before acting, record the provisional outcome, decisive uncertainty, candidate next actions, and expected confidence-changing results. Confidence in the model rises if it selects a clearer bounded action and honest stop without unnecessary ceremony. Confidence falls, or the framing should change, if it reduces to a generic checklist, conflicts with an ownership gate, or adds no value over selecting the owning skill directly.

## Related artifacts

- [Mental-model index](README.md)
- Evidence context: [End-to-end capstone](../docs/tianshu/deep/09-end-to-end-capstone.md)
