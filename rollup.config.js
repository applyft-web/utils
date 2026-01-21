const packageJson = require('./package.json')
const typescript = require('@rollup/plugin-typescript')
const terser = require('@rollup/plugin-terser')
const nodeResolve = require('@rollup/plugin-node-resolve')
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
        format: 'esm',
        interop: 'compat'
      },
      {
        file: packageJson.main,
        format: 'cjs',
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

  // — CLI (CJS)
  {
    input: 'src/cli/index.ts',
    output: [
      {
        file: 'dist/cli.cjs.js',
        format: 'cjs',
        banner: '#!/usr/bin/env node',
        interop: 'compat'
      },
      {
        file: 'dist/cli.esm.js',
        format: 'esm',
        banner: '#!/usr/bin/env node',
        interop: 'compat'
      }],
    external: id =>
      isExternal(id) ||
      ['ts-node', 'yargs', 'fs', 'path'].includes(id),
    plugins: [
      shebang(),
      nodeResolve({ preferBuiltins: true }),
      typescript({ tsconfig: './tsconfig.json' })
    ]
  }
]
