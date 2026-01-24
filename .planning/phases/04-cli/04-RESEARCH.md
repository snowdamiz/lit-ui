# Phase 4: CLI - Research

**Researched:** 2026-01-24
**Domain:** Node.js CLI Development, Component Distribution
**Confidence:** HIGH

## Summary

This research covers building a CLI tool for distributing lit-ui components via `npx lit-ui add <component>`. The CLI needs to handle project initialization (lit-ui.json config), component copying, build tool detection, package manager detection, and Tailwind v4 CSS-based setup.

The standard approach for modern Node.js CLIs uses citty (UnJS) or Commander.js for argument parsing, picocolors for terminal output, @inquirer/prompts or consola for interactive prompts, ora for spinners, fs-extra for file operations, and tsup for building the CLI as an npm package. The shadcn CLI architecture provides a well-tested pattern for component registries.

**Primary recommendation:** Build a TypeScript CLI using citty (aligns with UnJS ecosystem), picocolors, ora, consola (for prompts), and fs-extra. Use tsup for bundling. Model the registry system on shadcn's JSON-based approach but simplified for lit-ui's needs.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| citty | ^0.1.6 | CLI argument parsing | UnJS ecosystem, lightweight, zero deps, TypeScript-first, used by Nuxt |
| picocolors | ^1.1.1 | Terminal colors | 14x smaller than chalk, 2x faster, zero deps |
| ora | ^9.0.0 | Terminal spinners | De facto standard, 70+ spinner types, graceful fallbacks |
| consola | ^3.4.0 | Logging + prompts | UnJS ecosystem, built-in prompts (clack-powered), spam prevention |
| fs-extra | ^11.3.0 | File operations | Drop-in fs replacement, copy/move directories, widely used |
| package-manager-detector | ^0.2.8 | PM detection | Detects npm/yarn/pnpm/bun via lockfiles + package.json |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| node-diff3 | ^3.1.2 | Three-way merge | Conflict resolution when overwriting files |
| execa | ^9.5.2 | Shell commands | Running npm/yarn/pnpm install, git commands |
| pathe | ^2.0.1 | Path utilities | Cross-platform path handling (UnJS ecosystem) |
| defu | ^6.1.4 | Object merging | Deep merge config objects with defaults |

### Build Tools
| Tool | Version | Purpose | Notes |
|------|---------|---------|-------|
| tsup | ^8.3.5 | Bundle CLI | Zero-config, esbuild-powered, used by shadcn CLI |
| typescript | ^5.7.0 | Type checking | Already in project |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| citty | commander | Commander is more established (25M+ weekly downloads) but citty is smaller, TypeScript-first, and aligns with UnJS ecosystem already used in project |
| picocolors | chalk | Chalk has more features (256 colors, truecolor) but is 14x larger; picocolors sufficient for this use case |
| consola | @inquirer/prompts | Inquirer is more feature-rich but consola provides logging+prompts in one package |
| ora | consola spinner | Consola has basic spinner support but ora has more animation options |

**Installation:**
```bash
npm install citty picocolors ora consola fs-extra package-manager-detector pathe defu
npm install -D tsup @types/fs-extra
```

## Architecture Patterns

### Recommended Project Structure
```
packages/cli/
├── src/
│   ├── index.ts              # CLI entry point (shebang)
│   ├── commands/
│   │   ├── init.ts           # lit-ui init command
│   │   ├── add.ts            # lit-ui add <component> command
│   │   └── list.ts           # lit-ui list command
│   ├── utils/
│   │   ├── config.ts         # lit-ui.json read/write
│   │   ├── registry.ts       # Component registry operations
│   │   ├── detect-build-tool.ts
│   │   ├── detect-package-manager.ts
│   │   └── copy-component.ts
│   └── registry/
│       └── registry.json     # Component metadata
├── package.json
├── tsconfig.json
└── tsup.config.ts
```

### Pattern 1: Command Definition with Citty
**What:** Define CLI commands using citty's defineCommand
**When to use:** Every CLI command
**Example:**
```typescript
// Source: https://github.com/unjs/citty
import { defineCommand, runMain } from 'citty';

const add = defineCommand({
  meta: {
    name: 'add',
    description: 'Add a component to your project',
  },
  args: {
    component: {
      type: 'positional',
      description: 'Component name to add',
      required: true,
    },
    yes: {
      type: 'boolean',
      alias: 'y',
      description: 'Skip confirmation prompts',
      default: false,
    },
    overwrite: {
      type: 'boolean',
      alias: 'o',
      description: 'Overwrite existing files',
      default: false,
    },
  },
  async run({ args }) {
    // Command implementation
  },
});
```

