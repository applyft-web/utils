import 'ts-node/esm'
import { generateScreens } from './generate-screens'
import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'

const argv = yargs(hideBin(process.argv))
  .option('config', { alias: 'c', demandOption: true, describe: 'Путь к pagesConfig.tsx' })
  .option('out', { alias: 'o', demandOption: true, describe: 'Куда записать screens.json' })
  .argv as { config: string, out: string }

generateScreens(argv.config, argv.out)
