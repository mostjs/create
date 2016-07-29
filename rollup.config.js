import buble from 'rollup-plugin-buble'

export default {
  entry: 'src/index.js',
  plugins: [buble()],
  format: 'umd',
  moduleName: 'mostCreate',
  dest: 'dist/create.js',
  globals: {
    '@most/multicast': 'mostMulticast',
    'most': 'most'
  }
}
