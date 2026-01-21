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
import { generateScreens } from './generate-screens-esm'

const argv = yargs(hideBin(process.argv))
  .scriptName('generate-screens-vite')
  .usage('$0 -c <config> -o <out>')
  .option('config', {
    alias: 'c',
    demandOption: true,
    describe: 'path to config module or object exporting pagesConfig'
  })
  .option('out', {
    alias: 'o',
    demandOption: true,
    describe: 'output directory (default screens.json) or .json file path'
  })
  .strict()
  .help()
  .parse() as { config: string, out: string }

generateScreens(argv.config, argv.out)
