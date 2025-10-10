"use client";

import { useWindowEvent } from "@mantine/hooks";
import { useEffect, useRef } from "react";

export function useBodyScrollLock(isLocked: boolean) {
  const originalStyleRef = useRef<string>("");

  // Use Mantine's useWindowEvent for touchmove handling
  useWindowEvent(
    "touchmove",
    (e: TouchEvent) => {
      if (!isLocked) return;
      if (e.touches.length > 1) return;
      e.preventDefault();
    },
    { passive: false },
  );

  useEffect(() => {
    if (!isLocked) return;

    // Store original style
    originalStyleRef.current = window.getComputedStyle(document.body).overflow;

    // Lock scroll
    document.body.style.overflow = "hidden";

    return () => {
      // Restore scroll
      document.body.style.overflow = originalStyleRef.current;
    };
  }, [isLocked]);
}
