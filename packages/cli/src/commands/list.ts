import { defineCommand } from 'citty';
import pc from 'picocolors';
import { listComponents } from '../utils/registry';

export const list = defineCommand({
  meta: {
    name: 'list',
    description: 'List available components',
  },
  async run() {
    const components = listComponents();

    console.log();
    console.log(pc.bold('Available components:'));
    console.log();

    for (const component of components) {
      console.log(`  ${pc.cyan(component.name)}`);
      console.log(`    ${pc.dim(component.description)}`);
      console.log();
    }

    console.log(pc.dim(`Run ${pc.reset('lit-ui add <component>')} to install a component.`));
    console.log();
  },
});
