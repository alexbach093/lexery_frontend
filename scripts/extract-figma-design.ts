/**
 * Figma Design Extractor
 * Extracts design information from a Figma node
 */

interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  backgroundColor?: { r: number; g: number; b: number; a: number };
  fills?: any[];
  strokes?: any[];
  effects?: any[];
  characters?: string;
  style?: {
    fontFamily?: string;
    fontWeight?: number;
    fontSize?: number;
    lineHeightPx?: number;
    letterSpacing?: number;
  };
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  constraints?: any;
  layoutMode?: string;
  primaryAxisSizingMode?: string;
  counterAxisSizingMode?: string;
  primaryAxisAlignItems?: string;
  counterAxisAlignItems?: string;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  itemSpacing?: number;
}

interface FigmaFile {
  document: FigmaNode;
  components: Record<string, any>;
  styles: Record<string, any>;
}

const FIGMA_FILE_ID = 'IO0sKndZpfYlW5OVXoIpuC';
const NODE_ID = '0-1283';
const FIGMA_TOKEN = process.env.FIGMA_TOKEN;

if (!FIGMA_TOKEN) {
  console.error('Error: FIGMA_TOKEN environment variable not set');
  console.log('Please add FIGMA_TOKEN to your .env file');
  process.exit(1);
}

async function fetchFigmaFile() {
  const url = `https://api.figma.com/v1/files/${FIGMA_FILE_ID}`;
  
  const response = await fetch(url, {
    headers: {
      'X-Figma-Token': FIGMA_TOKEN!,
    },
  });

  if (!response.ok) {
    throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
  }

  return await response.json() as { document: FigmaNode };
}

async function fetchFigmaImages(nodeIds: string[]) {
  const url = `https://api.figma.com/v1/images/${FIGMA_FILE_ID}?ids=${nodeIds.join(',')}&format=png&scale=2`;
  
  const response = await fetch(url, {
    headers: {
      'X-Figma-Token': FIGMA_TOKEN!,
    },
  });

  if (!response.ok) {
    throw new Error(`Figma Images API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

async function getNodeById(fileData: any, nodeId: string): Promise<FigmaNode | null> {
  function traverse(node: FigmaNode): FigmaNode | null {
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

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.round(n * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function extractColors(node: FigmaNode): string[] {
  const colors: string[] = [];
  
  if (node.backgroundColor) {
    const { r, g, b } = node.backgroundColor;
    colors.push(rgbToHex(r, g, b));
  }
  
  if (node.fills && Array.isArray(node.fills)) {
    node.fills.forEach((fill: any) => {
      if (fill.type === 'SOLID' && fill.color) {
        const { r, g, b } = fill.color;
        colors.push(rgbToHex(r, g, b));
      }
    });
  }
  
  if (node.children) {
    node.children.forEach(child => {
      colors.push(...extractColors(child));
    });
  }
  
  return colors;
}

function extractTextContent(node: FigmaNode): Array<{
  text: string;
  fontFamily?: string;
  fontWeight?: number;
  fontSize?: number;
  lineHeight?: number;
  letterSpacing?: number;
}> {
  const textNodes: any[] = [];
  
  function traverse(n: FigmaNode) {
    if (n.type === 'TEXT' && n.characters) {
      textNodes.push({
        text: n.characters,
        fontFamily: n.style?.fontFamily,
        fontWeight: n.style?.fontWeight,
        fontSize: n.style?.fontSize,
        lineHeight: n.style?.lineHeightPx,
        letterSpacing: n.style?.letterSpacing,
      });
    }
    if (n.children) {
      n.children.forEach(traverse);
    }
  }
  
  traverse(node);
  return textNodes;
}

function analyzeLayout(node: FigmaNode): {
  layoutMode?: string;
  direction?: string;
  gap?: number;
  padding?: { top: number; right: number; bottom: number; left: number };
  alignment?: string;
  sizing?: string;
} {
  return {
    layoutMode: node.layoutMode,
    direction: node.layoutMode === 'VERTICAL' ? 'column' : node.layoutMode === 'HORIZONTAL' ? 'row' : undefined,
    gap: node.itemSpacing,
    padding: {
      top: node.paddingTop || 0,
      right: node.paddingRight || 0,
      bottom: node.paddingBottom || 0,
      left: node.paddingLeft || 0,
    },
    alignment: node.primaryAxisAlignItems,
    sizing: node.primaryAxisSizingMode,
  };
}

function generateNodeTree(node: FigmaNode, depth: number = 0): string {
  const indent = '  '.repeat(depth);
  let output = `${indent}- ${node.type}: ${node.name} (${node.id})\n`;
  
  if (node.absoluteBoundingBox) {
    const { width, height } = node.absoluteBoundingBox;
    output += `${indent}  Size: ${width}x${height}px\n`;
  }
  
  if (node.type === 'TEXT' && node.characters) {
    output += `${indent}  Text: "${node.characters}"\n`;
  }
  
  if (node.children) {
    node.children.forEach(child => {
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
    const targetNode = await getNodeById(fileData, NODE_ID);
    
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
    const colors = [...new Set(extractColors(targetNode))];
    const textContent = extractTextContent(targetNode);
    const layout = analyzeLayout(targetNode);
    const nodeTree = generateNodeTree(targetNode);
    
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
        unique: colors,
        primary: colors[0] || null,
      },
      textContent: textContent,
      layout: layout,
      structure: nodeTree,
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
      console.log(`   Size: ${report.node.size.width}x${report.node.size.height}px`);
    }
    console.log();
    
    console.log('📸 SCREENSHOT:');
    console.log(`   URL: ${screenshotUrl || 'Not available'}`);
    console.log();
    
    console.log('🎨 COLORS:');
    colors.forEach((color, i) => {
      console.log(`   ${i + 1}. ${color}`);
    });
    console.log();
    
    console.log('📝 TEXT CONTENT:');
    textContent.forEach((text, i) => {
      console.log(`   ${i + 1}. "${text.text}"`);
      console.log(`      Font: ${text.fontFamily || 'Unknown'}`);
      console.log(`      Weight: ${text.fontWeight || 'Unknown'}`);
      console.log(`      Size: ${text.fontSize || 'Unknown'}px`);
      console.log();
    });
    
    console.log('📐 LAYOUT:');
    console.log(`   Mode: ${layout.layoutMode || 'Absolute'}`);
    console.log(`   Direction: ${layout.direction || 'N/A'}`);
    console.log(`   Gap: ${layout.gap || 0}px`);
    console.log(`   Padding: ${layout.padding?.top || 0}px ${layout.padding?.right || 0}px ${layout.padding?.bottom || 0}px ${layout.padding?.left || 0}px`);
    console.log();
    
    console.log('🌲 NODE STRUCTURE:');
    console.log(nodeTree);
    console.log();
    
    // Save to file
    const outputPath = './figma-extraction-report.json';
    const fs = await import('fs');
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(`💾 Full report saved to: ${outputPath}`);
    console.log();
    
    console.log('═'.repeat(60));
    console.log('✅ Extraction complete!');
    console.log('═'.repeat(60));
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
