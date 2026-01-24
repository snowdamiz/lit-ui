# Phase 6: Docs Foundation - Research

**Researched:** 2026-01-24
**Domain:** React documentation site shell with navigation and responsive layout
**Confidence:** HIGH

## Summary

This research covers building a documentation site foundation using the same stack as the existing landing page: React 18, Vite 6, Tailwind CSS v4, and TypeScript. The docs site needs a sidebar navigation with collapsible sections and a mobile-responsive layout with hamburger menu.

The standard approach is to use React Router v7 for client-side routing with layout routes and the `<Outlet>` pattern for nested content. Navigation should use `<NavLink>` for automatic active state styling. For collapsible sections, use Radix UI Collapsible primitive (accessible, keyboard-navigable, lightweight). Mobile navigation uses a slide-in sheet/drawer pattern built on Radix Dialog primitive.

**Primary recommendation:** Build a layout component with sticky header, fixed sidebar (desktop) / sheet overlay (mobile), and scrollable content area. Use React Router v7 layout routes with Outlet for page content. Use Radix primitives for collapsible sections and mobile sheet.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react | ^18.3.1 | UI framework | Match landing page, required for React Router |
| react-router | ^7.12.0 | Client-side routing | v7 is current stable, unified package (no react-router-dom needed) |
| @radix-ui/react-collapsible | ^1.1.12 | Collapsible sections | WAI-ARIA compliant, keyboard accessible, 4.82KB |
| @radix-ui/react-dialog | ^1.1.15 | Mobile sheet/drawer | Focus trapping, portal, overlay, accessible |
| tailwindcss | ^4.0.0 | Styling | Match landing page, CSS-first config |
| @tailwindcss/vite | ^4.0.0 | Vite integration | Match landing page |
| vite | ^6.0.7 | Build tool | Match landing page |
| typescript | ~5.6.2 | Type safety | Match landing page |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | ^0.469.0 | Icons | Menu icons, chevrons, hamburger icon |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Radix Collapsible | Custom useState toggle | Radix handles accessibility, animations, keyboard; custom is lighter but requires manual a11y |
| Radix Dialog for mobile | react-burger-menu | Radix integrates better with Tailwind, same patterns as collapsible |
| React Router | TanStack Router | React Router v7 is more mature, simpler for docs site scope |

**Installation:**
```bash
npm install react-router @radix-ui/react-collapsible @radix-ui/react-dialog lucide-react
```

## Architecture Patterns

### Recommended Project Structure
```
docs/
├── index.html                 # Entry HTML
├── package.json               # Separate package (like landing)
├── vite.config.ts            # Vite config with React + Tailwind
├── tsconfig.json             # TypeScript config
├── public/
│   └── favicon.svg           # Share with landing
└── src/
    ├── main.tsx              # React entry point
    ├── index.css             # Tailwind + theme variables (copy from landing)
    ├── App.tsx               # Router setup
    ├── routes.tsx            # Route definitions (optional, can be inline)
    ├── components/
    │   ├── Layout.tsx        # Main layout with sidebar + content
    │   ├── Sidebar.tsx       # Desktop sidebar component
    │   ├── MobileNav.tsx     # Mobile sheet navigation
    │   ├── NavSection.tsx    # Collapsible nav section
    │   ├── NavLink.tsx       # Styled nav link wrapper
    │   └── Header.tsx        # Top header (logo, hamburger trigger)
    ├── layouts/
    │   └── DocsLayout.tsx    # Layout route component
    └── pages/
        └── [placeholder].tsx  # Page stubs (content in later phases)
```

