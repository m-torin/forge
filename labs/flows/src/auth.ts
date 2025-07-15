import 'next-auth/jwt';
import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prismaEdge } from './lib/prisma/edgeClient';
import { isDemoMode } from './lib/demoMode';

import type { NextAuthConfig } from 'next-auth';

export const config: NextAuthConfig = {
  theme: { logo: 'https://authjs.dev/img/logo-sm.png' },
  ...(isDemoMode() ? {} : { adapter: PrismaAdapter(prismaEdge) }),
  providers: isDemoMode() ? [] : [
    GitHub({
      clientId: process.env.GITHUB_ID ?? '',
      clientSecret: process.env.GITHUB_SECRET ?? '',
    }),
  ],
  basePath: '/auth',
  session: { strategy: 'jwt' },
  callbacks: {
    // authorized({ request, auth }) {
    //   const { pathname } = request.nextUrl;
    //   if (pathname === '/middleware-example') return !!auth;
    //   return true;
    // },
    authorized({ request, auth: _auth }) {
      // Get the pathname from the request URL
      const { pathname: _pathname } = request.nextUrl;

      // In demo mode, allow all routes without authentication
      if (isDemoMode()) {
        return true;
      }

      // Allow all routes by default
      return true;

      // Or if you want to protect specific routes:
      // const protectedPaths = ['/middleware-example', '/api/protected'];
      // return !protectedPaths.includes(pathname) || !!auth;
    },
    jwt({ token, trigger, session, account }) {
      if (isDemoMode()) {
        return {
          ...token,
          name: 'Demo User',
          email: 'demo@example.com',
          sub: 'demo-user-id'
        };
      }
      
      if (trigger === 'update') token.name = session.user.name;
      if (account?.provider === 'github') {
        token.accessToken = account.access_token ?? '';
      }
      return token;
    },
    async session({ session, token }) {
      if (isDemoMode()) {
        return {
          ...session,
          user: {
            name: 'Demo User',
            email: 'demo@example.com',
            id: 'demo-user-id'
          }
        };
      }
      
      if (token?.accessToken) {
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },
  trustHost: true,
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        domain: process.env.NEXT_PUBLIC_ROOT_DOMAIN,
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        domain: process.env.NEXT_PUBLIC_ROOT_DOMAIN,
      },
    },
    csrfToken: {
      name: 'next-auth.csrf-token',
      options: {
        domain: process.env.NEXT_PUBLIC_ROOT_DOMAIN,
      },
    },
  },
  debug: process.env.NODE_ENV !== 'production',
} satisfies NextAuthConfig;

const nextAuth = NextAuth(config);
export const handlers = nextAuth.handlers;
export const auth: typeof nextAuth.auth = nextAuth.auth;
export const signIn: typeof nextAuth.signIn = nextAuth.signIn;
export const signOut: typeof nextAuth.signOut = nextAuth.signOut;

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
  }
}
