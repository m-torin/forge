'use client';

import { em, px, useMantineTheme } from '@mantine/core';
import { useMediaQuery, useViewportSize } from '@mantine/hooks';

// Convenience hook for responsive behavior using Mantine 8
export function useResponsive() {
  const theme = useMantineTheme();
  const { width, height } = useViewportSize();

  // Using Mantine's breakpoint values with em() helper
  const isMobile = useMediaQuery(`(max-width: ${em(theme.breakpoints.sm)})`, true, {
    getInitialValueInEffect: false,
  });
  const isTablet = useMediaQuery(
    `(min-width: ${em(theme.breakpoints.sm)}) and (max-width: ${em(theme.breakpoints.md)})`,
    false,
    { getInitialValueInEffect: false },
  );
  const isDesktop = useMediaQuery(`(min-width: ${em(theme.breakpoints.lg)})`, false, {
    getInitialValueInEffect: false,
  });

  return {
    viewport: { width, height },
    isMobile,
    isTablet,
    isDesktop,
    isLaptop: !isMobile && !isTablet && !isDesktop,
  };
}

// Hook for responsive grid layouts
export function useResponsiveGrid() {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const columns = isMobile ? 1 : isTablet ? 2 : isDesktop ? 4 : 3;
  const gap = isMobile ? 16 : isTablet ? 20 : 24;

  // Calculate items per page based on viewport
  const itemsPerPage = columns * (isMobile ? 6 : isTablet ? 4 : 3);

  return {
    gridClass: `grid grid-cols-${columns} gap-${gap}px`,
    columns,
    gap,
    itemsPerPage,
  };
}

// Hook for responsive product loading
export function useResponsiveProductLoad() {
  const { isMobile, isTablet } = useResponsive();

  // Default to grid view (can be enhanced with state management later)
  const isGridView = true;

  const productsPerRow = isMobile ? 1 : isTablet ? (isGridView ? 2 : 1) : isGridView ? 4 : 2;

  const initialLoadCount = productsPerRow * 3; // Load 3 rows initially
  const loadMoreCount = productsPerRow * 2; // Load 2 more rows on scroll

  return {
    isGridView,
    initialLoadCount,
    loadMoreCount,
    productsPerRow,
  };
}

// Hook for responsive image sizes
export function useResponsiveImage() {
  const { isMobile, isTablet } = useResponsive();

  const getImageSize = (base: number) => {
    if (isMobile) return base * 0.75;
    if (isTablet) return base * 0.85;
    return base;
  };

  const getSizes = () => {
    if (isMobile) return '100vw';
    if (isTablet) return '50vw';
    return '25vw';
  };

  return {
    getImageSize,
    getSizes,
    priority: isMobile ? false : true,
    quality: isMobile ? 75 : 90,
  };
}
