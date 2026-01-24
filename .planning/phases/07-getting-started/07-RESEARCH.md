# Phase 7: Getting Started - Research

**Researched:** 2026-01-24
**Domain:** Documentation Page (Getting Started / Onboarding)
**Confidence:** HIGH

## Summary

This phase creates a single "Getting Started" documentation page that guides new users through installation, quick start, and project structure. The documentation infrastructure already exists (React 18, Vite, Tailwind v4, React Router), and the CLI (`npx lit-ui init`, `npx lit-ui add`) is fully functional. The components (Button, Dialog) work in React, Vue, and Svelte.

Research focused on three areas: (1) code block patterns for framework tabs and copy buttons, (2) live preview approaches for component demonstrations, and (3) documentation UX best practices. The project already has syntax highlighting token classes defined in `index.css` and a monospace font configured (`JetBrains Mono`).

**Primary recommendation:** Build reusable `CodeBlock` and `FrameworkTabs` components using `prism-react-renderer` for syntax highlighting, native Clipboard API for copy functionality, and render the actual lit-ui Button component inline for live preview.

## Standard Stack

The established libraries/tools for this phase:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| prism-react-renderer | ^2.x | Syntax highlighting | Powers Docusaurus, small bundle, TypeScript, VSCode themes, no global pollution |
| Native Clipboard API | Built-in | Copy to clipboard | No dependencies, good browser support (93%+), async-friendly |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | ^0.469.0 | Icons (Copy, Check) | Already installed in docs |
| @radix-ui/react-tabs | ^1.x | Accessible tabs | If framework tabs need advanced features (already using Radix for other components) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| prism-react-renderer | shiki (react-shiki) | Shiki: more accurate (TextMate grammars), but requires async loading. prism-react-renderer is simpler for static code blocks. |
| prism-react-renderer | react-syntax-highlighter | RSH: larger bundle, global pollution issues. prism-react-renderer is cleaner. |
| Native Clipboard | react-copy-to-clipboard | Library is just a wrapper around native API, unnecessary dependency |
| Custom tabs | @radix-ui/react-tabs | Radix adds accessibility, but simple div+button tabs may suffice |

**Installation:**
```bash
npm install prism-react-renderer
```

## Architecture Patterns

### Recommended Project Structure
```
docs/src/
├── components/
│   ├── CodeBlock.tsx        # Syntax highlighting + copy button
│   ├── FrameworkTabs.tsx    # React/Vue/Svelte code switcher
│   └── LivePreview.tsx      # Renders actual lit-ui components
├── pages/
│   └── GettingStarted.tsx   # Single page: install + quick start + structure
└── nav.ts                   # Update: single getting-started route
```

### Pattern 1: CodeBlock Component
**What:** Reusable code block with syntax highlighting and copy button
**When to use:** Every code snippet in documentation
**Example:**
```tsx
// Pattern for CodeBlock component
import { Highlight, themes } from 'prism-react-renderer';
import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language: string;
  filename?: string;
}

export function CodeBlock({ code, language, filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative code-block rounded-lg overflow-hidden">
      {filename && (
        <div className="px-4 py-2 border-b border-gray-800 text-gray-400 text-sm font-mono">
          {filename}
        </div>
      )}
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 p-2 text-gray-400 hover:text-white rounded transition-colors"
        aria-label={copied ? 'Copied!' : 'Copy code'}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
      <Highlight theme={themes.nightOwl} code={code.trim()} language={language}>
        {({ tokens, getLineProps, getTokenProps }) => (
          <pre className="p-4 overflow-x-auto text-sm">
            <code>
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })}>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </code>
          </pre>
        )}
      </Highlight>
    </div>
  );
}
```

### Pattern 2: FrameworkTabs Component
**What:** Tab switcher showing code for React, Vue, Svelte
**When to use:** Any code that differs by framework (component usage)
**Example:**
```tsx
// Pattern for FrameworkTabs component
import { useState } from 'react';

type Framework = 'react' | 'vue' | 'svelte';

interface FrameworkTabsProps {
  react: string;
  vue: string;
  svelte: string;
  language?: string;
}

export function FrameworkTabs({ react, vue, svelte, language = 'tsx' }: FrameworkTabsProps) {
  const [active, setActive] = useState<Framework>('react');

  const code = { react, vue, svelte }[active];
  const langMap = { react: 'tsx', vue: 'vue', svelte: 'svelte' };

  return (
    <div>
      <div className="flex border-b border-gray-200" role="tablist">
        {(['react', 'vue', 'svelte'] as const).map((fw) => (
          <button
            key={fw}
            role="tab"
            aria-selected={active === fw}
            onClick={() => setActive(fw)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              active === fw
                ? 'text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {fw.charAt(0).toUpperCase() + fw.slice(1)}
          </button>
        ))}
      </div>
      <CodeBlock code={code} language={langMap[active]} />
    </div>
  );
}
```

