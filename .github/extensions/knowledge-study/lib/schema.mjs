import { readFile, stat } from "node:fs/promises";
import { isAbsolute, relative, resolve } from "node:path";

export async function readKnowledgePack(packPath) {
    let info;
    try {
        info = await stat(packPath);
    } catch {
        throw new Error(`Knowledge Pack does not exist: ${packPath}`);
    }
    if (!info.isDirectory()) throw new Error(`Knowledge Pack path is not a directory: ${packPath}`);

    const manifestPath = resolve(packPath, "manifest.json");
    let manifest;
    try {
        manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    } catch (error) {
        if (error.code === "ENOENT") throw new Error(`Knowledge Pack is missing manifest.json: ${packPath}`);
        if (error instanceof SyntaxError) throw new Error(`Knowledge Pack manifest is not valid JSON: ${manifestPath}`);
        throw error;
    }
    const errors = validateKnowledgePackManifest(manifest);
    if (errors.length) throw new Error(`Knowledge Pack manifest is invalid: ${errors.join("; ")}`);

    const knowledgePath = resolve(packPath, manifest.knowledgeFile);
    const relativePath = relative(resolve(packPath), knowledgePath);
    if (relativePath === "" || relativePath.startsWith("..") || isAbsolute(relativePath)) {
        throw new Error("Knowledge Pack knowledgeFile must stay inside the pack directory.");
    }
    const knowledge = await readKnowledge(knowledgePath);
    return { packPath: resolve(packPath), manifestPath, manifest, knowledgePath, knowledge };
}

export function validateKnowledgePackManifest(manifest) {
    const errors = [];
    if (!isObject(manifest)) return ["manifest must be an object"];
    if (manifest.schemaVersion !== 1) errors.push("schemaVersion must be 1");
    if (!nonEmpty(manifest.id) || !/^[a-z0-9][a-z0-9-]*$/.test(manifest.id || "")) {
        errors.push("id must use lowercase letters, numbers, and hyphens");
    }
    if (!nonEmpty(manifest.title)) errors.push("title is required");
    if (!nonEmpty(manifest.knowledgeFile) || isAbsolute(manifest.knowledgeFile || "")) {
        errors.push("knowledgeFile must be a relative path");
    } else if (!manifest.knowledgeFile.toLowerCase().endsWith(".md")) {
        errors.push("knowledgeFile must reference a .md file");
    }
    if (manifest.sourceSkill !== undefined && !nonEmpty(manifest.sourceSkill)) errors.push("sourceSkill must be a non-empty string");
    if (manifest.audience !== undefined && !nonEmpty(manifest.audience)) errors.push("audience must be a non-empty string");
    if (!Array.isArray(manifest.learningObjectives) || manifest.learningObjectives.length === 0
        || manifest.learningObjectives.some((objective) => !nonEmpty(objective))) {
        errors.push("learningObjectives must contain at least one non-empty string");
    }
    if (manifest.tags !== undefined
        && (!Array.isArray(manifest.tags) || manifest.tags.some((tag) => !nonEmpty(tag)))) {
        errors.push("tags must be an array of non-empty strings");
    }
    return errors;
}

export async function readKnowledge(path) {
    let info;
    try {
        info = await stat(path);
    } catch {
        throw new Error(`Knowledge file does not exist: ${path}`);
    }
    if (!info.isFile()) throw new Error(`Knowledge path is not a file: ${path}`);
    if (info.size > 1_000_000) throw new Error("Knowledge file exceeds the 1 MB MVP limit.");
    const content = await readFile(path, "utf8");
    const sections = parseMarkdownSections(content);
    if (sections.length === 0) throw new Error("Knowledge file must contain at least one Markdown heading.");
    const title = sections.find((section) => section.level === 1)?.heading || sections[0].heading;
    return { path, title, content, sections };
}

