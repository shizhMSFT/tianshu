import test from "node:test";
import assert from "node:assert/strict";
import {
    buildChallengeQueue,
    buildDiagnosticQueue,
    buildReviewQueue,
    calculateMastery,
    createDefaultProgress,
} from "../lib/mastery.mjs";

const studySet = {
    concepts: [{ id: "vector-db", title: "Vector Database" }],
    flashcards: [{ id: "card-vector", conceptId: "vector-db" }],
    quizQuestions: [
        { id: "quiz-vector-1", conceptId: "vector-db", stage: "diagnostic" },
        { id: "quiz-vector-2", conceptId: "vector-db", stage: "diagnostic" },
        { id: "quiz-vector-3", conceptId: "vector-db", stage: "practice" },
        { id: "quiz-vector-4", conceptId: "vector-db", stage: "challenge" },
    ],
};

test("requires two correct questions to establish mastery", () => {
    const progress = createDefaultProgress();
    progress.quiz["quiz-vector-1"] = { correct: true };
    progress.quiz["quiz-vector-2"] = { correct: true };
    const result = calculateMastery(studySet, progress);
    assert.equal(result.overallScore, 1);
    assert.equal(result.status, "Mastered");
});

test("keeps a concept developing until a second distinct question is correct", () => {
    const progress = createDefaultProgress();
    progress.quiz["quiz-vector-1"] = { correct: false };
    progress.quiz["quiz-vector-3"] = { correct: true };
    const result = calculateMastery(studySet, progress);
    assert.equal(result.overallScore, 0.5);
    assert.equal(result.status, "Developing");
});

test("queues unanswered practice questions for weak concepts", () => {
    const progress = createDefaultProgress();
    progress.quiz["quiz-vector-1"] = { correct: false };
    assert.deepEqual(buildReviewQueue(studySet, progress).map((item) => item.id), [
        "quiz-vector-2",
        "quiz-vector-3",
    ]);
});

test("starts with unanswered diagnostic questions and unlocks challenges after mastery", () => {
    const progress = createDefaultProgress();
    assert.deepEqual(buildDiagnosticQueue(studySet, progress).map((item) => item.id), [
        "quiz-vector-1",
        "quiz-vector-2",
    ]);
    progress.quiz["quiz-vector-1"] = { correct: true };
    progress.quiz["quiz-vector-2"] = { correct: true };
    assert.deepEqual(buildChallengeQueue(studySet, progress).map((item) => item.id), ["quiz-vector-4"]);
});
