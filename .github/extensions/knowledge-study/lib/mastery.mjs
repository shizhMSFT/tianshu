const ratingScores = { again: 0, unsure: 0.5, know: 1 };

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
        const cards = studySet.flashcards.filter((item) => item.conceptId === concept.id);
        const questions = studySet.quizQuestions.filter((item) => item.conceptId === concept.id);
        const cardValues = cards
            .map((card) => ratingScores[progress.flashcards?.[card.id]?.rating])
            .filter((value) => value !== undefined);
        const firstValues = questions
            .map((question) => progress.quiz?.[question.id]?.correct)
            .filter((value) => typeof value === "boolean")
            .map(Number);
        const retestValues = questions
            .map((question) => progress.retests?.[question.id]?.correct)
            .filter((value) => typeof value === "boolean")
            .map(Number);
        const flashScore = average(cardValues);
        const firstScore = average(firstValues);
        const retestScore = average(retestValues);
        let quizScore = firstScore;
        if (firstScore !== null && retestScore !== null) quizScore = 0.4 * firstScore + 0.6 * retestScore;
        const score = weightedAvailable([
            [flashScore, 0.4],
            [quizScore, 0.6],
        ]);
        return {
            id: concept.id,
            title: concept.title,
            score: round(score ?? 0),
            status: statusFor(score),
            flashScore: round(flashScore),
            firstQuizScore: round(firstScore),
            retestScore: round(retestScore),
            attempted: cardValues.length + firstValues.length + retestValues.length > 0,
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
    return studySet.quizQuestions.filter((question) => weakConcepts.has(question.conceptId));
}

function average(values) {
    return values.length ? values.reduce((total, value) => total + value, 0) / values.length : null;
}

function weightedAvailable(entries) {
    const available = entries.filter(([value]) => value !== null);
    if (!available.length) return null;
    const weights = available.reduce((total, [, weight]) => total + weight, 0);
    return available.reduce((total, [value, weight]) => total + value * weight, 0) / weights;
}

function statusFor(score) {
    if (score === null) return "Not started";
    if (score >= 0.8) return "Mastered";
    if (score >= 0.55) return "Developing";
    return "Needs review";
}

function round(value) {
    return value === null ? null : Math.round(value * 1000) / 1000;
}
