---
name: cartograph
description: >-
  Maps the repository into docs/CODEBASE_MAP.md: structure, apps, packages,
  entry points, data flow, and dev commands. Use when the user asks for a
  codebase map, cartographer, /cartographer, or repository architecture overview.
---

# Cartograph (repository map)

## Goal

Produce or update a single Markdown file at **docs/CODEBASE_MAP.md** that helps humans and AI navigate this monorepo efficiently.

## Source of truth

- **docs/CODEBASE_MAP.md** is the canonical architecture map unless the team agrees otherwise.
- Prefer updating the existing file over creating parallel maps in chat.

## Steps

1. Read root **README.md**, **package.json**, **turbo.json**, and each **apps/\*/README.md** (and **packages/** manifests if present).
2. List **apps** and **packages**: name, role, main tech, dev URL or port if documented.
3. Identify **entry points**: e.g. Next.js app router roots, Nest `main.ts`, GraphQL module/resolvers location, DB/migrations if any.
4. Describe **key relationships**: frontend → GraphQL endpoint; backend → PostgreSQL; shared UI/types packages.
5. Document **commands** from root: `yarn dev`, `yarn lint`, `yarn check-types`, `yarn build` (and app-specific scripts if critical).
6. Write **docs/CODEBASE_MAP.md** using the template below (fill with real paths from this repo).

## Output template (docs/CODEBASE_MAP.md)

Use these top-level sections:

1. **Overview** — one paragraph what the repo is.
2. **Layout** — tree or bullet list: `apps/*`, `packages/*`.
3. **Runtime** — how to run locally, ports, GraphQL URL.
4. **Data / API** — where schema, resolvers, client queries live (paths).
5. **Quality gates** — lint, types, tests, CI if any.
6. **Conventions** — import aliases, env files, anything agents must not break.

## Constraints

- Do not invent ports or URLs: take them only from README or config in the repo.
- If something is unknown, write **Unknown** and the file path to inspect next.
