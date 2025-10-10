# Stack Next-React Extended Guide

Comprehensive patterns, examples, and troubleshooting for Next.js 15.4 / React 19.1 specialist agent.

## Table of Contents

1. [Detailed Server Action Patterns](#detailed-server-action-patterns)
2. [Streaming and Suspense Strategies](#streaming-and-suspense-strategies)
3. [Edge Middleware Patterns](#edge-middleware-patterns)
4. [RSC Optimization Techniques](#rsc-optimization-techniques)
5. [Anti-Patterns and Solutions](#anti-patterns-and-solutions)
6. [Common Task Workflows](#common-task-workflows)
7. [Performance Optimization](#performance-optimization)
8. [Troubleshooting Guide](#troubleshooting-guide)

---

## Detailed Server Action Patterns

### Pattern 1: Basic Server Action with Validation

```typescript
// app/actions/profile.ts
'use server';
import { z } from 'zod';
import { createNodeClient } from '@repo/db-prisma/node';
import { auth } from '@repo/auth/server/next';

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100),
  bio: z.string().max(500),
  avatar: z.string().url().optional()
});

export async function updateProfile(data: FormData) {
  // 1. Authenticate
  const session = await auth();
  if (!session) throw new Error('Unauthorized');

  // 2. Validate input
  const parsed = updateProfileSchema.parse(Object.fromEntries(data));

  // 3. Perform database operation
  const db = createNodeClient();
  return db.user.update({
    where: { id: session.user.id },
    data: parsed
  });
}
```

### Pattern 2: Server Action with Transaction

```typescript
// app/actions/order.ts
'use server';
import { z } from 'zod';
import { createNodeClient } from '@repo/db-prisma/node';
import { auth } from '@repo/auth/server/next';
import { revalidatePath } from 'next/cache';

const createOrderSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
  shippingAddress: z.object({
    line1: z.string(),
    city: z.string(),
    postalCode: z.string()
  })
});

export async function createOrder(data: FormData) {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');

  const parsed = createOrderSchema.parse(Object.fromEntries(data));
  const db = createNodeClient();

  // Use transaction for atomicity
  const order = await db.$transaction(async (tx) => {
    // 1. Create order
    const newOrder = await tx.order.create({
      data: {
        userId: session.user.id,
        productId: parsed.productId,
        quantity: parsed.quantity,
        status: 'pending'
      }
    });

    // 2. Create shipping record
    await tx.shipping.create({
      data: {
        orderId: newOrder.id,
        ...parsed.shippingAddress
      }
    });

    // 3. Update inventory
    await tx.product.update({
      where: { id: parsed.productId },
      data: {
        inventory: { decrement: parsed.quantity }
      }
    });

    return newOrder;
  });

  // Revalidate relevant paths
  revalidatePath('/orders');
  revalidatePath(`/products/${parsed.productId}`);

  return order;
}
```

### Pattern 3: Server Action with Progressive Enhancement

```typescript
// app/actions/comment.ts
'use server';
import { z } from 'zod';
import { createNodeClient } from '@repo/db-prisma/node';
import { auth } from '@repo/auth/server/next';
import { revalidatePath } from 'next/cache';

const commentSchema = z.object({
  postId: z.string(),
  content: z.string().min(1).max(1000)
});

export async function addComment(data: FormData) {
  const session = await auth();
  if (!session) {
    return { error: 'Please sign in to comment' };
  }

  try {
    const parsed = commentSchema.parse({
      postId: data.get('postId'),
      content: data.get('content')
    });

    const db = createNodeClient();
    const comment = await db.comment.create({
      data: {
        ...parsed,
        authorId: session.user.id
      },
      include: {
        author: {
          select: { name: true, avatar: true }
        }
      }
    });

    revalidatePath(`/posts/${parsed.postId}`);

    return { success: true, comment };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: 'Invalid input', details: error.errors };
    }
    return { error: 'Failed to add comment' };
  }
}
```

**Usage in Client Component:**

```typescript
'use client';
import { useFormStatus } from 'react-dom';
import { addComment } from '@/actions/comment';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Posting...' : 'Post Comment'}
    </button>
  );
}

export function CommentForm({ postId }: { postId: string }) {
  return (
    <form action={addComment}>
      <input type="hidden" name="postId" value={postId} />
      <textarea name="content" required />
      <SubmitButton />
    </form>
  );
}
```

### Pattern 4: Optimistic Updates

```typescript
// app/actions/like.ts
'use server';
import { createNodeClient } from '@repo/db-prisma/node';
import { auth } from '@repo/auth/server/next';
import { revalidateTag } from 'next/cache';

export async function toggleLike(postId: string) {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');

  const db = createNodeClient();

  const existingLike = await db.like.findUnique({
    where: {
      userId_postId: {
        userId: session.user.id,
        postId
      }
    }
  });

  if (existingLike) {
    await db.like.delete({
      where: { id: existingLike.id }
    });
  } else {
    await db.like.create({
      data: {
        userId: session.user.id,
        postId
      }
    });
  }

  revalidateTag(`post-${postId}`);

  return { liked: !existingLike };
}
```

**Client Usage with Optimistic UI:**

```typescript
'use client';
import { useOptimistic } from 'react';
import { toggleLike } from '@/actions/like';

export function LikeButton({ postId, initialLiked }: Props) {
  const [optimisticLiked, setOptimisticLiked] = useOptimistic(initialLiked);

  async function handleLike() {
    setOptimisticLiked(!optimisticLiked);
    await toggleLike(postId);
  }

  return (
    <button onClick={handleLike}>
      {optimisticLiked ? '❤️ Liked' : '🤍 Like'}
    </button>
  );
}
```

---

## Streaming and Suspense Strategies

### Strategy 1: Progressive Page Loading

```typescript
// app/dashboard/page.tsx
import { Suspense } from 'react';
import { Skeleton } from '@mantine/core';

// Fast component (renders immediately)
function DashboardHeader() {
  return <header>Welcome to Dashboard</header>;
}

// Slow component (streams in later)
async function RecentActivity() {
  const activities = await fetchRecentActivity(); // Slow query
  return (
    <section>
      <h2>Recent Activity</h2>
      <ul>
        {activities.map(a => <li key={a.id}>{a.title}</li>)}
      </ul>
    </section>
  );
}

// Another slow component
async function Analytics() {
  const data = await fetchAnalytics(); // Another slow query
  return (
    <section>
      <h2>Analytics</h2>
      <AnalyticsChart data={data} />
    </section>
  );
}

// Main page - streams progressively
export default function DashboardPage() {
  return (
    <div>
      <DashboardHeader />

      {/* Stream recent activity */}
      <Suspense fallback={<Skeleton height={200} />}>
        <RecentActivity />
      </Suspense>

      {/* Stream analytics in parallel */}
      <Suspense fallback={<Skeleton height={300} />}>
        <Analytics />
      </Suspense>
    </div>
  );
}
```

### Strategy 2: Nested Suspense Boundaries

```typescript
// app/posts/[id]/page.tsx
import { Suspense } from 'react';

async function PostContent({ id }: { id: string }) {
  const post = await fetchPost(id); // Fast
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}

async function PostComments({ id }: { id: string }) {
  const comments = await fetchComments(id); // Slow
  return (
    <section>
      <h2>Comments</h2>
      {comments.map(c => <Comment key={c.id} {...c} />)}
    </section>
  );
}

async function RelatedPosts({ id }: { id: string }) {
  const related = await fetchRelatedPosts(id); // Very slow
  return (
    <aside>
      <h3>Related Posts</h3>
      {related.map(p => <PostCard key={p.id} {...p} />)}
    </aside>
  );
}

export default function PostPage({ params }: { params: { id: string } }) {
  return (
    <div>
      {/* Main content loads first */}
      <Suspense fallback={<PostSkeleton />}>
        <PostContent id={params.id} />
      </Suspense>

      {/* Comments stream in next */}
      <Suspense fallback={<CommentsSkeleton />}>
        <PostComments id={params.id} />

        {/* Related posts nested inside comments boundary */}
        <Suspense fallback={<RelatedSkeleton />}>
          <RelatedPosts id={params.id} />
        </Suspense>
      </Suspense>
    </div>
  );
}
```

### Strategy 3: Preload Pattern for Instant Navigation

```typescript
// app/products/page.tsx
import { Suspense } from 'react';
import Link from 'next/link';

async function ProductList() {
  const products = await fetchProducts();

  return (
    <div>
      {products.map(product => (
        <Link
          key={product.id}
          href={`/products/${product.id}`}
          // Preload on hover
          onMouseEnter={() => {
            // This will start loading the next page
            import(`./[id]/page`);
          }}
        >
          <ProductCard {...product} />
        </Link>
      ))}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsSkeleton />}>
      <ProductList />
    </Suspense>
  );
}
```

### Strategy 4: Streaming with Error Boundaries

```typescript
// app/dashboard/error.tsx
'use client';

export default function DashboardError({
  error,
  reset
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}

// app/dashboard/page.tsx
import { Suspense } from 'react';
import { ErrorBoundary } from '@/components/error-boundary';

async function RiskyComponent() {
  const data = await fetchDataThatMightFail();
  return <DataDisplay data={data} />;
}

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>

      {/* Wrap risky components in error boundaries */}
      <ErrorBoundary fallback={<ErrorFallback />}>
        <Suspense fallback={<Skeleton />}>
          <RiskyComponent />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
```

---

## Edge Middleware Patterns

### Pattern 1: Authentication Middleware

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@repo/auth/server/edge';

export async function middleware(request: NextRequest) {
  const session = await auth(request);

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Redirect authenticated users away from auth pages
  if (request.nextUrl.pathname.startsWith('/login')) {
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/signup'
  ]
};
```

### Pattern 2: Role-Based Access Control

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@repo/auth/server/edge';

const ADMIN_ROUTES = ['/admin', '/settings/billing'];
const MODERATOR_ROUTES = ['/moderate'];

export async function middleware(request: NextRequest) {
  const session = await auth(request);
  const pathname = request.nextUrl.pathname;

  // Check admin access
  if (ADMIN_ROUTES.some(route => pathname.startsWith(route))) {
    if (!session || session.user.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Check moderator access
  if (MODERATOR_ROUTES.some(route => pathname.startsWith(route))) {
    if (!session || !['admin', 'moderator'].includes(session.user.role)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/moderate/:path*', '/settings/:path*']
};
```

### Pattern 3: Geographic Routing

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get country from Vercel header
  const country = request.geo?.country || 'US';

  // Redirect EU users to GDPR-compliant page
  const euCountries = ['DE', 'FR', 'IT', 'ES', 'GB'];
  if (euCountries.includes(country) && request.nextUrl.pathname === '/') {
    return NextResponse.rewrite(new URL('/eu', request.url));
  }

  // Add country header for server components to use
  const response = NextResponse.next();
  response.headers.set('x-user-country', country);

  return response;
}
```

### Pattern 4: Rate Limiting

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Edge-compatible rate limiter
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s')
});

export async function middleware(request: NextRequest) {
  // Only rate limit API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    const ip = request.ip ?? '127.0.0.1';
    const { success, remaining } = await ratelimit.limit(ip);

    if (!success) {
      return new NextResponse('Rate limit exceeded', {
        status: 429,
        headers: {
          'X-RateLimit-Remaining': remaining.toString()
        }
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*'
};
```

### Pattern 5: A/B Testing

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const EXPERIMENTS = {
  'new-checkout': {
    variants: ['control', 'variant-a', 'variant-b'],
    weights: [0.5, 0.25, 0.25]
  }
};

function selectVariant(experimentId: string): string {
  const experiment = EXPERIMENTS[experimentId];
  const random = Math.random();

  let cumulative = 0;
  for (let i = 0; i < experiment.variants.length; i++) {
    cumulative += experiment.weights[i];
    if (random < cumulative) {
      return experiment.variants[i];
    }
  }

  return experiment.variants[0];
}

export function middleware(request: NextRequest) {
  // Check if user already has experiment cookie
  let variant = request.cookies.get('experiment-new-checkout')?.value;

  if (!variant && request.nextUrl.pathname.startsWith('/checkout')) {
    variant = selectVariant('new-checkout');

    const response = NextResponse.next();
    response.cookies.set('experiment-new-checkout', variant, {
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });

    // Rewrite to variant path
    if (variant !== 'control') {
      return NextResponse.rewrite(
        new URL(`/checkout/${variant}`, request.url)
      );
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/checkout/:path*'
};
```

---

## RSC Optimization Techniques

### Technique 1: Server Component by Default

```typescript
// ✅ GOOD: Default to server component
// app/blog/page.tsx
async function BlogList() {
  const posts = await fetchPosts(); // Direct DB query

  return (
    <div>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </article>
      ))}
    </div>
  );
}

// ❌ BAD: Unnecessary client component
'use client';
function BlogList() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch('/api/posts')
      .then(r => r.json())
      .then(setPosts);
  }, []);

  return <div>{/* render posts */}</div>;
}
```

### Technique 2: Client Components at Leaf Nodes

```typescript
// app/posts/page.tsx (Server Component)
async function PostsPage() {
  const posts = await fetchPosts();

  return (
    <div>
      <h1>Blog Posts</h1>
      {posts.map(post => (
        // Only interactive parts are client components
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>

          {/* Leaf node client component */}
          <LikeButton postId={post.id} initialLikes={post.likes} />
          <ShareButton url={`/posts/${post.id}`} />
        </article>
      ))}
    </div>
  );
}

// components/like-button.tsx (Client Component)
'use client';
export function LikeButton({ postId, initialLikes }: Props) {
  const [likes, setLikes] = useState(initialLikes);

  return (
    <button onClick={() => handleLike(postId)}>
      {likes} Likes
    </button>
  );
}
```

### Technique 3: Pass Server Components as Props

```typescript
// app/layout.tsx (Server Component)
import { ClientWrapper } from '@/components/client-wrapper';
import { ServerSidebar } from '@/components/server-sidebar';

export default async function Layout({ children }: Props) {
  const user = await fetchUser();

  return (
    <ClientWrapper
      // Pass server component as prop to client component
      sidebar={<ServerSidebar user={user} />}
    >
      {children}
    </ClientWrapper>
  );
}

// components/client-wrapper.tsx (Client Component)
'use client';
export function ClientWrapper({
  sidebar,
  children
}: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
      {isOpen && sidebar}
      <main>{children}</main>
    </div>
  );
}
```

### Technique 4: Shared Client Components

```typescript
// components/shared/button.tsx
'use client';
// Mark once, reuse everywhere
export function Button({ onClick, children }: Props) {
  return <button onClick={onClick}>{children}</button>;
}

// app/page1.tsx (Server Component)
import { Button } from '@/components/shared/button';

export default function Page1() {
  return (
    <div>
      <h1>Page 1</h1>
      {/* Button is already marked 'use client', no need to wrap */}
      <Button onClick={() => console.log('clicked')}>Click Me</Button>
    </div>
  );
}
```

### Technique 5: Dynamic Imports for Heavy Components

```typescript
// app/dashboard/page.tsx
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Lazy load heavy chart component
const HeavyChart = dynamic(() => import('@/components/heavy-chart'), {
  loading: () => <Skeleton height={400} />,
  ssr: false // Don't render on server if it breaks
});

// Lazy load rich text editor
const RichTextEditor = dynamic(() => import('@/components/rich-editor'), {
  loading: () => <p>Loading editor...</p>,
  ssr: false
});

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>

      {/* Only loads when rendered */}
      <Suspense fallback={<Skeleton />}>
        <HeavyChart data={data} />
      </Suspense>

      {/* Only loads when user interacts */}
      <RichTextEditor />
    </div>
  );
}
```

---

## Anti-Patterns and Solutions

### Anti-Pattern 1: Node APIs in Client Components

❌ **BAD:**
```typescript
'use client';
import fs from 'fs';
import path from 'path';

