"use server";

import { createServerAnalytics, track, identify, page } from '@repo/analytics/server';

// Initialize server-side analytics
const serverAnalytics = await createServerAnalytics({
  providers: {
    segment: {
      writeKey: process.env.SEGMENT_WRITE_KEY!, // Note: not NEXT_PUBLIC_
      config: {
        flushAt: 1, // Flush immediately on server
        flushInterval: 0,
      },
    },
    posthog: {
      apiKey: process.env.POSTHOG_API_KEY!,
      config: {
        api_host: process.env.POSTHOG_HOST,
      },
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
    await serverAnalytics.emit(track(event, {
      ...properties,
      serverSide: true,
      timestamp: new Date().toISOString(),
    }));
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
    await serverAnalytics.emit(identify(guestId, {
      ...traits,
      serverSide: true,
      lastSeen: new Date().toISOString(),
    }));
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
    await serverAnalytics.emit(page(name, {
      ...properties,
      category,
      serverSide: true,
      timestamp: new Date().toISOString(),
    }));
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
    await serverAnalytics.emit(track("Guest Data Synced", {
      dataSize: JSON.stringify(data).length,
      guest_id: guestId,
      timestamp: new Date().toISOString(),
    }));
    return { success: true };
  } catch (error) {
    console.error("Failed to sync guest data:", error);
    return {
      error: error instanceof Error ? error.message : "Unknown error",
      success: false,
    };
  }
}
