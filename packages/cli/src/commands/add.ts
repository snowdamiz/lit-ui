import { defineCommand } from 'citty';
import { resolve } from 'pathe';
import { consola } from 'consola';
import pc from 'picocolors';
import { getConfig } from '../utils/config';
import {
  getComponent,
  resolveDependencies,
  type RegistryComponent,
} from '../utils/registry';
import { copyComponentFiles, type CopyResult } from '../utils/copy-component';

/**
 * Add command - adds a component to the user's project
 */
export const add = defineCommand({
  meta: {
    name: 'add',
    description: 'Add a component to your project',
  },
  args: {
    component: {
      type: 'positional',
      description: 'Component name to add',
      required: true,
    },
    yes: {
      type: 'boolean',
      alias: 'y',
      description: 'Skip confirmation prompts',
      default: false,
    },
    overwrite: {
      type: 'boolean',
      alias: 'o',
      description: 'Overwrite existing files',
      default: false,
    },
    cwd: {
      type: 'string',
      description: 'Working directory',
      default: '.',
    },
  },
  async run({ args }) {
    const cwd = resolve(args.cwd);
    const componentName = args.component;

    // Step 1: Check if lit-ui.json exists
    const config = await getConfig(cwd);
    if (!config) {
      consola.error(
        `No lit-ui.json found. Run ${pc.cyan('lit-ui init')} first.`
      );
      process.exit(1);
    }

    // Step 2: Look up component in registry
    const component = getComponent(componentName);
    if (!component) {
      consola.error(`Component ${pc.cyan(componentName)} not found in registry.`);
      consola.info('Available components:');
      const { listComponents } = await import('../utils/registry');
      for (const c of listComponents()) {
        consola.info(`  - ${pc.cyan(c.name)}: ${c.description}`);
      }
      process.exit(1);
    }

    // Step 3: Resolve dependencies
    const allComponentNames = resolveDependencies(componentName);
    const componentsToAdd: RegistryComponent[] = [];

    for (const name of allComponentNames) {
      const comp = getComponent(name);
      if (comp) {
        componentsToAdd.push(comp);
      }
    }

    // Step 4: Confirm if there are dependencies (and not --yes)
    if (componentsToAdd.length > 1 && !args.yes) {
      consola.info(
        `${pc.cyan(componentName)} has dependencies. The following will be added:`
      );
      for (const comp of componentsToAdd) {
        consola.info(`  - ${pc.cyan(comp.name)}`);
      }

      const confirm = await consola.prompt('Continue?', {
        type: 'confirm',
        initial: true,
      });

      if (!confirm) {
        consola.info('Cancelled.');
        return;
      }
    }

    // Step 5: Copy component files
    const allResults: CopyResult[] = [];
    const addedComponents: string[] = [];

    for (const comp of componentsToAdd) {
      consola.start(`Adding ${pc.cyan(comp.name)}...`);

      const results = await copyComponentFiles(
        comp.name,
        comp.files,
        config,
        cwd,
        { overwrite: args.overwrite, yes: args.yes }
      );

      allResults.push(...results);

      const copied = results.filter((r) => r.copied);
      if (copied.length > 0) {
        addedComponents.push(comp.name);
        consola.success(`Added ${pc.cyan(comp.name)}`);
      } else {
        consola.info(`Skipped ${pc.cyan(comp.name)} (files already exist)`);
      }
    }

    // Step 6: Summary
    const copiedFiles = allResults.filter((r) => r.copied);
    const skippedFiles = allResults.filter((r) => r.skipped);

    console.log(''); // Empty line
    if (copiedFiles.length > 0) {
      consola.success(
        `Added ${addedComponents.length} component(s): ${pc.cyan(addedComponents.join(', '))}`
      );
      consola.info('Files created:');
      for (const result of copiedFiles) {
        consola.info(`  ${pc.dim(result.path)}`);
      }
    }

    if (skippedFiles.length > 0) {
      consola.info(
        `Skipped ${skippedFiles.length} file(s) (already exist). Use ${pc.cyan('--overwrite')} to replace.`
      );
    }

    // Step 7: Next steps
    if (addedComponents.length > 0) {
      console.log('');
      consola.info('Next steps:');
      consola.info(
        `  Import and use: ${pc.cyan(`import './components/ui/${componentName}'`)}`
      );
    }
  },
});
