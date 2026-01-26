# Phase 25: Docs Site Dark Mode - Research

**Researched:** 2026-01-25
**Domain:** CSS theming, React state management, localStorage persistence
**Confidence:** HIGH

## Summary

This phase adds dark mode support to the existing React/Vite docs site. The docs site is a Vite + React 18 + Tailwind CSS v4 application with an existing color system using OKLCH color space. The implementation requires: (1) a theme context for global state, (2) CSS custom properties for dark mode colors, (3) Tailwind CSS v4 `@custom-variant` configuration for class-based dark mode, (4) localStorage persistence with system preference detection, and (5) an inline `<head>` script to prevent flash of wrong theme (FOUC).

The codebase already has patterns for context-based state management (ConfiguratorContext), Tailwind CSS v4 with OKLCH colors, and header modifications. The existing ModeToggle in the configurator controls which color palette is being *edited* (light vs dark component themes), not the docs site theme itself. The new implementation must unify the configurator's toggle with a new header toggle so both control the same docs site theme state.

**Primary recommendation:** Create a new ThemeContext at the app root level, add class-based dark mode via Tailwind's `@custom-variant`, inject an inline script in index.html for FOUC prevention, and ensure the configurator's ModeToggle syncs with the global docs theme.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React Context | 18.x | Global theme state | Already used in codebase (ConfiguratorContext), native React |
| Tailwind CSS v4 | 4.0.0 | CSS utilities with dark mode | Already in use, supports `@custom-variant` for class-based dark mode |
| localStorage | Native | Theme persistence | Standard browser API, no dependencies |
| lucide-react | 0.469.0 | Sun/Moon icons | Already in use for other icons |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| prism-react-renderer | 2.4.1 | Code syntax highlighting | Already in use, has dark/light themes |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom context | next-themes | overkill for Vite app, adds dependency |
| localStorage | cookies | localStorage simpler for client-only site |
| CSS variables | Tailwind darkMode media | media query doesn't persist user choice |

**Installation:**
```bash
# No new dependencies needed - all tools already available
```

## Architecture Patterns

### Recommended Project Structure
```
apps/docs/src/
├── contexts/
│   ├── ConfiguratorContext.tsx  # Existing - theme customization
│   └── ThemeContext.tsx         # NEW - docs site dark/light mode
├── components/
│   ├── Header.tsx               # MODIFY - add theme toggle
│   ├── ThemeToggle.tsx          # NEW - sun/moon toggle button
│   └── configurator/
│       └── ModeToggle.tsx       # MODIFY - sync with ThemeContext
├── index.css                    # MODIFY - add dark mode CSS variables
└── ...
apps/docs/
└── index.html                   # MODIFY - add inline FOUC prevention script
```

### Pattern 1: ThemeContext with localStorage
**What:** React context managing theme state with localStorage persistence
**When to use:** Any component needs to read or change theme
**Example:**
```typescript
// Source: Standard React pattern + shadcn/ui approach
interface ThemeContextValue {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    // Initial state from localStorage or system preference
    // Note: Actual initialization happens in index.html script
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  });

  const setTheme = useCallback((newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

### Pattern 2: FOUC Prevention Script
**What:** Inline script in `<head>` that runs before React hydration
**When to use:** Always - prevents flash of wrong theme on page load
**Example:**
```html
<!-- Source: https://tailwindcss.com/docs/dark-mode + shadcn pattern -->
<head>
  <script>
    (function() {
      try {
        var theme = localStorage.getItem('theme');
        if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
          document.documentElement.classList.add('dark');
        }
      } catch (e) {}
    })();
  </script>
</head>
```

### Pattern 3: Tailwind CSS v4 Class-Based Dark Mode
**What:** Custom variant in CSS for class-based dark mode activation
**When to use:** Required for Tailwind CSS v4 with class-based dark mode
**Example:**
```css
/* Source: https://tailwindcss.com/docs/dark-mode */
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));
```

### Anti-Patterns to Avoid
- **Using media query only:** User choice won't persist, can't override system preference
- **React state without DOM class:** FOUC on page load since React hydrates late
- **localStorage without try-catch:** Fails in private browsing mode on some browsers
- **Animated theme transitions:** Context decision specifies "instant, no animation"

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| System preference detection | Manual mediaQuery polling | Single check in inline script | One-time check sufficient per context decision |
| Icon transitions | Custom SVG animations | lucide-react Sun/Moon components | Already using lucide-react |
| Dark color calculations | Manual OKLCH math | CSS custom properties | CSS variables cascade automatically |

**Key insight:** The complexity is in the coordination (FOUC prevention, state sync between toggles) not the individual pieces. Focus on the orchestration.

## Common Pitfalls

### Pitfall 1: Flash of Unstyled Content (FOUC)
**What goes wrong:** Page loads in light mode, flickers to dark mode when React hydrates
**Why it happens:** React state initializes after DOM renders, localStorage read is too late
**How to avoid:** Inline blocking script in `<head>` before `<body>` sets dark class immediately
**Warning signs:** Visible flash on page load when user has dark preference

### Pitfall 2: Theme State Desync
**What goes wrong:** Header toggle shows "dark" but configurator toggle shows "light"
**Why it happens:** Two separate state sources not sharing the same context
**How to avoid:** Single ThemeContext at app root, both toggles consume same context
**Warning signs:** Toggles showing different states, clicking one doesn't update the other

### Pitfall 3: Hardcoded Colors in Components
**What goes wrong:** Some elements don't change color in dark mode
**Why it happens:** Using `bg-white` instead of `bg-background` or CSS variables
**How to avoid:** Audit all components for hardcoded colors, replace with semantic variables
**Warning signs:** White backgrounds visible in dark mode, especially in cards/modals

### Pitfall 4: Code Block Theme Not Switching
**What goes wrong:** Code blocks stay dark/light regardless of site theme
**Why it happens:** prism-react-renderer theme is statically set, not reactive to context
**How to avoid:** Pass theme prop dynamically based on ThemeContext
**Warning signs:** Code blocks look wrong contrast-wise in one mode

### Pitfall 5: localStorage Access Fails
**What goes wrong:** Theme preference lost on reload in private/incognito mode
**Why it happens:** Some browsers restrict localStorage in private mode
**How to avoid:** Wrap localStorage calls in try-catch, fall back to system preference
**Warning signs:** Users report theme not persisting in private browsing

## Code Examples

Verified patterns from official sources:

### Theme Toggle Button
```typescript
// Source: shadcn/ui pattern + lucide-react
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100 transition-colors"
      title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
