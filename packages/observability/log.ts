import { log as logtail } from "@logtail/next";

// Export the appropriate logger based on environment
export const log = process.env.NODE_ENV === "production" ? logtail : console;

// No React components for now to avoid JSX issues
// We'll focus on getting the basic logger functionality working first
