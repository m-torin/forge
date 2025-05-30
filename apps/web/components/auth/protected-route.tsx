import type React from "react";

export default function ProtectedRoute({
  children,
  locale: _locale,
}: {
  children: React.ReactNode;
  locale?: string;
}) {
  return children;
}
