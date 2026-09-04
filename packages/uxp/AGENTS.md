# premianno Development Guidelines

## Active Technologies

- TypeScript 5.9+, React 19, Adobe Premiere Pro UXP API (`premierepro`, `uxp` modules)
- hyperbrew/bolt-uxp tooling (vite-uxp-plugin), Vite, Vitest, Biome

## Project Structure

```text
src/
  api/      # UXP runtime helpers (theme polyfill, error handler)
  lib/      # host bridge, storage, annotation logic
  shared/   # shared type definitions
  main.tsx  # React panel UI
tests/
```

## Commands

```bash
pnpm uxp test        # unit tests
pnpm uxp typecheck   # tsc --noEmit
pnpm biome check .   # lint & format (run from the repo root)
pnpm uxp build       # build into dist/
```

## Code Style

- TypeScript with `strict` enabled; keep host access inside `src/lib/host.ts`
- The Premiere Pro UXP API is asynchronous — await host calls rather than assuming sync results
- UXP renders a subset of HTML and CSS: prefer `div`/`span`/`h1`-`h6`/`button`/`select`, and flexbox over CSS grid
- Keep business logic free of UXP APIs so it stays unit-testable

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