### Pattern 3: Live Preview for Web Components
**What:** Render actual lit-ui components in the documentation
**When to use:** After quick start code to show result
**Example:**
```tsx
// Pattern for LivePreview - renders actual web components
// This works because lit-ui components are web components (custom elements)
// that work in any framework including React

// Import the web component to register it (side effect import)
import 'lit-ui/button'; // Adjust path based on actual setup

export function LivePreview() {
  return (
    <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
      <p className="text-sm text-gray-600 mb-4">Result:</p>
      {/* Use the web component directly in JSX */}
      <ui-button variant="primary">Click me</ui-button>
    </div>
  );
}

// TypeScript: declare the custom element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'ui-button': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
          size?: 'sm' | 'md' | 'lg';
          loading?: boolean;
          disabled?: boolean;
        },
        HTMLElement
      >;
    }
  }
}
```

### Pattern 4: Single Page Structure (Scrollable Flow)
**What:** One page with anchored sections for install, quick start, project structure
**When to use:** Getting started content (per user decision)
**Example:**
```tsx
// Structure for GettingStarted page
export function GettingStarted() {
  return (
    <article className="prose max-w-none">
      {/* Tagline intro */}
      <header className="mb-12">
        <h1>Getting Started</h1>
        <p className="lead">Get up and running in 2 minutes.</p>
      </header>

      {/* Section 1: Installation */}
      <section id="installation" className="scroll-mt-20">
        <h2>Installation</h2>
        {/* Content */}
      </section>

      {/* Section 2: Quick Start */}
      <section id="quick-start" className="scroll-mt-20">
        <h2>Add Your First Component</h2>
        {/* Content + Live Preview */}
      </section>

      {/* Section 3: Project Structure */}
      <section id="project-structure" className="scroll-mt-20">
        <h2>Project Structure</h2>
        {/* File tree + descriptions */}
      </section>

      {/* What's Next */}
      <section id="whats-next" className="scroll-mt-20">
        <h2>What's Next?</h2>
        {/* Links to components, theming, frameworks */}
      </section>
    </article>
  );
}
```

### Anti-Patterns to Avoid
- **Multi-page getting started:** User explicitly chose single scrollable page. Don't split into /installation, /quick-start, /project-structure routes.
- **Animated code typing:** User chose inline live preview, not step-by-step animation. Show static code with rendered result.
- **Autoplay demos:** Let users interact, don't automate button clicks.
- **Excessive callouts:** User specified "sparingly, only for gotchas." Don't overuse info boxes.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Syntax highlighting | Custom tokenizer | prism-react-renderer | 100+ languages, themes, battle-tested |
| Copy to clipboard | Manual execCommand fallback | navigator.clipboard.writeText | Native API, async, cleaner |
| Accessible tabs | DIY keyboard handling | Radix or native with role="tablist" | ARIA compliance is complex |
| Code themes | Custom CSS variables | prism-react-renderer themes | Designed for readability |

**Key insight:** The docs site already has token CSS classes defined (`.token-keyword`, etc.), but prism-react-renderer's inline styles are more reliable and come with proper themes.

## Common Pitfalls

### Pitfall 1: React + Custom Elements Event Handling
**What goes wrong:** React doesn't handle custom element events properly (e.g., `@close` on `<ui-dialog>`)
**Why it happens:** React sets unrecognized props as attributes and doesn't bind custom events
**How to avoid:** For live preview of Button, this isn't an issue (no custom events needed). For Dialog preview in future phases, use refs to attach event listeners manually.
**Warning signs:** `onClose` prop doesn't fire, events appear in DOM but React handler doesn't run

### Pitfall 2: Web Component Registration Timing
**What goes wrong:** Component renders as empty/unstyled before registration
**Why it happens:** Import statement hasn't executed yet, or hydration mismatch
**How to avoid:** Import the component file (side-effect) at the top of the module. The import registers the custom element.
**Warning signs:** Flash of unstyled content, "undefined element" warnings in console

