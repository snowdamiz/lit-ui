import { resolve, dirname } from 'pathe';
import fsExtra from 'fs-extra';

const { pathExists, readFile } = fsExtra;

/**
 * CSS file candidates to check, in order of likelihood.
 * These represent common Tailwind CSS entry file locations.
 */
const CSS_CANDIDATES = [
  'src/app/globals.css', // Next.js App Router
  'app/globals.css', // Next.js without src
  'src/index.css', // Vite default
  'src/styles/index.css',
  'src/main.css',
  'src/styles/main.css',
  'src/styles/globals.css',
  'styles/globals.css',
  'src/styles/tailwind.css',
  'src/tailwind.css',
] as const;

/**
 * Patterns that indicate a Tailwind CSS entry file.
 */
const TAILWIND_PATTERNS = [
  /@import\s+["']tailwindcss["']/,
  /@import\s+['"]tailwindcss['"]/,
  /@tailwind\s+base/,
];

/**
 * Check if file content appears to be a Tailwind CSS entry file.
 */
function isTailwindEntry(content: string): boolean {
  return TAILWIND_PATTERNS.some((pattern) => pattern.test(content));
}

/**
 * Detect the main CSS entry file for Tailwind in a project.
 *
 * Checks common locations for CSS files and verifies they contain
 * Tailwind directives (`@import "tailwindcss"` or `@tailwind base`).
 *
 * @param cwd - The project root directory
 * @returns The relative path to the CSS entry file, or null if not found
 *
 * @example
 * ```ts
 * const cssPath = await detectCssEntry(process.cwd());
 * if (cssPath) {
 *   console.log(`Found Tailwind CSS at: ${cssPath}`);
 * }
 * ```
 */
export async function detectCssEntry(cwd: string): Promise<string | null> {
  for (const candidate of CSS_CANDIDATES) {
    const fullPath = resolve(cwd, candidate);

    if (await pathExists(fullPath)) {
      try {
        const content = await readFile(fullPath, 'utf-8');
        if (isTailwindEntry(content)) {
          return candidate;
        }
      } catch {
        // Skip files we can't read
        continue;
      }
    }
  }

  return null;
}
