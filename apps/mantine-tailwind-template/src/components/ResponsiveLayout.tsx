"use client";

import { useMediaQuery } from "@mantine/hooks";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";
import { useProgressiveEnhancement } from "../hooks/useProgressiveEnhancement";
import { useWebVitals } from "../hooks/useWebVitals";
import { FocusTrap } from "./FocusTrap";
import { useSidebar } from "./SidebarProvider";

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  auth: React.ReactNode;
}

export function ResponsiveLayout({
  children,
  sidebar,
  auth,
}: ResponsiveLayoutProps) {
  const { isOpen, close } = useSidebar();
  const isMobile = useMediaQuery("(max-width: 1023px)");
  const capabilities = useProgressiveEnhancement();

  // Lock body scroll when sidebar is open on mobile
  useBodyScrollLock(isOpen && isMobile);

  // Monitor performance metrics
  useWebVitals((metric) => {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.log("Web Vital:", metric);
    }
    // In production, send to analytics
  });

  // Determine optimal layout based on capabilities
  const useModernLayout =
    capabilities.hasContainerQueries && capabilities.hasSubgrid;
  const useAdvancedBackdrop =
    capabilities.hasBackdropFilter && capabilities.hasColorMix;
  const animationDuration = capabilities.prefersReducedMotion
    ? "0.01s"
    : "300ms";

  return (
    <>
      <div
        className={`harmony-bg-background flex min-h-screen ${useModernLayout ? "layout-grid" : ""} ${isOpen ? "sidebar-open" : "sidebar-closed"} `}
        style={{
          ["--animation-duration" as any]: animationDuration,
        }}
      >
        {/* Advanced Sidebar with Progressive Enhancement */}
        <aside
          className={`harmony-bg-surface harmony-border-r harmony-sidebar sidebar-transition fixed inset-y-0 left-0 z-50 w-80 transition-all duration-[var(--animation-duration)] ease-out will-change-transform md:w-72 lg:w-80 ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:relative ${isOpen ? "lg:translate-x-0" : "lg:-translate-x-full"} focus-within:outline-none ${
            useAdvancedBackdrop
              ? "bg-white/95 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80 dark:bg-gray-900/95 supports-[backdrop-filter]:dark:bg-gray-900/80"
              : "bg-white dark:bg-gray-900"
          } ${capabilities.hasContainerQueries ? "responsive-container" : ""} `}
          role="navigation"
          aria-label="Main navigation"
          data-enhanced={useModernLayout}
          style={{
            transform: `translate3d(${isOpen ? "0" : "-100%"}, 0, 0)`,
            containIntrinsicSize: capabilities.hasContainerQueries
              ? "320px auto"
              : undefined,
            contentVisibility: capabilities.hasContainerQueries
              ? isOpen
                ? "visible"
                : "hidden"
              : undefined,
          }}
        >
          <FocusTrap isActive={isOpen && isMobile}>{sidebar}</FocusTrap>
        </aside>

        {/* Advanced backdrop with modern CSS */}
        {isOpen && (
          <div
            className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-md transition-all duration-300 ease-out supports-[backdrop-filter]:bg-black/40 lg:hidden ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"} `}
            onClick={close}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                close();
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Close navigation"
            style={{
              backdropFilter: "blur(12px) saturate(1.8)",
              WebkitBackdropFilter: "blur(12px) saturate(1.8)",
            }}
          />
        )}

        {/* Main Content - Optimized with modern CSS */}
        <main
          className={`harmony-bg-background min-w-0 flex-1 transition-all duration-300 ease-out will-change-transform ${isOpen ? "md:ml-72 lg:ml-80" : "md:ml-0 lg:ml-0"} `}
          style={{
            contain: "layout style paint",
            contentVisibility: "auto",
          }}
        >
          <div
            className="harmony-bg-surface min-h-screen overflow-x-hidden"
            style={{
              contain: "layout style",
              overscrollBehavior: "contain",
            }}
          >
            {children}
          </div>
        </main>
      </div>
      {auth}
    </>
  );
}
