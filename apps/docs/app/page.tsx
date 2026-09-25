"use client";

import { useMemo, useState } from "react";

function CopyBlock({
  title,
  code,
}: {
  title: string;
  code: string;
}): React.ReactNode {
  const [copied, setCopied] = useState(false);

  const canCopy =
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    Boolean(navigator.clipboard?.writeText);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // no-op: clipboard may be blocked by browser permissions
    }
  }

  return (
    <section className="doc-block">
      <div className="doc-copyRow">
        <h3 style={{ margin: 0, fontSize: 14 }}>{title}</h3>
        <button className="doc-copyBtn" onClick={copy} disabled={!canCopy}>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="doc-card doc-pre">{code}</pre>
    </section>
  );
}

export default function Home() {
  const installAndRunAll = useMemo(
    () => `yarn install
yarn dev`,
    [],
  );

  const runSeparately = useMemo(
    () => `# backend (GraphQL API)
yarn workspace backend dev

# frontend (UI)
yarn workspace frontend dev`,
    [],
  );

  const runDocs = useMemo(() => `yarn workspace docs dev:docs`, []);

  const frontendEnv = useMemo(
    () => `# apps/frontend/.env.local
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:3001/graphql`,
    [],
  );

  const backendEnv = useMemo(
    () => `# apps/backend/.env — copy from apps/backend/.env.example
JWT_SECRET=your-secret
PGHOST=localhost
PGPORT=5432
PGUSER=todo_user
PGPASSWORD=
PGDATABASE=todo_db`,
    [],
  );

  return (
    <main className="doc-wrap">
      <h1>Todo Fullstack</h1>
      <p>
        Monorepo: Next.js frontend + NestJS GraphQL backend + PostgreSQL. JWT
        login lives in the app; shared permission helpers are{" "}
        <code>@repo/permissions</code>.
      </p>
      <p>
        Full architecture map (routes, auth, GraphQL, DB):{" "}
        <code>docs/CODEBASE_MAP.md</code> in the repo (not served as a page
        here). Local Postgres: <code>docs/local-database.md</code>.
      </p>

      <h2>Links</h2>
      <ul>
        <li>
          Frontend (opens on <code>/profile</code>):{" "}
          <a href="http://localhost:3000">http://localhost:3000</a>
        </li>
        <li>
          Login:{" "}
          <a href="http://localhost:3000/login">http://localhost:3000/login</a>
        </li>
        <li>
          Tasks:{" "}
          <a href="http://localhost:3000/tasks">http://localhost:3000/tasks</a>
        </li>
        <li>
          Users (admin):{" "}
          <a href="http://localhost:3000/users">http://localhost:3000/users</a>
        </li>
        <li>
          Backend GraphQL:{" "}
          <a href="http://localhost:3001/graphql">
            http://localhost:3001/graphql
          </a>
        </li>
        <li>
          Docs: <a href="http://localhost:3002">http://localhost:3002</a>
        </li>
      </ul>

      <h2>Run the app</h2>
      <p>
        <b>Option A (one command)</b>: run everything from the repo root via
        Turborepo.
      </p>
      <CopyBlock title="Install + run all" code={installAndRunAll} />

      <p style={{ marginTop: 14 }}>
        <b>Option B (separately)</b>: start services independently (still from
        the repo root).
      </p>
      <CopyBlock
        title="Run backend + frontend separately"
        code={runSeparately}
      />

      <h2>Documentation (optional)</h2>
      <p>
        Docs is a separate app (port <b>3002</b>) and does not start with{" "}
        <code>yarn dev</code>.
      </p>
      <CopyBlock title="Run docs" code={runDocs} />

      <h2>Frontend environment</h2>
      <p>
        The frontend uses <code>NEXT_PUBLIC_GRAPHQL_URL</code> (defaults to{" "}
        <code>http://localhost:3001/graphql</code>).
      </p>
      <CopyBlock title="apps/frontend/.env.local" code={frontendEnv} />

      <h2>Backend environment</h2>
      <p>
        Copy <code>apps/backend/.env.example</code> to{" "}
        <code>apps/backend/.env</code>. Apply <code>apps/backend/db/schema.sql</code>{" "}
        (see <code>docs/local-database.md</code>).
      </p>
      <CopyBlock title="apps/backend/.env" code={backendEnv} />

      <h2>Auth and permissions</h2>
      <ul>
        <li>
          Public <code>login</code> / <code>register</code> (new users get role{" "}
          <code>user</code>). JWT in <code>localStorage</code>, sent as{" "}
          <code>Authorization: Bearer</code>.
        </li>
        <li>
          Shared rules: <code>packages/permissions</code> imported as{" "}
          <code>@repo/permissions</code> from both apps (tabs, Users actions,
          task edit / hard-delete).
        </li>
        <li>
          After GraphQL schema changes: from <code>apps/frontend</code> run{" "}
          <code>yarn codegen</code>.
        </li>
      </ul>
    </main>
  );
}
