import { describe, expect, it, vi } from 'vitest';
import { showBetaFeature } from '../index';
import { createFlag } from '../lib/create-flag';

// Import the mocked modules
vi.mock('../lib/create-flag', () => ({
  createFlag: vi.fn().mockImplementation((key) => ({
    key,
    defaultValue: false,
    decide: vi.fn().mockResolvedValue(false),
    origin: 'test',
    description: `Test flag for ${key}`,
    options: {},
  })),
}));

describe('Feature Flags', () => {
  it('exports the showBetaFeature flag', () => {
    expect(showBetaFeature).toBeDefined();
    expect(showBetaFeature.key).toBe('showBetaFeature');
  });

  it('creates the showBetaFeature flag with the correct key', () => {
    expect(createFlag).toHaveBeenCalledWith('showBetaFeature');
  });

  it('has the expected flag properties', () => {
    expect(showBetaFeature).toHaveProperty('key', 'showBetaFeature');
    expect(showBetaFeature).toHaveProperty('defaultValue', false);
    expect(showBetaFeature).toHaveProperty('decide');
    expect(showBetaFeature).toHaveProperty('origin', 'test');
    expect(showBetaFeature).toHaveProperty(
      'description',
      'Test flag for showBetaFeature',
    );
    expect(showBetaFeature).toHaveProperty('options', {});
  });
});
