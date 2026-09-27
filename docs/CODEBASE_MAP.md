# CODEBASE_MAP

## Overview

**todo-fullstack** is a Yarn workspaces + Turborepo monorepo: a **Next.js** frontend with **Apollo Client** talks to a **NestJS** backend that exposes **GraphQL (Apollo Server)** and persists **users** and **tasks** in **PostgreSQL** via the `pg` driver.

The UI uses the **Next.js App Router**. A shared client shell (header, theme, tabs) wraps **login**, **profile**, **tasks**, and (for staff) **users**. Session is a JWT in `localStorage`; authorization helpers live in the shared workspace package **`@repo/permissions`**. An optional **Next.js** docs app and other **`packages/*`** complete the layout.

## Layout

### Apps (`apps/`)

| Path            | Workspace name | Role                        | Tech notes                                                                                                          |
| --------------- | -------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `apps/frontend` | `frontend`     | Main UI                     | Next.js App Router, MUI, Apollo Client 4, GraphQL Codegen, JWT in `localStorage`, imports `@repo/permissions`       |
| `apps/backend`  | `backend`      | API                         | NestJS, `@nestjs/graphql` + Apollo, `pg`, JWT (`@nestjs/jwt`), imports `@repo/permissions`                          |
| `apps/docs`     | `docs`         | Optional local docs site    | Next.js on port **3002**; run separately with `yarn dev:docs` in `apps/docs` (not part of root `yarn dev`)          |

`apps/docs` still lists `@repo/ui` as a dependency but does **not** import it. Frontend and backend do **not** use `@repo/ui`.

### Packages (`packages/`)

| Path                         | NPM name               | Role                                                                                          |
| ---------------------------- | ---------------------- | --------------------------------------------------------------------------------------------- |
| `packages/permissions`       | `@repo/permissions`    | Shared authz helpers (`canAccessUsers`, `canSoftDeleteUser`, `canModifyTask`, …). No Nest/React. |
| `packages/ui`                | `@repo/ui`             | Turborepo starter React UI; unused by the main frontend/backend                               |
| `packages/eslint-config`     | `@repo/eslint-config`  | Shared ESLint config (used by docs / `packages/ui`)                                           |
| `packages/typescript-config` | `@repo/typescript-config` | Shared TS configs (used by docs / `packages/ui`)                                           |

### Other

| Path                   | Role                                                         |
| ---------------------- | ------------------------------------------------------------ |
| `docs/CODEBASE_MAP.md` | This file — canonical high-level architecture map            |
| `docs/local-database.md` | Local PostgreSQL setup                                     |
| `turbo.json`           | Turborepo task graph (`dev`, `build`, `lint`, `check-types`) |

## Frontend (`apps/frontend`)

### App Router structure

Route group `(main)` organizes the shell; the folder name does **not** appear in URLs.

```
apps/frontend/app/
├── layout.tsx                 # Root layout (Server): fonts, metadata, ApolloWrapper
├── globals.css
├── styles/                    # SCSS (buttons, etc.)
├── ThemeContext.tsx
├── AuthContext.tsx            # session from auth-storage (useSyncExternalStore)
├── ApolloWrapper.tsx          # Apollo + Bearer token + AuthProvider + deleted-account ErrorLink
│
├── (main)/
│   ├── layout.tsx             # Client shell: theme, Header + TabNav via next/dynamic { ssr: false }
│   ├── layout.test.tsx
│   ├── page.tsx               # GET / → redirect("/profile")
│   ├── login/page.tsx
│   ├── profile/page.tsx
│   ├── tasks/page.tsx
│   ├── users/page.tsx         # Users table (admin and manager)
│   ├── form/page.tsx          # demo Formik page (not in default tabs)
│   └── stopwatch/page.tsx     # demo (not in default tabs)
│
├── components/
│   ├── Header.tsx             # title, login/logout, theme
│   ├── TabNav.tsx             # tabs from role + canAccessUsers
│   ├── Btn.tsx
│   ├── Auth/LoginForm.tsx     # login + register
│   ├── Profile/Profile.tsx
│   ├── Users/Users.tsx
│   ├── Tasks/                 # Tasks (scope select), Task, AddTask, Search
│   ├── Form/
│   └── Stopwatch/
│
└── lib/
    ├── auth-storage.ts        # localStorage token + user snapshot
    └── graphql/
        ├── operations.ts      # GraphQL documents for codegen
        └── generated/         # do not hand-edit
```

### Routes

