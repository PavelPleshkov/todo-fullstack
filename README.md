## Todo Fullstack (Turborepo)

Fullstack monorepo: **Next.js frontend** + **NestJS GraphQL backend** + **PostgreSQL**, managed with **Yarn workspaces** and **Turborepo**.

**Architecture and navigation:** [docs/CODEBASE_MAP.md](docs/CODEBASE_MAP.md) (entry points, GraphQL layout, DB, quality gates).

### Apps

- **`apps/frontend`** (workspace: `frontend`) — Next.js UI + Apollo Client
  - URL: `http://localhost:3000`
- **`apps/backend`** (workspace: `backend`) — NestJS + Apollo GraphQL + PostgreSQL
  - GraphQL endpoint: `http://localhost:3001/graphql` (same host/port as HTTP; path `/graphql`)
- **`apps/docs`** (workspace: `docs`) — optional Next.js documentation site
  - URL when running locally: `http://localhost:3002`
  - **Not** started by root `yarn dev`. Run separately from `apps/docs`: `yarn dev:docs` (see [CODEBASE_MAP.md](docs/CODEBASE_MAP.md) — Runtime).

Shared libraries live under **`packages/*`** (for example `@repo/ui`).

---

## Requirements

- Node.js **>= 18**
- Yarn **1.x** (repo uses `yarn@1.22.22`)
- PostgreSQL (local) — copy `apps/backend/.env.example` to `apps/backend/.env`, then follow **[docs/local-database.md](docs/local-database.md)** (create user/database, apply `apps/backend/db/schema.sql`). Connection variables: `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`.

---

## Install

From the repo root:

```bash
yarn install
```

---

## Development

### Main app (frontend + backend)

From the repo root:

```bash
yarn dev
```

This runs Turborepo `dev` for workspaces that define a `dev` script (currently **frontend** and **backend**).

- **GraphQL URL (frontend):** defaults to `http://localhost:3001/graphql`. Override with **`NEXT_PUBLIC_GRAPHQL_URL`** (see `apps/frontend/app/ApolloWrapper.tsx`).
- **HTTP listen port (backend):** defaults to **3001**; override with **`PORT`** in the backend environment (see `apps/backend/src/main.ts`). If you change the port, update **`NEXT_PUBLIC_GRAPHQL_URL`** on the frontend accordingly.

### Docs site (optional, separate)

The docs workspace is intentionally **not** part of root `yarn dev`. From the repo root:

```bash
cd apps/docs && yarn dev:docs
```

Next.js listens on port **3002** (`http://localhost:3002`).

---

## Other useful commands (repo root)

```bash
yarn lint          # ESLint across workspaces (where a lint script exists)
yarn check-types   # TypeScript checks via Turborepo (workspaces that define check-types)
yarn build         # Production builds
yarn format        # Prettier --write (formats files in place): **/*.{ts,tsx,md}
```

---

## Further reading

- [docs/CODEBASE_MAP.md](docs/CODEBASE_MAP.md) — canonical repository map (layout, runtime, API, quality gates, conventions).
- After **GraphQL schema** changes on the backend, regenerate the frontend client types from `apps/frontend`: `yarn codegen` (see `apps/frontend/codegen.yml`).
- Per-app READMEs: `apps/frontend/README.md`, `apps/docs/README.md`, `apps/backend/README.md` (the backend README is largely upstream Nest boilerplate). **Database:** [docs/local-database.md](docs/local-database.md), template `apps/backend/.env.example`, SQL `apps/backend/db/schema.sql`, queries in `apps/backend/src/tasks.service.ts`.
