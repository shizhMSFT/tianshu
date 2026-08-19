# Artifact contract

All artifacts share one `deck_id`. References use stable IDs rather than array positions. Additional fields may be preserved, but none of the required fields in this contract may be removed.

## `knowledge-map.json`

```json
{
  "schema_version": "1.0",
  "deck_id": "example-deck",
  "objective": "What the audience should understand or do after the presentation",
  "audience": "Target audience",
  "language": "en-US",
  "estimated_minutes": 12,
  "narrative": "The main arc from context to conclusion",
  "key_messages": ["First message", "Second message"],
  "sources": [
    {
      "id": "SRC-001",
      "label": "User-provided research report",
      "location": "report.pdf",
      "kind": "file"
    }
  ],
  "facts": [
    {
      "id": "K-001",
      "statement": "A fact, claim, or data point suitable for the presentation",
      "source_refs": ["SRC-001"],
      "confidence": "high",
      "kind": "fact"
    }
  ],
  "conflicts": [],
  "open_questions": [],
  "omissions": []
}
```

Required rules:

- `sources`, `facts`, and `key_messages` must not be empty.
- `confidence` must be `high`, `medium`, or `low`.
- `kind` must be `fact` or `inference`. An inference must not be presented as a fact.
- Every `facts[].source_refs` entry must reference an existing `SRC-*` ID.

## `deck-design.json`

```json
{
  "schema_version": "1.0",
  "deck_id": "example-deck",
  "design_version": 1,
  "style_version": 1,
  "objective": "An objective consistent with the knowledge map",
  "audience": "Target audience",
  "narrative": "The complete narrative arc",
  "estimated_minutes": 12,
  "delivery": {
    "mode": "live",
    "narration": false,
    "reduced_motion_variant": false
  },
  "slide_count": 3,
  "sections": [
    {
      "id": "SEC-01",
      "title": "Section title",
      "slide_ids": ["S-01", "S-02", "S-03"]
    }
  ],
  "slides": [
    {
      "id": "S-01",
      "order": 1,
      "role": "title",
      "section_id": "SEC-01",
      "purpose": "Establish the subject and audience expectation",
      "takeaway": "The one conclusion the audience should remember",
      "title": "Audience-facing slide title",
      "content": {
        "body": [],
        "data_points": [],
        "speaker_notes": "Speaker notes"
      },
      "source_refs": [],
      "visual": {
        "kind": "shape-composition",
        "description": "Description of the visual composition",
        "selection_reason": "The composition directly reinforces the slide takeaway",
        "data_refs": [],
        "asset_requirements": [],
        "source": {
          "source_type": "native-shape",
          "uri": "",
          "license": "not-applicable",
          "credit": "",
          "generation_prompt": ""
        },
        "decorative": true,
        "alt_text": ""
      },
      "motion": {
        "mode": "transition-only",
        "communication_job": "Establish a calm opening without withholding information",
        "transition": {
          "effect": "fade",
          "duration_s": 0.4,
          "auto_advance_s": null,
          "effect_options": {},
          "sound": null
        },
        "builds": [],
        "morph": null
      },
      "layout_id": "title-hero",
      "style_variant": "dark",
      "style_version": 1
    }
  ]
}
```

Required rules:

