import { describe, expect, vi } from 'vitest';

const handlerSymbol = Symbol('better-auth-handler');

const toNextJsHandlerMock = vi.fn(() => ({ GET: vi.fn() }));

vi.mock('better-auth/next-js', () => ({
  toNextJsHandler: toNextJsHandlerMock,
}));

vi.mock('../../src/shared/auth', () => ({
  auth: { handler: handlerSymbol },
}));

describe('createNextAuthRouteHandler', () => {
  test('forwards the Better Auth handler to toNextJsHandler', async () => {
    const { createNextAuthRouteHandler } = await import('../../src/server/next-handlers');

    createNextAuthRouteHandler();

    expect(toNextJsHandlerMock).toHaveBeenCalledWith(handlerSymbol);
  });
});
