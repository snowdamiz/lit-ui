import { defineCommand, runMain } from 'citty';
import { createRequire } from 'node:module';
import { init } from './commands/init';
import { add } from './commands/add';
import { list } from './commands/list';
import { migrate } from './commands/migrate';
import { theme } from './commands/theme';

const require = createRequire(import.meta.url);
const { version } = require('../package.json') as { version: string };

const main = defineCommand({
  meta: {
    name: 'lit-ui',
    version,
    description: 'Add lit-ui components to your project',
  },
  subCommands: {
    init,
    add,
    list,
    migrate,
    theme,
  },
});

runMain(main);
