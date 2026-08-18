# Correctness-preserving refinement

Use this reference for an existing standalone mental-model artifact. The goal is to make it more coherent, complete, reusable, and concise without weakening its claims, boundaries, evidence, or uncertainty.

## Refinement principles

- Review findings before rewriting.
- Prefer the smallest change that fixes a demonstrated problem.
- Treat complexity as a diagnostic signal, not proof that the framing is wrong.
- Preserve a coverage ledger across reframing, relocation, de-duplication, and compression.
- Stabilize completeness and consistency before optimizing brevity.
- Give every important claim one canonical home.
- Re-run affected checks after every removal or relocation.
- Do not introduce a new mental model merely to make the prose appear more elegant.

## Preflight

Before proposing changes:

1. Read the complete artifact.
2. Read its direct dependencies and any linked artifact whose canonical claim will be changed.
3. Inspect `mental-models/README.md` and inbound links when discoverable.
4. Record the artifact type, status, intended audience, intended use, dependencies, one-sentence model, major claims, cases, boundaries, epistemic items, open questions, and next test.
5. Build a coverage ledger mapping each important claim or qualification to its current canonical location.
6. Check whether the request already identifies exact edits. Even then, surface any coverage or dependency risk before applying them.

Do not edit during preflight.

## Finding format

Report each actionable finding with:

```text
Severity: blocking | minor
Location: <section or claim>
Problem: <specific inconsistency, omission, duplication, or dependency issue>
Why it matters: <effect on reasoning or reuse>
Smallest safe fix: <targeted change>
Coverage risk: <what must remain true after the fix>
```

Use `blocking` when the issue can make the model materially wrong, internally contradictory, untestable, dependent on hidden context, epistemically misleading, cyclic, or unusable for its stated purpose.

Use `minor` when the issue weakens clarity, navigation, canonicalization, or precision without changing the main conclusion.

Do not report style preferences as correctness findings.

## Phase 0: framing check

Run this cheap check before detailed refinement.

### Minimal model test

Write one sentence that states the minimum model the intended reader must hold. Then verify:

- Every major section contributes to that model, tests it, bounds it, applies it, or records remaining uncertainty.
- The mechanism can be explained without depending on a later undefined concept.
- The artifact has one primary center of gravity.

### Strong evidence for reframing

Consider reframing only when one or more of these are demonstrated:

- The same conceptual work recurs across multiple sections because no canonical home exists.
- Essential reasoning repeatedly depends on concepts introduced later.
- A required enumeration or mechanism cannot be completed under the current structure.
- Two independent centers compete for the same artifact.
- The current one-sentence model cannot cover the worked case and stated boundary without contradiction.

Length, density, unfamiliarity, or complexity alone are not sufficient evidence.

### Coverage-preserving replacement

Before proposing a reframe:

1. Draft a replacement skeleton.
2. Map every coverage-ledger item to a destination.
3. Show which dependency and index links would change.
4. Identify any claim, boundary, source qualification, or open question at risk.
5. Demonstrate that the new framing resolves the structural evidence.

Allow at most two distinct reframe proposals in one refinement run. After two fail to preserve coverage or gain approval, keep the current framing and proceed with local fixes unless the user explicitly requests further exploration.

If reframing is material, include it in the complete approval proposal. Do not reframe silently.

## Phase 1: completeness and consistency

Review the whole artifact before compressing it.

### Purpose and audience

- The problem is concrete.
- The intended audience and primary use are visible.
- Success and misuse can be distinguished.

### Model and mechanism

- The one-sentence model is operational rather than a slogan.
- Starting conditions, changes or comparisons, causal or logical links, and resulting implications are connected.
- Terms are introduced before they are required.
- The mechanism does not rely on chat context or an unstated assumption.

### Cases and boundaries

- At least one real worked case maps to the mechanism.
- Observation and interpretation are separate.
- Counterexamples, near misses, assumptions, and failure modes are retained.
- The model does not claim a broader scope than its cases and evidence support.

### Evidence and uncertainty

- Verified facts have opened, claim-matching sources.
- User observations are not generalized without an explicit inference.
- Inference, hypotheses, and illustrations are labeled.
- Confidence and uncertainty are proportional to support.

