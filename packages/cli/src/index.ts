import { defineCommand, runMain } from 'citty';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { version } = require('../package.json') as { version: string };

const main = defineCommand({
  meta: {
    name: 'lit-ui',
    version,
    description: 'Add lit-ui components to your project',
  },
  subCommands: {},
});

runMain(main);
