# Phase 5: Framework Verification - Research

**Researched:** 2026-01-24
**Domain:** Web Components / Custom Elements framework interoperability
**Confidence:** HIGH

## Summary

Framework verification for Lit web components is well-supported across React 19+, Vue 3, and Svelte 5. All three frameworks score **100%** on the Custom Elements Everywhere test suite, meaning the core interoperability is guaranteed at the platform level.

React 19 introduced native web component support with automatic property/attribute handling and event listening, eliminating the need for `@lit/react` wrappers in most cases. Vue 3 has always had excellent custom element support via its `isCustomElement` compiler option and automatic property detection with the `in` operator. Svelte 5 uses a similar heuristic to React for property vs. attribute decisions and supports all event naming conventions.

The main verification work involves creating minimal test apps in each framework, importing the built components, and confirming: (1) properties pass correctly, (2) events fire and can be handled, (3) slots work as expected, (4) TypeScript provides adequate type safety, and (5) no console errors appear.

**Primary recommendation:** Create isolated Vite-based test apps for each framework in `examples/`, import the built library, and manually verify all component features work identically across frameworks.

## Standard Stack

The established libraries/tools for framework verification:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19+ | React integration target | First version with full custom element support |
| Vue | 3.4+ | Vue integration target | Mature custom element support, 100% CEE score |
| Svelte | 5+ | Svelte integration target | Property heuristic + full event support |
| Vite | 7.x | Build tool for test apps | Fast dev server, TypeScript support, framework plugins |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @vitejs/plugin-react | latest | React Vite plugin | React test app |
| @vitejs/plugin-vue | latest | Vue Vite plugin | Vue test app |
| @sveltejs/vite-plugin-svelte | latest | Svelte Vite plugin | Svelte test app |
| TypeScript | 5.x | Type checking | All test apps for type verification |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Direct usage | @lit/react wrapper | Wrapper adds overhead, not needed in React 19+ |
| Manual event binding | Framework event syntax | All frameworks now support native event syntax |
| npm link | Source import | Using built output more realistic |

**Installation (per framework app):**

```bash
# React 19
npm create vite@latest examples/react -- --template react-ts
cd examples/react && npm install

# Vue 3
npm create vite@latest examples/vue -- --template vue-ts
cd examples/vue && npm install

# Svelte 5
npm create vite@latest examples/svelte -- --template svelte-ts
cd examples/svelte && npm install
```

## Architecture Patterns

### Recommended Project Structure

```
examples/
├── react/                # React 19+ test app
│   ├── src/
│   │   ├── App.tsx       # Component usage examples
│   │   ├── types.d.ts    # Custom element type declarations
│   │   └── main.tsx
│   └── package.json
├── vue/                  # Vue 3 test app
│   ├── src/
│   │   ├── App.vue       # Component usage examples
│   │   └── main.ts
│   ├── vite.config.ts    # isCustomElement config
│   └── package.json
└── svelte/               # Svelte 5 test app
    ├── src/
    │   ├── App.svelte    # Component usage examples
    │   └── main.ts
    └── package.json
```

### Pattern 1: React 19 Custom Element Usage

**What:** Direct usage of web components in React 19+ with native support
**When to use:** Always for React 19+
**Example:**
```tsx
// Source: https://custom-elements-everywhere.com/ (React ^19 section)
// No wrapper needed in React 19+

import 'lit-ui'; // Side-effect import to register custom elements

function App() {
  const handleClose = (e: CustomEvent) => {
    console.log('Dialog closed:', e.detail.reason);
  };

  return (
    <>
      <ui-button variant="primary" onClick={() => console.log('clicked')}>
        Click Me
      </ui-button>

      <ui-dialog open onClose={handleClose}>
        <span slot="title">Dialog Title</span>
        <p>Content here</p>
      </ui-dialog>
    </>
  );
}
```

### Pattern 2: Vue 3 Custom Element Configuration

**What:** Configure Vue to recognize custom elements and skip component resolution
**When to use:** Always for Vue 3 apps using custom elements
**Example:**
```typescript
// vite.config.ts
// Source: https://vuejs.org/guide/extras/web-components
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // Treat tags with 'ui-' prefix as custom elements
          isCustomElement: (tag) => tag.startsWith('ui-')
        }
      }
    })
  ]
})
```

### Pattern 3: Vue 3 Custom Element Usage

**What:** Using custom elements in Vue templates with proper event handling
**When to use:** All Vue 3 component usage
**Example:**
```vue
<!-- App.vue -->
<!-- Source: https://vuejs.org/guide/extras/web-components -->
<script setup lang="ts">
import 'lit-ui';

function handleClose(e: CustomEvent) {
  console.log('Dialog closed:', e.detail.reason);
}
</script>

<template>
  <ui-button variant="primary" @click="() => console.log('clicked')">
    Click Me
  </ui-button>

  <!-- Use .prop modifier for complex data if needed -->
  <ui-dialog :open="isOpen" @close="handleClose">
    <span slot="title">Dialog Title</span>
    <p>Content here</p>
  </ui-dialog>
</template>
```