| URL         | File                         | Renders     | Notes                                      |
| ----------- | ---------------------------- | ----------- | ------------------------------------------ |
| `/`         | `app/(main)/page.tsx`        | redirect    | `redirect("/profile")`                     |
| `/login`    | `app/(main)/login/page.tsx`  | `LoginForm` | public login / register                    |
| `/profile`  | `app/(main)/profile/page.tsx`| `Profile`   | session user fields                        |
| `/tasks`    | `app/(main)/tasks/page.tsx`  | `Tasks`     | JWT required for queries (`skip` if guest) |
| `/users`    | `app/(main)/users/page.tsx`  | `Users`     | UI gated by `canAccessUsers`               |
| `/form`     | `app/(main)/form/page.tsx`   | `Form`      | demo; not in current tab sets              |
| `/stopwatch`| `app/(main)/stopwatch/page.tsx` | `Stopwatch` | demo; not in current tab sets           |

### Layout hierarchy

```
RootLayout (app/layout.tsx, Server)
  └── ApolloWrapper
        └── AuthProvider
              └── MainLayout (app/(main)/layout.tsx, Client)
                    ├── Header      (dynamic, ssr: false)
                    ├── TabNav      (dynamic, ssr: false)
                    └── {children}
```

- **Root layout** is a Server Component: `metadata`, fonts, `ApolloWrapper`.
- **Main layout** is a Client Component. Header and TabNav skip SSR so the first paint does not mismatch guest HTML vs `localStorage` session (hydration).
- **Route pages** are thin Server Components that export `metadata` and render one feature component.

### Navigation

- `TabNav.tsx`: guest → Log in; `role=user` → Profile, Tasks, Log in; `canAccessUsers` (admin or manager) → plus Users.
- `next/link` + MUI `Tab`; active tab from `usePathname()`.
- Switching tabs unmounts the previous page (Stopwatch/Form reset; Apollo cache persists).

### Tasks UI

- State `taskScope` in `Tasks.tsx` maps to GraphQL `ownerId` / `ownerRole` (`toTaskQueryVars`). Staff load `USERS_QUERY` for select options.
- `activeTasks` / `binTasks` use `fetchPolicy: "cache-and-network"` so changing the select refetches (Apollo otherwise keeps a stale list per variable set).
- Card mutations refetch those queries with the **same** variables. Scope args belong on the list refetch, not on `updateTask` / `moveTaskToBin` / etc.

### Auth on the client

- Token and user JSON: `app/lib/auth-storage.ts` (`accessToken`, `authUser`).
- `AuthContext` exposes `user`, `token`, `isAuthenticated`, `setSession`, `logout`. First client paint stays guest until the client snapshot is allowed (hydration-safe).
- `ApolloWrapper` `SetContextLink` sets `Authorization: Bearer <token>`. `ErrorLink` skips Login/Register; on `"This account has been deleted"` it clears storage and sends the browser to `/login`.
- UI hide/show uses `@repo/permissions` (tabs, Users buttons, permanent delete). The **server** still enforces every mutation.

### Frontend tests

- Jest mocks `next/navigation` in `apps/frontend/jest.setup.ts`.
- Shell: `app/(main)/layout.test.tsx`. Tabs: `app/components/TabNav.test.tsx` (may still describe older tab sets — update when touching TabNav tests).
- Feature tests next to components (`Tasks.test.tsx`, `Header.test.tsx`, etc.).

## Backend (`apps/backend`)

### Entry and modules

- **HTTP:** `src/main.ts` — listen `PORT ?? 3001`, CORS `http://localhost:3000` with credentials.
- **Root module:** `src/app.module.ts` — `ConfigModule` (`.env`), GraphQL code-first → `src/schema.gql`, `TasksModule`, `AuthModule`.
- **Auth:** `src/auth/` — `auth.module.ts` (JWT secret `JWT_SECRET`, expiry **7d**), `auth.service.ts`, `auth.resolver.ts` (`login`, `register`), `users.resolver.ts` (`users`, `deleteUser`, `restoreUser`), `jwt-auth.guard.ts`, `roles.guard.ts`, `@Roles`, `@CurrentUser`.
- **Tasks:** `src/tasks/tasks.module.ts`, `tasks.resolver.ts`, `tasks.service.ts`.
- **GraphQL types:** `src/graphql/auth.types.ts`, `src/graphql/task.types.ts`.
- **Generated SDL (do not hand-edit):** `src/schema.gql`.

### Auth and authorization

