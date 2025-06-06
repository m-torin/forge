import { Suspense } from 'react';
import { NextRequest, NextResponse } from 'next/server';
import { flag } from '../src/server';

// Flag that checks for auth cookie existence (fast check)
export const hasAuthCookieFlag = flag<boolean>({
  key: 'has-auth-cookie',
  decide: ({ cookies }) => {
    return cookies?.has('auth-token') ?? false;
  },
});

// Example of authenticated skeleton
function AuthedSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-12 bg-gray-200 rounded w-1/4 mb-4" />
      <div className="h-64 bg-gray-200 rounded" />
    </div>
  );
}

// Example of unauthenticated skeleton
function UnauthedSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex gap-4 mb-4">
        <div className="h-10 bg-gray-200 rounded w-24" />
        <div className="h-10 bg-gray-200 rounded w-24" />
      </div>
      <div className="h-64 bg-gray-200 rounded" />
    </div>
  );
}

// Async component that does the actual auth check
async function Dashboard() {
  // Simulate slow auth check
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // In real app, would check auth and fetch user data
  const user = { name: 'John Doe', plan: 'pro' };

  return (
    <div>
      <h1>Welcome back, {user.name}!</h1>
      <p>Your plan: {user.plan}</p>
    </div>
  );
}

// Page component using Suspense with feature flags
export default async function SuspensePage() {
  // Quick check if user has auth cookie (doesn't validate it)
  const hasAuth = await hasAuthCookieFlag();

  return (
    <div>
      <h1>Suspense with Feature Flags</h1>

      {/* Use appropriate skeleton based on auth state */}
      <Suspense fallback={hasAuth ? <AuthedSkeleton /> : <UnauthedSkeleton />}>
        <Dashboard />
      </Suspense>
    </div>
  );
}

// Middleware for this example
export async function suspenseMiddleware(request: NextRequest) {
  const { precompute } = await import('../src/server');
  const flags = [hasAuthCookieFlag] as const;

  const code = await precompute(flags);

  // Rewrite to precomputed shell
  const nextUrl = new URL(`/suspense/${code}`, request.url);

  return NextResponse.rewrite(nextUrl);
}
