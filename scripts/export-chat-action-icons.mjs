#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Export chat action icons from Figma — from Frame 36733 inside node 0:1912.
 * Figma: https://www.figma.com/design/IO0sKndZpfYlW5OVXoIpuC/Untitled?node-id=0-1912&m=dev
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

const FIGMA_FILE_ID = 'IO0sKndZpfYlW5OVXoIpuC';
const CHAT_ACTIONS_NODE_ID = '0:1912'; // node-id=0-1912 from Figma URL
const FIGMA_TOKEN = process.env.FIGMA_TOKEN;

const ICON_NAMES = ['copy', 'thumbs-up', 'thumbs-down', 'refresh'];

async function getNodeStructure() {
  const url = `https://api.figma.com/v1/files/${FIGMA_FILE_ID}/nodes?ids=${encodeURIComponent(CHAT_ACTIONS_NODE_ID)}&depth=10`;
  const response = await fetch(url, {
    headers: { 'X-Figma-Token': FIGMA_TOKEN },
  });
  if (!response.ok) throw new Error(`Figma nodes API: ${response.status} ${await response.text()}`);
  return response.json();
}

/** Find first node whose name includes the given string (e.g. "36733"). */
function findNodeByName(node, nameSubstring) {
  if (!node) return null;
  if (node.name && String(node.name).includes(nameSubstring)) return node;
  if (node.children) {
    for (const child of node.children) {
      const found = findNodeByName(child, nameSubstring);
      if (found) return found;
    }
  }
  return null;
}

/** Get direct children of the frame that are GROUP or FRAME (one per icon). Order = left-to-right in design. */
function getIconGroupNodes(frameNode) {
  if (!frameNode?.children) return [];
  return frameNode.children
    .filter(
      (c) =>
        c.type === 'GROUP' || c.type === 'FRAME' || c.type === 'COMPONENT' || c.type === 'INSTANCE'
    )
    .map((c) => ({ id: c.id, name: c.name }));
}

async function exportSvgs(nodeIds) {
  const ids = nodeIds.map((n) => n.id).join(',');
  const url = `https://api.figma.com/v1/images/${FIGMA_FILE_ID}?ids=${encodeURIComponent(ids)}&format=svg`;
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

  console.log('📥 Fetching chat action icons from Figma (node 0:1912, Frame 36733)...\n');

  const data = await getNodeStructure();
  const root = data.nodes?.[CHAT_ACTIONS_NODE_ID]?.document;
  if (!root) {
    console.error('❌ Node 0:1912 not found. Check the Figma link and node-id.');
    process.exit(1);
  }

  const frame36733 = findNodeByName(root, '36733');
  if (!frame36733) {
    console.error(
      '❌ Frame 36733 not found under node 0:1912. Check that the frame name contains "36733" in Figma.'
    );
    process.exit(1);
  }
  console.log('📋 Using frame:', frame36733.name, `(${frame36733.type})\n`);

  const iconNodes = getIconGroupNodes(frame36733);
  const toExport = iconNodes.slice(0, 4);
  if (toExport.length === 0) {
    console.error('❌ No GROUP/FRAME children found inside Frame 36733.');
    process.exit(1);
  }
  if (toExport.length < 4) {
    console.log(
      '📋 Icon groups in frame:',
      iconNodes.length,
      iconNodes.map((n) => n.name)
    );
    console.warn('⚠️ Expected 4 icons. Exporting', toExport.length, 'groups.');
  }

  const names = ICON_NAMES.slice(0, toExport.length);
  const images = await exportSvgs(toExport);

  const outDir = join(__dirname, '..', 'public', 'images', 'chat');
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  for (let i = 0; i < toExport.length; i++) {
    const nodeId = toExport[i].id;
    const svgUrl = images.images?.[nodeId];
    const name = names[i];
    if (!svgUrl) {
      console.warn(`⚠️ No SVG URL for ${name} (${nodeId})`);
      continue;
    }
    const res = await fetch(svgUrl);
    const svgContent = await res.text();
    const path = join(outDir, `${name}.svg`);
    writeFileSync(path, svgContent);
    console.log(`✅ ${name}.svg`);
  }

  console.log('\n✅ Chat action icons exported to public/images/chat/');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
