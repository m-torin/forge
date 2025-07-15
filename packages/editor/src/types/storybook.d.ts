/**
 * Type declarations for Storybook modules
 * These are dev dependencies that may not be available in production
 */

declare module '@storybook/react' {
  export interface Meta<T = any> {
    title?: string;
    component?: T;
    parameters?: any;
    args?: any;
    argTypes?: any;
    decorators?: any[];
  }

  export interface StoryObj<_T = any> {
    args?: any;
    parameters?: any;
    play?: any;
    render?: any;
    decorators?: any[];
  }

  export type Story<T = any> = StoryObj<T>;
}

declare module '@storybook/addon-actions' {
  export function action(name: string): (...args: any[]) => any;
}

declare module '@storybook/test' {
  export function within(element: any): any;
  export const userEvent: any;
  export function expect(value: any): any;
}
