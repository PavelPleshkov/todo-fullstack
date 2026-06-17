# CODEBASE_MAP

## Overview

**todo-fullstack** is a Yarn workspaces + Turborepo monorepo: a **Next.js** frontend with **Apollo Client** talks to a **NestJS** backend that exposes **GraphQL (Apollo Server)** and persists tasks in **PostgreSQL** via the `pg` driver. An optional **Next.js** docs app and shared **`packages/*`** complete the layout.

The main UI uses **Next.js App Router** with tab-based routes for **Form**, **Stopwatch**, and **Tasks** under a shared client shell (header, theme, navigation).

## Layout

### Apps (`apps/`)

| Path            | Workspace name | Role                        | Tech notes                                                                                                 |
| --------------- | -------------- | --------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `apps/frontend` | `frontend`     | Main UI                     | Next.js App Router, MUI, Apollo Client, GraphQL Codegen, tab routes `/form`, `/stopwatch`, `/tasks`        |
| `apps/backend`  | `backend`      | API                         | NestJS, `@nestjs/graphql` + Apollo, `pg`                                                                   |
| `apps/docs`     | `docs`         | Optional documentation site | Next.js, uses `@repo/ui`; run separately with `yarn dev:docs` in `apps/docs` (not part of root `yarn dev`) |

### Packages (`packages/`)

| Path                         | NPM name             | Role                                               |
| ---------------------------- | -------------------- | -------------------------------------------------- |
| `packages/ui`                | `@repo/ui`           | Shared React UI (`exports`: `./*` → `./src/*.tsx`) |
| `packages/eslint-config`     | (see `package.json`) | Shared ESLint config                               |
| `packages/typescript-config` | (see `package.json`) | Shared TS configs                                  |

### Other

| Path                   | Role                                                         |
| ---------------------- | ------------------------------------------------------------ |
| `docs/CODEBASE_MAP.md` | This file — canonical high-level architecture map            |
| `turbo.json`           | Turborepo task graph (`dev`, `build`, `lint`, `check-types`) |

## Frontend (`apps/frontend`)

### App Router structure

Route group `(main)` organizes the shell and tab pages; the folder name does **not** appear in URLs.

```
apps/frontend/app/
├── layout.tsx                 # Root layout (Server): fonts, metadata, ApolloWrapper
├── globals.css                # Global + theme/header/tab/content styles
├── ThemeContext.tsx           # React context for light/dark theme
├── ApolloWrapper.tsx          # Client ApolloProvider + HttpLink
│
├── (main)/                    # Route group — URLs stay /form, /tasks, etc.
│   ├── layout.tsx             # Client shell: ThemeContext, Header, TabNav, content area
│   ├── layout.test.tsx        # Tests for main shell (theme toggle, containers)
│   ├── page.tsx               # GET / → redirect to /tasks
│   ├── form/page.tsx          # GET /form → <Form />
│   ├── stopwatch/page.tsx     # GET /stopwatch → <Stopwatch />
│   └── tasks/page.tsx         # GET /tasks → <Tasks />
│
├── components/
│   ├── Header.tsx             # App title + theme toggle
│   ├── TabNav.tsx             # MUI Tabs + next/link; active tab via usePathname()
│   ├── TabNav.test.tsx
│   ├── Form/Form.tsx          # Formik + yup demo form ("use client")
│   ├── Stopwatch/Stopwatch.tsx
│   └── Tasks/Tasks.tsx        # Apollo queries/mutations for tasks
│
└── lib/graphql/
    ├── operations.ts          # GraphQL documents for codegen
    └── generated/             # Codegen output (do not hand-edit)
```

### Routes

| URL            | File                              | Renders    | Notes                                      |
| -------------- | --------------------------------- | ---------- | ------------------------------------------ |
| `/`            | `app/(main)/page.tsx`             | redirect   | `redirect("/tasks")` — default tab         |
| `/form`        | `app/(main)/form/page.tsx`        | `Form`     | Server page; `metadata.title`: "Form"      |
| `/stopwatch`   | `app/(main)/stopwatch/page.tsx`   | `Stopwatch`| Server page; `metadata.title`: "Stopwatch" |
| `/tasks`       | `app/(main)/tasks/page.tsx`       | `Tasks`    | Server page; GraphQL via Apollo            |

