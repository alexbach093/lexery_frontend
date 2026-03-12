#!/usr/bin/env node

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env
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
const NODE_ID = '0:1296'; // 3D cube icon
const FIGMA_TOKEN = process.env.FIGMA_TOKEN;

if (!FIGMA_TOKEN) {
  console.error('❌ FIGMA_TOKEN not set');
  process.exit(1);
}

async function analyzeCubeStructure() {
  console.log('🔍 Analyzing 3D cube structure from Figma...\n');

  const url = `https://api.figma.com/v1/files/${FIGMA_FILE_ID}/nodes?ids=${encodeURIComponent(NODE_ID)}&depth=10`;

  const response = await fetch(url, {
    headers: {
      'X-Figma-Token': FIGMA_TOKEN,
    },
  });

  if (!response.ok) {
    throw new Error(`Figma API error: ${response.status}`);
  }

  const data = await response.json();
  const node = data.nodes[NODE_ID]?.document;

  if (!node) {
    throw new Error('Node not found');
  }

  console.log(`📦 Node: ${node.name} (${node.type})`);
  if (node.absoluteBoundingBox) {
    console.log(`📏 Size: ${node.absoluteBoundingBox.width}x${node.absoluteBoundingBox.height}\n`);
  }

  // Recursively extract all paths/shapes
  const allPaths = [];

  function extractPaths(node, depth = 0, parentName = '') {
    const indent = '  '.repeat(depth);

    if (node.type === 'VECTOR') {
      console.log(`${indent}🔸 VECTOR: ${node.name} (${node.id})`);

      if (node.absoluteBoundingBox) {
        const b = node.absoluteBoundingBox;
        console.log(`${indent}   Position: (${b.x.toFixed(1)}, ${b.y.toFixed(1)})`);
        console.log(`${indent}   Size: ${b.width.toFixed(1)}x${b.height.toFixed(1)}`);
      }

      if (node.strokes && node.strokes.length > 0) {
        const stroke = node.strokes[0];
        console.log(
          `${indent}   Stroke: ${JSON.stringify(stroke.color)} weight=${node.strokeWeight}`
        );
      }

      if (node.fills && node.fills.length > 0) {
        const fill = node.fills[0];
        console.log(`${indent}   Fill: ${JSON.stringify(fill.color)}`);
      }

      // Store path data
      const pathData = {
        id: node.id,
        name: node.name,
        parentName: parentName,
        bounds: node.absoluteBoundingBox,
        strokes: node.strokes,
        fills: node.fills,
        strokeWeight: node.strokeWeight,
        strokeCap: node.strokeCap,
        strokeJoin: node.strokeJoin,
        strokeMiterLimit: node.strokeMiterLimit,
        fillGeometry: node.fillGeometry,
        strokeGeometry: node.strokeGeometry,
      };
      allPaths.push(pathData);

      console.log('');
    }

    if (node.children) {
      console.log(`${indent}📁 ${node.type}: ${node.name} (${node.children.length} children)\n`);
      for (const child of node.children) {
        extractPaths(child, depth + 1, node.name);
      }
    }
  }

  extractPaths(node);

  console.log(`\n✅ Found ${allPaths.length} vector paths total\n`);

  // Save to JSON
  const output = {
    nodeInfo: {
      id: node.id,
      name: node.name,
      type: node.type,
      bounds: node.absoluteBoundingBox,
    },
    paths: allPaths,
    totalPaths: allPaths.length,
  };

  const outputPath = join(__dirname, '..', 'cube-structure.json');
  writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`💾 Saved structure to: cube-structure.json`);

  return output;
}

analyzeCubeStructure().catch(console.error);
