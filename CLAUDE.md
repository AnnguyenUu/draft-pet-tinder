# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # start Vite dev server (HMR)
npm run build     # tsc -b (typecheck) then vite build
npm run lint      # oxlint
npm run preview   # preview a production build locally
```

There is no test runner configured yet. `npx tsc -b --noEmit` typechecks the whole project without emitting; the `build` script does the same as a build gate.

## Tech stack

React 19 + TypeScript, built with Vite (not Next.js — this is a client-side SPA, no server routes/SSR). State/data:

- **Zustand** for client/UI state (per-module stores, e.g. selected breed, favorites).
- **TanStack React Query** for all server-state (fetching, caching, loading/error states). Components never call `fetch` or the repository layer directly — only through Query hooks.
- **Radix UI** via the unified `radix-ui` package (`import { Select, Dialog, ... } from "radix-ui"`) for accessible unstyled primitives; styling is plain CSS (see `src/App.css`), not a component kit.
- **Zod** for validating/parsing responses against upstream API contracts.
- **Axios** as the HTTP client, wrapped by `RequestBuilder` (see below) — repositories never import `axios` directly.

## Architecture: domain-driven modules

Feature code lives under `src/modules/<feature>/`, with each layer having one job and a strict call direction: **presentation → core/handlers → repository**. Never skip a layer (e.g. a component must not import the repository directly).

```
src/modules/<feature>/
  repository/          # thin wrappers calling this app's own /api/* routes via RequestBuilder
  core/
    handlers/           # React Query hooks (useQuery/useMutation) wrapping repository functions
    store/               # Zustand store(s) scoped to this feature
  presentation/         # UI components, composed of small single-purpose pieces
  configuration/        # constants scoped to the module (query keys, cookie names, etc.)
```

See `src/modules/dogs/` for the reference implementation (breed picker + image gallery backed by the Dog CEO API).

Cross-cutting pieces live outside `modules/`:

- `src/shared/api/client.ts` — the shared `apiClient` axios instance (`baseURL`, `timeout`, `withCredentials`). `baseURL` reads `process.env.NEXT_PUBLIC_API_BASE_URL` (a carried-over Next.js-style env name), falling back to `/api`; in the Vite build this is resolved via `vite.config.ts`'s `define` (backed by `loadEnv`, not a real Node `process`) plus a `process` → `process/browser` alias as a defensive polyfill for any other stray `process.env` access.
- `src/shared/api/request-builder.ts` — the `RequestBuilder`/`createRequest(url)` builder every repository uses: `createRequest(url).withMethod("get"|"post"|...).withParams(...).withData(...).send()`. It always calls through `apiClient`, so requests only ever hit this app's own `/api/*` surface, never a third-party host directly.
- `src/shared/api/error-request.ts` — `ErrorRequest`, the base class `RequestBuilder` extends. Its `handleError` centralizes request failures: on a 401 (and not already on `/login`) it imperatively redirects via the `@routes/router` router instance, then rethrows. Callers of `.send()` should expect it to throw (`ApiError`-shaped where relevant) rather than return an error value.
- `src/shared/server-constract/` — Zod schemas matching the shape of the *upstream* API responses (e.g. `dogs.contract.ts` mirrors the Dog CEO API's `{ message, status }` envelope). Repositories parse raw responses against these before mapping into domain types.
- `src/types/` — this app's own domain types (e.g. `Breed`), decoupled from upstream response shapes. Repositories are the mapping boundary between `server-constract` shapes and `types` shapes.
- `src/routes/router.tsx` — the single `createBrowserRouter` instance (aliased as `@routes/router`), mounted in `main.tsx` via `RouterProvider`. It's the imperative navigation target for `error-request.ts`'s 401 handling, so it must stay the one router instance the whole app renders through — don't introduce a second router or render `<App />` outside of it.

### Why there's a Vite proxy standing in for a backend

This app has no backend of its own yet. `vite.config.ts` proxies `/api/dogs/*` to the public Dog CEO API (`https://dog.ceo/api`), rewriting our own route shape (`/api/dogs/breeds`, `/api/dogs/breeds/:breed/images`) onto Dog CEO's actual endpoints (`/breeds/list/all`, `/breed/:breed/images`). This keeps the repository layer honest — it only ever knows about `/api/*` — so swapping the proxy for a real backend later requires no frontend changes. When adding a real backend, replace the proxy rule, not the repository code.

### Path aliases

`@/*` maps to `src/*`, `@routes/*` maps to `src/routes/*`, `@packages/*` maps to `packages/*` (each package's own `src/` stays part of the import path, e.g. `@packages/react-kit/src/context`). Configured in both `tsconfig.app.json` `paths` and `vite.config.ts` `resolve.alias` — keep both in sync if either changes.

## Adding a new feature module

1. Create `src/modules/<feature>/{repository,core/handlers,core/store,presentation,configuration}/`.
2. Add upstream response schemas to `src/shared/server-constract/<feature>.contract.ts` and domain types to `src/types/`.
3. Write repository functions that call `createRequest(url).withMethod(...)`, parse the result with the Zod schema, and map to domain types.
4. Wrap each repository function in a `useQuery`/`useMutation` hook under `core/handlers/`.
5. Build presentation components that only call the `core/handlers` hooks and `core/store` — never the repository directly.
6. If the feature needs its own route, add it to `src/routes/router.tsx`.
