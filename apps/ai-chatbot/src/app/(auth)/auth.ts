import { authConfig } from '#/app/(auth)/auth.config';
import { DUMMY_PASSWORD } from '#/lib/constants';
import { createGuestUser, getUser } from '#/lib/db/queries';
import { compare } from 'bcrypt-ts';
import NextAuth, { type DefaultSession } from 'next-auth';
import type { DefaultJWT } from 'next-auth/jwt';
import Credentials from 'next-auth/providers/credentials';

/**
 * User type enumeration
 */
export type UserType = 'guest' | 'regular';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      type: UserType;
    } & DefaultSession['user'];
  }

  interface User {
    id?: string;
    email?: string | null;
    type: UserType;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    type: UserType;
  }
}

/**
 * NextAuth instance configuration with credentials providers
 */
const nextAuth = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const { email, password } = credentials as { email: string; password: string };
        const users = await getUser(email);

        if (users.length === 0) {
          await compare(password, DUMMY_PASSWORD);
          return null;
        }

        const [user] = users;

        if (!user.password) {
          await compare(password, DUMMY_PASSWORD);
          return null;
        }

        const passwordsMatch = await compare(password, user.password);

        if (!passwordsMatch) return null;

        return { ...user, type: 'regular' };
      },
    }),
    Credentials({
      id: 'guest',
      credentials: {},
      async authorize() {
        const [guestUser] = await createGuestUser();
        return { ...guestUser, type: 'guest' };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.type = user.type;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.type = token.type;
      }

      return session;
    },
  },
});

/**
 * Extract functions from nextAuth result
 */
const nextAuthResult = nextAuth;

/**
 * Export NextAuth handlers
 */
export const handlers = nextAuthResult.handlers;
export const { GET, POST } = handlers;

/**
 * Export auth functions with explicit type assertions
 */
export const auth = nextAuthResult.auth as any;
export const signIn = nextAuthResult.signIn as any;
export const signOut = nextAuthResult.signOut as any;

/**
 * Export with explicit types to avoid TypeScript inference issues
 */
export type { Session } from 'next-auth';
export type { JWT } from 'next-auth/jwt';
