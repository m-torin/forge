import { UserConfig } from "vitest/config";
import { createReactConfig } from "./react.ts";
import path from "path";

/**
 * Creates a Vitest configuration for Mantine packages in the monorepo
 * @param customConfig - Custom configuration options
 * @param packageDir - The package directory (defaults to current working directory)
 * @returns Extended configuration with Mantine support
 */
export function createMantineConfig(
  customConfig: Partial<UserConfig> = {},
  packageDir: string = process.cwd(),
): UserConfig {
  return createReactConfig(
    {
      test: {
        setupFiles: [
          ...(customConfig.test?.setupFiles || []),
          path.resolve(__dirname, "../setup/mantine.ts"),
        ],
        ...(customConfig.test || {}),
      },
      ...customConfig,
    },
    packageDir,
  );
}
