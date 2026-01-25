# Phase 22: CLI Theme Integration - Research

**Researched:** 2026-01-25
**Domain:** CLI command integration, file system operations, CSS import injection
**Confidence:** HIGH

## Summary

This phase integrates the theme system (built in Phase 21) into the CLI commands. The theme module already provides encoding/decoding, validation, and CSS generation. This phase adds:

1. `--theme` parameter to `lit-ui init` for initial project setup
2. Standalone `lit-ui theme <encoded>` command for adding/updating themes post-init
3. Auto-detection of main CSS entry file and import injection
4. Generation of `lit-ui-theme.css` file in project root

The existing CLI architecture (citty commands, fs-extra file operations, consola prompts) provides all needed patterns. The theme module's `decodeThemeConfig` and `generateThemeCSS` functions are the core integration points.

**Primary recommendation:** Extend `init.ts` with `--theme` parameter and create new `theme.ts` command. Implement CSS entry file detection utility that checks common locations (Vite, Next.js, generic patterns). Use fs-extra for atomic file writes and insert-line patterns for import injection.

## Standard Stack

The established libraries/tools for this domain:

### Core (Already in CLI)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| citty | ^0.1.6 | CLI argument parsing | Already used; TypeScript-first, clean subcommand API |
| fs-extra | ^11.3.0 | File operations | Already used; atomic writes, directory creation |
| consola | ^3.4.0 | Prompts and logging | Already used; confirmation prompts |
| picocolors | ^1.1.1 | Terminal colors | Already used; success/warning/error formatting |

### Already Available (Theme Module)
| Library | Version | Purpose | Why Available |
|---------|---------|---------|---------------|
| colorjs.io | ^0.5.2 | OKLCH manipulation | Used by theme module for color derivation |
| zod | ^4.3.6 | Schema validation | Used by theme module for config validation |

### No New Dependencies Needed

All required functionality exists in the current codebase:
- Theme encoding/decoding: `src/theme/encoding.ts`
- CSS generation: `src/theme/css-generator.ts`
- File operations: fs-extra (already installed)
- CLI patterns: citty defineCommand (already established)

## Architecture Patterns

### Recommended Project Structure
```
packages/cli/src/
├── commands/
│   ├── init.ts           # Add --theme parameter (extend existing)
│   ├── theme.ts          # NEW: lit-ui theme <encoded> command
│   └── ...
├── theme/                # EXISTS from Phase 21
│   ├── index.ts          # Public exports
│   ├── encoding.ts       # decode/encode functions
│   ├── css-generator.ts  # generateThemeCSS
│   └── ...
├── utils/
│   ├── detect-css-entry.ts  # NEW: Find main CSS file
│   ├── inject-import.ts     # NEW: Add @import to CSS file
│   └── ...
```

### Pattern 1: Theme Parameter on Init Command
**What:** Add optional `--theme` string parameter to `lit-ui init`
**When to use:** Initial project setup with custom theme
**Example:**
```typescript
// Source: Existing init.ts pattern
export const init = defineCommand({
  meta: { name: 'init', description: 'Initialize lit-ui in your project' },
  args: {
    // ... existing args ...
    theme: {
      type: 'string',
      description: 'Encoded theme configuration from configurator',
      required: false,
    },
  },
  async run({ args }) {
    // ... existing init logic ...

    // After base file setup, handle theme if provided
    if (args.theme) {
      await applyTheme(cwd, args.theme);
    } else {
      // Show hint about theme customization
      info('Tip: Use --theme to customize colors. Get one at https://lit-ui.dev/themes');
    }
  },
});
```

### Pattern 2: Standalone Theme Command
**What:** Dedicated command for adding/updating theme post-init
**When to use:** When user wants to add or change theme after initial setup
**Example:**
```typescript
// Source: Citty defineCommand pattern from existing commands
export const theme = defineCommand({
  meta: {
    name: 'theme',
    description: 'Apply a theme configuration to your project',
  },
  args: {
    config: {
      type: 'positional',
      description: 'Encoded theme configuration from configurator',
      required: true,
    },
    cwd: {
      type: 'string',
      description: 'Working directory',
      default: '.',
    },
  },
  async run({ args }) {
    const cwd = resolve(args.cwd);
    await applyTheme(cwd, args.config);
  },
});
```

