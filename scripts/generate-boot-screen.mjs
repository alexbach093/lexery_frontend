#!/usr/bin/env node

/**
 * Boot Screen Component Generator
 * Generates a React + TypeScript + Tailwind component from Figma extraction data
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const EXTRACTION_FILE = join(__dirname, '..', 'figma-extraction-report.json');
const OUTPUT_FILE = join(__dirname, '..', 'src', 'components', 'BootScreen.tsx');

// Utility functions
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function getTailwindColor(hex) {
  // Map common colors to Tailwind classes
  const colorMap = {
    '#FFFFFF': 'white',
    '#000000': 'black',
    '#F3F4F6': 'gray-100',
    '#E5E7EB': 'gray-200',
    '#D1D5DB': 'gray-300',
    '#9CA3AF': 'gray-400',
    '#6B7280': 'gray-500',
    '#4B5563': 'gray-600',
    '#374151': 'gray-700',
    '#1F2937': 'gray-900',
    '#4F46E5': 'indigo-600',
    '#4338CA': 'indigo-700',
    '#EF4444': 'red-500',
    '#10B981': 'green-500',
    '#3B82F6': 'blue-500',
  };

  return colorMap[hex.toUpperCase()] || null;
}

function getFontWeightClass(weight) {
  const weightMap = {
    100: 'font-thin',
    200: 'font-extralight',
    300: 'font-light',
    400: 'font-normal',
    500: 'font-medium',
    600: 'font-semibold',
    700: 'font-bold',
    800: 'font-extrabold',
    900: 'font-black',
  };
  return weightMap[weight] || 'font-normal';
}

function getFontSizeClass(size) {
  const sizeMap = {
    12: 'text-xs',
    14: 'text-sm',
    16: 'text-base',
    18: 'text-lg',
    20: 'text-xl',
    24: 'text-2xl',
    30: 'text-3xl',
    32: 'text-3xl',
    36: 'text-4xl',
    48: 'text-5xl',
  };
  
  // Find closest match
  const sizes = Object.keys(sizeMap).map(Number);
  const closest = sizes.reduce((prev, curr) => {
    return Math.abs(curr - size) < Math.abs(prev - size) ? curr : prev;
  });
  
  return sizeMap[closest] || 'text-base';
}

function getTextColorClass(hex) {
  const tailwindColor = getTailwindColor(hex);
  return tailwindColor ? `text-${tailwindColor}` : null;
}

function generateComponent(data) {
  const { node, screenshot, colors, textContent, layout } = data;
  
  // Extract primary colors
  const bgColor = colors.unique[0] || { hex: '#FFFFFF' };
  const bgColorClass = getTailwindColor(bgColor.hex) || 'white';
  
  // Extract text elements
  const titleText = textContent.find(t => t.fontSize >= 24) || textContent[0] || { text: 'Welcome' };
  const subtitleText = textContent.find(t => t.fontSize < 24 && t !== titleText) || textContent[1] || { text: 'Loading...' };
  
  // Generate Tailwind classes for layout
  const layoutClasses = [];
  if (layout.direction === 'column') {
    layoutClasses.push('flex-col');
  } else if (layout.direction === 'row') {
    layoutClasses.push('flex-row');
  }
  
  if (layout.primaryAxisAlignment === 'CENTER') {
    layoutClasses.push('items-center justify-center');
  }
  
  if (layout.gap) {
    const gapClass = layout.gap <= 8 ? 'gap-2' : layout.gap <= 16 ? 'gap-4' : 'gap-6';
    layoutClasses.push(gapClass);
  }
  
  // Generate component code
  const componentCode = `/**
 * Boot Screen Component
 * Generated from Figma design extraction
 * 
 * Design: ${node.name}
 * Figma URL: ${data.figmaUrl || 'N/A'}
 * Extracted: ${data.extractedAt || new Date().toISOString()}
 */

'use client';

import React, { useEffect, useState } from 'react';

interface BootScreenProps {
  /** Callback function called when boot screen animation completes */
  onComplete?: () => void;
  /** Duration of the boot screen in milliseconds */
  duration?: number;
  /** Whether to show loading indicator */
  showLoading?: boolean;
}