export function FileList() {
  // VIOLATION: Node APIs not available in browser
  const files = fs.readdirSync('./uploads');
  return <ul>{files.map(f => <li key={f}>{f}</li>)}</ul>;
}
```

✅ **GOOD:**
```typescript
// app/files/page.tsx (Server Component)
import fs from 'fs/promises';
import path from 'path';
import { FileListClient } from '@/components/file-list-client';

export default async function FilesPage() {
  // Read files on server
  const files = await fs.readdir('./uploads');

  // Pass data to client component
  return <FileListClient files={files} />;
}

// components/file-list-client.tsx (Client Component)
'use client';
export function FileListClient({ files }: { files: string[] }) {
  return <ul>{files.map(f => <li key={f}>{f}</li>)}</ul>;
}
```

### Anti-Pattern 2: Blocking Data Fetches Without Streaming

❌ **BAD:**
```typescript
// Blocks entire page for 2 seconds
export default async function Page() {
  const slowData = await fetchSlowData(); // 2s delay
  const moreSlowData = await fetchMoreSlowData(); // 2s delay

  // User sees nothing for 4 seconds
  return (
    <div>
      <SlowSection data={slowData} />
      <MoreSlowSection data={moreSlowData} />
    </div>
  );
}
```

✅ **GOOD:**
```typescript
import { Suspense } from 'react';

