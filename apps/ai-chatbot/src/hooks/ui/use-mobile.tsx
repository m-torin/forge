import { useMediaQuery } from '@mantine/hooks';

/**
 * Mobile breakpoint in pixels
 */
const MOBILE_BREAKPOINT = 768;

/**
 * Hook to determine if the current viewport is mobile-sized
 * @returns Boolean indicating if viewport is mobile
 */
export function useIsMobile() {
  return useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
}
