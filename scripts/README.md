# Figma Design Extraction

This directory contains tools to extract design information from Figma.

## 🎯 Goal

Extract the boot screen design from Figma and generate a React + TypeScript + Tailwind component that matches it perfectly.

## 📋 Prerequisites

1. **Figma Personal Access Token**
   - Visit: https://www.figma.com/developers/api#access-tokens
   - Go to your Figma account settings
   - Generate a new personal access token
   - Add it to your `.env` file:
     ```
     FIGMA_TOKEN=your_token_here
     ```

2. **Install tsx** (TypeScript execution)
   ```bash
   npm install -D tsx
   # or if using the corepack enabled pnpm:
   corepack enable
   pnpm add -D tsx
   ```

## 🚀 Usage

### Method 1: Using the Extraction Script (Recommended)

```bash
# Make sure tsx is installed
npm install -D tsx

# Add your FIGMA_TOKEN to .env file
echo "FIGMA_TOKEN=your_token_here" >> .env

# Run the extraction script
npm run figma:extract
# or
npx tsx scripts/extract-figma-design.ts
```

This will:
1. Fetch the Figma file and find the boot screen node (0-1283)
2. Extract a screenshot URL
3. Extract all colors used in the design
4. Extract all text content with font details
5. Analyze the layout (flexbox/grid, spacing, padding)
6. Generate a complete node structure tree
7. Save everything to `figma-extraction-report.json`

### Method 2: Using Figma MCP Tools (If Available in Cursor)

If you have the Figma MCP server configured in Cursor, you can use these MCP tools directly:

#### 1. Get Design Context
This extracts complete design context with React + Tailwind code:

```
Use Figma MCP get_design_context tool with:
- File: IO0sKndZpfYlW5OVXoIpuC
- Node: 0-1283
```

#### 2. Get Screenshot
```
Use Figma MCP get_screenshot tool with:
- File: IO0sKndZpfYlW5OVXoIpuC  
- Node: 0-1283
```

#### 3. Get Metadata
```
Use Figma MCP get_metadata tool with:
- File: IO0sKndZpfYlW5OVXoIpuC
- Node: 0-1283
```

#### 4. Get Variable Definitions
```
Use Figma MCP get_variable_defs tool with:
- File: IO0sKndZpfYlW5OVXoIpuC
- Node: 0-1283
```

### Method 3: Manual Figma REST API

You can also use curl to manually fetch the data:

```bash
# Get file metadata
curl -H "X-Figma-Token: YOUR_TOKEN" \
  "https://api.figma.com/v1/files/IO0sKndZpfYlW5OVXoIpuC"

# Get node screenshot
curl -H "X-Figma-Token: YOUR_TOKEN" \
  "https://api.figma.com/v1/images/IO0sKndZpfYlW5OVXoIpuC?ids=0-1283&format=png&scale=2"
```

## 📊 Output Format

The extraction script generates a JSON report with:

```json
{
  "node": {
    "id": "0-1283",
    "name": "Boot Screen",
    "type": "FRAME",
    "size": { "width": 375, "height": 812 }
  },
  "screenshot": {
    "url": "https://...",
    "description": "Screenshot of Boot Screen"
  },
  "colors": {
    "unique": ["#FFFFFF", "#000000", "#4F46E5"],
    "primary": "#FFFFFF"
  },
  "textContent": [
    {
      "text": "Welcome",
      "fontFamily": "Inter",
      "fontWeight": 700,
      "fontSize": 32,
      "lineHeight": 40,
      "letterSpacing": 0
    }
  ],
  "layout": {
    "layoutMode": "VERTICAL",
    "direction": "column",
    "gap": 16,
    "padding": { "top": 0, "right": 0, "bottom": 0, "left": 0 }
  },
  "structure": "..."
}
```

## 🎨 Design Information Extracted

The script extracts:

- ✅ Screenshot URL (downloadable PNG)
- ✅ Background color (hex format)
- ✅ All text content with font details
  - Font family
  - Font weight
  - Font size
  - Line height
  - Letter spacing
- ✅ Layout structure
  - Flexbox/Grid settings
  - Spacing values
  - Padding values
  - Alignment
- ✅ Node hierarchy and structure
- ✅ Layer sizes and positions
- ✅ All unique colors used

## 🔄 Next Steps

After extraction:

1. Review the `figma-extraction-report.json` file
2. Download the screenshot from the provided URL
3. Use the extracted data to generate the React component
4. Match colors, typography, and spacing exactly
5. Implement any animations or interactive elements

## 🐛 Troubleshooting

### "FIGMA_TOKEN environment variable not set"
Make sure you've added `FIGMA_TOKEN=your_token` to your `.env` file.

### "Node with ID X not found"
Double-check the node ID in the Figma URL. The node ID should be in the format `node-id=X-XXXX`.

### "Figma API error: 403"
Your token may be invalid or expired. Generate a new one from Figma settings.

### "Figma API error: 404"
The file ID may be incorrect, or you don't have access to the file.

## 📚 Figma API Documentation

- [Figma REST API](https://www.figma.com/developers/api)
- [Authentication](https://www.figma.com/developers/api#authentication)
- [Files Endpoint](https://www.figma.com/developers/api#files-endpoint)
- [Images Endpoint](https://www.figma.com/developers/api#images-endpoint)
