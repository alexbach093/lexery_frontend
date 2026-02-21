# 🎨 Figma Boot Screen Extraction Guide

This guide will help you extract the boot screen design from Figma and generate a React component.

## 📝 Quick Start

### Step 1: Get Your Figma Token

1. Go to [Figma Account Settings](https://www.figma.com/settings)
2. Scroll to "Personal access tokens"
3. Click "Generate new token"
4. Give it a name: `Lexery Dev`
5. Copy the token (it looks like: `figd_xxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

### Step 2: Add Token to .env

Open `.env` file and replace `your_figma_token_here` with your actual token:

```bash
FIGMA_TOKEN=figd_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 3: Run the Extraction

```bash
npm run figma:extract
```

This will:
- ✅ Connect to Figma API
- ✅ Extract the boot screen design (node 0-1283)
- ✅ Download screenshot URL
- ✅ Extract colors, fonts, and layout
- ✅ Generate `figma-extraction-report.json`

## 📊 What Gets Extracted

### 1. Screenshot
- High-resolution PNG (2x scale)
- Direct download URL
- Save to: `public/images/boot-screen.png`

### 2. Colors
- All unique colors in hex format
- RGBA values with opacity
- Background colors and fills

Example output:
```json
{
  "colors": {
    "unique": [
      { "hex": "#FFFFFF", "rgba": "rgba(255, 255, 255, 1)", "alpha": 1 },
      { "hex": "#4F46E5", "rgba": "rgba(79, 70, 229, 1)", "alpha": 1 },
      { "hex": "#1F2937", "rgba": "rgba(31, 41, 55, 1)", "alpha": 1 }
    ],
    "primary": { "hex": "#FFFFFF", "rgba": "rgba(255, 255, 255, 1)" }
  }
}
```

### 3. Typography
- All text content
- Font families
- Font weights
- Font sizes
- Line heights
- Letter spacing

Example output:
```json
{
  "textContent": [
    {
      "text": "Welcome to Lexery",
      "fontFamily": "Inter",
      "fontWeight": 700,
      "fontSize": 32,
      "lineHeight": 40,
      "letterSpacing": 0,
      "textAlignHorizontal": "CENTER"
    }
  ]
}
```

### 4. Layout Structure
- Flexbox/Grid settings
- Spacing (gap)
- Padding values
- Alignment settings
- Sizing modes

Example output:
```json
{
  "layout": {
    "layoutMode": "VERTICAL",
    "direction": "column",
    "gap": 24,
    "padding": { "top": 48, "right": 24, "bottom": 48, "left": 24 },
    "primaryAxisAlignment": "CENTER",
    "counterAxisAlignment": "CENTER"
  }
}
```

### 5. Node Structure
- Complete component hierarchy
- Layer names and types
- Sizes and positions
- All child elements

## 🎯 Expected Output

When you run the extraction script, you'll see:

```
🎨 Extracting Figma Design...

File ID: IO0sKndZpfYlW5OVXoIpuC
Node ID: 0-1283

📥 Fetching Figma file...
🔍 Finding target node...
✅ Found node: Boot Screen (FRAME)

📸 Fetching screenshot...
═══════════════════════════════════════════════════════════
📊 DESIGN EXTRACTION REPORT
═══════════════════════════════════════════════════════════

📱 NODE INFORMATION:
   Name: Boot Screen
   Type: FRAME
   ID: 0-1283
   Size: 375x812px

📸 SCREENSHOT:
   URL: https://s3-alpha.figma.com/...
   You can download the screenshot and save it to: public/images/boot-screen.png

🎨 COLORS PALETTE:
   1. #FFFFFF (rgba(255, 255, 255, 1))
   2. #4F46E5 (rgba(79, 70, 229, 1))
   3. #1F2937 (rgba(31, 41, 55, 1))

📝 TEXT CONTENT:
   1. "Welcome to Lexery"
      Font: Inter (700)
      Size: 32px
      Line Height: 40px

   2. "Your AI-powered learning companion"
      Font: Inter (400)
      Size: 16px
      Line Height: 24px

📐 LAYOUT:
   Mode: VERTICAL
   Direction: column
   Gap: 24px
   Padding: 48px 24px 48px 24px
   Primary Axis Alignment: CENTER
   Counter Axis Alignment: CENTER

🌲 NODE STRUCTURE:
- FRAME: Boot Screen (0-1283)
  Size: 375x812px
  Layout: VERTICAL
  - FRAME: Logo Container
    Size: 120x120px
    - VECTOR: Logo
      Size: 80x80px
  - FRAME: Text Container
    Size: 327x100px
    Layout: VERTICAL
    - TEXT: Title
      Size: 327x40px
      Text: "Welcome to Lexery"
    - TEXT: Subtitle
      Size: 327x24px
      Text: "Your AI-powered learning companion"

💾 Full report saved to: ./figma-extraction-report.json

═══════════════════════════════════════════════════════════
✅ Extraction complete!
═══════════════════════════════════════════════════════════

📋 Next steps:
   1. Download the screenshot from the URL above
   2. Review the figma-extraction-report.json file
   3. Generate the React component based on this data
```

## 🚀 Next: Generate React Component

After extraction, we'll:

1. **Create the component structure**
   ```
   src/components/BootScreen/
   ├── BootScreen.tsx          # Main component
   ├── BootScreen.module.css   # Styles (if needed)
   └── index.ts                # Export
   ```

2. **Match the design exactly**
   - Use extracted colors
   - Apply exact typography
   - Implement layout with Tailwind
   - Add any animations

3. **Add to the app**
   ```tsx
   import { BootScreen } from '@/components/BootScreen';
   
   export default function App() {
     return <BootScreen />;
   }
   ```

## 🐛 Troubleshooting

### "FIGMA_TOKEN environment variable not set"
→ Make sure you added the token to `.env` file

### "Figma API error: 403"
→ Your token is invalid or expired. Generate a new one

### "Figma API error: 404"
→ File not found. Check the file ID or your access permissions

### "Node with ID 0-1283 not found"
→ The node might have been deleted or renamed. Check the Figma URL

### Script doesn't run
→ Make sure you're using Node.js >= 18 (which supports native fetch)

```bash
node --version  # Should be >= 18.0.0
```

## 📚 Resources

- **Figma File URL**: https://www.figma.com/design/IO0sKndZpfYlW5OVXoIpuC/Untitled?node-id=0-1283&m=dev
- **Figma API Docs**: https://www.figma.com/developers/api
- **Extraction Script**: `scripts/extract-figma-design.mjs`
- **Output Report**: `figma-extraction-report.json`

## ❓ FAQ

**Q: Can I extract other screens too?**
A: Yes! Just change the `NODE_ID` constant in the script to the node ID from your Figma URL.

**Q: What if the design uses custom fonts?**
A: The extraction will tell you which fonts are used. You'll need to install them or find similar alternatives.

**Q: How do I export SVG logos?**
A: The script identifies vector elements. You'll need to export them manually from Figma or use the screenshot.

**Q: Can I use the Figma MCP tools instead?**
A: Yes, if you have the Figma MCP server configured in Cursor. See `scripts/README.md` for details.

---

**Ready?** Get your Figma token and run `npm run figma:extract`! 🚀
