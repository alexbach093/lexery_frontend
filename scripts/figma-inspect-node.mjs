#!/usr/bin/env node
/* eslint-disable no-console */
/** Fetch a Figma node and print structure (for implementing design). */
import { readFileSync, existsSync } from 'fs';
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
const NODE_ID = process.argv[2] || '122:303'; // node-id=122-303 -> 122:303
const FIGMA_TOKEN = process.env.FIGMA_TOKEN;

async function main() {
  if (!FIGMA_TOKEN) {
    console.error('FIGMA_TOKEN not set in .env');
    process.exit(1);
  }
  const url = `https://api.figma.com/v1/files/${FIGMA_FILE_ID}/nodes?ids=${encodeURIComponent(NODE_ID)}&depth=5`;
  const res = await fetch(url, { headers: { 'X-Figma-Token': FIGMA_TOKEN } });
  if (!res.ok) {
    console.error(res.status, await res.text());
    process.exit(1);
  }
  const data = await res.json();
  const doc = data.nodes?.[NODE_ID]?.document;
  if (!doc) {
    console.error('Node not found:', NODE_ID);
    process.exit(1);
  }
  console.log(JSON.stringify({ id: doc.id, name: doc.name, type: doc.type, ...doc }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
