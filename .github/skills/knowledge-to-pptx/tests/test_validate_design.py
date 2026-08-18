from __future__ import annotations

import importlib.util
import unittest
from pathlib import Path
from typing import Any


SCRIPT_PATH = Path(__file__).parents[1] / "scripts" / "validate_design.py"
SKILL_PATH = Path(__file__).parents[1] / "SKILL.md"
SPEC = importlib.util.spec_from_file_location("validate_design", SCRIPT_PATH)
if SPEC is None or SPEC.loader is None:
    raise RuntimeError(f"Unable to load validator from {SCRIPT_PATH}")
VALIDATOR = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(VALIDATOR)


def _valid_documents() -> tuple[
    dict[str, Any], dict[str, Any], dict[str, Any], dict[str, Any]
]:
    knowledge = {
        "schema_version": "1.0",
        "deck_id": "test-deck",
        "objective": "Explain the recommendation.",
        "audience": "Decision makers.",
        "language": "en-US",
        "estimated_minutes": 8,
        "narrative": "Context, evidence, recommendation.",
        "key_messages": ["The evidence supports the recommendation."],
        "sources": [
            {
                "id": "SRC-001",
                "label": "Research notes",
                "location": "notes.txt",
                "kind": "file",
            }
        ],
        "facts": [
            {
                "id": "K-001",
                "statement": "The first finding.",
                "source_refs": ["SRC-001"],
                "confidence": "high",
                "kind": "fact",
            },
            {
                "id": "K-002",
                "statement": "The second finding.",
                "source_refs": ["SRC-001"],
                "confidence": "medium",
                "kind": "fact",
            },
        ],
        "conflicts": [],
        "open_questions": [],
        "omissions": [],
    }

    style = {
        "schema_version": "1.0",
        "deck_id": "test-deck",
        "style_version": 1,
        "selection": {
            "selected_name": "Editorial Contrast",
            "rationale": "Best fit for an evidence-led executive story.",
            "candidates": [
                {
                    "name": "Editorial Contrast",
                    "fit_score": 92,
                    "selected": True,
                    "rationale": "Strong hierarchy and evidence framing.",
                },
                {
                    "name": "Calm Technical",
                    "fit_score": 78,
                    "selected": False,
                    "rationale": "Clear but less distinctive.",
                },
            ],
        },
        "canvas": {
            "aspect_ratio": "16:9",
            "width_in": 13.333,
            "height_in": 7.5,
            "safe_margin_in": 0.5,
        },
        "grid": {"columns": 12, "gutter_in": 0.25},
        "palette": {
            "background": "FFFFFF",
            "surface": "F4F7FA",
            "text": "1A1A1A",
            "muted": "4A5568",
            "primary": "13213C",
            "secondary": "3D5A80",
            "accent": "EE6C4D",
        },
        "typography": {
            "title": {
                "font_face": "Cambria",
                "fallback_font": "Arial",
                "min_pt": 36,
                "max_pt": 44,
                "weight": "bold",
                "fit_slack_percent": 10,
            },
            "body": {
                "font_face": "Arial",
                "fallback_font": "Calibri",
                "min_pt": 14,
                "max_pt": 18,
                "weight": "regular",
                "fit_slack_percent": 10,
            },
            "caption": {
                "font_face": "Arial",
                "fallback_font": "Calibri",
                "min_pt": 10,
                "max_pt": 12,
                "weight": "regular",
                "fit_slack_percent": 10,
            },
        },
        "spacing": {"unit_in": 0.1, "block_gap_in": 0.4},
        "motif": {
            "name": "Framed evidence",
            "description": "Use rounded evidence frames.",
            "rules": ["Use the motif only for claims backed by data."],
        },
        "image_style": {
            "description": "Use documentary crops with source credit.",
            "dominant_media": "documentary-photography",
            "source_priority": [
                "provided",
                "brand-library",
                "licensed-stock",
                "open-license",
                "ai-generated",
            ],
            "crop_rule": "Use 16:9 or 4:3 crops without stretching.",
            "treatment_rule": "Use consistent color treatment and corners.",
            "credit_rule": "Credit assets near the image or in the footer.",
            "ai_generation_rule": "Use only for concepts and never generate text.",
        },
        "icon_style": {"description": "Use one consistent outline icon family."},
        "chart_style": {"description": "Use direct labels and quiet grid lines."},
        "table_style": {"description": "Use quiet borders and aligned numbers."},
        "motion_system": {
            "purpose": "Use restrained motion to clarify sequence and attention.",
            "default_transition": {"effect": "fade", "duration_s": 0.4},
            "object_animation_policy": "opt-in",
            "dominant_trigger": "after-previous",
            "duration_range_s": {"min": 0.2, "max": 0.8},
            "default_stagger_s": 0.12,
            "auto_advance_policy": "off",
            "sound_policy": "none",
            "narration_sync_policy": "cue-derived",
            "reduced_motion": {
                "object_animation": "none",
                "morph_transition": "fade",
                "max_transition_duration_s": 0.4,
                "disable_auto_advance": True,
            },
            "principles": [
                "Animate only when motion clarifies sequence, causality, or emphasis."
            ],
            "forbidden": [
                "Do not animate decorative objects or vary effects for novelty."
            ],
        },
        "layouts": [
            {"id": "title-hero", "description": "Title composition.", "purpose": ["title"]},
            {"id": "evidence-split", "description": "Evidence split.", "purpose": ["content"]},
            {"id": "data-focus", "description": "Data focus.", "purpose": ["content"]},
            {"id": "summary-grid", "description": "Summary grid.", "purpose": ["summary"]},
        ],
        "variants": {
            "light": {"background_token": "background", "text_token": "text"},
            "dark": {"background_token": "primary", "text_token": "background"},
        },
        "rules": {
            "do": ["Use generous whitespace."],
            "dont": ["Do not use decorative accent stripes."],
        },
    }

    slides = [
        {
            "id": "S-01",
            "order": 1,
            "role": "title",
            "section_id": "SEC-01",
            "purpose": "Frame the decision.",
            "takeaway": "The evidence points to a clear recommendation.",
            "title": "A clearer path forward",
            "content": {"body": [], "data_points": [], "speaker_notes": "Open."},
            "source_refs": [],
            "visual": {
                "kind": "shape-composition",
                "description": "A restrained evidence-frame motif.",
                "selection_reason": "The composition frames the decision without decorative stock imagery.",
                "data_refs": [],
                "asset_requirements": [],
                "source": {
                    "source_type": "native-shape",
                    "uri": "",
                    "license": "not-applicable",
                    "credit": "",
                    "generation_prompt": "",
                },
                "decorative": True,
                "alt_text": "",
            },
            "motion": {
                "mode": "transition-only",
                "communication_job": "Settle the audience into a calm opening.",
                "transition": {
                    "effect": "fade",
                    "duration_s": 0.4,
                    "auto_advance_s": None,
                    "effect_options": {},
                },
                "builds": [],
                "morph": None,
            },
            "layout_id": "title-hero",
            "style_variant": "dark",
            "style_version": 1,
        },
        {
            "id": "S-02",
            "order": 2,
            "role": "content",
            "section_id": "SEC-01",
            "purpose": "Explain the first finding.",
            "takeaway": "The first finding establishes urgency.",
            "title": "The first finding changes the baseline",
            "content": {
                "body": ["A concise explanation."],
                "data_points": [],
                "speaker_notes": "Explain finding one.",
            },
            "source_refs": ["K-001"],
            "visual": {
                "kind": "diagram",
                "description": "A simple before-and-after diagram.",
                "selection_reason": "The spatial comparison makes the change immediately visible.",
                "data_refs": ["K-001"],
                "asset_requirements": [],
                "source": {
                    "source_type": "native-diagram",
                    "uri": "",
                    "license": "not-applicable",
                    "credit": "",
                    "generation_prompt": "",
                },
                "decorative": False,
                "alt_text": "Before-and-after comparison of the first finding.",
            },
            "motion": {
                "mode": "custom",
                "communication_job": "Reveal the finding before its supporting comparison.",
                "transition": {
                    "effect": "fade",
                    "duration_s": 0.4,
                    "auto_advance_s": None,
                    "effect_options": {},
                },
                "builds": [
                    {
                        "id": "finding-reveal",
                        "target_id": "finding-card",
                        "duty": "enter",
                        "effect": "entrance_fade",
                        "order": 1,
                        "trigger": "after-previous",
                        "duration_s": 0.3,
                        "delay_s": 0,
                        "narration_anchor": "",
                        "trigger_shape": None,
                        "effect_options": {},
                    }
                ],
                "morph": None,
            },
            "layout_id": "evidence-split",
            "style_variant": "light",
            "style_version": 1,
        },
        {
            "id": "S-03",
            "order": 3,
            "role": "content",
            "section_id": "SEC-01",
            "purpose": "Explain the second finding.",
            "takeaway": "The second finding confirms the direction.",
            "title": "The second finding confirms the pattern",
            "content": {
                "body": ["A concise explanation."],
                "data_points": ["42%"],
                "speaker_notes": "Explain finding two.",
            },
            "source_refs": ["K-002"],
            "visual": {
                "kind": "chart",
                "description": "A directly labeled native chart.",
                "selection_reason": "A native chart communicates the measured result precisely.",
                "data_refs": ["K-002"],
                "asset_requirements": [],
                "source": {
                    "source_type": "native-chart",
                    "uri": "",
                    "license": "not-applicable",
                    "credit": "",
                    "generation_prompt": "",
                },
                "decorative": False,
                "alt_text": "Chart showing the second finding.",
            },
            "motion": {
                "mode": "custom",
                "communication_job": "Build the chart once so the comparison is read in order.",
                "transition": {
                    "effect": "fade",
                    "duration_s": 0.4,
                    "auto_advance_s": None,
                    "effect_options": {},
                },
                "builds": [
                    {
                        "id": "chart-reveal",
                        "target_id": "evidence-chart",
                        "duty": "enter",
                        "effect": "entrance_wipe",
                        "order": 1,
                        "trigger": "after-previous",
                        "duration_s": 0.5,
                        "delay_s": 0,
                        "narration_anchor": "",
                        "trigger_shape": None,
                        "effect_options": {"direction": "left"},
                    }
                ],
                "morph": None,
            },
            "layout_id": "data-focus",
            "style_variant": "light",
            "style_version": 1,
        },
        {
            "id": "S-04",
            "order": 4,
            "role": "summary",
            "section_id": "SEC-01",
            "purpose": "State the recommendation.",
            "takeaway": "Act on the combined evidence.",
            "title": "The evidence supports one next step",
            "content": {
                "body": ["Recommendation"],
                "data_points": [],
                "speaker_notes": "Close with the action.",
            },
            "source_refs": ["K-001", "K-002"],
            "visual": {
                "kind": "icon",
                "description": "Three action cards with consistent icons.",
                "selection_reason": "Consistent icons make the three actions easy to scan.",
                "data_refs": ["K-001", "K-002"],
                "asset_requirements": [],
                "source": {
                    "source_type": "icon-library",
                    "uri": "https://fonts.google.com/icons",
                    "license": "Apache-2.0",
                    "credit": "",
                    "generation_prompt": "",
                },
                "decorative": False,
                "alt_text": "Three action cards summarizing the recommendation.",
            },
            "motion": {
                "mode": "transition-only",
                "communication_job": "Keep the closing action visible as one commitment.",
                "transition": {
                    "effect": "fade",
                    "duration_s": 0.4,
                    "auto_advance_s": None,
                    "effect_options": {},
                },
                "builds": [],
                "morph": None,
            },
            "layout_id": "summary-grid",
            "style_variant": "dark",
            "style_version": 1,
        },
    ]
    design = {
        "schema_version": "1.0",
        "deck_id": "test-deck",
        "design_version": 1,
        "style_version": 1,
        "objective": "Explain the recommendation.",
        "audience": "Decision makers.",
        "narrative": "Context, evidence, recommendation.",
        "delivery": {
            "mode": "live",
            "narration": False,
            "reduced_motion_variant": False,
        },
        "estimated_minutes": 8,
        "slide_count": len(slides),
        "sections": [
            {
                "id": "SEC-01",
                "title": "Recommendation",
                "slide_ids": [slide["id"] for slide in slides],
            }
        ],
        "slides": slides,
    }

    review = {
        "schema_version": "1.0",
        "deck_id": "test-deck",
        "design_version": 1,
        "style_version": 1,
        "status": "pass",
        "checks": [
            {"id": check_id, "status": "pass", "evidence": f"Verified {check_id}."}
            for check_id in sorted(VALIDATOR.REQUIRED_REVIEW_CHECKS)
        ],
        "blockers": [],
        "issues": [],
    }
    return knowledge, design, style, review


