"use client";

import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";
import { useEffect } from "react";

/**
 * Global error component for Next.js App Router
 * Captures exceptions and displays error page
 *
 * Usage: Create app/global-error.tsx and export this component
 */
export interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset?: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Capture the error with Sentry
    Sentry.captureException(error, {
      tags: {
        component: "GlobalError",
        errorType: "global",
      },
      contexts: {
        error: {
          digest: error.digest,
        },
      },
    });
  }, [error]);

  return (
    <html>
      <body>
        {/* NextError is the default Next.js error page component. 
            Its type definition requires a `statusCode` prop. 
            Since App Router doesn't expose status codes for errors, 
            we pass 0 to render a generic error message. */}
        <NextError statusCode={0} />
        {reset && (
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <button
              onClick={reset}
              style={{
                padding: "10px 20px",
                fontSize: "16px",
                backgroundColor: "#0070f3",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        )}
      </body>
    </html>
  );
}
