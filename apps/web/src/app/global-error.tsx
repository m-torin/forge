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
            backgroundColor: "#f8f9fa",
          }}
        >
          <div
            style={{
              fontSize: "64px",
              marginBottom: "1rem",
              color: "#fa5252",
            }}
          >
            ⚠️
          </div>

          <h1
            style={{
              color: "#fa5252",
              marginBottom: "0.5rem",
              fontSize: "2rem",
              fontWeight: "bold",
            }}
          >
            Application Error
          </h1>

          <p
            style={{
              color: "#868e96",
              marginBottom: "2rem",
              fontSize: "1.1rem",
              maxWidth: "500px",
              lineHeight: "1.5",
            }}
          >
            A critical error occurred. The application is trying to recover
            automatically.
          </p>

          <div
            style={{
              padding: "1rem 1.5rem",
              backgroundColor: "#fff5f5",
              border: "1px solid #ffc9c9",
              borderRadius: "8px",
              marginBottom: "2rem",
              maxWidth: "600px",
              textAlign: "left",
            }}
          >
            <h3
              style={{
                margin: "0 0 0.5rem 0",
                fontSize: "1rem",
                color: "#e03131",
              }}
            >
              Error Details
            </h3>
            <pre
              style={{
                margin: 0,
                fontSize: "14px",
                whiteSpace: "pre-wrap",
                color: "#495057",
              }}
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

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
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
                fontWeight: "500",
              }}
            >
              Try again
            </button>

            <button
              onClick={() => (window.location.href = "/")}
              style={{
                backgroundColor: "transparent",
                color: "#228be6",
                border: "1px solid #228be6",
                padding: "0.75rem 1.5rem",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "500",
              }}
            >
              Go to homepage
            </button>
          </div>

          <p
            style={{
              fontSize: "12px",
              color: "#adb5bd",
              marginTop: "2rem",
              maxWidth: "500px",
            }}
          >
            If this error persists, please refresh the page or contact support.
            Your data is safe and the application will continue to work normally
            once this issue is resolved.
          </p>
        </div>
      </body>
    </html>
  );
}
