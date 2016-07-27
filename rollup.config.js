import babel from 'rollup-plugin-babel'

export default {
  entry: 'src/index.js',
  plugins: [babel()],
  format: 'umd',
  moduleName: 'mostCreate',
  dest: 'dist/create.js',
  globals: {
    '@most/multicast': 'mostMulticast',
    'most': 'most'
  }
}
