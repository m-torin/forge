declare module "eslint-plugin-import" {
  import { Linter, Rule } from "eslint";

  interface ImportPlugin {
    configs: {
      recommended: Linter.FlatConfig;
      typescript: Linter.FlatConfig;
    };
    rules: Record<string, Rule.RuleModule>;
  }

  const plugin: ImportPlugin;
  export default plugin;
}

declare module "eslint-plugin-promise" {
  import { Linter, Rule } from "eslint";

  interface PromisePlugin {
    configs: {
      recommended: Linter.FlatConfig;
    };
    rules: Record<string, Rule.RuleModule>;
  }

  const plugin: PromisePlugin;
  export default plugin;
}

declare module "eslint-plugin-security" {
  import { Linter, Rule } from "eslint";

  interface SecurityPlugin {
    configs: {
      recommended: Linter.FlatConfig;
    };
    rules: Record<string, Rule.RuleModule>;
  }

  const plugin: SecurityPlugin;
  export default plugin;
}

declare module "eslint-plugin-perfectionist" {
  import { Linter, Rule } from "eslint";

  interface PerfectionistPlugin {
    configs: {
      recommended: Linter.FlatConfig;
    };
    rules: Record<string, Rule.RuleModule>;
  }

  const plugin: PerfectionistPlugin;
  export default plugin;
}

declare module "eslint-plugin-unused-imports" {
  import { Rule } from "eslint";

  interface UnusedImportsPlugin {
    rules: Record<string, Rule.RuleModule>;
  }

  const plugin: UnusedImportsPlugin;
  export default plugin;
}

declare module "eslint-plugin-jsx-a11y" {
  import { Rule } from "eslint";

  interface JsxA11yPlugin {
    rules: Record<string, Rule.RuleModule>;
  }

  const plugin: JsxA11yPlugin;
  export default plugin;
}
