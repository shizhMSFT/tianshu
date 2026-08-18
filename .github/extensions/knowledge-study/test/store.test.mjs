import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createStudyIdentity, loadStudy, saveProgress, saveStudySet } from "../lib/store.mjs";

test("persists a study set and progress under a stable identity", async () => {
    const workspace = await mkdtemp(join(tmpdir(), "knowledge-study-"));
    try {
        const first = createStudyIdentity("C:\\knowledge.md", "content");
        const second = createStudyIdentity("C:\\knowledge.md", "content");
        assert.deepEqual(first, second);
        await saveStudySet(workspace, first.studySetId, { title: "Study" });
        await saveProgress(workspace, first.studySetId, {
            schemaVersion: 1,
            flashcards: { card: { rating: "know" } },
            quiz: {},
            retests: {},
        });
        const stored = await loadStudy(workspace, first.studySetId);
        assert.equal(stored.studySet.title, "Study");
        assert.equal(stored.progress.flashcards.card.rating, "know");
    } finally {
        await rm(workspace, { recursive: true, force: true });
    }
});
