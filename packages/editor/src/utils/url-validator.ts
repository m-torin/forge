import validator from 'validator';

const ALLOWED_PROTOCOLS = ['http:', 'https:', 'mailto:'];
const BLOCKED_PROTOCOLS = ['javascript:', 'data:', 'file:', 'ftp:', 'blob:'];

export function validateURL(url: string): boolean {
  if (!url || typeof url !== 'string') return false;

  // Trim whitespace
  url = url.trim();

  // Check for obviously malicious patterns
  if (BLOCKED_PROTOCOLS.some(protocol => url.toLowerCase().startsWith(protocol))) {
    return false;
  }

  // Check for malicious protocols
  try {
    const urlObj = new URL(url);
    if (!ALLOWED_PROTOCOLS.includes(urlObj.protocol)) {
      return false;
    }

    // Additional checks for suspicious patterns
    if (
      urlObj.hostname &&
      (urlObj.hostname.includes('..') ||
        urlObj.hostname.startsWith('.') ||
        urlObj.hostname.endsWith('.'))
    ) {
      return false;
    }
  } catch {
    // If URL constructor fails, try to validate as email for mailto
    if (url.startsWith('mailto:')) {
      const email = url.replace('mailto:', '');
      return validator.isEmail(email);
    }
    return false;
  }

  // Use validator.js for comprehensive validation
  if (url.startsWith('mailto:')) {
    const email = url.replace('mailto:', '');
    return validator.isEmail(email);
  }

  return validator.isURL(url, {
    protocols: ['http', 'https'],
    require_protocol: true,
    require_valid_protocol: true,
    allow_underscores: false,
    allow_trailing_dot: false,
    allow_protocol_relative_urls: false,
    allow_query_components: true,
    allow_fragments: true,
  });
}

export function sanitizeURL(url: string): string | null {
  if (!url || typeof url !== 'string') return null;

  // Trim and normalize
  url = url.trim();

  if (!validateURL(url)) return null;

  // Additional sanitization
  try {
    const urlObj = new URL(url);

    // Remove any potentially dangerous query parameters
    const dangerousParams = ['javascript', 'eval', 'script'];
    dangerousParams.forEach(param => {
      if (urlObj.searchParams.has(param)) {
        urlObj.searchParams.delete(param);
      }
    });

    return urlObj.toString();
  } catch {
    // For mailto URLs, just return the validated URL
    if (url.startsWith('mailto:') && validateURL(url)) {
      return url;
    }
    return null;
  }
}

export function isExternalURL(url: string): boolean {
  if (!url) return false;

  try {
    const urlObj = new URL(url);
    const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';

    return urlObj.hostname !== currentHost;
  } catch {
    return false;
  }
}

export function addSecurityAttributes(url: string): Record<string, string> {
  const attrs: Record<string, string> = {};

  if (isExternalURL(url)) {
    // Add security attributes for external links
    attrs.rel = 'noopener noreferrer';
    attrs.target = '_blank';
  }

  return attrs;
}