### Pattern 2: Spinner with Progress Feedback
**What:** Show spinner during long operations with status updates
**When to use:** Any async operation > 500ms (file copying, npm install)
**Example:**
```typescript
// Source: https://github.com/sindresorhus/ora
import ora from 'ora';

const spinner = ora('Installing dependencies...').start();
try {
  await installDependencies();
  spinner.succeed('Dependencies installed');
} catch (error) {
  spinner.fail('Failed to install dependencies');
  throw error;
}
```

### Pattern 3: Interactive Prompts with Consola
**What:** Prompt user for input when auto-detection fails
**When to use:** When config cannot be auto-detected
**Example:**
```typescript
// Source: https://github.com/unjs/consola
import { consola } from 'consola';

const componentPath = await consola.prompt('Where should components be installed?', {
  type: 'text',
  default: 'src/components/ui',
  placeholder: 'src/components/ui',
});

const confirmed = await consola.prompt('Proceed with installation?', {
  type: 'confirm',
  initial: true,
});
```

### Pattern 4: Build Tool Detection
**What:** Detect Vite, Webpack, or esbuild in user's project
**When to use:** During init to provide appropriate setup instructions
**Example:**
```typescript
import { existsSync } from 'fs';
import { resolve } from 'pathe';

interface BuildToolInfo {
  name: 'vite' | 'webpack' | 'esbuild' | 'unknown';
  configFile?: string;
}

export function detectBuildTool(cwd: string): BuildToolInfo {
  const checks = [
    { name: 'vite', files: ['vite.config.ts', 'vite.config.js', 'vite.config.mts'] },
    { name: 'webpack', files: ['webpack.config.js', 'webpack.config.ts'] },
    { name: 'esbuild', files: ['esbuild.config.js', 'esbuild.config.mjs'] },
  ] as const;

  for (const { name, files } of checks) {
    for (const file of files) {
      if (existsSync(resolve(cwd, file))) {
        return { name, configFile: file };
      }
    }
  }

  // Fallback: check package.json scripts and dependencies
  // ...

  return { name: 'unknown' };
}
```

### Pattern 5: Package Manager Detection
**What:** Detect npm/yarn/pnpm/bun from lockfiles
**When to use:** When running install commands
**Example:**
```typescript
// Source: https://www.npmjs.com/package/package-manager-detector
import { detect } from 'package-manager-detector';

const pm = await detect({ cwd: process.cwd() });
// Returns: 'npm' | 'yarn' | 'pnpm' | 'bun' | null

const installCmd = {
  npm: 'npm install',
  yarn: 'yarn add',
  pnpm: 'pnpm add',
  bun: 'bun add',
}[pm ?? 'npm'];
```

### Pattern 6: Registry JSON Structure
**What:** Define component metadata for the CLI
**When to use:** Component discovery and dependency resolution
**Example:**
```json
{
  "$schema": "./registry-schema.json",
  "name": "lit-ui",
  "components": [
    {
      "name": "button",
      "description": "A customizable button with variants, sizes, and loading state",
      "files": [
        { "path": "components/button/button.ts", "type": "component" }
      ],
      "dependencies": [],
      "registryDependencies": [],
      "tailwindDependencies": ["bg-primary", "text-primary-foreground"]
    },
    {
      "name": "dialog",
      "description": "Accessible modal dialog with focus trapping and animations",
      "files": [
        { "path": "components/dialog/dialog.ts", "type": "component" }
      ],
      "dependencies": [],
      "registryDependencies": ["button"],
      "tailwindDependencies": ["bg-card", "text-card-foreground"]
    }
  ],
  "base": [
    {
      "name": "tailwind-element",
      "files": [
        { "path": "base/tailwind-element.ts", "type": "base" },
        { "path": "styles/tailwind.css", "type": "style" },
        { "path": "styles/host-defaults.css", "type": "style" }
      ]
    }
  ]
}
```

### Anti-Patterns to Avoid
- **Synchronous file operations in hot paths:** Always use async fs-extra methods
- **Silent failures:** Always show clear error messages with suggested fixes
- **Assuming paths:** Never assume project structure; always detect or ask
- **Global state:** Keep command context isolated for testability
- **Hard-coded package manager:** Always detect or let user specify

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Argument parsing | Custom argv handling | citty | Edge cases in flags, subcommands, help generation |
| Terminal colors | ANSI escape codes | picocolors | Cross-platform, NO_COLOR support, Windows compat |
| Spinners | Manual \r overwriting | ora | Terminal capability detection, graceful degradation |
| File copying | fs.copyFile loops | fs-extra.copy | Recursive, preserves timestamps, filter support |
| PM detection | Lockfile checks | package-manager-detector | Handles edge cases, packageManager field, hierarchy |
| Path handling | path.join | pathe | Windows/Unix normalization, resolves inconsistencies |
| Config merging | Object.assign | defu | Deep merge with proper array/object handling |