### Pattern 3: Shared Theme Application Logic
**What:** Reusable function for both init --theme and theme command
**When to use:** Apply theme CSS to project
**Example:**
```typescript
// Source: CONTEXT.md decisions + existing patterns
import { decodeThemeConfig, generateThemeCSS } from '../theme/index.js';

async function applyTheme(cwd: string, encoded: string): Promise<void> {
  // Check for existing theme file
  const themeFilePath = resolve(cwd, 'lit-ui-theme.css');
  if (await pathExists(themeFilePath)) {
    const replace = await consola.prompt('Theme exists. Replace?', {
      type: 'confirm',
      initial: false,
    });
    if (!replace) {
      info('Theme unchanged.');
      return;
    }
  }

  // Decode and validate (throws on error)
  let config: ThemeConfig;
  try {
    config = decodeThemeConfig(encoded);
  } catch (err) {
    error('Invalid theme. Generate a new one from the configurator.');
    info('https://lit-ui.dev/themes');
    process.exit(1);
  }

  // Generate CSS
  const css = generateThemeCSS(config);
  await writeFile(themeFilePath, css);
  success('Theme applied.');

  // Auto-inject import
  await injectThemeImport(cwd);
}
```

### Pattern 4: CSS Entry File Detection
**What:** Find the main CSS file where Tailwind is imported
**When to use:** Auto-injecting @import for theme CSS
**Example:**
```typescript
// Source: Common project patterns + CONTEXT.md discretion
const CSS_ENTRY_CANDIDATES = [
  // Next.js (App Router)
  'app/globals.css',
  'src/app/globals.css',
  // Vite React/Vue
  'src/index.css',
  'src/styles/index.css',
  'src/main.css',
  // Generic
  'styles/globals.css',
  'src/styles/globals.css',
  'src/styles/tailwind.css',
];

async function detectCssEntry(cwd: string): Promise<string | null> {
  for (const candidate of CSS_ENTRY_CANDIDATES) {
    const fullPath = resolve(cwd, candidate);
    if (await pathExists(fullPath)) {
      // Verify it looks like a Tailwind entry (contains @import "tailwindcss" or @tailwind)
      const content = await readFile(fullPath, 'utf-8');
      if (content.includes('@import') || content.includes('@tailwind')) {
        return candidate;
      }
    }
  }
  return null;
}
```

### Pattern 5: Import Injection with Idempotency
**What:** Add @import line to CSS file if not already present
**When to use:** Ensuring theme CSS is loaded
**Example:**
```typescript
// Source: fs-extra patterns + safe file modification
async function injectThemeImport(cwd: string): Promise<void> {
  const cssEntry = await detectCssEntry(cwd);

  if (!cssEntry) {
    warn('Could not detect main CSS file. Manually add:');
    info("  @import 'lit-ui-theme.css';");
    return;
  }

  const fullPath = resolve(cwd, cssEntry);
  const content = await readFile(fullPath, 'utf-8');

  // Idempotency: check if already imported
  if (content.includes('lit-ui-theme.css')) {
    info(`Theme already imported in ${file(cssEntry)}`);
    return;
  }

  // Prepend import (after any @charset or existing @imports)
  const importLine = "@import 'lit-ui-theme.css';\n";
  const lines = content.split('\n');

  // Find insertion point (after @charset, before first non-import line)
  let insertIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith('@charset') || trimmed.startsWith('@import')) {
      insertIndex = i + 1;
    } else if (trimmed && !trimmed.startsWith('/*')) {
      break;
    }
  }

  lines.splice(insertIndex, 0, importLine.trim());
  await writeFile(fullPath, lines.join('\n'));
  success(`Added theme import to ${file(cssEntry)}`);
}
```

### Anti-Patterns to Avoid
- **Silently overwriting theme file:** Always prompt when theme exists
- **Crashing on invalid theme:** Catch decode errors, show friendly message with configurator URL
- **Assuming CSS file location:** Use detection with warning fallback
- **Modifying user's CSS without idempotency:** Check for existing import before adding

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Theme decoding | Manual base64 + JSON | `decodeThemeConfig` | 4-stage validation, descriptive errors |
| CSS generation | Template strings | `generateThemeCSS` | Dark mode derivation, radius mapping |
| Overwrite prompts | readline | consola.prompt | Consistent UI, handles non-TTY |
| File existence check | existsSync | fs-extra pathExists | Async, consistent with other utils |
| Path normalization | path.join | pathe | Cross-platform, already used |

**Key insight:** Phase 21 built the complete theme pipeline. Phase 22 only needs to wire it into CLI commands and handle file system integration.

## Common Pitfalls

### Pitfall 1: Non-Interactive Environment Handling
**What goes wrong:** Prompts hang in CI/CD when theme exists
**Why it happens:** consola.prompt waits for input that never comes
**How to avoid:** Respect `--yes` flag to skip prompts; detect non-TTY and use defaults
**Warning signs:** CLI hangs in automated scripts
```typescript
// Prevention: Check TTY or --yes flag
if (!process.stdout.isTTY || args.yes) {
  info('Theme exists. Skipping (use interactive mode to replace).');
  return;
}
```

