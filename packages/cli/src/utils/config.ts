import { readJson, writeJson, pathExists } from 'fs-extra';
import { resolve } from 'pathe';
import { defu } from 'defu';

/**
 * Configuration for a lit-ui project.
 */
export interface LitUIConfig {
  /** Optional JSON schema reference */
  $schema?: string;
  /** Directory where components are installed */
  componentsPath: string;
  /** Tailwind configuration */
  tailwind: {
    /** Path to the tailwind CSS file */
    css: string;
  };
  /** Import path aliases */
  aliases: {
    /** Alias for components directory */
    components: string;
    /** Alias for base/lib directory */
    base: string;
  };
}

/** Configuration file name */
export const CONFIG_FILE = 'lit-ui.json';

/** Default configuration values */
export const DEFAULT_CONFIG: LitUIConfig = {
  componentsPath: 'src/components/ui',
  tailwind: {
    css: 'src/styles/tailwind.css',
  },
  aliases: {
    components: '@/components/ui',
    base: '@/lib/lit-ui',
  },
};

/**
 * Check if a lit-ui config file exists in the given directory.
 */
export async function configExists(cwd: string): Promise<boolean> {
  const configPath = resolve(cwd, CONFIG_FILE);
  return pathExists(configPath);
}

/**
 * Read and parse the lit-ui config file, merging with defaults.
 * Returns null if config file doesn't exist.
 */
export async function getConfig(cwd: string): Promise<LitUIConfig | null> {
  const configPath = resolve(cwd, CONFIG_FILE);

  if (!(await pathExists(configPath))) {
    return null;
  }

  try {
    const userConfig = await readJson(configPath) as Partial<LitUIConfig>;
    // Merge user config with defaults (user values take precedence)
    return defu(userConfig, DEFAULT_CONFIG);
  } catch {
    return null;
  }
}

/**
 * Write a config file, merging provided config with defaults.
 * Adds $schema field for editor support.
 */
export async function writeConfig(
  cwd: string,
  config: Partial<LitUIConfig>
): Promise<void> {
  const configPath = resolve(cwd, CONFIG_FILE);

  // Merge with defaults and add schema
  const fullConfig: LitUIConfig = {
    $schema: 'https://lit-ui.dev/schema.json',
    ...defu(config, DEFAULT_CONFIG),
  };

  await writeJson(configPath, fullConfig, { spaces: 2 });
}
