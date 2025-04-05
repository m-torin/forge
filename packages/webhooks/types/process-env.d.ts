declare global {
  namespace NodeJS {
    interface ProcessEnv {
      [key: string]: string | undefined;
      NODE_ENV: string;
      SVIX_API_URL?: string;
      SVIX_TOKEN?: string;
      WEBHOOK_SECRET?: string;
    }
  }
}

// Make NODE_ENV writable for tests
interface ProcessEnv {
  NODE_ENV: string;
}

export {};
