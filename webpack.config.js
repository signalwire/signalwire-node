module.exports = {
  entry: './src/index.ts',
  output: {
    path: __dirname + '/dist',
    filename: 'bundle.js',
    library: 'SignalWire'
    // libraryTarget: 'umd'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        'test': /\.tsx?$/,
        'loaders': ['babel-loader', 'ts-loader'],
        'exclude': [/node_modules/]
      }
    ]
  }
}