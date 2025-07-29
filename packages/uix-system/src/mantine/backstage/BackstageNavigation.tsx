'use client';

import { Tabs } from '@mantine/core';
import { detectEnvironment, getAllServiceUrls } from '@repo/backstage-env';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { CSSProperties, FC } from 'react';
import { useMemo } from 'react';
import { LoadingIndicator } from './LoadingIndicator';

// Modern interface with strict typing
export interface BackstageNavigationProps {
  readonly className?: string;
  readonly 'data-testid'?: string;
}

// Type-safe constants
const VALID_TAB_VALUES = ['main', 'cms', 'authmgmt', 'workflows'] as const;
type ValidTabValue = (typeof VALID_TAB_VALUES)[number];

// Environment detection types
type EnvironmentMode = 'multizone' | 'standalone';

interface TabDetectionResult {
  readonly activeTab: ValidTabValue;
  readonly mode: EnvironmentMode;
  readonly isMultizone: boolean;
}

interface ServiceUrls {
  readonly main: string;
  readonly cms: string;
  readonly authmgmt: string;
  readonly workflows: string;
}

// Modern hook for URL generation with memoization
const useBackstageUrls = (): ServiceUrls => {
  return useMemo(() => {
    if (typeof window === 'undefined') {
      return {
        main: '',
        cms: '',
        authmgmt: '',
        workflows: '',
      } as const;
    }

    const currentEnvironment = detectEnvironment();
    const currentPort = window.location.port;
    const isMultizone = currentPort === '3300' || currentPort === '';

    if (isMultizone) {
      // Use path-based URLs for multizone routing
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      return {
        main: baseUrl,
        cms: `${baseUrl}/cms`,
        authmgmt: `${baseUrl}/authmgmt`,
        workflows: `${baseUrl}/workflows`,
      } as const;
    }

    // Fallback to service-based URLs for standalone mode
    const serviceUrls = getAllServiceUrls(currentEnvironment);
    return {
      main: serviceUrls.backstage,
      cms: serviceUrls['backstage-cms'],
      authmgmt: serviceUrls['backstage-authmgmt'],
      workflows: serviceUrls['backstage-workflows'],
    } as const;
  }, []); // Empty dependency array - URLs don't change during component lifecycle
};

// Modern hook for tab detection with comprehensive logic
const useActiveTabDetection = (pathname: string): TabDetectionResult => {
  return useMemo(() => {
    if (typeof window === 'undefined') {
      return {
        activeTab: 'main',
        mode: 'standalone',
        isMultizone: false,
      } as const;
    }

    const currentPort = window.location.port;
    const hostname = window.location.hostname;
    const fullUrl = window.location.href;

    // Enhanced multizone detection - check both port and if we're being served via rewrite
    const isMultizone =
      currentPort === '3300' ||
      currentPort === '' ||
      (fullUrl.includes('localhost:3300') && !fullUrl.includes(':330'));
    const mode: EnvironmentMode = isMultizone ? 'multizone' : 'standalone';

    let detectedTab: ValidTabValue = 'main';

    // Tab detection logic - excessive logging removed for performance

    if (isMultizone) {
      // Multizone mode: path-based detection with modern pattern matching
      detectedTab = pathname.startsWith('/cms')
        ? 'cms'
        : pathname.startsWith('/authmgmt') || pathname.startsWith('/auth')
          ? 'authmgmt'
          : pathname.startsWith('/workflows')
            ? 'workflows'
            : 'main';

      // Multizone detection complete
    } else {
      // Standalone mode: port and hostname detection
      if (hostname === 'localhost' || hostname.includes('localhost')) {
        // Development mode - port-based detection
        const portMapping: Record<string, ValidTabValue> = {
          '3301': 'cms',
          '3302': 'authmgmt',
          '3303': 'workflows',
          '3300': 'main',
        };
        detectedTab = portMapping[currentPort] ?? 'main';

        // Port-based detection complete
      } else {
        // Production/Preview mode - subdomain detection
        detectedTab =
          hostname.includes('cms') || hostname.includes('backstage-cms')
            ? 'cms'
            : hostname.includes('auth') || hostname.includes('backstage-auth')
              ? 'authmgmt'
              : hostname.includes('workflow') || hostname.includes('backstage-workflow')
                ? 'workflows'
                : 'main';

        // Production hostname detection complete
      }
    }

    // Type-safe validation
    const validTab = VALID_TAB_VALUES.includes(detectedTab) ? detectedTab : 'main';

    // Tab validation complete - fallback to main if invalid

    return {
      activeTab: validTab,
      mode,
      isMultizone,
    } as const;
  }, [pathname]); // Only re-compute when pathname changes
};

// Modern component with full TypeScript integration
export const BackstageNavigation: FC<BackstageNavigationProps> = ({
  className,
  'data-testid': testId = 'backstage-navigation',
}) => {
  const pathname = usePathname();

  // Modern hooks usage
  const { activeTab, mode } = useActiveTabDetection(pathname);
  const urls = useBackstageUrls();

  // Debug logging removed for performance - use observability logger if needed

  // Debug info generation removed for performance optimization

  // All debug logging removed for performance optimization

  // Debug indicator removed for performance

  // Memoized link styles
  const linkStyle = useMemo<CSSProperties>(
    () => ({
      textDecoration: 'none',
      color: 'inherit',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--mantine-spacing-xs)',
    }),
    [],
  );

  return (
    <Tabs
      value={activeTab}
      className={className}
      data-testid={testId}
      data-debug-active={activeTab}
      data-debug-mode={mode}
    >
      <Tabs.List variant="pills">
        <Tabs.Tab
          value="main"
          {...(activeTab === 'main' && { 'data-active': true })}
          data-testid="tab-main"
        >
          <Link href={urls.main || ('/' as any)} prefetch style={linkStyle}>
            Dashboard
            <LoadingIndicator size="xs" />
          </Link>
        </Tabs.Tab>

        <Tabs.Tab
          value="cms"
          {...(activeTab === 'cms' && { 'data-active': true })}
          data-testid="tab-cms"
        >
          <Link href={urls.cms || ('/' as any)} prefetch style={linkStyle}>
            CMS
            <LoadingIndicator size="xs" />
          </Link>
        </Tabs.Tab>

        <Tabs.Tab
          value="authmgmt"
          {...(activeTab === 'authmgmt' && { 'data-active': true })}
          data-testid="tab-authmgmt"
        >
          <Link href={urls.authmgmt || ('/' as any)} prefetch style={linkStyle}>
            Auth Management
            <LoadingIndicator size="xs" />
          </Link>
        </Tabs.Tab>

        <Tabs.Tab
          value="workflows"
          {...(activeTab === 'workflows' && { 'data-active': true })}
          data-testid="tab-workflows"
        >
          <Link href={urls.workflows || ('/' as any)} prefetch style={linkStyle}>
            Workflows
            <LoadingIndicator size="xs" />
          </Link>
        </Tabs.Tab>
      </Tabs.List>
    </Tabs>
  );
};
