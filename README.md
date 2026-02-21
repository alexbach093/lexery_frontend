# Lexery Frontend

Frontend application for Lexery - Legal AI platform.

## Prerequisites

- Node.js >= 22.x (see `.nvmrc`)
- pnpm (via corepack)

## Quick Start

```bash
# Enable pnpm (if not already enabled)
corepack enable

# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

```bash
# Development
pnpm dev              # Start dev server with hot reload

# Production
pnpm build            # Build for production
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint issues
pnpm typecheck        # Run TypeScript type checking
pnpm format           # Format code with Prettier
pnpm format:check     # Check code formatting

# Figma Design Extraction
npm run figma:extract    # Extract design data from Figma
npm run figma:generate   # Generate React component from extracted data
npm run figma:build      # Extract + Generate in one command
```

### 🎨 Figma to React Workflow

This project includes tools to extract designs from Figma and automatically generate React components:

```bash
# 1. Set up your Figma token in .env
FIGMA_TOKEN=figd_your_token_here

# 2. Extract and generate component
npm run figma:build

# 3. Use the component
import { BootScreen } from '@/components/BootScreen';
```

**Documentation:**
- 📚 [Figma Extraction Guide](./FIGMA_EXTRACTION_GUIDE.md) - Quick start
- 🚀 [Complete Summary](./FIGMA_TO_REACT_SUMMARY.md) - Full workflow details
- ⚡ [Quick Reference](./QUICK_REFERENCE.md) - Commands and examples
- 📖 [Implementation Guide](./docs/boot-screen-implementation.md) - Detailed usage

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (to be initialized)
- **Package Manager**: pnpm 10.x
- **Code Quality**: ESLint, Prettier, Husky (to be configured)
- **CI/CD**: GitHub Actions
- **Deployment**: Azure-ready (Docker)

## Project Structure

```
lexery-frontend/
├── .github/          # GitHub workflows and templates
├── docs/             # Project documentation
├── public/           # Static assets
├── scripts/          # Build and utility scripts
│   ├── extract-figma-design.mjs    # Figma API extraction
│   └── generate-boot-screen.mjs    # Component generator
├── src/
│   ├── app/          # Next.js App Router pages & layouts
│   ├── components/   # React components
│   │   └── BootScreen.tsx          # Boot screen component
│   ├── lib/          # Utilities and helpers
│   ├── styles/       # Global styles
│   └── types/        # TypeScript type definitions
├── .editorconfig     # Editor configuration
├── .env.example      # Environment variables template
├── .nvmrc            # Node version
├── figma-extraction-report.json    # Generated design data
└── package.json      # Dependencies and scripts
```

## Development Workflow

This repository follows a structured development process:

1. **No arbitrary UI implementation** - All components will be imported from Figma Dev Mode
2. **Git workflow** - Feature branches → PR → Review → Merge
3. **Conventional commits** - Follow commit message conventions (enforced by commitlint)
4. **Pre-commit hooks** - Automated linting and formatting
5. **CI validation** - All PRs must pass lint, typecheck, and build

### Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/). Format: `type(scope): subject`

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system changes
- `ci`: CI/CD changes
- `chore`: Other changes (dependencies, configs)

**Examples:**

```bash
feat(auth): add login form validation
fix(ui): correct button alignment on mobile
docs: update deployment instructions
chore: upgrade next.js to v16
```

Commits are validated automatically via git hooks.

## Documentation

- [Bootstrap Process](./docs/BOOTSTRAP.md) - Detailed setup documentation

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

See `.env.example` for available variables.

## Deployment

### Docker (Local Testing)

```bash
# Build image
docker build -t lexery-frontend .

# Run container
docker run -p 3000:3000 lexery-frontend

# Test
curl http://localhost:3000
```

### Azure Container Apps / App Service

The application is ready for Azure deployment with Docker:

**Prerequisites:**

- Azure Container Registry (ACR) or Docker Hub
- Azure Container Apps or App Service with container support

**Deployment Steps:**

1. Build and push image:

```bash
# Login to ACR
az acr login --name <your-acr-name>

# Build and tag
docker build -t <your-acr-name>.azurecr.io/lexery-frontend:latest .

# Push
docker push <your-acr-name>.azurecr.io/lexery-frontend:latest
```

2. Deploy to Azure Container Apps:

```bash
az containerapp create \
  --name lexery-frontend \
  --resource-group <resource-group> \
  --image <your-acr-name>.azurecr.io/lexery-frontend:latest \
  --target-port 3000 \
  --ingress external \
  --environment <environment-name>
```

3. Set environment variables in Azure Portal or CLI:

```bash
az containerapp update \
  --name lexery-frontend \
  --resource-group <resource-group> \
  --set-env-vars \
    NEXT_PUBLIC_API_BASE_URL=<api-url> \
    NEXT_PUBLIC_APP_ENV=production
```

**CI/CD Integration:**
GitHub Actions workflow template for automated deployment can be added to `.github/workflows/deploy.yml` (requires Azure credentials as secrets).

## Contributing

1. Create a feature branch from `main`
2. Make your changes following code style guidelines
3. Ensure all checks pass (`lint`, `typecheck`, `build`)
4. Submit a PR using the provided template

## License

MIT - See [LICENSE](./LICENSE) file for details
