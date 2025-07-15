/**
 * Dark Mode Theme Provider for Better Auth Components
 * Provides theme context and utilities for all authentication components
 */

'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { ThemeContextType } from '../utils/dark-mode';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: 'light' | 'dark' | 'system';
  storageKey?: string;
  attribute?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'auth-theme',
  attribute = 'class',
  enableSystem = true,
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // Initialize theme from storage
  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      setThemeState(stored as 'light' | 'dark' | 'system');
    }
  }, [storageKey]);

  // Handle system theme changes
  useEffect(() => {
    if (!enableSystem) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      if (theme === 'system') {
        const systemTheme = mediaQuery.matches ? 'dark' : 'light';
        setResolvedTheme(systemTheme);
        updateDOM(systemTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    handleChange(); // Initial check

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, enableSystem]);

  // Update resolved theme when theme changes
  useEffect(() => {
    let resolved: 'light' | 'dark';

    if (theme === 'system' && enableSystem) {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      resolved = theme as 'light' | 'dark';
    }

    setResolvedTheme(resolved);
    updateDOM(resolved);
  }, [theme, enableSystem]);

  const updateDOM = (resolvedTheme: 'light' | 'dark') => {
    const root = document.documentElement;

    if (disableTransitionOnChange) {
      const css = document.createElement('style');
      css.appendChild(
        document.createTextNode(
          `*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}`,
        ),
      );
      document.head.appendChild(css);

      requestAnimationFrame(() => {
        document.head.removeChild(css);
      });
    }

    if (attribute === 'class') {
      root.classList.remove('light', 'dark');
      root.classList.add(resolvedTheme);
    } else {
      root.setAttribute(attribute, resolvedTheme);
    }
  };

  const setTheme = (newTheme: 'light' | 'dark' | 'system') => {
    localStorage.setItem(storageKey, newTheme);
    setThemeState(newTheme);
  };

  const value: ThemeContextType = {
    theme,
    setTheme,
    resolvedTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

/**
 * Theme Toggle Button Component
 */
interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'button' | 'switch' | 'dropdown';
}

export function ThemeToggle({ className = '', size = 'md', variant = 'button' }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Avoid hydration mismatch
  }

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSize = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  if (variant === 'button') {
    return (
      <button
        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        className={` ${sizeClasses[size]} inline-flex items-center justify-center rounded-md border border-gray-300 bg-transparent transition-colors duration-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:hover:bg-gray-800 ${className} `}
        aria-label="Toggle theme"
      >
        {resolvedTheme === 'dark' ? (
          <svg
            className={iconSize[size]}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
            />
          </svg>
        ) : (
          <svg
            className={iconSize[size]}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
            />
          </svg>
        )}
      </button>
    );
  }

  if (variant === 'switch') {
    return (
      <label className={`inline-flex cursor-pointer items-center ${className}`}>
        <input
          type="checkbox"
          checked={resolvedTheme === 'dark'}
          onChange={e => setTheme(e.target.checked ? 'dark' : 'light')}
          className="sr-only"
        />
        <div
          className={`peer relative h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800`}
        />
        <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
          {resolvedTheme === 'dark' ? 'Dark' : 'Light'} mode
        </span>
      </label>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={` ${sizeClasses[size]} inline-flex items-center justify-center rounded-md border border-gray-300 bg-transparent transition-colors duration-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:hover:bg-gray-800 ${className} `}
          aria-label="Theme options"
        >
          {resolvedTheme === 'dark' ? (
            <svg
              className={iconSize[size]}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
              />
            </svg>
          ) : (
            <svg
              className={iconSize[size]}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
              />
            </svg>
          )}
        </button>

        {isOpen && (
          <div className="absolute right-0 z-50 mt-2 w-48 rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <div className="py-1">
              {[
                { value: 'light', label: 'Light', icon: '☀️' },
                { value: 'dark', label: 'Dark', icon: '🌙' },
                { value: 'system', label: 'System', icon: '💻' },
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => {
                    setTheme(option.value as 'light' | 'dark' | 'system');
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center space-x-2 px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${theme === option.value ? 'bg-gray-100 dark:bg-gray-700' : ''} `}
                >
                  <span>{option.icon}</span>
                  <span>{option.label}</span>
                  {theme === option.value && (
                    <svg
                      className="ml-auto h-4 w-4 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}

/**
 * Pre-configured theme provider for authentication components
 */
export function AuthThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      defaultTheme="system"
      storageKey="auth-ui-theme"
      attribute="class"
      enableSystem
      disableTransitionOnChange={false}
    >
      {children}
    </ThemeProvider>
  );
}
