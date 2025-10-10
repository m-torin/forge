"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

/**
 * Error page component for Next.js App Router error.tsx files
 * Captures errors and provides a user-friendly error page
 *
 * Usage: Use in app error.tsx files at any route level
 */
export interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error, {
      tags: {
        component: "ErrorPage",
        errorType: "page",
      },
      contexts: {
        error: {
          digest: error.digest,
        },
      },
    });
  }, [error]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "20px",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: "600px",
          width: "100%",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "48px",
            fontWeight: "bold",
            marginBottom: "16px",
            color: "#333",
          }}
        >
          Oops!
        </h1>
        <h2
          style={{
            fontSize: "24px",
            fontWeight: "normal",
            marginBottom: "24px",
            color: "#666",
          }}
        >
          Something went wrong
        </h2>
        <p
          style={{
            fontSize: "16px",
            lineHeight: "1.5",
            marginBottom: "32px",
            color: "#666",
          }}
        >
          We've been notified about this error and are working to fix it. Please
          try again or contact support if the problem persists.
        </p>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
          <button
            onClick={reset}
            style={{
              padding: "12px 24px",
              fontSize: "16px",
              backgroundColor: "#0070f3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#0051cc";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#0070f3";
            }}
          >
            Try again
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            style={{
              padding: "12px 24px",
              fontSize: "16px",
              backgroundColor: "transparent",
              color: "#0070f3",
              border: "1px solid #0070f3",
              borderRadius: "4px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#0070f3";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#0070f3";
            }}
          >
            Go home
          </button>
        </div>
        {error.digest && (
          <p
            style={{
              marginTop: "32px",
              fontSize: "12px",
              color: "#999",
            }}
          >
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Simple error page component with minimal styling
 */
export function SimpleErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
