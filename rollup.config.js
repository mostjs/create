import buble from 'rollup-plugin-buble'

export default {
  entry: 'src/index.js',
  plugins: [buble()],
  moduleName: 'mostCreate',
  globals: {
    '@most/multicast': 'mostMulticast',
    'most': 'most'
  },
  targets: [
    { dest: 'dist/create.js', format: 'umd' },
    { dest: 'dist/create.es.js', format: 'es' }
  ]
}
