declare module 'eslint-plugin-perfectionist' {
  import { ESLint, Linter } from 'eslint';

  interface PerfectionistPlugin extends ESLint.Plugin {
    configs: {
      [key: string]: Linter.FlatConfig;
      'recommended-natural': Linter.FlatConfig;
    };
  }

  const plugin: PerfectionistPlugin;
  export default plugin;
}
