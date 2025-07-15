/**
 * UI Layout and Z-Index Constants
 * Centralized system for managing layout layers, positioning, and responsive breakpoints
 */

// Apple Device Breakpoints (based on viewport widths)
export const APPLE_BREAKPOINTS = {
  // iPhone sizes
  IPHONE_SE: 375, // iPhone SE (3rd gen), iPhone 12/13 mini
  IPHONE_STANDARD: 390, // iPhone 12/13/14/15 standard
  IPHONE_PLUS: 414, // iPhone 6/7/8 Plus
  IPHONE_PRO_MAX: 428, // iPhone 12/13/14/15 Pro Max

  // iPad sizes
  IPAD_MINI: 768, // iPad mini
  IPAD_AIR: 834, // iPad Air (portrait)
  IPAD_PRO_11: 834, // iPad Pro 11" (portrait)
  IPAD_PRO_12: 1024, // iPad Pro 12.9" (portrait)
  IPAD_PRO_12_LANDSCAPE: 1366, // iPad Pro 12.9" (landscape)
} as const;

// Responsive utilities
export const RESPONSIVE = {
  // Mobile-first breakpoint classes
  MOBILE: `max-w-[${APPLE_BREAKPOINTS.IPHONE_PRO_MAX}px]`,
  TABLET: `min-w-[${APPLE_BREAKPOINTS.IPAD_MINI}px] max-w-[${APPLE_BREAKPOINTS.IPAD_PRO_12_LANDSCAPE}px]`,
  DESKTOP: `min-w-[${APPLE_BREAKPOINTS.IPAD_PRO_12_LANDSCAPE + 1}px]`,

  // Touch target sizes (Apple HIG compliant)
  TOUCH_TARGET: {
    SMALL: 'min-h-[44px] min-w-[44px]', // Minimum Apple recommends
    MEDIUM: 'min-h-[48px] min-w-[48px]', // Comfortable for most users
    LARGE: 'min-h-[56px] min-w-[56px]', // Large touch targets
  },

  // Safe area constants for modern iPhones
  SAFE_AREA: {
    TOP: 'pt-safe-top',
    BOTTOM: 'pb-safe-bottom',
    LEFT: 'pl-safe-left',
    RIGHT: 'pr-safe-right',
    INSET: 'p-safe',
  },

  // Responsive spacing system
  SPACING: {
    MOBILE: {
      XS: 'p-2 sm:p-3',
      SM: 'p-3 sm:p-4',
      MD: 'p-4 sm:p-6',
      LG: 'p-6 sm:p-8',
      XL: 'p-8 sm:p-12',
    },
    GAP: {
      XS: 'gap-2 sm:gap-3',
      SM: 'gap-3 sm:gap-4',
      MD: 'gap-4 sm:gap-6',
      LG: 'gap-6 sm:gap-8',
    },
  },

  // Responsive typography
  TYPOGRAPHY: {
    HEADING: {
      XL: 'text-2xl sm:text-3xl md:text-4xl',
      LG: 'text-xl sm:text-2xl md:text-3xl',
      MD: 'text-lg sm:text-xl md:text-2xl',
      SM: 'text-base sm:text-lg md:text-xl',
    },
    BODY: {
      LG: 'text-base sm:text-lg',
      MD: 'text-sm sm:text-base',
      SM: 'text-xs sm:text-sm',
    },
  },

  // Layout breakpoint utilities
  LAYOUT: {
    CONTAINER: 'w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    SIDEBAR_MOBILE: 'w-full sm:w-80 md:w-96',
    CONTENT_MOBILE: 'px-4 sm:px-6 md:px-8',
  },
} as const;

// Z-Index Layer System
export const Z_INDEX = {
  // Base content layers (0-10)
  BASE: 0,
  RAISED: 1,
  STICKY: 10,

  // Interactive elements (20-30)
  DROPDOWN: 20,
  TOOLTIP: 25,
  POPOVER: 30,

  // Panel layers (30-40)
  SIDEBAR: 30,
  DRAWER: 35,
  PANEL: 40,

  // Overlay layers (40-50)
  MODAL_BACKDROP: 40,
  MODAL: 45,
  ALERT: 50,

  // Critical UI (50-60)
  NOTIFICATION: 50,
  TOAST: 55,
  CRITICAL: 60,

  // Development tools (60+)
  DEBUG: 60,
  DEV_TOOLS: 70,
} as const;

