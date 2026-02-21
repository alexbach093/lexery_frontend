# ✅ Figma Boot Screen Extraction Checklist

Follow this checklist to extract your boot screen design from Figma and implement it in your app.

## Phase 1: Setup (5 minutes)

- [ ] **1.1** Visit https://www.figma.com/settings
- [ ] **1.2** Navigate to "Personal access tokens"
- [ ] **1.3** Click "Generate new token"
- [ ] **1.4** Name it: `Lexery Dev Token`
- [ ] **1.5** Copy the token (starts with `figd_`)
- [ ] **1.6** Open `.env` file in your project
- [ ] **1.7** Replace `your_figma_token_here` with your actual token
- [ ] **1.8** Save the `.env` file
- [ ] **1.9** Verify Node.js version: `node --version` (should be >= 18)

## Phase 2: Extraction (1 minute)

- [ ] **2.1** Open terminal in project root
- [ ] **2.2** Run: `npm run figma:extract`
- [ ] **2.3** Wait for extraction to complete (should take ~10 seconds)
- [ ] **2.4** Verify file exists: `figma-extraction-report.json`
- [ ] **2.5** Review the extraction report:
  ```bash
  cat figma-extraction-report.json | head -50
  ```
- [ ] **2.6** Check the screenshot URL in the report
- [ ] **2.7** Open screenshot URL in browser to verify

## Phase 3: Component Generation (1 minute)

- [ ] **3.1** Run: `npm run figma:generate`
- [ ] **3.2** Wait for generation to complete (should take ~1 second)
- [ ] **3.3** Verify component exists: `src/components/BootScreen.tsx`
- [ ] **3.4** Review the generated component:
  ```bash
  cat src/components/BootScreen.tsx | head -100
  ```
- [ ] **3.5** Check component documentation at bottom of file

## Phase 4: Asset Preparation (5 minutes)

- [ ] **4.1** Download screenshot from URL (found in `figma-extraction-report.json`)
- [ ] **4.2** Save screenshot to: `public/images/boot-screen-reference.png`
- [ ] **4.3** Open Figma design in browser
- [ ] **4.4** Export logo as SVG from Figma:
  - Right-click logo layer
  - Export → SVG
- [ ] **4.5** Save logo to: `public/images/logo.svg` (or `.png`)
- [ ] **4.6** Verify assets exist in `public/images/`

## Phase 5: Component Customization (10 minutes)

- [ ] **5.1** Open `src/components/BootScreen.tsx` in editor
- [ ] **5.2** Update logo section:
  ```tsx
  // Replace placeholder SVG with your logo
  <Image 
    src="/images/logo.svg" 
    alt="Lexery Logo" 
    width={120} 
    height={120}
    priority
  />
  ```
- [ ] **5.3** Review text content matches design
- [ ] **5.4** Review colors match design
- [ ] **5.5** Check typography (font family, sizes, weights)
- [ ] **5.6** Verify spacing and layout
- [ ] **5.7** Test animations (fade in/out)
- [ ] **5.8** Save the file

## Phase 6: Integration (10 minutes)

### Option A: Test on Dedicated Page

- [ ] **6.1** Create test page: `src/app/boot-test/page.tsx`
- [ ] **6.2** Add code:
  ```tsx
  import { BootScreen } from '@/components/BootScreen';
  
  export default function BootTestPage() {
    return <BootScreen />;
  }
  ```
- [ ] **6.3** Start dev server: `npm run dev`
- [ ] **6.4** Visit: http://localhost:3000/boot-test
- [ ] **6.5** Verify boot screen displays correctly
- [ ] **6.6** Check console for errors

### Option B: Add to Main App

- [ ] **6.7** Open `src/app/page.tsx`
- [ ] **6.8** Add state management:
  ```tsx
  'use client';
  import { useState } from 'react';
  import { BootScreen } from '@/components/BootScreen';
  
  export default function Home() {
    const [showBoot, setShowBoot] = useState(true);
    
    return (
      <>
        {showBoot && <BootScreen onComplete={() => setShowBoot(false)} />}
        {/* Your main content */}
      </>
    );
  }
  ```
- [ ] **6.9** Save the file
- [ ] **6.10** Test the page in browser

## Phase 7: Quality Assurance (10 minutes)

- [ ] **7.1** Visual comparison:
  - Open Figma design in one window
  - Open your app in another window
  - Compare side-by-side
