# Lexery Frontend

Frontend application for Lexery - Legal AI platform.

## Prerequisites

- Node.js >= 22.x (currently tested with 24.x)
- pnpm (via corepack)

## Quick Start

```bash
# Enable pnpm
corepack enable

# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Run linter
pnpm lint

# Format code
pnpm format

# Type checking
pnpm typecheck
```

## Development

This repository is bootstrapped and ready for component development. The actual UI implementation will be migrated from Figma using Dev Mode → MCP pipeline.

## Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Package Manager**: pnpm
- **Code Quality**: ESLint, Prettier, Husky
- **CI/CD**: GitHub Actions
- **Deployment**: Azure-ready (Docker)

## Project Structure

```
src/
├── app/          # Next.js App Router pages
├── components/   # React components
├── lib/          # Utilities and helpers
├── styles/       # Global styles
└── types/        # TypeScript type definitions
```

## Documentation

- [Bootstrap Process](./docs/BOOTSTRAP.md)

## License

MIT
