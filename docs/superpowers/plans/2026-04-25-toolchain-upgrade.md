# Toolchain Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the project to Vite 8 with Rolldown-backed builds, add TypeScript 7 preview via `tsgo`, and introduce `oxlint` and `oxfmt` as first-class tooling.

**Architecture:** Keep the migration minimal and reversible. Upgrade the bundler and related Vite/TanStack plugin dependencies first, then add `tsgo` alongside the existing TypeScript package so the repository can verify both paths during rollout, and finally add explicit Oxc lint/format scripts and configs without changing application behavior.

**Tech Stack:** Bun, Vite 8, TanStack Start, React 19, Vitest, TypeScript 5/7 preview (`tsgo`), Oxlint, Oxfmt

---

### Task 1: Record the Migration Baseline

**Files:**

- Modify: `package.json`
- Modify: `vite.config.ts`
- Modify: `tsconfig.json`
- Create: `docs/superpowers/plans/2026-04-25-toolchain-upgrade.md`

- [ ] **Step 1: Confirm the current repository state**

Run: `git status --short`
Expected: no unexpected staged changes that would block the toolchain update work.

- [ ] **Step 2: Run the current verification baseline**

Run: `bun run typecheck && bun run test && bun run build`
Expected: the existing project passes before dependency changes.

- [ ] **Step 3: Save the implementation plan**

```md
# Toolchain Upgrade Implementation Plan

Upgrade Vite, add tsgo, oxlint, and oxfmt with minimal config churn.
```

- [ ] **Step 4: Re-read the files that will be touched**

Run: `bun pm ls vite @vitejs/plugin-react @tanstack/react-start @tanstack/devtools-vite typescript`
Expected: confirms the installed versions that the migration is replacing.

### Task 2: Upgrade Vite and Stabilize Related Dependencies

**Files:**

- Modify: `package.json`
- Modify: `vite.config.ts`
- Modify: `bun.lock`

- [ ] **Step 1: Write the failing integration check**

Run: `bun run build`
Expected: this is the last build on the pre-migration stack and acts as the before-state proof for the later upgrade.

- [ ] **Step 2: Update dependency versions and scripts in `package.json`**

```json
{
  "scripts": {
    "dev": "bun --bun vite dev --port 3000 --host",
    "build": "bun --bun vite build",
    "preview": "bun --bun vite preview",
    "test": "vitest run",
    "typecheck": "bunx tsgo --noEmit",
    "typecheck:tsc": "bunx tsc --noEmit",
    "typecheck:tsgo": "bunx tsgo --noEmit",
    "lint": "oxlint .",
    "format": "oxfmt .",
    "format:check": "oxfmt --check ."
  }
}
```

- [ ] **Step 3: Pin the Vite and TanStack packages to compatible versions**

```json
{
  "dependencies": {
    "@tanstack/react-devtools": "0.10.2",
    "@tanstack/react-router": "1.168.23",
    "@tanstack/react-router-devtools": "1.166.13",
    "@tanstack/react-router-ssr-query": "1.166.11",
    "@tanstack/react-start": "1.167.45",
    "@tanstack/router-plugin": "1.167.23"
  },
  "devDependencies": {
    "@tanstack/devtools-vite": "0.6.0",
    "@typescript/native-preview": "7.0.0-dev.20260424.2",
    "@vitejs/plugin-react": "^6.0.1",
    "oxfmt": "^0.46.0",
    "oxlint": "^1.61.0",
    "typescript": "^5.9.3",
    "vite": "^8.0.10",
    "vitest": "^4.1.5"
  }
}
```

- [ ] **Step 4: Update the Vite config to use Vite 8 path alias support**

```ts
import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [devtools(), tailwindcss(), tanstackStart(), viteReact()],
})
```

- [ ] **Step 5: Install and refresh the lockfile**

Run: `bun install`
Expected: `bun.lock` updates to the new dependency graph without peer dependency failures.

- [ ] **Step 6: Verify the upgraded Vite toolchain**

Run: `bun run build`
Expected: build succeeds on Vite 8.

### Task 3: Add Explicit Oxc Tooling

**Files:**

- Modify: `package.json`
- Create: `.oxlintrc.json`
- Create: `.oxfmtrc.json`

- [ ] **Step 1: Write the failing lint/config check**

Run: `bun run lint`
Expected: fails before the Oxc config files and dependencies are in place.

- [ ] **Step 2: Add a minimal oxlint config**

```json
{
  "ignorePatterns": ["dist", ".nitro", ".tanstack", "routeTree.gen.ts", "node_modules"]
}
```

- [ ] **Step 3: Add a minimal oxfmt config**

```json
{
  "ignorePatterns": ["dist", ".nitro", ".tanstack", "routeTree.gen.ts", "node_modules"]
}
```

- [ ] **Step 4: Verify the formatter and linter commands**

Run: `bun run lint && bun run format:check`
Expected: both commands run successfully against the repository.

### Task 4: Validate tsgo Adoption

**Files:**

- Modify: `package.json`
- Modify: `bun.lock`

- [ ] **Step 1: Write the failing tsgo check**

Run: `bunx tsgo --noEmit`
Expected: before installation this command would fail; after installation it becomes the new main typecheck command.

- [ ] **Step 2: Keep `tsc` available as a fallback verifier**

```json
{
  "scripts": {
    "typecheck": "bunx tsgo --noEmit",
    "typecheck:tsgo": "bunx tsgo --noEmit",
    "typecheck:tsc": "bunx tsc --noEmit"
  }
}
```

- [ ] **Step 3: Verify both typecheck paths**

Run: `bun run typecheck:tsgo && bun run typecheck:tsc`
Expected: both commands pass, proving `tsgo` is viable and `tsc` remains available if the preview compiler regresses.

### Task 5: Final Verification

**Files:**

- Modify: `package.json`
- Modify: `vite.config.ts`
- Modify: `bun.lock`
- Create: `.oxlintrc.json`
- Create: `.oxfmtrc.json`

- [ ] **Step 1: Run the full verification suite in repo order**

Run: `bun run typecheck && bun run test && bun run build`
Expected: all three commands pass on the upgraded toolchain.

- [ ] **Step 2: Run the new tooling checks**

Run: `bun run lint && bun run format:check`
Expected: Oxc lint and format checks pass.

- [ ] **Step 3: Smoke test the development server**

Run: `timeout 20s bun run dev`
Expected: Vite 8 dev server starts successfully on `0.0.0.0:3000` before the timeout stops it.

- [ ] **Step 4: Review the diff for unintended churn**

Run: `git diff -- package.json vite.config.ts .oxlintrc.json .oxfmtrc.json bun.lock`
Expected: only the intended toolchain changes are present.