- Public: `login`, `register` (new accounts get `role=user`). bcrypt passwords.
- JWT payload: `sub`, `email`, `role`. Guard rejects deleted users (`users.deleted_at`) immediately.
- Coarse route gate: `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('admin', 'manager')` on Users queries/mutations and `permanentlyDeleteTask`.
- Object rules: `@repo/permissions` in `auth.service.ts` (`canSeeUser`, `canSoftDeleteUser`, `canRestoreUser`) and `tasks.service.ts` (`canModifyTask`, `canHardDeleteTask`, plus `resolveScope` for lists). Failed task access is returned as **404** (do not leak that the id exists).
- Soft-delete user: set `deleted_at`. Tasks stay; API exposes `ownerDeleted` so the UI can show `email (deleted)`.

### Tasks API

Queries/mutations in `tasks.resolver.ts`: `activeTasks`, `binTasks`, `createTask`, `updateTask`, `moveTaskToBin`, `moveTaskToActive`, `permanentlyDeleteTask`, `moveCompletedToBin`, `markAllActiveTasks`, `unmarkAllActiveTasks`.

List and bulk operations take optional **`ownerId`** and **`ownerRole`**. `TasksService.resolveScope` turns them into one of: `self`, `visible`, `role` (`user` | `manager`), or `user` (one id). Regular `user` is always `self`. Manager `visible` is own tasks plus `role=user`; manager may not request another manager/admin or `ownerRole=manager`. Admin `visible` is the whole table.

`createTask` input may include `ownerId`. If omitted or self, the task is created for the viewer; if another id, the same scope rules apply (manager → only `role=user`).

