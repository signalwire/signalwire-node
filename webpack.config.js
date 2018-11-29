const webpack = require('webpack')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = (env, argv) => {
  const outputDir = __dirname + '/dist/es5'
  const mode = JSON.stringify(argv.mode)
  const config = {
    mode: 'development',
    entry: './src/index.ts',
    output: {
      path: outputDir,
      filename: 'bundle.js',
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
    optimization: {
      minimizer: [
        new UglifyJsPlugin({
          uglifyOptions: { keep_fnames: true }
        })
      ]
    },
    devServer: {
      contentBase: outputDir,
      compress: true,
      port: 9000,
      https: true
    },
    plugins: [
      new webpack.DefinePlugin({ ENV: mode })
    ]
  }

  return config
}
