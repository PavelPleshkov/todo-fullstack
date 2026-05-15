# Local PostgreSQL setup

The backend reads connection settings from `apps/backend/.env`. Copy [apps/backend/.env.example](../apps/backend/.env.example) to `apps/backend/.env` in the same folder and edit if needed.

## 1. Install and run PostgreSQL

Use a supported PostgreSQL version locally. Ensure it accepts TCP connections on the host and port you set in `.env` (defaults: `localhost:5432`).

## 2. Create role and database (matches `.env.example` defaults)

Run as a PostgreSQL superuser:

```bash
createuser -h localhost -p 5432 todo_user
createdb -h localhost -p 5432 -O todo_user todo_db
```

If `todo_user` has a password, set the same value in `PGPASSWORD` inside `apps/backend/.env`.

## 3. Create the `tasks` table

From the **repository root**:

```bash
psql -h localhost -p 5432 -U todo_user -d todo_db -f apps/backend/db/schema.sql
```

Change host, port, user, or database if your `.env` differs.

## 4. Backend env file

From the repository root:

```bash
cp apps/backend/.env.example apps/backend/.env
```

Then start the stack with `yarn dev` from the repo root. Nest loads `.env` via `ConfigModule` in `apps/backend/src/app.module.ts`.

## Troubleshooting

- **Connection refused:** PostgreSQL is not running, or `PGHOST` / `PGPORT` are wrong.
- **password authentication failed:** set `PGPASSWORD` or adjust `pg_hba.conf`.
- **relation "tasks" does not exist:** repeat step 3.
- **Column errors:** align the table with `apps/backend/db/schema.sql` and the SQL in `apps/backend/src/tasks.service.ts`.
