/**
 * Demo mode detection and utilities
 * Provides functions to check if the app is running in demo mode
 * and handle demo-specific behavior
 */
import { logWarn } from '@repo/observability';
import { env } from '#/root/env';

export const isDemoMode = (): boolean => {
  return env.DEMO_MODE === 'true';
};

export const isDemoModeClient = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.location.hostname.includes('demo') || 
         window.location.search.includes('demo=true');
};

export const getDemoConfig = () => ({
  isDemo: isDemoMode(),
  disableAuth: isDemoMode(),
  disableDatabase: isDemoMode(),
  useLocalStorage: isDemoMode(),
  suppressErrors: isDemoMode(),
  showDemoBanner: isDemoMode(),
});

export const createDemoResponse = <T>(data: T) => ({
  success: true,
  data,
  demo: true,
  message: 'Demo mode - data saved to localStorage only'
});

export const createDemoError = (message: string) => ({
  success: false,
  error: { message },
  demo: true
});

// Demo data constants
export const DEMO_FLOW_ID = 'demo-flow-001';
export const DEMO_INSTANCE_ID = env.DEMO_INSTANCE_ID;
export const DEMO_STORAGE_KEY = 'flows-demo-data';

// localStorage utilities for demo mode
export const saveDemoData = (key: string, data: any) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`${DEMO_STORAGE_KEY}-${key}`, JSON.stringify(data));
      return true;
    } catch (error) {
      logWarn('Failed to save demo data to localStorage', { error, key });
      return false;
    }
  }
  return false;
};

export const loadDemoData = <T>(key: string, defaultValue?: T): T | null => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(`${DEMO_STORAGE_KEY}-${key}`);
      return stored ? JSON.parse(stored) : defaultValue || null;
    } catch (error) {
      logWarn('Failed to load demo data from localStorage', { error, key });
      return defaultValue || null;
    }
  }
  return defaultValue || null;
};

export const clearDemoData = () => {
  if (typeof window !== 'undefined') {
    const keys = Object.keys(localStorage).filter(key => 
      key.startsWith(DEMO_STORAGE_KEY)
    );
    keys.forEach(key => localStorage.removeItem(key));
  }
};

// Auto-initialize demo data when in demo mode
export const initializeDemoModeIfNeeded = () => {
  if (isDemoModeClient() && typeof window !== 'undefined') {
    const isInitialized = localStorage.getItem('flows-demo-data-metadata');
    if (!isInitialized) {
      // Dynamic import to avoid circular dependency
      import('./demoData').then(({ initializeDemoData }) => {
        initializeDemoData();
        return true;
      }).catch((error) => {
        console.error('Failed to initialize demo data:', error);
      });
    }
  }
};