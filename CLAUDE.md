# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install all dependencies (both packages)
npm install

# Run dev (backend + frontend concurrently)
npm run dev

# Build both packages for production
npm run build

# Push database schema changes to SQLite
npm run db:push

# Create a new user
npm run create-user -- --username <user> --password <pass> --name "Display Name"

# Type-check backend only
cd packages/backend && npx tsc --noEmit

# Type-check frontend only
cd packages/frontend && npx tsc --noEmit

# Open Drizzle Studio (DB browser)
npm run db:studio -w packages/backend
```

## Architecture

npm workspaces monorepo with two packages:

- **`packages/backend`** — Express + TypeScript + Drizzle ORM + SQLite (ESM, `"type": "module"`)
- **`packages/frontend`** — React + Vite + TypeScript + Tailwind CSS, configured as a PWA

### Backend

Express server (`src/index.ts`) mounts three route groups under `/api`:
- `/api/auth` — JWT login and user info
- `/api/expenses` — CRUD + CSV export (all routes require auth middleware)
- `/api/receipts` — file upload with AI receipt extraction (requires auth)

**Key patterns:**
- Routes (`src/routes/`) handle HTTP, services (`src/services/`) contain business logic
- Database schema defined in `src/db/schema.ts` using Drizzle ORM; migrations via `drizzle-kit push` (no migration files)
- AI receipt processing uses a strategy pattern: `AIProvider` interface (`src/ai/provider.interface.ts`) with implementations selected by `provider.factory.ts` based on `AI_PROVIDER` env var
- All backend imports use `.js` extensions (required for ESM)
- `@types/express` v5 — `req.params` values are `string | string[]`, cast with `as string` when needed
- Config loaded from env vars via `src/config.ts` (dotenv)

### Frontend

Single-page app with two routes (React Router v6):
- `/login` — `LoginPage`
- `/` — `DashboardPage` (protected, redirects to login if no JWT)

**Key patterns:**
- Auth state managed via React Context (`src/context/AuthContext.tsx`), JWT stored in localStorage
- API calls in `src/api/` use a shared fetch wrapper (`client.ts`) that attaches the JWT header
- Custom hooks (`src/hooks/`) encapsulate data fetching and state (e.g., `useExpenses` for CRUD operations)
- Vite dev server proxies `/api` requests to backend on port 3000
- Currency formatting uses `en-CA` locale with CAD

### Database

SQLite with two tables: `users` and `expenses`. Dates stored as ISO text strings (`YYYY-MM-DD`). Schema is the single source of truth — use `npm run db:push` after schema changes, no migration files.

## Git Workflow

- When asked to commit and push, use git-commit-generator agent
