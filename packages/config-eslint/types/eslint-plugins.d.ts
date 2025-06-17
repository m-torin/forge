declare module 'eslint-plugin-import' {
  import { Linter } from 'eslint';

  interface ImportPlugin {
    configs: {
      recommended: Linter.FlatConfig;
      typescript: Linter.FlatConfig;
    };
    rules: Record<string, any>;
  }

  const plugin: ImportPlugin;
  export default plugin;
}

declare module 'eslint-plugin-promise' {
  import { Linter } from 'eslint';

  interface PromisePlugin {
    configs: {
      recommended: Linter.FlatConfig;
    };
    rules: Record<string, any>;
  }

  const plugin: PromisePlugin;
  export default plugin;
}

declare module 'eslint-plugin-security' {
  import { Linter } from 'eslint';

  interface SecurityPlugin {
    configs: {
      recommended: Linter.FlatConfig;
    };
    rules: Record<string, any>;
  }

  const plugin: SecurityPlugin;
  export default plugin;
}

declare module 'eslint-plugin-perfectionist' {
  import { Linter } from 'eslint';

  interface PerfectionistPlugin {
    configs: {
      recommended: Linter.FlatConfig;
    };
    rules: Record<string, any>;
  }

  const plugin: PerfectionistPlugin;
  export default plugin;
}

declare module 'eslint-plugin-unused-imports' {
  interface UnusedImportsPlugin {
    rules: Record<string, any>;
  }

  const plugin: UnusedImportsPlugin;
  export default plugin;
}