### Pattern 4: Svelte 5 Custom Element Usage

**What:** Direct custom element usage in Svelte 5 with event handling
**When to use:** All Svelte 5 apps
**Example:**
```svelte
<!-- App.svelte -->
<!-- Source: https://svelte.dev/docs/svelte/custom-elements -->
<script lang="ts">
  import 'lit-ui';

  let isOpen = $state(false);

  function handleClose(e: CustomEvent) {
    console.log('Dialog closed:', e.detail.reason);
    isOpen = false;
  }
</script>

<ui-button variant="primary" onclick={() => console.log('clicked')}>
  Click Me
</ui-button>

<ui-dialog open={isOpen} onclose={handleClose}>
  <span slot="title">Dialog Title</span>
  <p>Content here</p>
</ui-dialog>
```

### Pattern 5: React TypeScript Declarations

**What:** Adding custom element types to JSX.IntrinsicElements
**When to use:** When TypeScript complains about unknown elements
**Example:**
```typescript
// types.d.ts
// Source: https://github.com/jakelazaroff/til/blob/main/typescript/add-custom-element-to-jsx-intrinsic-elements.md
import type { Button, Dialog } from 'lit-ui';

type CustomElement<T> = React.DetailedHTMLProps<React.HTMLAttributes<T>, T> &
  Partial<T>;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'ui-button': CustomElement<Button>;
      'ui-dialog': CustomElement<Dialog>;
    }
  }
}
```

### Anti-Patterns to Avoid

- **Using @lit/react in React 19+:** The wrapper is unnecessary since React 19 natively supports custom elements. Only use if you need SSR or specific edge cases.
- **Setting attributes for complex data:** Always use properties (automatic in all frameworks) for objects/arrays. In Vue, use `.prop` modifier if auto-detection fails.
- **Kebab-case event names in React:** React 19 uses camelCase for custom events (e.g., `onClose` not `on-close`).
- **Forgetting isCustomElement in Vue:** Without this config, Vue logs "failed to resolve component" warnings.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| React wrapper for web components | Custom wrapper HOC | Direct usage (React 19+) | React 19 has native support |
| Vue custom element registration | Manual registration | `isCustomElement` config | Built into Vue compiler |
| Event type bridging | Manual type wrappers | Framework-native CustomEvent handling | All frameworks handle CustomEvent.detail |
| Property reflection | Custom attribute observers | Lit's reactive properties | Already handled by component implementation |

**Key insight:** All three frameworks (React 19+, Vue 3, Svelte 5) now have native custom element support. The verification work is confirming it works, not building compatibility layers.

## Common Pitfalls

### Pitfall 1: Event Naming Conventions

**What goes wrong:** Events don't fire because of naming mismatches between component and framework
**Why it happens:** Different frameworks expect different event naming conventions
**How to avoid:**
- Components should dispatch events with lowercase or kebab-case names (e.g., `close`, `my-event`)
- React 19 uses `onEventName` (camelCase with `on` prefix)
- Vue uses `@event-name` (kebab-case preferred)
- Svelte uses `oneventname` (lowercase with `on` prefix)
**Warning signs:** Events silently don't fire, no console errors

### Pitfall 2: Missing composed:true on Custom Events

**What goes wrong:** Events don't bubble out of Shadow DOM to framework handlers
**Why it happens:** CustomEvent defaults to `composed: false`
**How to avoid:** Always dispatch events with `{ bubbles: true, composed: true }`
**Warning signs:** Event handlers attached to component never fire

**Verification:** The Dialog component already uses `bubbles: true, composed: true`:
```typescript
this.dispatchEvent(
  new CustomEvent('close', {
    detail: { reason },
    bubbles: true,
    composed: true,
  })
);
```

### Pitfall 3: Vue "Failed to Resolve Component" Warnings

**What goes wrong:** Console floods with warnings about unknown components
**Why it happens:** Vue tries to resolve custom elements as Vue components first
**How to avoid:** Configure `isCustomElement` in vite.config.ts
**Warning signs:** Yellow console warnings during development

### Pitfall 4: TypeScript Errors for Custom Elements in JSX

**What goes wrong:** TypeScript complains `Property 'ui-button' does not exist on type 'JSX.IntrinsicElements'`
**Why it happens:** React's JSX types don't include custom element definitions
**How to avoid:** Create type declaration file augmenting JSX.IntrinsicElements
**Warning signs:** Red squiggles under custom element tags