// Fixed Element Positioning Grid
export const FIXED_POSITIONS = {
  TOP_LEFT: 'top-4 left-4',
  TOP_CENTER: 'top-4 left-1/2 -translate-x-1/2',
  TOP_RIGHT: 'top-4 right-4',

  MIDDLE_LEFT: 'top-1/2 left-4 -translate-y-1/2',
  MIDDLE_RIGHT: 'top-1/2 right-4 -translate-y-1/2',

  BOTTOM_LEFT: 'bottom-4 left-4',
  BOTTOM_CENTER: 'bottom-4 left-1/2 -translate-x-1/2',
  BOTTOM_RIGHT: 'bottom-4 right-4',
} as const;

// Standard Backdrop Styles
export const BACKDROP_STYLES = {
  LIGHT: 'bg-black/40',
  MEDIUM: 'bg-black/60 backdrop-blur-sm',
  HEAVY: 'bg-black/80 backdrop-blur-md',
  GLASS: 'bg-white/10 backdrop-blur-xl',
} as const;

// Standard Animation Durations (milliseconds)
export const ANIMATION = {
  FAST: 150,
  NORMAL: 200,
  SLOW: 300,
  EXTRA_SLOW: 500,
} as const;

// Tailwind Animation Classes
export const ANIMATION_CLASSES = {
  FAST: 'duration-150',
  NORMAL: 'duration-200',
  SLOW: 'duration-300',
  EXTRA_SLOW: 'duration-500',
  EASING: {
    LINEAR: 'ease-linear',
    IN: 'ease-in',
    OUT: 'ease-out',
    IN_OUT: 'ease-in-out',
  },
} as const;

// Spring Physics Constants
export const SPRING = {
  GENTLE: { type: 'spring', stiffness: 300, damping: 30 },
  BOUNCY: { type: 'spring', stiffness: 400, damping: 20 },
  SNAPPY: { type: 'spring', stiffness: 500, damping: 25 },
  WOBBLY: { type: 'spring', stiffness: 200, damping: 15 },
} as const;

// Notification Categories
export const NOTIFICATION_TYPES = {
  INFO: {
    priority: 1,
    duration: 4000,
    color: 'blue',
  },
  SUCCESS: {
    priority: 2,
    duration: 3000,
    color: 'green',
  },
  WARNING: {
    priority: 3,
    duration: 5000,
    color: 'yellow',
  },
  ERROR: {
    priority: 4,
    duration: 7000,
    color: 'red',
  },
  CRITICAL: {
    priority: 5,
    duration: 10000,
    color: 'red',
  },
} as const;

// Corner Assignment for Fixed Elements
export type CornerPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface FixedElementConfig {
  id: string;
  component: string;
  corner: CornerPosition;
  priority: number; // Lower number = higher priority
  conditional?: boolean; // Show only under certain conditions
  zIndex: keyof typeof Z_INDEX;
}

// Default fixed element configuration
export const FIXED_ELEMENTS: FixedElementConfig[] = [
  {
    id: 'prototype-indicator',
    component: 'PrototypeModeIndicator',
    corner: 'top-right',
    priority: 1,
    conditional: true,
    zIndex: 'DEV_TOOLS',
  },
  {
    id: 'network-reconnection',
    component: 'NetworkReconnectionSuccess',
    corner: 'top-right',
    priority: 2,
    conditional: true,
    zIndex: 'NOTIFICATION',
  },
  {
    id: 'quick-access',
    component: 'QuickAccessMenu',
    corner: 'bottom-right',
    priority: 1,
    conditional: false,
    zIndex: 'PANEL',
  },
  {
    id: 'feature-progress',
    component: 'FeatureProgressTracker',
    corner: 'bottom-left',
    priority: 1,
    conditional: false,
    zIndex: 'PANEL',
  },
  {
    id: 'prototype-toggle',
    component: 'PrototypeModeToggle',
    corner: 'bottom-left',
    priority: 2,
    conditional: true,
    zIndex: 'DEV_TOOLS',
  },
];

// Responsive breakpoints for layout adjustments
export const LAYOUT_BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1280,
} as const;