export function parseMarkdownSections(content) {
    const lines = content.replace(/\r\n/g, "\n").split("\n");
    const headings = [];
    for (let index = 0; index < lines.length; index += 1) {
        const match = /^(#{1,6})\s+(.+?)\s*$/.exec(lines[index]);
        if (match) headings.push({ level: match[1].length, heading: match[2].trim(), line: index });
    }
    return headings.map((item, index) => {
        const nextPeer = headings.slice(index + 1).find((candidate) => candidate.level <= item.level);
        const end = nextPeer ? nextPeer.line : lines.length;
        return {
            level: item.level,
            heading: item.heading,
            content: lines.slice(item.line + 1, end).join("\n").trim(),
        };
    });
}

export function validateStudySet(candidate, knowledge) {
    const errors = [];
    if (!isObject(candidate)) return { valid: false, errors: ["studySet must be an object"] };
    if (!nonEmpty(candidate.title)) errors.push("title is required");
    const concepts = validateArray(candidate.concepts, "concepts", errors);
    const flashcards = validateArray(candidate.flashcards, "flashcards", errors);
    const quizQuestions = validateArray(candidate.quizQuestions, "quizQuestions", errors);
    const conceptIds = new Set();
    const itemIds = new Set();

    for (const [index, concept] of concepts.entries()) {
        const prefix = `concepts[${index}]`;
        validateId(concept, prefix, conceptIds, errors);
        requireStrings(concept, ["title", "summary"], prefix, errors);
        validateSource(concept?.source, knowledge, `${prefix}.source`, errors);
    }
    for (const [index, card] of flashcards.entries()) {
        const prefix = `flashcards[${index}]`;
        validateId(card, prefix, itemIds, errors);
        requireStrings(card, ["conceptId", "prompt", "answer", "explanation"], prefix, errors);
        validateDifficulty(card?.difficulty, `${prefix}.difficulty`, errors);
        if (nonEmpty(card?.conceptId) && !conceptIds.has(card.conceptId)) errors.push(`${prefix}.conceptId is unknown`);
        validateSource(card?.source, knowledge, `${prefix}.source`, errors);
    }
    for (const [index, question] of quizQuestions.entries()) {
        const prefix = `quizQuestions[${index}]`;
        validateId(question, prefix, itemIds, errors);
        requireStrings(question, ["conceptId", "stage", "prompt", "rationale"], prefix, errors);
        validateDifficulty(question?.difficulty, `${prefix}.difficulty`, errors);
        validateStage(question?.stage, `${prefix}.stage`, errors);
        if (nonEmpty(question?.conceptId) && !conceptIds.has(question.conceptId)) errors.push(`${prefix}.conceptId is unknown`);
        if (!Array.isArray(question?.options) || question.options.length !== 4 || question.options.some((option) => !nonEmpty(option))) {
            errors.push(`${prefix}.options must contain exactly four non-empty strings`);
        }
        if (!Number.isInteger(question?.correctOption) || question.correctOption < 0 || question.correctOption > 3) {
            errors.push(`${prefix}.correctOption must be an integer from 0 to 3`);
        }
        validateSource(question?.source, knowledge, `${prefix}.source`, errors);
    }
    for (const conceptId of conceptIds) {
        if (!flashcards.some((card) => card.conceptId === conceptId)) errors.push(`concept ${conceptId} has no flashcard`);
        const questions = quizQuestions.filter((question) => question.conceptId === conceptId);
        if (questions.length < 3) errors.push(`concept ${conceptId} requires at least three quiz questions`);
        if (!questions.some((question) => question.stage === "diagnostic")) errors.push(`concept ${conceptId} requires a diagnostic question`);
        if (!questions.some((question) => question.stage === "practice")) errors.push(`concept ${conceptId} requires a practice question`);
        if (!questions.some((question) => question.stage === "challenge")) errors.push(`concept ${conceptId} requires a challenge question`);
    }
    if (concepts.length === 0) errors.push("at least one concept is required");
    if (quizQuestions.length < 10) errors.push("at least ten quiz questions are required");
    if (quizQuestions.filter((question) => question.stage === "diagnostic").length < 6) {
        errors.push("at least six diagnostic questions are required");
    }

    return errors.length === 0
        ? { valid: true, errors: [], value: { title: candidate.title.trim(), concepts, flashcards, quizQuestions } }
        : { valid: false, errors };
}

function validateArray(value, name, errors) {
    if (!Array.isArray(value)) {
        errors.push(`${name} must be an array`);
        return [];
    }
    return value;
}

function validateId(value, prefix, ids, errors) {
    if (!isObject(value) || !nonEmpty(value.id)) {
        errors.push(`${prefix}.id is required`);
        return;
    }
    if (!/^[a-z0-9][a-z0-9-]*$/.test(value.id)) errors.push(`${prefix}.id must use lowercase letters, numbers, and hyphens`);
    if (ids.has(value.id)) errors.push(`${prefix}.id is duplicated`);
    ids.add(value.id);
}

function requireStrings(value, fields, prefix, errors) {
    if (!isObject(value)) {
        errors.push(`${prefix} must be an object`);
        return;
    }
    for (const field of fields) if (!nonEmpty(value[field])) errors.push(`${prefix}.${field} is required`);
}

function validateDifficulty(value, prefix, errors) {
    if (!["easy", "medium", "hard"].includes(value)) errors.push(`${prefix} must be easy, medium, or hard`);
}

function validateStage(value, prefix, errors) {
    if (!["diagnostic", "practice", "challenge"].includes(value)) {
        errors.push(`${prefix} must be diagnostic, practice, or challenge`);
    }
}

function validateSource(source, knowledge, prefix, errors) {
    if (!isObject(source) || !nonEmpty(source.heading) || !nonEmpty(source.excerpt)) {
        errors.push(`${prefix} requires heading and excerpt`);
        return;
    }
    const section = knowledge.sections.find((item) => item.heading === source.heading);
    if (!section) {
        errors.push(`${prefix}.heading does not match the Markdown`);
        return;
    }
    if (!normalize(section.content).includes(normalize(source.excerpt))) {
        errors.push(`${prefix}.excerpt is not an exact substring of its Markdown section`);
    }
}

function normalize(value) {
    return String(value).replace(/\s+/g, " ").trim();
}

function isObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

function nonEmpty(value) {
    return typeof value === "string" && value.trim().length > 0;
}
