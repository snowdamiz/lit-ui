# Architecture Research: Theme Customization

**Domain:** Visual theme configurator for Lit/Tailwind component library
**Researched:** 2026-01-25
**Confidence:** HIGH (based on existing codebase analysis and established patterns)

## Executive Summary

The theme customization system integrates with LitUI's existing dual-mode architecture (copy-source vs npm) by adding a visual configurator in the docs site, URL-based token encoding, CLI parameter parsing, and CSS generation. The architecture leverages the existing CSS custom property foundation in `@lit-ui/core` while adding new tooling for customization.

The system follows a "configure once, generate artifacts" model where:
1. Users visually configure tokens in the docs site
2. Configuration is base64url-encoded into a CLI command
3. CLI decodes and generates `lit-ui-tokens.css`
4. Components consume tokens via CSS custom properties (already working)

---

## Integration Points

### 1. Docs Site (apps/docs)

**Current state:**
- React app with React Router
- Component pages at `/components/button`, `/components/dialog`
- Uses Tailwind CSS for styling
- Imports live `@lit-ui/*` packages for demos

**Integration:**
- Add new route: `/theme` or `/customize`
- Add to navigation in `nav.ts`
- New page component: `ThemeConfigurator.tsx`
- Uses existing `LivePreview.tsx` pattern for showing components with applied tokens

**Key constraint:** The configurator UI runs in the docs site (React) but must preview Lit web components with the configured tokens applied via CSS custom properties.

### 2. Token System (@lit-ui/core)

**Current state:**
- `packages/core/src/styles/tailwind.css` - Defines primitive and semantic tokens in `@theme` block
- `packages/core/src/tokens/index.ts` - TypeScript references to CSS variables
- `:root` block defines component-level CSS custom properties (`--ui-button-*`, `--ui-dialog-*`)
- `.dark` block overrides semantic tokens for dark mode

**Integration:**
- Tokens already exist and are well-structured
- CLI will generate `lit-ui-tokens.css` that overrides `:root` values
- Generated file imports before or alongside existing CSS
- No changes to `@lit-ui/core` package required - consumers override via cascade

**Token categories for customization (from existing `tailwind.css`):**

| Category | Existing Variables | Customizable |
|----------|-------------------|--------------|
| Brand Colors | `--color-brand-*` (50-950) | Yes - primary color |
| Semantic Colors | `--color-primary`, `--color-secondary`, etc. | Yes |
| Spacing | `--spacing-*` | Partial (component-specific) |
| Typography | `--font-family-*` | Yes |
| Shadows | `--shadow-*` | Yes |
| Border Radius | `--radius-*` | Yes |
| Component Tokens | `--ui-button-*`, `--ui-dialog-*` | Yes |

### 3. CLI (packages/cli)

**Current state:**
- Commands: `init`, `add`, `list`, `migrate`
- Uses citty framework
- Handles both copy-source and npm modes
- Writes `lit-ui.config.json` for project configuration
- Embedded templates in `templates/index.ts`

**Integration:**
- New command: `lit-ui theme` or extend `lit-ui init --theme <encoded>`
- Parse base64url-encoded token configuration
- Generate `lit-ui-tokens.css` file
- Update `lit-ui.config.json` to track token file path
- Works with both copy-source and npm modes

**CLI flow:**
```
npx lit-ui add button --theme eyJwcmltYXJ5IjoiIzNiODJmNiIsInJhZGl1cyI6IjAuNXJlbSJ9
                              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                              Base64URL encoded: {"primary":"#3b82f6","radius":"0.5rem"}
```

### 4. Component Consumption

**Current state:**
- Components use CSS custom properties in their styles
- `TailwindElement` base class adopts stylesheets in Shadow DOM
- CSS variables cascade from `:root` into Shadow DOM
- Dark mode via `.dark` class on ancestor

**Integration:**
- No component changes required
- Generated `lit-ui-tokens.css` is loaded at document level
- CSS cascade applies custom values automatically
- Components already reference `var(--ui-button-radius)`, etc.

---

## New Components

### 1. Theme Configurator Page (apps/docs)

**File:** `apps/docs/src/pages/ThemeConfigurator.tsx`

**Responsibilities:**
- Visual UI for adjusting design tokens
- Live preview of components with current token values
- Generate shareable URL with encoded config
- Generate CLI command with encoded config
- Copy-to-clipboard functionality

**State management:**
- React useState for token values
- URL query parameter sync for shareability
- Local component state (no global state needed)

**Sub-components needed:**
- `ColorPicker.tsx` - For color token editing
- `SliderInput.tsx` - For spacing/radius values
- `FontSelector.tsx` - For typography options
- `TokenPreview.tsx` - Shows current token values as CSS
- `CommandOutput.tsx` - Displays generated CLI command

### 2. Token Encoder/Decoder (shared)

**File:** `packages/cli/src/utils/tokens.ts` (CLI) and equivalent in docs

**Responsibilities:**
- Define token schema (TypeScript interface)
- Encode token config to base64url string
- Decode base64url string to token config
- Validate token values

