## Todo Fullstack (Turborepo)

Fullstack monorepo: **Next.js frontend** + **NestJS GraphQL backend** + **PostgreSQL**.
Managed with **Yarn workspaces** and **Turborepo**.

### Apps

- **`apps/frontend`** (workspace: `frontend`) — Next.js UI + Apollo Client
  - URL: `http://localhost:3000`
- **`apps/backend`** (workspace: `backend`) — NestJS + Apollo GraphQL + PostgreSQL
  - GraphQL endpoint: `http://localhost:3001/graphql`
- **`apps/docs`** (workspace: `docs`) — short project docs (optional)
  - URL: `http://localhost:3002`

---

## Requirements

- Node.js **>= 18**
- Yarn **1.x** (repo uses `yarn@1.22.22`)
- PostgreSQL (local)

---

## Install

From the repo root:

```bash
yarn install
```

## Start local servers

From the repo root:

```bash
yarn dev
```
