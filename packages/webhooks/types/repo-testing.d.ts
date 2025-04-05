declare module "@repo/testing" {
  export const vitest: {
    mockDate: (date: Date | string | number) => void;
    mockEnvVars: (vars: Record<string, string | undefined>) => void;
    setupConsoleMocks: () => void;
    restoreConsoleMocks: () => void;
    setupAllTestEnvVars: () => void;
    testEnvVars: Record<string, string>;
  };
}
