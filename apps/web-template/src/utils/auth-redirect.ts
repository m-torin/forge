/**
 * Auth redirect utilities
 */

/**
 * Validate redirect URLs to prevent open redirect attacks
 */
export function isValidRedirect(url: string): boolean {
  // Must be a relative URL starting with /
  if (!url.startsWith('/')) return false;
  
  // Must not be a protocol-relative URL
  if (url.startsWith('//')) return false;
  
  // Must not contain @ (prevents user@host URLs)
  if (url.includes('@')) return false;
  
  // Must not contain : except in localhost:port scenarios
  if (url.includes(':') && !url.includes('localhost:')) return false;
  
  return true;
}

/**
 * Get the post-authentication redirect URL
 */
export function getPostAuthRedirect(
  searchParams: URLSearchParams,
  defaultRedirect: string = '/account'
): string {
  // Check URL params first
  const returnUrl = searchParams.get('returnUrl');
  
  if (returnUrl && isValidRedirect(returnUrl)) {
    return returnUrl;
  }
  
  // Check session storage for saved location
  if (typeof window !== 'undefined') {
    const savedLocation = sessionStorage.getItem('preAuthLocation');
    if (savedLocation && isValidRedirect(savedLocation)) {
      sessionStorage.removeItem('preAuthLocation');
      return savedLocation;
    }
  }
  
  // Default redirect
  return defaultRedirect;
}

/**
 * Save the current location for post-auth redirect
 */
export function savePreAuthLocation(pathname: string) {
  if (typeof window !== 'undefined' && isValidRedirect(pathname)) {
    sessionStorage.setItem('preAuthLocation', pathname);
  }
}

/**
 * Build login URL with return URL
 */
export function buildLoginUrl(
  locale: string,
  returnUrl?: string
): string {
  const loginUrl = `/${locale}/login`;
  
  if (returnUrl && isValidRedirect(returnUrl)) {
    const url = new URL(loginUrl, window.location.origin);
    url.searchParams.set('returnUrl', returnUrl);
    return url.pathname + url.search;
  }
  
  return loginUrl;
}

/**
 * Build signup URL with return URL
 */
export function buildSignupUrl(
  locale: string,
  returnUrl?: string
): string {
  const signupUrl = `/${locale}/signup`;
  
  if (returnUrl && isValidRedirect(returnUrl)) {
    const url = new URL(signupUrl, window.location.origin);
    url.searchParams.set('returnUrl', returnUrl);
    return url.pathname + url.search;
  }
  
  return signupUrl;
}