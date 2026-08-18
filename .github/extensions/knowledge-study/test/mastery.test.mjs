import test from "node:test";
import assert from "node:assert/strict";
import { buildReviewQueue, calculateMastery, createDefaultProgress } from "../lib/mastery.mjs";

const studySet = {
    concepts: [{ id: "vector-db", title: "Vector Database" }],
    flashcards: [{ id: "card-vector", conceptId: "vector-db" }],
    quizQuestions: [{ id: "quiz-vector", conceptId: "vector-db" }],
};

test("combines confidence and first quiz result", () => {
    const progress = createDefaultProgress();
    progress.flashcards["card-vector"] = { rating: "know" };
    progress.quiz["quiz-vector"] = { correct: true };
    const result = calculateMastery(studySet, progress);
    assert.equal(result.overallScore, 1);
    assert.equal(result.status, "Mastered");
});

test("retest improves but does not erase the first attempt", () => {
    const progress = createDefaultProgress();
    progress.flashcards["card-vector"] = { rating: "unsure" };
    progress.quiz["quiz-vector"] = { correct: false };
    progress.retests["quiz-vector"] = { correct: true };
    const result = calculateMastery(studySet, progress);
    assert.equal(result.overallScore, 0.56);
    assert.equal(result.status, "Developing");
});

test("queues non-mastered concepts for review", () => {
    const progress = createDefaultProgress();
    assert.deepEqual(buildReviewQueue(studySet, progress).map((item) => item.id), ["quiz-vector"]);
});
