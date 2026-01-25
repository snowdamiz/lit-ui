import { execa } from 'execa';
import { consola } from 'consola';
import pc from 'picocolors';
import { detectPackageManager, type PackageManager } from './detect-package-manager';

/**
 * Map component names to npm package names
 */
export const componentToPackage: Record<string, string> = {
  button: '@lit-ui/button',
  dialog: '@lit-ui/dialog',
};

/**
 * Get install arguments for each package manager
 */
function getInstallArgs(pm: PackageManager, packageName: string): string[] {
  switch (pm) {
    case 'npm':
      return ['install', packageName];
    case 'yarn':
      return ['add', packageName];
    case 'pnpm':
      return ['add', packageName];
    case 'bun':
      return ['add', packageName];
  }
}

/**
 * Install a component via npm package manager
 */
export async function installComponent(
  componentName: string,
  cwd: string
): Promise<boolean> {
  const packageName = componentToPackage[componentName];

  if (!packageName) {
    consola.error(`Unknown component: ${pc.cyan(componentName)}`);
    consola.info('Available components: ' + Object.keys(componentToPackage).join(', '));
    return false;
  }

  const pm = await detectPackageManager(cwd);
  const args = getInstallArgs(pm, packageName);

  consola.start(`Installing ${pc.cyan(packageName)} via ${pm}...`);

  try {
    // First ensure @lit-ui/core is installed (peer dependency)
    const coreArgs = getInstallArgs(pm, '@lit-ui/core');
    await execa(pm, coreArgs, { cwd, stdio: 'pipe' });

    // Then install the component
    await execa(pm, args, { cwd, stdio: 'pipe' });

    consola.success(`Installed ${pc.cyan(packageName)}`);

    // Print usage instructions
    console.log('');
    console.log(pc.dim('Import:'));
    console.log(`  import '@lit-ui/${componentName}';`);
    console.log('');
    console.log(pc.dim('Usage:'));
    console.log(`  <lui-${componentName}>...</lui-${componentName}>`);

    return true;
  } catch (error) {
    consola.error(`Failed to install ${packageName}`);
    if (error instanceof Error) {
      consola.error(error.message);
    }
    return false;
  }
}

/**
 * Check if a component is available in npm mode
 */
export function isNpmComponent(componentName: string): boolean {
  return componentName in componentToPackage;
}
