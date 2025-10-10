/**
 * App Router integration helpers for Sentry Next.js
 */

/**
 * Generate layout.tsx code with Sentry metadata integration
 */
export function generateAppRouterLayoutCode(includeImports = true): string {
  const imports = includeImports
    ? `import * as Sentry from '@sentry/nextjs';
import type { Metadata } from 'next';

`
    : "";

  return `${imports}export function generateMetadata(): Metadata {
  return {
    // ... your existing metadata
    other: {
      ...Sentry.getTraceData(),
    }
  }
}`;
}

/**
 * Generate error.tsx code with Sentry integration
 */
export function generateErrorPageCode(): string {
  return `"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function ErrorPage({
  error,
  reset,
}: { 
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <button
        onClick={reset}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Try again
      </button>
      {error.digest && (
        <p className="mt-4 text-sm text-gray-500">Error ID: {error.digest}</p>
      )}
    </div>
  );
}`;
}

/**
 * Generate global-error.tsx code with Sentry integration
 */
export function generateGlobalErrorCode(): string {
  return `"use client";

import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";
import { useEffect } from "react";

export default function GlobalError({
  error,
}: { 
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        {/* This is the default Next.js error component. */}
        <NextError statusCode={0} />
      </body>
    </html>
  );
}`;
}

/**
 * Generate route.ts handler with Sentry error handling
 */
export function generateRouteHandlerCode(
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
): string {
  return `import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";

export async function ${method}(request: NextRequest) {
  try {
    // Your route logic here
    
    return NextResponse.json({ success: true });
  } catch (error) {
    // Capture the error with Sentry
    const eventId = Sentry.captureException(error, {
      contexts: {
        request: {
          method: "${method}",
          url: request.url,
          headers: Object.fromEntries(request.headers.entries()),
        },
      },
    });

    return NextResponse.json(
      { 
        error: "Internal Server Error",
        eventId,
      },
      { status: 500 }
    );
  }
}`;
}

/**
 * Generate server action with Sentry instrumentation
 */
export function generateServerActionCode(
  actionName = "myServerAction",
): string {
  return `"use server";

import * as Sentry from "@sentry/nextjs";
import { headers } from "next/headers";

export async function ${actionName}(formData: FormData) {
  return await Sentry.withServerActionInstrumentation(
    "${actionName}",
    {
      formData,
      headers: await headers(),
      recordResponse: true,
    },
    async () => {
      // Your server action logic here
      
      // Example: Extract form data
      const name = formData.get('name') as string;
      
      // Perform your action
      // ...
      
      return { success: true, name };
    }
  );
}`;
}

/**
 * Generate middleware.ts with Sentry integration
 */
export function generateMiddlewareCode(): string {
  return `import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export function middleware(request: NextRequest) {
  try {
    // Add Sentry trace headers to the response
    const response = NextResponse.next();
    
    // Get trace data from Sentry
    const traceData = Sentry.getTraceData();
    
    // Add trace headers to response
    Object.entries(traceData).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    return response;
  } catch (error) {
    // Log middleware errors
    Sentry.captureException(error, {
      tags: {
        location: 'middleware',
      },
    });
    
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    // Skip internal Next.js routes
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};`;
}

/**
 * Instructions for App Router Sentry integration
 */
export const APP_ROUTER_INTEGRATION_GUIDE = `
# App Router Sentry Integration Guide

## 1. Root Layout Metadata Integration

Add Sentry trace data to your root layout's metadata:

\`\`\`typescript
// app/layout.tsx
import * as Sentry from '@sentry/nextjs';
import type { Metadata } from 'next';

export function generateMetadata(): Metadata {
  return {
    title: 'My App',
    other: {
      ...Sentry.getTraceData(),
    }
  };
}
\`\`\`

## 2. Error Handling

### Error Boundary (app/error.tsx)
Handles errors in nested route segments:

\`\`\`typescript
${generateErrorPageCode()}
\`\`\`

### Global Error Boundary (app/global-error.tsx)
Handles errors in the root layout:

\`\`\`typescript
${generateGlobalErrorCode()}
\`\`\`

## 3. Server Actions

Wrap server actions with Sentry instrumentation:

\`\`\`typescript
${generateServerActionCode()}
\`\`\`

## 4. Route Handlers

Add error handling to route handlers:

\`\`\`typescript
${generateRouteHandlerCode()}
\`\`\`

## 5. Middleware Integration

Add tracing to middleware:

\`\`\`typescript
${generateMiddlewareCode()}
\`\`\`
`;