- `role` must be `title`, `section`, `content`, `summary`, or `closing`.
- `order` must start at 1 and increase without gaps. `slide_count` must equal the number of slides.
- Slides with the `content` or `summary` role must reference at least one `K-*` item.
- `visual.kind` must be `photo`, `illustration`, `icon`, `chart`, `diagram`, `table`, `typography`, `shape-composition`, or `number-callout`.
- `visual.selection_reason` must explain how the visual reinforces the takeaway. "Decorates the slide" is not sufficient.
- `visual.source.source_type` must be `provided`, `brand-library`, `licensed-stock`, `open-license`, `icon-library`, `native-chart`, `native-diagram`, `native-shape`, or `ai-generated`.
- Every visual must include `license` and `credit`. External stock, open-license assets, and icon libraries must also include `uri`.
- An `ai-generated` visual must preserve the final `generation_prompt`. The prompt must not request rendered text, data, logos, or interfaces.
- Every non-decorative visual must provide `alt_text`.
- `delivery.mode` must be `live`, `self-running`, or `recorded`; `narration` and `reduced_motion_variant` are booleans.
- Every slide must include a `motion` decision. `mode` must be `none`, `transition-only`, `custom`, or `narration-synced`.
- `transition.effect` uses a canonical lowercase PPT Master transition key. `duration_s` must be greater than zero; `auto_advance_s` is `null` or a non-negative number.
- Transition `sound` is optional and must be `null` or a project-relative `.wav`. Build `sound` is optional and must be `null` or a project-relative `.m4a`, `.mp3`, or `.wav`; any sound requires `motion_system.sound_policy: explicit`.
- `none` requires transition `none`, no builds, and no Morph block. `transition-only` requires a non-Morph transition and no builds or Morph block. `custom` requires at least one build or Morph pair.
- Each build has a unique `id`, lowercase kebab-case semantic `target_id`, unique positive page-wide `order`, valid Start mode, positive `duration_s`, non-negative `delay_s`, and an `effect_options` object.
- Build duty and effect family must match: `enter` uses `entrance_*` or generic `auto`/`mixed`/`random`; `emphasize` uses `emphasis_*`; `move` uses `path_*`; `exit` uses `exit_*`.
- `trigger_shape` is `null` or a real semantic target and requires `trigger: on-click`. Recorded narration forbids both `on-click` and `trigger_shape`.
- `narration-synced` requires `delivery.narration: true`, speaker notes, and a stable non-empty `narration_anchor` phrase for every build.
- Morph belongs to the destination slide, must reference the immediately preceding slide, and requires at least one unique source/destination target pair plus `transition.effect: morph` and `effect_options.morph_by: object`.
- `layout_id`, `style_variant`, and `style_version` must exist in the style guide.

Custom object-build example:

```json
{
  "mode": "custom",
  "communication_job": "Reveal the risk threshold, then move and emphasize it",
  "transition": {
    "effect": "fade",
    "duration_s": 0.4,
    "auto_advance_s": null,
    "effect_options": {},
    "sound": null
  },
  "builds": [
    {
      "id": "risk-enter",
      "target_id": "risk-marker",
      "duty": "enter",
      "effect": "entrance_fade",
      "order": 1,
      "trigger": "after-previous",
      "duration_s": 0.25,
      "delay_s": 0,
      "narration_anchor": "",
      "trigger_shape": null,
      "effect_options": {},
      "sound": null
    },
    {
      "id": "risk-move",
      "target_id": "risk-marker",
      "duty": "move",
      "effect": "path_right",
      "order": 2,
      "trigger": "after-previous",
      "duration_s": 0.7,
      "delay_s": 0,
      "narration_anchor": "",
      "trigger_shape": null,
      "effect_options": {
        "relative": true
      },
      "sound": null
    }
  ],
  "morph": null
}
```

Deterministic Morph destination example:

```json
{
  "mode": "custom",
  "communication_job": "Carry the same hero object from overview into detail",
  "transition": {
    "effect": "morph",
    "duration_s": 0.8,
    "auto_advance_s": null,
    "effect_options": {
      "morph_by": "object"
    },
    "sound": null
  },
  "builds": [],
  "morph": {
    "from_slide_id": "S-01",
    "pairs": [
      {
        "id": "hero-object",
        "from_target_id": "hero-overview",
        "to_target_id": "hero-detail"
      }
    ]
  }
}
```

## `style-guide.json`

