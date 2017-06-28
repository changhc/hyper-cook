const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.join(__dirname, 'public'),
    filename: 'bundle.js',
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        screw_ie8: true,
        warnings: false,
      },
    }),
  ],
  module: {
    rules: [{
      test: /\.js$/,               // type of file to transform
      loader: 'babel-loader',      // what loaders to use
      exclude: /node_modules/,    // don't transform these files
    }, {
      test: /\.css$/,
      use: [ // if multiple loaders:
        { loader: 'style-loader' },
        {
          loader: 'css-loader',
          options: {
            module: true,
          },
        },
      ],
    },
    {
      test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
      loader: 'url-loader',
    }],
  },
};
