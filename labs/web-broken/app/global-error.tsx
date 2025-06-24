"use client";

import { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global error boundary that catches errors in the root layout
 *
 * This is the fallback when errors occur outside of specific route segments.
 * It provides minimal structure since layout context might be unavailable.
 */
export default function GlobalError({
  error,
  reset,
}: GlobalErrorProps): React.JSX.Element {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            padding: "2rem",
            textAlign: "center",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div
            style={{ fontSize: "64px", marginBottom: "1rem", color: "#fa5252" }}
          >
            ⚠️
          </div>

          <h1 style={{ color: "#fa5252", marginBottom: "0.5rem" }}>
            Application Error
          </h1>
          <p style={{ color: "#868e96", marginBottom: "2rem" }}>
            A critical error occurred. Please refresh the page.
          </p>

          <div
            style={{
              padding: "1rem",
              backgroundColor: "#fff5f5",
              border: "1px solid #ffc9c9",
              borderRadius: "8px",
              marginBottom: "2rem",
              maxWidth: "500px",
            }}
          >
            <pre
              style={{ margin: 0, fontSize: "14px", whiteSpace: "pre-wrap" }}
            >
              {error.message || "An unknown error occurred"}
            </pre>
            {error.digest && (
              <p
                style={{
                  margin: "0.5rem 0 0 0",
                  fontSize: "12px",
                  color: "#868e96",
                }}
              >
                Error ID: {error.digest}
              </p>
            )}
          </div>

          <button
            onClick={reset}
            style={{
              backgroundColor: "#228be6",
              color: "white",
              border: "none",
              padding: "0.75rem 1.5rem",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
