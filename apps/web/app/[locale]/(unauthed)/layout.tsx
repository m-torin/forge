"use client";

import { ReactNode } from "react";

interface UnauthedLayoutProps {
  children: ReactNode;
}

/**
 * Layout for unauthenticated routes
 *
 * This layout provides a modern, styled wrapper for auth-related pages like login, signup, etc.
 * It uses a gradient background with centered content suitable for auth forms.
 */
export default function UnauthedLayout({ children }: UnauthedLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center p-2 sm:p-4">
      {/* Background decorative elements - Responsive */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 sm:-bottom-40 sm:-left-40 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-r from-pink-400 to-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-75"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-96 sm:h-96 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-150"></div>
      </div>

      {/* Content - Mobile first sizing */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md px-1 sm:px-0">
        {children}
      </div>
    </div>
  );
}