- [ ] **7.2** Check colors match exactly
- [ ] **7.3** Check typography matches (font, size, weight)
- [ ] **7.4** Check spacing matches (padding, margins, gaps)
- [ ] **7.5** Check logo displays correctly
- [ ] **7.6** Test on different screen sizes:
  - Desktop (1920px)
  - Tablet (768px)
  - Mobile (375px)
- [ ] **7.7** Test animations:
  - Fade in smooth
  - Fade out smooth
  - Timing correct
- [ ] **7.8** Test onComplete callback works
- [ ] **7.9** Check no console errors
- [ ] **7.10** Verify TypeScript compiles: `npm run typecheck`

## Phase 8: Fine-tuning (Optional, 15 minutes)

- [ ] **8.1** Adjust animation duration if needed
- [ ] **8.2** Customize loading indicator
- [ ] **8.3** Add brand colors to Tailwind config
- [ ] **8.4** Install custom fonts if needed
- [ ] **8.5** Optimize logo image size
- [ ] **8.6** Add preloading for faster display
- [ ] **8.7** Test on slower connections
- [ ] **8.8** Add loading states for assets
- [ ] **8.9** Consider adding sound effects
- [ ] **8.10** Document any customizations

## Phase 9: Documentation (5 minutes)

- [ ] **9.1** Document component usage in team wiki/docs
- [ ] **9.2** Add JSDoc comments to component if needed
- [ ] **9.3** Document any deviations from Figma design
- [ ] **9.4** Note any limitations or future improvements
- [ ] **9.5** Update project README if necessary

## Phase 10: Deployment Prep (5 minutes)

- [ ] **10.1** Ensure `.env` is in `.gitignore`
- [ ] **10.2** Add FIGMA_TOKEN to `.env.example` (as placeholder)
- [ ] **10.3** Verify assets are in `public/images/`
- [ ] **10.4** Run production build: `npm run build`
- [ ] **10.5** Test production build: `npm run start`
- [ ] **10.6** Verify boot screen works in production mode
- [ ] **10.7** Check bundle size (if concerned)
- [ ] **10.8** Commit changes to git (if satisfied)

## Troubleshooting Checklist

If something goes wrong, check these:

### Extraction Issues

- [ ] Figma token is correct and in `.env`
- [ ] Token has access to the Figma file
- [ ] File ID and Node ID are correct
- [ ] Internet connection is working
- [ ] No firewall blocking Figma API

### Generation Issues

- [ ] `figma-extraction-report.json` exists
- [ ] JSON file is valid (not corrupted)
- [ ] `src/components/` directory exists
- [ ] No file permission issues

### Display Issues

- [ ] Component is imported correctly
- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] Dev server is running
- [ ] Assets are in correct location
- [ ] Image paths are correct

### Style Issues

- [ ] Tailwind CSS is configured
- [ ] Custom colors added if needed
- [ ] Fonts are installed
- [ ] CSS is compiled correctly

## Success Criteria

You're done when:

- ✅ Boot screen displays correctly
- ✅ Colors match Figma design
- ✅ Typography matches Figma design
- ✅ Logo displays correctly
- ✅ Animations work smoothly
- ✅ onComplete callback triggers
- ✅ No console errors
- ✅ Works on all screen sizes
- ✅ TypeScript compiles without errors
- ✅ Production build works

## Quick Commands Reference

```bash
# Complete workflow
npm run figma:build              # Extract + Generate

# Individual steps
npm run figma:extract            # Extract from Figma
npm run figma:generate           # Generate component

# Development
npm run dev                      # Start dev server
npm run typecheck                # Check types
npm run build                    # Production build

# View files
cat figma-extraction-report.json # View extraction data
cat src/components/BootScreen.tsx # View component
```

## Time Estimates

| Phase | Estimated Time |
|-------|----------------|
| Setup | 5 minutes |
| Extraction | 1 minute |
| Generation | 1 minute |
| Assets | 5 minutes |
| Customization | 10 minutes |
| Integration | 10 minutes |
| QA | 10 minutes |
| Fine-tuning | 15 minutes (optional) |
| Documentation | 5 minutes |
| Deployment Prep | 5 minutes |
| **Total** | **42-57 minutes** |

## Next Steps After Completion

- [ ] Create pull request with changes
- [ ] Get design approval from team
- [ ] Test on staging environment
- [ ] Prepare for production deployment
- [ ] Monitor performance metrics
- [ ] Gather user feedback

---

**Questions?** Check:
- [Quick Reference](./QUICK_REFERENCE.md)
- [Full Guide](./FIGMA_TO_REACT_SUMMARY.md)
- [Implementation Details](./docs/boot-screen-implementation.md)

**Ready to start?** Begin with Phase 1! 🚀
