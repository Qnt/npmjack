# AGENTS.md

## Verify First

- Use Bun commands: `bun run dev`, `bun run typecheck`, `bun run test`, `bun run build`.
- `bun run dev` starts the TanStack Start app on `0.0.0.0:3000`.
- There is no lint or format script. For code changes, the real verification order in this repo is `bun run typecheck`, `bun run test`, then `bun run build`.
- Run a single test file with `bunx vitest run path/to/file.test.ts`.

## Routes And Runtime

- File routes are `src/routes/index.tsx` (`/` landing page), `src/routes/game.tsx` (`/game` gameplay), and `src/routes/api/packages.ts` (`/api/packages` server endpoint).
- Keep `src/routes/game.tsx` thin. Game orchestration lives in `src/hooks/useGameBoard.ts`; gameplay rules and round state live in `src/hooks/useGame.ts`.
- Query setup is in `src/router.tsx`: `getRouter()` creates a fresh `QueryClient` per router instance and calls `setupRouterSsrQueryIntegration()`. `src/router.test.ts` protects this behavior.
- Never edit `src/routeTree.gen.ts`; TanStack Router regenerates it.

## Data Sources

- `src/lib/npms-server.ts` talks to `https://api.npms.io/v2` for popular and trending package names. `GET /api/packages?type=pool` merges those lists, dedupes them, and shuffles the final deck.
- If you change `/api/packages` query parsing or limits, update `src/routes/api/-packages.test.ts`.
- `usePackagePool()` loads the deck from `/api/packages?type=pool`; `usePackageInfo()` fetches per-package packuments from `https://registry.npmjs.org`; `useGameBoard()` bridges those queries into `useGame()`.
- Preserve scoped package URL encoding when editing registry fetches: `@scope/pkg` must be requested as `@scope%2Fpkg`.

## Repo Conventions

- Use the `#/` alias for `src` imports. `tsconfig.json` also defines `@/`, but the checked-in app code uses `#/`.
- Shadcn is configured in `components.json` with style `radix-nova`, CSS entry `src/styles.css`, and aliases rooted at `#/components/ui` and `#/lib/utils`.
- TypeScript is strict: `noUnusedLocals`, `noUnusedParameters`, and `noUncheckedSideEffectImports` are enabled. Small unused helpers or imports will fail `bun run typecheck`.
- Recent history uses conventional commit messages, usually `type(scope): description`.

## Boundaries

- `src/integrations/tanstack-query/root-provider.tsx` has no direct imports in this repo; confirm framework usage before assuming edits there affect runtime behavior.
- Treat router and initialization changes as TanStack Start SSR work, not plain client-only Vite work.

## Game Invariants

- Packages with `unpackedSize === null` are invalid draws: reject them and retry silently.
- Do not re-request package names already rejected or skipped in the same round.
- Player draw handling is `drawId`-gated; keep it idempotent.
- Dealer pending-package state must be cleared on reject, skip, or successful load before the next dealer draw.
- `useGame()` seeds a round with `Math.random()` during state initialization, so changes around `createNewGameState()` are SSR-sensitive.

## Tests

- Most tests run in Vitest's default non-DOM environment. DOM tests must opt into jsdom per file with `// @vitest-environment jsdom`.
- Existing focused tests are `src/hooks/useGame.test.ts`, `src/components/game/GameControls.test.tsx`, `src/routes/api/-packages.test.ts`, and `src/router.test.ts`; extend the closest one before adding broader coverage.