### Pitfall 5: Boolean Attribute vs Property Confusion

**What goes wrong:** Boolean props like `disabled` or `loading` don't work correctly
**Why it happens:** HTML attributes are strings; `disabled="false"` is still disabled
**How to avoid:** Rely on framework's property binding (React, Vue, Svelte all handle this correctly)
**Warning signs:** Elements stuck in disabled/loading state despite prop being false

### Pitfall 6: Slots Not Rendering Content

**What goes wrong:** Slotted content doesn't appear inside the component
**Why it happens:** Using wrong slot syntax for the framework
**How to avoid:**
- Use native `slot` attribute for all frameworks: `<span slot="title">Title</span>`
- Don't use Vue's `v-slot` directive with custom elements
**Warning signs:** Empty slots, content not visible

## Code Examples

Verified patterns from official sources:

### Complete React 19 Example

```tsx
// App.tsx - React 19+ with TypeScript
// Source: https://custom-elements-everywhere.com/ + https://react.dev/blog/2024/12/05/react-19

import { useState } from 'react';
import 'lit-ui';

function App() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleButtonClick = () => {
    console.log('Button clicked');
    setDialogOpen(true);
  };

  const handleDialogClose = (e: CustomEvent<{ reason: string }>) => {
    console.log('Dialog closed with reason:', e.detail.reason);
    setDialogOpen(false);
  };

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div>
      <h1>React 19 Web Components Test</h1>

      {/* All button variants */}
      <ui-button variant="primary">Primary</ui-button>
      <ui-button variant="secondary">Secondary</ui-button>
      <ui-button variant="outline">Outline</ui-button>
      <ui-button variant="ghost">Ghost</ui-button>
      <ui-button variant="destructive">Destructive</ui-button>

      {/* Sizes */}
      <ui-button size="sm">Small</ui-button>
      <ui-button size="md">Medium</ui-button>
      <ui-button size="lg">Large</ui-button>

      {/* States */}
      <ui-button disabled>Disabled</ui-button>
      <ui-button loading={loading} onClick={handleSubmit}>
        {loading ? 'Loading...' : 'Submit'}
      </ui-button>

      {/* Event handling */}
      <ui-button onClick={handleButtonClick}>Open Dialog</ui-button>

      {/* Dialog */}
      <ui-dialog open={dialogOpen} onClose={handleDialogClose}>
        <span slot="title">Test Dialog</span>
        <p>This is dialog content.</p>
        <div slot="footer">
          <ui-button onClick={() => setDialogOpen(false)}>Close</ui-button>
        </div>
      </ui-dialog>
    </div>
  );
}

export default App;
```

### Complete Vue 3 Example

```vue
<!-- App.vue - Vue 3 with TypeScript -->
<!-- Source: https://vuejs.org/guide/extras/web-components -->
<script setup lang="ts">
import { ref } from 'vue';
import 'lit-ui';

const dialogOpen = ref(false);
const loading = ref(false);

function handleButtonClick() {
  console.log('Button clicked');
  dialogOpen.value = true;
}

function handleDialogClose(e: CustomEvent<{ reason: string }>) {
  console.log('Dialog closed with reason:', e.detail.reason);
  dialogOpen.value = false;
}

function handleSubmit() {
  loading.value = true;
  setTimeout(() => loading.value = false, 2000);
}
</script>

<template>
  <div>
    <h1>Vue 3 Web Components Test</h1>

    <!-- All button variants -->
    <ui-button variant="primary">Primary</ui-button>
    <ui-button variant="secondary">Secondary</ui-button>
    <ui-button variant="outline">Outline</ui-button>
    <ui-button variant="ghost">Ghost</ui-button>
    <ui-button variant="destructive">Destructive</ui-button>

    <!-- Sizes -->
    <ui-button size="sm">Small</ui-button>
    <ui-button size="md">Medium</ui-button>
    <ui-button size="lg">Large</ui-button>

    <!-- States -->
    <ui-button disabled>Disabled</ui-button>
    <ui-button :loading="loading" @click="handleSubmit">
      {{ loading ? 'Loading...' : 'Submit' }}
    </ui-button>

    <!-- Event handling -->
    <ui-button @click="handleButtonClick">Open Dialog</ui-button>

    <!-- Dialog -->
    <ui-dialog :open="dialogOpen" @close="handleDialogClose">
      <span slot="title">Test Dialog</span>
      <p>This is dialog content.</p>
      <div slot="footer">
        <ui-button @click="dialogOpen = false">Close</ui-button>
      </div>
    </ui-dialog>
  </div>
</template>
```

### Complete Svelte 5 Example

