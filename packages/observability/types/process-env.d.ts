declare global {
  namespace NodeJS {
    interface ProcessEnv {
      [key: string]: string | undefined;
      BETTERSTACK_API_KEY?: string;
      BETTERSTACK_URL?: string;
      CI?: string;
      NEXT_PUBLIC_SENTRY_DSN?: string;
      NEXT_RUNTIME?: string;
      NODE_ENV: string;
      SENTRY_ORG?: string;
      SENTRY_PROJECT?: string;
    }
  }
}

// Make NODE_ENV writable for tests
interface ProcessEnv {
  NODE_ENV: string;
}

export {};
