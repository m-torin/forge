// Extended auth types for web-template

import type { User as BaseUser } from '@repo/auth';

export interface ExtendedUser extends BaseUser {
  hasPassword?: boolean;
  accounts?: Array<{
    id: string;
    provider: string;
    providerId: string;
  }>;
}

export interface AuthClientExtensions {
  signIn?: {
    magicLink?: (data: { email: string; callbackURL?: string }) => Promise<any>;
  };
  twoFactor?: {
    enable: () => Promise<any>;
    disable: () => Promise<any>;
  };
  passkey?: {
    add: (data: { name: string }) => Promise<any>;
  };
  session?: {
    list: () => Promise<{ data: any[] }>;
    revoke: (data: { sessionId: string }) => Promise<any>;
    refresh: () => Promise<any>;
  };
  linkAccount?: (data: { provider: string; callbackURL?: string }) => Promise<any>;
}
