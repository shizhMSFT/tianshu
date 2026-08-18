# Artifact contract

所有文件共享同一个 `deck_id`。引用使用稳定 ID，不依赖数组下标。新增字段可以保留，但不得删除本约定中的必需字段。

## `knowledge-map.json`

```json
{
  "schema_version": "1.0",
  "deck_id": "example-deck",
  "objective": "观众在演示结束后应理解或采取的行动",
  "audience": "目标受众",
  "language": "zh-CN",
  "estimated_minutes": 12,
  "narrative": "从现状到结论的主线",
  "key_messages": ["消息一", "消息二"],
  "sources": [
    {
      "id": "SRC-001",
      "label": "用户提供的研究报告",
      "location": "report.pdf",
      "kind": "file"
    }
  ],
  "facts": [
    {
      "id": "K-001",
      "statement": "可用于演示的事实、论点或数据",
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

必需规则：

- `sources`、`facts`、`key_messages` 均不得为空。
- `confidence` 为 `high`、`medium` 或 `low`。
- `kind` 为 `fact` 或 `inference`；推断不得伪装成事实。
- 每个 `facts[].source_refs` 必须引用已存在的 `SRC-*`。

## `deck-design.json`

```json
{
  "schema_version": "1.0",
  "deck_id": "example-deck",
  "design_version": 1,
  "style_version": 1,
  "objective": "与 knowledge map 一致的目标",
  "audience": "目标受众",
  "narrative": "完整叙事",
  "estimated_minutes": 12,
  "slide_count": 3,
  "sections": [
    {
      "id": "SEC-01",
      "title": "章节名称",
      "slide_ids": ["S-01", "S-02", "S-03"]
    }
  ],
  "slides": [
    {
      "id": "S-01",
      "order": 1,
      "role": "title",
      "section_id": "SEC-01",
      "purpose": "建立主题与预期",
      "takeaway": "一句话核心结论",
      "title": "面向观众的标题",
      "content": {
        "body": [],
        "data_points": [],
        "speaker_notes": "演讲者备注"
      },
      "source_refs": [],
      "visual": {
        "kind": "shape-composition",
        "description": "视觉构图说明",
        "selection_reason": "该构图直接强化本页 takeaway",
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
      "layout_id": "title-hero",
      "style_variant": "dark",
      "style_version": 1
    }
  ]
}
```

必需规则：

- `role` 为 `title`、`section`、`content`、`summary` 或 `closing`。
- `order` 从 1 开始连续递增，`slide_count` 与实际页数一致。
- `content` 和 `summary` 页必须引用至少一个 `K-*`。
- `visual.kind` 为 `photo`、`illustration`、`icon`、`chart`、`diagram`、`table`、`typography`、`shape-composition` 或 `number-callout`。
- `visual.selection_reason` 必须说明视觉如何强化该页 takeaway，不能只写“美化页面”。
- `visual.source.source_type` 为 `provided`、`brand-library`、`licensed-stock`、`open-license`、`icon-library`、`native-chart`、`native-diagram`、`native-shape` 或 `ai-generated`。
- 每个视觉都必须记录 `license` 和 `credit` 字段；外部图库、开放素材和图标库还必须记录 `uri`。
- `ai-generated` 必须保存最终 `generation_prompt`；不得在图片中生成文字、数据、Logo 或界面。
- 非装饰视觉必须提供 `alt_text`。
- `layout_id`、`style_variant` 和 `style_version` 必须存在于风格指南。

## `style-guide.json`

```json
{
  "schema_version": "1.0",
  "deck_id": "example-deck",
  "style_version": 1,
  "selection": {
    "selected_name": "Editorial Contrast",
    "rationale": "适合受众与内容的原因",
    "candidates": [
      {
        "name": "Editorial Contrast",
        "fit_score": 92,
        "selected": true,
        "rationale": "候选评价"
      },
      {
        "name": "Calm Technical",
        "fit_score": 78,
        "selected": false,
        "rationale": "候选评价"
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
    "description": "重复出现的视觉语言",
    "rules": ["在关键证据处使用统一圆角框"]
  },
  "image_style": {
    "description": "图片裁切、圆角、色调和署名规则",
    "dominant_media": "documentary-photography",
    "source_priority": [
      "provided",
      "brand-library",
      "licensed-stock",
      "open-license",
      "ai-generated"
    ],
    "crop_rule": "使用 16:9 或 4:3 裁切，不拉伸",
    "treatment_rule": "统一色调、圆角和阴影",
    "credit_rule": "需要署名时放在图片附近或页面脚注",
    "ai_generation_rule": "仅用于概念表达，固定提示词模板，不生成文字、数据、Logo 或界面"
  },
  "icon_style": {
    "description": "图标来源、线宽、填充和容器规则"
  },
  "chart_style": {
    "description": "图表颜色、标签、网格线和数据强调规则"
  },
  "table_style": {
    "description": "表头、边框、留白、数字对齐和重点行规则"
  },
  "layouts": [
    {
      "id": "title-hero",
      "description": "标题页构图",
      "purpose": ["title"]
    },
    {
      "id": "evidence-split",
      "description": "文字与证据分栏",
      "purpose": ["content"]
    },
    {
      "id": "summary-grid",
      "description": "总结卡片网格",
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
    "do": ["每页保留足够留白"],
    "dont": ["不要使用装饰性色条或标题下划线"]
  }
}
```

必需规则：

- 至少两个候选风格，且只能有一个被选中。
- 颜色为六位大写十六进制，不带 `#` 或透明度。
- 至少三个 layouts、两个 variants。
- 每个 variant 的正文与背景对比度至少为 4.5:1。
- `safe_margin_in` 至少 0.5，`block_gap_in` 至少 0.3。
- `grid.columns` 至少为 2，`grid.gutter_in` 至少为 0.2。
- 图片、图标、图表和表格必须分别定义处理规则。
- `image_style` 必须定义主导媒体语言、来源优先级、裁切、视觉处理、署名和 AI 生成规则。

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
      "evidence": "逐页引用均可回溯到 knowledge map"
    }
  ],
  "blockers": [],
  "issues": [
    {
      "id": "ISSUE-001",
      "severity": "minor",
      "status": "resolved",
      "resolution": "拆分信息过载页面"
    }
  ]
}
```

`checks` 必须覆盖质量标准中的全部检查 ID；证据需要指向具体页面、字段或修复，不接受“看起来不错”等空泛描述。

## `final-qa.json`

```json
{
  "schema_version": "1.0",
  "deck_id": "example-deck",
  "design_version": 1,
  "style_version": 1,
  "pptx_path": "example-deck.pptx",
  "status": "pass",
  "checks": {
    "content": "pass",
    "file": "pass",
    "visual": "pass",
    "design_fidelity": "pass"
  },
  "evidence": [],
  "fixes": []
}
```