### Layout hierarchy

```
RootLayout (app/layout.tsx, Server)
  └── ApolloWrapper
        └── MainLayout (app/(main)/layout.tsx, Client)
              ├── Header
              ├── TabNav
              └── {children}  ← active route page (Form / Stopwatch / Tasks)
```

- **Root layout** stays a Server Component: `metadata`, Google fonts, `ApolloWrapper`.
- **Main layout** is a Client Component (`"use client"`): `useState` for theme, `ThemeContext`, shared chrome.
- **Route pages** are thin Server Components that export `metadata` and render one feature component.

### Navigation

- `TabNav.tsx` uses `next/link` with MUI `Tab` (`component={Link}`) and `usePathname()` for the active tab.
- Browser back/forward and shareable URLs work per tab.
- Switching tabs **unmounts** the previous page component (Stopwatch timer and Form fields reset; Apollo task cache persists).

### Removed / superseded (App Router migration)

| Former path                     | Replaced by                                      |
| ------------------------------- | ------------------------------------------------ |
| `app/page.tsx` (single home)    | `app/(main)/layout.tsx` + `app/(main)/page.tsx`  |
| `app/components/Content.tsx`    | Per-route pages + `{children}` in main layout    |
| `app/page.test.tsx`             | `app/(main)/layout.test.tsx`                     |
| `app/components/Content.test.tsx` | `app/components/TabNav.test.tsx`               |

### Frontend tests

- Jest mocks `next/navigation` in `apps/frontend/jest.setup.ts` (`usePathname`, `useRouter`, `redirect`).
- Shell tests: `app/(main)/layout.test.tsx`.
- Tab tests: `app/components/TabNav.test.tsx`.
- Feature tests remain next to components (`Form.test.tsx`, `Tasks.test.tsx`, etc.).

## Runtime

### From repository root

- **Install:** `yarn install` (see root [README.md](../README.md)).
- **Dev (frontend + backend only):** `yarn dev` → `turbo run dev` (persistent, not cached). This starts workspaces that define a `dev` script (currently `apps/frontend` and `apps/backend`). The docs app is **not** included by design.
- **Dev (docs app only):** from `apps/docs`, run `yarn dev:docs` (Next.js on port **3002**). Keep this separate so documentation does not start with the main stack.

### URLs and ports (from root README and code)

| Service      | URL / port                       | Source                                                                                        |
| ------------ | -------------------------------- | --------------------------------------------------------------------------------------------- |
| Frontend     | `http://localhost:3000`          | Root README; `apps/frontend` script `next dev -p 3000`                                        |
| Frontend tabs| `/form`, `/stopwatch`, `/tasks`  | `app/(main)/*/page.tsx`; `/` redirects to `/tasks`                                            |
| Backend HTTP | `http://localhost:3001` (listen) | `apps/backend/src/main.ts` — `process.env.PORT ?? 3001`                                       |
| GraphQL HTTP | `http://localhost:3001/graphql`  | Root README; Apollo `HttpLink` default in `apps/frontend/app/ApolloWrapper.tsx`               |
| Docs app     | `http://localhost:3002`          | Not started by root `yarn dev`; run `yarn dev:docs` from `apps/docs` (`next dev --port 3002`) |

### CORS

- Backend enables CORS for origin **`http://localhost:3000`** with credentials (`apps/backend/src/main.ts`).

### Environment

- **Frontend:** `NEXT_PUBLIC_GRAPHQL_URL` overrides GraphQL endpoint (see `ApolloWrapper.tsx`); default `http://localhost:3001/graphql`.

## Data / API

### GraphQL schema (server)

- **Generated SDL file (do not hand-edit):** `apps/backend/src/schema.gql` (header states auto-generated).
- **Nest wiring:** `apps/backend/src/app.module.ts` — `GraphQLModule.forRoot` with `autoSchemaFile` → `src/schema.gql`, `sortSchema: true`, `ApolloDriver`.

### Resolvers and domain module

