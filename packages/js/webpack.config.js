const webpack = require('webpack')

module.exports = (env, argv) => {
  const outputDir = __dirname + '/dist'
  const mode = JSON.stringify(argv.mode)
  const config = {
    mode,
    entry: './index.ts',
    output: {
      path: outputDir,
      filename: 'index.min.js',
      libraryTarget: 'this'
    },
    resolve: {
      extensions: ['.ts', '.js']
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: 'babel-loader'
        },
        {
          test: /\.tsx?$/,
          loader: 'ts-loader',
          options: {
            configFile: 'tsconfig.es5.json'
          }
        }
      ]
    },
    devServer: {
      contentBase: [outputDir, __dirname + '/examples/vanilla-calling'],
      compress: true,
      port: 9000,
      https: true
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: mode,
        }
      })
    ]
  }

  return config
}