### Pitfall 2: Theme Decode Error UX
**What goes wrong:** Cryptic Zod error messages confuse users
**Why it happens:** Exposing internal validation errors directly
**How to avoid:** Catch decode errors, show minimal "invalid theme" message with configurator URL
**Warning signs:** Users confused by "colors.primary: Expected string, received undefined"
```typescript
// Prevention: User-friendly error wrapping
try {
  config = decodeThemeConfig(encoded);
} catch {
  error('Invalid theme. Generate a new one from the configurator.');
  info('https://lit-ui.dev/themes');
  process.exit(1);
}
```

### Pitfall 3: CSS Import Duplication
**What goes wrong:** Multiple `@import 'lit-ui-theme.css'` lines after running theme command repeatedly
**Why it happens:** Blindly prepending without checking
**How to avoid:** Check if import already exists before adding
**Warning signs:** CSS file grows with duplicate imports

### Pitfall 4: Relative Path Issues
**What goes wrong:** Theme CSS import fails because path is wrong relative to CSS entry file
**Why it happens:** Assuming all CSS files are in project root
**How to avoid:** Calculate relative path from CSS entry file to theme file
**Warning signs:** "Failed to find 'lit-ui-theme.css'" errors in browser console
```typescript
// Prevention: Use relative path calculation
const relativePath = relative(dirname(cssEntryPath), themeFilePath);
const importLine = `@import '${relativePath}';`;
```

### Pitfall 5: Theme File in Wrong Location
**What goes wrong:** Theme CSS generated in unexpected location
**Why it happens:** Using process.cwd() instead of resolved cwd
**How to avoid:** Always use resolved cwd from args for all file operations
**Warning signs:** Theme file appears in CLI directory instead of project

## Code Examples

Verified patterns from official sources and existing codebase:

### Complete Theme Command Implementation
```typescript
// Source: Existing CLI patterns + CONTEXT.md decisions
import { defineCommand } from 'citty';
import { resolve } from 'pathe';
import fsExtra from 'fs-extra';
import { consola } from 'consola';
import { decodeThemeConfig, generateThemeCSS } from '../theme/index.js';
import { success, warn, info, error, file } from '../utils/logger';

const { pathExists, writeFile, readFile } = fsExtra;

const THEME_FILE = 'lit-ui-theme.css';
const CONFIGURATOR_URL = 'https://lit-ui.dev/themes';

export const theme = defineCommand({
  meta: {
    name: 'theme',
    description: 'Apply a theme configuration to your project',
  },
  args: {
    config: {
      type: 'positional',
      description: 'Encoded theme configuration',
      required: true,
    },
    cwd: {
      type: 'string',
      description: 'Working directory',
      default: '.',
    },
    yes: {
      type: 'boolean',
      alias: 'y',
      description: 'Skip confirmation prompts',
      default: false,
    },
  },
  async run({ args }) {
    const cwd = resolve(args.cwd);
    const themeFilePath = resolve(cwd, THEME_FILE);

    // Check for existing theme
    if (await pathExists(themeFilePath)) {
      if (!args.yes && process.stdout.isTTY) {
        const replace = await consola.prompt('Theme exists. Replace?', {
          type: 'confirm',
          initial: false,
        });
        if (!replace) {
          info('Theme unchanged.');
          return;
        }
      } else if (!args.yes) {
        info('Theme exists. Use interactive mode to replace.');
        return;
      }
    }

    // Decode and validate
    let config;
    try {
      config = decodeThemeConfig(args.config);
    } catch {
      error('Invalid theme. Generate a new one from the configurator.');
      info(CONFIGURATOR_URL);
      process.exit(1);
    }

    // Generate and write CSS
    const css = generateThemeCSS(config);
    await writeFile(themeFilePath, css);
    success('Theme applied.');

    // Auto-inject import (warn on failure, don't error)
    await injectThemeImport(cwd);
  },
});
```

