#!/usr/bin/env python3
"""Validate persisted knowledge-to-PPTX design artifacts."""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any


REQUIRED_REVIEW_CHECKS = {
    "knowledge_fidelity",
    "narrative",
    "slide_purpose",
    "content_density",
    "visual_plan",
    "style_fit",
    "style_consistency",
    "readability",
    "accessibility",
    "asset_rights",
    "source_traceability",
    "generation_readiness",
}

REQUIRED_PALETTE_TOKENS = {
    "background",
    "surface",
    "text",
    "muted",
    "primary",
    "secondary",
    "accent",
}

SLIDE_ROLES = {"title", "section", "content", "summary", "closing"}
SOURCE_REQUIRED_ROLES = {"content", "summary"}
VISUAL_KINDS = {
    "photo",
    "illustration",
    "icon",
    "chart",
    "diagram",
    "table",
    "typography",
    "shape-composition",
    "number-callout",
}
VISUAL_SOURCE_TYPES = {
    "provided",
    "brand-library",
    "licensed-stock",
    "open-license",
    "icon-library",
    "native-chart",
    "native-diagram",
    "native-shape",
    "ai-generated",
}
EXTERNAL_VISUAL_SOURCE_TYPES = {
    "brand-library",
    "licensed-stock",
    "open-license",
    "icon-library",
}
HEX_COLOR = re.compile(r"^[0-9A-F]{6}$")


Issue = dict[str, str]


def _issue(level: str, code: str, path: str, message: str) -> Issue:
    return {"level": level, "code": code, "path": path, "message": message}


def _is_non_empty_string(value: Any) -> bool:
    return isinstance(value, str) and bool(value.strip())


def _as_object(value: Any, path: str, issues: list[Issue]) -> dict[str, Any]:
    if not isinstance(value, dict):
        issues.append(_issue("error", "type.object", path, "Expected an object."))
        return {}
    return value


def _as_list(value: Any, path: str, issues: list[Issue]) -> list[Any]:
    if not isinstance(value, list):
        issues.append(_issue("error", "type.array", path, "Expected an array."))
        return []
    return value


def _require_string(
    obj: dict[str, Any], key: str, path: str, issues: list[Issue]
) -> str:
    value = obj.get(key)
    if not _is_non_empty_string(value):
        issues.append(
            _issue("error", "required.string", f"{path}.{key}", "Expected a non-empty string.")
        )
        return ""
    return value.strip()


def _require_positive_int(
    obj: dict[str, Any], key: str, path: str, issues: list[Issue]
) -> int:
    value = obj.get(key)
    if not isinstance(value, int) or isinstance(value, bool) or value < 1:
        issues.append(
            _issue("error", "required.positive_int", f"{path}.{key}", "Expected an integer >= 1.")
        )
        return 0
    return value


def _validate_schema_version(
    obj: dict[str, Any], path: str, issues: list[Issue]
) -> None:
    if obj.get("schema_version") != "1.0":
        issues.append(
            _issue(
                "error",
                "schema_version.unsupported",
                f"{path}.schema_version",
                "Expected schema_version 1.0.",
            )
        )


def _unique_ids(
    items: list[Any], path: str, issues: list[Issue]
) -> tuple[set[str], list[dict[str, Any]]]:
    ids: set[str] = set()
    objects: list[dict[str, Any]] = []
    for index, item in enumerate(items):
        item_path = f"{path}[{index}]"
        item_obj = _as_object(item, item_path, issues)
        objects.append(item_obj)
        item_id = _require_string(item_obj, "id", item_path, issues)
        if item_id in ids:
            issues.append(_issue("error", "id.duplicate", f"{item_path}.id", f"Duplicate ID: {item_id}"))
        elif item_id:
            ids.add(item_id)
    return ids, objects


def _linearized_rgb(hex_color: str) -> tuple[float, float, float]:
    channels = [int(hex_color[index : index + 2], 16) / 255 for index in (0, 2, 4)]

    def linearize(channel: float) -> float:
        if channel <= 0.04045:
            return channel / 12.92
        return ((channel + 0.055) / 1.055) ** 2.4

    return tuple(linearize(channel) for channel in channels)  # type: ignore[return-value]