// Stream components independently
async function SlowSection() {
  const data = await fetchSlowData();
  return <section>{/* render */}</section>;
}

async function MoreSlowSection() {
  const data = await fetchMoreSlowData();
  return <section>{/* render */}</section>;
}

export default function Page() {
  // User sees page shell immediately, sections stream in
  return (
    <div>
      <Suspense fallback={<Skeleton />}>
        <SlowSection />
      </Suspense>

      <Suspense fallback={<Skeleton />}>
        <MoreSlowSection />
      </Suspense>
    </div>
  );
}
```

### Anti-Pattern 3: Unvalidated Server Actions

❌ **BAD:**
```typescript
'use server';
export async function updateUser(data: any) {
  // No validation! Accepts anything!
  return db.user.update({
    where: { id: data.id },
    data
  });
}
```

✅ **GOOD:**
```typescript
'use server';
import { z } from 'zod';

const updateUserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(100),
  email: z.string().email()
});

export async function updateUser(data: FormData) {
  // Strict validation with Zod
  const validated = updateUserSchema.parse(Object.fromEntries(data));

  return db.user.update({
    where: { id: validated.id },
    data: {
      name: validated.name,
      email: validated.email
    }
  });
}
```

### Anti-Pattern 4: Prop Drilling Through Client Boundary

❌ **BAD:**
```typescript
// app/page.tsx (Server)
async function Page() {
  const user = await fetchUser();

  // Serializes entire user object to client
  return <ClientLayout user={user} />;
}