**Schema example:**
```typescript
interface ThemeTokens {
  // Brand
  primary: string;       // oklch or hex color
  primaryForeground?: string;

  // UI
  radius: string;        // e.g., "0.5rem"
  shadow?: 'none' | 'sm' | 'md' | 'lg';

  // Component-specific
  buttonRadius?: string;
  dialogRadius?: string;

  // Dark mode overrides
  dark?: {
    primary?: string;
    // ... other overrides
  };
}
```

### 3. CSS Generator (CLI)

**File:** `packages/cli/src/utils/generate-tokens.ts`

**Responsibilities:**
- Transform token config into CSS custom properties
- Generate `:root` block with overrides
- Generate `.dark` block if dark mode tokens provided
- Write `lit-ui-tokens.css` file

**Output example:**
```css
/**
 * LitUI Theme Tokens
 * Generated by: npx lit-ui add button --theme <encoded>
 *
 * Import this file in your main CSS or entry point.
 */
:root {
  /* Brand Override */
  --color-primary: oklch(0.62 0.18 240);
  --color-primary-foreground: white;

  /* Component Overrides */
  --ui-button-radius: 0.5rem;
  --ui-dialog-radius: 0.75rem;
}

.dark {
  --color-primary: oklch(0.70 0.15 240);
}
```

### 4. Theme Command (CLI)

**File:** `packages/cli/src/commands/theme.ts`

**Responsibilities:**
- Parse `--theme` parameter from encoded string
- Call token decoder
- Call CSS generator
- Write output file
- Update `lit-ui.config.json`

---

## Modified Components

### 1. CLI Add Command

**File:** `packages/cli/src/commands/add.ts`

**Changes:**
- Add `--theme` argument option
- If `--theme` provided, decode and generate tokens CSS
- Include token file in installation output

### 2. CLI Config

**File:** `packages/cli/src/utils/config.ts`

**Changes:**
- Add `tokens.css` path to `LitUIConfig` interface
- Track whether tokens file was generated

```typescript
interface LitUIConfig {
  // ... existing fields
  tokens?: {
    path: string;         // e.g., "src/styles/lit-ui-tokens.css"
    generated: boolean;   // Whether CLI generated it
  };
}
```

### 3. Docs Navigation

**File:** `apps/docs/src/nav.ts`

**Changes:**
- Add "Theme" or "Customize" entry to navigation

### 4. Docs App Router

**File:** `apps/docs/src/App.tsx`

**Changes:**
- Add route for theme configurator page

---

## Data Flow

```
+------------------+     +------------------+     +------------------+
|   Docs Site      |     |   URL/Clipboard  |     |   User's CLI     |
|  Configurator    | --> |   Encoded Token  | --> |   lit-ui add     |
|  (React UI)      |     |   Config String  |     |   --theme xxx    |
+------------------+     +------------------+     +------------------+
        |                                                  |
        v                                                  v
+------------------+                          +------------------+
|  Live Preview    |                          |  Token Decoder   |
|  (applies CSS    |                          |  (base64url ->   |
|   vars inline)   |                          |   JSON object)   |
+------------------+                          +------------------+
                                                       |
                                                       v
                                              +------------------+
                                              |  CSS Generator   |
                                              |  (JSON -> CSS    |
                                              |   custom props)  |
                                              +------------------+
                                                       |
                                                       v
                                              +------------------+
                                              | lit-ui-tokens.css|
                                              | (written to user |
                                              |  project)        |
                                              +------------------+
                                                       |
                                                       v
                                              +------------------+
                                              |  Components      |
                                              |  (consume via    |
                                              |   CSS cascade)   |
                                              +------------------+
```

### Encoding Format

Use **base64url** (RFC 4648 Section 5) for URL-safe encoding:
- Replaces `+` with `-` and `/` with `_`
- Omits padding (`=`) for cleaner URLs
- Safe for CLI arguments and URL query parameters

**Example:**
```javascript
// Input
const tokens = { primary: "#3b82f6", radius: "0.5rem" };

// Encode
const json = JSON.stringify(tokens);
const base64 = btoa(json).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
// Result: "eyJwcmltYXJ5IjoiIzNiODJmNiIsInJhZGl1cyI6IjAuNXJlbSJ9"

// Decode
const decoded = JSON.parse(atob(base64.replace(/-/g, '+').replace(/_/g, '/')));
```

---

## Build Order

Recommended implementation sequence based on dependencies:

### Phase 1: Token Infrastructure
**Goal:** Establish encoding/decoding and CSS generation

1. **Token schema definition** (`packages/cli/src/utils/token-schema.ts`)
   - Define TypeScript interface for customizable tokens
   - List all token names and their valid value types
   - No dependencies

2. **Encoder/decoder utilities** (`packages/cli/src/utils/token-encoding.ts`)
   - Base64url encode/decode functions
   - JSON validation against schema
   - Depends on: Token schema

