import { defineCommand } from 'citty';
import { existsSync } from 'node:fs';
import fsExtra from 'fs-extra';
import { resolve, dirname, join } from 'pathe';
import { consola } from 'consola';

const { ensureDir, writeFile } = fsExtra;

import {
  configExists,
  writeConfig,
  DEFAULT_CONFIG,
  type LitUIConfig,
} from '../utils/config';
import { detectBuildToolAsync, type BuildToolName } from '../utils/detect-build-tool';
import {
  detectPackageManager,
  getInstallCommand,
  type PackageManager,
} from '../utils/detect-package-manager';
import { success, warn, info, error, spinner, file, highlight, command } from '../utils/logger';
import { applyTheme } from '../utils/apply-theme';

// =============================================================================
// EMBEDDED TEMPLATES
// =============================================================================
// Using Option C from PLAN.md - embed file templates for MVP simplicity

/**
 * TailwindElement base class template.
 * Users will import their own tailwind CSS and host-defaults.
 */
const TAILWIND_ELEMENT_TEMPLATE = `/**
 * TailwindElement Base Class
 *
 * A base class for Lit components that automatically injects Tailwind CSS
 * into the Shadow DOM via constructable stylesheets.
 *
 * Usage:
 * import { TailwindElement } from './lib/lit-ui/tailwind-element';
 * import { html } from 'lit';
 * import { customElement } from 'lit/decorators.js';
 *
 * @customElement('my-component')
 * export class MyComponent extends TailwindElement {
 *   render() {
 *     return html\`<div class="p-4 bg-primary text-white">Hello</div>\`;
 *   }
 * }
 */

import { LitElement, type CSSResultGroup } from 'lit';

// Import your compiled Tailwind CSS (adjust path as needed)
import tailwindStyles from '../styles/tailwind.css?inline';
// Import host defaults for Shadow DOM @property workaround
import hostDefaults from './host-defaults.css?inline';

// =============================================================================
// SHARED STYLESHEETS (parse once, share across all component instances)
// =============================================================================

const tailwindSheet = new CSSStyleSheet();
tailwindSheet.replaceSync(tailwindStyles);

const hostDefaultsSheet = new CSSStyleSheet();
hostDefaultsSheet.replaceSync(hostDefaults);

// =============================================================================
// @property RULES WORKAROUND
// =============================================================================

/**
 * Extract @property rules from Tailwind CSS and apply them to the document.
 * CSS @property declarations only work at the document level, not inside
 * Shadow DOM (W3C spec limitation).
 */
const propertyRulePattern = /@property\\s+[^{]+\\{[^}]+\\}/g;
const propertyRules = tailwindStyles.match(propertyRulePattern) || [];

if (propertyRules.length > 0 && typeof document !== 'undefined') {
  const propertySheet = new CSSStyleSheet();
  propertySheet.replaceSync(propertyRules.join('\\n'));
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, propertySheet];
}

// =============================================================================
// TAILWIND ELEMENT BASE CLASS
// =============================================================================

/**
 * Base class for Tailwind-enabled web components.
 */
export class TailwindElement extends LitElement {
  static styles: CSSResultGroup = [];

  override connectedCallback(): void {
    super.connectedCallback();
    this._adoptTailwindStyles();
  }

  private _adoptTailwindStyles(): void {
    if (this.shadowRoot) {
      const existingSheets = this.shadowRoot.adoptedStyleSheets;
      this.shadowRoot.adoptedStyleSheets = [
        tailwindSheet,
        hostDefaultsSheet,
        ...existingSheets,
      ];
    }
  }
}
`;

/**
 * Host defaults CSS for Shadow DOM @property workaround.
 */
const HOST_DEFAULTS_TEMPLATE = `/**
 * Shadow DOM Host Defaults for Tailwind v4 @property Workaround
 *
 * Tailwind v4 uses CSS @property declarations that only work at document level.
 * This file provides default values for all @property-dependent variables.
 */

:host {
  /* Shadow/Ring defaults */
  --tw-shadow: 0 0 #0000;
  --tw-shadow-color: initial;
  --tw-inset-shadow: 0 0 #0000;
  --tw-inset-shadow-color: initial;
  --tw-ring-color: initial;
  --tw-ring-shadow: 0 0 #0000;
  --tw-ring-inset: ;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-offset-shadow: 0 0 #0000;

  /* Transform defaults */
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-translate-z: 0;
  --tw-rotate-x: 0;
  --tw-rotate-y: 0;
  --tw-rotate-z: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-scale-z: 1;

  /* Border defaults */
  --tw-border-style: solid;

  /* Typography defaults */
  --tw-font-weight: initial;
  --tw-tracking: initial;
  --tw-leading: initial;

  /* Backdrop filter defaults */
  --tw-backdrop-blur: initial;
  --tw-backdrop-brightness: initial;
  --tw-backdrop-contrast: initial;
  --tw-backdrop-grayscale: initial;
  --tw-backdrop-hue-rotate: initial;
  --tw-backdrop-invert: initial;
  --tw-backdrop-opacity: initial;
  --tw-backdrop-saturate: initial;
  --tw-backdrop-sepia: initial;

  /* Filter defaults */
  --tw-blur: initial;
  --tw-brightness: initial;
  --tw-contrast: initial;
  --tw-grayscale: initial;
  --tw-hue-rotate: initial;
  --tw-invert: initial;
  --tw-saturate: initial;
  --tw-sepia: initial;
  --tw-drop-shadow: initial;

  /* Gradient defaults */
  --tw-gradient-from: transparent;
  --tw-gradient-to: transparent;
  --tw-gradient-via: transparent;
  --tw-gradient-stops: initial;
  --tw-gradient-from-position: 0%;
  --tw-gradient-via-position: 50%;
  --tw-gradient-to-position: 100%;

  /* Divide defaults */
  --tw-divide-x-reverse: 0;
  --tw-divide-y-reverse: 0;

  /* Space defaults */
  --tw-space-x-reverse: 0;
  --tw-space-y-reverse: 0;

  /* Outline defaults */
  --tw-outline-style: solid;
}
`;