**Key insight:** CLI development has many platform-specific edge cases (Windows terminals, different shells, TTY detection). Battle-tested libraries handle these invisibly.

## Common Pitfalls

### Pitfall 1: Not Handling Non-Interactive Environments
**What goes wrong:** Prompts hang in CI/CD, docker builds, piped commands
**Why it happens:** TTY detection missing, prompts wait forever for input
**How to avoid:** Check `process.stdout.isTTY`, provide `--yes` flag for all prompts
**Warning signs:** "works on my machine" but fails in CI

### Pitfall 2: ESM/CJS Module Confusion
**What goes wrong:** "require() of ES Module not supported" or dynamic import issues
**Why it happens:** ora 9.x, execa 9.x are ESM-only; mixing with CJS dependencies
**How to avoid:** Use `"type": "module"` in package.json, configure tsup for ESM output
**Warning signs:** Import errors at runtime despite TypeScript compiling

### Pitfall 3: File Path Handling on Windows
**What goes wrong:** Paths with backslashes fail, case sensitivity issues
**Why it happens:** Windows uses `\` separator, is case-insensitive
**How to avoid:** Use `pathe` or `node:path` consistently, normalize paths
**Warning signs:** Tests pass on Mac/Linux, fail on Windows

### Pitfall 4: Spinner/Prompt Conflicts
**What goes wrong:** Spinners overlap with prompts, garbled output
**Why it happens:** Both write to same terminal line simultaneously
**How to avoid:** Always `.stop()` spinner before prompting, use consola's built-in coordination
**Warning signs:** Intermittent visual glitches in terminal output

### Pitfall 5: Missing Component Dependencies
**What goes wrong:** User adds dialog, but button (dependency) is missing
**Why it happens:** Registry dependencies not resolved recursively
**How to avoid:** Build dependency graph, prompt to install all dependencies
**Warning signs:** TypeScript errors after adding components

### Pitfall 6: Tailwind CSS Not Loading in Shadow DOM
**What goes wrong:** Components render without styles in user's project
**Why it happens:** User's Tailwind setup doesn't process lit-ui's CSS imports
**How to avoid:** Document Vite `?inline` import, provide setup instructions per build tool
**Warning signs:** Components visually broken after installation

## Code Examples

Verified patterns from official sources:

### CLI Entry Point
```typescript
#!/usr/bin/env node
// Source: https://github.com/unjs/citty

import { defineCommand, runMain } from 'citty';
import { version } from '../package.json';
import { init } from './commands/init';
import { add } from './commands/add';
import { list } from './commands/list';

const main = defineCommand({
  meta: {
    name: 'lit-ui',
    version,
    description: 'Add lit-ui components to your project',
  },
  subCommands: {
    init,
    add,
    list,
  },
});

runMain(main);
```

### Config File Operations
```typescript
// Source: Pattern from shadcn CLI
import { existsSync } from 'fs';
import { readJson, writeJson } from 'fs-extra';
import { resolve } from 'pathe';
import { defu } from 'defu';

interface LitUIConfig {
  $schema?: string;
  componentsPath: string;
  tailwind: {
    css: string;
  };
  aliases: {
    components: string;
    base: string;
  };
}

const CONFIG_FILE = 'lit-ui.json';
const DEFAULT_CONFIG: LitUIConfig = {
  componentsPath: 'src/components/ui',
  tailwind: {
    css: 'src/styles/tailwind.css',
  },
  aliases: {
    components: '@/components/ui',
    base: '@/lib/lit-ui',
  },
};

export async function getConfig(cwd: string): Promise<LitUIConfig | null> {
  const configPath = resolve(cwd, CONFIG_FILE);
  if (!existsSync(configPath)) return null;
  const config = await readJson(configPath);
  return defu(config, DEFAULT_CONFIG);
}

export async function writeConfig(cwd: string, config: Partial<LitUIConfig>): Promise<void> {
  const configPath = resolve(cwd, CONFIG_FILE);
  const fullConfig = defu(config, DEFAULT_CONFIG);
  fullConfig.$schema = 'https://lit-ui.dev/schema/lit-ui.json';
  await writeJson(configPath, fullConfig, { spaces: 2 });
}
```

### Component Copy with Conflict Handling
```typescript
// Source: Pattern from shadcn CLI + fs-extra docs
import { copy, pathExists } from 'fs-extra';
import { consola } from 'consola';
import { resolve, dirname } from 'pathe';

type ConflictResolution = 'overwrite' | 'skip' | 'diff';

