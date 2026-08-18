# Lab output contract

Use this reference when presenting the lab plan and when authoring the approved lab materials and execution report.

## Approval plan

Echo the complete plan in a user-visible `ask_user` approval prompt before creating lab files or executing the lab. A lab plan is learner-facing content, not an agent implementation plan: do not enter or require plan mode, and do not place the only copy in hidden reasoning or an artifact.

Put the following rendered Markdown directly in the `question` field of `ask_user`:

```markdown
# Lab plan: <descriptive title>

## Goal and learner value

<The practical capability the learner will exercise and why the lab is meaningful>

## Related learning

<Relative links to the local learning docs this lab exercises, or validated external foundations when no local docs exist>

## Claim to test

<The expected behavior, hypothesis, comparison, or capability the run will test>

## Scope and environment

| Item | Planned value |
| --- | --- |
| Target | <local, container, cluster, cloud service, device, or other system> |
| Relevant versions | <versions, revisions, images, models, or "to be captured at execution"> |
| Estimated duration | <bounded estimate> |
| Cost and resource impact | <none, bounded estimate, or unknown with explanation> |

## Prerequisites

- <Required knowledge, software, hardware, access, credentials, and setup>

## Execution plan

| Step | Command or action | Evidence | Success criterion |
| --- | --- | --- | --- |
| 1 | <Exact command when known, otherwise a precise action> | <Output or artifact to capture> | <Observable pass condition> |

## Proposed files

<The labs/<theme>/<topic>/<lab-slug>/ tree, including README.md and report.md>

## Safety and cleanup

<Risks, approval boundaries, secret handling, resource targets, and teardown>

## Completion criteria

- <What must be demonstrated or honestly reported>
```

After the rendered plan, end the same `ask_user` question with: `Does this lab plan look right?`

Provide these choices:

1. `Approve and run the lab`
2. `Revise the lab plan`

Only the first choice approves file creation and normal-risk execution. Follow [execution-safety.md](execution-safety.md) for operations that need an additional focused confirmation. Do not call `ask_user` until its question contains the complete goal, related learning, claim, scope, environment, prerequisites, execution plan, proposed files, safety and cleanup notes, and completion criteria.

When presenting a revision, echo the complete revised plan again. Reuse prior answers and findings. A delta or list of changes is not approval. Obtain fresh approval when the goal, executable steps, resource targets, safety boundary, evidence contract, cleanup, or proposed files materially change.

## Output layout

Use stable lowercase-hyphenated path segments:

```text
labs/
`-- <theme>/
    `-- <topic>/
        `-- <lab-slug>/
            |-- README.md
            |-- report.md
            |-- scripts/       # Optional reusable automation
            |-- manifests/     # Optional declarative inputs
            `-- artifacts/     # Optional safe, compact evidence
```

`README.md` contains reusable lab materials. `report.md` records the actual execution performed in the current run. Both files are mandatory for every approved lab, including a blocked run. Add optional directories only when they contain useful durable material; do not create empty placeholders.

Derive `<theme>` and `<topic>` from the related local documentation when a stable hierarchy exists. For a standalone lab, choose semantic categories that describe the subject rather than a tool invocation or date. Choose a descriptive lab slug based on the claim or capability being exercised.

Use actual repository-relative paths in commands and links. Do not copy shortened display paths from another repository. Lab Markdown files do not use YAML frontmatter.

## Collision handling

Before proposing the path, inspect the destination, nearby labs, `labs/README.md`, related docs, and repository instructions.

If the destination already contains material, use `ask_user` to explain the collision and offer safe choices such as:

1. Extend the existing lab and append a new report only when its report model supports multiple runs.
2. Use a new descriptive lab slug.
3. Stop.

Do not overwrite, restructure, or blend existing user-authored materials without explicit approval. Reflect the selected collision strategy in the complete lab plan before requesting execution approval.

## Lab materials

`README.md` must let another learner understand and reproduce the lab without relying on the execution report. Use one H1 and include these sections when applicable:

### Goal

State the practical capability the learner will exercise, the bounded outcome, and why the lab is meaningful.

### Related learning

Link to every local learning page the lab exercises with repository-relative links. When no related local docs exist, link validated authoritative external foundations and clearly label the lab as standalone.

### Expected behavior

State the hypothesis, claim, or comparison being tested. Distinguish expected behavior from known facts so the run can contradict the expectation honestly.

### Prerequisites

List required knowledge, tools, versions, hardware, access, credentials, and resource limits. Never put secret values in the document.

### Environment

Define the target environment and the version, revision, image, model, workload, region, hardware, or source snapshot that must be pinned or captured.

### Safety boundary

Describe cost, destructive effects, privilege requirements, shared-resource impact, credential use, stress or capacity risk, and prohibited targets. Link cleanup to the exact resources created by the lab.

### Steps

Provide ordered, runnable instructions. Keep command-heavy walkthroughs in `<details>` blocks when that improves readability. Prefer scripts for multi-step automation, repeated matrix cells, semantic assertions, or setup and teardown that need to be rerun reliably.

### Success criteria

Define observable evidence, measured units, denominators, assertions, and acceptable failure states. An exit code or HTTP status alone is insufficient when the claimed behavior requires semantic validation.

### Evidence to collect

List the outputs, logs, measurements, hashes, screenshots, transcripts, or machine-readable rows needed to support the result. Mark which evidence is committed, summarized, sanitized, or intentionally excluded.

