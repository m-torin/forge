/**
 * Client-side API key helper functions that don't depend on server-only code
 */

type PermissionCheck = Record<string, string[]>;

/**
 * Minimal client-side permission checker - actual validation happens server-side
 * @returns Basic check result, true for now as real validation happens on server
 */
export function hasPermission(permissions: PermissionCheck): boolean {
  // Client-side permission checks would be verified server-side
  // This is just a stub to maintain API compatibility
  console.warn('Client-side hasPermission called - actual validation requires server-side check');
  return true;
}
