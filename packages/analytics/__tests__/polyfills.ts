// Polyfill TextEncoder for environments that might lack it (like older Node.js in some test runners)
if (typeof globalThis.TextEncoder === "undefined") {
  import("util").then(({ TextEncoder: NodeTextEncoder }) => {
    globalThis.TextEncoder = NodeTextEncoder as typeof TextEncoder;
  });
}

// Polyfill TextDecoder as well, just in case
if (typeof globalThis.TextDecoder === "undefined") {
  import("util").then(({ TextDecoder: NodeTextDecoder }) => {
    globalThis.TextDecoder = NodeTextDecoder as typeof TextDecoder;
  });
}
