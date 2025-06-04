'use client';

import React, { createContext, useContext, useEffect, useCallback, useMemo } from 'react';
import { 
  useLocalStorage, 
  useSetState, 
  useListState, 
  useMap,
  useDebouncedValue,
  useQueue,
  useDisclosure
} from '@mantine/hooks';
import { analytics } from '@/lib/analytics-setup';

// Types
export type ListType = 'favorites' | 'registry' | 'shopping' | 'comparison' | 'later' | 'cart';
export type InteractionType = 'view' | 'click' | 'hover' | 'share' | 'save';

interface ViewedItem {
  id: string;
  title?: string;
  price?: number;
  image?: string;
  viewedAt: Date;
}

interface SearchQuery {
  query: string;
  timestamp: Date;
  resultsCount?: number;
}

interface Interaction {
  type: InteractionType;
  itemId: string;
  timestamp: Date;
  metadata?: any;
}

interface GuestPreferences {
  currency: string;
  locale: string;
  viewMode: 'grid' | 'list';
  sortPreference: string;
}

// Helper functions
function generateGuestId(): string {
  return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Context value interface
interface GuestActionsContextValue {
  // Guest identity
  guest: {
    id: string;
    isAuthenticated: boolean;
    becomeUser: (userId: string) => Promise<void>;
  };
  
  // List operations
  lists: {
    add: (listType: ListType, itemId: string, metadata?: any) => Promise<void>;
    remove: (listType: ListType, itemId: string) => Promise<void>;
    toggle: (listType: ListType, itemId: string, metadata?: any) => Promise<boolean>;
    clear: (listType: ListType) => Promise<void>;
    has: (listType: ListType, itemId: string) => boolean;
    count: (listType: ListType) => number;
    items: (listType: ListType) => string[];
  };
  
  // Activity tracking
  activity: {
    trackView: (item: ViewedItem) => void;
    trackSearch: (query: string, resultsCount?: number) => void;
    trackInteraction: (interaction: Omit<Interaction, 'timestamp'>) => void;
    getRecentlyViewed: (limit?: number) => ViewedItem[];
    clearHistory: () => void;
  };
  
  // Preferences
  preferences: {
    set: (key: string, value: any) => void;
    get: (key: string) => any;
    reset: () => void;
  };
}

// Create context
const GuestActionsContext = createContext<GuestActionsContextValue | undefined>(undefined);

// Provider component
export function GuestActionsProvider({ children }: { children: React.ReactNode }) {
  // Guest identity
  const [guestId] = useLocalStorage<string>({
    key: 'guestId',
    defaultValue: generateGuestId(),
  });
  
  const [userId, setUserId] = useLocalStorage<string | null>({
    key: 'userId',
    defaultValue: null,
  });
  
  const sessionId = useMemo(() => generateSessionId(), []);
  
  // Lists with localStorage
  const [favorites, setFavorites] = useLocalStorage<string[]>({
    key: 'guest_favorites',
    defaultValue: [],
  });
  
  const [registry, setRegistry] = useLocalStorage<string[]>({
    key: 'guest_registry',
    defaultValue: [],
  });
  
  const [shopping, setShopping] = useLocalStorage<string[]>({
    key: 'guest_shopping',
    defaultValue: [],
  });
  
  const [comparison, setComparison] = useLocalStorage<string[]>({
    key: 'guest_comparison',
    defaultValue: [],
  });
  
  const [later, setLater] = useLocalStorage<string[]>({
    key: 'guest_later',
    defaultValue: [],
  });
  
  const [cart, setCart] = useLocalStorage<string[]>({
    key: 'guest_cart',
    defaultValue: [],
  });
  
  // Map all lists for easy access
  const lists = useMemo(() => ({
    favorites: { items: favorites, setter: setFavorites },
    registry: { items: registry, setter: setRegistry },
    shopping: { items: shopping, setter: setShopping },
    comparison: { items: comparison, setter: setComparison },
    later: { items: later, setter: setLater },
    cart: { items: cart, setter: setCart },
  }), [favorites, registry, shopping, comparison, later, cart]);
  
  // Activity tracking
  const [recentlyViewed, viewHandlers] = useListState<ViewedItem>([]);
  const [searchHistory, searchHandlers] = useListState<SearchQuery>([]);
  const interactions = useMap<string, Interaction>();
  
  // Preferences
  const [preferences, setPreferences] = useLocalStorage<GuestPreferences>({
    key: 'guest_preferences',
    defaultValue: {
      currency: 'USD',
      locale: 'en',
      viewMode: 'grid',
      sortPreference: 'featured',
    },
  });
  
  // Save activity to localStorage (debounced)
  const [debouncedActivity] = useDebouncedValue(
    { recentlyViewed, searchHistory, interactions: Array.from(interactions) },
    1000
  );
  
  useEffect(() => {
    localStorage.setItem('guest_activity', JSON.stringify({
      recentlyViewed: debouncedActivity.recentlyViewed.slice(0, 20),
      searchHistory: debouncedActivity.searchHistory.slice(0, 10),
      interactions: debouncedActivity.interactions.slice(0, 50),
    }));
  }, [debouncedActivity]);
  
  // Load activity from localStorage on mount
  useEffect(() => {
    try {
      const savedActivity = localStorage.getItem('guest_activity');
      if (savedActivity) {
        const parsed = JSON.parse(savedActivity);
        if (parsed.recentlyViewed) {
          viewHandlers.setState(parsed.recentlyViewed.map((item: any) => ({
            ...item,
            viewedAt: new Date(item.viewedAt),
          })));
        }
        if (parsed.searchHistory) {
          searchHandlers.setState(parsed.searchHistory.map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp),
          })));
        }
        if (parsed.interactions) {
          parsed.interactions.forEach(([key, value]: [string, any]) => {
            interactions.set(key, { ...value, timestamp: new Date(value.timestamp) });
          });
        }
      }
    } catch (error) {
      console.error('Failed to load activity from storage:', error);
    }
  }, []);
  
  // List operations
  const listOperations = useMemo(() => ({
    add: async (listType: ListType, itemId: string, metadata?: any) => {
      const list = lists[listType];
      if (!list.items.includes(itemId)) {
        list.setter([...list.items, itemId]);
        
        // Analytics
        if (listType === 'favorites') {
          analytics.track('Product Added to Wishlist', {
            productId: itemId,
            ...metadata,
          }).catch(() => {});
        } else {
          analytics.track(`item_added_to_${listType}`, {
            itemId,
            listType,
            ...metadata,
          }).catch(() => {});
        }
      }
    },
    
    remove: async (listType: ListType, itemId: string) => {
      const list = lists[listType];
      list.setter(list.items.filter(id => id !== itemId));
      
      // Analytics
      if (listType === 'favorites') {
        analytics.track('Product Removed from Wishlist', {
          productId: itemId,
        }).catch(() => {});
      } else {
        analytics.track(`item_removed_from_${listType}`, {
          itemId,
          listType,
        }).catch(() => {});
      }
    },
    
    toggle: async (listType: ListType, itemId: string, metadata?: any) => {
      const list = lists[listType];
      const has = list.items.includes(itemId);
      
      if (has) {
        list.setter(list.items.filter(id => id !== itemId));
      } else {
        list.setter([...list.items, itemId]);
      }
      
      // Analytics
      if (listType === 'favorites') {
        analytics.track(has ? 'Product Removed from Wishlist' : 'Product Added to Wishlist', {
          productId: itemId,
          ...(has ? {} : metadata),
        }).catch(() => {});
      } else {
        analytics.track(has ? `item_removed_from_${listType}` : `item_added_to_${listType}`, {
          itemId,
          listType,
          ...(has ? {} : metadata),
        }).catch(() => {});
      }
      
      return !has;
    },
    
    clear: async (listType: ListType) => {
      const list = lists[listType];
      list.setter([]);
    },
    
    has: (listType: ListType, itemId: string) => {
      return lists[listType].items.includes(itemId);
    },
    
    count: (listType: ListType) => {
      return lists[listType].items.length;
    },
    
    items: (listType: ListType) => {
      return lists[listType].items;
    },
  }), [lists]);
  
  // Activity operations
  const activityOperations = useMemo(() => ({
    trackView: (item: ViewedItem) => {
      // Remove if already viewed and add to front
      const filtered = recentlyViewed.filter(v => v.id !== item.id);
      viewHandlers.setState([item, ...filtered].slice(0, 50));
    },
    
    trackSearch: (query: string, resultsCount?: number) => {
      searchHandlers.prepend({
        query,
        timestamp: new Date(),
        resultsCount,
      });
      // Keep only last 20 searches
      if (searchHistory.length > 20) {
        searchHandlers.setState(searchHistory.slice(0, 20));
      }
    },
    
    trackInteraction: (interaction: Omit<Interaction, 'timestamp'>) => {
      interactions.set(interaction.itemId, {
        ...interaction,
        timestamp: new Date(),
      });
    },
    
    getRecentlyViewed: (limit?: number) => {
      return limit ? recentlyViewed.slice(0, limit) : recentlyViewed;
    },
    
    clearHistory: () => {
      viewHandlers.setState([]);
      searchHandlers.setState([]);
      interactions.clear();
    },
  }), [recentlyViewed, searchHistory, viewHandlers, searchHandlers, interactions]);
  
  // Preferences operations
  const preferencesOperations = useMemo(() => ({
    set: (key: string, value: any) => {
      setPreferences(prev => ({ ...prev, [key]: value }));
    },
    
    get: (key: string) => {
      return (preferences as any)[key];
    },
    
    reset: () => {
      setPreferences({
        currency: 'USD',
        locale: 'en',
        viewMode: 'grid',
        sortPreference: 'featured',
      });
    },
  }), [preferences, setPreferences]);
  
  // Context value
  const value = useMemo<GuestActionsContextValue>(() => ({
    guest: {
      id: guestId,
      isAuthenticated: !!userId,
      becomeUser: async (newUserId: string) => {
        setUserId(newUserId);
        // Here you would sync to server
      },
    },
    lists: listOperations,
    activity: activityOperations,
    preferences: preferencesOperations,
  }), [guestId, userId, listOperations, activityOperations, preferencesOperations]);
  
  return (
    <GuestActionsContext.Provider value={value}>
      {children}
    </GuestActionsContext.Provider>
  );
}

// Hook to use the context
export function useGuestActions() {
  const context = useContext(GuestActionsContext);
  if (!context) {
    throw new Error('useGuestActions must be used within a GuestActionsProvider');
  }
  return context;
}