### Pitfall 3: Copy Button Feedback Missing
**What goes wrong:** User clicks copy, nothing visible happens
**Why it happens:** No state management for "copied" feedback
**How to avoid:** Use `useState` to track copied state, show checkmark icon for 2s, then revert to copy icon
**Warning signs:** User uncertainty about whether copy worked, multiple rapid clicks

### Pitfall 4: Inconsistent Code Indentation
**What goes wrong:** Code examples have wrong indentation (leading whitespace from template literals)
**Why it happens:** Multiline template strings preserve whitespace
**How to avoid:** Use `.trim()` on code strings, or dedent utility. Store code in separate constants, not inline JSX.
**Warning signs:** Code blocks have extra leading spaces, misaligned syntax

### Pitfall 5: Missing Package Manager Alternatives
**What goes wrong:** Users with yarn/pnpm confused by npm-only commands
**Why it happens:** Documentation only shows npm
**How to avoid:** Per user decision: npm commands with "Or use yarn/pnpm equivalents" footnote. Don't need full tabs for each PM.
**Warning signs:** Issues/questions about yarn/pnpm usage

## Code Examples

Verified patterns from official sources:

### prism-react-renderer Basic Usage
```tsx
// Source: https://github.com/FormidableLabs/prism-react-renderer
import { Highlight, themes } from 'prism-react-renderer';

const code = `const hello = "world";`;

<Highlight theme={themes.nightOwl} code={code} language="tsx">
  {({ className, style, tokens, getLineProps, getTokenProps }) => (
    <pre className={className} style={style}>
      {tokens.map((line, i) => (
        <div {...getLineProps({ line, key: i })}>
          {line.map((token, key) => (
            <span {...getTokenProps({ token, key })} />
          ))}
        </div>
      ))}
    </pre>
  )}
</Highlight>
```

### Native Clipboard API
```tsx
// Source: MDN Web Docs (Clipboard API)
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
}
```

### Web Component in React (TypeScript)
```tsx
// Source: Lit documentation for framework usage
// Declare custom element for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'ui-button': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        variant?: string;
        size?: string;
        loading?: boolean;
        disabled?: boolean;
      };
    }
  }
}

// Usage in component
function Demo() {
  return <ui-button variant="primary">Click me</ui-button>;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-syntax-highlighter | prism-react-renderer | 2022+ | Smaller bundle, cleaner API, no global pollution |
| document.execCommand('copy') | navigator.clipboard.writeText | 2020+ | Async, more reliable, better security |
| Manual ARIA for tabs | Radix/Headless UI | 2021+ | Proper accessibility without effort |
| Code screenshots | Live code blocks | 2020+ | Copyable, accessible, maintainable |

**Deprecated/outdated:**
- `document.execCommand('copy')`: Deprecated in favor of Clipboard API
- `react-syntax-highlighter` Prism.js global: prism-react-renderer's vendored Prism is preferred

## Open Questions

Things that couldn't be fully resolved:

1. **Live Preview Implementation Details**
   - What we know: Web components work in React, need TypeScript declarations
   - What's unclear: Whether to import from local copy of button or bundled package
   - Recommendation: For docs, create a local copy of the Button component in docs/src/lib/ and import from there. This avoids cross-package dependency complexity.

2. **Route Structure Change**
   - What we know: User wants single /getting-started page, nav.ts currently has separate /installation and /quick-start
   - What's unclear: Exact route path naming
   - Recommendation: Create /getting-started route, update nav.ts to single "Getting Started" item in Getting Started section

## Sources

### Primary (HIGH confidence)
- prism-react-renderer GitHub - https://github.com/FormidableLabs/prism-react-renderer - API patterns, themes, migration guide
- MDN Clipboard API - built-in browser API documentation
- Existing project files - docs/src/index.css (token classes), packages/cli/src/commands/init.ts (CLI output)

### Secondary (MEDIUM confidence)
- Lit documentation for framework usage - https://lit.dev/docs/frameworks/react/ - Web component + React patterns
- WebSearch results for documentation best practices - multiple sources agreeing on code copy buttons, progressive disclosure

### Tertiary (LOW confidence)
- WebSearch results for "best" syntax highlighter - subjective, but prism-react-renderer is well-established

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - prism-react-renderer is industry standard (powers Docusaurus), native Clipboard API is well-supported
- Architecture: HIGH - patterns verified against existing project structure and Lit documentation
- Pitfalls: HIGH - React + Web Components interop is well-documented, copy feedback pattern is universal

**Research date:** 2026-01-24
**Valid until:** 60 days (documentation patterns are stable)