### Artifact type and dependencies

- A core model remains independent of its applications and syntheses.
- An application consumes rather than redefines its core models.
- A synthesis preserves constituent differences and links canonical derivations.
- Dependency direction is allowed and acyclic.

### Forward progress

- Open questions could materially change the model.
- The next test bears on a named claim or assumption.
- Confidence-raising and confidence-lowering outcomes are stated.

Resolve blocking completeness and consistency findings before Phase 2. Do not trade missing reasoning for shorter prose.

## Phase 2: canonicalize and de-duplicate

After Phase 1 is stable:

1. Assign every important claim, derivation, boundary, and definition one canonical home.
2. Distinguish necessary recap from repeated derivation.
3. Replace duplicate explanations with concise context and a relative link to the canonical location.
4. Preserve local wording when the application or synthesis adds a genuinely different constraint or implication.
5. Update the index and related-artifact navigation when locations change.

The result should be shorter where repetition was unnecessary, but not weaker:

- No mechanism step disappears.
- No boundary or source qualification is softened.
- No application-specific evidence is moved into a core as if universal.
- No constituent disagreement disappears from a synthesis.

Do not de-duplicate merely similar wording when the claims have different scope or epistemic status.

## Phase 3: regression review

After edits, compare the result with the preflight coverage ledger.

Verify:

- Every ledger item has a canonical destination or an approved reason for removal.
- The one-sentence model still matches the full mechanism.
- The worked case still exercises the stated mechanism.
- Boundaries, failure modes, and uncertainty remain visible.
- Epistemic statuses still match their support.
- Removed sections have no unresolved inbound references.
- Relative links, dependency links, index entries, and navigation resolve.
- The dependency graph remains acyclic.
- Applications still consume the current core claims.
- Syntheses still represent their constituent artifacts accurately.
- Open questions and the next test reflect the revised model.

If a regression appears, fix it with the smallest safe change and repeat the affected checks.

## Refinement approval addendum

Append this content to the artifact approval proposal in [artifact-system.md](artifact-system.md):

```markdown
## Refinement findings

| Severity | Location | Problem | Why it matters | Smallest safe fix | Coverage risk |
| --- | --- | --- | --- | --- | --- |

## Coverage-preserving edit plan

- Claims retained: <canonical claims and locations>
- Content added: <missing mechanism, case, boundary, evidence, or test>
- Content moved: <old and new canonical locations>
- Content removed: <duplication only, with preserved destination>
- Dependencies or links changed: <changes and cycle check>
- Reframe budget: <not needed, first proposal, or second proposal>

## Expected resulting status

<exploring, refining, done, or parked, with reason>
```

Any material change to framing, claims, mechanism, scope, dependencies, evidence status, boundaries, or lifecycle status requires the complete revised proposal to be shown and approved. Typographical or link-only fixes included in an already approved refinement do not require a new approval.

## Completion gate

An artifact may transition to `done` for its stated purpose only when:

- No blocking finding remains.
- Minor findings that affect reasoning, navigation, or reuse are resolved or explicitly accepted.
- The minimal model, mechanism, case, and boundaries are consistent.
- Required evidence is validated and epistemic status is honest.
- Every important claim has one canonical home.
- The artifact is self-contained for its audience.
- Dependency and navigation links resolve.
- The dependency graph is acyclic.
- The regression review passes.
- Open questions do not conceal a prerequisite for the model's stated use.

An artifact may remain `exploring` with meaningful open tests, `refining` while approved corrections are incomplete, or `parked` with a concrete blocker and resumption condition. Do not use `done` as a synonym for polished prose.

## Anti-patterns

- Wholesale rewriting before reporting findings.
- Reframing because the topic is complex.
- Moving content without a coverage map.
- Compressing while mechanism or boundary gaps remain.
- Treating repeated wording as duplication when scope differs.
- Removing counterexamples, uncertainty, or source limitations to improve flow.
- Repairing a core-model flaw only inside one application.
- Making a synthesis sound unified by hiding constituent disagreement.
- Updating dependency metadata without reading the dependency.
- Skipping regression review because the diff is smaller.
