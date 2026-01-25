# Phase 18: CLI Enhancement - Research

**Researched:** 2026-01-25
**Domain:** CLI tooling, package manager automation, file diff detection
**Confidence:** HIGH

## Summary

This phase enhances the existing lit-ui CLI to support dual distribution modes: copy-source (existing) and npm install. The current CLI is built on citty with consola for prompts, execa for process execution, and package-manager-detector for PM detection.

The implementation extends the existing config system to add a `mode` field, modifies the `init` command to prompt for mode selection, updates the `add` command to branch behavior based on mode, and adds a new `migrate` command for converting copy-source installations to npm mode.

**Primary recommendation:** Extend existing CLI patterns using the established stack (citty, consola, execa, package-manager-detector). Use the diff library for detecting modified files during migration.

## Standard Stack

The project already uses these libraries - no new dependencies needed for core functionality.

### Core (Already in Use)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| citty | ^0.1.6 | CLI framework | UnJS ecosystem, TypeScript-first, used by Nuxt |
| consola | ^3.4.0 | Logging + prompts | UnJS ecosystem, has built-in interactive prompts |
| execa | ^9.5.2 | Process execution | Industry standard, TypeScript support, safe defaults |
| package-manager-detector | ^0.2.9 | Detect npm/pnpm/yarn/bun | Checks lockfiles + packageManager field |
| fs-extra | ^11.3.0 | File operations | Promisified fs with extras |
| pathe | ^2.0.2 | Path utilities | Cross-platform path handling |
| picocolors | ^1.1.1 | Terminal colors | Lightweight alternative to chalk |

### Supporting (New for Migration)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| diff | ^7.0.0 | Text differencing | Detect user modifications to copied source |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| diff | git diff via execa | Requires git, more complex parsing |
| consola prompts | inquirer/@inquirer/prompts | Larger dependency, separate from logging |

**Installation (migration feature only):**
```bash
pnpm add diff
pnpm add -D @types/diff
```

## Architecture Patterns

### Recommended Project Structure

```
packages/cli/src/
├── commands/
│   ├── init.ts          # Modified: add mode prompt
│   ├── add.ts           # Modified: branch on mode
│   ├── list.ts          # No changes
│   └── migrate.ts       # NEW: copy-source to npm
├── utils/
│   ├── config.ts        # Modified: add mode field
│   ├── registry.ts      # No changes
│   ├── copy-component.ts # No changes (copy-source mode)
│   ├── install-component.ts # NEW: npm mode
│   ├── detect-package-manager.ts # Already exists
│   └── diff-utils.ts    # NEW: file comparison
└── index.ts             # Modified: add migrate command
```

### Pattern 1: Mode-Based Command Branching

**What:** The add command checks config.mode and delegates to appropriate handler
**When to use:** Commands that behave differently based on mode
**Example:**
```typescript
// Source: Existing add.ts pattern extended
export const add = defineCommand({
  meta: { name: 'add', description: 'Add a component to your project' },
  args: {
    component: { type: 'positional', required: true },
    npm: { type: 'boolean', description: 'Force npm mode' },
    copy: { type: 'boolean', description: 'Force copy-source mode' },
  },
  async run({ args }) {
    const config = await getOrCreateConfig(cwd);
    const mode = args.npm ? 'npm' : args.copy ? 'copy-source' : config.mode;

    if (mode === 'npm') {
      await installFromNpm(componentName, config, cwd);
    } else {
      await copyFromSource(componentName, config, cwd);
    }
  },
});
```

### Pattern 2: Auto-Create Config on First Command

**What:** Create config with defaults if missing, instead of erroring
**When to use:** Any command that needs config (add, migrate)
**Example:**
```typescript
// Source: Based on CONTEXT.md decision
export async function getOrCreateConfig(cwd: string): Promise<LitUIConfig> {
  const existing = await getConfig(cwd);
  if (existing) return existing;

  // Create with defaults
  const defaultConfig: LitUIConfig = {
    mode: 'copy-source', // Default matches existing behavior
    componentsPath: 'src/components/ui',
    // ... other defaults
  };
  await writeConfig(cwd, defaultConfig);
  return defaultConfig;
}
```

### Pattern 3: Package Manager Install Command

**What:** Run npm/pnpm/yarn install via execa with detected package manager
**When to use:** npm mode add command
**Example:**
```typescript
// Source: Existing detect-package-manager.ts + execa patterns
import { execa } from 'execa';
import { detectPackageManager, getInstallCommand } from './detect-package-manager';

export async function installPackage(
  packageName: string,
  cwd: string
): Promise<void> {
  const pm = await detectPackageManager(cwd);
  const args = getInstallArgs(pm, packageName);

  await execa(pm, args, {
    cwd,
    stdio: 'inherit', // Show install output live
  });
}

function getInstallArgs(pm: PackageManager, pkg: string): string[] {
  switch (pm) {
    case 'npm': return ['install', pkg];
    case 'yarn': return ['add', pkg];
    case 'pnpm': return ['add', pkg];
    case 'bun': return ['add', pkg];
  }
}
```

### Pattern 4: File Modification Detection

