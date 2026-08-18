import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
    CanvasError,
    createCanvas,
    joinSession,
} from "@github/copilot-sdk/extension";
import { requestGeneration } from "./lib/generator.mjs";
import {
    buildChallengeQueue,
    buildDiagnosticQueue,
    buildReviewQueue,
    calculateMastery,
    createDefaultProgress,
} from "./lib/mastery.mjs";
import { readKnowledge, readKnowledgePack, validateStudySet } from "./lib/schema.mjs";
import {
    createStudyIdentity,
    loadStudy,
    resetStudyProgress,
    saveProgress,
    saveStudySet,
} from "./lib/store.mjs";

const extensionDirectory = dirname(fileURLToPath(import.meta.url));
const servers = new Map();

const session = await joinSession({
    systemMessage: {
        mode: "append",
        content: [
            "The Knowledge Study canvas may send a user message beginning with [knowledge-study:generate].",
            "For that message, inspect the attached Markdown only, create a source-grounded study set, and invoke the canvas action save_generated_study_set on the stated instance.",
            "Do not answer with the question bank in chat. If validation rejects the first action call, correct only the reported issues and retry once.",
        ].join(" "),
    },
    canvases: [
        createCanvas({
            id: "knowledge-study",
            displayName: "Knowledge Study",
            description: "Turn a grounded Markdown knowledge file into interactive flashcards, quizzes, and mastery review.",
            inputSchema: {
                type: "object",
                properties: {
                    knowledgePath: {
                        type: "string",
                        minLength: 1,
                        description: "Absolute or workspace-relative path to a Markdown knowledge file.",
                    },
                    knowledgePackPath: {
                        type: "string",
                        minLength: 1,
                        description: "Absolute or workspace-relative path to a Knowledge Pack v1 directory.",
                    },
                    studySetId: {
                        type: "string",
                        minLength: 1,
                        description: "Optional stable study-set ID to reopen.",
                    },
                },
                oneOf: [
                    { required: ["knowledgePath"] },
                    { required: ["knowledgePackPath"] },
                ],
                additionalProperties: false,
            },
            actions: [
                {
                    name: "generate_study_set",
                    description: "Queue model-backed flashcard and quiz generation for this canvas.",
                    handler: async (ctx) => queueGeneration(ctx.instanceId),
                },
                {
                    name: "save_generated_study_set",
                    description: "Validate and save a generated, Markdown-grounded study set for this canvas instance.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            studySet: { type: "object" },
                        },
                        required: ["studySet"],
                        additionalProperties: false,
                    },
                    handler: async (ctx) => acceptGeneratedStudySet(ctx.instanceId, ctx.input?.studySet),
                },
                {
                    name: "load_study_set",
                    description: "Load the current study set, progress, and mastery summary.",
                    handler: async (ctx) => getPublicState(ctx.instanceId),
                },
                {
                    name: "get_progress",
                    description: "Return the current concept mastery summary.",
                    handler: async (ctx) => {
                        const state = requireInstance(ctx.instanceId);
                        const stored = await loadStudy(state.workspacePath, state.identity.studySetId);
                        return calculateMastery(stored?.studySet, stored?.progress);
                    },
                },
                {
                    name: "reset_progress",
                    description: "Clear learner attempts while retaining the generated study set.",
                    handler: async (ctx) => {
                        const state = requireInstance(ctx.instanceId);
                        await resetStudyProgress(state.workspacePath, state.identity.studySetId);
                        publish(state, "progress");
                        return getPublicState(ctx.instanceId);
                    },
                },
            ],
            open: async (ctx) => {
                let entry = servers.get(ctx.instanceId);
                if (!entry) {
                    const source = await resolveKnowledgeSource(ctx.input);
                    const { knowledgePath, knowledge } = source;
                    const identity = createStudyIdentity(knowledgePath, knowledge.content);
                    entry = await startServer({
                        instanceId: ctx.instanceId,
                        knowledgePath,
                        knowledge,
                        source,
                        identity,
                        workspacePath: requireWorkspacePath(),
                    });
                    servers.set(ctx.instanceId, entry);
                }
                return {
                    title: entry.knowledge.title || "Knowledge Study",
                    status: "Ready to study",
                    url: entry.url,
                };
            },
            onClose: async (ctx) => {
                const entry = servers.get(ctx.instanceId);
                if (!entry) return;
                servers.delete(ctx.instanceId);
                for (const client of entry.eventClients) client.end();
                await new Promise((resolveClose) => entry.server.close(resolveClose));
            },
        }),
    ],
});

