'use client';

import React, { createContext, useContext, useEffect, useReducer, useCallback, useMemo } from 'react';
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

interface GuestIdentity {
  guestId: string;
  userId?: string;
  sessionId: string;
  isAuthenticated: boolean;
}

interface GuestLists {
  favorites: Set<string>;
  registry: Set<string>;
  shopping: Set<string>;
  comparison: Set<string>;
  later: Set<string>;
  cart: Set<string>;
}

interface GuestActivity {
  recentlyViewed: ViewedItem[];
  searchHistory: SearchQuery[];
  interactions: Map<string, Interaction>;
}

interface GuestPreferences {
  currency: string;
  locale: string;
  viewMode: 'grid' | 'list';
  sortPreference: string;
  filterPresets: Map<string, any>;
}

interface GuestSession {
  startedAt: Date;
  lastActiveAt: Date;
  deviceFingerprint: string;
  referrer?: string;
}

interface GuestActionsState {
  identity: GuestIdentity;
  lists: GuestLists;
  activity: GuestActivity;
  preferences: GuestPreferences;
  session: GuestSession;
}

// Action Types
type GuestAction =
  | { type: 'ADD_TO_LIST'; listType: ListType; itemId: string; metadata?: any }
  | { type: 'REMOVE_FROM_LIST'; listType: ListType; itemId: string }
  | { type: 'TOGGLE_LIST_ITEM'; listType: ListType; itemId: string }
  | { type: 'CLEAR_LIST'; listType: ListType }
  | { type: 'TRACK_VIEW'; item: ViewedItem }
  | { type: 'TRACK_SEARCH'; query: string; resultsCount?: number }
  | { type: 'TRACK_INTERACTION'; interaction: Interaction }
  | { type: 'SET_PREFERENCE'; key: string; value: any }
  | { type: 'BECOME_USER'; userId: string }
  | { type: 'SYNC_FROM_STORAGE'; state: Partial<GuestActionsState> }
  | { type: 'CLEAR_ALL_DATA' }
  | { type: 'CLEAR_ACTIVITY_HISTORY' }
  | { type: 'RESET_PREFERENCES' };

