# Quality rubric

## Style selection

Score each style candidate from 0-5 on every dimension and convert the weighted result to a 0-100 `fit_score`:

| Dimension | Weight | Passing standard |
|---|---:|---|
| Audience fit | 20% | The visual tone matches the audience's level of expertise, culture, and setting |
| Topic fit | 15% | Color, graphic language, and pacing arise from the topic rather than a generic template |
| Brand fit | 15% | Provided brand tokens are respected; without a brand, each choice still has a clear rationale |
| Information density | 15% | The system supports the required data, processes, and narrative without shrinking text |
| Asset availability | 10% | Required photos, icons, and charts can be obtained or generated legally and reliably |
| Accessibility | 10% | Contrast, type size, color-blind differentiation, and reading order are appropriate |
| Motion fit | 15% | Transitions, reveals, continuity, and timing suit the audience, content, delivery mode, and narration without decorative movement |

Select the highest-scoring candidate. If another candidate is selected, record the user preference or brand constraint in `selection.rationale`.

## Required semantic checks

`design-validation.json` must contain every check ID below. Mark a check `pass` only when concrete evidence exists.

| ID | Passing standard |
|---|---|
| `knowledge_fidelity` | Every fact, number, and claim is traceable; inferences are labeled; nothing is invented |
| `narrative` | Opening, development, and conclusion form one retellable story |
| `slide_purpose` | Every slide has a necessary and unique purpose, takeaway, and conclusion-led title |
| `content_density` | No slide depends on tiny text or long paragraphs; complex material has been split |
| `visual_plan` | Every slide has an executable visual directly related to the takeaway, not mere decoration |
| `style_fit` | Candidate comparison is complete and the selected style fits the audience, topic, and brand |
| `style_consistency` | Every slide uses a defined layout, variant, and the same style version |
| `readability` | Type size, whitespace, hierarchy, alignment, and scanability are appropriate |
| `accessibility` | Contrast, alt text, color encoding, and reading order are complete |
| `asset_rights` | External origins, licenses, and credits are traceable; AI assets are disclosed and preserve their final prompts |
| `source_traceability` | Content and summary slides reference valid `K-*` items and reserve space for citations |
| `motion_purpose` | Every transition, build, Morph pair, and interactive trigger has a stated communication job; static and decorative units remain unanimated |
| `motion_consistency` | Every slide selects an explicit motion mode; effect families match semantic duties; the deck follows one dominant Start rhythm and normal timing range unless a reviewed exception is recorded |
| `motion_accessibility` | Reduced-motion fallbacks are complete; recorded narration has no on-click or shape triggers; movement does not impair reading or comprehension |
| `motion_generation_readiness` | Semantic target IDs, order, timing, effect options, Morph adjacency/pairs, narration anchors, and PPT Master mapping instructions are complete and executable |
| `generation_readiness` | Layouts, assets, data mappings, and implementation constraints are complete enough for `ppt-master`; required installation prerequisites are available |

## Issue severity

- `blocker`: factual error, missing source, broken narrative, missing critical slide, undefined style or motion system, invalid Morph identity, narration/trigger conflict, or an artifact that cannot be generated.
- `major`: overloaded content, visual-takeaway mismatch, inadequate contrast, inconsistent layout, decorative or duty-mismatched animation, inaccessible motion, or an unavailable critical asset.
- `minor`: wording, local spacing, non-critical asset, or reviewed timing/pacing improvement.

Passing requires:

1. Every required check is `pass`.
2. `blockers` is empty.
3. Every entry in `issues` has status `resolved`.
4. The deterministic validator exits with code 0.

## Final presentation fidelity

After generation, extract presentation text and render every slide, then verify:

- Slide count, order, text, data, and citations match `deck-design.json`.
- Each slide implements its specified layout intent, variant, and visual kind.
- Palette, typography, spacing, motif, image, and chart rules match `style-guide.json`.
- External images and icons are watermark-free and have complete origin, license, and attribution records; AI assets match the design records.
- The deck has no overflow, overlap, incorrect wrapping, low contrast, template placeholder, or distorted asset.
- PPT Master's official source and detected version are recorded; its integrity gate, selected route/profile gates, final checker, postflight, and export all completed successfully.
- Every custom-motion design target resolves through `motion-target-map.json` to a real post-regroup SVG anchor, and PPT Master's `animation_config.py validate` accepts the final sidecar.
- Native package/postflight read-back confirms the expected page transitions, Animation Pane rows, Start modes, durations, order, triggers, and deterministic Morph names.
- Playback of every animated slide confirms that motion preserves reading order and visible end states without flash, overlap, click traps, timing collisions, or competing ambient movement.
- Narration-derived animation timing matches stable speaker-note cue phrases. When requested, the separate reduced-motion export removes object builds, replaces Morph, caps transitions, disables auto-advance, and remains complete.
- Every generation-stage repair has been written back to the source design artifact rather than applied only in generator code.
