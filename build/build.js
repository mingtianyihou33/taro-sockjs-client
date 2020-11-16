const json = require('rollup-plugin-json')
const resolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
const babel = require('rollup-plugin-babel')

const rollup = require('rollup')
const inputOptions = {
  input: 'src/index.js',
  plugins: [
    json(),
    resolve(),
    commonjs(),
    babel({
      exclude: 'node_modules/**', // only transpile our source code
    }),
  ],
}
const outputOptions = [
  {
    file: 'dist/taro-sockjs-client.esm.js',
    format: 'es',
  },
  {
    file: 'dist/taro-sockjs-client.common.js',
    format: 'cjs',
  },
  {
    file: 'dist/taro-sockjs-client.js',
    format: 'umd',
    name: 'emojiParser',
  },
]

async function build() {
  const bundle = await rollup.rollup(inputOptions)
  outputOptions.forEach(async (option) => {
    await bundle.write(option)
  })
}

build()
