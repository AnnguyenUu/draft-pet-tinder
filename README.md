# Dog Finder

A Tinder-style swipe UI for browsing dog breeds, built on [TheDogAPI](https://www.thedogapi.com/). Swipe (or tap Like/Pass) to vote on a breed's photo, view full breed details, and pick up right where you left off on reload.

React 19 + TypeScript, client-side only (Vite SPA, no backend of its own — see [Architecture](#architecture)).

## Quick start

```bash
npm install --legacy-peer-deps   # see "Why --legacy-peer-deps" below
cp .env.example .env             # then fill in API_KEY (see below)
npm run dev
```

Open the printed local URL and go to `/breads` (the swiper) or straight to `/breads/:breedId` for a specific breed's detail page.

### Environment variables

Copy `.env.example` to `.env` and fill in:

| Variable | Required | Notes |
|---|---|---|
| `API_KEY` | Yes | A free [TheDogAPI](https://www.thedogapi.com/signup) key. Attached to upstream requests **only inside the Vite dev-server proxy** (`vite.config.ts`) — it's never sent to the browser or visible in client code/devtools, by design. |
| `VITE_API_BASE_URL` | Yes | TheDogAPI's base URL, normally `https://api.thedogapi.com` (no `/v1` suffix — the proxy appends it per-route). |

`.env` is gitignored. If you're deploying this for real, you'll need an actual backend (or serverless function) to hold `API_KEY` in production — the Vite proxy only exists for local dev (see below).

### Why `--legacy-peer-deps`

`react-tinder-card`'s `peerDependencies` still list React 16–18; it hasn't been updated for React 19 despite working fine with it at runtime (no removed APIs, no `findDOMNode`, etc. — verified by hand). Until upstream bumps that range, a plain `npm install` will fail with an `ERESOLVE` conflict. `--legacy-peer-deps` is required for every install, including CI and the `prepare` script that installs the git hook.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | `tsc -b` (typecheck, no emit) then `vite build` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | `oxlint` over the project |
| `npm run test` | `vitest run` — single pass, CI-friendly |
| `npm run test:watch` | `vitest` in watch mode |

A **pre-commit hook** (Husky + lint-staged) runs `oxlint --deny-warnings` against staged files on every commit — see [Linting & the pre-commit hook](#linting--the-pre-commit-hook).

## Architecture

Domain-driven modules under `src/modules/<feature>/`, each layer with one job and a strict call direction:

```
presentation  →  core/handlers  →  repository
                 core/store (optional, for state shared across a subtree)
```

```
src/modules/dogs/
  repository/       # calls this app's own /api/* routes via RequestBuilder, parses + maps responses
  core/
    handlers/        # React Query hooks (useQuery/useMutation) wrapping repository functions
    store/            # context()-based provider sharing query + mutation state across the swiper
  domain/            # feature-local types (TinderCard ref shape, vote direction)
  presentation/      # UI components — never call the repository directly
  configuration/     # query keys, storage keys, tunable constants
```

A component is never allowed to skip a layer (no calling the repository or `fetch` directly from a component). Full details, including the reasoning behind each cross-cutting piece (`shared/api/*`, path aliases, etc.), live in [`CLAUDE.md`](./CLAUDE.md) — that file is written for an AI assistant working in this repo, but it's the most precise architecture reference and is kept in sync with the actual code.

### There's no backend — yet

`vite.config.ts` proxies two upstreams under `/api/*`:

- `/api/dogs/*` → the public Dog CEO API, with our own route shape rewritten onto theirs.
- `/api/v1/*` → TheDogAPI, with the `x-api-key` header attached **inside the proxy config**, server-side — this is the whole reason a proxy exists here rather than calling TheDogAPI straight from the browser. The repository layer only ever talks to `/api/*`, so replacing the proxy with a real backend later needs zero frontend changes.

This is a deliberate, temporary shape for local development, not a production deployment story — see [Known limitations](#known-limitations).

## Why these libraries

A few of these choices aren't the "obvious" default, so here's the reasoning:

- **TanStack React Query**, not manual `useEffect` fetching or Redux-style async state. All server-state (loading/error/cache/retry) goes through it; components only ever see `.data`/`.isLoading`/`.isError`. This is also what makes the app's tests fast and reliable — mocking one repository function under a `QueryClientProvider` is enough to test an entire hook or component tree.
- **Zod**, to validate upstream API responses at the repository boundary before they're mapped into this app's own domain types (`src/types/`). Third-party APIs change shape without warning; a `.parse()` that throws on drift is much safer than trusting `any` and finding out at render time.
- **Axios wrapped by a `RequestBuilder`** (`createRequest(url).withMethod(...).send()`), not `fetch` directly. Repositories never import `axios`; they only see the builder. This centralizes timeout/`withCredentials` config and 401-handling (auto-redirect to `/login`) in one place (`src/shared/api/error-request.ts`) instead of repeating try/catch in every repository function.
- **`react-tinder-card`**, not a hand-rolled drag implementation (which is what this project actually started with). The switch happened mid-project specifically because a from-scratch pointer-drag implementation is easy to get *visually* right and easy to get *reliability* wrong — see the "pre-mounted swipe window" note below for the specific bug this surfaced.
- **A custom `context()` factory** (`packages/react-kit/src/context.tsx`) instead of Zustand/Redux. The app only needs one small piece of state shared across the swiper subtree (the breed list query + vote mutation); a full global-store library would be more machinery than the problem needs. `context()` is a thin, reusable wrapper: give it a hook, get back a type-safe `[Provider, useContextHook]` pair that throws a clear error if used outside its provider.
- **Vitest + React Testing Library**, not Jest. Vitest reads `vite.config.ts` directly (`import { defineConfig } from 'vitest/config'`), so tests automatically get the exact same path aliases, plugins, and env resolution as the real app — no separate Jest config to keep in sync, no module-resolution drift between "how the app runs" and "how the tests run".
- **oxlint**, not ESLint. Oxc-based, effectively instant even on this repo's full source, with an ESLint-compatible rule set (`react/rules-of-hooks`, `no-unused-vars`, etc.) — a good fit for a pre-commit hook where lint time directly taxes every commit.

### Swipe progress resumes across reloads

`useSwiper`'s initial index isn't always `0` — it's computed from the last swiped breed's id, persisted via a small generic `useLocalStorage` hook (`packages/react-kit/src/useLocalStorage.ts`). On mount, it looks that id up in the freshly-fetched breed list and resumes right after it, falling back to `0` if there's no saved id or the breed's no longer in the list (e.g. TheDogAPI's set changed between sessions). The `localStorage` read/write is wrapped in try/catch — a private-browsing storage failure degrades to "always starts from the top" instead of breaking the swipe interaction entirely.

### Voting

Swiping right (or tapping Like) posts `{ image_id, value: 1 }` to TheDogAPI's `/v1/votes`; left/Pass posts `value: -1`. This fires through the same `context()`-based store as the breed list query, via `useVoteImage` (a plain `useMutation`) — it's fire-and-forget from the UI's perspective and never blocks or delays advancing to the next card.

## Testing

Tests are co-located as `*.test.ts(x)` next to the file under test (`npm run test`). The strategy is to mock at the **repository boundary** (`vi.mock("@/modules/dogs/repository/dogs.repository")`), not deeper — tests exercise real Zod parsing, real React Query caching, and real component rendering, with only the actual HTTP call replaced.

A couple of choices worth calling out:

- **`react-tinder-card` is stubbed, not driven for real**, in `DogSwiper.test.tsx`. The stub preserves its contract (a forwarded ref exposing `swipe()`/`restoreCard()`, and an `onSwipe` callback) so tests cover *our* wiring — that clicking Like/Pass or pressing arrow keys calls the store with the right `(direction, imageId)` and advances the deck — without depending on a third-party library's animation/gesture internals, which proved genuinely flaky to drive through a real drag in a JSDOM environment.
- **`@testing-library/react`'s auto-cleanup isn't automatic here.** Vitest isn't configured with `globals: true` (tests use explicit `import { describe, it, expect } from "vitest"` rather than ambient globals), so cleanup between tests is wired explicitly in `src/test/setup.ts`. Without it, a component test's DOM silently accumulates across tests in the same file instead of unmounting.

## Linting & the pre-commit hook

`.husky/pre-commit` runs `npx lint-staged`, which runs `oxlint --deny-warnings` against staged files only. The `--deny-warnings` flag matters: oxlint's default exit code is 0 whenever there are only warnings (e.g. `no-unused-vars`) and no hard errors, which means a plain `oxlint` invocation in a pre-commit hook silently lets warnings through. `--deny-warnings` makes warnings fail the commit too.

## Known limitations

Documenting these honestly rather than pretending they don't exist:

- **`/login` isn't a registered route.** `error-request.ts` redirects there on a 401, and `LoginPage` exists under `src/modules/auth/`, but `router.tsx` never wires the two together.
- **`hooks/useDebounceCallback.ts` and `hooks/useLocalStorage.ts` live outside `src/`**, in a root-level `hooks/` folder reachable via the `@hooks/*` alias. `useLocalStorage.ts` there is an orphaned duplicate of the real one in `packages/react-kit/src/useLocalStorage.ts` (the one actually used by `useSwiper`) — it isn't imported anywhere.
- **No production deployment path yet.** The Vite proxy that holds `API_KEY` only runs in local dev; shipping this for real needs a small backend/serverless function to take over that role (see [Architecture](#architecture)).
- **This app has no automated E2E/visual test coverage** — only unit/integration tests via Vitest. Manual verification (including on real mobile viewports) has been the check for visual/gesture behavior.
