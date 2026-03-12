# AGENTS.md

Coding agent guidelines for the npmjack project.

## Project Overview

npmjack is a Blackjack-style game using npm package sizes. Built with TanStack Start (SSR), React 19, TypeScript, Tailwind CSS v4, shadcn/ui, and Bun.

## Commands

### Development

```bash
bun run dev          # Start dev server on port 3000
bun run build        # Production build
bun run preview      # Preview production build
```

### Testing

```bash
bun run test                    # Run all tests (vitest)
bun run vitest run path/to/test # Run single test file
bun run vitest watch            # Watch mode
```

### Type Checking

```bash
bunx tsc --noEmit    # Type check without emitting
```

## Code Style Guidelines

### Imports

Order imports with blank line separators:

1. External packages (react, tanstack, lucide-react, etc.)
2. Internal aliases (`#/*`)
3. Relative imports (`./`, `../`)
4. Type imports (use `import type`)

```tsx
import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Target } from 'lucide-react'

import { useCustomHook } from '#/hooks/useCustomHook'
import { Button } from '#/components/ui/button'

import { LocalComponent } from './LocalComponent'
import type { PackageInfo } from '#/lib/npm-registry'
```

### Path Aliases

Use `#/*` for imports from `src/`:

```tsx
import { Button } from '#/components/ui/button'
import { formatDate } from '#/lib/utils'
```

### TypeScript

- **Strict mode enabled** - all strict checks are on
- **No unused locals/parameters** - will cause build errors
- **verbatimModuleSyntax** - always use explicit type imports:

```tsx
import { useState } from 'react'
import type { ReactNode } from 'react'
```

- Prefer explicit return types for exported functions
- Use `interface` for object types, `type` for unions/intersections
- Export types alongside functions when they define public API

### React Components

- Function components only
- Named exports (no default exports except routes when required)
- Destructure props in function signature with explicit interface:

```tsx
interface ButtonProps {
  label: string
  onClick: () => void
  variant?: 'default' | 'secondary' | 'destructive'
}

export function Button({ label, onClick, variant = 'default' }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>
}
```

### TanStack Router

File-based routing in `src/routes/`:

- `__root.tsx` - root layout with shell (html, head, body)
- `index.tsx` - home page (`/`)

Route file pattern:

```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: PageComponent,
})

function PageComponent() {
  return <main>...</main>
}
```

### TanStack Query

Use for data fetching with the `useQuery` hook:

```tsx
import { useQuery } from '@tanstack/react-query'

export function usePackageInfo(name: string | null) {
  return useQuery<PackageInfo>({
    queryKey: ['package', name],
    queryFn: () => fetchPackageInfo(name!),
    enabled: !!name,
    staleTime: 5 * 60 * 1000,
  })
}
```

### Styling

- Tailwind CSS v4 with `@tailwindcss/vite` plugin
- shadcn/ui components in `src/components/ui/`
- Use semantic color classes: `bg-background`, `text-foreground`, `text-muted-foreground`, `text-primary`
- Dark theme is active via `className="dark"` on `<html>` in `__root.tsx`
- Custom CSS in `src/styles.css` using Tailwind v4 syntax
- Import CSS as URL: `import appCss from '../styles.css?url'`

### shadcn/ui

- Components are in `src/components/ui/`
- Use `cn()` utility for conditional class merging
- Use variant props instead of custom classes:

```tsx
<Button variant="destructive">Delete</Button>
<Button variant="secondary" size="lg">Submit</Button>
```

### Naming Conventions

- **Components**: PascalCase (`Button.tsx`, `PlayerCard.tsx`)
- **Hooks**: camelCase with `use` prefix (`useGame.ts`, `usePackageInfo.ts`)
- **Utilities**: camelCase (`formatSize.ts`, `npm-registry.ts`)
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_RETRIES`, `API_BASE_URL`)
- **Types**: PascalCase (`PackageInfo`, `GameStatus`)
- **Files**: Match the primary export name

### Error Handling

- Throw errors for exceptional cases
- Use TanStack Router error boundaries for route-level errors
- Handle null/undefined with early returns or optional chaining

### Comments

- **Do not add comments** unless explicitly requested
- Code should be self-documenting through clear naming

## File Structure

```
src/
├── routes/           # File-based routes (TanStack Router)
│   ├── __root.tsx    # Root layout with dark theme
│   └── index.tsx     # Home page
├── components/
│   ├── ui/           # shadcn/ui components (button, card, alert, etc.)
│   └── game/         # Domain-specific game components
├── hooks/            # Custom React hooks (useGame, usePackageInfo)
├── lib/              # Utility functions and API clients
│   ├── utils.ts      # cn() helper for class merging
│   ├── npm-registry.ts
│   └── random-package.ts
├── mocks/            # Mock data for development/testing
├── styles.css        # Global styles + shadcn CSS variables
└── router.tsx        # Router configuration
```

## Generated Files

- `routeTree.gen.ts` - auto-generated by TanStack Router, do not edit

## Pre-commit Checklist

1. `bun run build` succeeds
2. `bun run test` passes (if tests exist)
3. `bunx tsc --noEmit` - no TypeScript errors
4. No unused imports or variables (will cause build errors)