export async function copyComponent(
  sourcePath: string,
  targetPath: string,
  options: { overwrite?: boolean; yes?: boolean }
): Promise<boolean> {
  const exists = await pathExists(targetPath);

  if (exists && !options.overwrite) {
    if (options.yes) {
      consola.warn(`Skipping ${targetPath} (already exists)`);
      return false;
    }

    const resolution = await consola.prompt(`File exists: ${targetPath}`, {
      type: 'select',
      options: [
        { value: 'overwrite', label: 'Overwrite' },
        { value: 'skip', label: 'Skip' },
        { value: 'diff', label: 'Show diff' },
      ],
    }) as ConflictResolution;

    if (resolution === 'skip') return false;
    if (resolution === 'diff') {
      // Show diff and re-prompt
      await showDiff(sourcePath, targetPath);
      return copyComponent(sourcePath, targetPath, options);
    }
  }

  await copy(sourcePath, targetPath, { overwrite: true });
  return true;
}
```

### Running Package Manager Commands
```typescript
// Source: https://github.com/sindresorhus/execa
import { execa } from 'execa';
import ora from 'ora';
import { detect } from 'package-manager-detector';

export async function installDependencies(
  cwd: string,
  packages: string[]
): Promise<void> {
  const pm = await detect({ cwd }) ?? 'npm';
  const spinner = ora(`Installing ${packages.join(', ')}...`).start();

  try {
    const args = pm === 'npm'
      ? ['install', ...packages]
      : ['add', ...packages];

    await execa(pm, args, {
      cwd,
      stdio: 'pipe', // Capture output, don't spam terminal
    });

    spinner.succeed(`Installed ${packages.length} package(s)`);
  } catch (error) {
    spinner.fail('Failed to install dependencies');
    throw error;
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| tailwind.config.js | CSS @theme directive | Tailwind v4 (2025) | CLI must configure CSS, not JS |
| @tailwind directives | @import "tailwindcss" | Tailwind v4 (2025) | Different CSS file structure |
| postcss-import + autoprefixer | @tailwindcss/vite or @tailwindcss/postcss | Tailwind v4 (2025) | Fewer dependencies for users |
| commander.js | citty | 2024 | TypeScript-first, lighter weight |
| chalk | picocolors | 2023 | Smaller, faster, sufficient features |

**Deprecated/outdated:**
- `@tailwind base/components/utilities` directives: Replaced by `@import "tailwindcss"` in v4
- `tailwind.config.js` for theming: CSS @theme is now preferred
- `postcss-import` as separate dep: Built into Tailwind v4
- `autoprefixer` as separate dep: Built into Tailwind v4
- CJS-only npm packages: Most CLI tools are now ESM-only

## Open Questions

Things that couldn't be fully resolved:

1. **Base class distribution strategy**
   - What we know: TailwindElement is required for all components, imports CSS files
   - What's unclear: Should base class be copied once (user owns) or installed as npm dep?
   - Recommendation: Copy once during init, components import from local path. This aligns with shadcn's "own your code" philosophy.

2. **CSS file handling across build tools**
   - What we know: Vite uses `?inline` suffix for CSS-as-string import
   - What's unclear: How to handle for webpack/esbuild users (different syntax)
   - Recommendation: Provide build-tool-specific instructions; consider pre-compiled CSS fallback

3. **Tailwind CSS sharing between components**
   - What we know: Each component needs Tailwind CSS in Shadow DOM
   - What's unclear: Should components share one compiled CSS or each have their own?
   - Recommendation: Single shared CSS via TailwindElement base class (current architecture)

## Sources

### Primary (HIGH confidence)
- [citty GitHub](https://github.com/unjs/citty) - API, usage patterns
- [ora GitHub](https://github.com/sindresorhus/ora) - Spinner API and options
- [fs-extra GitHub](https://github.com/jprichardson/node-fs-extra) - File operations
- [Tailwind v4 Upgrade Guide](https://tailwindcss.com/docs/upgrade-guide) - CSS configuration changes
- [shadcn CLI docs](https://ui.shadcn.com/docs/cli) - Registry pattern, command structure
- [shadcn registry docs](https://ui.shadcn.com/docs/registry/registry-json) - JSON schema

### Secondary (MEDIUM confidence)
- [picocolors GitHub](https://github.com/alexeyraspopov/picocolors) - Terminal colors API
- [package-manager-detector npm](https://www.npmjs.com/package/package-manager-detector) - PM detection
- [tsup docs](https://tsup.egoist.dev/) - CLI bundling
- [consola GitHub](https://github.com/unjs/consola) - Prompts and logging

### Tertiary (LOW confidence)
- Various web articles on CLI best practices (cross-referenced with official docs)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Well-established libraries with clear documentation
- Architecture: HIGH - Following shadcn CLI patterns which are battle-tested
- Pitfalls: MEDIUM - Based on common patterns and documentation; some edge cases may exist

**Research date:** 2026-01-24
**Valid until:** 2026-02-24 (30 days - stable domain)