def _contrast_ratio(foreground: str, background: str) -> float:
    fg = _linearized_rgb(foreground)
    bg = _linearized_rgb(background)
    fg_luminance = 0.2126 * fg[0] + 0.7152 * fg[1] + 0.0722 * fg[2]
    bg_luminance = 0.2126 * bg[0] + 0.7152 * bg[1] + 0.0722 * bg[2]
    lighter = max(fg_luminance, bg_luminance)
    darker = min(fg_luminance, bg_luminance)
    return (lighter + 0.05) / (darker + 0.05)


def _validate_knowledge(
    knowledge: dict[str, Any], issues: list[Issue]
) -> tuple[str, set[str]]:
    path = "knowledge"
    _validate_schema_version(knowledge, path, issues)
    deck_id = _require_string(knowledge, "deck_id", path, issues)
    _require_string(knowledge, "objective", path, issues)
    _require_string(knowledge, "audience", path, issues)
    _require_string(knowledge, "narrative", path, issues)

    messages = _as_list(knowledge.get("key_messages"), f"{path}.key_messages", issues)
    if not messages:
        issues.append(
            _issue("error", "knowledge.key_messages.empty", f"{path}.key_messages", "At least one key message is required.")
        )
    for index, message in enumerate(messages):
        if not _is_non_empty_string(message):
            issues.append(
                _issue("error", "knowledge.key_message.invalid", f"{path}.key_messages[{index}]", "Expected a non-empty string.")
            )

    source_ids, sources = _unique_ids(
        _as_list(knowledge.get("sources"), f"{path}.sources", issues),
        f"{path}.sources",
        issues,
    )
    if not sources:
        issues.append(
            _issue("error", "knowledge.sources.empty", f"{path}.sources", "At least one source is required.")
        )
    for index, source in enumerate(sources):
        _require_string(source, "label", f"{path}.sources[{index}]", issues)
        _require_string(source, "kind", f"{path}.sources[{index}]", issues)

    fact_ids, facts = _unique_ids(
        _as_list(knowledge.get("facts"), f"{path}.facts", issues),
        f"{path}.facts",
        issues,
    )
    if not facts:
        issues.append(
            _issue("error", "knowledge.facts.empty", f"{path}.facts", "At least one knowledge item is required.")
        )

    for index, fact in enumerate(facts):
        fact_path = f"{path}.facts[{index}]"
        _require_string(fact, "statement", fact_path, issues)
        confidence = _require_string(fact, "confidence", fact_path, issues)
        if confidence and confidence not in {"high", "medium", "low"}:
            issues.append(
                _issue("error", "knowledge.confidence.invalid", f"{fact_path}.confidence", "Use high, medium, or low.")
            )
        kind = _require_string(fact, "kind", fact_path, issues)
        if kind and kind not in {"fact", "inference"}:
            issues.append(
                _issue("error", "knowledge.kind.invalid", f"{fact_path}.kind", "Use fact or inference.")
            )
        refs = _as_list(fact.get("source_refs"), f"{fact_path}.source_refs", issues)
        if not refs:
            issues.append(
                _issue("error", "knowledge.source_refs.empty", f"{fact_path}.source_refs", "Every knowledge item needs a source reference.")
            )
        for ref_index, ref in enumerate(refs):
            if ref not in source_ids:
                issues.append(
                    _issue(
                        "error",
                        "knowledge.source_ref.unknown",
                        f"{fact_path}.source_refs[{ref_index}]",
                        f"Unknown source reference: {ref}",
                    )
                )

    return deck_id, fact_ids


