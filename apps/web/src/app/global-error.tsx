"use client";

import NextError from "next/error";
import { useEffect } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    try {
      // Try to use observability if available
      const { useObservability } = require("@repo/observability/client/next");
      const observability = useObservability();
      
      if (observability) {
        observability.captureException(error);
      } else {
        console.error('Global error (no observability instance):', error);
      }
    } catch (observabilityError) {
      // Fallback if observability is not available or provider is missing
      console.error('Global error (observability unavailable):', error);
      console.error('Observability error:', observabilityError);
    }
  }, [error]);

  return (
    <html>
      <body>
        {/* `NextError` is the default Next.js error page component. Its type
        definition requires a `statusCode` prop. However, since the App Router
        does not expose status codes for errors, we simply pass 0 to render a
        generic error message. */}
        <NextError statusCode={0} />
      </body>
    </html>
  );
}
