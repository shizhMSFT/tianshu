export async function requestGeneration(session, { instanceId, knowledgePath, headings, learningObjectives = [] }) {
    const prompt = [
        `[knowledge-study:generate] Generate a grounded study set for Canvas instance "${instanceId}".`,
        "Read only the attached Markdown as the knowledge source.",
        "Then invoke the save_generated_study_set action on that exact canvas instance with { studySet }.",
        "Create one concept for each major H2 section, at least one flashcard and one multiple-choice quiz question per concept.",
        "Each quiz must have exactly four options and a zero-based correctOption.",
        "Every concept, flashcard, and quiz must include source { heading, excerpt }, where heading exactly matches a Markdown heading and excerpt is an exact, short substring from that section.",
        "Use concise questions that test recognition, diagnosis, and technical decisions rather than trivia.",
        "Study-set shape:",
        '{"title":"...","concepts":[{"id":"...","title":"...","summary":"...","source":{"heading":"...","excerpt":"..."}}],"flashcards":[{"id":"...","conceptId":"...","prompt":"...","answer":"...","explanation":"...","difficulty":"easy|medium|hard","source":{"heading":"...","excerpt":"..."}}],"quizQuestions":[{"id":"...","conceptId":"...","prompt":"...","options":["...","...","...","..."],"correctOption":0,"rationale":"...","difficulty":"easy|medium|hard","source":{"heading":"...","excerpt":"..."}}]}',
        `Available headings: ${headings.join(" | ")}`,
        learningObjectives.length ? `Learning objectives: ${learningObjectives.join(" | ")}` : "",
        "Do not paste the study set into chat; complete the request through the canvas action.",
    ].filter(Boolean).join("\n");
    return session.send({
        prompt,
        attachments: [{ type: "file", path: knowledgePath }],
    });
}
