import { cookies } from 'next/headers';

import { auth } from '#/app/(auth)/auth';
import { AppSidebar } from '#/components/app-sidebar';
import { QuickAccessProvider } from '#/components/context/quick-access-context';
import { DataStreamProvider } from '#/components/data-stream-provider';
import { KeyboardNavigationInitializer } from '#/components/keyboard-navigation-initializer';
import { McpNotifications } from '#/components/mcp/notifications';
import { SidebarInset, SidebarProvider } from '#/components/ui/sidebar';
import Script from 'next/script';

/**
 * Enable experimental Partial Prerendering
 */
export const experimental_ppr = true;

/**
 * Chat layout component with sidebar and data providers
 * @param children - Child components to render
 */
export default async function Layout({ children }: { children: React.ReactNode }) {
  const [session, cookieStore] = await Promise.all([auth(), cookies()]);
  const isCollapsed = cookieStore.get('sidebar:state')?.value !== 'true';

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
        strategy="beforeInteractive"
      />
      <DataStreamProvider>
        <QuickAccessProvider>
          <McpNotifications showConnectionChanges showFeatureUpdates showErrorNotifications />
          <SidebarProvider defaultOpen={!isCollapsed}>
            <AppSidebar user={session?.user} />
            <SidebarInset className="mobile-viewport">
              <KeyboardNavigationInitializer />
              {children}
            </SidebarInset>
          </SidebarProvider>
        </QuickAccessProvider>
      </DataStreamProvider>
    </>
  );
}
