#!/usr/bin/env node
/* eslint-disable no-console */
/** Export edit (pencil) icon from Figma node 124:316 — second child = pencil. */
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = join(__dirname, '..', '.env');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
    const t = line.trim();
    if (t && !t.startsWith('#')) {
      const eq = t.indexOf('=');
      if (eq > 0) process.env[t.slice(0, eq).trim()] = t.slice(eq + 1).trim();
    }
  }
}
loadEnv();

const FIGMA_FILE_ID = 'IO0sKndZpfYlW5OVXoIpuC';
const FRAME_NODE_ID = '124:316';
const PENCIL_CHILD_INDEX = 1;
const FIGMA_TOKEN = process.env.FIGMA_TOKEN;

async function main() {
  if (!FIGMA_TOKEN) {
    console.error('FIGMA_TOKEN not set in .env');
    process.exit(1);
  }
  const url = `https://api.figma.com/v1/files/${FIGMA_FILE_ID}/nodes?ids=${encodeURIComponent(FRAME_NODE_ID)}&depth=2`;
  const res = await fetch(url, { headers: { 'X-Figma-Token': FIGMA_TOKEN } });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  const root = data.nodes?.[FRAME_NODE_ID]?.document;
  if (!root?.children?.[PENCIL_CHILD_INDEX]) {
    console.error('Node or pencil child not found');
    process.exit(1);
  }
  const pencilId = root.children[PENCIL_CHILD_INDEX].id;
  const imgUrl = `https://api.figma.com/v1/images/${FIGMA_FILE_ID}?ids=${encodeURIComponent(pencilId)}&format=svg`;
  const imgRes = await fetch(imgUrl, { headers: { 'X-Figma-Token': FIGMA_TOKEN } });
  if (!imgRes.ok) throw new Error(await imgRes.text());
  const imgData = await imgRes.json();
  const svgUrl = imgData.images?.[pencilId];
  if (!svgUrl) {
    console.error('No SVG URL for pencil');
    process.exit(1);
  }
  const svgRes = await fetch(svgUrl);
  const svgContent = await svgRes.text();
  const outDir = join(__dirname, '..', 'public', 'images', 'chat');
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, 'edit.svg');
  writeFileSync(outPath, svgContent);
  console.log('Written', outPath);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