function requireWorkspacePath() {
    if (!session.workspacePath) {
        throw new CanvasError("workspace_unavailable", "The current session has no workspace for study data.");
    }
    return session.workspacePath;
}

function resolveKnowledgePath(inputPath) {
    if (typeof inputPath !== "string" || inputPath.trim() === "") {
        throw new CanvasError("knowledge_path_invalid", "A Markdown knowledge path is required.");
    }
    const resolved = resolve(session.workspacePath || process.cwd(), inputPath);
    if (extname(resolved).toLowerCase() !== ".md") {
        throw new CanvasError("knowledge_path_invalid", "The knowledge source must be a .md file.");
    }
    return resolved;
}

async function resolveKnowledgeSource(input) {
    const hasKnowledgePath = typeof input?.knowledgePath === "string" && input.knowledgePath.trim() !== "";
    const hasPackPath = typeof input?.knowledgePackPath === "string" && input.knowledgePackPath.trim() !== "";
    if (hasKnowledgePath === hasPackPath) {
        throw new CanvasError("knowledge_source_invalid", "Provide exactly one of knowledgePath or knowledgePackPath.");
    }
    if (hasPackPath) {
        const packPath = resolve(session.workspacePath || process.cwd(), input.knowledgePackPath);
        try {
            const pack = await readKnowledgePack(packPath);
            return { kind: "knowledge-pack", ...pack };
        } catch (error) {
            throw new CanvasError("knowledge_pack_invalid", error.message);
        }
    }
    const knowledgePath = resolveKnowledgePath(input.knowledgePath);
    return { kind: "markdown", knowledgePath, knowledge: await readKnowledge(knowledgePath) };
}

function requireInstance(instanceId) {
    const entry = servers.get(instanceId);
    if (!entry) throw new CanvasError("study_not_open", "Open the Knowledge Study canvas first.");
    return entry;
}

async function queueGeneration(instanceId) {
    const state = requireInstance(instanceId);
    state.generation = { status: "generating", failures: 0, error: null };
    publish(state, "generation");
    try {
        const messageId = await requestGeneration(session, {
            instanceId,
            knowledgePath: state.knowledgePath,
            headings: state.knowledge.sections.map((section) => section.heading),
            learningObjectives: state.source.manifest?.learningObjectives || [],
        });
        return { status: "queued", messageId, studySetId: state.identity.studySetId };
    } catch (error) {
        state.generation = { status: "failed", failures: 0, error: error.message };
        publish(state, "generation");
        throw new CanvasError("generation_request_failed", error.message);
    }
}

async function acceptGeneratedStudySet(instanceId, candidate) {
    const state = requireInstance(instanceId);
    if (state.generation.failures >= 2) {
        throw new CanvasError("generation_failed", "Generation already failed validation twice. Start a new generation request.");
    }
    const result = validateStudySet(candidate, state.knowledge);
    if (!result.valid) {
        state.generation.failures += 1;
        state.generation.status = state.generation.failures >= 2 ? "failed" : "repairing";
        state.generation.error = result.errors.join("; ");
        publish(state, "generation");
        throw new CanvasError(
            state.generation.failures >= 2 ? "generation_failed" : "study_set_invalid",
            `Study-set validation failed: ${result.errors.join("; ")}`,
        );
    }

    const studySet = {
        ...result.value,
        schemaVersion: 1,
        source: {
            path: state.knowledgePath,
            contentHash: state.identity.contentHash,
            title: state.knowledge.title,
            kind: state.source.kind,
            packId: state.source.manifest?.id,
            sourceSkill: state.source.manifest?.sourceSkill,
        },
        generatedAt: new Date().toISOString(),
    };
    await saveStudySet(state.workspacePath, state.identity.studySetId, studySet);
    state.generation = { status: "ready", failures: 0, error: null };
    publish(state, "study-set");
    return {
        status: "saved",
        studySetId: state.identity.studySetId,
        concepts: studySet.concepts.length,
        flashcards: studySet.flashcards.length,
        quizQuestions: studySet.quizQuestions.length,
    };
}