**What:** Compare copied source against original to detect user changes
**When to use:** Migration command before deleting source files
**Example:**
```typescript
// Source: diff library API
import { diffLines, Change } from 'diff';

export function detectModifications(
  originalContent: string,
  currentContent: string
): { modified: boolean; diff: Change[] } {
  const changes = diffLines(originalContent, currentContent, {
    ignoreWhitespace: false,
    newlineIsToken: true,
  });

  const modified = changes.some(c => c.added || c.removed);
  return { modified, diff: changes };
}

export function formatDiff(changes: Change[]): string {
  return changes.map(c => {
    if (c.added) return c.value.split('\n').map(l => `+ ${l}`).join('\n');
    if (c.removed) return c.value.split('\n').map(l => `- ${l}`).join('\n');
    return c.value.split('\n').map(l => `  ${l}`).join('\n');
  }).join('');
}
```

### Anti-Patterns to Avoid

- **Shell string commands:** Don't use `execa('npm install @lit-ui/button')` - use array form `execa('npm', ['install', '@lit-ui/button'])` for security
- **Blocking on detection:** Don't await package manager detection in every command - detect once and cache in config
- **Silent failures:** Always show install output via `stdio: 'inherit'` so users see errors
- **Hardcoded paths:** Use config.componentsPath, don't assume `src/components/ui`

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Package manager detection | Check lockfiles manually | package-manager-detector | Handles edge cases, packageManager field |
| Interactive prompts | readline, process.stdin | consola.prompt | Already used, handles cancellation |
| Process execution | child_process directly | execa | Cross-platform, better error handling |
| Text diffing | Line-by-line comparison | diff library | Handles edge cases, standard format |
| Config file validation | JSON.parse + manual checks | defu (already used) | Merges with defaults, handles missing fields |

**Key insight:** The CLI already has a solid foundation - extend patterns, don't rebuild.

## Common Pitfalls

### Pitfall 1: Package Manager Command Differences

**What goes wrong:** Using npm syntax for pnpm/yarn (e.g., `npm install` vs `pnpm add`)
**Why it happens:** Package managers have different command structures
**How to avoid:** Map commands per package manager:
```typescript
const installCommands: Record<PackageManager, string[]> = {
  npm: ['install'],
  yarn: ['add'],
  pnpm: ['add'],
  bun: ['add'],
};
```
**Warning signs:** "Unknown command" errors in CI with different package managers

### Pitfall 2: Config File Race Conditions

**What goes wrong:** Multiple CLI invocations create corrupt config
**Why it happens:** Read-modify-write without locking
**How to avoid:** Use atomic write operations (fs-extra handles this); accept that concurrent CLI runs are rare
**Warning signs:** Truncated or malformed lit-ui.config.json

### Pitfall 3: Peer Dependency Warnings

**What goes wrong:** Users get peer dependency warnings when installing components
**Why it happens:** Components have peer deps on @lit-ui/core and lit
**How to avoid:** In npm mode, install @lit-ui/core first, then component. Print clear instructions about peer deps.
**Warning signs:** npm WARN peer dep messages confusing users

### Pitfall 4: Component Name to Package Name Mapping

**What goes wrong:** `lit-ui add button` tries to install wrong package
**Why it happens:** Component names don't match npm package names directly
**How to avoid:** Maintain explicit mapping:
```typescript
const componentToPackage: Record<string, string> = {
  button: '@lit-ui/button',
  dialog: '@lit-ui/dialog',
};
```
**Warning signs:** 404 errors when installing components

### Pitfall 5: Migration Deletes User Work

**What goes wrong:** User modifications to copied source are lost during migration
**Why it happens:** Deleting source without checking for changes
**How to avoid:** Use diff detection, require explicit confirmation:
```typescript
const { modified, diff } = detectModifications(original, current);
if (modified) {
  console.log(formatDiff(diff));
  const confirm = await consola.prompt('This file was modified. Replace anyway?', {
    type: 'confirm',
    initial: false, // Default to safe option
  });
  if (!confirm) return;
}
```
**Warning signs:** "Where did my changes go?" support tickets

## Code Examples

Verified patterns from the existing codebase and library docs:

### Config File Schema (Updated)

```typescript
// Source: Existing config.ts, extended
export interface LitUIConfig {
  $schema?: string;
  /** Distribution mode: copy source files or install npm packages */
  mode: 'copy-source' | 'npm';
  /** Directory where components are installed (copy-source mode) */
  componentsPath: string;
  /** Tailwind configuration */
  tailwind: {
    css: string;
  };
  /** Import path aliases */
  aliases: {
    components: string;
    base: string;
  };
}

export const DEFAULT_CONFIG: LitUIConfig = {
  mode: 'copy-source', // Default to existing behavior
  componentsPath: 'src/components/ui',
  tailwind: { css: 'src/styles/tailwind.css' },
  aliases: {
    components: '@/components/ui',
    base: '@/lib/lit-ui',
  },
};
```

### Init Command Mode Prompt

