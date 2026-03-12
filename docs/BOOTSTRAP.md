# Bootstrap Documentation

## Overview

This document describes the initial setup and configuration of the Lexery frontend project.

## Initial Setup Process

### 1. Repository Initialization

- Created base Git repository structure
- Added `.gitignore`, `.editorconfig`, `.gitattributes`
- Set up GitHub PR template

### 2. Next.js Project Setup

- Framework: Next.js 16.1.6 with App Router
- TypeScript 5.x for type safety
- Tailwind CSS 4.x for styling
- Package manager: pnpm 10.x
- Node version: 22.x (specified in `.nvmrc`)

### 3. Code Quality Tools

- **ESLint**: Configured with Next.js recommended rules
- **Prettier**: Code formatting with Tailwind plugin
- **TypeScript**: Strict type checking enabled
- **Import sorting**: Automatic organization of imports

### 4. Git Hooks & Commit Standards

- **Husky**: Git hooks automation
- **lint-staged**: Pre-commit linting and formatting
- **commitlint**: Conventional commits enforcement

### 5. UI Component System

- **shadcn/ui**: Initialized for component generation
- **Utilities**: `cn()` helper for class merging
- **Design tokens**: CSS variables for theming

## Project Structure

\`\`\`
lexery-frontend/
├── .github/ # GitHub configuration
│ └── workflows/ # CI/CD pipelines
├── docs/ # Documentation
├── public/ # Static assets
├── src/
│ ├── app/ # Next.js App Router
│ │ ├── layout.tsx # Root layout
│ │ ├── page.tsx # Home page
│ │ └── globals.css # Global styles
│ ├── components/ # React components
│ │ └── ui/ # shadcn/ui components
│ ├── lib/ # Utilities
│ │ └── utils.ts # Helper functions
│ ├── types/ # TypeScript definitions
│ ├── styles/ # Additional styles
│ └── assets/ # Local assets
├── .husky/ # Git hooks
├── .vscode/ # VS Code settings
├── components.json # shadcn/ui config
├── .nvmrc # Node version
└── package.json # Dependencies
\`\`\`

## Available Scripts

\`\`\`bash

# Development

pnpm dev # Start dev server
pnpm build # Production build
pnpm start # Start production server

# Code Quality

pnpm lint # Run ESLint
pnpm lint:fix # Fix ESLint issues
pnpm format # Format with Prettier
pnpm format:check # Check formatting
pnpm typecheck # TypeScript check
pnpm check # Run all checks

# Git

pnpm prepare # Install husky hooks
\`\`\`

## Development Workflow

### 1. Creating a Feature Branch

\`\`\`bash
git checkout -b feat/your-feature-name
\`\`\`

### 2. Making Changes

- Write code following project conventions
- Pre-commit hooks will automatically:
  - Format code with Prettier
  - Lint code with ESLint
  - Fix auto-fixable issues

### 3. Committing Changes

Use conventional commit format:
\`\`\`bash
git commit -m "feat: add user authentication"
git commit -m "fix: correct button alignment"
git commit -m "docs: update README"
\`\`\`

Commit types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style
- `refactor`: Code refactoring
- `perf`: Performance
- `test`: Tests
- `build`: Build system
- `ci`: CI/CD
- `chore`: Maintenance

### 4. Creating Pull Request

- Push branch to GitHub
- Create PR using template
- Wait for CI checks to pass
- Request review

## CI/CD Pipeline

GitHub Actions workflow runs on every PR and push to main:

1. **Checkout**: Clone repository
2. **Setup**: Install Node.js and dependencies
3. **Lint**: Run ESLint
4. **Type Check**: Run TypeScript compiler
5. **Build**: Create production build

All checks must pass before merging.

## Next Steps

### Figma → Code Migration

The next phase will import UI components from Figma using:

- Figma Dev Mode API
- MCP (Model Context Protocol) integration
- 1:1 design → code translation

**Important**: Do not create arbitrary UI components. All screens and components will be generated from Figma design files.

### Environment Configuration

Copy `.env.example` to `.env.local` and configure:
\`\`\`bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
NEXT_PUBLIC_APP_ENV=development
\`\`\`

### Adding shadcn Components

When needed (after Figma import):
\`\`\`bash
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add card

# etc.

\`\`\`

## Troubleshooting

### pnpm not found

\`\`\`bash
corepack enable
corepack prepare pnpm@latest --activate
\`\`\`

### Git hooks not running

\`\`\`bash
pnpm prepare
chmod +x .husky/pre-commit .husky/commit-msg
\`\`\`

### Build errors

\`\`\`bash

# Clean and reinstall

rm -rf .next node_modules pnpm-lock.yaml
pnpm install
pnpm build
\`\`\`

## Dependencies

### Core

- next: ^16.1.6
- react: ^19.2.3
- react-dom: ^19.2.3

### Styling

- tailwindcss: ^4
- clsx: ^2.1.1
- tailwind-merge: ^3.4.1
- class-variance-authority: ^0.7.1

### Development

- typescript: ^5
- eslint: ^9
- prettier: ^3.8.1
- husky: ^9.1.7
- lint-staged: ^16.2.7
- commitlint: ^20.4.1

## References

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS v4](https://tailwindcss.com/docs/v4-beta)
- [shadcn/ui](https://ui.shadcn.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [pnpm Documentation](https://pnpm.io/)