/**
 * Base Tailwind CSS template for user's project.
 */
const TAILWIND_CSS_TEMPLATE = `/**
 * Tailwind CSS v4 Configuration for lit-ui Components
 *
 * This file defines design tokens and theme customizations.
 * Add your own customizations below the @import.
 */
@import "tailwindcss";

@theme {
  /* ==========================================================================
   * SEMANTIC COLOR TOKENS
   * These are used by lit-ui components. Customize to match your brand.
   * ========================================================================== */

  /* Primary - Main brand color for buttons, links, focus states */
  --color-primary: var(--color-blue-500);
  --color-primary-foreground: white;

  /* Secondary - Subtle backgrounds and secondary actions */
  --color-secondary: var(--color-gray-100);
  --color-secondary-foreground: var(--color-gray-900);

  /* Destructive - Errors, delete actions, warnings */
  --color-destructive: var(--color-red-500);
  --color-destructive-foreground: white;

  /* Muted - Disabled states, subtle text */
  --color-muted: var(--color-gray-100);
  --color-muted-foreground: var(--color-gray-500);

  /* Accent - Hover states, highlights */
  --color-accent: var(--color-gray-100);
  --color-accent-foreground: var(--color-gray-900);

  /* Background and foreground - Page-level colors */
  --color-background: white;
  --color-foreground: var(--color-gray-950);

  /* Borders, inputs, focus ring */
  --color-border: var(--color-gray-200);
  --color-input: var(--color-gray-100);
  --color-ring: var(--color-blue-400);
}

/* ==========================================================================
 * DARK MODE (optional)
 * CSS custom properties cascade into Shadow DOM from ancestor elements.
 * Add .dark class to html or body to enable dark mode.
 * ========================================================================== */
.dark {
  --color-primary: var(--color-blue-400);
  --color-primary-foreground: var(--color-gray-950);

  --color-secondary: var(--color-gray-800);
  --color-secondary-foreground: var(--color-gray-100);

  --color-destructive: var(--color-red-400);
  --color-destructive-foreground: var(--color-gray-950);

  --color-muted: var(--color-gray-800);
  --color-muted-foreground: var(--color-gray-400);

  --color-accent: var(--color-gray-800);
  --color-accent-foreground: var(--color-gray-100);

  --color-background: var(--color-gray-950);
  --color-foreground: var(--color-gray-50);

  --color-border: var(--color-gray-800);
  --color-input: var(--color-gray-800);
  --color-ring: var(--color-blue-600);
}

/* Prevent layout shift when scrollbar appears/disappears */
html {
  scrollbar-gutter: stable;
}

/* Dialog scroll lock */
body:has(dialog[open]) {
  overflow: hidden;
}
`;

// =============================================================================
// SETUP INSTRUCTIONS BY BUILD TOOL
// =============================================================================

const SETUP_INSTRUCTIONS: Record<BuildToolName, string> = {
  vite: `
Add to your main CSS file (e.g., src/index.css):

  @import "tailwindcss";
  @import "./lib/lit-ui/tailwind.css";

Your Vite config should already support CSS imports.
`,
  webpack: `
Add to your main CSS file (e.g., src/index.css):

  @import "tailwindcss";
  @import "./lib/lit-ui/tailwind.css";

Ensure @tailwindcss/postcss is configured in your postcss.config.js.
`,
  esbuild: `
Add to your main CSS file:

  @import "tailwindcss";
  @import "./lib/lit-ui/tailwind.css";

Configure your build to process CSS with Tailwind.
`,
  unknown: `
Add to your main CSS file:

  @import "tailwindcss";
  @import "./lib/lit-ui/tailwind.css";

Configure your build tool to process CSS with Tailwind v4.
`,
};

// =============================================================================
// INIT COMMAND
// =============================================================================