On `/tasks`, admin and manager get a **scope select** (My / All / All managers or All users / each person). The same args go to list queries, Mark all / Unmark / Delete completed, and refetch after card mutations. `New task for` shows who Add will create for (`you` vs that person's email). Regular users have no select.

`permanentlyDeleteTask`: admin any bin task; manager only if the owner is `role=user`. Task GraphQL type includes `ownerRole` (from `JOIN users`).

## Shared permissions (`packages/permissions`)

- **Import:** `import { … } from "@repo/permissions"`.
- **Source:** `packages/permissions/src/permissions.ts` (JSDoc on types and functions).
- **Package export:** `packages/permissions/package.json` → `./src/permissions.ts`.
- **Frontend build:** `transpilePackages: ["@repo/permissions"]` in `apps/frontend/next.config.ts`.
- **Both apps** declare `"@repo/permissions": "*"` in `package.json`. After clone: `yarn` at repo root (symlink in `node_modules/@repo/permissions`).

| Function                   | Meaning                                      | Wired now                                              |
| -------------------------- | -------------------------------------------- | ------------------------------------------------------ |
| `canAccessUsers`           | Open Users tab / page / `users` query        | `TabNav`, `Users.tsx`, `users` resolver                |
| `canSeeUser`               | Show this account row                        | `auth.service` `findAllUsers`; manager sees self, users, managers |
| `canSoftDeleteUser`        | Del / `deleteUser`                           | `auth.service`, `Users.tsx`                            |
| `canRestoreUser`           | Restore / `restoreUser`                      | `auth.service`, `Users.tsx` (Restore also requires `canSoftDeleteUser` in the UI) |
| `canSeeTask`               | See this task                                | Used by `canModifyTask`; list SQL follows the same idea via `resolveScope` |
| `canModifyTask`            | Edit / bin / restore / mark                  | `tasks.service` `checkCanModifyTask`                   |
| `canHardDeleteTask`        | Permanent delete from bin                    | `Task.tsx` and `permanentlyDeleteFromBin`              |

Helpers are pure (`Actor`, `UserTarget`, `TaskTarget`). Do not import Nest, React, or `pg` here. DB `users.role` CHECK is `user` \| `admin` \| `manager`.

If Nest `nodenext` cannot resolve the package, add a `paths` alias in `apps/backend/tsconfig.json` to `../../packages/permissions/src/permissions.ts`.

## Runtime

### From repository root

- **Install:** `yarn install` (see root [README.md](../README.md)).
- **Dev (frontend + backend only):** `yarn dev` → `turbo run dev`. Docs is **not** included.
- **Dev (docs only):** from `apps/docs`, `yarn dev:docs` (Next.js on port **3002**).

### URLs and ports (from root README and code)

| Service       | URL / port                      | Source                                                                                          |
| ------------- | ------------------------------- | ----------------------------------------------------------------------------------------------- |
| Frontend      | `http://localhost:3000`         | Root README; `apps/frontend` script `next dev -p 3000`                                          |
| Frontend URLs | `/`, `/login`, `/profile`, `/tasks`, `/users` | `app/(main)/*/page.tsx`; `/` → `/profile`                                              |
| Backend HTTP  | `http://localhost:3001`         | `apps/backend/src/main.ts` — `process.env.PORT ?? 3001`                                         |
| GraphQL HTTP  | `http://localhost:3001/graphql` | Root README; `ApolloWrapper.tsx` default                                                        |
| Docs app      | `http://localhost:3002`         | `yarn dev:docs` from `apps/docs`                                                                |

### CORS

- Backend CORS origin **`http://localhost:3000`** with credentials (`apps/backend/src/main.ts`).

### Environment

- **Frontend:** `NEXT_PUBLIC_GRAPHQL_URL` (default `http://localhost:3001/graphql`).
- **Backend:** `JWT_SECRET`; Postgres `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`. Template: `apps/backend/.env.example`. Setup: [docs/local-database.md](local-database.md).

## Data / API

### GraphQL schema (server)

- **Generated SDL:** `apps/backend/src/schema.gql`.
- **Nest:** `GraphQLModule.forRoot` `autoSchemaFile` → `src/schema.gql`, `sortSchema: true`, `ApolloDriver`.

### Database

- **Clients:** `pg` `Client` in `auth.service.ts` and `tasks.service.ts`.
- **Schema:** `apps/backend/db/schema.sql`.
  - `users`: `id`, `email`, `password_hash`, `role` (`user` \| `admin` \| `manager`), `created_at`, `deleted_at`.
  - `tasks`: `id`, `text`, `isdone`, `deleted`, `date`, `user_id` → `users(id)` `ON DELETE CASCADE`.
- Tasks are selected with `JOIN users` for `ownerEmail`, `ownerDeleted`, and `ownerRole`.

### Frontend GraphQL client

- Provider: `apps/frontend/app/ApolloWrapper.tsx`.
- Operations: `apps/frontend/app/lib/graphql/operations.ts` (auth + users + tasks).
- Codegen: `apps/frontend/codegen.yml` schema `../backend/src/schema.gql`; output `app/lib/graphql/generated/`.
- Regenerate: from `apps/frontend`, `yarn codegen`.

### Legacy / unused in the default GraphQL path

- `apps/backend/src/app.controller.ts`, `app.service.ts` — REST-era starter; **`AppModule` imports GraphQL + `TasksModule` + `AuthModule` only**.

## Quality gates

### Root scripts (`package.json`)

| Command            | Purpose                                                     |
| ------------------ | ----------------------------------------------------------- |
| `yarn dev`         | Workspaces with a `dev` script via Turbo                    |
| `yarn build`       | `turbo run build`                                           |
| `yarn lint`        | `turbo run lint`                                            |
| `yarn check-types` | `turbo run check-types` (workspaces that define the script) |
| `yarn format`      | Prettier on `**/*.{ts,tsx,md}`                              |

### Per-workspace

- **Backend:** `yarn lint`, `yarn test`, `yarn test:e2e`. No `check-types` script — types via `nest build` / IDE.
- **Frontend:** `yarn lint`, `yarn test`; **codegen** `yarn codegen`. No `check-types` script.
- **Docs:** `yarn lint`, `yarn check-types`.
- **UI package:** `yarn lint`, `yarn check-types`.
- **Permissions:** no lint/test script; types come from the `.ts` source imported by both apps.

### CI

- **Unknown** — no `.github/workflows` in the repo at this mapping pass.

## Conventions

- **Package manager:** Yarn **1.x**, `packageManager: yarn@1.22.22`.
- **Node:** `>= 18`.
- **Monorepo:** `workspaces.packages`: `apps/*`, `packages/*`; `nohoist` for Nest/Apollo under backend.
- **Frontend imports:** `@/*` → `apps/frontend/*`. Shared authz: `@repo/permissions` (not a relative path into `apps/backend`).
- **App Router:** new chrome tabs go in `app/(main)/<name>/page.tsx` and `TabNav.tsx` (guest / user / staff sets), not a single `TABS` array.
- **Permissions:** change role rules in `packages/permissions/src/permissions.ts`, then call sites stay the same. Do not trust the UI alone.
- **Schema changes:** Nest decorators → regen `schema.gql` → `yarn codegen` in `apps/frontend`.
- **Cartograph skill:** `.cursor/skills/Cartograph/SKILL.md`.
