'use client';

import { useMediaQuery, useViewportSize } from '@mantine/hooks';
import { usePathname } from 'next/navigation';
import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useTransition,
  useCallback,
  useState,
  useEffect,
} from 'react';

import { addFavorite, removeFavorite, getFavorites, toggleFavorite } from '@/actions/favorites';
import { AuthPromptModal } from '@/components/auth/AuthPromptModal';
import { useSession } from '@repo/auth/client/next';

export interface GuestPreferences {
  currency: 'USD' | 'EUR' | 'GBP';
  locale: 'en' | 'fr' | 'es' | 'pt' | 'de';
  sortPreference: 'featured' | 'price-low' | 'price-high' | 'newest';
  viewMode: 'grid' | 'list';
}

interface ListOperations {
  add: (listType: string, itemId: string, metadata?: Record<string, any>) => Promise<void>;
  clear: (listType: string) => void;
  get: (listType: string) => string[];
  has: (listType: string, itemId: string) => boolean;
  remove: (listType: string, itemId: string) => Promise<void>;
  toggle: (listType: string, itemId: string, metadata?: Record<string, any>) => Promise<boolean>;
}

interface ActivityOperations {
  trackInteraction: (interaction: any) => void;
  trackPageView: (category: string, name?: string, properties?: Record<string, any>) => void;
  trackProductView: (item: any) => void;
  trackSearch: (query: string, resultsCount: number) => void;
}

interface GuestOperations {
  becomeAuthenticated: (userId: string) => Promise<void>;
  id: string;
  isAuthenticated: boolean;
}

interface PreferencesOperations {
  get: (key: string) => any;
  reset: () => void;
  set: (key: string, value: any) => void;
}

interface FavoritesOperations {
  addFavorite: (id: string, metadata?: any) => Promise<void>;
  removeFavorite: (id: string) => Promise<void>;
  toggleFavorite: (id: string, metadata?: any) => Promise<void>;
  isFavorite: (id: string) => boolean;
  favorites: Set<string>;
  favoriteCount: number;
  refreshFavorites: () => Promise<void>;
}

interface GuestActionsContextValue {
  activity: ActivityOperations;
  device: {
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    viewport: { width: number; height: number };
  };
  guest: GuestOperations;
  lists: ListOperations;
  preferences: PreferencesOperations;
  favorites: FavoritesOperations;
}

const GuestActionsContext = createContext<GuestActionsContextValue | undefined>(undefined);

const DEFAULT_PREFERENCES = {
  currency: 'USD',
  locale: 'en',
  sortPreference: 'featured',
  viewMode: 'grid',
} as const satisfies GuestPreferences;

