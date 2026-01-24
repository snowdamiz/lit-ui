import { existsSync } from 'node:fs';
import { resolve } from 'pathe';
import { readJson } from 'fs-extra';

export type BuildToolName = 'vite' | 'webpack' | 'esbuild' | 'unknown';

export interface BuildToolInfo {
  name: BuildToolName;
  configFile?: string;
}

/** Config files to check for each build tool */
const BUILD_TOOL_CONFIG_FILES: Record<
  Exclude<BuildToolName, 'unknown'>,
  string[]
> = {
  vite: ['vite.config.ts', 'vite.config.js', 'vite.config.mts'],
  webpack: ['webpack.config.js', 'webpack.config.ts'],
  esbuild: ['esbuild.config.js', 'esbuild.config.mjs'],
};

/**
 * Detect the build tool used in a project.
 * First checks for config files, then falls back to package.json dependencies.
 */
export function detectBuildTool(cwd: string): BuildToolInfo {
  // Check config files in order of priority
  for (const [tool, configFiles] of Object.entries(BUILD_TOOL_CONFIG_FILES)) {
    for (const configFile of configFiles) {
      const configPath = resolve(cwd, configFile);
      if (existsSync(configPath)) {
        return { name: tool as BuildToolName, configFile };
      }
    }
  }

  // Fallback: check package.json devDependencies
  const packageJsonPath = resolve(cwd, 'package.json');
  if (existsSync(packageJsonPath)) {
    try {
      // Synchronous read for simplicity - this is a one-time detection
      const pkg = require(packageJsonPath) as {
        devDependencies?: Record<string, string>;
        dependencies?: Record<string, string>;
      };
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

      if (allDeps.vite) return { name: 'vite' };
      if (allDeps.webpack) return { name: 'webpack' };
      if (allDeps.esbuild) return { name: 'esbuild' };
    } catch {
      // Ignore errors reading package.json
    }
  }

  return { name: 'unknown' };
}

/**
 * Async version of detectBuildTool for consistency with other utils.
 */
export async function detectBuildToolAsync(
  cwd: string
): Promise<BuildToolInfo> {
  // Check config files in order of priority
  for (const [tool, configFiles] of Object.entries(BUILD_TOOL_CONFIG_FILES)) {
    for (const configFile of configFiles) {
      const configPath = resolve(cwd, configFile);
      if (existsSync(configPath)) {
        return { name: tool as BuildToolName, configFile };
      }
    }
  }

  // Fallback: check package.json devDependencies
  const packageJsonPath = resolve(cwd, 'package.json');
  if (existsSync(packageJsonPath)) {
    try {
      const pkg = (await readJson(packageJsonPath)) as {
        devDependencies?: Record<string, string>;
        dependencies?: Record<string, string>;
      };
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

      if (allDeps.vite) return { name: 'vite' };
      if (allDeps.webpack) return { name: 'webpack' };
      if (allDeps.esbuild) return { name: 'esbuild' };
    } catch {
      // Ignore errors reading package.json
    }
  }

  return { name: 'unknown' };
}