export function BootScreen({ 
  onComplete, 
  duration = 2000,
  showLoading = true 
}: BootScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fade out animation before completion
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, duration - 500);

    // Complete the boot screen
    const completeTimer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, duration);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [duration, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={\`
        fixed inset-0 z-50
        flex ${layoutClasses.join(' ')}
        bg-${bgColorClass}
        transition-opacity duration-500
        \${fadeOut ? 'opacity-0' : 'opacity-100'}
      \`}
      style={{
        backgroundColor: '${bgColor.hex}',
        ${layout.padding && layout.padding.top ? `padding: '${layout.padding.top}px ${layout.padding.right}px ${layout.padding.bottom}px ${layout.padding.left}px',` : ''}
      }}
    >
      {/* Logo Container */}
      <div className="mb-6 flex items-center justify-center">
        {/* Logo - Replace with your actual logo */}
        <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-indigo-600">
          {/* Add your logo SVG or image here */}
          <svg
            className="h-12 w-12 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
      </div>

      {/* Text Content */}
      <div className="flex flex-col items-center gap-3 px-6 text-center">
        {/* Title */}
        <h1
          className="${getFontSizeClass(titleText.fontSize || 32)} ${getFontWeightClass(titleText.fontWeight || 700)} ${getTextColorClass(colors.unique[1]?.hex || '#1F2937') || 'text-gray-900'}"
          style={{
            fontFamily: '${titleText.fontFamily || 'Inter'}',
            ${titleText.letterSpacing ? `letterSpacing: '${titleText.letterSpacing}px',` : ''}
          }}
        >
          ${titleText.text || 'Welcome'}
        </h1>

        {/* Subtitle */}
        {${subtitleText ? 'true' : 'false'} && (
          <p
            className="${getFontSizeClass(subtitleText?.fontSize || 16)} ${getFontWeightClass(subtitleText?.fontWeight || 400)} ${getTextColorClass(colors.unique[2]?.hex || '#6B7280') || 'text-gray-600'}"
            style={{
              fontFamily: '${subtitleText?.fontFamily || 'Inter'}',
              ${subtitleText?.letterSpacing ? `letterSpacing: '${subtitleText.letterSpacing}px',` : ''}
            }}
          >
            ${subtitleText?.text || 'Loading...'}
          </p>
        )}
      </div>

      {/* Loading Indicator */}
      {showLoading && (
        <div className="mt-12">
          <div className="h-1 w-32 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full animate-pulse rounded-full bg-indigo-600"
              style={{
                animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default BootScreen;

/*
 * Design Specifications (from Figma extraction):
 * 
 * Colors:
${colors.unique.map((c, i) => ` * ${i + 1}. ${c.hex} (${c.rgba})`).join('\n')}
 * 
 * Typography:
${textContent.map((t, i) => ` * ${i + 1}. "${t.text}"
 *    Font: ${t.fontFamily || 'Unknown'} ${t.fontWeight || 400}
 *    Size: ${t.fontSize || 'N/A'}px
 *    Line Height: ${t.lineHeight ? Math.round(t.lineHeight) : 'N/A'}px`).join('\n')}
 * 
 * Layout:
 *    Mode: ${layout.layoutMode || 'Absolute'}
 *    Direction: ${layout.direction || 'N/A'}
 *    Gap: ${layout.gap || 0}px
 *    Padding: ${layout.padding?.top || 0}px ${layout.padding?.right || 0}px ${layout.padding?.bottom || 0}px ${layout.padding?.left || 0}px
 * 
 * Screenshot: ${screenshot.url || 'N/A'}
 */
`;

  return componentCode;
}

function main() {
  console.log('🎨 Generating Boot Screen Component...\n');

  // Check if extraction file exists
  if (!existsSync(EXTRACTION_FILE)) {
    console.error('❌ Error: Figma extraction report not found!');
    console.log('Please run: npm run figma:extract');
    console.log();
    process.exit(1);
  }

  try {
    // Read extraction data
    console.log('📖 Reading extraction data...');
    const data = JSON.parse(readFileSync(EXTRACTION_FILE, 'utf-8'));
    
    console.log(`✅ Found design: ${data.node.name}`);
    console.log();

    // Generate component
    console.log('🔧 Generating React component...');
    const componentCode = generateComponent(data);

    // Write component file
    writeFileSync(OUTPUT_FILE, componentCode);
    console.log(`✅ Component generated: ${OUTPUT_FILE}`);
    console.log();

    // Summary
    console.log('═'.repeat(60));
    console.log('📊 COMPONENT SUMMARY');
    console.log('═'.repeat(60));
    console.log();
    console.log('📦 Component Details:');
    console.log(`   Name: BootScreen`);
    console.log(`   Location: ${OUTPUT_FILE}`);
    console.log(`   Design: ${data.node.name}`);
    console.log();
    console.log('🎨 Design Properties:');
    console.log(`   Colors: ${data.colors.unique.length} unique`);
    console.log(`   Text Elements: ${data.textContent.length}`);
    console.log(`   Layout Mode: ${data.layout.layoutMode || 'Absolute'}`);
    console.log();
    console.log('📋 Next Steps:');
    console.log('   1. Review the generated component');
    console.log('   2. Add your logo SVG/image');
    console.log('   3. Download screenshot from extraction report if needed');
    console.log('   4. Import and use in your app:');
    console.log();
    console.log('      import { BootScreen } from "@/components/BootScreen";');
    console.log();
    console.log('      <BootScreen onComplete={() => console.log("Done!")} />');
    console.log();
    console.log('═'.repeat(60));
    console.log('✅ Generation complete!');
    console.log('═'.repeat(60));

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
