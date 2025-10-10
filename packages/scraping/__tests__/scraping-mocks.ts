/**
 * Mock implementations for scraping tests
 */

import { vi } from 'vitest';

export const createMockBrowser = () => ({
  newContext: vi.fn().mockResolvedValue({
    newPage: vi.fn().mockResolvedValue({
      goto: vi.fn().mockResolvedValue({ status: () => 200 }),
      content: vi.fn().mockResolvedValue('<html><body>Mock content</body></html>'),
      title: vi.fn().mockResolvedValue('Mock Title'),
      close: vi.fn().mockResolvedValue(undefined),
      waitForSelector: vi.fn().mockResolvedValue({}),
      $: vi.fn().mockResolvedValue(null),
      $$: vi.fn().mockResolvedValue([]),
      screenshot: vi.fn().mockResolvedValue(Buffer.from('mock screenshot')),
      setViewportSize: vi.fn().mockResolvedValue(undefined),
    }),
    close: vi.fn().mockResolvedValue(undefined),
  }),
  close: vi.fn().mockResolvedValue(undefined),
});

const createMockCheerio = () => ({
  load: vi.fn().mockImplementation((html: string) => {
    const mockCheerio = (selector: string) => ({
      text: vi.fn().mockReturnValue('Mock text'),
      html: vi.fn().mockReturnValue('<span>Mock HTML</span>'),
      attr: vi.fn().mockReturnValue('mock-attribute'),
      length: 1,
      get: vi.fn().mockReturnValue([{ tagName: 'div', textContent: 'Mock element' }]),
      map: vi.fn().mockImplementation((fn: any) => [fn(0, { textContent: 'Mock item' })]),
    });
    return mockCheerio;
  }),
});

const createMockFetch = () => ({
  fetch: vi.fn().mockImplementation((url: string | URL | Request) => {
    const urlString = typeof url === 'string' ? url : url.toString();
    if (urlString.includes('error')) {
      return Promise.reject(new Error('Network error'));
    }
    if (urlString.includes('404')) {
      return Promise.resolve({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: () => Promise.resolve(''),
        headers: new Headers(),
        redirected: false,
        type: 'basic' as ResponseType,
        url: urlString,
        json: () => Promise.resolve({}),
        blob: () => Promise.resolve(new Blob()),
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
        formData: () => Promise.resolve(new FormData()),
        bytes: () => Promise.resolve(new Uint8Array()),
        clone: () => new Response(),
        body: null,
        bodyUsed: false,
      } as Response);
    }
    return Promise.resolve({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: () => Promise.resolve('<html><body>Mock content</body></html>'),
      headers: new Headers({ 'content-type': 'text/html' }),
      redirected: false,
      type: 'basic' as ResponseType,
      url: urlString,
      json: () => Promise.resolve({}),
      blob: () => Promise.resolve(new Blob()),
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      formData: () => Promise.resolve(new FormData()),
      bytes: () => Promise.resolve(new Uint8Array()),
      clone: () => new Response(),
      body: null,
      bodyUsed: false,
    } as Response);
  }),
});