export function GuestActionsProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [_isPending, startTransition] = useTransition();
  const { data: session } = useSession();

  // Extract locale from pathname
  const locale = pathname.split('/')[1] || 'en';

  // Store favorites in state (database for auth users, localStorage for guests)
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [guestFavoriteIds, setGuestFavoriteIds] = useState<Set<string>>(new Set());
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true);

  // Auth prompt modal state
  const [authPromptOpened, setAuthPromptOpened] = useState(false);
  const [authPromptContext, setAuthPromptContext] = useState<{
    action: 'favorite' | 'review' | 'purchase' | 'generic';
    productName?: string;
  }>({ action: 'generic' });

  // Device detection
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
  const isDesktop = useMediaQuery('(min-width: 1025px)');
  const viewport = useViewportSize();

  // Preferences - for now keep in memory, could be moved to DB later
  const [preferences, setPreferences] = useState<GuestPreferences>(DEFAULT_PREFERENCES);

  // Load guest favorites from localStorage
  const loadGuestFavorites = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('guest-favorites');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setGuestFavoriteIds(new Set(parsed));
          }
        }
      } catch (error) {
        console.error('Failed to load guest favorites:', error);
      }
    }
  }, []);

  // Save guest favorites to localStorage
  const saveGuestFavorites = useCallback((favorites: Set<string>) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('guest-favorites', JSON.stringify([...favorites]));
      } catch (error) {
        console.error('Failed to save guest favorites:', error);
      }
    }
  }, []);

  // Load favorites from database when user is authenticated
  const loadFavorites = useCallback(async () => {
    if (session?.user) {
      try {
        setIsLoadingFavorites(true);
        const favs = await getFavorites(session.user.id);
        setFavoriteIds(new Set(favs.map((f: any) => f.id)));
      } catch (error) {
        console.error('Failed to load favorites:', error);
      } finally {
        setIsLoadingFavorites(false);
      }
    } else {
      setFavoriteIds(new Set());
      loadGuestFavorites();
      setIsLoadingFavorites(false);
    }
  }, [session?.user, loadGuestFavorites]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  // Lists operations (for other types of lists in the future)
  const listOperations = useMemo<ListOperations>(
    () => ({
      add: async (_listType: string, _itemId: string, _metadata?: Record<string, any>) => {
        // Not implemented for non-favorites lists
      },
      remove: async (_listType: string, _itemId: string) => {
        // Not implemented for non-favorites lists
      },
      toggle: async (_listType: string, _itemId: string, _metadata?: Record<string, any>) => {
        // Not implemented for non-favorites lists
        return false;
      },
      has: (_listType: string, _itemId: string) => {
        // Not implemented for non-favorites lists
        return false;
      },
      get: (_listType: string) => {
        // Not implemented for non-favorites lists
        return [];
      },
      clear: (_listType: string) => {
        // Not implemented for non-favorites lists
      },
    }),
    [],
  );

  const activityOperations = useMemo<ActivityOperations>(
    () => ({
      trackPageView: (_category: string, _name?: string, _properties?: Record<string, any>) => {
        // No-op
      },

      trackProductView: (_item: any) => {
        // No-op
      },

      trackSearch: (_query: string, _resultsCount: number) => {
        // No-op
      },

      trackInteraction: (_interaction: any) => {
        // No-op
      },
    }),
    [],
  );

  const preferencesOperations = useMemo<PreferencesOperations>(
    () => ({
      set: (key: string, value: any) => {
        startTransition(() => {
          setPreferences((prev) => ({ ...prev, [key]: value }));
        });
      },

      get: (key: string) => preferences[key as keyof GuestPreferences],

      reset: () => {
        startTransition(() => {
          setPreferences(DEFAULT_PREFERENCES);
        });
      },
    }),
    [preferences],
  );

  const favoritesOperations = useMemo<FavoritesOperations>(
    () => ({
      addFavorite: async (id: string, metadata?: any) => {
        if (!session?.user) {
          // Allow guest users to save to localStorage and show prompt
          const newGuestFavorites = new Set([...guestFavoriteIds, id]);
          setGuestFavoriteIds(newGuestFavorites);
          saveGuestFavorites(newGuestFavorites);

          // Show auth prompt for enhanced experience
          setAuthPromptContext({
            action: 'favorite',
            productName: metadata?.productName,
          });
          setAuthPromptOpened(true);
          return;
        }

        try {
          await addFavorite(session?.user?.id || 'guest', id);
          setFavoriteIds((prev) => new Set([...prev, id]));
        } catch (error) {
          console.error('Failed to add favorite:', error);
          throw error;
        }
      },

      removeFavorite: async (id: string) => {
        if (!session?.user) {
          // Remove from guest favorites
          const newGuestFavorites = new Set(guestFavoriteIds);
          newGuestFavorites.delete(id);
          setGuestFavoriteIds(newGuestFavorites);
          saveGuestFavorites(newGuestFavorites);
          return;
        }

        try {
          await removeFavorite(session?.user?.id || 'guest', id);
          setFavoriteIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
          });
        } catch (error) {
          console.error('Failed to remove favorite:', error);
          throw error;
        }
      },

      toggleFavorite: async (id: string, metadata?: any) => {
        if (!session?.user) {
          // Toggle guest favorites
          const newGuestFavorites = new Set(guestFavoriteIds);
          if (newGuestFavorites.has(id)) {
            newGuestFavorites.delete(id);
          } else {
            newGuestFavorites.add(id);
            // Show auth prompt when adding (not removing)
            setAuthPromptContext({
              action: 'favorite',
              productName: metadata?.productName,
            });
            setAuthPromptOpened(true);
          }
          setGuestFavoriteIds(newGuestFavorites);
          saveGuestFavorites(newGuestFavorites);
          return;
        }

        try {
          const isFavorited = await toggleFavorite(session?.user?.id || 'guest', id);

          if (isFavorited) {
            setFavoriteIds((prev) => new Set([...prev, id]));
          } else {
            setFavoriteIds((prev) => {
              const newSet = new Set(prev);
              newSet.delete(id);
              return newSet;
            });
          }
        } catch (error) {
          console.error('Failed to toggle favorite:', error);
          throw error;
        }
      },

      isFavorite: (id: string) => {
        return session?.user ? favoriteIds.has(id) : guestFavoriteIds.has(id);
      },

      favorites: session?.user ? favoriteIds : guestFavoriteIds,
      favoriteCount: session?.user ? favoriteIds.size : guestFavoriteIds.size,
      refreshFavorites: loadFavorites,
    }),
    [favoriteIds, guestFavoriteIds, session?.user, loadFavorites, saveGuestFavorites],
  );

  const guestOperations = useMemo<GuestOperations>(
    () => ({
      id: session?.user?.id || `guest-${Math.random().toString(36).substring(2, 15)}`,
      becomeAuthenticated: async (_userId: string) => {
        // Migrate guest favorites to authenticated user
        if (guestFavoriteIds.size > 0) {
          try {
            for (const productId of guestFavoriteIds) {
              await addFavorite(session.user.id, productId);
            }
            // Clear guest favorites after migration
            setGuestFavoriteIds(new Set());
            localStorage.removeItem('guest-favorites');
          } catch (error) {
            console.error('Failed to migrate guest favorites:', error);
          }
        }
        // Refresh favorites when user becomes authenticated
        await loadFavorites();
      },
      isAuthenticated: !!session?.user,
    }),
    [session?.user, loadFavorites, guestFavoriteIds],
  );

  const value = useMemo<GuestActionsContextValue>(
    () => ({
      activity: activityOperations,
      device: {
        isDesktop: isDesktop ?? true,
        isMobile: isMobile ?? false,
        isTablet: isTablet ?? false,
        viewport: { width: viewport.width, height: viewport.height },
      },
      guest: guestOperations,
      lists: listOperations,
      preferences: preferencesOperations,
      favorites: favoritesOperations,
    }),
    [
      guestOperations,
      listOperations,
      activityOperations,
      preferencesOperations,
      favoritesOperations,
      isMobile,
      isTablet,
      isDesktop,
      viewport,
    ],
  );

  return (
    <GuestActionsContext.Provider value={value}>
      {children}
      <AuthPromptModal
        opened={authPromptOpened}
        onClose={() => setAuthPromptOpened(false)}
        action={authPromptContext.action}
        productName={authPromptContext.productName}
        locale={locale}
      />
    </GuestActionsContext.Provider>
  );
}

export function useGuestActions() {
  const context = useContext(GuestActionsContext);
  if (!context) {
    throw new Error('useGuestActions must be used within a GuestActionsProvider');
  }
  return context;
}

// Product-specific favorites hook for compatibility
export function useProductFavorite(productId: string, metadata?: any) {
  const { favorites } = useGuestActions();

  return {
    addToFavorites: () => favorites.addFavorite(productId, metadata),
    isFavorite: favorites.isFavorite(productId),
    removeFromFavorites: () => favorites.removeFavorite(productId),
    toggleFavorite: () => favorites.toggleFavorite(productId, metadata),
  };
}

// Direct favorites hook for compatibility
export function useGuestFavorites() {
  const { favorites } = useGuestActions();
  return favorites;
}
