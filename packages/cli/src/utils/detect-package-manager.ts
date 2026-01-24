import { detect } from 'package-manager-detector';

export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';

/**
 * Detect the package manager used in a project.
 * Checks lockfiles and package.json packageManager field.
 */
export async function detectPackageManager(
  cwd: string
): Promise<PackageManager> {
  const result = await detect({ cwd });

  if (result?.name) {
    // Normalize to our supported package managers
    const name = result.name;
    if (name === 'npm' || name === 'yarn' || name === 'pnpm' || name === 'bun') {
      return name;
    }
  }

  // Default to npm if detection fails
  return 'npm';
}

/**
 * Get the install command for a package manager.
 */
export function getInstallCommand(
  pm: PackageManager,
  packages: string[]
): string {
  const pkgList = packages.join(' ');

  switch (pm) {
    case 'npm':
      return `npm install ${pkgList}`;
    case 'yarn':
      return `yarn add ${pkgList}`;
    case 'pnpm':
      return `pnpm add ${pkgList}`;
    case 'bun':
      return `bun add ${pkgList}`;
    default:
      return `npm install ${pkgList}`;
  }
}

/**
 * Get the command prefix for running package.json scripts.
 */
export function getRunCommand(pm: PackageManager): string {
  switch (pm) {
    case 'npm':
      return 'npm run';
    case 'yarn':
      return 'yarn';
    case 'pnpm':
      return 'pnpm';
    case 'bun':
      return 'bun run';
    default:
      return 'npm run';
  }
}