async function getPublicState(instanceId) {
    const state = requireInstance(instanceId);
    const stored = await loadStudy(state.workspacePath, state.identity.studySetId);
    const progress = stored?.progress || createDefaultProgress();
    const mastery = calculateMastery(stored?.studySet, progress);
    return {
        studySetId: state.identity.studySetId,
        knowledge: {
            path: state.knowledgePath,
            title: state.knowledge.title,
            headings: state.knowledge.sections.map((section) => section.heading),
            pack: state.source.manifest ? {
                id: state.source.manifest.id,
                title: state.source.manifest.title,
                sourceSkill: state.source.manifest.sourceSkill || null,
                audience: state.source.manifest.audience || null,
                learningObjectives: state.source.manifest.learningObjectives,
                tags: state.source.manifest.tags || [],
            } : null,
        },
        generation: state.generation,
        studySet: stored?.studySet || null,
        progress,
        mastery,
        recommended: getRecommendedSession(stored?.studySet, progress, mastery),
    };
}

function getRecommendedSession(studySet, progress, mastery) {
    if (!studySet) return null;
    const diagnostic = buildDiagnosticQueue(studySet, progress);
    if (diagnostic.length) {
        return {
            kind: "diagnostic",
            title: "Foundation diagnostic",
            description: `${diagnostic.length} questions to establish your capability baseline.`,
            questionIds: diagnostic.map((question) => question.id),
        };
    }
    const review = buildReviewQueue(studySet, progress);
    if (review.length) {
        return {
            kind: "practice",
            title: "Targeted practice",
            description: `${review.length} new scenario questions to strengthen weak capabilities.`,
            questionIds: review.map((question) => question.id),
        };
    }
    const challenge = buildChallengeQueue(studySet, progress);
    if (challenge.length) {
        return {
            kind: "challenge",
            title: "Advanced challenge",
            description: `You have mastered the foundation. Use ${challenge.length} decision questions to validate transfer.`,
            questionIds: challenge.map((question) => question.id),
        };
    }
    return {
        kind: "complete",
        title: mastery.weakConceptIds.length ? "More practice questions needed" : "Training complete",
        description: mastery.weakConceptIds.length
            ? "The available question pool is exhausted. Generate a new pool for more practice scenarios."
            : "All generated capabilities are mastered. Review later or generate a new question pool.",
        questionIds: [],
    };
}

async function startServer(initialState) {
    const eventClients = new Set();
    const state = {
        ...initialState,
        generation: { status: "idle", failures: 0, error: null },
        eventClients,
    };
    if ((await loadStudy(state.workspacePath, state.identity.studySetId))?.studySet) {
        state.generation.status = "ready";
    }

    const server = createServer(async (request, response) => {
        try {
            await routeRequest(state, request, response);
        } catch (error) {
            sendJson(response, 500, { error: error.message });
        }
    });
    await new Promise((resolveListen) => server.listen(0, "127.0.0.1", resolveListen));
    const address = server.address();
    const port = typeof address === "object" && address ? address.port : 0;
    return { ...state, server, url: `http://127.0.0.1:${port}/` };
}

