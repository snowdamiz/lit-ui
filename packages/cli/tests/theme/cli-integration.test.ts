/**
 * CLI Theme Integration Tests
 *
 * Tests for the CLI theme utilities that handle:
 * - CSS entry file detection (detectCssEntry)
 * - Theme import injection (injectThemeImport)
 * - Theme encoding round-trip integration
 *
 * These tests verify the complete workflow from theme encoding
 * to CSS generation to file output.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { resolve, join } from 'pathe';
import fsExtra from 'fs-extra';
import { detectCssEntry } from '../../src/utils/detect-css-entry.js';
import { injectThemeImport } from '../../src/utils/inject-import.js';
import {
  encodeThemeConfig,
  decodeThemeConfig,
  defaultTheme,
  generateThemeCSS,
} from '../../src/theme/index.js';

const { ensureDir, writeFile, readFile, remove, pathExists } = fsExtra;

// Test fixtures directory - use unique name per test file
const FIXTURES_DIR = resolve(__dirname, '../fixtures/cli-theme-test');

describe('CLI Theme Integration', () => {
  beforeEach(async () => {
    await ensureDir(FIXTURES_DIR);
  });

  afterEach(async () => {
    await remove(FIXTURES_DIR);
  });

  describe('detectCssEntry', () => {
    it('detects Next.js App Router globals.css', async () => {
      const cssPath = join(FIXTURES_DIR, 'src/app/globals.css');
      await ensureDir(join(FIXTURES_DIR, 'src/app'));
      await writeFile(cssPath, '@import "tailwindcss";\n');

      const result = await detectCssEntry(FIXTURES_DIR);
      expect(result).toBe('src/app/globals.css');
    });

    it('detects Next.js without src directory', async () => {
      const cssPath = join(FIXTURES_DIR, 'app/globals.css');
      await ensureDir(join(FIXTURES_DIR, 'app'));
      await writeFile(cssPath, '@import "tailwindcss";\n');

      const result = await detectCssEntry(FIXTURES_DIR);
      expect(result).toBe('app/globals.css');
    });

    it('detects Vite src/index.css', async () => {
      const cssPath = join(FIXTURES_DIR, 'src/index.css');
      await ensureDir(join(FIXTURES_DIR, 'src'));
      await writeFile(cssPath, "@import 'tailwindcss';\n");

      const result = await detectCssEntry(FIXTURES_DIR);
      expect(result).toBe('src/index.css');
    });

    it('returns null when no CSS entry found', async () => {
      const result = await detectCssEntry(FIXTURES_DIR);
      expect(result).toBeNull();
    });

    it('ignores CSS files without Tailwind import', async () => {
      const cssPath = join(FIXTURES_DIR, 'src/index.css');
      await ensureDir(join(FIXTURES_DIR, 'src'));
      await writeFile(cssPath, 'body { margin: 0; }\n');

      const result = await detectCssEntry(FIXTURES_DIR);
      expect(result).toBeNull();
    });

    it('detects @tailwind base syntax', async () => {
      const cssPath = join(FIXTURES_DIR, 'src/index.css');
      await ensureDir(join(FIXTURES_DIR, 'src'));
      await writeFile(cssPath, '@tailwind base;\n@tailwind components;\n');

      const result = await detectCssEntry(FIXTURES_DIR);
      expect(result).toBe('src/index.css');
    });

    it('respects priority order - src/app/globals.css first', async () => {
      // Create both Next.js App Router and Vite entry files
      const nextPath = join(FIXTURES_DIR, 'src/app/globals.css');
      const vitePath = join(FIXTURES_DIR, 'src/index.css');

      await ensureDir(join(FIXTURES_DIR, 'src/app'));
      await writeFile(nextPath, '@import "tailwindcss";\n');
      await writeFile(vitePath, '@import "tailwindcss";\n');

      const result = await detectCssEntry(FIXTURES_DIR);
      // Next.js App Router comes first in priority
      expect(result).toBe('src/app/globals.css');
    });

    it('detects styles in src/styles/index.css', async () => {
      const cssPath = join(FIXTURES_DIR, 'src/styles/index.css');
      await ensureDir(join(FIXTURES_DIR, 'src/styles'));
      await writeFile(cssPath, '@import "tailwindcss";\n');

      const result = await detectCssEntry(FIXTURES_DIR);
      expect(result).toBe('src/styles/index.css');
    });
  });

  describe('injectThemeImport', () => {
    it('injects import into detected CSS file', async () => {
      const cssPath = join(FIXTURES_DIR, 'src/index.css');
      await ensureDir(join(FIXTURES_DIR, 'src'));
      await writeFile(cssPath, '@import "tailwindcss";\n\nbody { margin: 0; }');
      await writeFile(join(FIXTURES_DIR, 'lit-ui-theme.css'), ':root { }');

      await injectThemeImport(FIXTURES_DIR);

      const content = await readFile(cssPath, 'utf-8');
      expect(content).toContain('lit-ui-theme.css');
      expect(content).toContain('@import "tailwindcss"');
    });

    it('calculates correct relative path from nested CSS', async () => {
      const cssPath = join(FIXTURES_DIR, 'src/styles/main.css');
      await ensureDir(join(FIXTURES_DIR, 'src/styles'));
      await writeFile(cssPath, '@import "tailwindcss";');
      await writeFile(join(FIXTURES_DIR, 'lit-ui-theme.css'), ':root { }');

      await injectThemeImport(FIXTURES_DIR);

      const content = await readFile(cssPath, 'utf-8');
      // Should have ../../lit-ui-theme.css (go up from src/styles to root)
      expect(content).toContain('../../lit-ui-theme.css');
    });

    it('calculates correct relative path from single-level nested CSS', async () => {
      const cssPath = join(FIXTURES_DIR, 'src/index.css');
      await ensureDir(join(FIXTURES_DIR, 'src'));
      await writeFile(cssPath, '@import "tailwindcss";');
      await writeFile(join(FIXTURES_DIR, 'lit-ui-theme.css'), ':root { }');

      await injectThemeImport(FIXTURES_DIR);

      const content = await readFile(cssPath, 'utf-8');
      // Should have ../lit-ui-theme.css (go up from src to root)
      expect(content).toContain('../lit-ui-theme.css');
    });

    it('is idempotent - does not duplicate import', async () => {
      const cssPath = join(FIXTURES_DIR, 'src/index.css');
      await ensureDir(join(FIXTURES_DIR, 'src'));
      await writeFile(
        cssPath,
        "@import 'tailwindcss';\n@import '../lit-ui-theme.css';"
      );

      await injectThemeImport(FIXTURES_DIR);
      await injectThemeImport(FIXTURES_DIR);

      const content = await readFile(cssPath, 'utf-8');
      const matches = content.match(/lit-ui-theme\.css/g);
      expect(matches).toHaveLength(1);
    });

    it('inserts after existing @import lines', async () => {
      const cssPath = join(FIXTURES_DIR, 'src/index.css');
      await ensureDir(join(FIXTURES_DIR, 'src'));
      await writeFile(
        cssPath,
        "@import 'tailwindcss';\n@import 'custom.css';\n\n:root { }"
      );
      await writeFile(join(FIXTURES_DIR, 'lit-ui-theme.css'), ':root { }');

      await injectThemeImport(FIXTURES_DIR);

      const content = await readFile(cssPath, 'utf-8');
      const lines = content.split('\n');
      const tailwindIndex = lines.findIndex((l) => l.includes('tailwindcss'));
      const customIndex = lines.findIndex((l) => l.includes('custom.css'));
      const themeIndex = lines.findIndex((l) => l.includes('lit-ui-theme'));
      const rootIndex = lines.findIndex((l) => l.includes(':root'));

      // Theme import should be after tailwind and custom, before :root
      expect(themeIndex).toBeGreaterThan(tailwindIndex);
      expect(themeIndex).toBeGreaterThan(customIndex);
      expect(themeIndex).toBeLessThan(rootIndex);
    });

    it('preserves @charset directive at start', async () => {
      const cssPath = join(FIXTURES_DIR, 'src/index.css');
      await ensureDir(join(FIXTURES_DIR, 'src'));
      await writeFile(
        cssPath,
        "@charset 'UTF-8';\n@import 'tailwindcss';\n\nbody { }"
      );
      await writeFile(join(FIXTURES_DIR, 'lit-ui-theme.css'), ':root { }');

      await injectThemeImport(FIXTURES_DIR);

      const content = await readFile(cssPath, 'utf-8');
      const lines = content.split('\n');
      const charsetIndex = lines.findIndex((l) => l.includes('@charset'));
      const themeIndex = lines.findIndex((l) => l.includes('lit-ui-theme'));

      // @charset should remain first
      expect(charsetIndex).toBe(0);
      expect(themeIndex).toBeGreaterThan(charsetIndex);
    });
  });

  describe('Theme file generation', () => {
    it('writes theme CSS file to project root', async () => {
      const themePath = join(FIXTURES_DIR, 'lit-ui-theme.css');
      const css = generateThemeCSS(defaultTheme);
      await writeFile(themePath, css);

      expect(await pathExists(themePath)).toBe(true);
      const content = await readFile(themePath, 'utf-8');
      expect(content).toContain('--color-');
      expect(content).toContain(':root');
    });

    it('generates CSS with all required variables', async () => {
      const css = generateThemeCSS(defaultTheme);

      // Light mode variables
      expect(css).toContain(':root');
      expect(css).toContain('--color-primary:');
      expect(css).toContain('--color-secondary:');
      expect(css).toContain('--color-destructive:');
      expect(css).toContain('--color-background:');
      expect(css).toContain('--color-foreground:');
      expect(css).toContain('--color-muted:');

      // Dark mode
      expect(css).toContain('.dark');
      expect(css).toContain('@media (prefers-color-scheme: dark)');

      // Radius tokens
      expect(css).toContain('--ui-button-radius:');
      expect(css).toContain('--ui-dialog-radius:');
      expect(css).toContain('--ui-input-radius:');
    });
  });

  describe('Encoding round-trip', () => {
    it('encoded theme produces valid CSS', () => {
      const encoded = encodeThemeConfig(defaultTheme);
      const decoded = decodeThemeConfig(encoded);
      const css = generateThemeCSS(decoded);

      expect(css).toContain(':root');
      expect(css).toContain('.dark');
      expect(css).toContain('--color-primary');
    });

    it('preserves custom colors through round-trip', () => {
      const customTheme = {
        ...defaultTheme,
        colors: {
          ...defaultTheme.colors,
          primary: 'oklch(0.55 0.25 280)', // Custom purple
        },
      };

      const encoded = encodeThemeConfig(customTheme);
      const decoded = decodeThemeConfig(encoded);
      const css = generateThemeCSS(decoded);

      expect(decoded.colors.primary).toBe('oklch(0.55 0.25 280)');
      expect(css).toContain('oklch(0.55 0.25 280)');
    });

    it('handles different radius values', () => {
      for (const radius of ['sm', 'md', 'lg'] as const) {
        const theme = { ...defaultTheme, radius };
        const encoded = encodeThemeConfig(theme);
        const decoded = decodeThemeConfig(encoded);

        expect(decoded.radius).toBe(radius);
      }
    });
  });

  describe('Complete CLI workflow', () => {
    it('simulates init --theme workflow', async () => {
      // Step 1: User creates encoded theme from configurator
      const customTheme = {
        ...defaultTheme,
        colors: {
          ...defaultTheme.colors,
          primary: 'oklch(0.6 0.18 220)', // Brand blue
        },
      };
      const encodedTheme = encodeThemeConfig(customTheme);

      // Step 2: CLI decodes and validates
      const decoded = decodeThemeConfig(encodedTheme);
      expect(decoded.colors.primary).toBe('oklch(0.6 0.18 220)');

      // Step 3: Generate CSS
      const css = generateThemeCSS(decoded);
      expect(css).toContain('oklch(0.6 0.18 220)');

      // Step 4: Write theme file
      const themePath = join(FIXTURES_DIR, 'lit-ui-theme.css');
      await writeFile(themePath, css);
      expect(await pathExists(themePath)).toBe(true);

      // Step 5: Create CSS entry file
      const cssPath = join(FIXTURES_DIR, 'src/app/globals.css');
      await ensureDir(join(FIXTURES_DIR, 'src/app'));
      await writeFile(cssPath, '@import "tailwindcss";\n');

      // Step 6: Inject import
      await injectThemeImport(FIXTURES_DIR);

      // Verify final state
      const cssContent = await readFile(cssPath, 'utf-8');
      expect(cssContent).toContain('lit-ui-theme.css');
      expect(cssContent).toContain('@import "tailwindcss"');
    });

    it('simulates theme command workflow', async () => {
      // Step 1: Set up existing project with CSS entry
      const cssPath = join(FIXTURES_DIR, 'src/index.css');
      await ensureDir(join(FIXTURES_DIR, 'src'));
      await writeFile(cssPath, '@import "tailwindcss";\n\nbody { margin: 0; }');

      // Step 2: Receive encoded theme from CLI
      const encoded = encodeThemeConfig(defaultTheme);

      // Step 3: Decode and generate CSS
      const config = decodeThemeConfig(encoded);
      const css = generateThemeCSS(config);

      // Step 4: Write theme file
      const themePath = join(FIXTURES_DIR, 'lit-ui-theme.css');
      await writeFile(themePath, css);

      // Step 5: Inject import
      await injectThemeImport(FIXTURES_DIR);

      // Verify theme was applied
      const themeContent = await readFile(themePath, 'utf-8');
      expect(themeContent).toContain(':root');
      expect(themeContent).toContain('--color-primary');

      const cssContent = await readFile(cssPath, 'utf-8');
      expect(cssContent).toContain('lit-ui-theme.css');
    });
  });

  describe('Error handling', () => {
    it('detectCssEntry handles non-existent directory gracefully', async () => {
      const result = await detectCssEntry(join(FIXTURES_DIR, 'nonexistent'));
      expect(result).toBeNull();
    });

    it('injectThemeImport warns when no CSS entry found', async () => {
      // Empty project - no CSS files
      // injectThemeImport should not throw, just warn
      await expect(injectThemeImport(FIXTURES_DIR)).resolves.not.toThrow();
    });

    it('decodeThemeConfig throws on invalid encoding', () => {
      expect(() => decodeThemeConfig('not!valid@base64$')).toThrow(
        'Invalid theme encoding'
      );
    });

    it('decodeThemeConfig throws on invalid JSON', () => {
      const invalidJson = Buffer.from('{invalid}', 'utf-8').toString('base64url');
      expect(() => decodeThemeConfig(invalidJson)).toThrow('malformed JSON');
    });

    it('decodeThemeConfig throws on invalid schema', () => {
      const wrongSchema = Buffer.from(
        JSON.stringify({ version: 99, foo: 'bar' }),
        'utf-8'
      ).toString('base64url');
      expect(() => decodeThemeConfig(wrongSchema)).toThrow('Invalid theme config');
    });
  });
});
