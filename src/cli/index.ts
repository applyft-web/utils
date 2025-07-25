require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    jsx: 'react',
    module: 'commonjs',
    esModuleInterop: true
  },
  extensions: ['.ts', '.tsx']
})

import { generateScreens } from './generate-screens'
import yargs from 'yargs'

const argv = yargs
  .option('config', { alias: 'c', demandOption: true, describe: 'Путь к pagesConfig.tsx' })
  .option('out', { alias: 'o', demandOption: true, describe: 'Куда записать screens.json' })
  .argv as { config: string, out: string }

generateScreens(argv.config, argv.out)
