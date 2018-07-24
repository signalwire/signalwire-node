const webpack = require('webpack')

module.exports = (env, argv) => {
  return {
    mode: 'development',
    entry: './src/index.ts',
    output: {
      path: __dirname + '/dist',
      filename: 'bundle.js',
      // library: 'SignalWire',
      libraryTarget: 'this'
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
    },
    devServer: {
      contentBase: __dirname + '/dist',
      compress: true,
      port: 9000
    },
    plugins: [
      new webpack.DefinePlugin({
        ENV: JSON.stringify(argv.mode)
      })
    ]
  }
}