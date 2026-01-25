# Phase 20: Documentation - Research

**Researched:** 2026-01-25
**Domain:** Technical documentation for component library (React docs site, Vite, React Router)
**Confidence:** HIGH

## Summary

This phase updates the existing React/Vite docs site with three new documentation areas: NPM installation guide (primary path), SSR setup guides (Next.js and Astro), and migration guide (copy-source to npm). The existing docs site at `apps/docs/` provides a well-established pattern to follow: React functional components using a consistent layout with header, sections, code blocks, and navigation.

Key findings:
1. **Existing patterns are solid**: The docs site uses proven patterns (CodeBlock, FrameworkTabs, PrevNextNav) that can be reused. No new infrastructure needed.
2. **Content structure is clear**: GettingStarted.tsx and component pages provide templates for the new pages.
3. **Navigation updates required**: `nav.ts` needs new sections for Installation and SSR/Guides.
4. **SSR examples exist in project**: The Next.js and Astro examples in `examples/` folder provide verified code patterns for documentation.

**Primary recommendation:** Create three new pages following existing patterns, update nav.ts and App.tsx routing, focus on minimal-but-complete code examples per CONTEXT.md constraints.

## Standard Stack

The docs site is already built with an established stack:

### Core (Existing)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.x | UI framework | Already used for docs site |
| Vite | 6.x | Build tool | Already configured |
| React Router | 7.x | Routing | Already configured for docs |
| Tailwind CSS | 4.x | Styling | Already configured with custom theme |

### Supporting (Existing Components)
| Component | Location | Purpose | When to Use |
|-----------|----------|---------|-------------|
| CodeBlock | `src/components/CodeBlock.tsx` | Syntax highlighting | All code examples |
| FrameworkTabs | `src/components/FrameworkTabs.tsx` | React/Vue/Svelte tabs | Framework-specific code |
| PrevNextNav | `src/components/PrevNextNav.tsx` | Page navigation | Bottom of every page |
| ExampleBlock | `src/components/ExampleBlock.tsx` | Live preview + code | Interactive examples |

### No New Dependencies
No additional packages needed. All functionality available through existing components.

## Architecture Patterns

### Recommended File Structure

```
apps/docs/src/
├── pages/
│   ├── GettingStarted.tsx          # MODIFY: Simplify to overview, link to Installation
│   ├── Installation.tsx            # NEW: NPM primary + copy-source alternative
│   ├── SSRGuide.tsx                # NEW: Next.js + Astro setup steps
│   └── MigrationGuide.tsx          # NEW: copy-source -> npm migration
├── nav.ts                          # MODIFY: Add new sections
└── App.tsx                         # MODIFY: Add new routes
```

### Pattern 1: Page Structure (from GettingStarted.tsx)

**What:** Consistent page layout with header, numbered sections, and navigation
**When to use:** All new documentation pages
**Example:**
```tsx
// Source: apps/docs/src/pages/GettingStarted.tsx (existing pattern)
export function InstallationPage() {
  return (
    <div className="max-w-4xl">
      {/* Header with title and description */}
      <header className="relative mb-16 animate-fade-in-up opacity-0 stagger-1">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-4 md:text-5xl">
          Installation
        </h1>
        <p className="text-lg text-gray-500 leading-relaxed max-w-2xl">
          Install LitUI components via npm or copy source files.
        </p>
      </header>

      {/* Numbered sections with icons */}
      <section id="npm-install" className="scroll-mt-20 mb-16 animate-fade-in-up opacity-0 stagger-2">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
            {/* Icon SVG */}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">NPM Installation</h2>
            <p className="text-sm text-gray-500">Recommended approach</p>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
        </div>
        {/* Section content */}
      </section>

      {/* Navigation */}
      <div className="divider-fade mb-8" />
      <PrevNextNav prev={...} next={...} />
    </div>
  );
}
```

### Pattern 2: Code Examples (from ButtonPage.tsx)

**What:** Inline code with CodeBlock component, minimal and focused
**When to use:** All installation commands and code snippets
**Example:**
```tsx
// Source: apps/docs/src/pages/components/ButtonPage.tsx (existing pattern)
const installCommand = `npm install @lit-ui/core @lit-ui/button @lit-ui/dialog`;

// In component:
<CodeBlock code={installCommand} language="bash" />
```

