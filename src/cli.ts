#!/usr/bin/env node

import { generateScreens } from './flows';
import yargs from 'yargs';

const argv = yargs
  .option('config', { alias: 'c', demandOption: true, describe: 'Путь к pagesConfig.tsx' })
  .option('out',    { alias: 'o', demandOption: true, describe: 'Куда записать screens.json' })
  .argv as { config: string; out: string };

generateScreens(argv.config, argv.out);
