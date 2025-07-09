/* webpack.config.js */

const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const ASSET_PATH   = process.env.ASSET_PATH || '/';
const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  mode: isProduction ? 'production' : 'development',

  entry: {
    contentScript: path.join(__dirname, 'src', 'containers', 'Content', 'index.jsx'),
    background   : path.join(__dirname, 'src', 'pages', 'Background', 'index.js'),
    popup        : path.join(__dirname, 'src', 'pages', 'Popup', 'index.jsx')
  },

  output: {
    filename  : '[name].bundle.js',
    path      : path.resolve(__dirname, 'build'),
    publicPath: ASSET_PATH
  },

  module: {
    rules: [
      /* JS / JSX ----------------------------------------------------------- */
      {
        test   : /\.(js|jsx)$/,
        exclude: /node_modules/,
        use    : {
          loader : 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },

      /* CSS / SCSS --------------------------------------------------------- */
      {
        test: /\.(css|scss)$/,
        use : [
          MiniCssExtractPlugin.loader,        // ⬅️  extract to a file
          {
            loader : 'css-loader',
            options: { modules: false }
          },
          'sass-loader'
        ]
      },

      /* ASSETS ------------------------------------------------------------- */
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource'
      }
    ]
  },

  plugins: [
    /* clean build/ each time --------------------------------------------- */
    new CleanWebpackPlugin(),

    /* env flag ----------------------------------------------------------- */
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
    }),

    /* copy manifest, icons, inject.css ----------------------------------- */
    new CopyWebpackPlugin({
      patterns: [
        {
          from : 'src/manifest.json',
          to   : '.',
          transform(content) {
            const pkg      = require('./package.json');
            const manifest = JSON.parse(content.toString());

            /* ensure content script CSS is included */
            manifest.content_scripts?.forEach(cs => {
              cs.css = ['contentScript.styles.css'];
            });


            return JSON.stringify({
              ...manifest,
              description: pkg.description,
              version    : pkg.version
            });
          }
        },
        { from: 'public/assets',              to: 'assets' },
        { from: 'src/styles/inject.css',   to: '.'     }   // optional: high-level layout css
      ]
    }),

    /* extract all stylesheets -------------------------------------------- */
    new MiniCssExtractPlugin({
      filename: '[name].styles.css'        
    }),

    /* popup html --------------------------------------------------------- */
    new HtmlWebpackPlugin({
      template: './src/pages/Popup/index.html',
      filename: 'popup.html',
      chunks  : ['popup']
    })
  ],

  resolve: {
    extensions: ['.js', '.jsx', '.scss'],
    alias     : {
      '@containers': path.resolve(__dirname, 'src/containers'),
      '@assets'    : path.resolve(__dirname, 'public/assets'),
      '@styles'    : path.resolve(__dirname, 'src/styles')
    }
  },

  devtool: isProduction ? false : 'cheap-module-source-map',
  stats  : { errorDetails: true }
};
