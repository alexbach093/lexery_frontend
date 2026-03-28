#!/usr/bin/env node
/**
 * Export file type icons from Figma File-Type-Icon-Pack.
 * Node 238:989 — Frame with 4 Icon Frame components (document + icon inside).
 * https://www.figma.com/design/kixyyvh1oxb0VVE8NwOkjg/File-Type-Icon-Pack--Community-?node-id=238-989
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadEnv() {
  const envPath = join(__dirname, '..', '.env');
  if (!existsSync(envPath)) return;
  const envContent = readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eq = trimmed.indexOf('=');
      if (eq > 0) process.env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
    }
  }
}

loadEnv();

const FIGMA_FILE_ID = 'kixyyvh1oxb0VVE8NwOkjg';
const FIGMA_TOKEN = process.env.FIGMA_TOKEN;

/** Icon Frame nodes from 238:989 — left to right: audio, document, image, video */
const ICON_NODE_IDS = ['238:1034', '238:1056', '238:1049', '238:1043'];
const ICON_SLUGS = ['audio', 'document', 'image', 'video'];

async function exportSvgs() {
  const nodeIds = ICON_NODE_IDS.join(',');
  const url = `https://api.figma.com/v1/images/${FIGMA_FILE_ID}?ids=${encodeURIComponent(nodeIds)}&format=svg`;
  const response = await fetch(url, {
    headers: { 'X-Figma-Token': FIGMA_TOKEN },
  });
  if (!response.ok)
    throw new Error(`Figma images API: ${response.status} ${await response.text()}`);
  return response.json();
}

async function main() {
  if (!FIGMA_TOKEN) {
    console.error('❌ FIGMA_TOKEN not set in .env');
    process.exit(1);
  }

  console.log('📥 Exporting file type icons from Figma (node 238:989)...\n');

  const data = await exportSvgs();
  const outDir = join(__dirname, '..', 'public', 'images', 'file-types');
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  for (let i = 0; i < ICON_NODE_IDS.length; i++) {
    const nodeId = ICON_NODE_IDS[i];
    const slug = ICON_SLUGS[i];
    const svgUrl = data.images?.[nodeId];
    if (!svgUrl) {
      console.warn(`⚠️ No SVG for ${slug} (${nodeId})`);
      continue;
    }
    const res = await fetch(svgUrl);
    const svgContent = await res.text();
    const path = join(outDir, `${slug}.svg`);
    writeFileSync(path, svgContent);
    console.log(`✅ ${slug}.svg`);
  }

  console.log('\n✅ File type icons exported to public/images/file-types/');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
