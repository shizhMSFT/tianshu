export function createDefaultProgress() {
    return {
        schemaVersion: 1,
        flashcards: {},
        quiz: {},
        retests: {},
        updatedAt: new Date().toISOString(),
    };
}

export function calculateMastery(studySet, progress = createDefaultProgress()) {
    if (!studySet) {
        return { overallScore: 0, status: "Not started", concepts: [], weakConceptIds: [] };
    }
    const concepts = studySet.concepts.map((concept) => {
        const questions = studySet.quizQuestions.filter((item) => item.conceptId === concept.id);
        const attempts = questions
            .map((question) => progress.quiz?.[question.id]?.correct)
            .filter((value) => typeof value === "boolean")
            .map(Number);
        const correctCount = attempts.reduce((total, value) => total + value, 0);
        const requiredCorrect = Math.min(2, questions.length);
        const score = attempts.length ? Math.min(1, correctCount / requiredCorrect) : null;
        return {
            id: concept.id,
            title: concept.title,
            score: round(score ?? 0),
            status: statusFor(score),
            correctCount,
            requiredCorrect,
            attempted: attempts.length > 0,
        };
    });
    const attempted = concepts.filter((concept) => concept.attempted);
    const overallScore = attempted.length ? average(attempted.map((concept) => concept.score)) : 0;
    return {
        overallScore: round(overallScore),
        status: statusFor(attempted.length ? overallScore : null),
        concepts,
        weakConceptIds: concepts.filter((concept) => concept.status !== "Mastered").map((concept) => concept.id),
    };
}

export function buildReviewQueue(studySet, progress) {
    if (!studySet) return [];
    const weakConcepts = new Set(calculateMastery(studySet, progress).weakConceptIds);
    return studySet.quizQuestions.filter((question) => (
        weakConcepts.has(question.conceptId)
        && progress.quiz?.[question.id] === undefined
        && question.stage !== "challenge"
    ));
}

export function buildDiagnosticQueue(studySet, progress, limit = 8) {
    if (!studySet) return [];
    return studySet.quizQuestions
        .filter((question) => question.stage === "diagnostic" && progress.quiz?.[question.id] === undefined)
        .slice(0, limit);
}

export function buildChallengeQueue(studySet, progress) {
    if (!studySet) return [];
    const mastery = calculateMastery(studySet, progress);
    if (mastery.weakConceptIds.length) return [];
    return studySet.quizQuestions.filter((question) => (
        question.stage === "challenge" && progress.quiz?.[question.id] === undefined
    ));
}

function average(values) {
    return values.length ? values.reduce((total, value) => total + value, 0) / values.length : null;
}

function statusFor(score) {
    if (score === null) return "Not started";
    if (score >= 0.8) return "Mastered";
    if (score >= 0.5) return "Developing";
    return "Needs review";
}

function round(value) {
    return value === null ? null : Math.round(value * 1000) / 1000;
}
