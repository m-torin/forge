import React, { createContext, useContext, ReactNode } from 'react';
import { theme, type Theme } from '../utils/theme';

interface ThemeContextType {
  theme: Theme;
  colorMode: 'light' | 'dark';
  toggleColorMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  customTheme?: Partial<Theme>;
  initialColorMode?: 'light' | 'dark';
}

export function ThemeProvider({
  children,
  customTheme,
  initialColorMode = 'light',
}: ThemeProviderProps) {
  const [colorMode, setColorMode] = React.useState<'light' | 'dark'>(initialColorMode);

  const toggleColorMode = React.useCallback(() => {
    setColorMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const mergedTheme = React.useMemo(() => {
    if (!customTheme) return theme;
    
    return {
      ...theme,
      ...customTheme,
      colors: {
        ...theme.colors,
        ...customTheme.colors,
      },
    };
  }, [customTheme]);

  const value = React.useMemo(
    () => ({
      theme: mergedTheme,
      colorMode,
      toggleColorMode,
    }),
    [mergedTheme, colorMode, toggleColorMode]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}