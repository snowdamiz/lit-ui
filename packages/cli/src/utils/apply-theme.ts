import { resolve } from 'pathe';
import fsExtra from 'fs-extra';
import { consola } from 'consola';
import { decodeThemeConfig, generateThemeCSS } from '../theme/index.js';
import { injectThemeImport } from './inject-import.js';
import { success, error, info } from './logger.js';

const { pathExists, writeFile } = fsExtra;

/**
 * Theme CSS filename written to the project root.
 */
const THEME_FILE = 'lit-ui-theme.css';

/**
 * URL for the theme configurator.
 */
const CONFIGURATOR_URL = 'https://lit-ui.dev/themes';

/**
 * Options for theme application.
 */
export interface ApplyThemeOptions {
  /** Skip confirmation prompts (default: false) */
  yes?: boolean;
}

/**
 * Apply a theme to a project.
 *
 * This function:
 * 1. Checks for existing theme file and handles replacement
 * 2. Decodes and validates the theme configuration
 * 3. Generates CSS from the theme
 * 4. Writes the CSS file to the project root
 * 5. Injects the import into the main CSS entry file
 *
 * @param cwd - The project root directory
 * @param encoded - Base64url-encoded theme configuration
 * @param options - Configuration options
 *
 * @example
 * ```ts
 * // From CLI with encoded theme string
 * await applyTheme(process.cwd(), 'eyJ2ZXJzaW9uIjox...', { yes: false });
 * ```
 */
export async function applyTheme(
  cwd: string,
  encoded: string,
  options: ApplyThemeOptions = {}
): Promise<void> {
  const themePath = resolve(cwd, THEME_FILE);
  const themeExists = await pathExists(themePath);

  // Handle existing theme file
  if (themeExists) {
    const isTTY = process.stdout.isTTY;

    if (options.yes) {
      // --yes flag: proceed silently to replace
    } else if (isTTY) {
      // Interactive mode: prompt user
      const replace = await consola.prompt('Theme exists. Replace?', {
        type: 'confirm',
        initial: false,
      });

      if (!replace) {
        info('Theme unchanged.');
        return;
      }
    } else {
      // Non-TTY without --yes: don't replace
      info('Theme exists. Use interactive mode to replace.');
      return;
    }
  }

  // Decode and validate theme
  let config;
  try {
    config = decodeThemeConfig(encoded);
  } catch (err) {
    error('Invalid theme. Generate a new one from the configurator.');
    info(CONFIGURATOR_URL);
    process.exit(1);
  }

  // Generate CSS
  const css = generateThemeCSS(config);

  // Write theme file
  await writeFile(themePath, css, 'utf-8');
  success('Theme applied.');

  // Inject import into CSS entry file
  await injectThemeImport(cwd);
}
