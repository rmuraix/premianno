# PremiAnno Documentation

This package contains the VitePress-based documentation for PremiAnno.

## Development

```bash
# Start development server
pnpm dev

# Build documentation
pnpm build

# Preview built documentation
pnpm preview
```

## Deployment

Documentation is automatically deployed to GitHub Pages when changes are pushed to the main branch via the `.github/workflows/docs.yml` workflow.

## Structure

- `.vitepress/config.ts` - VitePress configuration
- `index.md` - Home page
- `guide/` - User guides
- `api/` - API reference documentation

## Documentation Site

The documentation is available at: https://rmuraix.github.io/premianno/