### Pattern 3: Info Boxes (from GettingStarted.tsx)

**What:** Styled callout boxes for tips and alternatives
**When to use:** Alternative package managers, important notes
**Example:**
```tsx
// Source: apps/docs/src/pages/GettingStarted.tsx (existing pattern)
<div className="mt-6 p-4 rounded-xl bg-gray-50 border border-gray-100">
  <p className="text-sm text-gray-600">
    <span className="font-medium text-gray-700">Using yarn or pnpm?</span>{' '}
    Use <code className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-xs font-mono">pnpm add @lit-ui/core</code> instead.
  </p>
</div>
```

### Pattern 4: Navigation Sections (from nav.ts)

**What:** Grouped navigation items with section titles
**When to use:** Organizing new pages in sidebar
**Example:**
```typescript
// Source: apps/docs/src/nav.ts (existing pattern)
export const navigation: NavSection[] = [
  {
    title: "Overview",
    items: [
      { title: "Getting Started", href: "/getting-started" },
      { title: "Installation", href: "/installation" },  // NEW
    ],
  },
  {
    title: "Guides",  // NEW SECTION
    items: [
      { title: "SSR Setup", href: "/guides/ssr" },
      { title: "Migration", href: "/guides/migration" },
    ],
  },
  {
    title: "Components",
    items: [
      { title: "Button", href: "/components/button" },
      { title: "Dialog", href: "/components/dialog" },
    ],
  },
]
```

### Anti-Patterns to Avoid

- **Linking to examples/ folder:** CONTEXT.md specifies all code inline in docs
- **Full boilerplate in examples:** Keep examples minimal, showing only relevant lines
- **Theory/explanation of DSD/hydration:** CONTEXT.md specifies "just the how"
- **Using different styling patterns:** Follow existing Tailwind classes and components

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Code syntax highlighting | Custom highlighter | Existing CodeBlock component | Already styled, works with all languages |
| Tab switching for frameworks | Custom tabs | FrameworkTabs if needed | Already handles React/Vue/Svelte |
| Navigation | Custom nav handling | nav.ts + existing Sidebar | Already integrated with layout |
| Page routing | Manual routes | React Router via App.tsx | Already configured |
| Styling | Custom CSS | Existing Tailwind classes | Consistent with rest of docs |

**Key insight:** The docs site already has all the infrastructure needed. Focus on content creation, not component building.

## Common Pitfalls

### Pitfall 1: Incorrect Import Order for SSR
**What goes wrong:** Hydration fails silently, components re-render or flash
**Why it happens:** @lit-ui/ssr/hydration must be imported before any Lit components
**How to avoid:** Document the import order clearly, emphasize "MUST be first"
**Warning signs:** Components work but show visual flash on page load

### Pitfall 2: Forgetting 'use client' in Next.js
**What goes wrong:** RSC serialization fails with DSD templates
**Why it happens:** React Server Components can't serialize Shadow DOM templates
**How to avoid:** Document that Lit components require client components in Next.js
**Warning signs:** Hydration mismatch errors in console

### Pitfall 3: Missing FOUC Prevention CSS
**What goes wrong:** Components flash unstyled before JS loads
**Why it happens:** Custom elements are undefined until JS executes
**How to avoid:** Document the fouc.css import with brief explanation
**Warning signs:** Visual flash on initial page load

### Pitfall 4: Inconsistent Mode After Migration
**What goes wrong:** Some imports point to local files, others to npm packages
**Why it happens:** Partial migration or missed import updates
**How to avoid:** Document the import update step clearly in migration guide
**Warning signs:** Module not found errors after migration

### Pitfall 5: Documentation Mismatch with Existing Content
**What goes wrong:** New pages contradict or duplicate existing GettingStarted content
**Why it happens:** Not reviewing existing content before writing new pages
**How to avoid:** Update GettingStarted to be an overview that links to Installation
**Warning signs:** Users confused about which page to follow

## Code Examples

Verified patterns from the existing codebase:

### NPM Installation Commands
```typescript
// Source: packages/cli/README.md, packages/core/README.md
const npmInstall = `npm install @lit-ui/core @lit-ui/button @lit-ui/dialog`;
const singleComponent = `npm install @lit-ui/button`;
```

