"use server";

import { Analytics } from "@repo/analytics-legacy/emitters";

// Initialize server-side analytics
const serverAnalytics = new Analytics({
  providers: {
    googleAnalytics: {
      measurementId: process.env.GA_MEASUREMENT_ID!,
    },
    posthog: {
      apiKey: process.env.POSTHOG_API_KEY!,
      config: {
        apiHost: process.env.POSTHOG_HOST,
      },
    },
    segment: {
      config: {
        flushAt: 1, // Flush immediately on server
        flushInterval: 0,
      },
      writeKey: process.env.SEGMENT_WRITE_KEY!, // Note: not NEXT_PUBLIC_
    },
  },
  debug: process.env.NODE_ENV === "development",
  disabled: process.env.NODE_ENV === "test",
});

export async function trackEventAction(
  event: string,
  properties?: Record<string, any>,
) {
  try {
    await serverAnalytics.track(event, {
      ...properties,
      serverSide: true,
      timestamp: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to track event:", error);
    return {
      error: error instanceof Error ? error.message : "Unknown error",
      success: false,
    };
  }
}

export async function identifyGuestAction(
  guestId: string,
  traits?: Record<string, any>,
) {
  try {
    await serverAnalytics.identify(guestId, {
      ...traits,
      serverSide: true,
      lastSeen: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to identify guest:", error);
    return {
      error: error instanceof Error ? error.message : "Unknown error",
      success: false,
    };
  }
}

export async function pageViewAction(
  category: string | undefined,
  name: string,
  properties?: Record<string, any>,
) {
  try {
    await serverAnalytics.page(category, name, {
      ...properties,
      serverSide: true,
      timestamp: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to track page view:", error);
    return {
      error: error instanceof Error ? error.message : "Unknown error",
      success: false,
    };
  }
}

export async function syncGuestDataAction(guestId: string, data: any) {
  try {
    // Here you would sync to your database
    // For now, just track the sync event
    await serverAnalytics.track("Guest Data Synced", {
      dataSize: JSON.stringify(data).length,
      guestId,
      timestamp: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to sync guest data:", error);
    return {
      error: error instanceof Error ? error.message : "Unknown error",
      success: false,
    };
  }
}
