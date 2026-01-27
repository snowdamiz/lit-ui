import { existsSync } from 'node:fs';
import { resolve, join } from 'pathe';
import fsExtra from 'fs-extra';
import { consola } from 'consola';

import {
  detectAIPlatforms,
  getAllPlatforms,
  type AIPlatform,
} from './detect-ai-platform';
import {
  LIT_UI_OVERVIEW_SKILL,
  COMPONENT_SKILLS,
} from './skill-content';
import { info, success, warn, highlight } from './logger';

const { ensureDir, writeFile, pathExists } = fsExtra;

/**
 * Write a SKILL.md file to a skill directory.
 * Creates the directory if it doesn't exist.
 */
async function writeSkillFile(
  skillDir: string,
  content: string,
  overwrite: boolean = false
): Promise<boolean> {
  const skillFile = join(skillDir, 'SKILL.md');

  if (!overwrite && existsSync(skillFile)) {
    return false; // Already exists, don't overwrite
  }

  await ensureDir(skillDir);
  await writeFile(skillFile, content, 'utf-8');
  return true;
}

/**
 * Inject the overview skill (lit-ui) into a platform's skills directory.
 */
async function injectOverviewSkill(
  cwd: string,
  platform: AIPlatform,
  overwrite: boolean = false
): Promise<boolean> {
  const skillDir = resolve(cwd, platform.skillsDir, 'lit-ui');
  return writeSkillFile(skillDir, LIT_UI_OVERVIEW_SKILL, overwrite);
}

/**
 * Inject a component-specific skill into a platform's skills directory.
 */
async function injectComponentSkill(
  cwd: string,
  platform: AIPlatform,
  componentName: string,
  overwrite: boolean = false
): Promise<boolean> {
  const content = COMPONENT_SKILLS[componentName];
  if (!content) return false;

  const skillDir = resolve(cwd, platform.skillsDir, `lit-ui-${componentName}`);
  return writeSkillFile(skillDir, content, overwrite);
}

export interface InjectSkillsOptions {
  /** Skip interactive prompts */
  yes?: boolean;
  /** Overwrite existing skill files */
  overwrite?: boolean;
}

/**
 * Detect AI platforms and inject the overview skill during `lit-ui init`.
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
    // Platforms detected - confirm injection
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
    // No platforms detected - ask if they want to set one up
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

  // Inject overview skill into each platform
  const injected: AIPlatform[] = [];

  for (const platform of platforms) {
    const written = await injectOverviewSkill(cwd, platform, options.overwrite);
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
 * Inject a component-specific skill during `lit-ui add`.
 * Only injects if platforms are already set up (skills directory exists).
 *
 * @returns Number of platforms the skill was injected into
 */
export async function injectComponentSkills(
  cwd: string,
  componentName: string,
  options: InjectSkillsOptions = {}
): Promise<number> {
  if (!COMPONENT_SKILLS[componentName]) return 0;

  // Find platforms that already have the overview skill (i.e., skills were set up)
  const allPlatforms = getAllPlatforms();
  const activePlatforms = allPlatforms.filter((p) => {
    const overviewSkill = resolve(cwd, p.skillsDir, 'lit-ui', 'SKILL.md');
    return existsSync(overviewSkill);
  });

  if (activePlatforms.length === 0) return 0;

  let injectedCount = 0;

  for (const platform of activePlatforms) {
    const written = await injectComponentSkill(
      cwd,
      platform,
      componentName,
      options.overwrite
    );
    if (written) {
      injectedCount++;
    }
  }

  if (injectedCount > 0) {
    info(`Injected ${highlight(componentName)} skill for AI tools`);
  }

  return injectedCount;
}

/**
 * Inject all available component skills at once (for bulk setup).
 */
export async function injectAllComponentSkills(
  cwd: string,
  options: InjectSkillsOptions = {}
): Promise<number> {
  let totalInjected = 0;

  for (const componentName of Object.keys(COMPONENT_SKILLS)) {
    const count = await injectComponentSkills(cwd, componentName, options);
    totalInjected += count;
  }

  return totalInjected;
}
