# Nibbly - Copilot Instructions

## Architecture Overview

Nibbly is a URL shortener with a **monorepo structure**: `backend/` (Elysia + Bun) and `frontend/` (TanStack Start + React).

### Backend (`backend/`)

- **Runtime**: Bun (not Node.js) - use `bun` for all commands
- **Framework**: Elysia with `@elysiajs/node` adapter
- **Auth**: Better Auth with Drizzle adapter (`src/lib/services/Auth.ts`)
- **Database**: PostgreSQL via Drizzle ORM (`src/lib/database/`)
- **Routing**: Modular routers in `src/routes/` mounted on main app

### Frontend (`frontend/`)

- **Framework**: TanStack Start (file-based routing in `src/routes/`)
- **State/Data**: TanStack Query for server state, React Hook Form for forms
- **UI**: Shadcn components in `src/components/ui/`, styled with Tailwind CSS v4
- **Auth Client**: Better Auth React client (`src/lib/auth-client.ts`)

## Key Patterns

### API Response Types

Backend uses discriminated union responses - check with `isError()`:

```typescript
// backend/src/lib/types/index.d.ts
type Response<T> = ErrorResponse | DataResponse<T>;

// Usage (frontend/src/lib/api/base.ts)
if (isError(data)) {
  /* handle error */
}
```

### Authentication

- Backend: Use `authMacro` decorator with `{ auth: true }` on protected routes
- Frontend: Use `authClient.useSession()` hook, protected routes use `authMiddleware`

### Frontend API Layer

API calls live in `frontend/src/lib/api/` with TanStack Query hooks:

- Raw API functions: `linkAPI.createShortURL()`, `linkAPI.getShortURL()`
- Query hooks: `useLink()`, `useUserLinks()`, `useLinkCreation()`

### Forms

Use React Hook Form + Zod + Controller pattern (see `routes/links/create.tsx`):

```tsx
<Controller
  name="link"
  control={control}
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <Input {...field} />
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  )}
/>
```

### Environment Variables

- Backend: Direct `process.env` access (typed in `src/lib/types/index.d.ts`)
- Frontend: T3 Env with Zod validation (`src/env.ts`) - prefix with `VITE_`

## Commands

### Backend

```bash
cd backend
bun install           # Install deps
bun run dev           # Dev server (port 3001)
bun run db:push       # Push schema to DB (development)
bun run db:migrate    # Run migrations (production)
bun run db:studio     # Open Drizzle Studio
```

### Frontend

```bash
cd frontend
bun install           # Install deps
bun run dev           # Dev server (port 3000)
bun run check         # Format + lint fix
```

### Adding Shadcn Components

```bash
pnpm dlx shadcn@latest add <component>
```

## Database Schema

- Auth tables managed by Better Auth (`src/lib/database/schema/auth.schema.ts`)
- Links table: `src/lib/database/schema/links.schema.ts`
- Export all schemas from `schema/index.ts`

## Service Pattern (Backend)

Business logic in service classes (`src/lib/services/`):

```typescript
// Decorated on router: .decorate('linkManager', new LinkManager())
// Used in routes: async ({ linkManager }) => linkManager.getLink(slug)
```
