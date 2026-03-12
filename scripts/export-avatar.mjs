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
const NODE_ID = '0:1370'; // Avatar/Ellipse node
const FIGMA_TOKEN = process.env.FIGMA_TOKEN;

async function exportAvatar() {
  console.log('🎨 Exporting avatar from Figma...\n');

  // Export as PNG (better for circles/gradients)
  const url = `https://api.figma.com/v1/images/${FIGMA_FILE_ID}?ids=${encodeURIComponent(NODE_ID)}&format=png&scale=2`;

  const response = await fetch(url, {
    headers: {
      'X-Figma-Token': FIGMA_TOKEN,
    },
  });

  const data = await response.json();
  const imageUrl = data.images[NODE_ID];

  if (!imageUrl) {
    throw new Error('No image URL');
  }

  console.log(`📥 Downloading avatar...\n`);

  const imageResponse = await fetch(imageUrl);
  const buffer = await imageResponse.arrayBuffer();

  const outputPath = join(__dirname, '..', 'public', 'images', 'workspace', 'avatar.png');
  writeFileSync(outputPath, Buffer.from(buffer));

  console.log(`✅ Saved: avatar.png (2x scale for Retina)`);
}

exportAvatar().catch(console.error);