```typescript
// Source: consola prompt examples
const mode = await consola.prompt('How would you like to install components?', {
  type: 'select',
  options: [
    {
      value: 'copy-source',
      label: 'Copy source files',
      hint: 'Full control, customize directly, no updates',
    },
    {
      value: 'npm',
      label: 'Install from npm',
      hint: 'Auto updates, smaller bundle, less customization',
    },
  ],
  initial: 'copy-source',
});
```

### Running Package Install

```typescript
// Source: execa v9 docs, project patterns
import { execa } from 'execa';

async function installComponent(
  componentName: string,
  cwd: string
): Promise<void> {
  const pm = await detectPackageManager(cwd);
  const packageName = `@lit-ui/${componentName}`;

  const spinner = ora(`Installing ${packageName}...`).start();

  try {
    // First ensure @lit-ui/core is installed (peer dep)
    await execa(pm, [...getInstallArgs(pm), '@lit-ui/core'], {
      cwd,
      stdio: 'pipe', // Capture output for spinner
    });

    // Then install the component
    await execa(pm, [...getInstallArgs(pm), packageName], {
      cwd,
      stdio: 'pipe',
    });

    spinner.succeed(`Installed ${packageName}`);

    // Print usage
    console.log('');
    console.log(pc.dim('Import:'));
    console.log(`  import '@lit-ui/${componentName}';`);
    console.log('');
    console.log(pc.dim('Usage:'));
    console.log(`  <ui-${componentName}>...</ui-${componentName}>`);
  } catch (error) {
    spinner.fail(`Failed to install ${packageName}`);
    throw error;
  }
}
```

### Migrate Command Structure

```typescript
// Source: citty defineCommand pattern from existing commands
export const migrate = defineCommand({
  meta: {
    name: 'migrate',
    description: 'Migrate from copy-source to npm mode',
  },
  args: {
    cwd: {
      type: 'string',
      description: 'Working directory',
      default: '.',
    },
  },
  async run({ args }) {
    const cwd = resolve(args.cwd);
    const config = await getConfig(cwd);

    if (!config) {
      consola.error('No lit-ui.config.json found. Nothing to migrate.');
      return;
    }

    if (config.mode === 'npm') {
      consola.info('Project already in npm mode.');
      return;
    }

    // 1. Find all copied component files
    const copiedComponents = await findCopiedComponents(config, cwd);

    // 2. For each component:
    for (const component of copiedComponents) {
      // 2a. Check for modifications
      const { modified, diff } = await checkModifications(component);

      if (modified) {
        console.log(formatDiff(diff));
        const confirm = await consola.prompt(
          `${component.name} was modified. Replace with npm package?`,
          { type: 'confirm', initial: false }
        );
        if (!confirm) continue;
      }

      // 2b. Install npm package
      await installComponent(component.name, cwd);

      // 2c. Delete source file
      await fs.remove(component.path);
    }

    // 3. Update config mode
    await writeConfig(cwd, { ...config, mode: 'npm' });

    consola.success('Migration complete!');
    consola.info('Update your imports from local paths to @lit-ui/* packages.');
  },
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Single distribution mode | Dual mode (copy/npm) | This phase | Users choose based on needs |
| Manual npm install | CLI handles install | This phase | Better DX, correct peer deps |
| No migration path | lit-ui migrate | This phase | Smooth transition |

**Deprecated/outdated:**
- N/A - this is new functionality

## Open Questions

Things that couldn't be fully resolved:

1. **Import path updates during migration**
   - What we know: After migration, imports change from `./components/ui/button` to `@lit-ui/button`
   - What's unclear: Should CLI auto-update imports in user code or just print list?
   - Recommendation: Print list of files to update (from Claude's discretion section) - auto-update is risky and scope-creepy

2. **Batch add output format**
   - What we know: `lit-ui add button dialog` should install multiple components
   - What's unclear: Show progress per component or summary at end?
   - Recommendation: Progress per component (aligns with existing add command pattern)

3. **Dedicated mode command**
   - What we know: Users might want to change mode without re-running init
   - What's unclear: Add `lit-ui mode npm` command or tell users to edit config?
   - Recommendation: Skip dedicated command for MVP - editing config is straightforward

## Sources

### Primary (HIGH confidence)
- Existing CLI source code at `/packages/cli/src/` - current implementation patterns
- [citty](https://github.com/unjs/citty) - CLI framework API
- [consola](https://github.com/unjs/consola) - prompt types and usage
- [execa](https://github.com/sindresorhus/execa) - process execution API
- [package-manager-detector](https://www.npmjs.com/package/package-manager-detector) - detection logic

### Secondary (MEDIUM confidence)
- [diff (jsdiff)](https://github.com/kpdecker/jsdiff) - diffLines API for file comparison
- [shadcn-ui CLI](https://ui.shadcn.com/docs/cli) - inspiration for component CLI patterns

### Tertiary (LOW confidence)
- WebSearch results for CLI migration patterns - general patterns only

## Metadata

**Confidence breakdown:**
- Standard Stack: HIGH - project already uses these libraries
- Architecture: HIGH - extending existing patterns
- Pitfalls: HIGH - derived from code review and library docs

**Research date:** 2026-01-25
**Valid until:** 2026-02-25 (30 days - stable domain, no fast-moving libraries)
