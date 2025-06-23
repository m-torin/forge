'use client';

import { useTheme } from 'next-themes';

export function useThemeMode() {
  const { theme, setTheme } = useTheme();

  const isDarkMode = theme === 'dark';
  const toggleDarkMode = () => setTheme(isDarkMode ? 'light' : 'dark');

  return {
    isDarkMode,
    toggleDarkMode,
    theme,
    setTheme,
  };
}

export default useThemeMode;
