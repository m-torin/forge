declare module "eslint-plugin-sonarjs" {
  import { ESLint, Linter } from "eslint";

  const plugin: ESLint.Plugin & {
    rules: Record<string, any>;
    configs: {
      recommended: Linter.FlatConfig[];
    };
  };

  export default plugin;
}
