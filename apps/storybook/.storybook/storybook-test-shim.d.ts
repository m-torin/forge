declare module '@storybook/test' {
  export const expect: typeof import('@vitest/expect').expect;
  export const userEvent: typeof import('@testing-library/user-event').default;
  export const waitFor: typeof import('@testing-library/dom').waitFor;
  export const within: typeof import('@testing-library/dom').within;
}
