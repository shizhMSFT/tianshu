import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
    buildKnowledgePack,
    parseLesson,
} from "../scripts/build-knowledge-pack.mjs";

const lesson = `# Agent design

## Why it matters

Boundaries make agents safer.

## Core concepts

Tools perform bounded actions.

## Mental model

This section is intentionally omitted.

## Checkpoint questions

1. Why constrain writes?

<details>
<summary>Show answer 1</summary>

Writes can create irreversible effects.

</details>

## Primary sources

- Source
`;

test("maps one lesson to one H2 concept", () => {
    const result = parseLesson(lesson, "docs/topic/quick/01-agent.md");
    assert.equal(result.title, "Agent design");
    assert.match(result.markdown, /^## Agent design/m);
    assert.match(result.markdown, /Boundaries make agents safer/);
    assert.match(result.markdown, /Writes can create irreversible effects/);
    assert.doesNotMatch(result.markdown, /Mental model/);
    assert.doesNotMatch(result.markdown, /Primary sources/);
});

test("builds a Knowledge Pack from a generated track", async () => {
    const root = await mkdtemp(join(tmpdir(), "quiz-pack-"));
    try {
        const topic = join(root, "docs", "foundry");
        await mkdir(join(topic, "quick"), { recursive: true });
        await writeFile(join(topic, "README.md"), "# Foundry\n\n## Goal and audience\n\nBuild a safe agent.\n");
        await writeFile(join(topic, "quick", "01-agent.md"), lesson);
        const result = await buildKnowledgePack({
            repositoryRoot: root,
            topicPath: "docs/foundry",
            track: "quick",
        });
        const manifest = JSON.parse(await readFile(result.manifestPath, "utf8"));
        const knowledge = await readFile(result.knowledgePath, "utf8");
        assert.equal(manifest.id, "foundry-quick");
        assert.equal(manifest.sourceSkill, "learn");
        assert.equal(result.lessons, 1);
        assert.match(knowledge, /## Agent design/);
    } finally {
        await rm(root, { recursive: true, force: true });
    }
});
