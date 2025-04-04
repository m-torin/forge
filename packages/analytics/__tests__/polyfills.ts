// Polyfill TextEncoder for esbuild
if (typeof globalThis.TextEncoder === 'undefined') {
  globalThis.TextEncoder = class TextEncoder {
    encode(input) {
      const buf = new Uint8Array(input.length);
      for (let i = 0; i < input.length; i++) {
        buf[i] = input.charCodeAt(i);
      }
      return buf;
    }
  };
}

// Ensure TextEncoder.encode returns a Uint8Array
if (typeof globalThis.TextEncoder !== 'undefined') {
  const originalTextEncoder = globalThis.TextEncoder;
  globalThis.TextEncoder = class TextEncoderFixed extends originalTextEncoder {
    encode(input) {
      const result = super.encode(input);
      // Ensure result is instanceof Uint8Array
      if (!(result instanceof Uint8Array)) {
        const buf = new Uint8Array(result.length);
        for (let i = 0; i < result.length; i++) {
          buf[i] = result[i];
        }
        return buf;
      }
      return result;
    }
  };
}