export const init = defineCommand({
  meta: {
    name: 'init',
    description: 'Initialize lit-ui in your project',
  },
  args: {
    yes: {
      type: 'boolean',
      alias: 'y',
      description: 'Skip prompts and use defaults',
      default: false,
    },
    cwd: {
      type: 'string',
      description: 'Working directory',
      default: '.',
    },
    theme: {
      type: 'string',
      description: 'Encoded theme configuration from configurator',
      required: false,
    },
  },
  async run({ args }) {
    const cwd = resolve(args.cwd);

    console.log('');
    console.log(highlight('lit-ui init'));
    console.log('');

    // Check for package.json
    const packageJsonPath = resolve(cwd, 'package.json');
    if (!existsSync(packageJsonPath)) {
      error('No package.json found in current directory.');
      info('Run this command in a Node.js project directory.');
      process.exit(1);
    }

    // Check if already initialized
    if (await configExists(cwd)) {
      warn('lit-ui.config.json already exists. Reinitializing will overwrite settings.');
      if (!args.yes) {
        const proceed = await consola.prompt('Continue?', {
          type: 'confirm',
          initial: false,
        });
        if (!proceed) {
          info('Initialization cancelled.');
          return;
        }
      }
    }

    // Detect environment
    const buildToolInfo = await detectBuildToolAsync(cwd);
    const packageManager = await detectPackageManager(cwd);

    info(`Detected build tool: ${highlight(buildToolInfo.name)}`);
    info(`Detected package manager: ${highlight(packageManager)}`);
    console.log('');

    // Get distribution mode
    let mode: 'copy-source' | 'npm' = 'copy-source';

    if (!args.yes) {
      const selectedMode = await consola.prompt('How would you like to install components?', {
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
      mode = selectedMode as 'copy-source' | 'npm';
    }

    // Get configuration
    let componentsPath = DEFAULT_CONFIG.componentsPath;

    if (!args.yes) {
      const userPath = await consola.prompt('Where should components be installed?', {
        type: 'text',
        initial: DEFAULT_CONFIG.componentsPath,
        placeholder: DEFAULT_CONFIG.componentsPath,
      });

      if (typeof userPath === 'string' && userPath.trim()) {
        componentsPath = userPath.trim();
      }
    }

    // Calculate lib path (sibling to components, under src/lib/lit-ui)
    const componentsDir = dirname(componentsPath);
    const srcDir = dirname(componentsDir);
    const libPath = join(srcDir, 'lib', 'lit-ui');

    // Prepare config
    const config: Partial<LitUIConfig> = {
      mode,
      componentsPath,
      aliases: {
        components: `@/${componentsPath.replace(/^src\//, '')}`,
        base: `@/lib/lit-ui`,
      },
    };

    // Write config file
    const spin = spinner('Writing lit-ui.config.json...');
    try {
      await writeConfig(cwd, config);
      spin.succeed('Created lit-ui.config.json');
    } catch (err) {
      spin.fail('Failed to create lit-ui.config.json');
      throw err;
    }

    // Copy base files (only for copy-source mode)
    if (mode === 'copy-source') {
      const spin2 = spinner('Copying base files...');
      try {
        const libDir = resolve(cwd, libPath);
        await ensureDir(libDir);

        // Write TailwindElement
        await writeFile(
          resolve(libDir, 'tailwind-element.ts'),
          TAILWIND_ELEMENT_TEMPLATE
        );

        // Write host-defaults.css
        await writeFile(
          resolve(libDir, 'host-defaults.css'),
          HOST_DEFAULTS_TEMPLATE
        );

        // Write tailwind.css
        await writeFile(
          resolve(libDir, 'tailwind.css'),
          TAILWIND_CSS_TEMPLATE
        );

        spin2.succeed('Copied base files to ' + file(libPath));
      } catch (err) {
        spin2.fail('Failed to copy base files');
        throw err;
      }
    } else {
      info('Skipping base files (npm mode uses @lit-ui/core package)');
    }

    // Create components directory
    const componentsDir2 = resolve(cwd, componentsPath);
    if (!existsSync(componentsDir2)) {
      await ensureDir(componentsDir2);
      success('Created ' + file(componentsPath));
    }

    console.log('');

    // Show dependencies based on mode
    const deps = mode === 'npm' ? ['@lit-ui/core', 'lit'] : ['lit'];
    console.log(highlight('Dependencies:'));
    console.log(`  ${command(getInstallCommand(packageManager, deps))}`);
    console.log('');

    // Show setup instructions (only for copy-source mode)
    if (mode === 'copy-source') {
      console.log(highlight('Next steps:'));
      console.log(SETUP_INSTRUCTIONS[buildToolInfo.name]);
    } else {
      console.log(highlight('Next steps:'));
      console.log(`
Import and use components from @lit-ui packages:

  import '@lit-ui/button';

Components are ready to use - no additional setup required.
`);
    }

    console.log(highlight('Add your first component:'));
    console.log(`  ${command('lit-ui add button')}`);
    console.log('');

    success('lit-ui initialized successfully!');

    // Handle theme if provided
    if (args.theme) {
      console.log('');
      await applyTheme(cwd, args.theme, { yes: args.yes });
    } else {
      // Show hint about theme customization
      console.log('');
      info('Tip: Use --theme to customize colors. Get one at https://lit-ui.dev/themes');
    }
  },
});
