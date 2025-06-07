import { flag } from '@repo/feature-flags'

/**
 * QStash Mode Feature Flag
 * Controls whether to use local QStash CLI server or production QStash
 *
 * - true: Use local QStash CLI (development mode)
 * - false: Use production QStash (default)
 */
export const useLocalQStashFlag = flag<boolean>({
  key: 'use-local-qstash',
  options: [
    { label: 'Production QStash', value: false },
    { label: 'Local QStash CLI', value: true },
  ],
  decide: () => {
    // Check environment variable first (client-safe)
    if (typeof window !== 'undefined') {
      // Client-side: use a simple fallback
      return process.env.NODE_ENV === 'development'
    }

    // Server-side logic would go here, but we'll keep it simple
    if (process.env.NEXT_PUBLIC_USE_LOCAL_QSTASH === 'true') {
      return true
    }

    // Check for development mode
    if (process.env.NODE_ENV === 'development') {
      return true
    }

    // Production default
    return false
  },
})

/**
 * All core flags for this application
 */
export const coreFlags = [useLocalQStashFlag] as const
