import test from "node:test";
import assert from "node:assert/strict";
import { requestGeneration } from "../lib/generator.mjs";

test("passes Knowledge Pack learning objectives into generation", async () => {
    let sent;
    const session = {
        send: async (message) => {
            sent = message;
            return "message-id";
        },
    };
    const messageId = await requestGeneration(session, {
        instanceId: "study-demo",
        knowledgePath: "C:\\pack\\knowledge.md",
        headings: ["Signal"],
        learningObjectives: ["Recognize the signal", "Select a validation question"],
    });
    assert.equal(messageId, "message-id");
    assert.match(sent.prompt, /Learning objectives: Recognize the signal \| Select a validation question/);
    assert.match(sent.prompt, /10 to 14 quiz questions/);
    assert.match(sent.prompt, /unambiguously best answer/);
    assert.deepEqual(sent.attachments, [{ type: "file", path: "C:\\pack\\knowledge.md" }]);
});
