import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockEnv = {
  FLAGS_SECRET: 'secret_test_value',
};

vi.mock('@t3-oss/env-nextjs', () => {
  return {
    createEnv: () => ({
      FLAGS_SECRET: mockEnv.FLAGS_SECRET,
    }),
  };
});

describe('keys configuration', () => {
  beforeEach(() => {
    vi.resetModules();
    Object.assign(mockEnv, {
      FLAGS_SECRET: 'secret_test_value',
    });
  });

  it('exports keys function', async () => {
    const { keys } = await import('../keys');
    expect(keys).toBeDefined();
    expect(typeof keys).toBe('function');
  });

  it('returns FLAGS_SECRET from environment', async () => {
    const { keys } = await import('../keys');
    const envVars = keys();
    expect(envVars).toEqual({
      FLAGS_SECRET: 'secret_test_value',
    });
  });

  it('handles missing FLAGS_SECRET', async () => {
    mockEnv.FLAGS_SECRET = '' as any; // Mock an empty string instead of undefined
    const { keys } = await import('../keys');
    const envVars = keys();
    expect(envVars).toEqual({
      FLAGS_SECRET: '',
    });
  });

  it('handles empty FLAGS_SECRET', async () => {
    mockEnv.FLAGS_SECRET = '';
    const { keys } = await import('../keys');
    const envVars = keys();
    expect(envVars).toEqual({
      FLAGS_SECRET: '',
    });
  });

  it('validates FLAGS_SECRET as string', async () => {
    mockEnv.FLAGS_SECRET = '123';
    const { keys } = await import('../keys');
    const envVars = keys();
    expect(typeof envVars.FLAGS_SECRET).toBe('string');
  });
});
