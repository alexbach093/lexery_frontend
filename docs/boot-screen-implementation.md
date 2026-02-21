# 🚀 Boot Screen Implementation Guide

Complete guide for extracting and implementing the boot screen from Figma.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Detailed Steps](#detailed-steps)
4. [Component Usage](#component-usage)
5. [Customization](#customization)
6. [Troubleshooting](#troubleshooting)

## Overview

This guide walks you through:
1. ✅ Extracting design data from Figma using the REST API
2. ✅ Generating a React + TypeScript + Tailwind component
3. ✅ Implementing the boot screen in your Next.js app
4. ✅ Matching the design pixel-perfect

**Figma Design:**
- File ID: `IO0sKndZpfYlW5OVXoIpuC`
- Node ID: `0-1283`
- URL: https://www.figma.com/design/IO0sKndZpfYlW5OVXoIpuC/Untitled?node-id=0-1283&m=dev

## Quick Start

### 1. Get Figma Token

```bash
# 1. Visit https://www.figma.com/settings
# 2. Generate new token under "Personal access tokens"
# 3. Add to .env file:
echo "FIGMA_TOKEN=figd_your_token_here" >> .env
```

### 2. Extract & Generate

```bash
# Extract design data from Figma
npm run figma:extract

# Generate React component from extracted data
npm run figma:generate

# Or do both at once:
npm run figma:build
```

### 3. Use in Your App

```tsx
import { BootScreen } from '@/components/BootScreen';

export default function App() {
  return <BootScreen onComplete={() => console.log('Boot complete!')} />;
}
```

## Detailed Steps

### Step 1: Extraction (npm run figma:extract)

This script (`scripts/extract-figma-design.mjs`):

1. Connects to Figma REST API
2. Fetches the file with ID `IO0sKndZpfYlW5OVXoIpuC`
3. Finds node `0-1283` (Boot Screen)
4. Extracts:
   - Screenshot URL (high-res PNG)
   - All colors (hex + RGBA)
   - Text content with typography
   - Layout structure (flexbox, spacing, padding)
   - SVG/vector elements
   - Complete node tree
5. Saves to `figma-extraction-report.json`

**Output Example:**

```json
{
  "node": {
    "id": "0-1283",
    "name": "Boot Screen",
    "type": "FRAME",
    "size": { "x": 0, "y": 0, "width": 375, "height": 812 }
  },
  "screenshot": {
    "url": "https://s3-alpha.figma.com/...",
    "description": "Screenshot of Boot Screen"
  },
  "colors": {
    "unique": [
      { "hex": "#FFFFFF", "rgba": "rgba(255, 255, 255, 1)", "alpha": 1 },
      { "hex": "#1F2937", "rgba": "rgba(31, 41, 55, 1)", "alpha": 1 }
    ]
  },
  "textContent": [
    {
      "text": "Welcome to Lexery",
      "fontFamily": "Inter",
      "fontWeight": 700,
      "fontSize": 32
    }
  ],
  "layout": {
    "layoutMode": "VERTICAL",
    "direction": "column",
    "gap": 24,
    "padding": { "top": 48, "right": 24, "bottom": 48, "left": 24 }
  }
}
```

### Step 2: Generation (npm run figma:generate)

This script (`scripts/generate-boot-screen.mjs`):

1. Reads `figma-extraction-report.json`
2. Maps Figma styles to Tailwind classes
3. Generates React component code
4. Writes to `src/components/BootScreen.tsx`

**Features:**
- ✅ Automatic Tailwind class mapping
- ✅ TypeScript types and interfaces
- ✅ Fade in/out animations
- ✅ Configurable duration
- ✅ onComplete callback
- ✅ Responsive design
- ✅ Exact color and typography matching

### Step 3: Integration

The generated component is ready to use! It includes:

```tsx
interface BootScreenProps {
  onComplete?: () => void;      // Called when boot animation finishes
  duration?: number;             // Boot screen duration (default: 2000ms)
  showLoading?: boolean;         // Show loading indicator (default: true)
}
```

## Component Usage

### Basic Usage

```tsx
import { BootScreen } from '@/components/BootScreen';

export default function Home() {
  return <BootScreen />;
}
```

### With Callback

```tsx
'use client';

import { useState } from 'react';
import { BootScreen } from '@/components/BootScreen';

export default function App() {
  const [showBoot, setShowBoot] = useState(true);

  return (
    <>
      {showBoot && (
        <BootScreen 
          duration={3000}
          onComplete={() => setShowBoot(false)} 
        />
      )}
      <main>Your app content</main>
    </>
  );
}
```

### With Loading State

```tsx
'use client';

import { useState, useEffect } from 'react';
import { BootScreen } from '@/components/BootScreen';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [showBoot, setShowBoot] = useState(true);

  useEffect(() => {
    // Simulate app initialization
    async function initialize() {
      await loadResources();
      await authenticateUser();
      setIsReady(true);
    }
    initialize();
  }, []);

  return (
    <>
      {showBoot && (
        <BootScreen 
          duration={2000}
          onComplete={() => setShowBoot(false)} 
        />
      )}
      {isReady && <main>Your app content</main>}
    </>
  );
}
```

### Persistent Boot Screen

```tsx
'use client';

import { useEffect, useState } from 'react';
import { BootScreen } from '@/components/BootScreen';

export default function RootLayout({ children }) {
  const [firstVisit, setFirstVisit] = useState(true);

  useEffect(() => {
    // Check if user has seen boot screen before
    const hasSeenBoot = localStorage.getItem('hasSeenBoot');
    if (hasSeenBoot) {
      setFirstVisit(false);
    }
  }, []);

  const handleBootComplete = () => {
    localStorage.setItem('hasSeenBoot', 'true');
    setFirstVisit(false);
  };

  return (
    <html>
      <body>
        {firstVisit && <BootScreen onComplete={handleBootComplete} />}
        {children}
      </body>
    </html>
  );
}
```

## Customization

### Change Duration

```tsx
<BootScreen duration={5000} />  {/* 5 seconds */}
```

### Hide Loading Indicator

```tsx
<BootScreen showLoading={false} />
```

### Add Custom Logo

Edit `src/components/BootScreen.tsx`:

```tsx
{/* Logo Container */}
<div className="mb-6 flex items-center justify-center">
  <Image 
    src="/images/logo.png" 
    alt="Logo" 
    width={120} 
    height={120}
  />
</div>
```

### Customize Colors

The component uses extracted Figma colors. To override:

```tsx
// In BootScreen.tsx, modify:
<div className="bg-indigo-600">  {/* Change to your color */}
```

### Add Animation

Add more sophisticated animations:

```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, scale: 0.8 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.5 }}
>
  {/* Your content */}
</motion.div>
```

## File Structure

After running the scripts, you'll have:

```
lexery/
├── scripts/
│   ├── extract-figma-design.mjs      # Extraction script
│   ├── generate-boot-screen.mjs      # Generation script
│   └── README.md                      # Script documentation
├── src/
│   └── components/
│       └── BootScreen.tsx             # Generated component
├── figma-extraction-report.json       # Extracted design data
├── .env                               # Contains FIGMA_TOKEN
└── FIGMA_EXTRACTION_GUIDE.md         # This guide
```

## Troubleshooting

### "FIGMA_TOKEN environment variable not set"

**Solution:** Add your Figma token to `.env`:

```bash
FIGMA_TOKEN=figd_your_token_here
```

### "Node with ID 0-1283 not found"

**Causes:**
- Node was deleted or renamed in Figma
- File ID is incorrect
- You don't have access to the file

**Solution:** Check the Figma URL and ensure you have access.

### "Figma API error: 403 Forbidden"

**Causes:**
- Invalid or expired token
- Token doesn't have permission to access this file

**Solution:** Generate a new token from Figma settings.

### Colors Don't Match Exactly

**Cause:** Tailwind color classes are approximations.

**Solution:** Use custom colors in `tailwind.config.ts`:

```ts
module.exports = {
  theme: {
    extend: {
      colors: {
        'boot-bg': '#F5F7FA',
        'boot-text': '#1A202C',
      },
    },
  },
};
```

### Fonts Don't Match

**Cause:** Custom fonts need to be installed.

**Solution:** Add fonts to `app/layout.tsx`:

```tsx
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
```

### Component Won't Fade Out

**Cause:** Missing CSS transition support.

**Solution:** Ensure Tailwind CSS is properly configured:

```js
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
};
```

## Advanced Topics

### Using Figma MCP Tools (Alternative Method)

If you have Figma MCP server configured in Cursor, you can use MCP tools directly:

1. **get_design_context** - Get React + Tailwind code directly
2. **get_screenshot** - Get design screenshot
3. **get_metadata** - Get layer structure
4. **get_variable_defs** - Get design tokens

See `scripts/README.md` for details.

### Exporting SVG Logos

1. Open Figma file
2. Select the logo layer
3. Right-click → Export → SVG
4. Save to `public/images/logo.svg`
5. Use in component:

```tsx
import Image from 'next/image';

<Image src="/images/logo.svg" alt="Logo" width={80} height={80} />
```

### Performance Optimization

```tsx
// Preload boot screen assets
useEffect(() => {
  const preloadImage = new Image();
  preloadImage.src = '/images/logo.png';
}, []);
```

## Resources

- **Scripts:**
  - Extraction: `scripts/extract-figma-design.mjs`
  - Generation: `scripts/generate-boot-screen.mjs`
- **Documentation:**
  - Script README: `scripts/README.md`
  - Extraction Guide: `FIGMA_EXTRACTION_GUIDE.md`
- **Component:** `src/components/BootScreen.tsx`
- **Data:** `figma-extraction-report.json`

## NPM Scripts Reference

```bash
# Extract design data from Figma
npm run figma:extract

# Generate React component from extracted data
npm run figma:generate

# Extract and generate in one command
npm run figma:build
```

---

**Questions?** Check the troubleshooting section or review `FIGMA_EXTRACTION_GUIDE.md` for more details.

**Ready to start?** Run `npm run figma:build` after adding your FIGMA_TOKEN! 🚀