// Helper functions
function generateGuestId(): string {
  return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getDeviceFingerprint(): string {
  // Simple fingerprint - in production, use a proper library
  const screen = `${window.screen.width}x${window.screen.height}`;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return `${navigator.userAgent}_${screen}_${timezone}`;
}

// Initial state
function getInitialState(): GuestActionsState {
  const savedGuestId = typeof window !== 'undefined' ? localStorage.getItem('guestId') : null;
  const guestId = savedGuestId || generateGuestId();
  
  if (!savedGuestId && typeof window !== 'undefined') {
    localStorage.setItem('guestId', guestId);
  }

  return {
    identity: {
      guestId,
      sessionId: generateSessionId(),
      isAuthenticated: false,
    },
    lists: {
      favorites: new Set(),
      registry: new Set(),
      shopping: new Set(),
      comparison: new Set(),
      later: new Set(),
      cart: new Set(),
    },
    activity: {
      recentlyViewed: [],
      searchHistory: [],
      interactions: new Map(),
    },
    preferences: {
      currency: 'USD',
      locale: 'en',
      viewMode: 'grid',
      sortPreference: 'featured',
      filterPresets: new Map(),
    },
    session: {
      startedAt: new Date(),
      lastActiveAt: new Date(),
      deviceFingerprint: typeof window !== 'undefined' ? getDeviceFingerprint() : '',
      referrer: typeof document !== 'undefined' ? document.referrer : undefined,
    },
  };
}

// Reducer
function guestActionsReducer(state: GuestActionsState, action: GuestAction): GuestActionsState {
  switch (action.type) {
    case 'ADD_TO_LIST': {
      const newLists = { ...state.lists };
      newLists[action.listType] = new Set(newLists[action.listType]).add(action.itemId);
      return { ...state, lists: newLists };
    }

    case 'REMOVE_FROM_LIST': {
      const newLists = { ...state.lists };
      const newSet = new Set(newLists[action.listType]);
      newSet.delete(action.itemId);
      newLists[action.listType] = newSet;
      return { ...state, lists: newLists };
    }

    case 'TOGGLE_LIST_ITEM': {
      const newLists = { ...state.lists };
      const newSet = new Set(newLists[action.listType]);
      if (newSet.has(action.itemId)) {
        newSet.delete(action.itemId);
      } else {
        newSet.add(action.itemId);
      }
      newLists[action.listType] = newSet;
      return { ...state, lists: newLists };
    }

    case 'CLEAR_LIST': {
      const newLists = { ...state.lists };
      newLists[action.listType] = new Set();
      return { ...state, lists: newLists };
    }

    case 'TRACK_VIEW': {
      const newActivity = { ...state.activity };
      // Keep only last 50 items
      newActivity.recentlyViewed = [
        action.item,
        ...state.activity.recentlyViewed.filter(item => item.id !== action.item.id)
      ].slice(0, 50);
      return { ...state, activity: newActivity };
    }

    case 'TRACK_SEARCH': {
      const newActivity = { ...state.activity };
      newActivity.searchHistory = [
        { query: action.query, timestamp: new Date(), resultsCount: action.resultsCount },
        ...state.activity.searchHistory
      ].slice(0, 20); // Keep last 20 searches
      return { ...state, activity: newActivity };
    }

    case 'TRACK_INTERACTION': {
      const newActivity = { ...state.activity };
      newActivity.interactions.set(action.interaction.itemId, action.interaction);
      return { ...state, activity: newActivity };
    }

    case 'SET_PREFERENCE': {
      const newPreferences = { ...state.preferences };
      if (action.key === 'filterPresets') {
        newPreferences.filterPresets = new Map(newPreferences.filterPresets).set(action.value.name, action.value.filters);
      } else {
        (newPreferences as any)[action.key] = action.value;
      }
      return { ...state, preferences: newPreferences };
    }

    case 'BECOME_USER': {
      return {
        ...state,
        identity: {
          ...state.identity,
          userId: action.userId,
          isAuthenticated: true,
        },
      };
    }

    case 'SYNC_FROM_STORAGE': {
      // Merge storage state with current state
      const merged: GuestActionsState = {
        ...state,
        ...action.state,
        lists: {
          ...state.lists,
          ...(action.state.lists ? {
            favorites: new Set(action.state.lists.favorites),
            registry: new Set(action.state.lists.registry),
            shopping: new Set(action.state.lists.shopping),
            comparison: new Set(action.state.lists.comparison),
            later: new Set(action.state.lists.later),
            cart: new Set(action.state.lists.cart),
          } : {}),
        },
      };
      return merged;
    }

    case 'CLEAR_ALL_DATA': {
      return getInitialState();
    }

    case 'CLEAR_ACTIVITY_HISTORY': {
      return {
        ...state,
        activity: {
          recentlyViewed: [],
          searchHistory: [],
          interactions: new Map(),
        },
      };
    }

    case 'RESET_PREFERENCES': {
      const initial = getInitialState();
      return {
        ...state,
        preferences: initial.preferences,
      };
    }

    default:
      return state;
  }
}

// Context value interface
interface GuestActionsContextValue {
  state: GuestActionsState;
  
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
    toggle: (listType: ListType, itemId: string) => Promise<boolean>;
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

// Storage keys
const STORAGE_KEYS = {
  lists: 'guest_lists',
  preferences: 'guest_preferences',
  activity: 'guest_activity',
};

// Provider component
export function GuestActionsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(guestActionsReducer, getInitialState());

  // Load from localStorage on mount
  useEffect(() => {
    const loadFromStorage = () => {
      try {
        const listsData = localStorage.getItem(STORAGE_KEYS.lists);
        const prefsData = localStorage.getItem(STORAGE_KEYS.preferences);
        const activityData = localStorage.getItem(STORAGE_KEYS.activity);

        const storageState: Partial<GuestActionsState> = {};

        if (listsData) {
          const parsed = JSON.parse(listsData);
          storageState.lists = {
            favorites: new Set(parsed.favorites || []),
            registry: new Set(parsed.registry || []),
            shopping: new Set(parsed.shopping || []),
            comparison: new Set(parsed.comparison || []),
            later: new Set(parsed.later || []),
            cart: new Set(parsed.cart || []),
          };
        }

        if (prefsData) {
          storageState.preferences = JSON.parse(prefsData);
        }

        if (activityData) {
          const parsed = JSON.parse(activityData);
          storageState.activity = {
            recentlyViewed: parsed.recentlyViewed || [],
            searchHistory: parsed.searchHistory || [],
            interactions: new Map(parsed.interactions || []),
          };
        }

        if (Object.keys(storageState).length > 0) {
          dispatch({ type: 'SYNC_FROM_STORAGE', state: storageState });
        }
      } catch (error) {
        console.error('Failed to load guest data from storage:', error);
      }
    };

    loadFromStorage();
  }, []);

  // Save to localStorage on state changes
  useEffect(() => {
    const saveToStorage = () => {
      try {
        // Save lists
        const listsData = {
          favorites: Array.from(state.lists.favorites),
          registry: Array.from(state.lists.registry),
          shopping: Array.from(state.lists.shopping),
          comparison: Array.from(state.lists.comparison),
          later: Array.from(state.lists.later),
          cart: Array.from(state.lists.cart),
        };
        localStorage.setItem(STORAGE_KEYS.lists, JSON.stringify(listsData));

        // Save preferences
        localStorage.setItem(STORAGE_KEYS.preferences, JSON.stringify(state.preferences));

        // Save activity (limited)
        const activityData = {
          recentlyViewed: state.activity.recentlyViewed.slice(0, 20),
          searchHistory: state.activity.searchHistory.slice(0, 10),
          interactions: Array.from(state.activity.interactions.entries()).slice(0, 50),
        };
        localStorage.setItem(STORAGE_KEYS.activity, JSON.stringify(activityData));
      } catch (error) {
        console.error('Failed to save guest data to storage:', error);
      }
    };

    saveToStorage();
  }, [state.lists, state.preferences, state.activity]);

  // Context value
  const value = useMemo<GuestActionsContextValue>(() => ({
    state,

    guest: {
      id: state.identity.guestId,
      isAuthenticated: state.identity.isAuthenticated,
      becomeUser: async (userId: string) => {
        dispatch({ type: 'BECOME_USER', userId });
        // Here you would sync to server
      },
    },

    lists: {
      add: async (listType: ListType, itemId: string, metadata?: any) => {
        dispatch({ type: 'ADD_TO_LIST', listType, itemId, metadata });
        
        // Analytics - use standard event names for favorites/wishlist
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
      },
      
      remove: async (listType: ListType, itemId: string) => {
        dispatch({ type: 'REMOVE_FROM_LIST', listType, itemId });
        
        // Analytics - use standard event names for favorites/wishlist
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
      
      toggle: async (listType: ListType, itemId: string) => {
        const has = state.lists[listType].has(itemId);
        dispatch({ type: 'TOGGLE_LIST_ITEM', listType, itemId });
        
        // Analytics - use standard event names for favorites/wishlist
        if (listType === 'favorites') {
          analytics.track(has ? 'Product Removed from Wishlist' : 'Product Added to Wishlist', {
            productId: itemId,
          }).catch(() => {});
        } else {
          analytics.track(has ? `item_removed_from_${listType}` : `item_added_to_${listType}`, {
            itemId,
            listType,
          }).catch(() => {});
        }
        
        return !has;
      },
      
      clear: async (listType: ListType) => {
        dispatch({ type: 'CLEAR_LIST', listType });
      },
      
      has: (listType: ListType, itemId: string) => {
        return state.lists[listType].has(itemId);
      },
      
      count: (listType: ListType) => {
        return state.lists[listType].size;
      },
      
      items: (listType: ListType) => {
        return Array.from(state.lists[listType]);
      },
    },

    activity: {
      trackView: (item: ViewedItem) => {
        dispatch({ type: 'TRACK_VIEW', item });
      },
      
      trackSearch: (query: string, resultsCount?: number) => {
        dispatch({ type: 'TRACK_SEARCH', query, resultsCount });
      },
      
      trackInteraction: (interaction: Omit<Interaction, 'timestamp'>) => {
        dispatch({ 
          type: 'TRACK_INTERACTION', 
          interaction: { ...interaction, timestamp: new Date() } 
        });
      },
      
      getRecentlyViewed: (limit?: number) => {
        return limit ? state.activity.recentlyViewed.slice(0, limit) : state.activity.recentlyViewed;
      },
      
      clearHistory: () => {
        dispatch({ type: 'CLEAR_ACTIVITY_HISTORY' });
      },
    },

    preferences: {
      set: (key: string, value: any) => {
        dispatch({ type: 'SET_PREFERENCE', key, value });
      },
      
      get: (key: string) => {
        return (state.preferences as any)[key];
      },
      
      reset: () => {
        dispatch({ type: 'RESET_PREFERENCES' });
      },
    },
  }), [state]);

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