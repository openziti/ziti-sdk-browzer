const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',

  entry: './src/index.js',

  output: {
    filename: 'main.bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },

  module: {
    rules: [
      {
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false, // Allow importing without full extensions
        },
        exclude: /node_modules\/(?!@openziti)/, // transpile @openziti deps too
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
        type: 'javascript/auto', // Required to parse modern syntax in .mjs
      },
      {
        test: /\.css$/,
        include: path.resolve(__dirname, 'src'),
        use: ['style-loader', 'css-loader'],
      },
    ],
  },

  resolve: {
    extensions: ['.js', '.mjs'],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),

    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(
            __dirname,
            'node_modules/@openziti/libcrypto-js/dist/esm'
          ),
          to: path.resolve(__dirname, 'dist'),
          globOptions: {
            ignore: ['!libcrypto.*.*.wasm'], // only .wasm files
          },
        },
      ],
    }),
  ],

  devServer: {
    static: './dist',
    port: 3000,
  },
};

// const env = process.env.NODE_ENV;

// module.exports = {
//   entry: './src/index.js',
//   mode: env,
//   output: {
//     path: path.resolve(__dirname, 'dist'),
//     filename: '[name].bundle.js',
//     publicPath: '/',
//   },
//   devServer: {
//     contentBase: path.join(__dirname, 'public'),
//     compress: true,
//     port: 3500,
//     hot: true,
//   },
//   module: {
//     rules: [
//       {
//         test: /\.(js|mjs|jsx)$/,
//         include: [
//           path.resolve(__dirname, 'src'),
//           path.resolve(__dirname, 'node_modules/@openziti')
//         ],
//         type: "javascript/auto", // Important for parsing .mjs
//         use: 'babel-loader',
//       },
//       {
//         test: /\.css$/,
//         use: [
//           env === 'development' ? 'style-loader' : MiniCssExtractPlugin.loader,
//           'css-loader',
//         ],
//       },
//     ],
//   },
//   plugins: [
//     new HtmlWebpackPlugin({template: './src/index.html'}),
//     new webpack.HotModuleReplacementPlugin(),
//     new MiniCssExtractPlugin({
//       // Options similar to the same options in webpackOptions.output
//       // both options are optional
//       filename: '[name].css',
//       chunkFilename: '[id].css',
//     }),
//   ],
// };
