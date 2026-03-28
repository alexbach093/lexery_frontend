# Lexery

Frontend repository for the Lexery workspace experience, built with Next.js 16, React 19, and TypeScript.

## Prerequisites

- Node.js 22 or newer
- Corepack-enabled `pnpm`

## Quick start

```bash
corepack enable
corepack pnpm install
cp .env.example .env
corepack pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

The frontend repo currently uses:

- `OPENROUTER_API_KEY` for the built-in Next.js server routes in this repository
- `FIGMA_TOKEN` for optional Figma extraction scripts

`.env.example` is documentation-only. Copy it to `.env` when you want the app runtime and local scripts to share the same values.

## Scripts

```bash
corepack pnpm dev
corepack pnpm build
corepack pnpm start

corepack pnpm typecheck
corepack pnpm lint
corepack pnpm format:check
corepack pnpm check

corepack pnpm run figma:extract
corepack pnpm run figma:generate
corepack pnpm run figma:build
```

## Figma workflow

The repository includes Figma extraction helpers for the boot screen flow.

- Extraction report: `docs/artifacts/figma-extraction-report.json`
- Generated component target: `src/components/ui/BootScreen.tsx`
- Script reference: [scripts/README.md](./scripts/README.md)

Additional docs:

- [Start Here](./docs/START_HERE.md)
- [Figma Extraction Guide](./docs/FIGMA_EXTRACTION_GUIDE.md)
- [Figma to React Summary](./docs/FIGMA_TO_REACT_SUMMARY.md)
- [Quick Reference](./docs/QUICK_REFERENCE.md)
- [Boot Screen Implementation Guide](./docs/boot-screen-implementation.md)

## Project structure

```text
lexery/
├── docs/
│   ├── artifacts/      # Generated design artifacts kept in-repo
│   └── *.md            # Project and Figma workflow docs
├── public/             # Static assets
├── scripts/            # Local developer scripts
├── src/
│   ├── app/            # App Router routes and layouts
│   ├── components/     # UI and feature components
│   ├── contexts/       # Client-side React contexts
│   ├── lib/            # Utilities and repositories
│   ├── workspace-chat/ # Workspace chat hooks and helpers
│   └── types/          # Shared TypeScript types
├── .env.example
├── Dockerfile
└── package.json
```

## Quality gates

Before transfer, use the same local checks the repo expects:

```bash
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm format:check
corepack pnpm build
```

## Docker

```bash
docker build -t lexery .
docker run -p 3000:3000 lexery
```
