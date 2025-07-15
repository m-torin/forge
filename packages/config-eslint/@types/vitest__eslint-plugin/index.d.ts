declare module '@vitest/eslint-plugin' {
  import { ESLint, Linter } from 'eslint';

  const plugin: ESLint.Plugin & {
    rules: Record<string, any>;
    configs: {
      recommended: {
        plugins: string[];
        rules: Linter.RulesRecord;
      };
      all: {
        plugins: string[];
        rules: Linter.RulesRecord;
      };
    };
  };

  export default plugin;
}