class ValidateDesignTests(unittest.TestCase):
    def test_skill_bootstraps_ppt_master_from_official_source(self) -> None:
        skill_text = SKILL_PATH.read_text(encoding="utf-8")

        self.assertIn("npx --yes skills add hugohe3/ppt-master", skill_text)
        self.assertIn("https://github.com/hugohe3/ppt-master", skill_text)
        self.assertIn("scripts/attribution_guard.py", skill_text)
        self.assertNotIn("repository-provided installation", skill_text)

    def test_valid_artifacts_pass(self) -> None:
        result = VALIDATOR.validate_documents(*_valid_documents())
        self.assertEqual("pass", result["status"])
        self.assertEqual([], result["issues"])

    def test_unknown_layout_and_missing_visual_fail(self) -> None:
        knowledge, design, style, review = _valid_documents()
        design["slides"][1]["layout_id"] = "missing-layout"
        design["slides"][1].pop("visual")

        result = VALIDATOR.validate_documents(knowledge, design, style, review)
        codes = {item["code"] for item in result["issues"]}

        self.assertEqual("fail", result["status"])
        self.assertIn("design.layout.unknown", codes)
        self.assertIn("required.string", codes)

    def test_low_contrast_variant_fails(self) -> None:
        knowledge, design, style, review = _valid_documents()
        style["variants"]["light"]["text_token"] = "surface"

        result = VALIDATOR.validate_documents(knowledge, design, style, review)
        codes = {item["code"] for item in result["issues"]}

        self.assertEqual("fail", result["status"])
        self.assertIn("style.variant.contrast", codes)

    def test_incomplete_review_fails(self) -> None:
        knowledge, design, style, review = _valid_documents()
        review["checks"] = review["checks"][:-1]

        result = VALIDATOR.validate_documents(knowledge, design, style, review)
        codes = {item["code"] for item in result["issues"]}

        self.assertEqual("fail", result["status"])
        self.assertIn("review.check.missing", codes)

    def test_external_asset_requires_source_uri(self) -> None:
        knowledge, design, style, review = _valid_documents()
        design["slides"][3]["visual"]["source"]["uri"] = ""

        result = VALIDATOR.validate_documents(knowledge, design, style, review)
        codes = {item["code"] for item in result["issues"]}

        self.assertEqual("fail", result["status"])
        self.assertIn("design.visual.source_uri", codes)

    def test_ai_asset_requires_generation_prompt(self) -> None:
        knowledge, design, style, review = _valid_documents()
        source = design["slides"][0]["visual"]["source"]
        source["source_type"] = "ai-generated"
        source["license"] = "provider-terms"

        result = VALIDATOR.validate_documents(knowledge, design, style, review)
        codes = {item["code"] for item in result["issues"]}

        self.assertEqual("fail", result["status"])
        self.assertIn("design.visual.generation_prompt", codes)

    def test_missing_motion_system_fails(self) -> None:
        knowledge, design, style, review = _valid_documents()
        style.pop("motion_system")

        result = VALIDATOR.validate_documents(knowledge, design, style, review)
        codes = {item["code"] for item in result["issues"]}

        self.assertEqual("fail", result["status"])
        self.assertIn("type.object", codes)

    def test_motion_effect_must_match_semantic_duty(self) -> None:
        knowledge, design, style, review = _valid_documents()
        design["slides"][1]["motion"]["builds"][0]["effect"] = "emphasis_spin"

        result = VALIDATOR.validate_documents(knowledge, design, style, review)
        codes = {item["code"] for item in result["issues"]}

        self.assertEqual("fail", result["status"])
        self.assertIn("motion.effect.duty_mismatch", codes)

    def test_global_object_animation_off_rejects_builds(self) -> None:
        knowledge, design, style, review = _valid_documents()
        style["motion_system"]["object_animation_policy"] = "off"

        result = VALIDATOR.validate_documents(knowledge, design, style, review)
        codes = {item["code"] for item in result["issues"]}

        self.assertEqual("fail", result["status"])
        self.assertIn("motion.object_policy.off", codes)

    def test_auto_advance_respects_global_policy(self) -> None:
        knowledge, design, style, review = _valid_documents()
        design["slides"][0]["motion"]["transition"]["auto_advance_s"] = 4

        result = VALIDATOR.validate_documents(knowledge, design, style, review)
        codes = {item["code"] for item in result["issues"]}

        self.assertEqual("fail", result["status"])
        self.assertIn("motion.auto_advance.policy", codes)

    def test_recorded_narration_rejects_interactive_motion(self) -> None:
        knowledge, design, style, review = _valid_documents()
        design["delivery"]["mode"] = "recorded"
        design["delivery"]["narration"] = True
        design["slides"][1]["motion"]["builds"][0]["trigger"] = "on-click"

        result = VALIDATOR.validate_documents(knowledge, design, style, review)
        codes = {item["code"] for item in result["issues"]}

        self.assertEqual("fail", result["status"])
        self.assertIn("motion.recorded.interactive", codes)

    def test_narration_synced_motion_requires_cue_phrase(self) -> None:
        knowledge, design, style, review = _valid_documents()
        design["delivery"]["narration"] = True
        design["slides"][1]["motion"]["mode"] = "narration-synced"

        result = VALIDATOR.validate_documents(knowledge, design, style, review)
        codes = {item["code"] for item in result["issues"]}

        self.assertEqual("fail", result["status"])
        self.assertIn("motion.narration_anchor.required", codes)

    def test_narration_synced_motion_accepts_stable_cue_phrase(self) -> None:
        knowledge, design, style, review = _valid_documents()
        design["delivery"]["mode"] = "recorded"
        design["delivery"]["narration"] = True
        design["slides"][1]["motion"]["mode"] = "narration-synced"
        design["slides"][1]["motion"]["builds"][0][
            "narration_anchor"
        ] = "Explain finding one"

        result = VALIDATOR.validate_documents(knowledge, design, style, review)

        self.assertEqual("pass", result["status"])
        self.assertEqual([], result["issues"])

    def test_morph_must_pair_adjacent_slides(self) -> None:
        knowledge, design, style, review = _valid_documents()
        motion = design["slides"][2]["motion"]
        motion["transition"] = {
            "effect": "morph",
            "duration_s": 0.8,
            "auto_advance_s": None,
            "effect_options": {"morph_by": "object"},
        }
        motion["builds"] = []
        motion["morph"] = {
            "from_slide_id": "S-01",
            "pairs": [
                {
                    "id": "hero-object",
                    "from_target_id": "hero-overview",
                    "to_target_id": "hero-detail",
                }
            ],
        }

        result = VALIDATOR.validate_documents(knowledge, design, style, review)
        codes = {item["code"] for item in result["issues"]}

        self.assertEqual("fail", result["status"])
        self.assertIn("motion.morph.nonadjacent", codes)

    def test_valid_deterministic_morph_passes(self) -> None:
        knowledge, design, style, review = _valid_documents()
        motion = design["slides"][2]["motion"]
        motion["transition"] = {
            "effect": "morph",
            "duration_s": 0.8,
            "auto_advance_s": None,
            "effect_options": {"morph_by": "object"},
        }
        motion["builds"] = []
        motion["morph"] = {
            "from_slide_id": "S-02",
            "pairs": [
                {
                    "id": "hero-object",
                    "from_target_id": "hero-overview",
                    "to_target_id": "hero-detail",
                }
            ],
        }

        result = VALIDATOR.validate_documents(knowledge, design, style, review)

        self.assertEqual("pass", result["status"])
        self.assertEqual([], result["issues"])

    def test_unsupported_schema_version_fails(self) -> None:
        knowledge, design, style, review = _valid_documents()
        style["schema_version"] = "2.0"

        result = VALIDATOR.validate_documents(knowledge, design, style, review)
        codes = {item["code"] for item in result["issues"]}

        self.assertEqual("fail", result["status"])
        self.assertIn("schema_version.unsupported", codes)


if __name__ == "__main__":
    unittest.main()
