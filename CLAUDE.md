# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install --legacy-peer-deps   # react-tinder-card's peer range predates React 19; see README
npm run dev       # start Vite dev server (HMR)
npm run build     # tsc -b (typecheck) then vite build
npm run lint      # oxlint
npm run test      # vitest run (single pass, CI-friendly)
npm run test:watch
npm run preview   # preview a production build locally
```

A Husky pre-commit hook runs `lint-staged` (`oxlint --deny-warnings` on staged `.js/.jsx/.ts/.tsx` files) — installed automatically via the `prepare` script on `npm install`.

## Tech stack

React 19 + TypeScript, built with Vite (not Next.js — this is a client-side SPA, no server routes/SSR). State/data:

- **`context()` factory** (`packages/react-kit/src/context.tsx`) for feature-scoped state shared across a component subtree — see "Shared state" below. Not Zustand/Redux; there's no global store.
- **TanStack React Query** for all server-state (fetching, caching, loading/error states). Components never call `fetch` or the repository layer directly — only through Query hooks.
- **Zod** for validating/parsing responses against upstream API contracts.
- **Axios** as the HTTP client, wrapped by `RequestBuilder` (see below) — repositories never import `axios` directly.
- **react-tinder-card** for the swipe-card gesture/physics on the breed browser; **react-router-dom** for the two real routes (breed list, breed detail).
- **Vitest + React Testing Library** for tests, co-located as `*.test.ts(x)` next to the file under test. Run via `npm run test`.

## Architecture: domain-driven modules

Feature code lives under `src/modules/<feature>/`, with each layer having one job and a strict call direction: **presentation → core/handlers → repository**. Never skip a layer (e.g. a component must not import the repository directly).

```
src/modules/<feature>/
  repository/          # thin wrappers calling this app's own /api/* routes via RequestBuilder
  core/
    handlers/           # React Query hooks (useQuery/useMutation) wrapping repository functions
    store/               # context()-based providers scoped to this feature (see dog.store.ts)
  domain/               # feature-local types (e.g. the TinderCard ref shape, vote direction)
  presentation/         # UI components, composed of small single-purpose pieces
  configuration/        # constants scoped to the module (query keys, storage keys, etc.)
```

See `src/modules/dogs/` for the reference implementation (breed swiper backed by TheDogAPI).

### Shared state: the `context()` factory, not Zustand

`packages/react-kit/src/context.tsx` exports `context(displayName, useHook)`, which returns `[Provider, useContextHook, ReactContext]`. It wraps an ordinary hook (e.g. `useBreedList() + useVoteImage()` in `dog.store.ts`) and exposes its return value through a typed context, throwing a clear error if the consumer hook is used outside its provider. This is the project's only shared-state pattern for the dogs module — there's no Redux/Zustand store. `packages/react-kit` is for this kind of cross-feature, non-domain-specific utility (see also `useLocalStorage.ts`); feature-specific logic stays under `src/modules/<feature>/`.

Cross-cutting pieces live outside `modules/`:

- `src/shared/api/client.ts` — the shared `apiClient` axios instance (`baseURL`, `timeout`, `withCredentials`). `baseURL` reads `process.env.NEXT_PUBLIC_API_BASE_URL` (a carried-over Next.js-style env name), falling back to `/api`; in the Vite build this is resolved via `vite.config.ts`'s `define` (backed by `loadEnv`, not a real Node `process`) plus a `process` → `process/browser` alias as a defensive polyfill for any other stray `process.env` access.
- `src/shared/api/request-builder.ts` — the `RequestBuilder`/`createRequest(url)` builder every repository uses: `createRequest(url).withMethod("get"|"post"|...).withParams(...).withData(...).send()`. It always calls through `apiClient`, so requests only ever hit this app's own `/api/*` surface, never a third-party host directly.
- `src/shared/api/error-request.ts` — `ErrorRequest`, the base class `RequestBuilder` extends. Its `handleError` centralizes request failures: on a 401 (and not already on `/login`) it imperatively redirects via the `@routes/router` router instance, then rethrows. Callers of `.send()` should expect it to throw rather than return an error value. **Known gap:** `/login` isn't currently registered in `router.tsx`, so this redirect currently has no matching route — add one (there's an unrouted `LoginPage` under `src/modules/auth/`) before relying on this path.
- `src/shared/server-constract/` — Zod schemas matching the shape of the *upstream* API responses (e.g. `dogs.contract.ts` mirrors TheDogAPI's breed/vote shapes). Repositories parse raw responses against these before mapping into domain types.
- `src/types/` — this app's own domain types (e.g. `BreedDetails`), decoupled from upstream response shapes. Repositories are the mapping boundary between `server-constract` shapes and `types` shapes.
- `src/routes/router.tsx` — the single `createBrowserRouter` instance (aliased as `@routes/router`), mounted in `main.tsx` via `RouterProvider`. It's the imperative navigation target for `error-request.ts`'s 401 handling, so it must stay the one router instance the whole app renders through — don't introduce a second router or render `<App />` outside of it.

### Why there's a Vite proxy standing in for a backend

This app has no backend of its own. `vite.config.ts` proxies two upstreams under `/api/*`:

- `/api/dogs/*` → the public Dog CEO API (`https://dog.ceo/api`), rewriting our own route shape onto Dog CEO's actual endpoints.
- `/api/v1/*` → TheDogAPI (`https://api.thedogapi.com`), with the `x-api-key` header attached **server-side in the proxy**, never in client code — this is the entire reason the proxy exists rather than calling TheDogAPI directly from the browser (see README for the env vars this needs).

This keeps the repository layer honest — it only ever knows about `/api/*` — so swapping the proxy for a real backend later requires no frontend changes. When adding a real backend, replace the proxy rule, not the repository code.

### Path aliases

`@/*` → `src/*`, `@routes/*` → `src/routes/*`, `@packages/*` → `packages/*` (each package's own `src/` stays part of the import path, e.g. `@packages/react-kit/src/context`), `@hooks/*` → `hooks/*` (standalone hooks not yet promoted into `packages/react-kit`, e.g. `useDebounceCallback`). Configured in both `tsconfig.app.json` `paths` and `vite.config.ts` `resolve.alias` — keep both in sync if either changes.

## Adding a new feature module

1. Create `src/modules/<feature>/{repository,core/handlers,core/store,domain,presentation,configuration}/`.
2. Add upstream response schemas to `src/shared/server-constract/<feature>.contract.ts` and domain types to `src/types/`.
3. Write repository functions that call `createRequest(url).withMethod(...)`, parse the result with the Zod schema, and map to domain types.
4. Wrap each repository function in a `useQuery`/`useMutation` hook under `core/handlers/`.
5. If multiple components need the same server-state + derived logic, wrap it with `context()` in `core/store/` (see `dog.store.ts`); otherwise call the `core/handlers` hooks directly from presentation.
6. Build presentation components that only call `core/handlers`/`core/store` — never the repository directly.
7. If the feature needs its own route, add it to `src/routes/router.tsx`.
8. Add `*.test.ts(x)` next to any non-trivial logic (pure functions, hooks, repository mapping, components with real branching). Mock at the repository boundary (`vi.mock("@/modules/.../repository/...")`), not deeper.
