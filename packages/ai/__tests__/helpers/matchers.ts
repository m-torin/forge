export function toBeOptionalNumber(received: unknown) {
  const pass = received === undefined || typeof received === 'number';
  return {
    pass,
    message: () => `expected ${received} to be undefined or number`,
  };
}

export function toEqualSubset(received: unknown, subset: Record<string, unknown>) {
  const r = received as any;
  const pass = Object.keys(subset).every(k => Object.is(r?.[k], subset[k]));
  return {
    pass,
    message: () => `expected ${JSON.stringify(received)} to include ${JSON.stringify(subset)}`,
  };
}

declare global {
  namespace Vi {
    interface Assertion {
      toBeOptionalNumber(): void;
      toEqualSubset(subset: Record<string, unknown>): void;
    }
  }
}

export default { toBeOptionalNumber, toEqualSubset };
