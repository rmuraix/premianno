# Development

This guide covers how to set up a development environment for PremiAnno and contribute to the project.

## Prerequisites

Before you begin, ensure you have:

- **Node.js**: v20 or later
- **pnpm**: v10.18.3 (specified in package.json)
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

### Building the Plugin

```bash
# Build the plugin
pnpm lib build

# Build in watch mode (hot reload)
pnpm lib dev

# Package as CCX file
pnpm lib ccx

# Create distribution zip
pnpm lib zip
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

### Installing Adobe UXP Developer Tool

1. Open Adobe Creative Cloud app
2. Navigate to the Stock & Marketplace section
3. Search for "UXP Developer Tool"
4. Install version 2.0 or later

### Loading the Plugin

1. Build the plugin with `pnpm lib build`
2. Open Adobe UXP Developer Tool
3. Click **Add Plugin**
4. Select `packages/lib/dist/manifest.json`
5. Click **Load** to load the plugin

### Debugging

1. Click the **Debug** button in UXP Developer Tool
2. Chrome DevTools will open
3. Use the Console, Elements, and Sources tabs to debug

**Note**: Use `pnpm lib dev` with the built-in WebSocket reload system instead of UDT's "Load and Watch" feature for more reliable hot reloading.

## Project Structure

```
premianno/
├── packages/
│   ├── lib/              # Main UXP plugin
│   │   ├── src/
│   │   │   ├── api/      # API layer
│   │   │   ├── lib/      # Core libraries
│   │   │   ├── types/    # TypeScript types
│   │   │   └── ...
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

### Plugin Architecture

PremiAnno is built using:

- **React 19**: UI framework
- **TypeScript**: Type-safe development
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Styling
- **Adobe UXP**: Premiere Pro integration

### Key Components

- **API Layer**: Interfaces with Premiere Pro APIs
- **UI Components**: React-based user interface
- **State Management**: Local state with React hooks
- **Data Export**: JSON/CSV export functionality

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

### Creating a CCX Package

```bash
# Build and package
pnpm lib ccx
```

This creates a CCX file in `packages/lib/dist/` that can be distributed to users.

### Creating Distribution Zip

```bash
# Bundle CCX file for release
pnpm lib zip
```

This creates a zip file in `packages/lib/public-zip/` ready for GitHub releases.

## Troubleshooting

### Build Failures

- Clear node_modules and reinstall: `rm -rf node_modules && pnpm install`
- Check Node.js version: `node --version`
- Verify pnpm version: `pnpm --version`

### Hot Reload Not Working

- Restart UDT and reload the plugin
- Check WebSocket connection in console
- Use `pnpm lib dev` instead of UDT's watch mode

### Type Errors

- Rebuild TypeScript types: `pnpm lib build`
- Check tsconfig.json settings
- Verify Adobe UXP types are installed

## Resources

- [Adobe UXP Documentation](https://developer.adobe.com/photoshop/uxp/)
- [VitePress Documentation](https://vitepress.dev/)
- [React Documentation](https://react.dev/)
- [Bolt UXP](https://github.com/hyperbrew/bolt-uxp)

## Getting Help

- [GitHub Issues](https://github.com/rmuraix/premianno/issues)
- [Contributing Guide](https://github.com/rmuraix/.github/blob/main/.github/CONTRIBUTING.md)
