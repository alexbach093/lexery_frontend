# Figma scripts

This directory contains local scripts used to extract design data from Figma and keep related frontend assets in sync.

## Prerequisites

1. Copy the env template:

   ```bash
   cp .env.example .env
   ```

2. Add `FIGMA_TOKEN` to `.env`.

3. Install dependencies:

   ```bash
   corepack enable
   corepack pnpm install
   ```

## Main commands

```bash
corepack pnpm run figma:extract
corepack pnpm run figma:generate
corepack pnpm run figma:build
```

## Output paths

- Extraction report: `docs/artifacts/figma-extraction-report.json`
- Generated boot screen component: `src/components/ui/BootScreen.tsx`
- Avatar export: `public/images/avatar.png`
- Shape analysis artifacts:
  - `docs/artifacts/cube-structure.json`
  - `docs/artifacts/logo-structure.json`

## Script notes

- `extract-figma-design.mjs` pulls the configured Figma node and writes the extraction report.
- `generate-boot-screen.mjs` reads the extraction report and overwrites `src/components/ui/BootScreen.tsx`.
- `export-avatar.mjs` exports the profile avatar to the canonical runtime path.
- Analysis scripts write JSON artifacts under `docs/artifacts/` instead of the repo root.

## Troubleshooting

- `FIGMA_TOKEN environment variable not set`
  Add `FIGMA_TOKEN=...` to `.env`.
- `Figma API error: 403`
  Verify the token is valid and has access to the target file.
- Missing extraction report
  Run `corepack pnpm run figma:extract` before `corepack pnpm run figma:generate`.
