/**
 * Dark Mode Utilities for Better Auth Components
 * Provides consistent dark mode support across all components
 */

export interface DarkModeClasses {
  background: string;
  text: string;
  border: string;
  hover: string;
  focus: string;
  disabled: string;
}

export interface DarkModeVariants {
  card: DarkModeClasses;
  input: DarkModeClasses;
  button: {
    primary: DarkModeClasses;
    secondary: DarkModeClasses;
    outline: DarkModeClasses;
    destructive: DarkModeClasses;
    ghost: DarkModeClasses;
  };
  alert: {
    default: DarkModeClasses;
    destructive: DarkModeClasses;
    success: DarkModeClasses;
    warning: DarkModeClasses;
  };
  status: {
    active: DarkModeClasses;
    pending: DarkModeClasses;
    completed: DarkModeClasses;
    error: DarkModeClasses;
    expired: DarkModeClasses;
  };
}

/**
 * Comprehensive dark mode class mappings
 */
export const darkModeVariants: DarkModeVariants = {
  card: {
    background: 'dark:bg-gray-800 dark:border-gray-700',
    text: 'dark:text-gray-100',
    border: 'dark:border-gray-700',
    hover: 'dark:hover:bg-gray-700',
    focus: 'dark:focus:ring-gray-600',
    disabled: 'dark:disabled:bg-gray-700 dark:disabled:text-gray-400',
  },
  input: {
    background: 'dark:bg-gray-700 dark:border-gray-600',
    text: 'dark:text-gray-100 dark:placeholder-gray-400',
    border: 'dark:border-gray-600',
    hover: 'dark:hover:border-gray-500',
    focus: 'dark:focus:ring-blue-500 dark:focus:border-blue-500',
    disabled: 'dark:disabled:bg-gray-800 dark:disabled:text-gray-500',
  },
  button: {
    primary: {
      background: 'dark:bg-blue-600 dark:hover:bg-blue-700',
      text: 'dark:text-white',
      border: 'dark:border-blue-600',
      hover: 'dark:hover:bg-blue-700',
      focus: 'dark:focus:ring-blue-500',
      disabled: 'dark:disabled:bg-gray-600 dark:disabled:text-gray-400',
    },
    secondary: {
      background: 'dark:bg-gray-600 dark:hover:bg-gray-700',
      text: 'dark:text-gray-100',
      border: 'dark:border-gray-600',
      hover: 'dark:hover:bg-gray-700',
      focus: 'dark:focus:ring-gray-500',
      disabled: 'dark:disabled:bg-gray-700 dark:disabled:text-gray-500',
    },
    outline: {
      background: 'dark:bg-transparent dark:hover:bg-gray-700',
      text: 'dark:text-gray-300 dark:hover:text-gray-100',
      border: 'dark:border-gray-600 dark:hover:border-gray-500',
      hover: 'dark:hover:bg-gray-700 dark:hover:border-gray-500',
      focus: 'dark:focus:ring-gray-500',
      disabled: 'dark:disabled:border-gray-700 dark:disabled:text-gray-500',
    },
    destructive: {
      background: 'dark:bg-red-600 dark:hover:bg-red-700',
      text: 'dark:text-white',
      border: 'dark:border-red-600',
      hover: 'dark:hover:bg-red-700',
      focus: 'dark:focus:ring-red-500',
      disabled: 'dark:disabled:bg-gray-600 dark:disabled:text-gray-400',
    },
    ghost: {
      background: 'dark:bg-transparent dark:hover:bg-gray-700',
      text: 'dark:text-gray-300 dark:hover:text-gray-100',
      border: 'dark:border-transparent',
      hover: 'dark:hover:bg-gray-700',
      focus: 'dark:focus:ring-gray-500',
      disabled: 'dark:disabled:text-gray-500',
    },
  },
  alert: {
    default: {
      background: 'dark:bg-blue-900/20 dark:border-blue-800',
      text: 'dark:text-blue-200',
      border: 'dark:border-blue-800',
      hover: '',
      focus: '',
      disabled: '',
    },
    destructive: {
      background: 'dark:bg-red-900/20 dark:border-red-800',
      text: 'dark:text-red-200',
      border: 'dark:border-red-800',
      hover: '',
      focus: '',
      disabled: '',
    },
    success: {
      background: 'dark:bg-green-900/20 dark:border-green-800',
      text: 'dark:text-green-200',
      border: 'dark:border-green-800',
      hover: '',
      focus: '',
      disabled: '',
    },
    warning: {
      background: 'dark:bg-yellow-900/20 dark:border-yellow-800',
      text: 'dark:text-yellow-200',
      border: 'dark:border-yellow-800',
      hover: '',
      focus: '',
      disabled: '',
    },
  },
  status: {
    active: {
      background: 'dark:bg-green-900 dark:text-green-200',
      text: 'dark:text-green-200',
      border: 'dark:border-green-800',
      hover: '',
      focus: '',
      disabled: '',
    },
    pending: {
      background: 'dark:bg-yellow-900 dark:text-yellow-200',
      text: 'dark:text-yellow-200',
      border: 'dark:border-yellow-800',
      hover: '',
      focus: '',
      disabled: '',
    },
    completed: {
      background: 'dark:bg-green-900 dark:text-green-200',
      text: 'dark:text-green-200',
      border: 'dark:border-green-800',
      hover: '',
      focus: '',
      disabled: '',
    },
    error: {
      background: 'dark:bg-red-900 dark:text-red-200',
      text: 'dark:text-red-200',
      border: 'dark:border-red-800',
      hover: '',
      focus: '',
      disabled: '',
    },
    expired: {
      background: 'dark:bg-gray-800 dark:text-gray-300',
      text: 'dark:text-gray-300',
      border: 'dark:border-gray-700',
      hover: '',
      focus: '',
      disabled: '',
    },
  },
};

