/**
 * Type declarations for Storybook "next" version internal modules
 * These internal imports are used in Storybook 8+ but may not have complete type definitions
 */

declare module 'storybook/internal/manager-api' {
  export const addons: any;
}

declare module 'storybook/internal/theming' {
  export const themes: {
    light: any;
    dark: any;
    normal: any;
  };
}

declare module 'storybook/viewport' {
  export const INITIAL_VIEWPORTS: Record<string, any>;
}
