# Theme Variants Guide

## Light & Dark Theme Implementation

The landing page includes built-in support for both light and dark themes with a toggle in the navigation bar.

## How It Works

### Theme State Management
```tsx
const [theme, setTheme] = useState<'light' | 'dark'>('light');
const isDark = theme === 'dark';
```

### Root Class Toggle
```tsx
<div className={isDark ? 'dark' : ''}>
  {/* All content */}
</div>
```

## Color System

### Background Colors

| Element | Light Theme | Dark Theme |
|---------|------------|------------|
| Page Background | `bg-white` | `bg-slate-950` |
| Section Alt | `bg-slate-50` | `bg-slate-900` |
| Card | `bg-white` | `bg-slate-800` |
| Hero Gradient | `from-slate-50` | `from-slate-900` |
| CTA Section | `from-navy-950` | `from-navy-900` |

### Text Colors

| Element | Light Theme | Dark Theme |
|---------|------------|------------|
| Headings | `text-navy-900` | `dark:text-white` |
| Body Text | `text-slate-600` | `dark:text-slate-400` |
| Muted Text | `text-slate-500` | `dark:text-slate-400` |
| Links | `text-navy-800` | `dark:text-white` |

### Border Colors

| Element | Light Theme | Dark Theme |
|---------|------------|------------|
| Card Borders | `border-slate-200` | `dark:border-slate-700` |
| Nav Border | `border-slate-200` | `dark:border-slate-800` |
| Input Borders | `border-slate-300` | `dark:border-slate-700` |

### Component-Specific Colors

#### Navigation Bar
```tsx
// Light: White with subtle border
bg-white/80 border-slate-200

// Dark: Dark background with darker border
dark:bg-slate-950/80 dark:border-slate-800
```

#### Buttons
```tsx
// Primary Button
bg-navy-800 dark:bg-navy-700
hover:bg-navy-900 dark:hover:bg-navy-600

// Secondary Button  
bg-white dark:bg-slate-800
border-slate-200 dark:border-slate-700
text-navy-900 dark:text-white
```

#### Cards
```tsx
bg-white dark:bg-slate-800
border-slate-200 dark:border-slate-700
shadow-soft
```

#### Feature Icons
```tsx
// Blue variant
bg-blue-100 dark:bg-blue-900/30
text-accent-blue

// Green variant
bg-green-100 dark:bg-green-900/30
text-accent-green

// Purple variant
bg-purple-100 dark:bg-purple-900/30
text-accent-purple
```

## Theme Toggle Button

### Implementation
```tsx
<button
  onClick={() => setTheme(isDark ? 'light' : 'dark')}
  className="btn-icon"
>
  {isDark ? '☀️' : '🌙'}
</button>
```

### Current Behavior
- **Icon**: Sun (☀️) in dark mode, Moon (🌙) in light mode
- **Position**: Top navigation bar, far right
- **State**: Session-based (resets on page reload)

## Upgrading to Persistent Themes

### With localStorage
```tsx
'use client';

import { useState, useEffect } from 'react';

const LandingPage = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // Detect system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      {/* ... */}
    </div>
  );
};
```

### With next-themes Package
```bash
npm install next-themes
```

```tsx
// app/providers.tsx
'use client';

import { ThemeProvider } from 'next-themes';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  );
}

// components/landing/LandingPage.tsx
import { useTheme } from 'next-themes';

const LandingPage = () => {
  const { theme, setTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Toggle
    </button>
  );
};
```

## Tailwind Dark Mode Configuration

### Already Configured in tailwind.config.js
```js
module.exports = {
  darkMode: 'class', // Uses 'dark' class on root element
  // ...
}
```

### Usage Pattern
```tsx
<div className="bg-white dark:bg-slate-900">
  <h1 className="text-navy-900 dark:text-white">Heading</h1>
  <p className="text-slate-600 dark:text-slate-400">Body text</p>
</div>
```

## Design Principles

### 1. Contrast Ratios
- **Light Mode**: Dark text on light backgrounds (WCAG AAA)
- **Dark Mode**: Light text on dark backgrounds (WCAG AA minimum)

### 2. Color Consistency
- Accent colors (blue, green, purple) remain vibrant in both themes
- Only adjust opacity/saturation, not hue

### 3. Shadow Adjustments
```tsx
// Light mode: Subtle shadows
shadow-soft // rgba(0, 0, 0, 0.05)

// Dark mode: Can keep or reduce opacity
dark:shadow-none // or darker shadows
```

### 4. Image Handling
```tsx
// Invert logos in dark mode
<img className="dark:invert" />

// Or use separate images
{isDark ? <LogoDark /> : <LogoLight />}
```

## Component Examples

### Hero Section
```tsx
<section className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
  <h1 className="text-navy-900 dark:text-white">
    Reduce Delivery Costs by 30%
  </h1>
  <p className="text-slate-600 dark:text-slate-400">
    AI-powered route optimization for last-mile logistics
  </p>
</section>
```

### Trust Badge
```tsx
<div className="bg-navy-50 dark:bg-navy-900/30 text-navy-800 dark:text-navy-300">
  <Award className="w-4 h-4" />
  Winner - Ghana Tech Awards 2025
</div>
```

### Pricing Card (Featured)
```tsx
<div className="bg-navy-800 dark:bg-navy-700 border-navy-800 dark:border-navy-600">
  <h3 className="text-white">Professional</h3>
  <p className="text-slate-300">For growing businesses</p>
  {/* Features */}
  <CheckCircle className="text-green-400" />
  <span className="text-white">Unlimited riders</span>
</div>
```

### Footer
```tsx
<footer className="bg-slate-950 dark:bg-black">
  <h4 className="text-white">Product</h4>
  <a className="text-slate-400 hover:text-white">Features</a>
</footer>
```

## Testing Checklist

- [ ] All text readable in both themes
- [ ] Contrast ratios meet WCAG standards
- [ ] Buttons clearly visible and clickable
- [ ] Form inputs have clear borders
- [ ] Icons maintain proper contrast
- [ ] Shadows don't create visual noise in dark mode
- [ ] No pure black (#000) or pure white (#FFF) usage
- [ ] Smooth transitions when toggling themes

## Browser Compatibility

### Tested On
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (macOS)
- ⚠️ Safari (iOS) - Test on device
- ⚠️ Chrome (Android) - Test on device

### Known Issues
- Theme toggle resets on page reload (by design)
- No system preference detection (can be added)
- No transition animation on theme change (can be added)

## Future Enhancements

1. **System Preference Detection**
   - Automatically match OS theme on first visit
   - Listen for system theme changes

2. **Smooth Transitions**
   ```css
   * {
     transition: background-color 0.3s ease,
                 color 0.3s ease,
                 border-color 0.3s ease;
   }
   ```

3. **Per-Component Themes**
   - Allow users to customize accent colors
   - Save preferences per user account

4. **High Contrast Mode**
   - Additional accessibility option
   - Meets WCAG AAA standards

5. **Auto-Switching**
   - Light mode during day (6am-6pm)
   - Dark mode at night (6pm-6am)

---

**Theme Colors Reference**:
- Navy: `#0a1929` (950) to `#f0f4f8` (50)
- Slate: `#0f172a` (900) to `#f8fafc` (50)
- Accent Blue: `#3b82f6`
- Accent Green: `#10b981`
- Accent Purple: `#8b5cf6`
