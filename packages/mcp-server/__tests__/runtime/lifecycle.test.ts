import { describe, expect, test } from 'vitest';
import {
  areHandlersRegistered,
  CLEANUP_PRIORITIES,
  getRegisteredHandlers,
  registerCleanupHandler,
  removeCleanupHandler,
} from '../../src/runtime/lifecycle';

describe('process lifecycle manager', () => {
  test('registers, lists and removes cleanup handlers', async () => {
    const name = `t-${Math.random().toString(36).slice(2)}`;
    registerCleanupHandler(name, async () => void 0, CLEANUP_PRIORITIES.DEFAULT);
    expect(areHandlersRegistered()).toBeTruthy();
    expect(getRegisteredHandlers()).toContain(name);
    expect(removeCleanupHandler(name)).toBeTruthy();
  });

  test('deduplicates handlers by name', async () => {
    const name = `dedupe-${Math.random().toString(36).slice(2)}`;
    registerCleanupHandler(name, () => void 0);
    registerCleanupHandler(name, () => void 0); // should replace existing
    const occurrences = getRegisteredHandlers().filter(n => n === name).length;
    expect(occurrences).toBe(1);
  });
});
