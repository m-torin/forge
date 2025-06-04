"use client";

import { pageViewAction, trackEventAction } from "@/app/actions/analytics";
import {
  useDebouncedValue,
  useListState,
  useLocalStorage,
  useMap,
  useMediaQuery,
  useViewportSize,
} from "@mantine/hooks";
import { usePathname } from "next/navigation";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useOptimistic,
  useTransition,
} from "react";

import { Analytics } from "@repo/analytics/emitters";

// Types
export type ListType =
  | "favorites"
  | "registry"
  | "shopping"
  | "comparison"
  | "later"
  | "cart";
export type InteractionType = "view" | "click" | "hover" | "share" | "save";

interface ViewedItem {
  id: string;
  image?: string;
  price?: number;
  title?: string;
  viewedAt: Date;
}

interface SearchQuery {
  query: string;
  resultsCount?: number;
  timestamp: Date;
}

interface Interaction {
  itemId: string;
  metadata?: any;
  timestamp: Date;
  type: InteractionType;
}

interface GuestPreferences {
  currency: string;
  locale: string;
  sortPreference: string;
  viewMode: "grid" | "list";
}

// ID generator
const generateId = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

interface GuestActionsContextValue {
  guest: {
    id: string;
    isAuthenticated: boolean;
    becomeAuthenticated: (guestId: string) => Promise<void>;
  };

  lists: {
    add: (listType: ListType, itemId: string, metadata?: any) => Promise<void>;
    remove: (listType: ListType, itemId: string) => Promise<void>;
    toggle: (
      listType: ListType,
      itemId: string,
      metadata?: any,
    ) => Promise<boolean>;
    clear: (listType: ListType) => Promise<void>;
    has: (listType: ListType, itemId: string) => boolean;
    count: (listType: ListType) => number;
    items: (listType: ListType) => string[];
  };

  activity: {
    trackView: (item: ViewedItem) => void;
    trackSearch: (query: string, resultsCount?: number) => void;
    trackInteraction: (interaction: Omit<Interaction, "timestamp">) => void;
    getRecentlyViewed: (limit?: number) => ViewedItem[];
    clearHistory: () => void;
  };

  preferences: {
    set: (key: string, value: any) => void;
    get: (key: string) => any;
    reset: () => void;
  };

  analytics: {
    track: (event: string, properties?: Record<string, any>) => Promise<void>;
    page: (name?: string, properties?: Record<string, any>) => Promise<void>;
    identify: (traits?: Record<string, any>) => Promise<void>;
  };

  device: {
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    viewport: { width: number; height: number };
  };
}

const GuestActionsContext = createContext<GuestActionsContextValue | undefined>(
  undefined,
);

// Initialize analytics
const analytics = new Analytics({
  providers: {
    googleAnalytics: {
      measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!,
    },
    posthog: {
      apiKey: process.env.NEXT_PUBLIC_POSTHOG_API_KEY!,
      config: {
        apiHost: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      },
    },
    segment: {
      config: {
        flushAt: 20,
        flushInterval: 10000,
      },
      writeKey: process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY!,
    },
  },
  debug: process.env.NODE_ENV === "development",
  disabled: process.env.NODE_ENV === "test",
});

const DEFAULT_PREFERENCES = {
  currency: "USD",
  locale: "en",
  sortPreference: "featured",
  viewMode: "grid",
} as const satisfies GuestPreferences;

