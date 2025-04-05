declare module "eslint-plugin-node" {
  const plugin: {
    rules: Record<string, any>;
    configs: Record<string, any>;
    [key: string]: any;
  };

  export default plugin;
}
