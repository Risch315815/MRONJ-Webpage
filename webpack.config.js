const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  const appDirectory = path.resolve(__dirname, './app');
  
  // Set the EXPO_ROUTER_APP_ROOT environment variable
  process.env.EXPO_ROUTER_APP_ROOT = appDirectory;

  const config = await createExpoWebpackConfigAsync({
    ...env,
    babel: {
      dangerouslyAddModulePathsToTranspile: ['expo-router'],
    }
  }, argv);

  // Customize the config before returning it.
  config.resolve = {
    ...config.resolve,
    modules: [
      path.resolve(__dirname, './'),
      path.resolve(__dirname, 'node_modules'),
      appDirectory,
    ],
    alias: {
      ...config.resolve.alias,
      'app': appDirectory,
      '@react-navigation/native': path.resolve(__dirname, 'node_modules/@react-navigation/native'),
      '@react-navigation/native/src': path.resolve(__dirname, 'node_modules/@react-navigation/native/src'),
    },
    fallback: {
      ...config.resolve.fallback,
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "path": require.resolve("path-browserify"),
      "fs": false
    }
  };

  // Add a rule to handle TypeScript files
  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    loader: 'babel-loader',
    options: {
      presets: [
        ['babel-preset-expo', {
          jsxImportSource: 'react',
        }]
      ],
    },
  });

  return config;
}; 