import { defineCommand } from 'citty';
import pc from 'picocolors';
import { listComponents } from '../utils/registry';
import { getConfig } from '../utils/config';
import { componentToPackage } from '../utils/install-component';

export const list = defineCommand({
  meta: {
    name: 'list',
    description: 'List available components',
  },
  args: {
    cwd: {
      type: 'string',
      description: 'Working directory',
      default: process.cwd(),
    },
  },
  async run({ args }) {
    const cwd = args.cwd;
    const config = await getConfig(cwd);
    const mode = config?.mode ?? 'copy-source';
    const components = listComponents();

    console.log('');
    console.log(pc.bold('lit-ui components'));
    console.log(pc.dim(`Mode: ${mode}`));
    console.log('');

    // Define component categories
    const categories: Record<string, string[]> = {
      'Form': ['input', 'textarea', 'select'],
      'Feedback': ['dialog'],
      'Actions': ['button'],
    };

    // Group output by category
    for (const [category, componentNames] of Object.entries(categories)) {
      console.log(pc.bold(pc.cyan(category)));

      for (const name of componentNames) {
        const component = components.find(c => c.name === name);
        if (!component) continue;

        if (mode === 'npm') {
          const packageName = componentToPackage[component.name] ?? `@lit-ui/${component.name}`;
          console.log(`  ${pc.white(component.name)} - ${pc.dim(packageName)}`);
        } else {
          console.log(`  ${pc.white(component.name)}`);
        }
        console.log(`    ${pc.dim(component.description)}`);
      }
      console.log(''); // Empty line between categories
    }

    console.log(pc.dim(`Run ${pc.reset('lit-ui add <component>')} to install a component.`));
    console.log('');
  },
});
