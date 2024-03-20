const packageJson = require('./package.json')
const typescript = require('@rollup/plugin-typescript')
const terser = require('@rollup/plugin-terser')
const dts = require('rollup-plugin-dts')

module.exports = [
  {
    input: 'src/index.ts',
    output: [
      {
        file: packageJson.module,
        format: 'cjs',
        interop: 'compat',
      },
      {
        file: packageJson.main,
        format: 'esm',
        interop: 'compat',
      }
    ],
    external: ['react'],
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
      }),
      terser(),
    ]
  },
  {
    input: 'dist/esm/types/index.d.ts',
    output: [{ file: packageJson.types, format: 'esm' }],
    plugins: [dts.default()]
  }
]
