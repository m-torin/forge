declare module 'eslint-plugin-playwright' {
  import { ESLint, Linter } from 'eslint';

  const plugin: ESLint.Plugin & {
    rules: Record<string, any>;
    configs: {
      'flat/recommended': Linter.FlatConfig[];
      'flat/playwright-test': Linter.FlatConfig[];
    };
  };

  export default plugin;
}
