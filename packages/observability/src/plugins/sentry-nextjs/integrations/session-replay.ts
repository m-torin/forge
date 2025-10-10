/**
 * Session replay integration helpers for Sentry Next.js
 */

/**
 * Session replay configuration with advanced options
 */
export interface SessionReplayConfig {
  /**
   * Enable session replay
   * @default false
   */
  enabled?: boolean;

  /**
   * Sample rate for regular sessions (0.0 to 1.0)
   * @default 0.1
   */
  sessionSampleRate?: number;

  /**
   * Sample rate for sessions with errors (0.0 to 1.0)
   * @default 1.0
   */
  errorSampleRate?: number;

  /**
   * Enable canvas recording
   * @default false
   */
  enableCanvas?: boolean;

  /**
   * Canvas recording quality
   */
  canvasQuality?: "low" | "medium" | "high";

  /**
   * Canvas frame rate
   */
  canvasFPS?: number;

  /**
   * Privacy settings
   */
  privacy?: {
    /**
     * Mask all text content
     * @default true
     */
    maskAllText?: boolean;

    /**
     * Mask all media elements
     * @default false
     */
    blockAllMedia?: boolean;

    /**
     * CSS selectors to mask
     */
    mask?: string[];

    /**
     * CSS selectors to unmask
     */
    unmask?: string[];

    /**
     * CSS selectors to block entirely
     */
    block?: string[];

    /**
     * CSS selectors to ignore
     */
    ignore?: string[];

    /**
     * Mask text by CSS class
     */
    maskTextClass?: string;

    /**
     * Block media by CSS class
     */
    blockMediaClass?: string;
  };

  /**
   * Network capture settings
   */
  networkCapture?: {
    /**
     * Enable network request/response capture
     * @default true
     */
    enabled?: boolean;

    /**
     * Capture request headers
     * @default false
     */
    captureHeaders?: boolean;

    /**
     * Capture request/response bodies
     * @default false
     */
    captureBodies?: boolean;

    /**
     * URLs to include (whitelist)
     */
    urlIncludePatterns?: (string | RegExp)[];

    /**
     * URLs to exclude (blacklist)
     */
    urlExcludePatterns?: (string | RegExp)[];
  };

  /**
   * Console capture settings
   */
  consoleCapture?: {
    /**
     * Enable console capture
     * @default true
     */
    enabled?: boolean;

    /**
     * Console levels to capture
     */
    levels?: ("log" | "info" | "warn" | "error" | "debug")[];
  };

  /**
   * Custom sampling logic
   */
  customSampling?: (event: any) => boolean;
}

/**
 * Generate replay integration configuration
 */
export function generateReplayIntegrationConfig(
  config: SessionReplayConfig,
): any {
  const {
    privacy = {},
    networkCapture = {},
    consoleCapture: _consoleCapture = {},
  } = config;

  const replayConfig: any = {
    // Privacy settings
    maskAllText: privacy.maskAllText ?? true,
    blockAllMedia: privacy.blockAllMedia ?? false,

    // Selectors
    ...(privacy.mask && { mask: privacy.mask }),
    ...(privacy.unmask && { unmask: privacy.unmask }),
    ...(privacy.block && { block: privacy.block }),
    ...(privacy.ignore && { ignore: privacy.ignore }),
    ...(privacy.maskTextClass && { maskTextClass: privacy.maskTextClass }),
    ...(privacy.blockMediaClass && {
      blockMediaClass: privacy.blockMediaClass,
    }),

    // Network settings
    networkDetailAllowUrls: networkCapture.urlIncludePatterns || [],
    networkDetailDenyUrls: networkCapture.urlExcludePatterns || [],
    networkCaptureBodies: networkCapture.captureBodies ?? false,
    networkRequestHeaders: networkCapture.captureHeaders ? ["*"] : [],
    networkResponseHeaders: networkCapture.captureHeaders ? ["*"] : [],
  };

  return replayConfig;
}

/**
 * Generate canvas integration configuration
 */
export function generateCanvasIntegrationConfig(
  config: SessionReplayConfig,
): any {
  if (!config.enableCanvas) {
    return null;
  }

  const quality = config.canvasQuality || "medium";
  const fps =
    config.canvasFPS ||
    (quality === "high" ? 15 : quality === "medium" ? 10 : 5);

  return {
    recordCanvas: true,
    sampling: {
      canvas: fps,
    },
    dataURLOptions: {
      type: "image/webp",
      quality: quality === "high" ? 0.8 : quality === "medium" ? 0.6 : 0.4,
    },
  };
}

/**
 * Privacy preset configurations
 */
