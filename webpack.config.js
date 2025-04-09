const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Add a rule to handle TypeScript files
  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    loader: 'babel-loader',
    options: {
      presets: ['babel-preset-expo'],
    },
  });

  // Resolve the app directory
  config.resolve.alias = {
    ...config.resolve.alias,
    app: path.resolve(__dirname, './app'),
  };

  return config;
}; 