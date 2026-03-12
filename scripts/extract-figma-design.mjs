#!/usr/bin/env node

/**
 * Figma Design Extractor (ES Module version)
 * Extracts design information from a Figma node
 */

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Simple .env parser
function loadEnv() {
  const envPath = join(__dirname, '..', '.env');
  if (!existsSync(envPath)) {
    return;
  }

  const envContent = readFileSync(envPath, 'utf-8');
  const lines = envContent.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        process.env[key.trim()] = value;
      }
    }
  }
}

// Load environment variables
loadEnv();

const FIGMA_FILE_ID = 'IO0sKndZpfYlW5OVXoIpuC';
const NODE_ID = process.env.FIGMA_NODE_ID || '0:1283'; // Figma uses : not - in node IDs
const FIGMA_TOKEN = process.env.FIGMA_TOKEN;

if (!FIGMA_TOKEN) {
  console.error('❌ Error: FIGMA_TOKEN environment variable not set');
  console.log('Please add FIGMA_TOKEN to your .env file');
  console.log('Get your token from: https://www.figma.com/developers/api#access-tokens');
  process.exit(1);
}

async function fetchFigmaFile() {
  const url = `https://api.figma.com/v1/files/${FIGMA_FILE_ID}`;

  const response = await fetch(url, {
    headers: {
      'X-Figma-Token': FIGMA_TOKEN,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Figma API error: ${response.status} ${response.statusText}\n${errorText}`);
  }

  return await response.json();
}

async function fetchFigmaImages(nodeIds) {
  const url = `https://api.figma.com/v1/images/${FIGMA_FILE_ID}?ids=${nodeIds.join(',')}&format=png&scale=2`;

  const response = await fetch(url, {
    headers: {
      'X-Figma-Token': FIGMA_TOKEN,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Figma Images API error: ${response.status} ${response.statusText}\n${errorText}`
    );
  }

  return await response.json();
}

function getNodeById(fileData, nodeId) {
  function traverse(node) {
    if (node.id === nodeId) {
      return node;
    }
    if (node.children) {
      for (const child of node.children) {
        const found = traverse(child);
        if (found) return found;
      }
    }
    return null;
  }

  return traverse(fileData.document);
}

function rgbToHex(r, g, b) {
  const toHex = (n) => {
    const hex = Math.round(n * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function rgbaToString(r, g, b, a) {
  return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
}

function extractColors(node) {
  const colors = [];

  if (node.backgroundColor) {
    const { r, g, b, a = 1 } = node.backgroundColor;
    colors.push({
      hex: rgbToHex(r, g, b),
      rgba: rgbaToString(r, g, b, a),
      alpha: a,
      type: 'background',
    });
  }

  if (node.fills && Array.isArray(node.fills)) {
    node.fills.forEach((fill) => {
      if (fill.visible !== false && fill.type === 'SOLID' && fill.color) {
        const { r, g, b } = fill.color;
        const a = fill.opacity !== undefined ? fill.opacity : 1;
        colors.push({
          hex: rgbToHex(r, g, b),
          rgba: rgbaToString(r, g, b, a),
          alpha: a,
          type: 'fill',
        });
      }
    });
  }

  if (node.children) {
    node.children.forEach((child) => {
      colors.push(...extractColors(child));
    });
  }

  return colors;
}

function extractTextContent(node) {
  const textNodes = [];

  function traverse(n) {
    if (n.type === 'TEXT' && n.characters) {
      textNodes.push({
        text: n.characters,
        fontFamily: n.style?.fontFamily,
        fontPostScriptName: n.style?.fontPostScriptName,
        fontWeight: n.style?.fontWeight,
        fontSize: n.style?.fontSize,
        lineHeight: n.style?.lineHeightPx,
        letterSpacing: n.style?.letterSpacing,
        textAlignHorizontal: n.style?.textAlignHorizontal,
        textAlignVertical: n.style?.textAlignVertical,
      });
    }
    if (n.children) {
      n.children.forEach(traverse);
    }
  }

  traverse(node);
  return textNodes;
}

function analyzeLayout(node) {
  return {
    layoutMode: node.layoutMode,
    direction:
      node.layoutMode === 'VERTICAL' ? 'column' : node.layoutMode === 'HORIZONTAL' ? 'row' : 'none',
    gap: node.itemSpacing,
    padding: {
      top: node.paddingTop || 0,
      right: node.paddingRight || 0,
      bottom: node.paddingBottom || 0,
      left: node.paddingLeft || 0,
    },
    primaryAxisAlignment: node.primaryAxisAlignItems,
    counterAxisAlignment: node.counterAxisAlignItems,
    primaryAxisSizing: node.primaryAxisSizingMode,
    counterAxisSizing: node.counterAxisSizingMode,
  };
}

function extractSVGs(node) {
  const svgs = [];

  function traverse(n) {
    // Look for vector nodes that might be SVGs
    if (
      n.type === 'VECTOR' ||
      n.type === 'BOOLEAN_OPERATION' ||
      n.type === 'STAR' ||
      n.type === 'POLYGON'
    ) {
      svgs.push({
        id: n.id,
        name: n.name,
        type: n.type,
        size: n.absoluteBoundingBox,
      });
    }
    if (n.children) {
      n.children.forEach(traverse);
    }
  }

  traverse(node);
  return svgs;
}

function generateNodeTree(node, depth = 0) {
  const indent = '  '.repeat(depth);
  let output = `${indent}- ${node.type}: ${node.name} (${node.id})\n`;

  if (node.absoluteBoundingBox) {
    const { width, height } = node.absoluteBoundingBox;
    output += `${indent}  Size: ${Math.round(width)}x${Math.round(height)}px\n`;
  }

  if (node.type === 'TEXT' && node.characters) {
    output += `${indent}  Text: "${node.characters.substring(0, 50)}${node.characters.length > 50 ? '...' : ''}"\n`;
  }

  if (node.layoutMode) {
    output += `${indent}  Layout: ${node.layoutMode}\n`;
  }

  if (node.children) {
    node.children.forEach((child) => {
      output += generateNodeTree(child, depth + 1);
    });
  }

  return output;
}

async function main() {
  console.log('🎨 Extracting Figma Design...\n');
  console.log(`File ID: ${FIGMA_FILE_ID}`);
  console.log(`Node ID: ${NODE_ID}\n`);

  try {
    // Fetch the Figma file
    console.log('📥 Fetching Figma file...');
    const fileData = await fetchFigmaFile();

    // Find the specific node
    console.log('🔍 Finding target node...');
    const targetNode = getNodeById(fileData, NODE_ID);

    if (!targetNode) {
      console.error(`❌ Node with ID ${NODE_ID} not found`);
      process.exit(1);
    }

    console.log(`✅ Found node: ${targetNode.name} (${targetNode.type})\n`);

    // Extract screenshot URL
    console.log('📸 Fetching screenshot...');
    const imagesData = await fetchFigmaImages([NODE_ID]);
    const screenshotUrl = imagesData.images?.[NODE_ID];

    // Extract all data
    const allColors = extractColors(targetNode);
    const uniqueColors = [...new Map(allColors.map((c) => [c.hex, c])).values()];
    const textContent = extractTextContent(targetNode);
    const layout = analyzeLayout(targetNode);
    const nodeTree = generateNodeTree(targetNode);
    const svgElements = extractSVGs(targetNode);

    // Generate report
    const report = {
      node: {
        id: targetNode.id,
        name: targetNode.name,
        type: targetNode.type,
        size: targetNode.absoluteBoundingBox,
      },
      screenshot: {
        url: screenshotUrl,
        description: `Screenshot of ${targetNode.name}`,
      },
      colors: {
        all: allColors,
        unique: uniqueColors,
        primary: uniqueColors[0] || null,
      },
      textContent: textContent,
      layout: layout,
      svgElements: svgElements,
      structure: nodeTree,
      extractedAt: new Date().toISOString(),
      figmaUrl: `https://www.figma.com/design/${FIGMA_FILE_ID}/Untitled?node-id=${NODE_ID}&m=dev`,
    };

    // Output report
    console.log('═'.repeat(60));
    console.log('📊 DESIGN EXTRACTION REPORT');
    console.log('═'.repeat(60));
    console.log();

    console.log('📱 NODE INFORMATION:');
    console.log(`   Name: ${report.node.name}`);
    console.log(`   Type: ${report.node.type}`);
    console.log(`   ID: ${report.node.id}`);
    if (report.node.size) {
      console.log(
        `   Size: ${Math.round(report.node.size.width)}x${Math.round(report.node.size.height)}px`
      );
    }
    console.log();

    console.log('📸 SCREENSHOT:');
    console.log(`   URL: ${screenshotUrl || 'Not available'}`);
    if (screenshotUrl) {
      console.log(
        `   You can download the screenshot and save it to: public/images/boot-screen.png`
      );
    }
    console.log();

    console.log('🎨 COLORS PALETTE:');
    uniqueColors.forEach((color, i) => {
      console.log(`   ${i + 1}. ${color.hex} (${color.rgba})`);
    });
    console.log();

    console.log('📝 TEXT CONTENT:');
    if (textContent.length === 0) {
      console.log('   No text content found');
    } else {
      textContent.forEach((text, i) => {
        console.log(`   ${i + 1}. "${text.text}"`);
        console.log(`      Font: ${text.fontFamily || 'Unknown'} (${text.fontWeight || 400})`);
        console.log(`      Size: ${text.fontSize || 'Unknown'}px`);
        if (text.lineHeight) {
          console.log(`      Line Height: ${Math.round(text.lineHeight)}px`);
        }
        console.log();
      });
    }

    console.log('📐 LAYOUT:');
    console.log(`   Mode: ${layout.layoutMode || 'Absolute'}`);
    console.log(`   Direction: ${layout.direction}`);
    console.log(`   Gap: ${layout.gap || 0}px`);
    console.log(
      `   Padding: ${layout.padding.top}px ${layout.padding.right}px ${layout.padding.bottom}px ${layout.padding.left}px`
    );
    if (layout.primaryAxisAlignment) {
      console.log(`   Primary Axis Alignment: ${layout.primaryAxisAlignment}`);
    }
    if (layout.counterAxisAlignment) {
      console.log(`   Counter Axis Alignment: ${layout.counterAxisAlignment}`);
    }
    console.log();

    if (svgElements.length > 0) {
      console.log('🎭 SVG/VECTOR ELEMENTS:');
      svgElements.forEach((svg, i) => {
        console.log(`   ${i + 1}. ${svg.name} (${svg.type})`);
      });
      console.log('   Note: Vector SVG exports need to be done via Figma export or screenshot');
      console.log();
    }

    console.log('🌲 NODE STRUCTURE:');
    console.log(nodeTree);
    console.log();

    // Save to file
    const outputPath = './figma-extraction-report.json';
    writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(`💾 Full report saved to: ${outputPath}`);
    console.log();

    console.log('═'.repeat(60));
    console.log('✅ Extraction complete!');
    console.log('═'.repeat(60));
    console.log();
    console.log('📋 Next steps:');
    console.log('   1. Download the screenshot from the URL above');
    console.log('   2. Review the figma-extraction-report.json file');
    console.log('   3. Generate the React component based on this data');
    console.log();
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('403')) {
      console.log('\n💡 Tip: Make sure your FIGMA_TOKEN is valid and has access to this file');
    } else if (error.message.includes('404')) {
      console.log('\n💡 Tip: Check that the file ID and node ID are correct');
    }
    process.exit(1);
  }
}

main();
