// eslint.config.ts
import reactConfig from '@repo/eslint-config/react-package';

// Create a new configuration that extends the base config
// and adds our custom ignore pattern
const config = [
  {
    ignores: ['.react-email/.next/**', 'emails/**'],
  },
  ...reactConfig,
];

export default config;
