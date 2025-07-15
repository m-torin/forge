// Zod validation library mock
import { vi } from 'vitest';

vi.mock('zod', () => ({
  z: {
    string: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    number: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    boolean: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    object: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    array: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    union: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    literal: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    enum: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    nativeEnum: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    null: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    undefined: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    void: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    never: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    any: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    unknown: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    date: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    bigint: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    symbol: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    function: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    lazy: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    promise: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    effect: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    preprocess: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    pipe: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    transform: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    refine: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    superRefine: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    optional: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    nullable: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    nullish: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    tuple: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    set: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    map: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    record: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    intersection: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    discriminatedUnion: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    ZodError: class MockZodError extends Error {
      issues: any[];
      constructor(issues: any[]) {
        super('Mock Zod Error');
        this.name = 'ZodError';
        this.issues = issues;
      }
    },
  },
}));
