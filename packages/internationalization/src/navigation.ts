/**
 * Internationalized navigation APIs for next-intl
 * These wrappers around Next.js navigation automatically handle locale prefixes
 */

import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

// Create navigation utilities
const navigation = createNavigation(routing);

// Export navigation components and hooks with proper types
export const Link = navigation.Link;
export const redirect = navigation.redirect;
export const usePathname = navigation.usePathname;
export const useRouter = navigation.useRouter;
export const getPathname = navigation.getPathname;
export const permanentRedirect = navigation.permanentRedirect;