def _validate_style(
    style: dict[str, Any], issues: list[Issue]
) -> tuple[str, int, set[str], set[str]]:
    path = "style"
    _validate_schema_version(style, path, issues)
    deck_id = _require_string(style, "deck_id", path, issues)
    style_version = _require_positive_int(style, "style_version", path, issues)

    selection = _as_object(style.get("selection"), f"{path}.selection", issues)
    selected_name = _require_string(selection, "selected_name", f"{path}.selection", issues)
    _require_string(selection, "rationale", f"{path}.selection", issues)
    candidates = _as_list(selection.get("candidates"), f"{path}.selection.candidates", issues)
    if len(candidates) < 2:
        issues.append(
            _issue("error", "style.candidates.too_few", f"{path}.selection.candidates", "At least two style candidates are required.")
        )
    selected_candidates: list[str] = []
    for index, candidate in enumerate(candidates):
        candidate_path = f"{path}.selection.candidates[{index}]"
        candidate_obj = _as_object(candidate, candidate_path, issues)
        name = _require_string(candidate_obj, "name", candidate_path, issues)
        _require_string(candidate_obj, "rationale", candidate_path, issues)
        score = candidate_obj.get("fit_score")
        if not isinstance(score, (int, float)) or isinstance(score, bool) or not 0 <= score <= 100:
            issues.append(
                _issue("error", "style.fit_score.invalid", f"{candidate_path}.fit_score", "Expected a number from 0 to 100.")
            )
        if candidate_obj.get("selected") is True:
            selected_candidates.append(name)
    if len(selected_candidates) != 1:
        issues.append(
            _issue("error", "style.selected.count", f"{path}.selection.candidates", "Exactly one candidate must be selected.")
        )
    elif selected_name and selected_candidates[0] != selected_name:
        issues.append(
            _issue("error", "style.selected.mismatch", f"{path}.selection.selected_name", "Selected name does not match the selected candidate.")
        )

    canvas = _as_object(style.get("canvas"), f"{path}.canvas", issues)
    _require_string(canvas, "aspect_ratio", f"{path}.canvas", issues)
    for dimension in ("width_in", "height_in"):
        value = canvas.get(dimension)
        if not isinstance(value, (int, float)) or isinstance(value, bool) or value <= 0:
            issues.append(
                _issue("error", "style.canvas.dimension", f"{path}.canvas.{dimension}", "Expected a number greater than 0.")
            )
    safe_margin = canvas.get("safe_margin_in")
    if not isinstance(safe_margin, (int, float)) or isinstance(safe_margin, bool) or safe_margin < 0.5:
        issues.append(
            _issue("error", "style.canvas.safe_margin", f"{path}.canvas.safe_margin_in", "Safe margin must be at least 0.5 inches.")
        )

    grid = _as_object(style.get("grid"), f"{path}.grid", issues)
    columns = grid.get("columns")
    if not isinstance(columns, int) or isinstance(columns, bool) or columns < 2:
        issues.append(
            _issue("error", "style.grid.columns", f"{path}.grid.columns", "Grid must have at least two columns.")
        )
    gutter = grid.get("gutter_in")
    if not isinstance(gutter, (int, float)) or isinstance(gutter, bool) or gutter < 0.2:
        issues.append(
            _issue("error", "style.grid.gutter", f"{path}.grid.gutter_in", "Grid gutter must be at least 0.2 inches.")
        )

    palette = _as_object(style.get("palette"), f"{path}.palette", issues)
    for token in sorted(REQUIRED_PALETTE_TOKENS):
        color = palette.get(token)
        if not isinstance(color, str) or not HEX_COLOR.fullmatch(color):
            issues.append(
                _issue(
                    "error",
                    "style.palette.color",
                    f"{path}.palette.{token}",
                    "Expected six uppercase hexadecimal digits without '#'.",
                )
            )

    typography = _as_object(style.get("typography"), f"{path}.typography", issues)
    for role in ("title", "body", "caption"):
        role_path = f"{path}.typography.{role}"
        spec = _as_object(typography.get(role), role_path, issues)
        _require_string(spec, "font_face", role_path, issues)
        _require_string(spec, "fallback_font", role_path, issues)
        min_pt = spec.get("min_pt")
        max_pt = spec.get("max_pt")
        if not isinstance(min_pt, (int, float)) or isinstance(min_pt, bool) or min_pt <= 0:
            issues.append(_issue("error", "style.typography.min_pt", f"{role_path}.min_pt", "Expected a positive number."))
        if not isinstance(max_pt, (int, float)) or isinstance(max_pt, bool) or max_pt <= 0:
            issues.append(_issue("error", "style.typography.max_pt", f"{role_path}.max_pt", "Expected a positive number."))
        if isinstance(min_pt, (int, float)) and isinstance(max_pt, (int, float)) and min_pt > max_pt:
            issues.append(_issue("error", "style.typography.range", role_path, "min_pt cannot exceed max_pt."))
        slack = spec.get("fit_slack_percent")
        if not isinstance(slack, (int, float)) or isinstance(slack, bool) or slack < 10:
            issues.append(
                _issue("error", "style.typography.fit_slack", f"{role_path}.fit_slack_percent", "Reserve at least 10 percent fit slack.")
            )

    spacing = _as_object(style.get("spacing"), f"{path}.spacing", issues)
    block_gap = spacing.get("block_gap_in")
    if not isinstance(block_gap, (int, float)) or isinstance(block_gap, bool) or block_gap < 0.3:
        issues.append(
            _issue("error", "style.spacing.block_gap", f"{path}.spacing.block_gap_in", "Block gap must be at least 0.3 inches.")
        )

    motif = _as_object(style.get("motif"), f"{path}.motif", issues)
    _require_string(motif, "name", f"{path}.motif", issues)
    _require_string(motif, "description", f"{path}.motif", issues)
    motif_rules = _as_list(motif.get("rules"), f"{path}.motif.rules", issues)
    if not motif_rules:
        issues.append(_issue("error", "style.motif.rules.empty", f"{path}.motif.rules", "At least one motif rule is required."))

    for media_key in ("image_style", "icon_style", "chart_style", "table_style"):
        media_path = f"{path}.{media_key}"
        media = _as_object(style.get(media_key), media_path, issues)
        _require_string(media, "description", media_path, issues)

    layout_ids, layouts = _unique_ids(
        _as_list(style.get("layouts"), f"{path}.layouts", issues),
        f"{path}.layouts",
        issues,
    )
    if len(layouts) < 3:
        issues.append(
            _issue("error", "style.layouts.too_few", f"{path}.layouts", "At least three reusable layouts are required.")
        )
    for index, layout in enumerate(layouts):
        _require_string(layout, "description", f"{path}.layouts[{index}]", issues)

    variants = _as_object(style.get("variants"), f"{path}.variants", issues)
    variant_ids = set(variants)
    if len(variant_ids) < 2:
        issues.append(
            _issue("error", "style.variants.too_few", f"{path}.variants", "At least two style variants are required.")
        )
    for variant_id, variant_value in variants.items():
        variant_path = f"{path}.variants.{variant_id}"
        variant = _as_object(variant_value, variant_path, issues)
        background_token = _require_string(variant, "background_token", variant_path, issues)
        text_token = _require_string(variant, "text_token", variant_path, issues)
        if background_token and background_token not in palette:
            issues.append(
                _issue("error", "style.variant.background.unknown", f"{variant_path}.background_token", f"Unknown palette token: {background_token}")
            )
        if text_token and text_token not in palette:
            issues.append(
                _issue("error", "style.variant.text.unknown", f"{variant_path}.text_token", f"Unknown palette token: {text_token}")
            )
        background = palette.get(background_token)
        foreground = palette.get(text_token)
        if (
            isinstance(background, str)
            and HEX_COLOR.fullmatch(background)
            and isinstance(foreground, str)
            and HEX_COLOR.fullmatch(foreground)
        ):
            ratio = _contrast_ratio(foreground, background)
            if ratio < 4.5:
                issues.append(
                    _issue(
                        "error",
                        "style.variant.contrast",
                        variant_path,
                        f"Text/background contrast is {ratio:.2f}:1; at least 4.5:1 is required.",
                    )
                )

    rules = _as_object(style.get("rules"), f"{path}.rules", issues)
    for rule_type in ("do", "dont"):
        values = _as_list(rules.get(rule_type), f"{path}.rules.{rule_type}", issues)
        if not values:
            issues.append(
                _issue("error", f"style.rules.{rule_type}.empty", f"{path}.rules.{rule_type}", "At least one rule is required.")
            )

    return deck_id, style_version, layout_ids, variant_ids


