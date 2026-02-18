#!/usr/bin/env node

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const assets = {
  'vector-icon.png': 'https://www.figma.com/api/mcp/asset/e9956a3f-10ce-4f7b-9b8e-2e95e555f500',
  'frame-36698.png': 'https://www.figma.com/api/mcp/asset/6d46e75d-3417-4dda-956a-c246c61f8ddc',
  'main-button.png': 'https://www.figma.com/api/mcp/asset/d9fe2549-d2cd-4e01-9832-36f7b2ec143b',
  'settings-icon.png': 'https://www.figma.com/api/mcp/asset/76132054-fea6-4e02-ab94-7ac225ef1ffc',
  'error-icon.png': 'https://www.figma.com/api/mcp/asset/46dd57d8-44ae-4ab3-8396-9d07a0780294',
  'avatar.png': 'https://www.figma.com/api/mcp/asset/0f3e2299-e842-4026-86bf-08d02b75084d',
  'logo.png': 'https://www.figma.com/api/mcp/asset/d7cbdaa7-6e9d-4e67-a5a6-a77e208f2e3d',
  'search-icon.png': 'https://www.figma.com/api/mcp/asset/8d843296-5f56-431c-998a-450340019504',
  'new-chat-icon.png': 'https://www.figma.com/api/mcp/asset/4f612572-e13b-4739-82bb-8f14ecaba54c',
  'projects-icon.png': 'https://www.figma.com/api/mcp/asset/65ef8ffc-11d8-465c-97b7-02a57245b629',
  'history-icon.png': 'https://www.figma.com/api/mcp/asset/87ed74cf-44a5-4cf3-8408-ba32f5f71377',
  'divider-line.png': 'https://www.figma.com/api/mcp/asset/17e5d0b1-9ace-4713-b9d0-d0ffd6400151',
};

async function downloadAssets() {
  console.log('📥 Downloading workspace assets from Figma...\n');

  for (const [filename, url] of Object.entries(assets)) {
    try {
      console.log(`Downloading: ${filename}`);
      const response = await fetch(url);
      const buffer = await response.arrayBuffer();
      const outputPath = join(__dirname, '..', 'public', 'images', 'workspace', filename);
      writeFileSync(outputPath, Buffer.from(buffer));
      console.log(`✅ Saved: ${filename}\n`);
    } catch (error) {
      console.error(`❌ Failed: ${filename}`, error.message);
    }
  }

  console.log('✅ All assets downloaded!');
}

downloadAssets().catch(console.error);
