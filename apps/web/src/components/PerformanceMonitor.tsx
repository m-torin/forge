"use client";

import { useDidUpdate, useDocumentVisibility } from "@mantine/hooks";
import { type ReactNode, useEffect, useState } from "react";

// ✅ Performance monitoring using Mantine hooks
export function PerformanceMonitor({ children }: { children: ReactNode }) {
  const [longTaskCount, setLongTaskCount] = useState(0);
  const documentVisibility = useDocumentVisibility();

  // ✅ Monitor long tasks only when tab is visible to save resources
  useEffect(() => {
    if (typeof window === "undefined" || documentVisibility !== "visible")
      return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
          setLongTaskCount((prev) => prev + 1);
          // Only warn in development
          if (process.env.NODE_ENV === "development") {
            console.warn(
              `🐌 Long task detected: ${entry.duration.toFixed(2)}ms - Total: ${longTaskCount + 1}`,
            );
          }
        }
      }
    });

    try {
      observer.observe({ entryTypes: ["longtask"] });
    } catch (e) {
      // Longtask API not supported in all browsers
    }

    return () => observer.disconnect();
  }, [documentVisibility, longTaskCount]);

  // ✅ Reset counter when document becomes visible
  useDidUpdate(() => {
    if (documentVisibility === "visible") {
      setLongTaskCount(0);
    }
  }, [documentVisibility]);

  return <>{children}</>;
}
