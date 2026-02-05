import { defineCommand } from 'citty';
import { resolve } from 'pathe';
import { consola } from 'consola';
import pc from 'picocolors';
import { getOrCreateConfig } from '../utils/config';
import {
  getComponent,
  resolveDependencies,
  type RegistryComponent,
} from '../utils/registry';
import { copyComponentFiles, type CopyResult } from '../utils/copy-component';
import { installComponent, isNpmComponent } from '../utils/install-component';
import { injectComponentSkills } from '../utils/inject-skills';

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
    npm: {
      type: 'boolean',
      description: 'Install from npm (override config mode)',
      default: false,
    },
    copy: {
      type: 'boolean',
      description: 'Copy source files (override config mode)',
      default: false,
    },
    skipSkills: {
      type: 'boolean',
      description: 'Skip injecting AI agent skills',
      default: false,
    },
  },
  async run({ args }) {
    const cwd = resolve(args.cwd);
    const componentName = args.component;

    // Step 1: Get or create config (auto-creates with defaults if missing)
    const config = await getOrCreateConfig(cwd);

    // Step 2: Determine effective mode (flags override config)
    const mode = args.npm ? 'npm' : args.copy ? 'copy-source' : config.mode;

    // Step 3: Handle npm mode
    if (mode === 'npm') {
      if (!isNpmComponent(componentName)) {
        consola.error(`Component ${pc.cyan(componentName)} not available as npm package.`);
        consola.info('Available npm components: button, dialog');
        process.exit(1);
      }

      const installSuccess = await installComponent(componentName, cwd);
      if (!installSuccess) {
        process.exit(1);
      }
      // Inject component-specific AI skill
      if (!args.skipSkills) {
        await injectComponentSkills(cwd, componentName, { yes: args.yes });
      }
      return; // Exit early, skip copy logic
    }

    // Step 4: copy-source mode - Look up component in registry
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

    // Step 5: Resolve dependencies
    const allComponentNames = resolveDependencies(componentName);
    const componentsToAdd: RegistryComponent[] = [];

    for (const name of allComponentNames) {
      const comp = getComponent(name);
      if (comp) {
        componentsToAdd.push(comp);
      }
    }

    // Step 6: Confirm if there are dependencies (and not --yes)
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

    // Step 7: Copy component files
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

    // Step 8: Summary
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

    // Step 9: Inject AI skills for added components
    if (addedComponents.length > 0 && !args.skipSkills) {
      for (const comp of addedComponents) {
        await injectComponentSkills(cwd, comp, { yes: args.yes });
      }
    }

    // Step 10: Next steps
    if (addedComponents.length > 0) {
      console.log('');
      consola.info('Next steps:');
      consola.info(
        `  Import and use: ${pc.cyan(`import './components/ui/${componentName}'`)}`
      );
    }
  },
});
