// Define PluginAPI locally instead of importing from tailwindcss/types/config
interface PluginAPI {
  addVariant: (name: string, definition: string) => void;
  // Add other methods as needed
}

type PluginArgs = Record<string, unknown>;

type PluginOptions = Record<string, unknown>;

function plugin(args: PluginArgs, opts: PluginOptions) {
  console.log({ args, opts });
  const f = ({ addVariant }: PluginAPI) => {
    addVariant(
      "dark",
      "&:where([data-mantine-color-scheme='dark'], [data-mantine-color-scheme='dark'] *)",
    );
  };
  return f;
}

plugin.__isOptionsFunction = true;

export default plugin;
