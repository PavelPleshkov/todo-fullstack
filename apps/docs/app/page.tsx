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

  return (
    <main className="doc-wrap">
      <h1>Todo Fullstack</h1>
      <p>Monorepo: Next.js frontend + NestJS GraphQL backend + PostgreSQL.</p>

      <h2>Links</h2>
      <ul>
        <li>
          Frontend: <a href="http://localhost:3000">http://localhost:3000</a>
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
    </main>
  );
}
