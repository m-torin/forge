/**
 * SkeletonWrapper - A helper component that conditionally renders skeleton states
 * 
 * This component provides a consistent pattern for showing loading skeletons
 * while data is being fetched. It can be used as a wrapper around any component.
 */

import { type ReactNode, useEffect, useState } from "react";

interface SkeletonWrapperProps {
  children: ReactNode;
  className?: string;
  fallback?: ReactNode;
  isLoading: boolean;
  skeleton: ReactNode;
}

export function SkeletonWrapper({
  children,
  className = "",
  fallback = null,
  isLoading,
  skeleton,
}: SkeletonWrapperProps) {
  if (isLoading) {
    return <div className={className}>{skeleton}</div>;
  }

  if (!children && fallback) {
    return <div className={className}>{fallback}</div>;
  }

  return <div className={className}>{children}</div>;
}

/**
 * Hook for managing loading states with optional timeout
 */
export function useLoadingState(initialLoading = true, timeout?: number) {
  const [isLoading, setIsLoading] = useState(initialLoading);

  useEffect(() => {
    if (timeout && isLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, timeout);

      return () => clearTimeout(timer);
    }
  }, [isLoading, timeout]);

  return [isLoading, setIsLoading] as const;
}

// Export common skeleton patterns for easy reuse
export { default as Skeletons } from "./LoadingSkeletons";