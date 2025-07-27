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
import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'

const argv = yargs(hideBin(process.argv))
  .option('config', { alias: 'c', demandOption: true, describe: 'path to pagesConfig.tsx' })
  .option('out', { alias: 'o', demandOption: true, describe: 'root of project for screens.json' })
  .argv as { config: string, out: string }

generateScreens(argv.config, argv.out)
