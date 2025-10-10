/**
 * Client-safe utilities (browser-compatible)
 *
 * These utilities are safe to use in browser environments
 * and do not depend on Node.js APIs.
 */

/**
 * Simple in-memory cache for browser usage
 */
export class BrowserCache<T = any> {
  private cache = new Map<string, { value: T; expiry: number }>();
  private maxSize: number;

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  set(key: string, value: T, ttlMs = 300000): void {
    // 5min default
    // Remove oldest if at capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      value,
      expiry: Date.now() + ttlMs,
    });
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

/**
 * Browser-safe request utilities
 */
export const requestUtils = {
  /**
   * Create request headers with optional auth
   */
  createHeaders: (options?: {
    apiKey?: string;
    contentType?: string;
    customHeaders?: Record<string, string>;
  }) => {
    const headers: Record<string, string> = {
      'Content-Type': options?.contentType || 'application/json',
      ...(options?.customHeaders || {}),
    };

    if (options?.apiKey) {
      headers.Authorization = `Bearer ${options.apiKey}`;
    }

    return headers;
  },

  /**
   * Handle fetch responses with error checking
   */
  handleResponse: async (response: Response) => {
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Request failed: ${response.status} ${response.statusText} - ${text}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }

    return response.text();
  },
};

/**
 * Browser-safe validation utilities
 */
export const validationUtils = {
  /**
   * Check if string is valid URL
   */
  isValidUrl: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Sanitize HTML string (basic)
   */
  sanitizeHtml: (html: string): string => {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  },

  /**
   * Check if object is empty
   */
  isEmpty: (obj: any): boolean => {
    if (obj == null) return true;
    if (Array.isArray(obj)) return obj.length === 0;
    if (typeof obj === 'object') return Object.keys(obj).length === 0;
    return !obj;
  },
};

/**
 * Browser-safe streaming utilities
 */
export const streamUtils = {
  /**
   * Create a readable stream from string chunks
   */
  createTextStream: (text: string, chunkSize = 50) => {
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }

    return new ReadableStream({
      start(controller) {
        chunks.forEach((chunk, index) => {
          setTimeout(() => {
            controller.enqueue(chunk);
            if (index === chunks.length - 1) {
              controller.close();
            }
          }, index * 100);
        });
      },
    });
  },

  /**
   * Read stream to completion
   */
  readStreamToString: async (stream: ReadableStream<Uint8Array>): Promise<string> => {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let result = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value, { stream: true });
      }
    } finally {
      reader.releaseLock();
    }

    return result;
  },
};