```

### Dark Mode CSS Variables
```css
/* Source: shadcn/ui theming approach adapted for OKLCH */
@theme {
  /* Light mode (default) */
  --color-background: oklch(1 0 0);
  --color-foreground: oklch(0.145 0 0);
  --color-muted-foreground: oklch(0.50 0 0);
  --color-border: oklch(0.90 0 0);
  --color-card: oklch(1 0 0);
}

/* Dark mode overrides via custom variant */
.dark {
  --color-background: oklch(0.10 0 0);
  --color-foreground: oklch(0.95 0 0);
  --color-muted-foreground: oklch(0.65 0 0);
  --color-border: oklch(0.25 0 0);
  --color-card: oklch(0.12 0 0);
}
```

### Syncing Configurator ModeToggle
```typescript
// Modified ModeToggle to sync with docs theme
import { useTheme } from '../../contexts/ThemeContext';
import { useConfigurator } from '../../contexts/ConfiguratorContext';
import { useEffect } from 'react';

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const { activeMode, setActiveMode } = useConfigurator();

  // Sync configurator activeMode with docs theme
  useEffect(() => {
    setActiveMode(theme);
  }, [theme, setActiveMode]);

  const handleModeChange = (mode: 'light' | 'dark') => {
    setTheme(mode);  // This updates docs theme
    // activeMode will sync via useEffect
  };

  // ... rest of component using handleModeChange
}
```

### prism-react-renderer Theme Switching
```typescript
// Source: prism-react-renderer docs
import { Highlight, themes } from 'prism-react-renderer';
import { useTheme } from '../contexts/ThemeContext';

export function CodeBlock({ code, language }: Props) {
  const { theme } = useTheme();

  // Use nightOwl for both - it's a dark theme that works well
  // The code block container already has dark styling
  const prismTheme = themes.nightOwl;

  return (
    <Highlight theme={prismTheme} code={code} language={language}>
      {/* ... */}
    </Highlight>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Tailwind `darkMode: 'class'` in config | `@custom-variant dark` in CSS | Tailwind v4 (2024) | No JS config file needed |
| prefers-color-scheme only | Class-based with localStorage | Standard practice | User choice persists |
| next-themes for all React apps | Native context for non-Next apps | Always | Simpler for Vite/CRA |

**Deprecated/outdated:**
- `tailwind.config.js` darkMode setting: Replaced by `@custom-variant` in Tailwind v4
- React 17 patterns: Using React 18 with concurrent features

## Open Questions

None - the context decisions and research provide clear direction for all aspects:
1. Toggle placement and design: Specified in CONTEXT.md
2. Color palette: shadcn-inspired neutral dark, Claude's discretion on exact values
3. Transition behavior: Instant, no animation
4. Configurator sync: Unified state, both toggles visible

## Sources

### Primary (HIGH confidence)
- [Tailwind CSS v4 Dark Mode](https://tailwindcss.com/docs/dark-mode) - `@custom-variant` syntax, class-based approach
- [shadcn/ui Dark Mode](https://ui.shadcn.com/docs/dark-mode) - FOUC prevention pattern, localStorage approach
- Codebase analysis - existing patterns in ConfiguratorContext, Header, ModeToggle

### Secondary (MEDIUM confidence)
- [prism-react-renderer GitHub](https://github.com/FormidableLabs/prism-react-renderer) - available themes
- [Tailwind v4 Discussion](https://github.com/tailwindlabs/tailwindcss/discussions/13863) - selector strategy

### Tertiary (LOW confidence)
- General dark mode implementation blogs - patterns verified against official docs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - using existing codebase patterns and official Tailwind v4 docs
- Architecture: HIGH - patterns well-established, verified against official sources
- Pitfalls: HIGH - documented in multiple official and community sources

**Research date:** 2026-01-25
**Valid until:** 2026-02-25 (stable domain, no rapid changes expected)