def _validate_design(
    design: dict[str, Any],
    fact_ids: set[str],
    layout_ids: set[str],
    variant_ids: set[str],
    expected_style_version: int,
    issues: list[Issue],
) -> tuple[str, int]:
    path = "design"
    _validate_schema_version(design, path, issues)
    deck_id = _require_string(design, "deck_id", path, issues)
    design_version = _require_positive_int(design, "design_version", path, issues)
    style_version = _require_positive_int(design, "style_version", path, issues)
    if expected_style_version and style_version != expected_style_version:
        issues.append(
            _issue("error", "version.style.mismatch", f"{path}.style_version", "Design and style guide versions must match.")
        )

    _require_string(design, "objective", path, issues)
    _require_string(design, "audience", path, issues)
    _require_string(design, "narrative", path, issues)

    slides_value = _as_list(design.get("slides"), f"{path}.slides", issues)
    slide_ids, slides = _unique_ids(slides_value, f"{path}.slides", issues)
    if not slides:
        issues.append(_issue("error", "design.slides.empty", f"{path}.slides", "At least one slide is required."))

    slide_count = design.get("slide_count")
    if not isinstance(slide_count, int) or isinstance(slide_count, bool) or slide_count != len(slides):
        issues.append(
            _issue("error", "design.slide_count.mismatch", f"{path}.slide_count", f"Expected {len(slides)}.")
        )

    previous_layout = ""
    repeated_layout_count = 0
    for index, slide in enumerate(slides):
        slide_path = f"{path}.slides[{index}]"
        order = slide.get("order")
        if order != index + 1:
            issues.append(
                _issue("error", "design.order.invalid", f"{slide_path}.order", f"Expected {index + 1}.")
            )
        role = _require_string(slide, "role", slide_path, issues)
        if role and role not in SLIDE_ROLES:
            issues.append(
                _issue("error", "design.role.invalid", f"{slide_path}.role", f"Unsupported role: {role}")
            )
        _require_string(slide, "section_id", slide_path, issues)
        _require_string(slide, "purpose", slide_path, issues)
        takeaway = _require_string(slide, "takeaway", slide_path, issues)
        title = _require_string(slide, "title", slide_path, issues)
        if len(title) > 90:
            issues.append(
                _issue("warning", "design.title.long", f"{slide_path}.title", "Title exceeds 90 characters.")
            )
        if len(takeaway) > 180:
            issues.append(
                _issue("warning", "design.takeaway.long", f"{slide_path}.takeaway", "Takeaway exceeds 180 characters.")
            )

        content = _as_object(slide.get("content"), f"{slide_path}.content", issues)
        body = _as_list(content.get("body"), f"{slide_path}.content.body", issues)
        data_points = _as_list(content.get("data_points"), f"{slide_path}.content.data_points", issues)
        if len(body) > 6:
            issues.append(
                _issue("warning", "design.body.too_many_items", f"{slide_path}.content.body", "More than six body items suggests an overloaded slide.")
            )
        visible_text = " ".join(str(value) for value in [title, takeaway, *body, *data_points])
        if len(visible_text) > 700:
            issues.append(
                _issue("warning", "design.content.dense", slide_path, "Visible text exceeds 700 characters; split or simplify the slide.")
            )

        refs = _as_list(slide.get("source_refs"), f"{slide_path}.source_refs", issues)
        if role in SOURCE_REQUIRED_ROLES and not refs:
            issues.append(
                _issue("error", "design.source_refs.empty", f"{slide_path}.source_refs", f"{role} slides require a knowledge reference.")
            )
        for ref_index, ref in enumerate(refs):
            if ref not in fact_ids:
                issues.append(
                    _issue(
                        "error",
                        "design.source_ref.unknown",
                        f"{slide_path}.source_refs[{ref_index}]",
                        f"Unknown knowledge reference: {ref}",
                    )
                )

        visual = _as_object(slide.get("visual"), f"{slide_path}.visual", issues)
        visual_kind = _require_string(visual, "kind", f"{slide_path}.visual", issues)
        if visual_kind and visual_kind not in VISUAL_KINDS:
            issues.append(
                _issue("error", "design.visual.kind", f"{slide_path}.visual.kind", f"Unsupported visual kind: {visual_kind}")
            )
        _require_string(visual, "description", f"{slide_path}.visual", issues)
        _require_string(visual, "selection_reason", f"{slide_path}.visual", issues)
        source_path = f"{slide_path}.visual.source"
        source = _as_object(visual.get("source"), source_path, issues)
        source_type = _require_string(source, "source_type", source_path, issues)
        if source_type and source_type not in VISUAL_SOURCE_TYPES:
            issues.append(
                _issue(
                    "error",
                    "design.visual.source_type",
                    f"{source_path}.source_type",
                    f"Unsupported visual source type: {source_type}",
                )
            )
        _require_string(source, "license", source_path, issues)
        if "credit" not in source or not isinstance(source.get("credit"), str):
            issues.append(
                _issue(
                    "error",
                    "design.visual.credit",
                    f"{source_path}.credit",
                    "Expected a credit string; use an empty string when no credit is required.",
                )
            )
        if source_type in EXTERNAL_VISUAL_SOURCE_TYPES and not _is_non_empty_string(source.get("uri")):
            issues.append(
                _issue(
                    "error",
                    "design.visual.source_uri",
                    f"{source_path}.uri",
                    "External visual assets require a source URI.",
                )
            )
        if source_type == "ai-generated" and not _is_non_empty_string(source.get("generation_prompt")):
            issues.append(
                _issue(
                    "error",
                    "design.visual.generation_prompt",
                    f"{source_path}.generation_prompt",
                    "AI-generated assets require the final generation prompt.",
                )
            )
        if visual.get("decorative") is not True and not _is_non_empty_string(visual.get("alt_text")):
            issues.append(
                _issue("error", "design.visual.alt_text", f"{slide_path}.visual.alt_text", "Non-decorative visuals require alt text.")
            )

        layout_id = _require_string(slide, "layout_id", slide_path, issues)
        if layout_id and layout_id not in layout_ids:
            issues.append(
                _issue("error", "design.layout.unknown", f"{slide_path}.layout_id", f"Unknown layout: {layout_id}")
            )
        if layout_id == previous_layout:
            repeated_layout_count += 1
        else:
            previous_layout = layout_id
            repeated_layout_count = 1
        if repeated_layout_count > 3:
            issues.append(
                _issue("warning", "design.layout.repetition", f"{slide_path}.layout_id", "The same layout appears more than three times consecutively.")
            )

        variant_id = _require_string(slide, "style_variant", slide_path, issues)
        if variant_id and variant_id not in variant_ids:
            issues.append(
                _issue("error", "design.variant.unknown", f"{slide_path}.style_variant", f"Unknown style variant: {variant_id}")
            )
        slide_style_version = slide.get("style_version")
        if slide_style_version != expected_style_version:
            issues.append(
                _issue("error", "design.slide.style_version", f"{slide_path}.style_version", "Slide style version must match the style guide.")
            )

    sections_value = _as_list(design.get("sections"), f"{path}.sections", issues)
    section_ids, sections = _unique_ids(sections_value, f"{path}.sections", issues)
    if not sections:
        issues.append(_issue("error", "design.sections.empty", f"{path}.sections", "At least one section is required."))
    section_slide_ids: list[str] = []
    for index, section in enumerate(sections):
        section_path = f"{path}.sections[{index}]"
        _require_string(section, "title", section_path, issues)
        refs = _as_list(section.get("slide_ids"), f"{section_path}.slide_ids", issues)
        section_slide_ids.extend(ref for ref in refs if isinstance(ref, str))
        for ref_index, ref in enumerate(refs):
            if ref not in slide_ids:
                issues.append(
                    _issue("error", "design.section.slide.unknown", f"{section_path}.slide_ids[{ref_index}]", f"Unknown slide: {ref}")
                )

    for index, slide in enumerate(slides):
        section_id = slide.get("section_id")
        if section_id not in section_ids:
            issues.append(
                _issue("error", "design.slide.section.unknown", f"{path}.slides[{index}].section_id", f"Unknown section: {section_id}")
            )
    if len(section_slide_ids) != len(set(section_slide_ids)):
        issues.append(
            _issue("error", "design.section.slide.duplicate", f"{path}.sections", "A slide is listed in more than one section.")
        )
    if set(section_slide_ids) != slide_ids:
        issues.append(
            _issue("error", "design.section.coverage", f"{path}.sections", "Sections must cover every slide exactly once.")
        )

    return deck_id, design_version