### Basic Usage After NPM Install
```typescript
// Source: packages/button/README.md
const usage = `import '@lit-ui/button';

// Use in JSX
<lui-button variant="primary">Click me</lui-button>`;
```

### SSR Hydration Setup (Next.js)
```typescript
// Source: examples/nextjs/app/components/LitDemo.tsx
const nextjsHydration = `'use client';

// MUST be first import
import '@lit-ui/ssr/hydration';

// Then import components
import '@lit-ui/button';
import '@lit-ui/dialog';`;
```

### SSR Hydration Setup (Astro)
```typescript
// Source: examples/astro/src/pages/index.astro
const astroHydration = `---
// Frontmatter: register components for SSR
import '@lit-ui/button';
import '@lit-ui/dialog';
---

<script>
  // Client script: hydration first, then components
  import '@lit-ui/ssr/hydration';
  import '@lit-ui/button';
  import '@lit-ui/dialog';
</script>`;
```

### FOUC Prevention CSS
```typescript
// Source: packages/core/src/fouc.css
const foucCSS = `/* Hide undefined custom elements */
lui-button:not(:defined),
lui-dialog:not(:defined) {
  opacity: 0;
  visibility: hidden;
}`;
```

### CLI Migration Command
```typescript
// Source: packages/cli/README.md
const migrateCommand = `npx lit-ui migrate`;
```

### Import Changes After Migration
```typescript
// Source: packages/cli/src/commands/migrate.ts (output format)
const importChange = `// Before (copy-source)
import './components/ui/button';

// After (npm)
import '@lit-ui/button';`;
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Copy-source only | NPM + copy-source choice | v2.0 (current milestone) | Developers choose their trade-off |
| No SSR support | Declarative Shadow DOM | v2.0 (current milestone) | Works with Next.js/Astro SSR |
| Manual migration | CLI migrate command | v2.0 (current milestone) | Automated with diff detection |

**Current/Recent:**
- Lit SSR is stable via @lit-labs/ssr
- Declarative Shadow DOM is widely supported (Chrome 111+, Safari 16.4+, Firefox 123+)
- Astro has official @astrojs/lit integration

**Deprecated/outdated:**
- Manual hydration (use @lit-ui/ssr/hydration side-effect import instead)

## Open Questions

All questions have been resolved through codebase investigation:

1. **Resolved: Page structure** - Follow existing GettingStarted.tsx pattern
2. **Resolved: Code examples** - Use existing CodeBlock component with minimal snippets
3. **Resolved: Navigation** - Add "Guides" section in nav.ts
4. **Resolved: SSR patterns** - Use examples from examples/nextjs and examples/astro

No unresolved questions for planning.

## Sources

### Primary (HIGH confidence)
- `apps/docs/src/pages/GettingStarted.tsx` - Page structure pattern
- `apps/docs/src/pages/components/ButtonPage.tsx` - API reference pattern
- `apps/docs/src/nav.ts` - Navigation structure
- `apps/docs/src/components/CodeBlock.tsx` - Code syntax highlighting
- `examples/nextjs/app/components/LitDemo.tsx` - Next.js SSR pattern
- `examples/astro/src/pages/index.astro` - Astro SSR pattern
- `packages/cli/src/commands/init.ts` - CLI init flow for documentation
- `packages/cli/src/commands/migrate.ts` - CLI migrate flow for documentation
- `packages/ssr/src/hydration.ts` - Hydration import pattern
- `packages/core/src/fouc.css` - FOUC prevention CSS

### Secondary (MEDIUM confidence)
- [Lit SSR Documentation](https://lit.dev/docs/ssr/overview/) - Official Lit SSR guidance
- [Astro Lit Integration](https://docs.astro.build/en/guides/integrations-guide/lit/) - Official Astro integration docs

### Tertiary (LOW confidence)
- Web search results for documentation patterns (general guidance only)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Using existing docs site infrastructure
- Architecture: HIGH - Following existing patterns from GettingStarted.tsx, ButtonPage.tsx
- Pitfalls: HIGH - Based on actual implementation in examples/ and package code
- Code examples: HIGH - Extracted from verified working code in the codebase

**Research date:** 2026-01-25
**Valid until:** 2026-02-24 (30 days - stable domain, documentation rarely changes patterns)
