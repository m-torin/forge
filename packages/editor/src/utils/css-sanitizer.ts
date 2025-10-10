import DOMPurify from 'dompurify';

interface SafeTheme {
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  focusColor: string;
  placeholderColor: string;
}

export function sanitizeTheme(theme: Partial<SafeTheme>): SafeTheme {
  const defaults: SafeTheme = {
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    borderColor: '#e5e7eb',
    focusColor: '#3b82f6',
    placeholderColor: '#9ca3af',
  };

  return {
    backgroundColor: sanitizeColor(theme.backgroundColor) || defaults.backgroundColor,
    textColor: sanitizeColor(theme.textColor) || defaults.textColor,
    borderColor: sanitizeColor(theme.borderColor) || defaults.borderColor,
    focusColor: sanitizeColor(theme.focusColor) || defaults.focusColor,
    placeholderColor: sanitizeColor(theme.placeholderColor) || defaults.placeholderColor,
  };
}

function sanitizeColor(color?: string): string | null {
  if (!color) return null;

  // Allow hex colors, rgb(), rgba(), hsl(), hsla(), and named colors
  const colorRegex =
    /^(#[0-9a-fA-F]{3,8}|rgb\([^)]+\)|rgba\([^)]+\)|hsl\([^)]+\)|hsla\([^)]+\)|[a-zA-Z]+)$/;

  if (!colorRegex.test(color)) return null;

  // Use DOMPurify to sanitize the CSS value
  const sanitized = DOMPurify.sanitize(`<div style="color: ${color}"></div>`);
  const match = sanitized.match(/color:\s*([^;"]+)/);

  return match ? match[1].trim() : null;
}

function sanitizeCSSValue(value: string, property: string): string | null {
  if (!value || !property) return null;

  // Create a test element with the CSS property
  const testHTML = `<div style="${property}: ${value}"></div>`;
  const sanitized = DOMPurify.sanitize(testHTML);

  // Extract the sanitized value - Use safer static matching
  const colonIndex = sanitized.indexOf(`${property}:`);
  if (colonIndex === -1) return null;

  const afterColon = sanitized.substring(colonIndex + property.length + 1);
  const valueMatch = afterColon.match(/^\s*([^;"]+)/);
  const match = valueMatch;
  return match ? match[1].trim() : null;
}

export function sanitizeDimension(value?: string): string | null {
  if (!value) return null;

  // Allow specific CSS units with safer parsing
  const validUnits = ['px', 'em', 'rem', '%', 'vh', 'vw', 'ch', 'ex'];

  // Find where the number ends and unit begins
  let numberLength = 0;
  let hasDecimal = false;

  for (let i = 0; i < value.length; i++) {
    const char = value[i];
    if (char >= '0' && char <= '9') {
      numberLength = i + 1;
    } else if (char === '.' && !hasDecimal && i > 0) {
      hasDecimal = true;
      numberLength = i + 1;
    } else {
      break;
    }
  }

  if (numberLength === 0) return null;

  const unit = value.substring(numberLength);
  if (!validUnits.includes(unit)) return null;

  return sanitizeCSSValue(value, 'width');
}

export function generateNonce(): string {
  // Generate a random nonce for CSP
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}
