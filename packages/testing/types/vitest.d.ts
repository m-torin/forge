declare module "vitest" {
  interface VitestUtils {
    stubEnv<T extends string>(name: T, value: string | undefined): VitestUtils;
    unstubEnv(key: string): void;
  }

  const vi: {
    fn<T = any, Y extends any[] = any[]>(): jest.Mock<T, Y>;
    unstubEnv(key: string): void;
  } & VitestUtils;
}

declare namespace jest {
  interface Mock<T = any, Y extends any[] = any[]> {
    mockResolvedValue(value: T): this;
    mockImplementation(fn: (...args: Y) => T): this;
  }
}

declare module "@repo/testing/vitest/mantine" {
  export const renderWithMantine: any;
  export const screen: any;
  export const fireEvent: any;
}
