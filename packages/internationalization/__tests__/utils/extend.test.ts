import { describe, expect, test, vi } from 'vitest';

import { createDictionary } from '#/utils/extend';

describe('utils/extend', () => {
  test('createDictionary combines base and app dictionaries', async () => {
    const mockBaseDictionary = { hello: 'Hello', welcome: 'Welcome' };
    const mockAppDictionary = { app: 'App', settings: 'Settings' };

    const mockGetBaseDictionary = vi.fn().mockResolvedValue(mockBaseDictionary);
    const mockGetAppDictionary = vi.fn().mockResolvedValue(mockAppDictionary);

    const combinedDictionary = createDictionary(mockGetBaseDictionary, mockGetAppDictionary);
    const result = await combinedDictionary('en');

    expect(result).toStrictEqual({
      hello: 'Hello',
      welcome: 'Welcome',
      app: 'App',
      settings: 'Settings',
    });

    expect(mockGetBaseDictionary).toHaveBeenCalledWith('en');
    expect(mockGetAppDictionary).toHaveBeenCalledWith('en');
  });

  test('createDictionary app dictionary overrides base dictionary', async () => {
    const mockBaseDictionary = { hello: 'Hello', welcome: 'Welcome' };
    const mockAppDictionary = { hello: 'Custom Hello', app: 'App' };

    const mockGetBaseDictionary = vi.fn().mockResolvedValue(mockBaseDictionary);
    const mockGetAppDictionary = vi.fn().mockResolvedValue(mockAppDictionary);

    const combinedDictionary = createDictionary(mockGetBaseDictionary, mockGetAppDictionary);
    const result = await combinedDictionary('en');

    expect(result).toStrictEqual({
      hello: 'Custom Hello', // App dictionary overrides base
      welcome: 'Welcome',
      app: 'App',
    });
  });

  test('createDictionary handles different locales', async () => {
    const mockGetBaseDictionary = vi
      .fn()
      .mockResolvedValueOnce({ hello: 'Hello' })
      .mockResolvedValueOnce({ hello: 'Hola' });

    const mockGetAppDictionary = vi
      .fn()
      .mockResolvedValueOnce({ app: 'App' })
      .mockResolvedValueOnce({ app: 'Aplicación' });

    const combinedDictionary = createDictionary(mockGetBaseDictionary, mockGetAppDictionary);

    const enResult = await combinedDictionary('en');
    const esResult = await combinedDictionary('es');

    expect(enResult).toStrictEqual({ hello: 'Hello', app: 'App' });
    expect(esResult).toStrictEqual({ hello: 'Hola', app: 'Aplicación' });

    expect(mockGetBaseDictionary).toHaveBeenCalledWith('en');
    expect(mockGetBaseDictionary).toHaveBeenCalledWith('es');
    expect(mockGetAppDictionary).toHaveBeenCalledWith('en');
    expect(mockGetAppDictionary).toHaveBeenCalledWith('es');
  });

  test('createDictionary handles async errors gracefully', async () => {
    const mockGetBaseDictionary = vi.fn().mockRejectedValue(new Error('Base dictionary error'));
    const mockGetAppDictionary = vi.fn().mockResolvedValue({ app: 'App' });

    const combinedDictionary = createDictionary(mockGetBaseDictionary, mockGetAppDictionary);

    await expect(combinedDictionary('en')).rejects.toThrow('Base dictionary error');

    expect(mockGetBaseDictionary).toHaveBeenCalledWith('en');
    expect(mockGetAppDictionary).toHaveBeenCalledWith('en');
  });
});