async function routeRequest(state, request, response) {
    const url = new URL(request.url || "/", "http://127.0.0.1");
    if (request.method === "GET" && url.pathname === "/") {
        return sendFile(response, join(extensionDirectory, "ui", "index.html"), "text/html; charset=utf-8");
    }
    if (request.method === "GET" && url.pathname === "/styles.css") {
        return sendFile(response, join(extensionDirectory, "ui", "styles.css"), "text/css; charset=utf-8");
    }
    if (request.method === "GET" && url.pathname === "/app.js") {
        return sendFile(response, join(extensionDirectory, "ui", "app.js"), "text/javascript; charset=utf-8");
    }
    if (request.method === "GET" && url.pathname === "/api/state") {
        return sendJson(response, 200, await getPublicState(state.instanceId));
    }
    if (request.method === "GET" && url.pathname === "/events") {
        response.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
        });
        response.write("event: ready\ndata: {}\n\n");
        state.eventClients.add(response);
        request.on("close", () => state.eventClients.delete(response));
        return;
    }
    if (request.method === "POST" && url.pathname === "/api/generate") {
        const result = await queueGeneration(state.instanceId);
        return sendJson(response, 202, result);
    }
    if (request.method === "POST" && url.pathname === "/api/attempt") {
        const body = await readJsonBody(request);
        await recordAttempt(state, body);
        publish(state, "progress");
        return sendJson(response, 200, await getPublicState(state.instanceId));
    }
    if (request.method === "POST" && url.pathname === "/api/reset") {
        await resetStudyProgress(state.workspacePath, state.identity.studySetId);
        publish(state, "progress");
        return sendJson(response, 200, await getPublicState(state.instanceId));
    }
    sendJson(response, 404, { error: "Not found" });
}

async function recordAttempt(state, input) {
    const stored = await loadStudy(state.workspacePath, state.identity.studySetId);
    if (!stored?.studySet) throw new Error("Generate a study set before recording attempts.");
    const progress = stored.progress || createDefaultProgress();

    if (input?.kind === "flashcard") {
        if (!stored.studySet.flashcards.some((item) => item.id === input.itemId)) {
            throw new Error("Unknown flashcard.");
        }
        if (!["again", "unsure", "know"].includes(input.rating)) {
            throw new Error("Flashcard rating must be again, unsure, or know.");
        }
        progress.flashcards[input.itemId] = {
            rating: input.rating,
            updatedAt: new Date().toISOString(),
        };
    } else if (input?.kind === "quiz") {
        const question = stored.studySet.quizQuestions.find((item) => item.id === input.itemId);
        if (!question) throw new Error("Unknown quiz question.");
        if (!Number.isInteger(input.selectedIndex) || input.selectedIndex < 0 || input.selectedIndex > 3) {
            throw new Error("Quiz answer index must be between 0 and 3.");
        }
        const phase = input.phase === "review" ? "review" : "first";
        const attempt = {
            selectedIndex: input.selectedIndex,
            correct: input.selectedIndex === question.correctOption,
            answeredAt: new Date().toISOString(),
        };
        if (phase === "review") progress.retests[input.itemId] = attempt;
        else if (!progress.quiz[input.itemId]) progress.quiz[input.itemId] = attempt;
    } else {
        throw new Error("Attempt kind must be flashcard or quiz.");
    }
    await saveProgress(state.workspacePath, state.identity.studySetId, progress);
}

function publish(state, event) {
    const payload = `event: ${event}\ndata: ${JSON.stringify({ at: Date.now() })}\n\n`;
    for (const client of state.eventClients) client.write(payload);
}

async function sendFile(response, path, contentType) {
    const content = await readFile(path);
    response.writeHead(200, { "Content-Type": contentType, "Cache-Control": "no-store" });
    response.end(content);
}

function sendJson(response, status, value) {
    response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
    response.end(JSON.stringify(value));
}

async function readJsonBody(request) {
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    if (chunks.reduce((total, chunk) => total + chunk.length, 0) > 1_000_000) {
        throw new Error("Request body is too large.");
    }
    return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}