export function GuestActionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  // Device info
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(min-width: 769px) and (max-width: 1024px)");
  const isDesktop = useMediaQuery("(min-width: 1025px)");
  const viewport = useViewportSize();

  // Identity
  const [guestId] = useLocalStorage({
    defaultValue: generateId("guest"),
    key: "guestId",
  });

  const [authenticatedGuestId, setAuthenticatedGuestId] = useLocalStorage<
    string | null
  >({
    defaultValue: null,
    key: "authenticatedGuestId",
  });

  // List storage keys
  const listConfigs = {
    cart: "guest_cart",
    comparison: "guest_comparison",
    favorites: "guest_favorites",
    later: "guest_later",
    registry: "guest_registry",
    shopping: "guest_shopping",
  } as const satisfies Record<ListType, string>;

  // Dynamic list hooks with optimistic updates
  const listHooks = Object.entries(listConfigs).reduce(
    (acc, [type, key]) => {
      const [items, setter] = useLocalStorage<string[]>({
        defaultValue: [],
        key,
      });

      // React 19 optimistic state
      const [optimisticItems, updateOptimisticItems] = useOptimistic(
        items,
        (
          state: string[],
          {
            action,
            itemId,
          }: { action: "add" | "remove" | "clear"; itemId?: string },
        ) => {
          switch (action) {
            case "add":
              return itemId && !state.includes(itemId)
                ? [...state, itemId]
                : state;
            case "remove":
              return itemId ? state.filter((id) => id !== itemId) : state;
            case "clear":
              return [];
            default:
              return state;
          }
        },
      );

      return {
        ...acc,
        [type]: { items, optimisticItems, setter, updateOptimisticItems },
      };
    },
    {} as Record<
      ListType,
      {
        items: string[];
        setter: (value: string[]) => void;
        optimisticItems: string[];
        updateOptimisticItems: (action: {
          action: "add" | "remove" | "clear";
          itemId?: string;
        }) => void;
      }
    >,
  );

  // Activity
  const [recentlyViewed, viewHandlers] = useListState<ViewedItem>([]);
  const [searchHistory, searchHandlers] = useListState<SearchQuery>([]);
  const interactions = useMap<string, Interaction>();

  const [preferences, setPreferences] = useLocalStorage<GuestPreferences>({
    defaultValue: DEFAULT_PREFERENCES,
    key: "guest_preferences",
  });

  // Auto page tracking with server action
  useEffect(() => {
    const segments = pathname.split("/").filter(Boolean);
    const category = segments[1] || "home";
    const name = segments[segments.length - 1] || "home";

    // Use server action for better performance
    startTransition(() => {
      pageViewAction(category, name, {
        guestId,
        path: pathname,
      });
    });

    // Also track client-side for immediate feedback
    analytics
      .page(category, name, {
        url: window.location.href,
        path: pathname,
        referrer: document.referrer,
        title: document.title,
      })
      .catch(() => {});
  }, [pathname, guestId]);

  // Debounced activity save with dynamic timing
  const debounceTime = isMobile ? 2000 : isTablet ? 1500 : 1000;
  const [debouncedActivity] = useDebouncedValue(
    {
      interactions: [...interactions].slice(0, 100),
      recentlyViewed: recentlyViewed.slice(0, 50),
      searchHistory: searchHistory.slice(0, 20),
    },
    debounceTime,
  );

  useEffect(() => {
    const saveData = async () => {
      const data = JSON.stringify(debouncedActivity);
      localStorage.setItem("guest_activity", data);

      // Also sync to server when not idle
      if (!isPending) {
        startTransition(() => {
          trackEventAction("Activity Synced", {
            dataSize: data.length,
            deviceType: isMobile ? "mobile" : isTablet ? "tablet" : "desktop",
            guestId,
          });
        });
      }
    };

    saveData();
  }, [debouncedActivity, guestId, isPending, isMobile, isTablet]);

  // Load saved activity
  useEffect(() => {
    try {
      const savedActivity = localStorage.getItem("guest_activity");
      if (!savedActivity) return;

      const parsed = JSON.parse(savedActivity);

      viewHandlers.setState(
        parsed.recentlyViewed?.map((item: any) => ({
          ...item,
          viewedAt: new Date(item.viewedAt),
        })) ?? [],
      );

      searchHandlers.setState(
        parsed.searchHistory?.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        })) ?? [],
      );

      parsed.interactions?.forEach(([key, value]: [string, any]) => {
        interactions.set(key, {
          ...value,
          timestamp: new Date(value.timestamp),
        });
      });
    } catch (error) {
      console.error("Failed to load activity from storage:", error);
    }
  }, [viewHandlers, searchHandlers, interactions]);

  // List operations
  const listOperations = useMemo(
    () => ({
      add: async (listType: ListType, itemId: string, metadata?: any) => {
        const list = listHooks[listType];
        if (list.optimisticItems.includes(itemId)) return;

        // React 19 optimistic update
        list.updateOptimisticItems({ action: "add", itemId });

        try {
          // Update actual state
          startTransition(() => {
            list.setter([...list.items, itemId]);
          });

          const eventName =
            listType === "favorites"
              ? "Product Added to Wishlist"
              : `item_added_to_${listType}`;

          const eventData = {
            ...(listType === "favorites"
              ? { productId: itemId }
              : { itemId, listType }),
            ...metadata,
            device: isMobile ? "mobile" : isTablet ? "tablet" : "desktop",
            timestamp: new Date().toISOString(),
          };

          // Parallel tracking
          await Promise.all([
            trackEventAction(eventName, { ...eventData, guestId }),
            analytics.track(eventName, eventData).catch(() => {}),
          ]);
        } catch (error) {
          // Revert optimistic update on error
          list.updateOptimisticItems({ action: "remove", itemId });
          throw error;
        }
      },

      remove: async (listType: ListType, itemId: string) => {
        const list = listHooks[listType];

        // React 19 optimistic update
        list.updateOptimisticItems({ action: "remove", itemId });

        try {
          // Update actual state
          startTransition(() => {
            list.setter(list.items.filter((id) => id !== itemId));
          });

          const eventName =
            listType === "favorites"
              ? "Product Removed from Wishlist"
              : `item_removed_from_${listType}`;

          const eventData =
            listType === "favorites"
              ? { productId: itemId }
              : { itemId, listType };

          // Parallel tracking
          await Promise.all([
            trackEventAction(eventName, { ...eventData, guestId }),
            analytics.track(eventName, eventData).catch(() => {}),
          ]);
        } catch (error) {
          // Revert optimistic update on error
          list.updateOptimisticItems({ action: "add", itemId });
          throw error;
        }
      },

      toggle: async (listType: ListType, itemId: string, metadata?: any) => {
        const list = listHooks[listType];
        const has = list.optimisticItems.includes(itemId);

        // React 19 optimistic update
        list.updateOptimisticItems({ action: has ? "remove" : "add", itemId });

        try {
          // Update actual state
          startTransition(() => {
            list.setter(
              has
                ? list.items.filter((id) => id !== itemId)
                : [...list.items, itemId],
            );
          });

          const eventBase = listType === "favorites" ? "Product" : "item";
          const action = has ? "Removed from" : "Added to";
          const target = listType === "favorites" ? "Wishlist" : listType;

          const eventName =
            listType === "favorites"
              ? `${eventBase} ${action} ${target}`
              : `${eventBase}_${action.toLowerCase().replace(" ", "_")}_${target}`;

          const eventData = {
            ...(listType === "favorites"
              ? { productId: itemId }
              : { itemId, listType }),
            ...(!has && metadata),
          };

          // Parallel tracking
          await Promise.all([
            trackEventAction(eventName, { ...eventData, guestId }),
            analytics.track(eventName, eventData).catch(() => {}),
          ]);

          return !has;
        } catch (error) {
          // Revert optimistic update on error
          list.updateOptimisticItems({
            action: has ? "add" : "remove",
            itemId,
          });
          throw error;
        }
      },

      clear: async (listType: ListType) => {
        startTransition(() => {
          listHooks[listType].setter([]);
        });
      },

      has: (listType: ListType, itemId: string) =>
        listHooks[listType].optimisticItems.includes(itemId),

      count: (listType: ListType) => listHooks[listType].optimisticItems.length,

      items: (listType: ListType) => listHooks[listType].optimisticItems,
    }),
    [listHooks, analytics, guestId, startTransition, isMobile, isTablet],
  );

  // Activity operations
  const activityOperations = useMemo(
    () => ({
      trackView: (item: ViewedItem) => {
        viewHandlers.setState((prev) =>
          [item, ...prev.filter((v) => v.id !== item.id)].slice(0, 50),
        );

        // Parallel tracking
        Promise.all([
          trackEventAction("Product Viewed", {
            guestId,
            imageUrl: item.image,
            price: item.price,
            productId: item.id,
            productName: item.title,
          }),
          analytics
            .track("Product Viewed", {
              imageUrl: item.image,
              price: item.price,
              productId: item.id,
              productName: item.title,
            })
            .catch(() => {}),
        ]).catch(() => {});
      },

      trackSearch: (query: string, resultsCount?: number) => {
        searchHandlers.prepend({
          query,
          resultsCount,
          timestamp: new Date(),
        });

        if (searchHistory.length > 20) {
          searchHandlers.setState((prev) => prev.slice(0, 20));
        }

        // Parallel tracking
        Promise.all([
          trackEventAction("Products Searched", {
            guestId,
            query,
            results: resultsCount,
          }),
          analytics
            .track("Products Searched", {
              query,
              results: resultsCount,
            })
            .catch(() => {}),
        ]).catch(() => {});
      },

      trackInteraction: (interaction: Omit<Interaction, "timestamp">) => {
        interactions.set(interaction.itemId, {
          ...interaction,
          timestamp: new Date(),
        });

        const eventName =
          interaction.type === "click"
            ? "Product Clicked"
            : interaction.type === "share"
              ? "Product Shared"
              : `Product ${interaction.type.charAt(0).toUpperCase() + interaction.type.slice(1)}`;

        // Parallel tracking
        Promise.all([
          trackEventAction(eventName, {
            interactionType: interaction.type,
            productId: interaction.itemId,
            ...interaction.metadata,
            guestId,
          }),
          analytics
            .track(eventName, {
              interactionType: interaction.type,
              productId: interaction.itemId,
              ...interaction.metadata,
            })
            .catch(() => {}),
        ]).catch(() => {});
      },

      getRecentlyViewed: (limit?: number) =>
        limit ? recentlyViewed.slice(0, limit) : recentlyViewed,

      clearHistory: () => {
        viewHandlers.setState([]);
        searchHandlers.setState([]);
        interactions.clear();
      },
    }),
    [
      recentlyViewed,
      searchHistory,
      viewHandlers,
      searchHandlers,
      interactions,
      analytics,
      guestId,
    ],
  );

  // Preferences operations
  const preferencesOperations = useMemo(
    () => ({
      set: (key: string, value: any) => {
        startTransition(() => {
          setPreferences((prev) => ({ ...prev, [key]: value }));
        });

        // Fire and forget analytics
        analytics
          .track("Preference Updated", {
            preference: key,
            value,
          })
          .catch(() => {});
      },

      get: (key: string) => preferences[key as keyof GuestPreferences],

      reset: () => setPreferences(DEFAULT_PREFERENCES),
    }),
    [preferences, setPreferences],
  );

  // Analytics operations with React 19 async handling
  const analyticsOperations = useMemo(
    () => ({
      track: useCallback(
        async (event: string, properties?: Record<string, any>) => {
          const enhancedProps = {
            ...properties,
            device: {
              type: isMobile ? "mobile" : isTablet ? "tablet" : "desktop",
              viewport: { width: viewport.width, height: viewport.height },
            },
            guestId,
            timestamp: new Date().toISOString(),
          };

          // Parallel tracking for speed
          await Promise.allSettled([
            trackEventAction(event, enhancedProps),
            analytics.track(event, enhancedProps),
          ]);
        },
        [guestId, isMobile, isTablet, viewport],
      ),

      page: async (name?: string, properties?: Record<string, any>) => {
        await analytics
          .page(undefined, name, {
            ...properties,
            url: window.location.href,
            path: pathname,
            title: document.title,
          })
          .catch(() => {});
      },

      identify: async (traits?: Record<string, any>) => {
        await analytics
          .identify(guestId, {
            ...traits,
            lastSeen: new Date().toISOString(),
          })
          .catch(() => {});
      },
    }),
    [guestId, pathname, isMobile, isTablet, viewport],
  );

  const value = useMemo<GuestActionsContextValue>(
    () => ({
      activity: activityOperations,
      analytics: analyticsOperations,
      device: {
        isDesktop: isDesktop ?? true,
        isMobile: isMobile ?? false,
        isTablet: isTablet ?? false,
        viewport: { width: viewport.width, height: viewport.height },
      },
      guest: {
        id: guestId,
        becomeAuthenticated: async (guestId: string) => {
          setAuthenticatedGuestId(guestId);

          await analytics.identify(guestId, {
            isAuthenticated: true,
            previousGuestId: guestId,
          });

          await analytics.track("Authenticated", {
            guestId,
          });

          // TODO: Server sync
        },
        isAuthenticated: !!authenticatedGuestId,
      },
      lists: listOperations,
      preferences: preferencesOperations,
    }),
    [
      guestId,
      authenticatedGuestId,
      listOperations,
      activityOperations,
      preferencesOperations,
      analyticsOperations,
      isMobile,
      isTablet,
      isDesktop,
      viewport,
    ],
  );

  return (
    <GuestActionsContext.Provider value={value}>
      {children}
    </GuestActionsContext.Provider>
  );
}

export function useGuestActions(): GuestActionsContextValue {
  const context = useContext(GuestActionsContext);

  if (!context) {
    throw new Error(
      "useGuestActions must be used within a GuestActionsProvider. " +
        "Wrap your app with <GuestActionsProvider> at the root level.",
    );
  }

  return context;
}

// Hook for async guest data (when React 19 'use' is stable)
// export function useGuestData(dataPromise: Promise<any>) {
//   return use(dataPromise);
// }

// Hook for SSR-safe guest ID
export function useGuestId() {
  const { guest } = useGuestActions();
  return guest.id;
}

// Hook for checking authentication status
export function useIsAuthenticated() {
  const { guest } = useGuestActions();
  return guest.isAuthenticated;
}
