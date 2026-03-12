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
const NODE_ID = '0:1296'; // 3D cube group
const FIGMA_TOKEN = process.env.FIGMA_TOKEN;

async function exportCubeSvg() {
  console.log('🎨 Exporting SVG from Figma...\n');

  // Export as SVG
  const url = `https://api.figma.com/v1/images/${FIGMA_FILE_ID}?ids=${encodeURIComponent(NODE_ID)}&format=svg`;

  const response = await fetch(url, {
    headers: {
      'X-Figma-Token': FIGMA_TOKEN,
    },
  });

  if (!response.ok) {
    throw new Error(`Figma API error: ${response.status}`);
  }

  const data = await response.json();
  const svgUrl = data.images[NODE_ID];

  if (!svgUrl) {
    throw new Error('No SVG URL returned');
  }

  console.log(`📥 Downloading SVG from: ${svgUrl}\n`);

  // Download SVG
  const svgResponse = await fetch(svgUrl);
  const svgContent = await svgResponse.text();

  // Save SVG
  const outputPath = join(__dirname, '..', 'public', 'cube-full.svg');
  writeFileSync(outputPath, svgContent);

  console.log(`✅ Saved to: public/cube-full.svg`);
  console.log(`\n📊 SVG Preview (first 1000 chars):`);
  console.log(svgContent.substring(0, 1000));
  console.log('\n...\n');

  // Count paths
  const pathMatches = svgContent.match(/<path/g);
  const pathCount = pathMatches ? pathMatches.length : 0;
  console.log(`🔍 Found ${pathCount} <path> elements in SVG`);

  return svgContent;
}

exportCubeSvg().catch(console.error);
