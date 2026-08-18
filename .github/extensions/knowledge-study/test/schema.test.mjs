import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
    parseMarkdownSections,
    readKnowledgePack,
    validateKnowledgePackManifest,
    validateStudySet,
} from "../lib/schema.mjs";

const content = "# Trainer\n\nIntro.\n\n## Vector Database\n\nA vector store can signal semantic search or RAG.";
const knowledge = { content, sections: parseMarkdownSections(content) };
const source = {
    heading: "Vector Database",
    excerpt: "A vector store can signal semantic search or RAG.",
};

function validStudySet() {
    const quizQuestions = Array.from({ length: 10 }, (_, index) => ({
        id: `quiz-vector-${index}`,
        conceptId: "vector-db",
        stage: index < 6 ? "diagnostic" : index < 8 ? "practice" : "challenge",
        prompt: `What should be checked in scenario ${index + 1}?`,
        options: ["Usage", "Color", "Font", "Operating system"],
        correctOption: 0,
        rationale: "Usage distinguishes retrieval from storage.",
        difficulty: "medium",
        source,
    }));
    return {
        title: "Trainer",
        concepts: [{ id: "vector-db", title: "Vector DB", summary: "Retrieval signal", source }],
        flashcards: [{
            id: "card-vector",
            conceptId: "vector-db",
            prompt: "What can it signal?",
            answer: "Semantic search or RAG.",
            explanation: "Trace downstream usage.",
            difficulty: "easy",
            source,
        }],
        quizQuestions,
    };
}

test("accepts a grounded paired study set", () => {
    assert.equal(validateStudySet(validStudySet(), knowledge).valid, true);
});

test("rejects an excerpt absent from the Markdown", () => {
    const value = validStudySet();
    value.flashcards[0].source = { ...source, excerpt: "Unsupported claim" };
    const result = validateStudySet(value, knowledge);
    assert.equal(result.valid, false);
    assert.match(result.errors.join(" "), /not an exact substring/);
});

test("requires four quiz options", () => {
    const value = validStudySet();
    value.quizQuestions[0].options = ["A", "B"];
    assert.equal(validateStudySet(value, knowledge).valid, false);
});

test("requires a broad, staged question pool", () => {
    const value = validStudySet();
    value.quizQuestions = value.quizQuestions.slice(0, 3);
    const result = validateStudySet(value, knowledge);
    assert.equal(result.valid, false);
    assert.match(result.errors.join(" "), /at least ten quiz questions/);
});

test("includes nested subsections in a parent heading grounding scope", () => {
    const nested = parseMarkdownSections("## Topic\n\n### Detail\n\nGrounded fact.");
    assert.match(nested.find((section) => section.heading === "Topic").content, /Grounded fact/);
});

test("validates a Knowledge Pack v1 manifest", () => {
    assert.deepEqual(validateKnowledgePackManifest({
        schemaVersion: 1,
        id: "vector-training",
        title: "Vector Training",
        knowledgeFile: "knowledge.md",
        sourceSkill: "detect-vectors",
        audience: "technical-developer",
        learningObjectives: ["Recognize vector workload signals"],
        tags: ["rag"],
    }), []);
});

test("loads a Knowledge Pack and resolves its Markdown", async () => {
    const root = await mkdtemp(join(tmpdir(), "knowledge-pack-"));
    try {
        await writeFile(join(root, "manifest.json"), JSON.stringify({
            schemaVersion: 1,
            id: "vector-training",
            title: "Vector Training",
            knowledgeFile: "knowledge.md",
            learningObjectives: ["Recognize vector workload signals"],
        }));
        await writeFile(join(root, "knowledge.md"), "# Vector Training\n\n## Signal\n\nGrounded fact.");
        const pack = await readKnowledgePack(root);
        assert.equal(pack.manifest.id, "vector-training");
        assert.equal(pack.knowledge.title, "Vector Training");
    } finally {
        await rm(root, { recursive: true, force: true });
    }
});

test("rejects Knowledge Pack traversal outside its directory", async () => {
    const root = await mkdtemp(join(tmpdir(), "knowledge-pack-"));
    const pack = join(root, "pack");
    try {
        await mkdir(pack);
        await writeFile(join(root, "outside.md"), "# Outside");
        await writeFile(join(pack, "manifest.json"), JSON.stringify({
            schemaVersion: 1,
            id: "unsafe-pack",
            title: "Unsafe Pack",
            knowledgeFile: "../outside.md",
            learningObjectives: ["Unsafe objective"],
        }));
        await assert.rejects(() => readKnowledgePack(pack), /must stay inside/);
    } finally {
        await rm(root, { recursive: true, force: true });
    }
});
