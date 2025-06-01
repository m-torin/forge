/* eslint-disable @typescript-eslint/no-require-imports */
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Use a standard expo config for building
const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

// Only add minimal monorepo support
config.watchFolders = [path.resolve(projectRoot, '../..')]; 
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(projectRoot, '../../node_modules'),
];

module.exports = config;