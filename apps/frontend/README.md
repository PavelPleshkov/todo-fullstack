# Frontend (`apps/frontend`)

Main **Next.js App Router** UI for todo-fullstack: Apollo Client, MUI, GraphQL Codegen.

**Monorepo map:** [docs/CODEBASE_MAP.md](../../docs/CODEBASE_MAP.md) — routes, layout hierarchy, GraphQL paths, dev commands.

## Development

From the **repository root** (starts frontend + backend):

```bash
yarn dev
```

Frontend only, from this directory:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000). Root `/` redirects to **`/tasks`**.

| Route        | Feature    |
| ------------ | ---------- |
| `/form`      | Form demo  |
| `/stopwatch` | Stopwatch  |
| `/tasks`     | Task list  |

GraphQL defaults to `http://localhost:3001/graphql`. Override with **`NEXT_PUBLIC_GRAPHQL_URL`** (see `app/ApolloWrapper.tsx`).

## App structure (summary)

```
app/
├── layout.tsx              # Root: Apollo, fonts, metadata
├── (main)/
│   ├── layout.tsx          # Shell: Header, TabNav, theme, content wrapper
│   ├── page.tsx            # / → redirect /tasks
│   ├── form/page.tsx
│   ├── stopwatch/page.tsx
│   └── tasks/page.tsx
└── components/             # Header, TabNav, Form, Stopwatch, Tasks
```

Tab navigation: `app/components/TabNav.tsx` (`next/link` + `usePathname`).

## Scripts

| Command        | Purpose                          |
| -------------- | -------------------------------- |
| `yarn dev`     | Next.js dev server (port 3000)   |
| `yarn build`   | Production build                 |
| `yarn lint`    | ESLint                           |
| `yarn test`    | Jest + Testing Library           |
| `yarn codegen` | Regenerate GraphQL types from backend schema |

After backend **GraphQL schema** changes: `yarn codegen` (schema path in `codegen.yml` → `../backend/src/schema.gql`).

## Tests

- `jest.setup.ts` mocks `next/navigation` for route-aware components.
- Shell: `app/(main)/layout.test.tsx`
- Tabs: `app/components/TabNav.test.tsx`
- Features: `components/*/*.test.tsx`
