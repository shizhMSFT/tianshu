export async function requestGeneration(session, { instanceId, knowledgePath, headings, learningObjectives = [] }) {
    const prompt = [
        `[knowledge-study:generate] Generate a grounded study set for Canvas instance "${instanceId}".`,
        "Read only the attached Markdown as the knowledge source.",
        "Then invoke the save_generated_study_set action on that exact canvas instance with { studySet }.",
        "Create one concept for each major H2 section, at least one flashcard and at least three multiple-choice questions per concept. Create 10 to 14 quiz questions in total, including at least six diagnostic questions, even when the source has only a few concepts.",
        "Each quiz must have exactly four options and a zero-based correctOption.",
        'Every quiz must include stage: "diagnostic", "practice", or "challenge". Include at least one diagnostic, one practice, and one challenge question for every concept. Diagnostic questions establish baseline knowledge; practice questions must use a distinct scenario or wording so they can retest understanding without repeating the original answer; challenge questions test a technical decision or trade-off.',
        "Every concept, flashcard, and quiz must include source { heading, excerpt }, where heading exactly matches a Markdown heading and excerpt is an exact, short substring from that section.",
        "Use concise, self-contained questions that test recognition, diagnosis, and technical decisions rather than trivia. Each question must have one unambiguously best answer. Write plausible distractors based on common misconceptions, not unrelated or obviously absurd options. In rationale, explain why the correct answer follows from the source and why the central misconception is wrong.",
        "Study-set shape:",
        '{"title":"...","concepts":[{"id":"...","title":"...","summary":"...","source":{"heading":"...","excerpt":"..."}}],"flashcards":[{"id":"...","conceptId":"...","prompt":"...","answer":"...","explanation":"...","difficulty":"easy|medium|hard","source":{"heading":"...","excerpt":"..."}}],"quizQuestions":[{"id":"...","conceptId":"...","stage":"diagnostic|practice|challenge","prompt":"...","options":["...","...","...","..."],"correctOption":0,"rationale":"...","difficulty":"easy|medium|hard","source":{"heading":"...","excerpt":"..."}}]}',
        `Available headings: ${headings.join(" | ")}`,
        learningObjectives.length ? `Learning objectives: ${learningObjectives.join(" | ")}` : "",
        "Do not paste the study set into chat; complete the request through the canvas action.",
    ].filter(Boolean).join("\n");
    return session.send({
        prompt,
        attachments: [{ type: "file", path: knowledgePath }],
    });
}
