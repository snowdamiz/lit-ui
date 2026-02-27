import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, dirname, join } from 'pathe';
import { consola } from 'consola';

import {
  detectAIPlatforms,
  getAllPlatforms,
  type AIPlatform,
} from './detect-ai-platform';
import { info, success, highlight } from './logger';

/**
 * Resolve the skill/ directory bundled with this package.
 * In dist/utils/inject-skills.js → dist/ → package root → skill/
 */
function getSkillSourceDir(): string {
  const __filename = fileURLToPath(import.meta.url);
  return join(dirname(__filename), '..', '..', 'skill');
}

export interface InjectSkillsOptions {
  /** Skip interactive prompts */
  yes?: boolean;
  /** Overwrite existing skill files */
  overwrite?: boolean;
}

/**
 * Copy the full skill/ tree into a platform's skills directory.
 * Target: <cwd>/<platform.skillsDir>/lit-ui/
 */
async function copySkillTree(
  cwd: string,
  platform: AIPlatform,
  overwrite: boolean = false
): Promise<boolean> {
  const sourceDir = getSkillSourceDir();

  if (!existsSync(sourceDir)) {
    return false;
  }

  const targetDir = resolve(cwd, platform.skillsDir, 'lit-ui');
  const rootSkillFile = join(targetDir, 'SKILL.md');

  if (!overwrite && existsSync(rootSkillFile)) {
    return false; // Already installed, skip
  }

  await fs.mkdir(targetDir, { recursive: true });
  await fs.cp(sourceDir, targetDir, {
    recursive: true,
    force: overwrite,
    errorOnExist: false,
    filter: (src) => !src.endsWith('.DS_Store'),
  });

  return true;
}

/**
 * Detect AI platforms and inject the lit-ui skill tree during `lit-ui init`.
 * Prompts the user to confirm or select platforms if multiple are detected.
 *
 * @returns The platforms that skills were injected into
 */
export async function injectOverviewSkills(
  cwd: string,
  options: InjectSkillsOptions = {}
): Promise<AIPlatform[]> {
  const detected = detectAIPlatforms(cwd);
  let platforms: AIPlatform[] = [];

  if (detected.length > 0) {
    const platformNames = detected.map((p) => p.name).join(', ');

    if (options.yes) {
      platforms = detected;
    } else {
      const inject = await consola.prompt(
        `Detected AI tools: ${highlight(platformNames)}. Inject Agent Skills for lit-ui?`,
        {
          type: 'confirm',
          initial: true,
        }
      );
      if (inject) {
        platforms = detected;
      }
    }
  } else {
    if (!options.yes) {
      const setupSkills = await consola.prompt(
        'No AI coding tools detected. Set up Agent Skills for an AI tool?',
        {
          type: 'confirm',
          initial: false,
        }
      );

      if (setupSkills) {
        const allPlatforms = getAllPlatforms();
        const selected = await consola.prompt('Which AI tool do you use?', {
          type: 'select',
          options: allPlatforms.map((p) => ({
            value: p.skillsDir,
            label: p.name,
            hint: p.skillsDir,
          })),
        });

        const platform = allPlatforms.find((p) => p.skillsDir === selected);
        if (platform) {
          platforms = [platform];
        }
      }
    }
  }

  if (platforms.length === 0) return [];

  const injected: AIPlatform[] = [];

  for (const platform of platforms) {
    const written = await copySkillTree(cwd, platform, options.overwrite);
    if (written) {
      injected.push(platform);
    }
  }

  if (injected.length > 0) {
    const names = injected.map((p) => p.name).join(', ');
    success(`Injected lit-ui Agent Skills for ${highlight(names)}`);
    info('Skills help your AI assistant understand the lit-ui API.');
  }

  return injected;
}

/**
 * Re-inject/update the skill tree into all platforms that already have it installed.
 * Called during `lit-ui add` to keep skills up to date.
 */
export async function injectComponentSkills(
  cwd: string,
  _componentName: string,
  options: InjectSkillsOptions = {}
): Promise<number> {
  // Find platforms that already have the skill installed
  const allPlatforms = getAllPlatforms();
  const activePlatforms = allPlatforms.filter((p) => {
    const rootSkill = resolve(cwd, p.skillsDir, 'lit-ui', 'SKILL.md');
    return existsSync(rootSkill);
  });

  if (activePlatforms.length === 0) return 0;

  let count = 0;
  for (const platform of activePlatforms) {
    const written = await copySkillTree(cwd, platform, true); // always overwrite to pick up new component skill
    if (written) count++;
  }

  return count;
}

/**
 * Inject/refresh the full skill tree into all active platforms.
 */
export async function injectAllComponentSkills(
  cwd: string,
  options: InjectSkillsOptions = {}
): Promise<number> {
  const allPlatforms = getAllPlatforms();
  const activePlatforms = allPlatforms.filter((p) => {
    const rootSkill = resolve(cwd, p.skillsDir, 'lit-ui', 'SKILL.md');
    return existsSync(rootSkill);
  });

  let count = 0;
  for (const platform of activePlatforms) {
    const written = await copySkillTree(cwd, platform, options.overwrite ?? true);
    if (written) count++;
  }

  return count;
}
