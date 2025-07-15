/**
 * Type declarations for better-auth admin plugin
 * This fixes TypeScript module resolution issues with the admin plugin
 */

declare module 'better-auth/plugins' {
  export interface AdminPluginConfig {
    defaultRole?: string;
    adminRoles?: string[];
    adminUserIds?: string[];
    impersonationSessionDuration?: number;
  }

  export function admin(config?: AdminPluginConfig): any;
}

declare module 'better-auth/client/plugins' {
  export interface AdminClientConfig {
    ac?: any;
    roles?: Record<string, any>;
  }

  export function adminClient(config?: AdminClientConfig): any;
}

// Global augmentation for better-auth types
declare global {
  namespace BetterAuth {
    interface User {
      role?: string;
    }
  }
}

export {};