### Pattern 1: Layout Routes with Outlet
**What:** Parent route renders persistent layout; child routes render into `<Outlet />`
**When to use:** Documentation sites where sidebar and header persist across pages
**Example:**
```typescript
// Source: https://reactrouter.com/start/framework/routing
import { BrowserRouter, Routes, Route, Outlet } from 'react-router'

// Layout component with persistent sidebar
function DocsLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1">
        <Outlet /> {/* Child routes render here */}
      </main>
    </div>
  )
}

// Route configuration
function App() {
  return (
    <BrowserRouter basename="/docs">
      <Routes>
        <Route element={<DocsLayout />}>
          <Route index element={<GettingStarted />} />
          <Route path="button" element={<ButtonDocs />} />
          <Route path="dialog" element={<DialogDocs />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
```

### Pattern 2: NavLink Active State Styling
**What:** NavLink provides `isActive` state for styling current route
**When to use:** All navigation links in sidebar
**Example:**
```typescript
// Source: https://reactrouter.com/api/components/NavLink
import { NavLink } from 'react-router'

function SidebarLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `block px-3 py-2 rounded-lg text-sm transition-colors ${
          isActive
            ? 'bg-gray-100 text-gray-900 font-medium'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`
      }
    >
      {children}
    </NavLink>
  )
}
```

### Pattern 3: Collapsible Navigation Section
**What:** Radix Collapsible for expandable nav groups
**When to use:** Grouping related navigation items (e.g., "Components" section with Button, Dialog)
**Example:**
```typescript
// Source: https://www.radix-ui.com/primitives/docs/components/collapsible
import * as Collapsible from '@radix-ui/react-collapsible'
import { ChevronRight } from 'lucide-react'

function NavSection({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <Collapsible.Trigger className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium text-gray-900">
        {title}
        <ChevronRight
          className={`h-4 w-4 transition-transform ${open ? 'rotate-90' : ''}`}
        />
      </Collapsible.Trigger>
      <Collapsible.Content className="pl-3">
        {children}
      </Collapsible.Content>
    </Collapsible.Root>
  )
}
```

### Pattern 4: Mobile Sheet Navigation
**What:** Radix Dialog as slide-in sheet for mobile
**When to use:** Mobile breakpoint (< 768px / md)
**Example:**
```typescript
// Source: https://www.radix-ui.com/primitives/docs/components/dialog
import * as Dialog from '@radix-ui/react-dialog'
import { Menu, X } from 'lucide-react'

function MobileNav({ navigation }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger className="md:hidden p-2">
        <Menu className="h-6 w-6" />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 md:hidden" />
        <Dialog.Content className="fixed inset-y-0 left-0 w-72 bg-white p-6 shadow-lg md:hidden">
          <Dialog.Close className="absolute top-4 right-4">
            <X className="h-6 w-6" />
          </Dialog.Close>
          <nav className="mt-8">
            {/* Navigation content */}
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
```

### Pattern 5: Responsive Layout with CSS Grid
**What:** Grid layout for header + sidebar + content
**When to use:** Main docs layout
**Example:**
```typescript
function DocsLayout() {
  return (
    <div className="min-h-screen">
      {/* Fixed header */}
      <Header className="fixed top-0 left-0 right-0 h-16 z-40" />

      <div className="pt-16 flex">
        {/* Desktop sidebar - hidden on mobile */}
        <aside className="hidden md:block fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] overflow-y-auto border-r border-gray-200 p-6">
          <Sidebar />
        </aside>

        {/* Main content - offset by sidebar on desktop */}
        <main className="flex-1 md:ml-64 p-6 max-w-4xl">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
```

### Anti-Patterns to Avoid
- **Sidebar DOM before main content:** Screen readers hit sidebar first. Use CSS to position, keep main content first in DOM or use skip-to-content link.
- **Non-semantic nav elements:** Use `<nav>`, `<aside>`, `<a>` tags properly. Don't use div+onClick for navigation.
- **Breaking back button:** Let React Router handle navigation. Don't use `window.location` or prevent default link behavior.
- **Hardcoded responsive values:** Use Tailwind breakpoints consistently. Don't mix px with md: utilities.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Collapsible sections | Custom useState + height animation | @radix-ui/react-collapsible | Keyboard navigation, ARIA attributes, animation CSS vars |
| Mobile drawer/sheet | Custom fixed positioning + state | @radix-ui/react-dialog | Focus trapping, scroll locking, ESC handling, portal |
| Active link styling | Manual pathname comparison | React Router NavLink | Handles nested routes, end prop, pending states |
| Scroll position on nav | Custom scroll restoration | React Router handles | Built into router, edge cases handled |
| Focus management on nav | Custom focus() calls | Radix primitives | Proper focus order, trap, restore |

**Key insight:** Accessibility is the hidden complexity. Keyboard navigation, screen reader support, and focus management require significant code that Radix handles correctly.

## Common Pitfalls

### Pitfall 1: Sidebar Fixed Position Breaking with Overflow
**What goes wrong:** Sidebar position: fixed stops working when a parent has `overflow: hidden` or `transform`
**Why it happens:** CSS spec - fixed positioning is relative to viewport unless ancestor creates new containing block
**How to avoid:** Keep sidebar as direct child of body-level element, no transforms on ancestors
**Warning signs:** Sidebar scrolls with content, doesn't stick to viewport

### Pitfall 2: Mobile Menu Not Closing on Navigation
**What goes wrong:** User taps nav link, page changes but drawer stays open
**Why it happens:** Navigation happens but Dialog state isn't updated
**How to avoid:** Close dialog on route change using useEffect with location dependency, or close in onClick before navigation
**Warning signs:** User has to manually close menu after every navigation

### Pitfall 3: Wrong Semantic Structure for Screen Readers
**What goes wrong:** Screen readers announce content in confusing order
**Why it happens:** DOM order follows visual layout (sidebar left, content right) but sidebar comes first
**How to avoid:** Use `<main>` before `<aside>` in DOM, position with CSS. Add skip-to-content link.
**Warning signs:** Screen reader users report confusion, accessibility audit fails

### Pitfall 4: NavLink isActive on Parent Routes
**What goes wrong:** Parent route link stays "active" on all child routes
**Why it happens:** React Router matches partially by default
**How to avoid:** Use `end` prop on NavLink for exact matching when needed
**Warning signs:** Multiple nav items appear active simultaneously

### Pitfall 5: Content Shifts When Sidebar Toggles
**What goes wrong:** Main content jumps when mobile nav opens/closes
**Why it happens:** Overlay causes scroll lock, body width changes
**How to avoid:** Radix Dialog handles this, but verify. Use `overflow-y: scroll` on body always, or `scrollbar-gutter: stable`
**Warning signs:** Visible horizontal shift on menu open

### Pitfall 6: Hamburger Menu Not Keyboard Accessible
**What goes wrong:** Can't open mobile menu with keyboard
**Why it happens:** Using div with onClick instead of button, or missing focus styles
**How to avoid:** Use Radix Dialog.Trigger (renders as button), ensure visible focus ring
**Warning signs:** Tab doesn't reach menu trigger, no focus indicator

## Code Examples

Verified patterns from official sources:

### Router Setup with basename
```typescript
// Source: React Router docs - for docs at /docs path
import { BrowserRouter } from 'react-router'

function App() {
  return (
    <BrowserRouter basename="/docs">
      <Routes>
        {/* Routes are relative to /docs */}
        <Route path="/" element={<Home />} />        {/* /docs */}
        <Route path="/button" element={<Button />} /> {/* /docs/button */}
      </Routes>
    </BrowserRouter>
  )
}
```

### Collapsible with Animation
```typescript
// Source: Radix UI Collapsible docs
// CSS for smooth height animation
const styles = `
  .CollapsibleContent {
    overflow: hidden;
  }
  .CollapsibleContent[data-state='open'] {
    animation: slideDown 200ms ease-out;
  }
  .CollapsibleContent[data-state='closed'] {
    animation: slideUp 200ms ease-out;
  }
  @keyframes slideDown {
    from { height: 0; }
    to { height: var(--radix-collapsible-content-height); }
  }
  @keyframes slideUp {
    from { height: var(--radix-collapsible-content-height); }
    to { height: 0; }
  }
`
```

### Responsive Visibility Classes
```typescript
// Tailwind v4 breakpoints (mobile-first)
// sm: 640px, md: 768px, lg: 1024px, xl: 1280px

// Desktop only (768px+)
<aside className="hidden md:block">...</aside>

// Mobile only (below 768px)
<button className="md:hidden">...</button>

// Different layouts per breakpoint
<div className="flex flex-col md:flex-row">...</div>
```

### Dialog Close on Route Change
```typescript
// Source: Pattern for closing mobile nav on navigation
import { useLocation } from 'react-router'

function MobileNav() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  // Close on route change
  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {/* ... */}
    </Dialog.Root>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-router-dom separate package | react-router unified (v7) | 2024 | Single import, cleaner setup |
| activeClassName prop on NavLink | className function with isActive | v6 (2021) | More flexible, supports pending state |
| Custom scroll restoration | Built-in to React Router | v6.4+ | Less code, handles edge cases |
| Manual ARIA on collapsibles | Radix primitives | Ongoing | Correct accessibility by default |
| CSS @media queries | Tailwind responsive prefixes | Ongoing | Faster iteration, consistent breakpoints |
| Tailwind config.js | Tailwind v4 CSS @theme | 2024 | CSS-first, no JS config |

**Deprecated/outdated:**
- `react-router-dom`: Use `react-router` directly in v7
- `activeClassName`/`activeStyle` on NavLink: Removed in v6, use className function
- Tailwind `tailwind.config.js`: v4 uses `@theme` in CSS (project already uses this)

## Open Questions

Things that couldn't be fully resolved:

1. **Exact folder structure for multi-app monorepo**
   - What we know: Landing is in `/landing`, docs should be `/docs`, both separate Vite apps
   - What's unclear: Should they share node_modules? How to handle shared assets?
   - Recommendation: Keep separate package.json like landing, copy theme CSS. Can optimize sharing later.

2. **Navigation data structure**
   - What we know: Need collapsible sections with nested links
   - What's unclear: Best format for navigation config (array of objects? nested structure?)
   - Recommendation: Simple array of sections, each with title and items array. Define in separate file for easy editing.

## Sources

### Primary (HIGH confidence)
- [React Router Official Docs](https://reactrouter.com/) - NavLink, Outlet, routing patterns
- [Radix UI Collapsible](https://www.radix-ui.com/primitives/docs/components/collapsible) - Component API, accessibility, animations
- [Radix UI Dialog](https://www.radix-ui.com/primitives/docs/components/dialog) - Sheet/drawer pattern, focus management
- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design) - Breakpoints, mobile-first approach
- Existing landing page code (`/landing/`) - Theme variables, styling patterns, Vite config

### Secondary (MEDIUM confidence)
- [shadcn/ui Sidebar](https://ui.shadcn.com/docs/components/sidebar) - Pattern reference for sidebar structure
- [Level Access Navigation Pitfalls](https://www.levelaccess.com/blog/accessible-navigation-menus-pitfalls-and-best-practices/) - Accessibility patterns
- [Robin Wieruch React Router Tutorial](https://www.robinwieruch.de/react-router/) - v7 patterns verified against official docs

### Tertiary (LOW confidence)
- WebSearch results for common pitfalls - patterns collected, should verify during implementation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Based on existing landing page + official React Router docs
- Architecture: HIGH - Layout routes + Outlet is documented React Router pattern, Radix primitives are well-documented
- Pitfalls: MEDIUM - Collected from multiple sources, some are experiential not documented

**Research date:** 2026-01-24
**Valid until:** 2026-02-24 (stable stack, unlikely to change)