// components/client-layout.tsx (Client)
'use client';
export function ClientLayout({ user }: { user: User }) {
  // Now ALL child components are client components
  return (
    <div>
      <Header user={user} />
      <Sidebar user={user} />
      <Content user={user} />
    </div>
  );
}
```

✅ **GOOD:**
```typescript
// app/page.tsx (Server)
async function Page() {
  const user = await fetchUser();

  return (
    <ClientLayout>
      {/* Pass server components as children */}
      <ServerHeader user={user} />
      <ServerSidebar user={user} />
      <ServerContent user={user} />
    </ClientLayout>
  );
}

// components/client-layout.tsx (Client)
'use client';
export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState('light');

  // Only layout logic is client-side
  return (
    <div data-theme={theme}>
      <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>
      {children}
    </div>
  );
}
```

### Anti-Pattern 5: Missing Error Boundaries

❌ **BAD:**
```typescript
// One error crashes entire page
export default async function Page() {
  const data1 = await fetchData1(); // Might fail
  const data2 = await fetchData2(); // Might fail

  return (
    <div>
      <Section1 data={data1} />
      <Section2 data={data2} />
    </div>
  );
}
```

✅ **GOOD:**
```typescript
// app/error.tsx
'use client';
export default function Error({ error, reset }: ErrorProps) {
  return (
    <div>
      <h2>Something went wrong</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}

// app/page.tsx
import { Suspense } from 'react';
import { ErrorBoundary } from '@/components/error-boundary';

async function Section1() {
  const data = await fetchData1();
  return <div>{/* render */}</div>;
}

async function Section2() {
  const data = await fetchData2();
  return <div>{/* render */}</div>;
}

export default function Page() {
  return (
    <div>
      {/* Isolate failures */}
      <ErrorBoundary>
        <Suspense fallback={<Skeleton />}>
          <Section1 />
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary>
        <Suspense fallback={<Skeleton />}>
          <Section2 />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
```

---

## Common Task Workflows

### Workflow 1: Adding New Protected Route

**Step-by-step process:**

1. **Create route structure**
```bash
# Create route directory
mkdir -p apps/webapp/app/dashboard/settings

# Create page component
touch apps/webapp/app/dashboard/settings/page.tsx

# Create loading state
touch apps/webapp/app/dashboard/settings/loading.tsx

# Create error boundary
touch apps/webapp/app/dashboard/settings/error.tsx
```

2. **Implement page component**
```typescript
// app/dashboard/settings/page.tsx
import { auth } from '@repo/auth/server/next';
import { redirect } from 'next/navigation';
import { SettingsForm } from '@/components/settings-form';

export default async function SettingsPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <div>
      <h1>Settings</h1>
      <SettingsForm user={session.user} />
    </div>
  );
}
```

3. **Add loading state**
```typescript
// app/dashboard/settings/loading.tsx
import { Skeleton } from '@mantine/core';

export default function Loading() {
  return (
    <div>
      <Skeleton height={40} width="50%" mb="md" />
      <Skeleton height={200} />
    </div>
  );
}
```

4. **Add error boundary**
```typescript
// app/dashboard/settings/error.tsx
'use client';

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div>
      <h2>Failed to load settings</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

5. **Update middleware (if needed)**
```typescript
// middleware.ts
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/settings/:path*' // Add new route
  ]
};
```

6. **Test end-to-end**
```bash
# Run E2E tests
pnpm playwright test -- settings.spec.ts

# Verify auth flow
# - Unauthenticated redirect to login
# - Authenticated can access
# - Loading state shows
# - Error boundary catches failures
```

### Workflow 2: Implementing Streaming Pattern

**Step-by-step process:**

1. **Identify slow data fetches**
```typescript
// Profile page with slow data
export default async function ProfilePage() {
  const user = await fetchUser(); // Fast: 50ms
  const posts = await fetchUserPosts(); // Slow: 800ms
  const followers = await fetchFollowers(); // Slow: 1200ms

  // Current: User waits 2050ms to see anything
  return <Profile user={user} posts={posts} followers={followers} />;
}
```

2. **Extract slow components**
```typescript
// components/user-posts.tsx
async function UserPosts({ userId }: { userId: string }) {
  const posts = await fetchUserPosts(userId);

  return (
    <section>
      <h2>Posts</h2>
      {posts.map(p => <PostCard key={p.id} {...p} />)}
    </section>
  );
}

// components/user-followers.tsx
async function UserFollowers({ userId }: { userId: string }) {
  const followers = await fetchFollowers(userId);

  return (
    <section>
      <h2>Followers</h2>
      {followers.map(f => <FollowerCard key={f.id} {...f} />)}
    </section>
  );
}
```

3. **Wrap in Suspense**
```typescript
import { Suspense } from 'react';
import { Skeleton } from '@mantine/core';
import { UserPosts } from '@/components/user-posts';
import { UserFollowers } from '@/components/user-followers';

export default async function ProfilePage() {
  const user = await fetchUser(); // Fast: 50ms

  // Page shell renders in 50ms, sections stream in
  return (
    <div>
      {/* Renders immediately */}
      <UserHeader user={user} />

      {/* Streams in after 800ms */}
      <Suspense fallback={<Skeleton height={400} />}>
        <UserPosts userId={user.id} />
      </Suspense>

      {/* Streams in after 1200ms */}
      <Suspense fallback={<Skeleton height={200} />}>
        <UserFollowers userId={user.id} />
      </Suspense>
    </div>
  );
}
```

4. **Test streaming behavior**
```bash
# Throttle network to simulate slow connections
# Verify:
# - Page shell renders immediately
# - Skeletons show while loading
# - Sections appear as data loads
# - No layout shift (CLS < 0.1)
```

5. **Measure performance improvement**
```typescript
// Before: TTFB = 2050ms (waited for all data)
// After: TTFB = 50ms (page shell)
//        LCP = 850ms (first meaningful content)
```

6. **Document pattern**
```markdown
## Streaming Implementation: Profile Page

### Performance Impact
- TTFB: 2050ms → 50ms (97.6% improvement)
- LCP: 2050ms → 850ms (58.5% improvement)
- CLS: 0.0 (no layout shift)

### Pattern Used
- Extracted slow components (UserPosts, UserFollowers)
- Wrapped in individual Suspense boundaries
- Parallel streaming (components load independently)

### Files Changed
- app/profile/page.tsx:15-35
- components/user-posts.tsx:1-20
- components/user-followers.tsx:1-18
```

### Workflow 3: Optimizing RSC Bundle

**Step-by-step process:**

1. **Profile client bundle size**
```bash
# Build and analyze
pnpm turbo run build --filter webapp
npx @next/bundle-analyzer

# Check output
# - Identify large client components
# - Find unnecessary client boundaries
# - Look for heavy dependencies
```

2. **Identify client component candidates**
```typescript
// Current: Entire dashboard is client
'use client';
export function Dashboard() {
  const [tab, setTab] = useState('overview');

  return (
    <div>
      <Tabs value={tab} onChange={setTab}>
        <Tab value="overview">Overview</Tab>
        <Tab value="analytics">Analytics</Tab>
      </Tabs>

      {tab === 'overview' && <Overview />}
      {tab === 'analytics' && <Analytics />}
    </div>
  );
}
```

3. **Move logic to server components**
```typescript
// app/dashboard/page.tsx (Server)
import { TabContent } from '@/components/tab-content';

export default function DashboardPage({
  searchParams
}: {
  searchParams: { tab?: string }
}) {
  const currentTab = searchParams.tab || 'overview';

  return (
    <div>
      {/* Client component only for tabs UI */}
      <ClientTabs currentTab={currentTab} />

      {/* Server component for content */}
      <TabContent tab={currentTab} />
    </div>
  );
}

// components/client-tabs.tsx (Client)
'use client';
import { useRouter } from 'next/navigation';

export function ClientTabs({ currentTab }: Props) {
  const router = useRouter();

  return (
    <Tabs
      value={currentTab}
      onChange={(tab) => router.push(`?tab=${tab}`)}
    >
      <Tab value="overview">Overview</Tab>
      <Tab value="analytics">Analytics</Tab>
    </Tabs>
  );
}
```

4. **Use dynamic imports for heavy components**
```typescript
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('@/components/heavy-chart'), {
  ssr: false,
  loading: () => <Skeleton height={400} />
});

export default function AnalyticsPage() {
  return (
    <div>
      <h1>Analytics</h1>
      {/* Only loads when rendered, not in initial bundle */}
      <HeavyChart />
    </div>
  );
}
```

5. **Verify bundle reduction**
```bash
# Re-build and compare
pnpm turbo run build --filter webapp

# Check improvements:
# - Client bundle size reduced
# - Fewer client components
# - Heavy dependencies lazy-loaded
```

6. **Document optimization**
```markdown
## RSC Bundle Optimization: Dashboard

### Bundle Size Impact
- Before: 450 KB client JS
- After: 180 KB client JS (60% reduction)

### Changes Made
1. Converted Dashboard to server component with search params
2. Extracted ClientTabs for interactive UI only
3. Dynamic imports for HeavyChart component

### Files Changed
- app/dashboard/page.tsx:10-30 (server component)
- components/client-tabs.tsx:1-15 (new client component)
- components/heavy-chart.tsx (dynamic import)
```

---

## Performance Optimization

### Optimization 1: Static vs Dynamic Rendering

```typescript
// Static rendering (default)
// Builds at build time, serves from CDN
export default async function BlogPage() {
  const posts = await fetchPosts();
  return <PostList posts={posts} />;
}

// Dynamic rendering (opt-in)
// Renders on each request
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await fetchUser(); // Needs fresh data
  return <Dashboard user={user} />;
}

// Revalidate static page periodically
export const revalidate = 3600; // Rebuild every hour

export default async function ProductPage() {
  const products = await fetchProducts();
  return <ProductList products={products} />;
}
```

### Optimization 2: Granular Cache Control

```typescript
// app/products/page.tsx
import { unstable_cache } from 'next/cache';

// Cache product list for 5 minutes
const getCachedProducts = unstable_cache(
  async () => fetchProducts(),
  ['products-list'],
  { revalidate: 300 }
);

// Cache individual product for 1 hour
const getCachedProduct = unstable_cache(
  async (id: string) => fetchProduct(id),
  ['product'],
  { revalidate: 3600 }
);

export default async function ProductsPage() {
  const products = await getCachedProducts();
  return <ProductList products={products} />;
}
```

### Optimization 3: Parallel Data Fetching

```typescript
// ❌ BAD: Sequential (slow)
export default async function Page() {
  const user = await fetchUser(); // Wait 100ms
  const posts = await fetchPosts(user.id); // Wait 200ms
  const comments = await fetchComments(user.id); // Wait 150ms

  // Total: 450ms
  return <Dashboard user={user} posts={posts} comments={comments} />;
}

// ✅ GOOD: Parallel (fast)
export default async function Page() {
  const [user, posts, comments] = await Promise.all([
    fetchUser(), // 100ms
    fetchPosts(), // 200ms
    fetchComments() // 150ms
  ]);

  // Total: 200ms (longest request)
  return <Dashboard user={user} posts={posts} comments={comments} />;
}
```

### Optimization 4: Incremental Static Regeneration

```typescript
// app/blog/[slug]/page.tsx

// Generate static pages for popular posts at build time
export async function generateStaticParams() {
  const popularPosts = await fetchPopularPosts(100);

  return popularPosts.map(post => ({
    slug: post.slug
  }));
}

// Revalidate and cache on demand
export const revalidate = 60; // Revalidate every minute

export default async function BlogPostPage({
  params
}: {
  params: { slug: string }
}) {
  const post = await fetchPost(params.slug);

  if (!post) {
    notFound();
  }

  return <BlogPost post={post} />;
}
```

### Optimization 5: Image Optimization

```typescript
import Image from 'next/image';

export function ProductCard({ product }: Props) {
  return (
    <div>
      {/* Next.js Image component optimizes automatically */}
      <Image
        src={product.image}
        alt={product.name}
        width={400}
        height={300}
        // Lazy load images below fold
        loading="lazy"
        // Placeholder blur for better UX
        placeholder="blur"
        blurDataURL={product.blurDataURL}
        // Optimize for different screen sizes
        sizes="(max-width: 768px) 100vw, 400px"
      />
      <h3>{product.name}</h3>
    </div>
  );
}
```

---

## Troubleshooting Guide

### Issue 1: "Error: Invariant: headers() should not be called on a server-side render"

**Cause:** Trying to read request headers in a static route.

**Solution:** Mark route as dynamic or use cookies/headers in server action only.

```typescript
// ❌ BAD: Static route trying to read headers
export default async function Page() {
  const { cookies } = await import('next/headers');
  const token = cookies().get('token'); // ERROR

  return <div>...</div>;
}

// ✅ GOOD: Mark as dynamic
export const dynamic = 'force-dynamic';

export default async function Page() {
  const { cookies } = await import('next/headers');
  const token = cookies().get('token'); // OK

  return <div>...</div>;
}
```

### Issue 2: "Error: Node APIs are not available in client components"

**Cause:** Importing Node.js modules in `'use client'` components.

**Solution:** Move Node logic to server components or server actions.

```typescript
// ❌ BAD: Node API in client
'use client';
import fs from 'fs';

export function FileReader() {
  const content = fs.readFileSync('./data.txt'); // ERROR
  return <div>{content}</div>;
}

// ✅ GOOD: Move to server component
// app/files/page.tsx (Server Component)
import fs from 'fs/promises';

export default async function FilesPage() {
  const content = await fs.readFile('./data.txt', 'utf-8');

  return <FileDisplay content={content} />;
}

// components/file-display.tsx (Client Component)
'use client';
export function FileDisplay({ content }: Props) {
  return <div>{content}</div>;
}
```

### Issue 3: "Error: Middleware cannot use Node.js runtime"

**Cause:** Importing Node APIs in edge middleware.

**Solution:** Use edge-compatible alternatives or move logic to server components.

```typescript
// ❌ BAD: Node API in middleware
import fs from 'fs';

export function middleware(request: NextRequest) {
  const config = fs.readFileSync('./config.json'); // ERROR
  return NextResponse.next();
}

// ✅ GOOD: Use edge-compatible storage
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export async function middleware(request: NextRequest) {
  const config = await redis.get('config'); // OK
  return NextResponse.next();
}
```

### Issue 4: "Error: Server Actions must be marked 'use server'"

**Cause:** Forgot to add `'use server'` directive to action file.

**Solution:** Add directive at top of file or function.

```typescript
// ❌ BAD: Missing directive
export async function updateProfile(data: FormData) {
  // ...
}

// ✅ GOOD: File-level directive
'use server';

export async function updateProfile(data: FormData) {
  // ...
}

// ✅ ALSO GOOD: Function-level directive
export async function updateProfile(data: FormData) {
  'use server';
  // ...
}
```

### Issue 5: "Error: Dynamic server usage with static generation"

**Cause:** Using dynamic APIs (headers, cookies, searchParams) in static route.

**Solution:** Mark route as dynamic or use at runtime only.

```typescript
// ❌ BAD: Dynamic API in static route
export default async function Page() {
  const headersList = headers(); // ERROR
  return <div>...</div>;
}

// ✅ GOOD: Opt into dynamic rendering
export const dynamic = 'force-dynamic';

export default async function Page() {
  const headersList = headers(); // OK
  return <div>...</div>;
}

// ✅ ALSO GOOD: Use in client component
'use client';
export function ClientComponent() {
  const searchParams = useSearchParams(); // OK in client
  return <div>...</div>;
}
```

### Issue 6: "Layout shift detected (CLS > 0.1)"

**Cause:** Content dimensions not reserved, causing reflow.

**Solution:** Use Suspense with proper fallback dimensions.

```typescript
// ❌ BAD: No fallback dimensions
<Suspense fallback={<div>Loading...</div>}>
  <HeavyComponent />
</Suspense>

// ✅ GOOD: Reserve space with Skeleton
<Suspense fallback={<Skeleton height={400} width="100%" />}>
  <HeavyComponent />
</Suspense>
```

### Issue 7: "Error: Cannot read properties of undefined (reading 'map')"

**Cause:** Component rendering before data loads.

**Solution:** Use proper null checks or loading states.

```typescript
// ❌ BAD: No null check
export function PostList({ posts }: { posts: Post[] }) {
  return (
    <ul>
      {posts.map(p => <li key={p.id}>{p.title}</li>)}
    </ul>
  );
}

// ✅ GOOD: Null check
export function PostList({ posts }: { posts: Post[] | null }) {
  if (!posts) {
    return <p>Loading...</p>;
  }

  return (
    <ul>
      {posts.map(p => <li key={p.id}>{p.title}</li>)}
    </ul>
  );
}

// ✅ BETTER: Use Suspense
export default function Page() {
  return (
    <Suspense fallback={<Skeleton />}>
      <PostList />
    </Suspense>
  );
}
```

### Issue 8: "Route not found after deployment"

**Cause:** Missing `generateStaticParams` for dynamic routes.

**Solution:** Add `generateStaticParams` or mark as dynamic.

```typescript
// app/blog/[slug]/page.tsx

// Generate static paths at build time
export async function generateStaticParams() {
  const posts = await fetchAllPosts();

  return posts.map(post => ({
    slug: post.slug
  }));
}

// Or mark as fully dynamic
export const dynamic = 'force-dynamic';

export default async function BlogPostPage({ params }: Props) {
  const post = await fetchPost(params.slug);
  return <BlogPost post={post} />;
}
```

---

**End of Extended Guide**

For quick reference, see `.claude/agents/stack-next-react.md`
