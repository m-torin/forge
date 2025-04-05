declare module "eslint-plugin-node" {
  const plugin: {
    rules: Record<string, any>;
    configs: {
      recommended: any;
      "recommended-module": any;
      "recommended-script": any;
    };
  };
  export default plugin;
}
