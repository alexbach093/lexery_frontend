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
const NODE_ID = '28:190'; // Logo node
const FIGMA_TOKEN = process.env.FIGMA_TOKEN;

if (!FIGMA_TOKEN) {
  console.error('❌ FIGMA_TOKEN not set');
  process.exit(1);
}

async function analyzeLogoStructure() {
  console.log('🔍 Analyzing logo structure from Figma...\n');

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
  console.log(`📏 Size: ${node.absoluteBoundingBox?.width}x${node.absoluteBoundingBox?.height}\n`);

  // Recursively extract all shapes
  function extractShapes(node, depth = 0) {
    const indent = '  '.repeat(depth);
    const shapes = [];

    if (node.type === 'VECTOR' || node.type === 'RECTANGLE' || node.type === 'ELLIPSE') {
      const shape = {
        id: node.id,
        name: node.name,
        type: node.type,
        bounds: node.absoluteBoundingBox,
        fills: node.fills,
        strokes: node.strokes,
        strokeWeight: node.strokeWeight,
        vectorPaths: node.fillGeometry || node.strokeGeometry,
      };
      shapes.push(shape);
      console.log(`${indent}🔸 ${node.type}: ${node.name} (${node.id})`);

      if (node.absoluteBoundingBox) {
        const b = node.absoluteBoundingBox;
        console.log(`${indent}   Position: (${b.x.toFixed(1)}, ${b.y.toFixed(1)})`);
        console.log(`${indent}   Size: ${b.width.toFixed(1)}x${b.height.toFixed(1)}`);
      }

      if (node.strokes && node.strokes.length > 0) {
        console.log(`${indent}   Stroke: yes`);
      }
      if (node.fills && node.fills.length > 0) {
        console.log(`${indent}   Fill: yes`);
      }
      console.log('');
    }

    if (node.children) {
      console.log(`${indent}📁 ${node.type}: ${node.name} (${node.children.length} children)`);
      for (const child of node.children) {
        shapes.push(...extractShapes(child, depth + 1));
      }
    }

    return shapes;
  }

  const allShapes = extractShapes(node);

  console.log(`\n✅ Found ${allShapes.length} shapes total\n`);

  // Save to JSON
  const output = {
    nodeInfo: {
      id: node.id,
      name: node.name,
      type: node.type,
      bounds: node.absoluteBoundingBox,
    },
    shapes: allShapes,
    totalShapes: allShapes.length,
  };

  const outputPath = join(__dirname, '..', 'logo-structure.json');
  writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`💾 Saved structure to: logo-structure.json`);

  return output;
}

analyzeLogoStructure().catch(console.error);
