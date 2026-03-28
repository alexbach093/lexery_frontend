# ⚡ Quick Reference: Figma to React Boot Screen

## 🎯 One-Time Setup (5 minutes)

```bash
# 1. Get Figma token: https://www.figma.com/settings
# 2. Add to .env file:
echo "FIGMA_TOKEN=figd_your_token_here" >> .env

# 3. Extract & Generate:
corepack pnpm run figma:build
```

## 📦 What You Get

```tsx
import { BootScreen } from '@/components/ui/BootScreen';

// Basic usage
<BootScreen />

// With options
<BootScreen
  duration={3000}
  onComplete={() => router.push('/home')}
  showLoading={true}
/>
```

## 🛠️ Commands

| Command                            | What It Does                       |
| ---------------------------------- | ---------------------------------- |
| `corepack pnpm run figma:extract`  | Extract design from Figma → JSON   |
| `corepack pnpm run figma:generate` | Generate component from JSON → TSX |
| `corepack pnpm run figma:build`    | Extract + Generate (recommended)   |

## 📊 Extraction Output

After running `corepack pnpm run figma:extract`, you get:

**File:** `docs/artifacts/figma-extraction-report.json`

**Contains:**

- ✅ Screenshot URL (high-res PNG)
- ✅ All colors (hex + RGBA)
- ✅ Text content + typography
- ✅ Layout (flexbox, spacing, padding)
- ✅ Node structure

## 🎨 Component Props

```typescript
interface BootScreenProps {
  onComplete?: () => void; // Callback when done
  duration?: number; // Duration in ms (default: 2000)
  showLoading?: boolean; // Show loader (default: true)
}
```

## 📝 Design Info

- **Figma File:** `IO0sKndZpfYlW5OVXoIpuC`
- **Node ID:** `0-1283`
- **URL:** https://www.figma.com/design/IO0sKndZpfYlW5OVXoIpuC/Untitled?node-id=0-1283&m=dev

## 🔧 Common Tasks

### Change Logo

```tsx
// In src/components/ui/BootScreen.tsx, replace SVG with:
<Image src="/images/logo.png" alt="Logo" width={120} height={120} />
```

### Change Text

```tsx
// In src/components/ui/BootScreen.tsx:
<h1>Your Title</h1>
<p>Your subtitle</p>
```

### Change Colors

```tsx
// In src/components/ui/BootScreen.tsx:
<div className="bg-indigo-600" style={{ backgroundColor: '#4F46E5' }} />
```

### Adjust Duration

```tsx
<BootScreen duration={5000} /> // 5 seconds
```

## 🐛 Quick Fixes

| Problem               | Solution              |
| --------------------- | --------------------- |
| `FIGMA_TOKEN not set` | Add to `.env` file    |
| `403 Forbidden`       | Check token validity  |
| `Node not found`      | Verify node ID in URL |
| Colors off            | Use inline styles     |
| Fonts wrong           | Install font family   |

## 📚 Documentation

- **Complete Guide:** `FIGMA_TO_REACT_SUMMARY.md`
- **Getting Started:** `FIGMA_EXTRACTION_GUIDE.md`
- **Implementation:** `docs/boot-screen-implementation.md`
- **Scripts:** `scripts/README.md`

## 🚀 Workflow

```
1. Get Token → 2. Extract → 3. Generate → 4. Use
   (1 min)       (10 sec)     (1 sec)       (Done!)
```

## ✨ Example Usage

```tsx
'use client';
import { useState } from 'react';
import { BootScreen } from '@/components/ui/BootScreen';
import { Dashboard } from '@/components/Dashboard';

export default function App() {
  const [ready, setReady] = useState(false);

  return (
    <>
      {!ready && <BootScreen onComplete={() => setReady(true)} />}
      {ready && <Dashboard />}
    </>
  );
}
```

## 📁 Generated Files

```
scripts/
  ├── extract-figma-design.mjs    ← Extraction script
  └── generate-boot-screen.mjs    ← Generator script

src/components/ui/
  └── BootScreen.tsx              ← Your component

docs/artifacts/figma-extraction-report.json      ← Design data
```

## ⚡ TL;DR

```bash
# 1. Add token to .env:
FIGMA_TOKEN=figd_xxx

# 2. Run:
corepack pnpm run figma:build

# 3. Use:
import { BootScreen } from '@/components/ui/BootScreen';
<BootScreen />

# Done! 🎉
```

---

**Need more details?** See `FIGMA_TO_REACT_SUMMARY.md`
