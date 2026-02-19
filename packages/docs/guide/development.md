# Development

This guide covers how to set up a development environment for PremiAnno and contribute to the project.

## Prerequisites

Before you begin, ensure you have:

- **Node.js**: v20 or later
- **pnpm**: v10.18.3 or later (see `packageManager` in root package.json)
- **Adobe Premiere Pro**: For testing
- **Adobe UXP Developer Tool**: For debugging
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

This will install all dependencies for the monorepo, including both the lib package and docs package.

## Development Commands

### Building the Extension

```bash
# Build the extension
pnpm lib build

# Build in watch mode (hot reload)
pnpm lib dev

# Build and package as ZXP
pnpm lib zxp
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

## CEP Development Setup

### Installing Adobe UXP Developer Tool

1. Open Adobe Creative Cloud app
2. Navigate to the Stock & Marketplace section
3. Search for "UXP Developer Tool"
4. Install version 2.0 or later

### Loading the Extension

1. Build the extension with `pnpm lib build`
2. Open Adobe UXP Developer Tool
3. Click **Add Plugin**
4. Select `packages/lib/dist/manifest.json`
5. Click **Load** to load the extension

### Debugging

1. Click the **Debug** button in UXP Developer Tool
2. Chrome DevTools will open
3. Use the Console, Elements, and Sources tabs to debug

**Note**: Use `pnpm lib dev` with the built-in WebSocket reload system instead of UDT's "Load and Watch" feature for more reliable hot reloading.

## Project Structure

```
premianno/
├── packages/
│   ├── lib/              # Main CEP extension
│   │   ├── src/
│   │   │   ├── js/       # React panel app + CEP bridge
│   │   │   ├── jsx/      # ExtendScript host functions
│   │   │   └── shared/   # Shared type definitions
│   │   ├── dist/         # Build output
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

### Extension Architecture

PremiAnno is built using:

- **React 19**: UI framework
- **TypeScript**: Type-safe development
- **Vite**: Build tool and dev server
- **vite-cep-plugin**: CEP/host integration and packaging
- **Adobe Premiere Pro CEP/ExtendScript**: Host integration

### Key Components

- **React Panel UI**: Scan/import/label/export workflow
- **Host Bridge**: Calls ExtendScript functions from panel code
- **Annotation Store**: Local JSON persistence per project/sequence
- **Export Layer**: TOML serialization for downstream processing

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

- Test changes in Adobe Premiere Pro
- Verify hot reload functionality
- Test export functionality
- Check for console errors

### Pull Request Guidelines

- Describe your changes clearly
- Reference related issues
- Include screenshots for UI changes
- Ensure CI checks pass

## Building for Distribution

### Creating a ZXP Package

```bash
# Build and package
pnpm lib zxp
```

This generates release artifacts under `packages/lib/dist/zxp/`.

## Resources

- [Bolt CEP](https://github.com/hyperbrew/bolt-cep)

## Getting Help

- [GitHub Issues](https://github.com/rmuraix/premianno/issues)
- [Contributing Guide](https://github.com/rmuraix/.github/blob/main/.github/CONTRIBUTING.md)