- **Tasks module:** `apps/backend/src/tasks.module.ts` — registers `TasksService`, `TasksResolver`.
- **Queries / mutations:** `apps/backend/src/tasks.resolver.ts` — `activeTasks`, `binTasks`, `createTask`, `updateTask`, `moveTaskToBin`, `permanentlyDeleteTask`, `moveCompletedToBin`, `markAllActiveTasks`, `unmarkAllActiveTasks`.
- **GraphQL object types / inputs (code-first):** `apps/backend/src/graphql/task.types.ts`.

### Database

- **Client:** `pg` `Client` in `apps/backend/src/tasks.service.ts`.
- **Configuration:** `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` in `apps/backend/.env` (template: `apps/backend/.env.example`), loaded via `@nestjs/config` (`ConfigModule` in `app.module.ts`, `ConfigService` in `TasksService`). Defaults match the former hardcoded values if variables are omitted.
- **Setup:** [docs/local-database.md](local-database.md); schema: `apps/backend/db/schema.sql`.
- **Table:** `tasks` — columns align with `schema.sql` and SQL in `tasks.service.ts`.

### Frontend GraphQL client

- **Apollo provider:** `apps/frontend/app/ApolloWrapper.tsx` (client-side `ApolloProvider` + `HttpLink`).
- **Root layout:** `apps/frontend/app/layout.tsx` wraps all routes with `ApolloWrapper`.
- **Primary consumer:** `apps/frontend/app/components/Tasks/Tasks.tsx` on route `/tasks`.
- **Operations:** `apps/frontend/app/lib/graphql/operations.ts` (documents for codegen).
- **Codegen output:** `apps/frontend/app/lib/graphql/generated/` (preset: client); config `apps/frontend/codegen.yml` points **schema** to `../backend/src/schema.gql`.
- **Regenerate types:** from `apps/frontend`: `yarn codegen` (see `apps/frontend/package.json`).

### Legacy / unused in default GraphQL path

- `apps/backend/src/app.controller.ts`, `app.service.ts` — REST-era starter; **default `AppModule` imports GraphQL + `TasksModule` only** (see `app.module.ts`). Treat as non-primary unless re-enabled.

## Quality gates

### Root scripts (`package.json`)

| Command            | Purpose                                                     |
| ------------------ | ----------------------------------------------------------- |
| `yarn dev`         | All workspaces `dev` via Turbo                              |
| `yarn build`       | `turbo run build`                                           |
| `yarn lint`        | `turbo run lint`                                            |
| `yarn check-types` | `turbo run check-types` (workspaces that define the script) |
| `yarn format`      | Prettier on `**/*.{ts,tsx,md}`                              |

### Per-workspace (high level)

- **Backend:** `yarn lint`, `yarn test`, `yarn test:e2e` (in `apps/backend/package.json`). No `check-types` script in that file — typecheck may be implicit via `nest build` / IDE.
- **Frontend:** `yarn lint`, `yarn test`; **codegen** `yarn codegen`. No `check-types` entry in `apps/frontend/package.json` at time of mapping.
- **Docs:** `yarn lint`, `yarn check-types` (`next typegen && tsc --noEmit`).
- **UI package:** `yarn lint`, `yarn check-types`.

### CI

- **Unknown** — no `.github/workflows` survey in this mapping pass; add a row here if CI is added.

## Conventions

- **Package manager:** Yarn **1.x**, `packageManager: yarn@1.22.22` (root `package.json`).
- **Node:** `>= 18` (root `engines`).
- **Monorepo:** `workspaces.packages`: `apps/*`, `packages/*`; `nohoist` for Nest/Apollo under backend (see root `package.json`).
- **Frontend imports:** path alias `@/*` → `apps/frontend/*` (`apps/frontend/tsconfig.json`). Example: `@/app/components/Tasks/Tasks`.
- **App Router:** add new top-level tabs as `app/(main)/<name>/page.tsx` and register the route in `TabNav.tsx` `TABS` array.
- **Schema changes:** prefer code-first Nest decorators → regen `schema.gql` → run frontend `yarn codegen` so `generated/` stays in sync.
- **Cartograph skill location:** `.cursor/skills/Cartograph/` — prefer filename **`SKILL.md`** for Cursor agent skills compatibility (rename from `Skill.md` if needed).