### Cleanup

Give targeted teardown and post-cleanup checks. Avoid broad deletion and defaults that could target unrelated resources.

### Navigation

Link `report.md`, related local docs, the relevant lab index when one exists, and useful adjacent labs.

## Execution report

`report.md` is a factual record of one run. It must not read as though every planned step succeeded. Use one H1 and include:

1. **Snapshot:** execution date and time zone, relevant versions, revisions, images, models, hardware, operating system, region, and target identifiers after sanitization.
2. **Result:** a concise `passed`, `failed`, `partial`, or `blocked` outcome and what the run established.
3. **Environment:** actual values used, including deviations from the plan.
4. **Method:** variables, controls, matrix, sample size, warm-up, success semantics, and safety boundaries.
5. **Command log:** every executed command or equivalent tool action in order, with its exact input, exit status or tool result, and captured output.
6. **Observed results:** measurements, outputs, artifacts, and semantic assertions, separate from expectations.
7. **Expected versus observed:** which expectations held, failed, or remain unresolved.
8. **Blockers and mitigations:** exact failures, diagnosis, attempted workarounds, outcomes, residual blocker, and the next prerequisite.
9. **Surprises and theory impact:** evidence that refines, contradicts, or limits the related learning material.
10. **Cleanup status:** commands attempted, evidence of cleanup, and any intentionally retained resource with owner and reason.
11. **Reproduction:** the shortest safe sequence that reproduces the run and where results may vary.
12. **Evidence inventory:** links to committed artifacts, their format, derivation, sanitization, and any trimming.
13. **Limitations:** what the evidence does not establish.
14. **Sources and navigation:** authoritative sources, `README.md`, local learning docs when present, and the relevant lab index.

Use this format for each shell command:

````markdown
### <Step number>. <Purpose>

**Command**

```bash
<Exact command as executed>
```

**Exit status:** `<integer>`

**Output**

```text
<Captured stdout and stderr in order, or separately labeled streams when interleaving was not preserved>
```

**Observation:** <What this evidence establishes>
````

For non-shell tools, record the tool or action name, exact meaningful input, success or failure result, returned evidence, and observation. Do not invent a shell command that was not run.

Preserve safe output verbatim when practical. If output is large, repetitive, binary, or unsuitable for Markdown, save a sanitized durable artifact and quote the decisive excerpt beside the command. State exactly what was trimmed, filtered, summarized, or transformed and link the full committed artifact. Never write `output omitted` without a reason and an evidence location or reproducibility boundary.

An exact command preserves the executed syntax, argument order, options, working directory, and non-sensitive values. Replace secret or sensitive values with stable descriptive placeholders and disclose that sanitization rather than reproducing those values.

## Evidence artifacts

Prefer compact, reviewable formats:

- JSONL for raw result rows and event streams.
- JSON for structured run summaries and assertions.
- CSV or Markdown tables for derived comparisons.
- Plain-text transcripts for readable interaction history.
- Hashes and metadata for heavyweight, generated, or externally stored outputs.
- Images only when visual output is itself the evidence and repository policy permits them.

Keep raw and derived evidence distinguishable. Record the command or script used to derive summaries, and ensure report numbers agree with committed artifacts. Do not commit credentials, tokens, private keys, sensitive identifiers, personal absolute paths, heavyweight generated assets, unredacted environment dumps, or unsafe local state.

## Indexes and cross-links

When `labs/README.md` exists, preserve its style and add the lab without duplicate links. Include a concise statement of what ran and what it showed when the index uses those fields.

When related local docs exist:

- Link the lab materials and report to the relevant docs with relative links.
- Add a reciprocal relative link from the most relevant docs index or hands-on section to the lab.
- If results contradict or materially limit the docs, update the claim within the approved scope or create and link a follow-up item when repository policy requires separate work.

When no related local docs exist, keep the lab standalone and cite validated authoritative external foundations. Do not create a token docs page merely to satisfy reciprocal linking.

Ensure `README.md` and `report.md` link to each other. No generated Markdown page or committed evidence artifact should be orphaned.

## GitHub-native Markdown

- Use one H1 and sentence-case headings.
- Keep each logical prose paragraph on one source line; do not hard-wrap prose.
- Use relative links for repository content.
- Use GitHub Alerts for semantic callouts and plain blockquotes only for quotations.
- Use fenced `mermaid` diagrams only when they clarify the setup, lifecycle, or result.
- Use `<details>` for long command walkthroughs or secondary evidence, not to hide required approval information or decisive results.
- Use descriptive links or GFM footnotes for web sources and validate every cited source.

## Completion checklist

- The approved goal, claim, scope, steps, safety boundary, cleanup, and files are represented.
- `README.md` contains reusable lab materials and `report.md` contains the actual run record.
- Every executed command or tool action has exact input, status, output or linked evidence, and an observation.
- Expected and observed behavior are separate.
- Failures, blockers, attempted mitigations, residual prerequisites, and partial results are preserved honestly.
- Relevant versions, source snapshots, environment, and execution date are recorded.
- Secrets and sensitive or heavyweight state are excluded or sanitized before persistence.
- Cleanup is scoped, attempted when safe, and reported.
- Reported measurements agree with committed raw or derived evidence.
- `README.md`, `report.md`, evidence, the lab index, and related local docs are linked as required.
- External sources are validated when the lab is standalone.
- All relative links resolve, GitHub-native Markdown is valid, and existing content is preserved.
