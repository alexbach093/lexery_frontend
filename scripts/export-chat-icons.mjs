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

// Frame 36733 (122:303) children: Group 38, Group 40, Group (thumbs down), Group 39
const chatIconNodes = {
  copy: '122:304',
  'thumbs-up': '122:307',
  'thumbs-down': '122:310',
  refresh: '122:313',
};

async function exportChatIcons() {
  console.log('🎨 Exporting chat icons from Figma (node 122:303)...\n');

  const nodeIds = Object.values(chatIconNodes).join(',');
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
  const outDir = join(__dirname, '..', 'public', 'images', 'chat');

  console.log('📥 Downloading SVGs...\n');

  for (const [name, nodeId] of Object.entries(chatIconNodes)) {
    const svgUrl = data.images[nodeId];

    if (!svgUrl) {
      console.log(`⚠️  No SVG for ${name} (${nodeId})`);
      continue;
    }

    console.log(`Downloading: ${name}.svg`);
    const svgResponse = await fetch(svgUrl);
    const svgContent = await svgResponse.text();

    const outputPath = join(outDir, `${name}.svg`);
    writeFileSync(outputPath, svgContent);
    console.log(`✅ Saved: images/chat/${name}.svg\n`);
  }

  console.log('✅ All 4 chat icons exported!');
}

exportChatIcons().catch(console.error);
