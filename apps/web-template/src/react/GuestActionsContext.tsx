'use client';

import { useLocalStorage, useMap, useMediaQuery, useViewportSize } from '@mantine/hooks';
import { usePathname } from 'next/navigation';
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useTransition,
} from 'react';

// Simplified version without analytics

interface FavoriteItem {
  id: string;
  metadata?: any;
  addedAt: string;
}

type FavoritesMap = Record<string, FavoriteItem>;

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
  addFavorite: (id: string, metadata?: any) => void;
  removeFavorite: (id: string) => void;
  toggleFavorite: (id: string, metadata?: any) => void;
  isFavorite: (id: string) => boolean;
  favorites: Set<string>;
  favoriteCount: number;
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
  const _pathname = usePathname();
  const [_isPending, startTransition] = useTransition();

  // Guest ID management
  const [guestId] = useLocalStorage({
    defaultValue: () => `guest-${Math.random().toString(36).substring(2, 15)}`,
    key: 'guest-id',
  });

  const [authenticatedUserId, setAuthenticatedUserId] = useLocalStorage({
    defaultValue: '',
    key: 'authenticated-user-id',
  });

  // Device detection
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
  const isDesktop = useMediaQuery('(min-width: 1025px)');
  const viewport = useViewportSize();

  // Preferences
  const [preferences, setPreferences] = useLocalStorage<GuestPreferences>({
    defaultValue: DEFAULT_PREFERENCES,
    key: 'guest-preferences',
  });

  // Favorites with metadata
  const [favorites, setFavorites] = useLocalStorage<FavoritesMap>({
    key: 'guest-lists-favorites',
    defaultValue: {},
  });

  // Lists (favorites, wishlists, etc.)
  const lists = useMap<string, string[]>();

  // Initialize lists from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('guest-favorites');
    if (savedFavorites) {
      try {
        lists.set('favorites', JSON.parse(savedFavorites));
      } catch {
        // Ignore parse errors
      }
    }
  }, [lists]);

  // Save favorites to localStorage
  useEffect(() => {
    const favorites = lists.get('favorites');
    if (favorites) {
      localStorage.setItem('guest-favorites', JSON.stringify(favorites));
    }
  }, [lists]);

  // Operations
  const listOperations = useMemo<ListOperations>(
    () => ({
      add: async (listType: string, itemId: string, _metadata?: Record<string, any>) => {
        const currentList = lists.get(listType) || [];
        if (!currentList.includes(itemId)) {
          lists.set(listType, [...currentList, itemId]);
        }
      },

      remove: async (listType: string, itemId: string) => {
        const currentList = lists.get(listType) || [];
        lists.set(
          listType,
          currentList.filter((id) => id !== itemId),
        );
      },

      toggle: async (listType: string, itemId: string, _metadata?: Record<string, any>) => {
        const currentList = lists.get(listType) || [];
        const has = currentList.includes(itemId);

        if (has) {
          lists.set(
            listType,
            currentList.filter((id) => id !== itemId),
          );
        } else {
          lists.set(listType, [...currentList, itemId]);
        }

        return !has;
      },

      has: (listType: string, itemId: string) => {
        const currentList = lists.get(listType) || [];
        return currentList.includes(itemId);
      },

      get: (listType: string) => lists.get(listType) || [],

      clear: (listType: string) => {
        lists.set(listType, []);
      },
    }),
    [lists],
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
    [preferences, setPreferences],
  );

  const favoritesOperations = useMemo<FavoritesOperations>(
    () => ({
      addFavorite: (id: string, metadata?: any) => {
        setFavorites((prev) => ({
          ...prev,
          [id]: {
            id,
            metadata,
            addedAt: new Date().toISOString(),
          },
        }));
      },

      removeFavorite: (id: string) => {
        setFavorites((prev) => {
          const { [id]: _, ...rest } = prev;
          return rest;
        });
      },

      toggleFavorite: (id: string, metadata?: any) => {
        setFavorites((prev) => {
          if (prev[id]) {
            const { [id]: _, ...rest } = prev;
            return rest;
          }
          return {
            ...prev,
            [id]: {
              id,
              metadata,
              addedAt: new Date().toISOString(),
            },
          };
        });
      },

      isFavorite: (id: string) => {
        return Boolean(favorites[id]);
      },

      favorites: new Set(Object.keys(favorites)),
      favoriteCount: Object.keys(favorites).length,
    }),
    [favorites, setFavorites],
  );

  const guestOperations = useMemo<GuestOperations>(
    () => ({
      id: typeof guestId === 'function' ? guestId() : guestId,
      becomeAuthenticated: async (userId: string) => {
        setAuthenticatedUserId(userId);
      },
      isAuthenticated: !!authenticatedUserId,
    }),
    [guestId, authenticatedUserId, setAuthenticatedUserId],
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

  return <GuestActionsContext.Provider value={value}>{children}</GuestActionsContext.Provider>;
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