def _validate_review(
    review: dict[str, Any],
    expected_design_version: int,
    expected_style_version: int,
    issues: list[Issue],
) -> str:
    path = "review"
    _validate_schema_version(review, path, issues)
    deck_id = _require_string(review, "deck_id", path, issues)
    design_version = _require_positive_int(review, "design_version", path, issues)
    style_version = _require_positive_int(review, "style_version", path, issues)
    if expected_design_version and design_version != expected_design_version:
        issues.append(
            _issue("error", "version.design.review_mismatch", f"{path}.design_version", "Review and design versions must match.")
        )
    if expected_style_version and style_version != expected_style_version:
        issues.append(
            _issue("error", "version.style.review_mismatch", f"{path}.style_version", "Review and style versions must match.")
        )

    if review.get("status") != "pass":
        issues.append(
            _issue("error", "review.status", f"{path}.status", "Review status must be pass.")
        )

    checks = _as_list(review.get("checks"), f"{path}.checks", issues)
    seen_checks: set[str] = set()
    for index, check in enumerate(checks):
        check_path = f"{path}.checks[{index}]"
        check_obj = _as_object(check, check_path, issues)
        check_id = _require_string(check_obj, "id", check_path, issues)
        if check_id in seen_checks:
            issues.append(_issue("error", "review.check.duplicate", f"{check_path}.id", f"Duplicate check: {check_id}"))
        elif check_id:
            seen_checks.add(check_id)
        if check_obj.get("status") != "pass":
            issues.append(
                _issue("error", "review.check.status", f"{check_path}.status", "Every required check must pass.")
            )
        _require_string(check_obj, "evidence", check_path, issues)

    missing_checks = sorted(REQUIRED_REVIEW_CHECKS - seen_checks)
    for check_id in missing_checks:
        issues.append(
            _issue("error", "review.check.missing", f"{path}.checks", f"Missing required check: {check_id}")
        )

    blockers = _as_list(review.get("blockers"), f"{path}.blockers", issues)
    if blockers:
        issues.append(_issue("error", "review.blockers", f"{path}.blockers", "All blockers must be resolved and removed."))

    review_issues = _as_list(review.get("issues"), f"{path}.issues", issues)
    for index, item in enumerate(review_issues):
        item_path = f"{path}.issues[{index}]"
        item_obj = _as_object(item, item_path, issues)
        if item_obj.get("status") != "resolved":
            issues.append(
                _issue("error", "review.issue.unresolved", f"{item_path}.status", "Every review issue must be resolved.")
            )
        _require_string(item_obj, "resolution", item_path, issues)

    return deck_id