```json
{
  "schema_version": "1.0",
  "deck_id": "example-deck",
  "style_version": 1,
  "selection": {
    "selected_name": "Editorial Contrast",
    "rationale": "Why this candidate best fits the audience and content",
    "candidates": [
      {
        "name": "Editorial Contrast",
        "fit_score": 92,
        "selected": true,
        "rationale": "Candidate assessment"
      },
      {
        "name": "Calm Technical",
        "fit_score": 78,
        "selected": false,
        "rationale": "Candidate assessment"
      }
    ]
  },
  "canvas": {
    "aspect_ratio": "16:9",
    "width_in": 13.333,
    "height_in": 7.5,
    "safe_margin_in": 0.5
  },
  "grid": {
    "columns": 12,
    "gutter_in": 0.25
  },
  "palette": {
    "background": "FFFFFF",
    "surface": "F4F7FA",
    "text": "1A1A1A",
    "muted": "4A5568",
    "primary": "13213C",
    "secondary": "3D5A80",
    "accent": "EE6C4D"
  },
  "typography": {
    "title": {
      "font_face": "Cambria",
      "fallback_font": "Arial",
      "min_pt": 36,
      "max_pt": 44,
      "weight": "bold",
      "fit_slack_percent": 10
    },
    "body": {
      "font_face": "Arial",
      "fallback_font": "Calibri",
      "min_pt": 14,
      "max_pt": 18,
      "weight": "regular",
      "fit_slack_percent": 10
    },
    "caption": {
      "font_face": "Arial",
      "fallback_font": "Calibri",
      "min_pt": 10,
      "max_pt": 12,
      "weight": "regular",
      "fit_slack_percent": 10
    }
  },
  "spacing": {
    "unit_in": 0.1,
    "block_gap_in": 0.4
  },
  "motif": {
    "name": "Framed evidence",
    "description": "A repeatable visual language for evidence",
    "rules": ["Use a consistent rounded frame around key evidence"]
  },
  "image_style": {
    "description": "Rules for image cropping, corners, color treatment, and credit",
    "dominant_media": "documentary-photography",
    "source_priority": [
      "provided",
      "brand-library",
      "licensed-stock",
      "open-license",
      "ai-generated"
    ],
    "crop_rule": "Use 16:9 or 4:3 crops without stretching",
    "treatment_rule": "Use consistent color treatment, corners, and shadows",
    "credit_rule": "Place required credit near the image or in the slide footer",
    "ai_generation_rule": "Use AI only for concepts, keep one prompt template, and do not generate text, data, logos, or interfaces"
  },
  "icon_style": {
    "description": "Rules for icon source, stroke, fill, and containers"
  },
  "chart_style": {
    "description": "Rules for chart colors, labels, grid lines, and emphasis"
  },
  "table_style": {
    "description": "Rules for headers, borders, whitespace, numeric alignment, and highlighted rows"
  },
  "motion_system": {
    "purpose": "Use restrained motion to clarify sequence, causality, and attention",
    "default_transition": {
      "effect": "fade",
      "duration_s": 0.4
    },
    "object_animation_policy": "opt-in",
    "dominant_trigger": "after-previous",
    "duration_range_s": {
      "min": 0.2,
      "max": 0.8
    },
    "default_stagger_s": 0.12,
    "auto_advance_policy": "off",
    "sound_policy": "none",
    "narration_sync_policy": "cue-derived",
    "reduced_motion": {
      "object_animation": "none",
      "morph_transition": "fade",
      "max_transition_duration_s": 0.4,
      "disable_auto_advance": true
    },
    "principles": [
      "Animate only when motion clarifies sequence, causality, spatial change, or emphasis"
    ],
    "forbidden": [
      "Do not animate decorative objects or vary effects for novelty"
    ]
  },
  "layouts": [
    {
      "id": "title-hero",
      "description": "Title-slide composition",
      "purpose": ["title"]
    },
    {
      "id": "evidence-split",
      "description": "Split layout for text and evidence",
      "purpose": ["content"]
    },
    {
      "id": "summary-grid",
      "description": "Summary-card grid",
      "purpose": ["summary", "closing"]
    }
  ],
  "variants": {
    "light": {
      "background_token": "background",
      "text_token": "text"
    },
    "dark": {
      "background_token": "primary",
      "text_token": "background"
    }
  },
  "rules": {
    "do": ["Preserve generous whitespace on every slide"],
    "dont": ["Do not use decorative color bars or title-underlining accents"]
  }
}
```

Required rules:

