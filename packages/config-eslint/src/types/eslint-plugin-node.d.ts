declare module "eslint-plugin-node" {
  const plugin: {
    configs: Record<string, any>;
    rules: Record<string, any>;
  };

  export default plugin;
}