### CSS Entry Detection Utility
```typescript
// Source: Common project patterns research
import { resolve } from 'pathe';
import fsExtra from 'fs-extra';

const { pathExists, readFile } = fsExtra;

// Ordered by likelihood - check most common first
const CSS_ENTRY_CANDIDATES = [
  // Next.js App Router (most common modern setup)
  'src/app/globals.css',
  'app/globals.css',
  // Vite projects
  'src/index.css',
  'src/styles/index.css',
  // Generic patterns
  'src/main.css',
  'src/styles/main.css',
  'src/styles/globals.css',
  'styles/globals.css',
  // Tailwind-specific
  'src/styles/tailwind.css',
  'src/tailwind.css',
];

export async function detectCssEntry(cwd: string): Promise<string | null> {
  for (const candidate of CSS_ENTRY_CANDIDATES) {
    const fullPath = resolve(cwd, candidate);
    if (await pathExists(fullPath)) {
      const content = await readFile(fullPath, 'utf-8');
      // Verify this is a Tailwind entry file
      if (
        content.includes("@import 'tailwindcss'") ||
        content.includes('@import "tailwindcss"') ||
        content.includes('@tailwind base')
      ) {
        return candidate;
      }
    }
  }
  return null;
}
```

### Import Injection with Proper Placement
```typescript
// Source: CSS import ordering best practices
import { resolve, dirname, relative } from 'pathe';
import fsExtra from 'fs-extra';
import { success, warn, info, file } from './logger';

const { readFile, writeFile } = fsExtra;

export async function injectThemeImport(cwd: string): Promise<void> {
  const { detectCssEntry } = await import('./detect-css-entry');
  const cssEntry = await detectCssEntry(cwd);

  if (!cssEntry) {
    warn('Could not detect main CSS file.');
    info("Manually add to your CSS: @import 'lit-ui-theme.css';");
    return;
  }

  const cssPath = resolve(cwd, cssEntry);
  const themePath = resolve(cwd, 'lit-ui-theme.css');
  const content = await readFile(cssPath, 'utf-8');

  // Idempotency check
  if (content.includes('lit-ui-theme.css')) {
    info(`Theme already imported in ${file(cssEntry)}`);
    return;
  }

  // Calculate relative path from CSS file to theme file
  const relativePath = relative(dirname(cssPath), themePath);
  const importStatement = `@import '${relativePath}';\n`;

  // Find correct insertion point (after @charset and @import lines)
  const lines = content.split('\n');
  let insertIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith('@charset') || trimmed.startsWith('@import')) {
      insertIndex = i + 1;
    } else if (trimmed && !trimmed.startsWith('/*') && !trimmed.startsWith('*')) {
      break;
    }
  }

  lines.splice(insertIndex, 0, importStatement.trim());
  await writeFile(cssPath, lines.join('\n'));
  success(`Added theme import to ${file(cssEntry)}`);
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Separate config file for theme | Encoded URL parameter | Project v3.0 | No server storage needed |
| Runtime theme switching | Build-time CSS | Project v3.0 | SSR compatible, simpler |
| RGB/HSL colors | OKLCH | 2024 | Perceptual uniformity |
| tailwind.config.js theming | CSS @theme | Tailwind v4 | CSS-native |

**Deprecated/outdated:**
- `tailwind.config.js` for theme colors: CSS custom properties are now standard
- Separate "theme.json" config files: Encoded strings are more portable

## Open Questions

Things that couldn't be fully resolved:

1. **CSS Entry File Detection Priority**
   - What we know: Common locations identified (Next.js, Vite patterns)
   - What's unclear: Which should take priority if multiple exist
   - Recommendation: Use ordered list (most common first), stop at first match

2. **Non-standard Project Structures**
   - What we know: Detection will fail for unusual setups
   - What's unclear: How many users have non-standard structures
   - Recommendation: Warn with manual instructions; don't error

3. **Theme Import Path Handling**
   - What we know: Need relative path from CSS entry to theme file
   - What's unclear: Edge cases with nested directories
   - Recommendation: Use pathe.relative for cross-platform correctness

## Sources

### Primary (HIGH confidence)
- Existing CLI codebase: `packages/cli/src/commands/init.ts` - Command patterns, file operations
- Phase 21 RESEARCH.md - Theme module architecture decisions
- Existing theme module: `packages/cli/src/theme/` - Encoding, CSS generation APIs

### Secondary (MEDIUM confidence)
- [Tailwind CSS Vite Guide](https://tailwindcss.com/docs/guides/vite) - CSS entry file location patterns
- [Next.js CSS Documentation](https://nextjs.org/docs/app/getting-started/css) - globals.css conventions
- [shadcn CLI Documentation](https://ui.shadcn.com/docs/cli) - components.json CSS configuration

### Tertiary (LOW confidence)
- Web search results for CSS entry detection patterns - Verified against official docs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Using existing libraries already in codebase
- Architecture: HIGH - Following established CLI patterns from init/add commands
- Pitfalls: MEDIUM - Based on common CLI patterns and CONTEXT.md decisions

**Research date:** 2026-01-25
**Valid until:** 2026-02-25 (30 days - stable domain, patterns established)
