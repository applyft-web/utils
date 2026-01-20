require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    jsx: 'react',
    module: 'commonjs',
    esModuleInterop: true
  },
  extensions: ['.ts', '.tsx']
})

import { hideBin } from 'yargs/helpers'
import yargs from 'yargs'
import { generateScreens } from './generate-screens'

const argv = yargs(hideBin(process.argv))
  .option('config', { alias: 'c', demandOption: true, describe: 'path to config module or object exporting pagesConfig' })
  .option('out', { alias: 'o', demandOption: true, describe: 'output directory (default screens.json) or .json file path' })
  .strict()
  .help()
  .parseSync() as { config: string, out: string }

generateScreens(argv.config, argv.out)
