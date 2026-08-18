import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { basename, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export function parseLesson(markdown, sourcePath) {
    const title = /^#\s+(.+?)\s*$/m.exec(markdown)?.[1]?.trim();
    if (!title) throw new Error(`Lesson has no H1 title: ${sourcePath}`);

    const sections = parseH2Sections(markdown);
    const why = sections.get("Why it matters");
    const core = sections.get("Core concepts") || sections.get("Core concepts and mechanism");
    const checkpoints = sections.get("Checkpoint questions");
    if (!why || !core) {
        throw new Error(`Lesson must contain "Why it matters" and either "Core concepts" or "Core concepts and mechanism": ${sourcePath}`);
    }

    const parts = [
        `## ${title}`,
        "",
        "### Why it matters",
        "",
        cleanSection(why),
        "",
        "### Core concepts",
        "",
        cleanSection(core),
    ];
    if (checkpoints) {
        parts.push("", "### Checkpoint knowledge", "", cleanSection(checkpoints));
    }
    parts.push("", "### Source lesson", "", `\`${sourcePath.replaceAll("\\", "/")}\``);
    return { title, markdown: parts.join("\n").trim() };
}

export function buildPackContent({ topicTitle, track, lessons, topicGoal }) {
    const header = [
        `# ${topicTitle} — ${capitalize(track)} track quiz knowledge`,
        "",
        topicGoal || `Knowledge derived from the ${track} learning track.`,
        "",
        "> This file is generated deterministically from approved learning materials. Edit the source lessons, not this file.",
    ];
    return `${header.join("\n")}\n\n${lessons.map((lesson) => lesson.markdown).join("\n\n")}\n`;
}

export async function buildKnowledgePack({ repositoryRoot, topicPath, track }) {
    if (!["quick", "deep"].includes(track)) throw new Error('Track must be "quick" or "deep".');
    const root = resolve(repositoryRoot);
    const topicRoot = resolve(root, topicPath);
    assertInside(root, topicRoot, "Topic path");
    const trackRoot = resolve(topicRoot, track);
    assertInside(topicRoot, trackRoot, "Track path");

    const topicReadme = await readFile(join(topicRoot, "README.md"), "utf8");
    const topicTitle = /^#\s+(.+?)\s*$/m.exec(topicReadme)?.[1]?.trim() || basename(topicRoot);
    const topicGoal = extractSection(topicReadme, "Goal and audience");
    const moduleNames = (await readdir(trackRoot))
        .filter((name) => /^\d+-.+\.md$/i.test(name))
        .sort((left, right) => left.localeCompare(right, "en"));
    if (!moduleNames.length) throw new Error(`No numbered Markdown lessons found in ${trackRoot}`);

    const lessons = [];
    for (const name of moduleNames) {
        const absolutePath = join(trackRoot, name);
        const sourcePath = relative(root, absolutePath);
        lessons.push(parseLesson(await readFile(absolutePath, "utf8"), sourcePath));
    }

    const topicId = slugify(basename(topicRoot));
    const packId = `${topicId}-${track}`;
    const outputDirectory = join(root, ".learning", "quiz", packId);
    const knowledge = buildPackContent({ topicTitle, track, lessons, topicGoal });
    const sourceHash = createHash("sha256")
        .update(moduleNames.join("\0"))
        .update("\0")
        .update(knowledge)
        .digest("hex");
    const manifest = {
        schemaVersion: 1,
        id: packId,
        title: `${topicTitle} — ${capitalize(track)} track`,
        knowledgeFile: "knowledge.md",
        sourceSkill: "learn",
        audience: "learner",
        learningObjectives: lessons.map((lesson) => `Demonstrate understanding of ${lesson.title}`),
        tags: ["quiz", "learn", track],
        source: {
            topicPath: relative(root, topicRoot).replaceAll("\\", "/"),
            track,
            sourceHash,
        },
    };

    await mkdir(outputDirectory, { recursive: true });
    await Promise.all([
        writeFile(join(outputDirectory, "knowledge.md"), knowledge, "utf8"),
        writeFile(join(outputDirectory, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8"),
    ]);
    return {
        knowledgePackPath: outputDirectory,
        manifestPath: join(outputDirectory, "manifest.json"),
        knowledgePath: join(outputDirectory, "knowledge.md"),
        packId,
        lessons: lessons.length,
        sourceHash,
    };
}

function parseH2Sections(markdown) {
    const lines = markdown.replace(/\r\n/g, "\n").split("\n");
    const sections = new Map();
    let heading = null;
    let content = [];
    const flush = () => {
        if (heading) sections.set(heading, content.join("\n").trim());
    };
    for (const line of lines) {
        const match = /^##\s+(.+?)\s*$/.exec(line);
        if (match) {
            flush();
            heading = match[1].trim();
            content = [];
        } else if (heading) {
            content.push(line);
        }
    }
    flush();
    return sections;
}

function extractSection(markdown, heading) {
    return cleanSection(parseH2Sections(markdown).get(heading) || "");
}

function cleanSection(value) {
    return value
        .replace(/\n##[\s\S]*$/g, "")
        .replace(/^\s+|\s+$/g, "")
        .replace(/\n{3,}/g, "\n\n");
}

function assertInside(parent, child, label) {
    const path = relative(parent, child);
    if (path === "" || path.startsWith("..") || isAbsolute(path)) {
        throw new Error(`${label} must resolve inside ${parent}`);
    }
}

function slugify(value) {
    const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (!slug) throw new Error(`Cannot derive a pack ID from ${value}`);
    return slug;
}

function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

function parseArguments(args) {
    const values = {};
    for (let index = 0; index < args.length; index += 1) {
        const argument = args[index];
        if (argument === "--topic" || argument === "--track" || argument === "--root") {
            const value = args[index + 1];
            if (!value) throw new Error(`Missing value for ${argument}`);
            values[argument.slice(2)] = value;
            index += 1;
        } else {
            throw new Error(`Unknown argument: ${argument}`);
        }
    }
    if (!values.topic) throw new Error("--topic is required");
    if (!values.track) throw new Error("--track is required");
    return values;
}

async function main() {
    const args = parseArguments(process.argv.slice(2));
    const result = await buildKnowledgePack({
        repositoryRoot: args.root || process.cwd(),
        topicPath: args.topic,
        track: args.track,
    });
    process.stdout.write(`${JSON.stringify(result)}\n`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    main().catch((error) => {
        process.stderr.write(`${error.message}\n`);
        process.exitCode = 1;
    });
}
