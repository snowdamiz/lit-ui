import fsExtra from 'fs-extra';
import { consola } from 'consola';
import { resolve, dirname, basename } from 'pathe';
import type { RegistryFile } from './registry';
import type { LitUIConfig } from './config';
import { getComponentTemplate } from '../templates';

const { writeFile, pathExists, ensureDir } = fsExtra;

/**
 * Options for copying component files
 */
export interface CopyOptions {
  /** Overwrite existing files without prompting */
  overwrite?: boolean;
  /** Skip all prompts (implies skip on conflict if not overwrite) */
  yes?: boolean;
}

/**
 * Result of a copy operation
 */
export interface CopyResult {
  /** Target file path */
  path: string;
  /** Whether the file was copied */
  copied: boolean;
  /** Whether the file was skipped due to conflict */
  skipped: boolean;
}

/**
 * Copy a single component file with conflict handling.
 *
 * @param content - The file content to write
 * @param targetPath - The target file path
 * @param options - Copy options for conflict handling
 * @returns Whether the file was copied
 */
export async function copyComponent(
  content: string,
  targetPath: string,
  options: CopyOptions
): Promise<boolean> {
  // Ensure target directory exists
  await ensureDir(dirname(targetPath));

  const exists = await pathExists(targetPath);

  if (exists && !options.overwrite) {
    if (options.yes) {
      consola.warn(`Skipping ${basename(targetPath)} (already exists)`);
      return false;
    }

    const resolution = (await consola.prompt(`File exists: ${targetPath}`, {
      type: 'select',
      options: [
        { value: 'overwrite', label: 'Overwrite' },
        { value: 'skip', label: 'Skip' },
      ],
    })) as string;

    if (resolution === 'skip') {
      return false;
    }
  }

  await writeFile(targetPath, content, 'utf-8');
  return true;
}

/**
 * Get the source content for a component file.
 * Uses embedded templates for MVP.
 *
 * @param componentName - The component name (e.g., 'button', 'dialog')
 * @returns The file content
 */
export function getComponentContent(componentName: string): string {
  const template = getComponentTemplate(componentName);

  if (!template) {
    throw new Error(`Component template not found: ${componentName}`);
  }

  return template;
}

/**
 * Get the target path for a registry file in the user's project.
 *
 * @param file - The registry file entry
 * @param config - The lit-ui config
 * @param cwd - The working directory
 * @returns The target path
 */
export function getTargetPath(
  file: RegistryFile,
  config: LitUIConfig,
  cwd: string
): string {
  // Components go to componentsPath
  // e.g., components/button/button.ts -> src/components/ui/button.ts
  if (file.type === 'component') {
    const fileName = basename(file.path);
    return resolve(cwd, config.componentsPath, fileName);
  }

  // Base files go to lib/lit-ui relative to componentsPath
  // e.g., base/tailwind-element.ts -> src/lib/lit-ui/tailwind-element.ts
  // componentsPath is like 'src/components/ui', so lib is at 'src/lib/lit-ui'
  const componentsDir = dirname(config.componentsPath);
  const libPath = resolve(cwd, componentsDir, 'lib/lit-ui');
  const fileName = basename(file.path);
  return resolve(libPath, fileName);
}

/**
 * Copy a component's files to the user's project.
 *
 * @param componentName - The component name (e.g., 'button', 'dialog')
 * @param files - Array of registry file entries
 * @param config - The lit-ui config
 * @param cwd - Working directory
 * @param options - Copy options
 * @returns Array of copy results
 */
export async function copyComponentFiles(
  componentName: string,
  files: RegistryFile[],
  config: LitUIConfig,
  cwd: string,
  options: CopyOptions
): Promise<CopyResult[]> {
  const results: CopyResult[] = [];

  // Get the embedded template for this component
  const content = getComponentContent(componentName);

  for (const file of files) {
    const targetPath = getTargetPath(file, config, cwd);
    const copied = await copyComponent(content, targetPath, options);

    results.push({
      path: targetPath,
      copied,
      skipped: !copied,
    });
  }

  return results;
}
