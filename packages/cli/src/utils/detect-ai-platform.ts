import { existsSync } from 'node:fs';
import { resolve } from 'pathe';

/**
 * Supported AI coding platforms and their skill directory paths.
 * Skills follow the Agent Skills open standard: https://agentskills.io
 */
export interface AIPlatform {
  /** Platform display name */
  name: string;
  /** Relative path from project root to the skills directory */
  skillsDir: string;
}

/**
 * Known AI platforms and their project-level skill discovery paths.
 *
 * Sources:
 * - Claude Code: https://code.claude.com/docs/en/skills
 * - Cursor: https://cursor.com/docs/context/skills
 * - VS Code / Copilot: https://code.visualstudio.com/docs/copilot/customization/agent-skills
 * - Windsurf: .windsurf/skills/ convention
 * - OpenAI Codex: .codex/skills/ convention
 * - OpenCode: https://opencode.ai/docs/skills
 * - Google Antigravity: https://codelabs.developers.google.com/getting-started-with-antigravity-skills
 */
const PLATFORM_DETECTORS: Array<{
  /** Directory to check for platform presence */
  detectDir: string;
  /** Platform info */
  platform: AIPlatform;
}> = [
  {
    detectDir: '.claude',
    platform: { name: 'Claude Code', skillsDir: '.claude/skills' },
  },
  {
    detectDir: '.cursor',
    platform: { name: 'Cursor', skillsDir: '.cursor/skills' },
  },
  {
    detectDir: '.github',
    platform: { name: 'GitHub Copilot', skillsDir: '.github/skills' },
  },
  {
    detectDir: '.windsurf',
    platform: { name: 'Windsurf', skillsDir: '.windsurf/skills' },
  },
  {
    detectDir: '.codex',
    platform: { name: 'Codex', skillsDir: '.codex/skills' },
  },
  {
    detectDir: '.opencode',
    platform: { name: 'OpenCode', skillsDir: '.opencode/skills' },
  },
  {
    detectDir: '.agent',
    platform: { name: 'Google Antigravity', skillsDir: '.agent/skills' },
  },
];

/**
 * Detect which AI coding platforms are present in the project directory.
 * Checks for platform-specific directories that indicate the tool is in use.
 *
 * @param cwd - Project root directory
 * @returns Array of detected platforms (may be empty or multiple)
 */
export function detectAIPlatforms(cwd: string): AIPlatform[] {
  const detected: AIPlatform[] = [];

  for (const { detectDir, platform } of PLATFORM_DETECTORS) {
    const dirPath = resolve(cwd, detectDir);
    if (existsSync(dirPath)) {
      detected.push(platform);
    }
  }

  return detected;
}

/**
 * Get all supported platform names for display.
 */
export function getSupportedPlatformNames(): string[] {
  return PLATFORM_DETECTORS.map((d) => d.platform.name);
}

/**
 * Get all platform definitions (for manual selection).
 */
export function getAllPlatforms(): AIPlatform[] {
  return PLATFORM_DETECTORS.map((d) => d.platform);
}