3. **CSS generator** (`packages/cli/src/utils/generate-tokens-css.ts`)
   - Transform token object to CSS string
   - Handle light/dark mode sections
   - Depends on: Token schema

### Phase 2: CLI Integration
**Goal:** CLI can accept and process token configuration

4. **Theme command or add extension** (`packages/cli/src/commands/add.ts` or new `theme.ts`)
   - Add `--theme` parameter parsing
   - Integrate encoder/decoder
   - Call CSS generator
   - Write output file
   - Depends on: Encoder/decoder, CSS generator

5. **Config updates** (`packages/cli/src/utils/config.ts`)
   - Add tokens path to config interface
   - Track generated token files
   - Depends on: Theme command

### Phase 3: Visual Configurator
**Goal:** Users can visually customize and get CLI command

6. **Configurator page scaffold** (`apps/docs/src/pages/ThemeConfigurator.tsx`)
   - Basic page with sections for each token category
   - State management for token values
   - Depends on: Token schema (can duplicate or share)

7. **Input components** (ColorPicker, SliderInput, etc.)
   - Individual controls for different token types
   - Depends on: Configurator scaffold

8. **Live preview**
   - Apply token values as inline CSS variables
   - Show components updating in real-time
   - Depends on: Input components

9. **Command generation**
   - Encode current token state
   - Display copyable CLI command
   - Shareable URL with query params
   - Depends on: Encoder (client-side version), Live preview

### Phase 4: Polish
**Goal:** Complete user experience

10. **Preset themes**
    - Pre-built configurations users can start from
    - One-click application in configurator
    - Depends on: Full configurator

11. **Documentation**
    - Update installation guide with token customization
    - Add theming guide to docs
    - Depends on: All above

---

## Architecture Patterns to Follow

### 1. CSS Custom Property Cascade
Components already consume tokens via CSS custom properties. The generated `lit-ui-tokens.css` overrides `:root` values, which cascade into Shadow DOM automatically.

```css
/* Existing in @lit-ui/core */
:root {
  --color-primary: oklch(0.62 0.18 250);  /* Default blue */
}

/* Generated lit-ui-tokens.css - loaded after core */
:root {
  --color-primary: oklch(0.65 0.20 140);  /* User's green */
}
```

### 2. Separation of Concerns
- **Docs site:** UI only, generates encoded config
- **CLI:** Decodes config, generates CSS artifacts
- **Components:** Consume CSS variables (no changes needed)

### 3. Stateless Configuration
No server storage. All state is encoded in:
- URL query parameters (for sharing configurator state)
- CLI command argument (for applying configuration)

### 4. Progressive Enhancement
Works with existing projects:
- Users without token customization get defaults
- Token file is optional - only generated if `--theme` is used
- Existing CSS variable overrides continue to work

---

## Anti-Patterns to Avoid

### 1. Runtime Theme Switching
**Avoid:** Building JavaScript-based theme switching
**Why:** Adds complexity, bundle size, conflicts with SSR
**Instead:** CSS custom properties with class-based dark mode (already implemented)

### 2. Token Compilation into Components
**Avoid:** Baking token values into component builds
**Why:** Prevents runtime customization, requires rebuild
**Instead:** Components reference CSS variables; users override at document level

### 3. Server-Side Token Storage
**Avoid:** Storing token configs on a server
**Why:** Adds infrastructure complexity, authentication concerns
**Instead:** Encode in URL/CLI command, let users store their own files

### 4. Modifying @lit-ui/core for Themes
**Avoid:** Changing core package to support custom themes
**Why:** Breaks existing users, complicates updates
**Instead:** CSS cascade - user's token file overrides core defaults

---

## Confidence Assessment

| Area | Confidence | Reasoning |
|------|------------|-----------|
| CSS Custom Property Integration | HIGH | Already implemented in codebase, well-understood pattern |
| Base64URL Encoding | HIGH | Standard RFC 4648, widely used for URL-safe encoding |
| CLI Parameter Parsing | HIGH | citty framework already handles this well |
| React Configurator UI | HIGH | Standard React patterns, docs site already uses React |
| Shadow DOM Token Cascade | HIGH | Verified working in existing components |
| Token Schema Design | MEDIUM | Need to balance completeness with complexity |

---

## Sources

- [shadcn/ui Theming Documentation](https://ui.shadcn.com/docs/theming) - CSS variable architecture for component theming
- [Contentful Design Tokens Guide](https://www.contentful.com/blog/design-token-system/) - Token system architecture patterns
- [RFC 4648 Base64URL](https://datatracker.ietf.org/doc/html/rfc4648) - URL-safe encoding specification
- [tweakcn Theme Editor](https://tweakcn.com/) - Example of visual theme configurator for shadcn/ui
- Existing codebase analysis:
  - `/packages/core/src/styles/tailwind.css` - Current token definitions
  - `/packages/cli/src/commands/add.ts` - CLI command patterns
  - `/packages/cli/src/utils/config.ts` - Configuration management
  - `/apps/docs/src/pages/components/ButtonPage.tsx` - Docs page patterns
