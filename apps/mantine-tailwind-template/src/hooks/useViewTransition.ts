"use client";

import { useCallback } from "react";

interface ViewTransitionAPI {
  startViewTransition?: (callback: () => void) => {
    finished: Promise<void>;
    ready: Promise<void>;
    updateCallbackDone: Promise<void>;
  };
}

declare global {
  interface Document extends ViewTransitionAPI {}
}

export function useViewTransition() {
  const startTransition = useCallback((callback: () => void) => {
    // Check if View Transitions API is supported
    if (typeof document !== "undefined" && "startViewTransition" in document) {
      return document.startViewTransition(callback);
    } else {
      // Fallback for unsupported browsers
      callback();
      return {
        finished: Promise.resolve(),
        ready: Promise.resolve(),
        updateCallbackDone: Promise.resolve(),
      };
    }
  }, []);

  const isSupported =
    typeof document !== "undefined" && "startViewTransition" in document;

  return { startTransition, isSupported };
}
