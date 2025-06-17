/**
 * Type extensions for better-auth
 */

// Better Auth doesn't export its internal Session type in a way that allows
// module augmentation. Instead, we'll create our own extended session type
// and handle the type casting where needed.

// This file is imported in shared/types.ts to ensure it's loaded
