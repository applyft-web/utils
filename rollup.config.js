const packageJson = require('./package.json')
const typescript = require('@rollup/plugin-typescript')
const terser = require('@rollup/plugin-terser')
const dts = require('rollup-plugin-dts')
const shebang = require('rollup-plugin-preserve-shebang')
const { builtinModules } = require('module')

const deps = Object.keys(packageJson.dependencies || {})

function isExternal(id) {
  return (
    builtinModules.includes(id) ||
    deps.includes(id) ||
    /^react($|\/)/.test(id)
  )
}

module.exports = [
  // — library
  {
    input: 'src/index.ts',
    output: [
      {
        file: packageJson.module,
        format: 'cjs',
        interop: 'compat'
      },
      {
        file: packageJson.main,
        format: 'esm',
        interop: 'compat'
      }
    ],
    external: isExternal,
    plugins: [
      typescript({
        tsconfig: './tsconfig.json'
      }),
      terser()
    ]
  },

  // — types
  {
    input: 'dist/esm/types/index.d.ts',
    output: [{ file: packageJson.types, format: 'esm' }],
    plugins: [dts.default()]
  },

  // — CLI
  {
    input: 'src/cli/index.ts',
    external: id =>
      isExternal(id) ||
      ['ts-node/esm', 'yargs', 'fs', 'path'].includes(id),
    plugins: [
      shebang(),
      typescript({
        tsconfig: './tsconfig.json',
        module: 'ESNext'
      })
    ],
    output: [
      {
        file: 'dist/cli.cjs.js',
        format: 'cjs',
        interop: 'auto',
        banner: '#!/usr/bin/env node'
      },
      {
        file: 'dist/cli.mjs',
        format: 'esm',
        banner: '#!/usr/bin/env node'
      }
    ]
  }
]
