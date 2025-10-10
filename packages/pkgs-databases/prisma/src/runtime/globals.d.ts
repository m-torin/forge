/**
 * Global type declarations for multi-runtime support
 * These declarations make runtime detection code type-safe across environments
 */

declare global {
  // Vercel Edge Runtime globals
  var EdgeRuntime: string | undefined;

  // Cloudflare Workers globals
  var DB: any | undefined;

  // Deno globals (when available)
  var Deno:
    | {
        env: {
          get(name: string): string | undefined;
        };
      }
    | undefined;
}

// Export empty object to make this a module
export {};
