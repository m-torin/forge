"use client";

import { AuthProvider } from "@repo/auth/client/next";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
