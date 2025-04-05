declare module "@repo/testing/vitest/mantine" {
  import { ReactElement } from "react";

  export function renderWithMantine(ui: ReactElement, options?: any): any;
  export const screen: any;
  export const fireEvent: any;
  export const within: any;
  export const waitFor: any;
  export const userEvent: any;
}
