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
  .scriptName('generate-screens-vite')
  .usage('$0 -c <config> -o <out>')
  .option('config', {
    alias: 'c',
    demandOption: true,
    describe: 'путь к конфигу страниц (.ts/.js/.mjs) или JSON в Vite‑проекте; алиасы из tsconfig будут применены автоматически (если доступен tsconfig-paths)'
  })
  .option('out', {
    alias: 'o',
    demandOption: true,
    describe: 'папка назначения (по умолчанию screens.json) или путь к .json файлу'
  })
  .strict()
  .help()
  .parse() as { config: string, out: string }

Promise.resolve(generateScreens(argv.config, argv.out))
  .catch((e) => {
    console.error('❌ Generation failed:', e)
    process.exit(1)
  })
