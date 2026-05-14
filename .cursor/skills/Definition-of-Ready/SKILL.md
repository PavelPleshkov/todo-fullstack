---
name: definition-of-ready
description: >-
  Runs a Definition of Ready (DoR) pass on a task and produces an agent-ready
  specification: objective, scope, constraints, files, acceptance criteria, and
  links. Use when the user asks for DoR, /dor, task refinement before agent work,
  or an agent-ready task brief.
---

# Definition of Ready (DoR) — agent-ready task spec

## Goal

Turn a vague or partial task into **one clear specification** the agent (or human) can execute without guessing. Output is suitable as a **single prompt** for planning and implementation steps.

## When to use

- Before handing work to **Agent** or starting a large change.
- When the user invokes **DoR**, **`/dor`**, or asks to **refine the task for the agent**.
- When client or course rules require explicit **tool/integration/access** constraints.

## Process

1. Read any task text, issue links, or context the user provided.
2. Ask **only** missing clarifiers if something blocks writing acceptance criteria (keep questions minimal).
3. Answer the **DoR questions** below on behalf of the spec — if the user already answered, incorporate verbatim; otherwise infer from context and mark **Assumption:** where needed.
4. Emit the **Output template** in full. No parallel specs in chat; one document.

## DoR questions (answer in the output)

Answer each in the final spec (use **Unknown** + what to confirm if truly unknown).

1. **Objective** — What single outcome is required?
2. **Scope** — What is explicitly in scope?
3. **Non-scope** — What must not be changed or touched?
4. **Constraints** — Tech, time, style, compatibility, **client/course restrictions** on tools, MCP, models, integrations, or data access?
5. **Relevant files / areas** — Paths, modules, or layers (frontend, backend, docs, `.cursor`, etc.)?
6. **Acceptance criteria** — How do we know it is done (commands to run, manual checks, screenshots)?
7. **Links** — GitHub/Jira issue, doc section, prior PR, design link?
8. **Risks / open questions** — What could break; what still needs human decision?

## Output template (copy as the agent-ready brief)

Produce a single markdown document with exactly these top-level sections, in order:

1. `# Task specification (DoR)`
2. `## Objective`
3. `## Scope`
4. `## Non-scope`
5. `## Constraints` — include a sub-list for tools / MCP / models / integrations (client or course rules) and a line for other constraints.
6. `## Relevant files or areas`
7. `## Acceptance criteria`
8. `## Links (issues, docs, context)`
9. `## Risks and open questions`

Fill every section with concrete content; use **Unknown** and one line on what to confirm only where unavoidable.

## Constraints on this skill

- Do not invent **secrets**, **URLs**, or **issue numbers**; use placeholders or user-supplied values only.
- Prefer updating the user’s task doc over duplicating long specs in chat if they maintain one file.
- If the repository has **docs/CODEBASE_MAP.md**, remind the agent to stay consistent with it unless the task is to change the map.
