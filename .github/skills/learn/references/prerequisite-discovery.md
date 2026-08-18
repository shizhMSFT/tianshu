# Prerequisite discovery

Use this reference only while clarifying a learning goal and constructing its prerequisite graph. Do not write learning documents during this phase.

## Interaction contract

- Use `ask_user` for every question. Never ask through plain chat.
- Ask one focused question at a time.
- Prefer concrete choices when possible.
- Explain a prerequisite in one plain-language sentence before asking about it.
- Ask only about knowledge that is genuinely required for the learning goal.
- Never ask about the same canonical concept twice.
- Never infer that the learner knows a concept unless they confirmed it.
- Preserve all answers when the plan is revised.

A useful knowledge question is:

> **Concept:** Dependency injection **Why it is relevant:** The target framework uses it to construct and connect application services.

Offer these choices:

1. `I know it well enough to use it`
2. `I know some of it, but need a refresher`
3. `I do not know it`

Treat a refresher as learning-plan work, not as satisfied knowledge.

## Graph state

Maintain these logical records throughout the run:

| Record | Purpose |
| --- | --- |
| `concepts` | Canonical key, display name, one-sentence meaning, and evidence for each concept |
| `edges` | Required prerequisite -> dependent concept |
| `visiting` | Concepts on the current recursive path |
| `visited` | Concepts whose required prerequisites have been resolved |
| `knowledgeAnswers` | The learner's `known`, `refresher`, or `unknown` answer by canonical key |
| `plannedConcepts` | The target plus prerequisites the learner does not fully know |

Canonical keys should be stable, lowercase semantic names. Normalize aliases only when sources show that they mean the same concept. Do not merge concepts merely because their names are similar.

## Discovery algorithm

The requested topic is the target learning goal and is always included in `plannedConcepts`.

For each target or unknown prerequisite:

1. Add its canonical key to `visiting`.
2. Do minimal source-backed research to identify its **required** immediate prerequisites.
3. Exclude recommended background, adjacent topics, tooling conveniences, and optional enrichment from the prerequisite graph. They may appear later in the deep track.
4. For each required prerequisite:
   - Reuse an existing node when its canonical key is already known.
   - Add the prerequisite -> dependent edge.
   - If the prerequisite is in `visiting`, handle the cycle as described below.
   - If it has a cached `knowledgeAnswers` value, do not ask again.
   - Otherwise, explain its relevance and ask the learner's knowledge level.
   - If `known`, record it as satisfied and do not expand its prerequisites.
   - If `refresher` or `unknown`, add it to `plannedConcepts` and recursively resolve its prerequisites.
5. Remove the concept from `visiting`, add it to `visited`, and continue.

After traversal:

1. Topologically order `plannedConcepts` so every missing prerequisite appears before its dependents.
2. Keep known prerequisites in learner-context metadata, not as curriculum modules.
3. Deduplicate shared prerequisites and teach each shared foundation once.
4. Preserve prerequisite edges in the proposed learning plan and generated navigation.

## Cycle handling

A node found in `visiting` creates a cycle. Do not silently choose an arbitrary order.

1. Recheck terminology and sources to rule out an aliasing or modeling error.
2. If the concepts are mutually introduced in practice, collapse them into a clearly named foundation cluster and explain that they will be learned together.
3. If multiple defensible treatments remain and the choice materially affects the curriculum, use `ask_user` to choose after briefly explaining the tradeoff.
4. Record the resolution in the plan so the final graph is acyclic.

## Replanning

When the user requests a plan revision:

- Reuse `knowledgeAnswers`, canonical nodes, source findings, and resolved edges.
- Ask only about newly introduced required prerequisites.
- Remove concepts that no longer lead to the target.
- Re-run deduplication, cycle handling, and topological ordering.
- Do not perform substantive content research or write under `docs/` until the revised plan is explicitly approved.