```svelte
<!-- App.svelte - Svelte 5 with TypeScript -->
<!-- Source: https://svelte.dev/docs/svelte/custom-elements -->
<script lang="ts">
  import 'lit-ui';

  let dialogOpen = $state(false);
  let loading = $state(false);

  function handleButtonClick() {
    console.log('Button clicked');
    dialogOpen = true;
  }

  function handleDialogClose(e: CustomEvent<{ reason: string }>) {
    console.log('Dialog closed with reason:', e.detail.reason);
    dialogOpen = false;
  }

  function handleSubmit() {
    loading = true;
    setTimeout(() => loading = false, 2000);
  }
</script>

<div>
  <h1>Svelte 5 Web Components Test</h1>

  <!-- All button variants -->
  <ui-button variant="primary">Primary</ui-button>
  <ui-button variant="secondary">Secondary</ui-button>
  <ui-button variant="outline">Outline</ui-button>
  <ui-button variant="ghost">Ghost</ui-button>
  <ui-button variant="destructive">Destructive</ui-button>

  <!-- Sizes -->
  <ui-button size="sm">Small</ui-button>
  <ui-button size="md">Medium</ui-button>
  <ui-button size="lg">Large</ui-button>

  <!-- States -->
  <ui-button disabled>Disabled</ui-button>
  <ui-button loading={loading} onclick={handleSubmit}>
    {loading ? 'Loading...' : 'Submit'}
  </ui-button>

  <!-- Event handling -->
  <ui-button onclick={handleButtonClick}>Open Dialog</ui-button>

  <!-- Dialog -->
  <ui-dialog open={dialogOpen} onclose={handleDialogClose}>
    <span slot="title">Test Dialog</span>
    <p>This is dialog content.</p>
    <div slot="footer">
      <ui-button onclick={() => dialogOpen = false}>Close</ui-button>
    </div>
  </ui-dialog>
</div>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| @lit/react wrapper required for React | Native custom element support | React 19 (Dec 2024) | No wrapper overhead, simpler integration |
| Manual property binding in React | Automatic property/attribute heuristic | React 19 (Dec 2024) | Just works |
| Framework-specific event adapters | Native CustomEvent handling | React 19 / Vue 3 / Svelte 4+ | Unified event model |
| createEventDispatcher in Svelte | Callback props pattern | Svelte 5 (Oct 2024) | Better TypeScript, simpler API |

**Deprecated/outdated:**
- **@lit/react wrapper:** Not needed for React 19+, only use for React 18 or SSR
- **Vue 2 custom element syntax:** Use Vue 3's `isCustomElement` compiler option instead
- **Svelte createEventDispatcher:** Still works but Svelte 5 prefers callback props

## Open Questions

Things that couldn't be fully resolved:

1. **v-model with custom elements in Vue 3**
   - What we know: v-model requires emitting `update:modelValue` event and accepting `modelValue` prop
   - What's unclear: Current Button/Dialog don't need v-model (no two-way bound value)
   - Recommendation: Skip v-model verification; document pattern if future components need it

2. **Form participation across Shadow DOM in React/Vue/Svelte**
   - What we know: Button uses ElementInternals for form association
   - What's unclear: Whether forms defined in framework templates properly associate with custom element buttons
   - Recommendation: Add form submission test case to each framework app

3. **TypeScript event types in template contexts**
   - What we know: React supports custom event typing via JSX.IntrinsicElements
   - What's unclear: Vue/Svelte template type checking for CustomEvent.detail
   - Recommendation: Verify IDE autocomplete works, accept runtime type safety as sufficient

## Sources

### Primary (HIGH confidence)

- [Custom Elements Everywhere](https://custom-elements-everywhere.com/) - React 100%, Vue 100%, Svelte 100% scores
- [React 19 Release Notes](https://react.dev/blog/2024/12/05/react-19) - Native custom element support
- [Vue and Web Components Guide](https://vuejs.org/guide/extras/web-components) - isCustomElement, property binding
- [Svelte Custom Elements Docs](https://svelte.dev/docs/svelte/custom-elements) - Custom element usage

### Secondary (MEDIUM confidence)

- [Frontend Masters: React 19 Web Components](https://frontendmasters.com/blog/react-19-and-web-component-examples/) - Practical examples
- [Lit React Integration Docs](https://lit.dev/docs/frameworks/react/) - @lit/react wrapper (for reference)
- [Shadow DOM Events](https://javascript.info/shadow-dom-events) - composed/bubbles behavior

### Tertiary (LOW confidence)

- Various Medium articles on framework integration - Used for cross-reference only

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All frameworks at 100% CEE score, versions verified
- Architecture: HIGH - Patterns from official documentation
- Pitfalls: HIGH - Well-documented in official resources and issue trackers

**Research date:** 2026-01-24
**Valid until:** 2026-04-24 (3 months - stable domain, frameworks mature)
