import { defineCommand } from 'citty';
import { resolve } from 'pathe';
import { applyTheme } from '../utils/apply-theme';
import { highlight } from '../utils/logger';

export const theme = defineCommand({
  meta: {
    name: 'theme',
    description: 'Apply a theme configuration to your project',
  },
  args: {
    config: {
      type: 'positional',
      description: 'Encoded theme configuration from configurator',
      required: true,
    },
    cwd: {
      type: 'string',
      description: 'Working directory',
      default: '.',
    },
    yes: {
      type: 'boolean',
      alias: 'y',
      description: 'Skip confirmation prompts',
      default: false,
    },
  },
  async run({ args }) {
    const cwd = resolve(args.cwd);

    console.log('');
    console.log(highlight('lit-ui theme'));
    console.log('');

    await applyTheme(cwd, args.config, { yes: args.yes });
  },
});