export const PRIVACY_PRESETS = {
  strict: {
    maskAllText: true,
    blockAllMedia: true,
    mask: [".sensitive", "[data-private]", "input", "textarea"],
    block: ["iframe", "video", "audio", "img"],
    maskTextClass: "sentry-mask",
    blockMediaClass: "sentry-block",
  },
  balanced: {
    maskAllText: false,
    blockAllMedia: false,
    mask: ['input[type="password"]', "[data-sensitive]", ".private"],
    unmask: [".public", "[data-public]"],
    maskTextClass: "sentry-mask",
  },
  minimal: {
    maskAllText: false,
    blockAllMedia: false,
    mask: ['input[type="password"]'],
    unmask: ["*"],
  },
};

/**
 * Custom masking utilities
 */
export const MASKING_UTILITIES = `
// CSS classes for dynamic masking
<style>
  .sentry-mask { 
    color: transparent !important;
    background: #000 !important;
  }
  .sentry-block { 
    display: none !important;
  }
  [data-sentry-mask="true"] {
    filter: blur(10px);
  }
</style>

// JavaScript utilities for dynamic masking
<script>
  // Dynamically mask element
  function sentryMaskElement(selector) {
    document.querySelectorAll(selector).forEach(el => {
      el.classList.add('sentry-mask');
    });
  }

  // Dynamically unmask element
  function sentryUnmaskElement(selector) {
    document.querySelectorAll(selector).forEach(el => {
      el.classList.remove('sentry-mask');
    });
  }

  // Toggle masking based on condition
  function sentryConditionalMask(selector, condition) {
    document.querySelectorAll(selector).forEach(el => {
      if (condition(el)) {
        el.classList.add('sentry-mask');
      } else {
        el.classList.remove('sentry-mask');
      }
    });
  }
</script>
`;

/**
 * Generate custom sampling function
 */
export function generateCustomSamplingFunction(rules: {
  urlPatterns?: string[];
  userRoles?: string[];
  errorTypes?: string[];
  customLogic?: string;
}): string {
  return `(event) => {
  // URL-based sampling
  ${
    rules.urlPatterns
      ? `
  const urlPatterns = ${JSON.stringify(rules.urlPatterns)};
  if (urlPatterns.some(pattern => window.location.href.includes(pattern))) {
    return true;
  }`
      : ""
  }

  // User role-based sampling
  ${
    rules.userRoles
      ? `
  const userRoles = ${JSON.stringify(rules.userRoles)};
  const currentUserRole = getUserRole(); // Your implementation
  if (userRoles.includes(currentUserRole)) {
    return true;
  }`
      : ""
  }

  // Error type-based sampling
  ${
    rules.errorTypes
      ? `
  const errorTypes = ${JSON.stringify(rules.errorTypes)};
  if (event.exception && errorTypes.includes(event.exception.values[0]?.type)) {
    return true;
  }`
      : ""
  }

  // Custom logic
  ${rules.customLogic || ""}

  // Default sampling
  return Math.random() < 0.1; // 10% default
}`;
}

/**
 * Session replay setup guide
 */
export const SESSION_REPLAY_SETUP_GUIDE = `
# Session Replay Advanced Setup Guide

## 1. Basic Configuration

\`\`\`typescript
Sentry.init({
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
      networkDetailAllowUrls: ['https://api.example.com'],
    }),
  ],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
\`\`\`

## 2. Canvas Recording

\`\`\`typescript
Sentry.init({
  integrations: [
    Sentry.replayIntegration(),
    Sentry.replayCanvasIntegration({
      recordCanvas: true,
      sampling: { canvas: 10 }, // 10 FPS
    }),
  ],
});
\`\`\`

## 3. Privacy Configuration

### Strict Privacy (PII Protection)
\`\`\`typescript
${JSON.stringify(PRIVACY_PRESETS.strict, null, 2)}
\`\`\`

### Balanced Privacy
\`\`\`typescript
${JSON.stringify(PRIVACY_PRESETS.balanced, null, 2)}
\`\`\`

### Minimal Privacy
\`\`\`typescript
${JSON.stringify(PRIVACY_PRESETS.minimal, null, 2)}
\`\`\`

## 4. Dynamic Masking

Add these utilities to your app:

${MASKING_UTILITIES}

## 5. Custom Sampling

\`\`\`typescript
replaysSessionSampleRate: 0,
replaysOnErrorSampleRate: 0,
beforeSendReplay: ${generateCustomSamplingFunction({
  urlPatterns: ["/checkout", "/payment"],
  userRoles: ["premium", "enterprise"],
  errorTypes: ["TypeError", "ReferenceError"],
})}
\`\`\`

## 6. Performance Optimization

- Start with low sample rates
- Use network filtering to reduce payload
- Enable canvas recording only when needed
- Use custom sampling for targeted capture
- Monitor bandwidth usage

## 7. GDPR Compliance

- Always mask sensitive data
- Provide user opt-out mechanism
- Document what is recorded
- Implement data retention policies
`;
