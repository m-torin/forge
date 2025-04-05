import type { Config } from "pixeleye";

const config: Config = {
  token: process.env.PIXELEYE_PROJECT_TOKEN || "",
  storybookOptions: {
    variants: [
      {
        name: "Dark",
        params: "globals=theme:dark",
      },
      {
        name: "Light",
        params: "globals=theme:light",
      },
    ],
  },
};

export default config;