def validate_documents(
    knowledge: dict[str, Any],
    design: dict[str, Any],
    style: dict[str, Any],
    review: dict[str, Any],
) -> dict[str, Any]:
    issues: list[Issue] = []

    knowledge_id, fact_ids = _validate_knowledge(knowledge, issues)
    style_id, style_version, layout_ids, variant_ids = _validate_style(style, issues)
    design_id, design_version = _validate_design(
        design,
        fact_ids,
        layout_ids,
        variant_ids,
        style_version,
        issues,
    )
    review_id = _validate_review(
        review,
        design_version,
        style_version,
        issues,
    )

    deck_ids = {deck_id for deck_id in (knowledge_id, design_id, style_id, review_id) if deck_id}
    if len(deck_ids) > 1:
        issues.append(
            _issue("error", "deck_id.mismatch", "$", "All artifacts must use the same deck_id.")
        )

    errors = [item for item in issues if item["level"] == "error"]
    warnings = [item for item in issues if item["level"] == "warning"]
    status = "fail" if errors else "warning" if warnings else "pass"
    return {
        "schema_version": "1.0",
        "status": status,
        "deck_id": next(iter(deck_ids), ""),
        "design_version": design_version,
        "style_version": style_version,
        "error_count": len(errors),
        "warning_count": len(warnings),
        "issues": issues,
    }


def _load_json(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as handle:
        value = json.load(handle)
    if not isinstance(value, dict):
        raise ValueError(f"{path} must contain a JSON object.")
    return value


def _parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--knowledge", required=True, type=Path)
    parser.add_argument("--design", required=True, type=Path)
    parser.add_argument("--style", required=True, type=Path)
    parser.add_argument("--review", required=True, type=Path)
    parser.add_argument("--output", type=Path)
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = _parse_args(argv if argv is not None else sys.argv[1:])
    try:
        result = validate_documents(
            _load_json(args.knowledge),
            _load_json(args.design),
            _load_json(args.style),
            _load_json(args.review),
        )
    except (OSError, json.JSONDecodeError, ValueError) as error:
        result = {
            "schema_version": "1.0",
            "status": "fail",
            "error_count": 1,
            "warning_count": 0,
            "issues": [
                _issue("error", "input.invalid", "$", str(error)),
            ],
        }

    serialized = json.dumps(result, ensure_ascii=False, indent=2)
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(f"{serialized}\n", encoding="utf-8")
    print(serialized)

    if result["status"] == "pass":
        return 0
    if result["status"] == "warning":
        return 2
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
