import { defineCommand } from 'citty';
import { resolve, basename } from 'pathe';
import fsExtra from 'fs-extra';
import { consola } from 'consola';
import pc from 'picocolors';
import { getConfig, writeConfig, type LitUIConfig } from '../utils/config';
import { installComponent, componentToPackage } from '../utils/install-component';
import { detectModifications, formatDiff, getChangeSummary } from '../utils/diff-utils';
import { getComponentTemplate } from '../templates';

const { pathExists, readFile, remove } = fsExtra;

/**
 * Find copied component files in the project
 */
async function findCopiedComponents(
  config: LitUIConfig,
  cwd: string
): Promise<Array<{ name: string; path: string }>> {
  const components: Array<{ name: string; path: string }> = [];
  const componentsDir = resolve(cwd, config.componentsPath);

  // Check for known component files
  for (const componentName of Object.keys(componentToPackage)) {
    const filePath = resolve(componentsDir, `${componentName}.ts`);
    if (await pathExists(filePath)) {
      components.push({ name: componentName, path: filePath });
    }
  }

  return components;
}

/**
 * Migrate command - converts copy-source project to npm mode
 */
export const migrate = defineCommand({
  meta: {
    name: 'migrate',
    description: 'Migrate from copy-source to npm mode',
  },
  args: {
    cwd: {
      type: 'string',
      description: 'Working directory',
      default: '.',
    },
  },
  async run({ args }) {
    const cwd = resolve(args.cwd);

    console.log('');
    console.log(pc.bold('lit-ui migrate'));
    console.log('');

    // Step 1: Check config exists
    const config = await getConfig(cwd);
    if (!config) {
      consola.error('No lit-ui.config.json found. Nothing to migrate.');
      return;
    }

    // Step 2: Check if already npm mode
    if (config.mode === 'npm') {
      consola.info('Project already in npm mode. Nothing to migrate.');
      return;
    }

    // Step 3: Find copied components
    const copiedComponents = await findCopiedComponents(config, cwd);

    if (copiedComponents.length === 0) {
      consola.info('No copied components found. Updating mode to npm...');
      await writeConfig(cwd, { ...config, mode: 'npm' });
      consola.success('Config updated to npm mode.');
      return;
    }

    consola.info(`Found ${copiedComponents.length} component(s) to migrate:`);
    for (const comp of copiedComponents) {
      consola.info(`  - ${pc.cyan(comp.name)}`);
    }
    console.log('');

    // Step 4: Process each component
    const migratedComponents: string[] = [];
    const skippedComponents: string[] = [];

    for (const component of copiedComponents) {
      console.log(pc.dim(`--- ${component.name} ---`));

      // Get original template content for comparison
      const originalContent = getComponentTemplate(component.name);
      if (!originalContent) {
        consola.warn(`No template found for ${component.name}. Skipping.`);
        skippedComponents.push(component.name);
        continue;
      }

      // Read current file content
      const currentContent = await readFile(component.path, 'utf-8');

      // Check for modifications
      const { modified, changes } = detectModifications(originalContent, currentContent);

      if (modified) {
        const summary = getChangeSummary(changes);
        console.log('');
        consola.warn(`${pc.cyan(component.name)} has been modified:`);
        console.log(pc.dim(`  ${summary.added} line(s) added, ${summary.removed} line(s) removed`));
        console.log('');
        console.log(formatDiff(changes));
        console.log('');

        const confirm = await consola.prompt(
          'Replace with npm package? Your changes will be lost.',
          { type: 'confirm', initial: false }
        );

        if (!confirm) {
          consola.info(`Skipping ${component.name}`);
          skippedComponents.push(component.name);
          continue;
        }
      }

      // Install npm package
      const success = await installComponent(component.name, cwd);

      if (success) {
        // Delete source file
        await remove(component.path);
        consola.info(`Deleted ${pc.dim(component.path)}`);
        migratedComponents.push(component.name);
      } else {
        consola.error(`Failed to install ${component.name}. Keeping source file.`);
        skippedComponents.push(component.name);
      }

      console.log('');
    }

    // Step 5: Update config to npm mode
    await writeConfig(cwd, { ...config, mode: 'npm' });

    // Step 6: Summary
    console.log('');
    if (migratedComponents.length > 0) {
      consola.success(
        `Migrated ${migratedComponents.length} component(s): ${pc.cyan(migratedComponents.join(', '))}`
      );
    }
    if (skippedComponents.length > 0) {
      consola.info(
        `Skipped ${skippedComponents.length} component(s): ${pc.dim(skippedComponents.join(', '))}`
      );
    }

    console.log('');
    consola.info('Update your imports from local paths to @lit-ui/* packages:');
    for (const name of migratedComponents) {
      console.log(pc.dim(`  - import './${basename(config.componentsPath)}/${name}'`));
      console.log(pc.green(`  + import '@lit-ui/${name}';`));
    }

    console.log('');
    consola.success('Migration complete! Config updated to npm mode.');
  },
});
