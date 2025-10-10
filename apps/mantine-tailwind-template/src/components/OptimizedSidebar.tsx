"use client";

import { useMemo } from "react";
import { useSidebar } from "./SidebarProvider";

interface OptimizedSidebarProps {
  children: React.ReactNode;
}

// Modern React 19 optimizations
export function OptimizedSidebar({ children }: OptimizedSidebarProps) {
  const { isOpen } = useSidebar();

  // Memoize expensive operations
  const sidebarStyles = useMemo(
    () => ({
      transform: `translate3d(${isOpen ? "0" : "-100%"}, 0, 0)`,
      willChange: "transform" as const,
      containIntrinsicSize: "320px auto",
      contentVisibility: (isOpen ? "visible" : "hidden") as
        | "visible"
        | "hidden",
    }),
    [isOpen],
  );

  const containerClasses = useMemo(
    () =>
      [
        "responsive-container",
        "sidebar-transition",
        isOpen ? "sidebar-open" : "sidebar-closed",
      ]
        .filter(Boolean)
        .join(" "),
    [isOpen],
  );

  return (
    <aside
      className={containerClasses}
      style={sidebarStyles}
      role="navigation"
      aria-label="Main navigation"
      data-sidebar-state={isOpen ? "open" : "closed"}
    >
      <div className="sidebar-content">{children}</div>
    </aside>
  );
}
