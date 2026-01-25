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

    if (mode === 'npm') {
      for (const component of components) {
        const packageName = componentToPackage[component.name] ?? `@lit-ui/${component.name}`;
        console.log(`  ${pc.cyan(component.name)} - ${packageName}`);
        console.log(`    ${pc.dim(component.description)}`);
        console.log('');
      }
    } else {
      for (const component of components) {
        console.log(`  ${pc.cyan(component.name)}`);
        console.log(`    ${pc.dim(component.description)}`);
        console.log('');
      }
    }

    console.log(pc.dim(`Run ${pc.reset('lit-ui add <component>')} to install a component.`));
    console.log('');
  },
});
