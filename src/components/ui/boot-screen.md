# Boot Screen Component

A professional, animated loading screen for the LEXERY Legal AI application.

## Features

- ✨ Smooth 60fps animations with dual-ring spinner
- 📱 Fully responsive (mobile, tablet, desktop)
- ♿ Complete accessibility support with ARIA attributes
- 🎨 Uses existing design tokens from globals.css
- ⚙️ Highly customizable with props
- 🚀 Built with React 19, TypeScript, and Tailwind CSS

## Usage

### Basic Usage

```tsx
import { BootScreen } from '@/components/boot-screen';

function App() {
  return <BootScreen duration={3000} onComplete={() => console.log('Boot complete!')} />;
}
```

### Advanced Usage

```tsx
import { BootScreen } from '@/components/boot-screen';
import { useState } from 'react';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      {isLoading && (
        <BootScreen
          duration={3000}
          showProgress
          message="Initializing Legal AI..."
          onComplete={() => setIsLoading(false)}
          className="z-50"
        />
      )}
      <MainApp />
    </>
  );
}
```

## Props

| Prop           | Type         | Default                      | Description                               |
| -------------- | ------------ | ---------------------------- | ----------------------------------------- |
| `duration`     | `number`     | `3000`                       | Duration of boot sequence in milliseconds |
| `onComplete`   | `() => void` | -                            | Callback when boot sequence completes     |
| `className`    | `string`     | -                            | Additional CSS classes for styling        |
| `showProgress` | `boolean`    | `true`                       | Show loading progress indicator           |
| `message`      | `string`     | `"Initializing Legal AI..."` | Custom loading message                    |

## Design Features

### Animation

- **Fade-in-up**: Staggered entrance animations for elements
- **Dual-ring spinner**: Rotating outer and inner rings with opposite directions
- **Pulse effect**: Animated glow behind the logo
- **Progress bar**: Smooth progress tracking with gradient

### Responsive Breakpoints

- **Mobile** (< 640px): Compact layout, smaller logo
- **Tablet** (640px - 1024px): Medium-sized elements
- **Desktop** (> 1024px): Full-sized layout with optimal spacing

### Accessibility

- `role="status"` for screen reader compatibility
- `aria-live="polite"` for dynamic updates
- `aria-label` and `aria-atomic` attributes
- Progress announcements for screen readers
- Keyboard navigation support

## Demo

Visit `/boot` in your Next.js application to see the boot screen in action with:

- Live demo
- Feature showcase
- Usage examples
- Props documentation

## Assets

The component uses the following assets:

- `lexery-logo.svg` - Main LEXERY wordmark logo
- `lexery-icon.svg` - Standalone icon for smaller displays

Both assets are located in the `/public` directory and use `currentColor` for easy theme integration.

## Customization

### Custom Duration

```tsx
<BootScreen duration={5000} /> // 5 second boot sequence
```

### Custom Message

```tsx
<BootScreen message="Loading your workspace..." />
```

### Without Progress Bar

```tsx
<BootScreen showProgress={false} />
```

### Custom Styling

```tsx
<BootScreen className="bg-gradient-to-br from-blue-50 to-indigo-50" />
```

## Animation Classes

The component includes custom animation utilities in `globals.css`:

- `.animate-fade-in-up` - Fade in with upward motion
- `.animate-spin-slow` - Slow rotation (3s)
- `.animate-spin-reverse` - Reverse rotation (2s)
- `.animation-delay-{300|500|700|1000}` - Staggered delays

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- iOS Safari (iOS 14+)
- Chrome Mobile (latest)

## Performance

- Uses CSS transforms for smooth 60fps animations
- Optimized with Next.js Image component
- Minimal re-renders with useEffect hook
- Automatic cleanup on unmount
