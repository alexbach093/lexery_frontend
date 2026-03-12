# Bootstrap Lexery Frontend

## Summary

Initial setup of the Lexery frontend repository with complete development infrastructure.

This PR establishes the foundation for the project **without implementing any product UI**. All screens and components will be imported from Figma via MCP in subsequent phases.

## What's Included

### ✅ Framework & Tooling

- **Next.js 16.1.6** with App Router
- **TypeScript 5.x** with strict mode
- **Tailwind CSS 4.x** for styling
- **pnpm 10.x** as package manager
- Node.js 22.x (specified in `.nvmrc`)

### ✅ Code Quality

- **ESLint** with Next.js recommended config + custom rules
- **Prettier** with Tailwind plugin for consistent formatting
- **Import sorting** and organization
- **TypeScript** strict type checking

### ✅ Git Workflow

- **Husky** for Git hooks automation
- **lint-staged** for pre-commit linting/formatting
- **commitlint** for conventional commit enforcement
- Pre-commit and commit-msg hooks configured

### ✅ UI Component System

- **shadcn/ui** initialized and ready
- `cn()` utility helper for class merging
- CSS variables for theming (light/dark)
- Component directory structure prepared

### ✅ CI/CD

- **GitHub Actions** workflow for:
  - ESLint checks
  - TypeScript type checking
  - Code formatting validation
  - Production build verification
- Runs on all PRs and pushes to main

### ✅ Deployment Ready

- **Dockerfile** with multi-stage build
- Optimized for Azure Container Apps / App Service
- Standalone output configuration
- `.dockerignore` for minimal image size

### ✅ Project Structure

```
lexery-frontend/
├── .github/workflows/    # CI/CD pipelines
├── docs/                 # Documentation (BOOTSTRAP.md)
├── src/
│   ├── app/              # Next.js pages & layouts
│   ├── components/       # React components (ready for Figma import)
│   ├── lib/              # Utilities (cn, env helpers)
│   ├── types/            # TypeScript definitions
│   └── styles/           # Additional styles
├── .husky/               # Git hooks
├── .vscode/              # Editor configuration
├── Dockerfile            # Production container
└── components.json       # shadcn/ui config
```

## Development Commands

```bash
# Install dependencies
pnpm install

# Development server
pnpm dev

# Production build
pnpm build

# Code quality
pnpm lint
pnpm lint:fix
pnpm format
pnpm format:check
pnpm typecheck
```

## Validation ✅

All checks passing:

- ✅ `pnpm lint` - No ESLint errors
- ✅ `pnpm typecheck` - No TypeScript errors
- ✅ `pnpm format:check` - Code properly formatted
- ✅ `pnpm build` - Production build successful
- ✅ Git hooks working correctly
- ✅ No secrets or .env files committed

## What's NOT Included (By Design)

❌ **No product UI components** - Will be imported from Figma
❌ **No page implementations** - Design-driven development
❌ **No API integrations** - Backend is separate
❌ **No state management** - Will be added when needed
❌ **No arbitrary design decisions** - Everything from Figma

## Next Steps

1. **Merge this PR** to establish the base
2. **Configure Figma MCP integration** for component generation
3. **Import design system** (colors, typography, spacing)
4. **Generate pages 1:1** from Figma Dev Mode
5. **Implement features** according to product roadmap

## Testing

```bash
# Clone and test locally
git checkout chore/bootstrap-frontend
pnpm install
pnpm dev          # Should start on http://localhost:3000
pnpm build        # Should build successfully
pnpm lint         # Should pass with no errors
```

## Commit Convention

All commits follow [Conventional Commits](https://www.conventionalcommits.org/):

- `chore`: Infrastructure and tooling
- `feat`: New features (none yet)
- `fix`: Bug fixes
- `docs`: Documentation changes
- `ci`: CI/CD changes

This will be enforced for all future commits via commitlint.

## Documentation

See [`docs/BOOTSTRAP.md`](./docs/BOOTSTRAP.md) for detailed setup documentation.

---

**Ready to merge** ✅  
No breaking changes • No migrations needed • CI passing
