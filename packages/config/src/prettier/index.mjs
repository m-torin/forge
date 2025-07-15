import { createRequire } from 'module';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

// Resolve plugin paths relative to this config file
const resolvePlugin = (pluginName) => {
  try {
    return require.resolve(pluginName);
  } catch {
    // Fallback to simple name if resolution fails
    return pluginName;
  }
};

/**
 * @type {import("prettier").Config}
 */
const config = {
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'all', // Changed from 'es5' to 'all' for ES2023
  printWidth: 100,
  bracketSpacing: true,
  endOfLine: 'lf',
  plugins: [
    resolvePlugin('prettier-plugin-organize-imports'),
    resolvePlugin('prettier-plugin-tailwindcss'),
    resolvePlugin('prettier-plugin-sh'),
    resolvePlugin('prettier-plugin-packagejson'),
  ],
  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.js', '*.jsx', '*.mjs', '*.cjs'],
      options: {
        arrowParens: 'avoid', // Modern style: use parens only when needed
        bracketSameLine: false,
        jsxSingleQuote: false,
        singleQuote: true,
        trailingComma: 'all',
      },
    },
    {
      files: 'package*.json',
      options: {
        printWidth: 1000, // Keep long dependency lines on single line
        tabWidth: 2,
        trailingComma: 'none', // JSON doesn't support trailing commas
        bracketSpacing: true,
        semi: false, // JSON doesn't use semicolons
        singleQuote: false, // JSON requires double quotes
        // prettier-plugin-packagejson will handle key sorting automatically
      },
    },
    {
      files: ['*.yaml', '*.yml'],
      options: {
        singleQuote: true, // Use single quotes for consistency with JS/TS files
        trailingComma: 'none', // YAML doesn't support trailing commas
        tabWidth: 2,
        printWidth: 80, // Shorter lines for YAML readability
        bracketSpacing: true,
      },
    },
    {
      files: ['*.md', '*.mdx'],
      options: {
        embeddedLanguageFormatting: 'auto', // Format code blocks inside markdown
        proseWrap: 'always', // Wrap prose at printWidth
        printWidth: 80, // Shorter lines for markdown readability
        tabWidth: 2,
        singleQuote: false, // Use double quotes in markdown
        trailingComma: 'none', // Safer for markdown compatibility
      },
    },
    {
      files: ['*.graphql', '*.gql'],
      options: {
        bracketSpacing: false,
      },
    },
    {
      files: ['*.css', '*.scss'],
      options: {
        singleQuote: false,
      },
    },
    {
      files: ['*.sh', '*.bash', '*.zsh', '*.fish', 'Dockerfile', 'Dockerfile.*', '*.dockerfile'],
      options: {
        tabWidth: 2,
        printWidth: 80, // Shorter lines for shell scripts
        // Shell-specific options
        keepComments: true, // Preserve comments in shell scripts
        binaryNextLine: true, // Put binary operators on next line
        switchCaseIndent: true, // Indent switch cases
        spaceRedirects: true, // Add space after redirection operators
        functionNextLine: false, // Keep function braces on same line
      },
    },
    {
      files: ['.env*', '*.env', '.gitignore', '.dockerignore', '*.properties', '.hosts'],
      options: {
        tabWidth: 2,
        printWidth: 120, // Longer lines for config files
        // These are simple text files, minimal formatting
        keepComments: true,
      },
    },
  ],
};

export default config;