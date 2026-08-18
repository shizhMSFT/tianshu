import { createHash } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname, join, normalize, resolve } from "node:path";
import { createDefaultProgress } from "./mastery.mjs";

const writes = new Map();

export function createStudyIdentity(knowledgePath, content) {
    const normalizedPath = normalize(resolve(knowledgePath)).toLowerCase();
    const contentHash = createHash("sha256").update(content).digest("hex");
    const studySetId = createHash("sha256")
        .update(`${normalizedPath}\0${contentHash}`)
        .digest("hex")
        .slice(0, 20);
    return { studySetId, contentHash };
}

export async function loadStudy(workspacePath, studySetId) {
    const directory = studyDirectory(workspacePath, studySetId);
    const [studySet, progress] = await Promise.all([
        readJson(join(directory, "study-set.json")),
        readJson(join(directory, "progress.json")),
    ]);
    if (!studySet) return null;
    return { studySet, progress: progress || createDefaultProgress() };
}

export async function saveStudySet(workspacePath, studySetId, studySet) {
    const directory = studyDirectory(workspacePath, studySetId);
    await enqueue(directory, async () => {
        await mkdir(directory, { recursive: true });
        await atomicJson(join(directory, "study-set.json"), studySet);
        if (!(await readJson(join(directory, "progress.json")))) {
            await atomicJson(join(directory, "progress.json"), createDefaultProgress());
        }
    });
}

export async function saveProgress(workspacePath, studySetId, progress) {
    const directory = studyDirectory(workspacePath, studySetId);
    await enqueue(directory, async () => {
        await mkdir(directory, { recursive: true });
        await atomicJson(join(directory, "progress.json"), {
            ...progress,
            updatedAt: new Date().toISOString(),
        });
    });
}

export async function resetStudyProgress(workspacePath, studySetId) {
    const directory = studyDirectory(workspacePath, studySetId);
    await enqueue(directory, async () => {
        await mkdir(directory, { recursive: true });
        await atomicJson(join(directory, "progress.json"), createDefaultProgress());
    });
}

function studyDirectory(workspacePath, studySetId) {
    if (!/^[a-f0-9]{20}$/.test(studySetId)) throw new Error("Invalid studySetId.");
    return join(workspacePath, "knowledge-study", "study-sets", studySetId);
}

async function readJson(path) {
    try {
        return JSON.parse(await readFile(path, "utf8"));
    } catch (error) {
        if (error.code === "ENOENT") return null;
        throw error;
    }
}

async function atomicJson(path, value) {
    const temporary = join(dirname(path), `.${Date.now()}-${process.pid}.tmp`);
    await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, "utf8");
    try {
        await rename(temporary, path);
    } catch (error) {
        await rm(temporary, { force: true });
        throw error;
    }
}

async function enqueue(key, operation) {
    const previous = writes.get(key) || Promise.resolve();
    const current = previous.then(operation, operation);
    writes.set(key, current);
    try {
        await current;
    } finally {
        if (writes.get(key) === current) writes.delete(key);
    }
}