- Define at least two style candidates and select exactly one.
- Colors must use six uppercase hexadecimal digits without `#` or embedded alpha.
- Define at least three layouts and two variants.
- Text and background colors in every variant must have a contrast ratio of at least 4.5:1.
- `safe_margin_in` must be at least 0.5 and `block_gap_in` at least 0.3.
- `grid.columns` must be at least 2 and `grid.gutter_in` at least 0.2.
- Define separate treatments for images, icons, charts, and tables.
- `image_style` must define the dominant media language, source priority, cropping, treatment, attribution, and AI-generation rules.
- `motion_system` is required even when the deck is static. It must explicitly define the default transition, opt-in/off object policy, dominant Start mode, normal timing range, stagger, auto-advance, sound, narration sync, reduced-motion fallback, principles, and forbidden uses.
- `object_animation_policy` must be `opt-in` or `off`. Start mode must be `on-click`, `with-previous`, or `after-previous`.
- `object_animation_policy: off` forbids slide-level object builds. `auto_advance_policy: off` forbids non-null slide auto-advance; `narration-only` permits it only when narration is enabled.
- `auto_advance_policy` must be `off`, `explicit`, or `narration-only`; `sound_policy` must be `none` or `explicit`; `narration_sync_policy` must be `none` or `cue-derived`.
- Reduced motion must remove object animation, replace Morph with `fade` or `none`, cap transition duration, and explicitly decide whether to disable auto-advance.

## `design-validation.json`

```json
{
  "schema_version": "1.0",
  "deck_id": "example-deck",
  "design_version": 1,
  "style_version": 1,
  "status": "pass",
  "checks": [
    {
      "id": "knowledge_fidelity",
      "status": "pass",
      "evidence": "Every slide-level reference resolves to the knowledge map"
    }
  ],
  "blockers": [],
  "issues": [
    {
      "id": "ISSUE-001",
      "severity": "minor",
      "status": "resolved",
      "resolution": "Split an overloaded slide into two focused slides"
    }
  ]
}
```

`checks` must include every check ID in the quality rubric. Evidence must reference a specific slide, field, or repair; vague evidence such as "looks good" is not acceptable.

## `motion-target-map.json`

Create this artifact after PPT Master's final semantic grouping pass when custom object motion or deterministic Morph is used.

```json
{
  "schema_version": "1.0",
  "deck_id": "example-deck",
  "design_version": 1,
  "style_version": 1,
  "ppt_master_project": "<absolute-project-path>",
  "slides": [
    {
      "design_slide_id": "S-02",
      "runtime_slide_stem": "02_detail",
      "targets": [
        {
          "design_target_id": "hero-detail",
          "runtime_group_id": "hero-detail"
        }
      ]
    }
  ]
}
```

Every build target and Morph endpoint must appear exactly once for its slide. Runtime stems and group IDs must come from PPT Master's post-regroup `animation_config.py list-groups` output; never invent them.

## `ppt-master-animations.json`

Persist the exact validated PPT Master sidecar inside this provenance wrapper:

```json
{
  "schema_version": "1.0",
  "deck_id": "example-deck",
  "design_version": 1,
  "style_version": 1,
  "source_path": "<ppt-master-project>/animations.json",
  "validated": true,
  "sha256": "<sha256-of-canonical-config>",
  "config": {
    "version": 1,
    "slides": {}
  }
}
```

`config` must be the validated `animations.json` object without semantic changes. Omit this artifact when no sidecar is needed.

## `final-qa.json`

```json
{
  "schema_version": "1.0",
  "deck_id": "example-deck",
  "design_version": 1,
  "style_version": 1,
  "generator": {
    "skill": "ppt-master",
    "version": "<detected-installed-version>",
    "source": "https://github.com/hugohe3/ppt-master",
    "install_mode": "dynamic",
    "route": "generate-pptx",
    "profile": "default"
  },
  "pptx_path": "example-deck.pptx",
  "reduced_motion_pptx_path": null,
  "status": "pass",
  "checks": {
    "content": "pass",
    "file": "pass",
    "visual": "pass",
    "motion": "pass",
    "design_fidelity": "pass"
  },
  "motion": {
    "implemented": true,
    "target_map_path": "example-deck.artifacts/motion-target-map.json",
    "animations_snapshot_path": "example-deck.artifacts/ppt-master-animations.json",
    "sidecar_validation": "pass",
    "package_readback": "pass",
    "playback": "pass",
    "reduced_motion_status": "not-requested"
  },
  "evidence": [],
  "fixes": []
}
```

`generator.skill` must be `ppt-master` and `generator.source` must be the official repository shown above. Record the detected installed revision or version and the route/profile actually used. `install_mode` must be `preinstalled` or `dynamic`. `profile` must be `default` unless the user explicitly requested PPT Master's Quick Generate profile. Motion QA must record sidecar validation, native package/postflight read-back, and playback evidence. Use `not-applicable` paths and statuses only when no custom sidecar or reduced-motion variant is required.
