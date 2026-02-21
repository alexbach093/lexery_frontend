#!/usr/bin/env node

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadEnv() {
  const envPath = join(__dirname, '..', '.env');
  if (!existsSync(envPath)) return;
  const envContent = readFileSync(envPath, 'utf-8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim();
      }
    }
  }
}

loadEnv();

const FIGMA_FILE_ID = 'IO0sKndZpfYlW5OVXoIpuC';
const FIGMA_TOKEN = process.env.FIGMA_TOKEN;

// Node IDs for icons to export
const iconNodes = {
  logo: '0:1376', // Logo icon
  search: '0:1390', // Search icon
  'new-chat': '0:1395', // New chat icon
  projects: '0:1401', // Projects icon
  history: '0:1409', // History arrow icon
  settings: '0:1361', // Settings icon
  error: '0:1366', // Error icon
  tips: '0:1337', // Tips/Поради icon
  'send-button': '0:1355', // Main send button
  attachments: '0:1347', // Attachment icons
};

async function exportSVGs() {
  console.log('🎨 Exporting SVGs from Figma...\n');

  const nodeIds = Object.values(iconNodes).join(',');
  const url = `https://api.figma.com/v1/images/${FIGMA_FILE_ID}?ids=${encodeURIComponent(nodeIds)}&format=svg`;

  const response = await fetch(url, {
    headers: {
      'X-Figma-Token': FIGMA_TOKEN,
    },
  });

  if (!response.ok) {
    throw new Error(`Figma API error: ${response.status}`);
  }

  const data = await response.json();

  console.log('📥 Downloading SVGs...\n');

  for (const [name, nodeId] of Object.entries(iconNodes)) {
    const svgUrl = data.images[nodeId];

    if (!svgUrl) {
      console.log(`⚠️  No SVG for ${name} (${nodeId})`);
      continue;
    }

    console.log(`Downloading: ${name}.svg`);
    const svgResponse = await fetch(svgUrl);
    const svgContent = await svgResponse.text();

    const outputPath = join(__dirname, '..', 'public', 'images', 'workspace', `${name}.svg`);
    writeFileSync(outputPath, svgContent);
    console.log(`✅ Saved: ${name}.svg\n`);
  }

  console.log('✅ All SVGs exported!');
}

exportSVGs().catch(console.error);
