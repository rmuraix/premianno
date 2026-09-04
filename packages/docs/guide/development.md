# Development

This guide covers how to set up a development environment for PremiAnno and contribute to the project.

## Prerequisites

Before you begin, ensure you have:

- **Node.js**: v20 or later
- **pnpm**: see `packageManager` in the root package.json
- **Adobe Premiere Pro**: 25.6 or later, for testing
- **UXP Developer Tool (UDT)**: v2.2.1 or later, to load and debug the plugin
- **Git**: For version control

## Setup

### 1. Clone the Repository

```bash
git clone https://github.com/rmuraix/premianno.git
cd premianno
```

### 2. Install Dependencies

```bash
pnpm install
```

This will install all dependencies for the monorepo, including both the uxp package and docs package.

## Development Commands

### Building the Plugin

```bash
# Build the plugin
pnpm uxp build

# Build in watch mode
pnpm uxp dev

# Build and package as CCX (the distributed artifact)
pnpm uxp ccx

# Wrap the CCX in a ZIP archive, for hand-off outside a release
pnpm uxp zip
```

### Testing and Type Checking

```bash
# Run unit tests
pnpm uxp test

# Run unit tests with coverage
pnpm uxp test:coverage

# Type check the package
pnpm uxp typecheck
```

### Running Documentation

```bash
# Start documentation dev server
pnpm docs dev

# Build documentation
pnpm docs build

# Preview built documentation
pnpm docs preview
```

### Code Quality

```bash
# Run linter
pnpm biome check .

# Fix linting issues
pnpm biome check . --fix
```

## UXP Development Setup

### Loading the Plugin for Development

1. Enable **Developer Mode** in Premiere Pro's Plugins preferences
2. Run `pnpm uxp dev` to build into `packages/uxp/dist` and keep watching for changes
3. Open the UXP Developer Tool and click **Add Plugin**, then select `packages/uxp/dist/manifest.json`
4. Click **Load** (or **Load & Watch** to reload on every rebuild)
5. Open the panel from **Window > UXP Plugins > PremiAnno**

### Debugging

UXP plugins are debugged through the UXP Developer Tool:

1. In UDT, click the **•••** menu of the loaded plugin and choose **Debug**
2. Chrome DevTools opens against the panel
3. Use the Console, Elements, and Sources tabs to debug

## Project Structure

```
premianno/
├── packages/
│   ├── uxp/              # Main UXP plugin
│   │   ├── public/       # Static assets copied into the build (icons)
│   │   ├── src/
│   │   │   ├── api/      # UXP runtime helpers (theme, error handler)
│   │   │   ├── lib/      # Host bridge, storage, annotation logic
│   │   │   ├── shared/   # Shared type definitions
│   │   │   ├── main.tsx  # React panel UI
│   │   │   └── index.tsx # Panel entry point
│   │   ├── tests/        # Vitest unit tests
│   │   ├── uxp.config.ts # UXP manifest configuration
│   │   └── package.json
│   └── docs/             # VitePress documentation
│       ├── .vitepress/
│       ├── guide/
│       ├── api/
│       └── package.json
├── .github/
│   └── workflows/        # CI/CD workflows
├── biome.json           # Biome configuration
├── pnpm-workspace.yaml  # pnpm workspace config
└── package.json         # Root package.json
```

## Architecture

### Plugin Architecture

PremiAnno is built using:

- **React 19**: UI framework
- **TypeScript**: Type-safe development
- **Vite**: Build tool
- **vite-uxp-plugin** ([Bolt UXP](https://github.com/hyperbrew/bolt-uxp)): UXP manifest generation, hot reload, and CCX/ZIP packaging
- **Adobe Premiere Pro UXP API**: Host integration through the `premierepro` module

### Key Components

- **React Panel UI** (`src/main.tsx`): Scan/import/label/export workflow
- **Host Bridge** (`src/lib/host.ts`): Reads sequences and clip boundaries through the async Premiere Pro UXP API
- **Storage** (`src/lib/storage.ts`): Persists annotations in the UXP plugin data folder and drives the host file pickers
- **Annotation Logic** (`src/lib/annotations.ts`, `src/lib/annotationStore.ts`): TOML serialization, CSV parsing, and label merging
- **Theme Polyfill** (`src/api/theme.ts`): Fills in the `--uxp-host-*` CSS variables that Premiere Pro does not provide

## Contributing

### Workflow

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Test** thoroughly
5. **Submit** a pull request

### Code Style

- Follow the existing code style
- Use TypeScript for type safety
- Write meaningful commit messages
- Add comments for complex logic

### Testing

- Run `pnpm uxp test` and keep the unit tests green
- Test changes in Adobe Premiere Pro
- Verify the reload workflow in UDT
- Test export functionality
- Check for console errors

### Pull Request Guidelines

- Describe your changes clearly
- Reference related issues
- Include screenshots for UI changes
- Ensure CI checks pass

## Building for Distribution

### Creating a CCX Package

```bash
# Build and package
pnpm uxp ccx
```

This writes `packages/uxp/ccx/premianno.ccx`, which is the file attached to a
GitHub release. `pnpm uxp zip` only wraps that same CCX in an archive under
`packages/uxp/zip/`, so it is not part of a release.

## Resources

- [Bolt UXP](https://github.com/hyperbrew/bolt-uxp)
- [Premiere Pro UXP API](https://developer.adobe.com/premiere-pro/uxp/)

## Getting Help

- [GitHub Issues](https://github.com/rmuraix/premianno/issues)
- [Contributing Guide](https://github.com/rmuraix/.github/blob/main/.github/CONTRIBUTING.md)