/**
 * Utility function to combine light and dark mode classes
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Get dark mode classes for a specific component variant
 */
export function getDarkModeClasses(component: keyof DarkModeVariants, variant?: string): string {
  const componentClasses = darkModeVariants[component];

  if (typeof componentClasses === 'object' && 'background' in componentClasses) {
    // Simple component (card, input)
    const classes = componentClasses as DarkModeClasses;
    return cn(
      classes.background,
      classes.text,
      classes.border,
      classes.hover,
      classes.focus,
      classes.disabled,
    );
  } else if (variant && componentClasses[variant as keyof typeof componentClasses]) {
    // Complex component with variants (button, alert, status)
    const variantClasses = componentClasses[
      variant as keyof typeof componentClasses
    ] as DarkModeClasses;
    return cn(
      variantClasses.background,
      variantClasses.text,
      variantClasses.border,
      variantClasses.hover,
      variantClasses.focus,
      variantClasses.disabled,
    );
  }

  return '';
}

/**
 * Enhanced class names for specific component combinations
 */
export const darkModeHelpers = {
  // Page/Container backgrounds
  pageBackground: 'dark:bg-gray-900',
  containerBackground: 'dark:bg-gray-800',

  // Text variants
  primaryText: 'dark:text-gray-100',
  secondaryText: 'dark:text-gray-300',
  mutedText: 'dark:text-gray-500',
  accentText: 'dark:text-blue-400',

  // Border variants
  defaultBorder: 'dark:border-gray-700',
  lightBorder: 'dark:border-gray-600',
  accentBorder: 'dark:border-blue-600',

  // Interactive elements
  hover: 'dark:hover:bg-gray-700',
  focus: 'dark:focus:ring-gray-500',
  active: 'dark:active:bg-gray-600',

  // Status indicators
  online: 'dark:text-green-400',
  offline: 'dark:text-gray-500',
  warning: 'dark:text-yellow-400',
  error: 'dark:text-red-400',

  // Icon colors
  iconPrimary: 'dark:text-gray-400',
  iconSecondary: 'dark:text-gray-500',
  iconAccent: 'dark:text-blue-400',

  // Form elements
  formBackground: 'dark:bg-gray-700',
  formBorder: 'dark:border-gray-600',
  formText: 'dark:text-gray-100',
  formPlaceholder: 'dark:placeholder-gray-400',

  // Special backgrounds
  informationBg: 'dark:bg-blue-900/20',
  successBg: 'dark:bg-green-900/20',
  warningBg: 'dark:bg-yellow-900/20',
  errorBg: 'dark:bg-red-900/20',
};

/**
 * Generate responsive dark mode classes
 */
export function generateDarkModeClass(baseClass: string): string {
  // Convert light mode classes to dark mode equivalents
  const darkModeMap: Record<string, string> = {
    // Backgrounds
    'bg-white': 'dark:bg-gray-800',
    'bg-gray-50': 'dark:bg-gray-700',
    'bg-gray-100': 'dark:bg-gray-600',
    'bg-gray-200': 'dark:bg-gray-500',

    // Text colors
    'text-gray-900': 'dark:text-gray-100',
    'text-gray-800': 'dark:text-gray-200',
    'text-gray-700': 'dark:text-gray-300',
    'text-gray-600': 'dark:text-gray-400',
    'text-gray-500': 'dark:text-gray-500',

    // Borders
    'border-gray-300': 'dark:border-gray-600',
    'border-gray-200': 'dark:border-gray-700',
    'border-gray-100': 'dark:border-gray-800',

    // Status colors - maintain visibility in dark mode
    'text-blue-600': 'dark:text-blue-400',
    'text-green-600': 'dark:text-green-400',
    'text-red-600': 'dark:text-red-400',
    'text-yellow-600': 'dark:text-yellow-400',

    'bg-blue-100': 'dark:bg-blue-900/20',
    'bg-green-100': 'dark:bg-green-900/20',
    'bg-red-100': 'dark:bg-red-900/20',
    'bg-yellow-100': 'dark:bg-yellow-900/20',
  };

  const words = baseClass.split(' ');
  const darkWords = words.map(word => darkModeMap[word] || '').filter(Boolean);

  return darkWords.join(' ');
}

/**
 * Theme context provider utilities
 */
export interface ThemeContextType {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  resolvedTheme: 'light' | 'dark';
}

/**
 * Helper to determine if current theme is dark
 */
export function isDarkMode(theme: ThemeContextType['resolvedTheme']): boolean {
  return theme === 'dark';
}

/**
 * Generate theme-aware classes
 */
export function themeAware(
  lightClasses: string,
  darkClasses: string,
  theme?: ThemeContextType['resolvedTheme'],
): string {
  if (theme === 'dark') {
    return `${lightClasses} ${darkClasses}`;
  }
  return lightClasses;
}
