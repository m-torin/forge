# Performance Extended Guide

Comprehensive patterns, profiling techniques, and optimization strategies for the performance and observability specialist.

## Table of Contents

1. [Detailed Instrumentation Patterns](#detailed-instrumentation-patterns)
2. [Performance Profiling Techniques](#performance-profiling-techniques)
3. [Bundle Analysis Workflows](#bundle-analysis-workflows)
4. [Core Web Vitals Optimization](#core-web-vitals-optimization)
5. [Turborepo Cache Optimization](#turborepo-cache-optimization)
6. [Anti-Patterns and Solutions](#anti-patterns-and-solutions)
7. [Monitoring and Alerting](#monitoring-and-alerting)
8. [Troubleshooting Guide](#troubleshooting-guide)

---

## Detailed Instrumentation Patterns

### Pattern 1: Server-Side Performance Tracking

```typescript
// packages/observability/src/server-timing.ts
import { performance } from 'perf_hooks';

export class ServerTiming {
  private marks: Map<string, number> = new Map();

  mark(name: string): void {
    this.marks.set(name, performance.now());
  }

  measure(name: string, startMark: string): number {
    const start = this.marks.get(startMark);
    if (!start) {
      console.warn(`[ServerTiming] Start mark "${startMark}" not found`);
      return 0;
    }

    const duration = performance.now() - start;
    return duration;
  }

  toHeader(): string {
    const entries: string[] = [];

    for (const [name, start] of this.marks.entries()) {
      const duration = performance.now() - start;
      entries.push(`${name};dur=${duration.toFixed(2)}`);
    }

    return entries.join(', ');
  }
}

// Usage in API route
export async function GET(request: Request) {
  const timing = new ServerTiming();

  timing.mark('db-start');
  const users = await db.user.findMany();
  const dbDuration = timing.measure('db', 'db-start');

  timing.mark('transform-start');
  const transformed = users.map(transformUser);
  const transformDuration = timing.measure('transform', 'transform-start');

  return Response.json(transformed, {
    headers: {
      'Server-Timing': timing.toHeader(),
      'X-DB-Duration': `${dbDuration.toFixed(2)}ms`,
      'X-Transform-Duration': `${transformDuration.toFixed(2)}ms`
    }
  });
}
```

### Pattern 2: Web Vitals Tracking with Sentry

```typescript
// app/providers.tsx
'use client';

import { useEffect } from 'react';
import { useReportWebVitals } from 'next/web-vitals';
import * as Sentry from '@sentry/nextjs';

export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    // Send to Sentry
    Sentry.metrics.distribution(metric.name, metric.value, {
      unit: 'millisecond',
      tags: {
        page: window.location.pathname,
        rating: metric.rating
      }
    });

    // Send to custom analytics
    if (window.gtag) {
      window.gtag('event', metric.name, {
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        event_label: metric.id,
        non_interaction: true
      });
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Web Vitals] ${metric.name}:`, {
        value: metric.value,
        rating: metric.rating,
        navigationType: metric.navigationType
      });
    }
  });

  return null;
}
```

### Pattern 3: Component-Level Performance Tracking

```typescript
// components/performance-monitored.tsx
'use client';

import { Profiler, ProfilerOnRenderCallback } from 'react';
import * as Sentry from '@sentry/nextjs';

const onRenderCallback: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime
) => {
  // Only track slow renders (> 16ms = drops frames)
  if (actualDuration > 16) {
    Sentry.metrics.distribution('component.render', actualDuration, {
      unit: 'millisecond',
      tags: {
        component: id,
        phase,
        slow: actualDuration > 50 ? 'yes' : 'no'
      }
    });

    if (process.env.NODE_ENV === 'development') {
      console.warn(`[Slow Render] ${id} (${phase}): ${actualDuration.toFixed(2)}ms`);
    }
  }
};

export function PerformanceMonitored({
  id,
  children
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <Profiler id={id} onRender={onRenderCallback}>
      {children}
    </Profiler>
  );
}

// Usage
export function DashboardPage() {
  return (
    <PerformanceMonitored id="Dashboard">
      <Dashboard />
    </PerformanceMonitored>
  );
}
```

### Pattern 4: Database Query Performance Tracking

```typescript
// packages/observability/src/prisma-middleware.ts
import { Prisma } from '@prisma/client';
import * as Sentry from '@sentry/nextjs';

export function createPerformanceMiddleware(): Prisma.Middleware {
  return async (params, next) => {
    const start = Date.now();

    try {
      const result = await next(params);
      const duration = Date.now() - start;

      // Track all queries
      Sentry.metrics.distribution('db.query', duration, {
        unit: 'millisecond',
        tags: {
          model: params.model || 'unknown',
          action: params.action
        }
      });

      // Warn on slow queries (> 200ms)
      if (duration > 200) {
        console.warn(`[Slow Query] ${params.model}.${params.action}: ${duration}ms`, {
          args: JSON.stringify(params.args).slice(0, 100)
        });
      }

      return result;
    } catch (error) {
      const duration = Date.now() - start;

      Sentry.captureException(error, {
        tags: {
          model: params.model || 'unknown',
          action: params.action,
          duration: `${duration}ms`
        }
      });

      throw error;
    }
  };
}

// Setup in Prisma client
const prisma = new PrismaClient();
prisma.$use(createPerformanceMiddleware());
```

### Pattern 5: API Endpoint Performance Wrapper

```typescript
// packages/orchestration/src/with-performance.ts
import { NextRequest, NextResponse } from 'next/server';

export function withPerformance(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const start = Date.now();
    const url = new URL(req.url);

    try {
      const response = await handler(req);
      const duration = Date.now() - start;

      // Add timing headers
      response.headers.set('X-Response-Time', `${duration}ms`);
      response.headers.set('Server-Timing', `total;dur=${duration}`);

      // Log performance
      console.info(`[API] ${req.method} ${url.pathname}: ${duration}ms (${response.status})`);

      return response;
    } catch (error) {
      const duration = Date.now() - start;
      console.error(`[API] ${req.method} ${url.pathname}: ${duration}ms (error)`, error);
      throw error;
    }
  };
}

// Usage
export const GET = withPerformance(async (req) => {
  const data = await fetchData();
  return NextResponse.json(data);
});
```

---

## Performance Profiling Techniques

### Technique 1: Lighthouse CI Integration

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI

on:
  pull_request:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2

      - name: Install dependencies
        run: pnpm install

      - name: Build webapp
        run: pnpm turbo run build --filter webapp

      - name: Start server
        run: pnpm --filter webapp start &
        env:
          PORT: 3000

      - name: Wait for server
        run: npx wait-on http://localhost:3000

      - name: Run Lighthouse
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            http://localhost:3000
            http://localhost:3000/about
            http://localhost:3000/blog
          uploadArtifacts: true
          temporaryPublicStorage: true

      - name: Check performance budget
        run: |
          if [ "${{ steps.lighthouse.outputs.scores.performance }}" -lt "90" ]; then
            echo "Performance score below 90!"
            exit 1
          fi
```

### Technique 2: React DevTools Profiler

```typescript
// docs/performance/profiling-guide.md

# React Profiler Guide

## Setup

1. Install React DevTools browser extension
2. Open DevTools → Profiler tab
3. Click "Record" button
4. Interact with your app
5. Click "Stop" button

## Analysis

### Flame Chart
- **Width**: Time spent rendering
- **Color**:
  - Yellow/red = slow renders
  - Green/blue = fast renders
- **Stack**: Component hierarchy

### Ranked Chart
- Components sorted by render time
- Identify performance bottlenecks

### Timeline
- See renders over time
- Identify unnecessary re-renders

## Common Issues

### Unnecessary Re-renders
**Symptom**: Component renders but nothing changed

**Fix**: Memoization
\`\`\`typescript
const MemoizedComponent = React.memo(Component);

const value = useMemo(() => expensiveComputation(), [deps]);

const callback = useCallback(() => doSomething(), [deps]);
\`\`\`

### Slow Renders
**Symptom**: Component takes > 16ms to render

**Fix**:
1. Move expensive logic to server
2. Use dynamic imports for heavy components
3. Virtualize long lists

### Large Component Tree
**Symptom**: Many nested components

**Fix**:
1. Code splitting
2. Lazy loading
3. Reduce nesting depth
```

### Technique 3: Bundle Analysis

```bash
# Analyze webpack bundle
pnpm turbo run analyze --filter webapp

# This generates:
# - .next/analyze/client.html (client bundle)
# - .next/analyze/server.html (server bundle)
# - .next/analyze/edge.html (edge bundle)
```

```typescript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
});

module.exports = withBundleAnalyzer({
  // Next.js config
  webpack(config, { isServer }) {
    // Custom webpack config for analysis
    if (process.env.ANALYZE) {
      config.optimization.concatenateModules = false;
    }

    return config;
  }
});
```

### Technique 4: Chrome DevTools Performance Tab

```typescript
// docs/performance/chrome-devtools-guide.md

# Chrome DevTools Performance Guide

## Recording a Profile

1. Open DevTools → Performance tab
2. Click "Record" (or Cmd+E / Ctrl+E)
3. Interact with your app (page load, user action)
4. Click "Stop" (or Cmd+E / Ctrl+E)

## Key Metrics

### FCP (First Contentful Paint)
When first text/image is painted
**Target**: < 1.8s

### LCP (Largest Contentful Paint)
When largest content element is visible
**Target**: < 2.5s

### TBT (Total Blocking Time)
Time main thread is blocked
**Target**: < 200ms

### CLS (Cumulative Layout Shift)
Visual stability (elements don't shift)
**Target**: < 0.1

## Flame Chart Analysis

### Colors
- **Blue**: Loading (network, parsing)
- **Yellow**: Scripting (JS execution)
- **Purple**: Rendering (layout, paint)
- **Green**: Painting

### Long Tasks
Red triangle = task > 50ms (blocks main thread)

**Common causes**:
- Large JavaScript bundles
- Heavy computations
- Synchronous network requests
- Forced layouts (reading layout properties)

## Bottom-Up Analysis

Shows time spent in each function

**Usage**:
1. Click "Bottom-Up" tab
2. Sort by "Self Time"
3. Identify expensive functions
4. Optimize or defer

## Call Tree Analysis

Shows function call hierarchy

**Usage**:
1. Click "Call Tree" tab
2. Expand expensive functions
3. Trace source of performance issues
```

### Technique 5: Network Performance Profiling

```typescript
// packages/observability/src/network-timing.ts

export function measureNetworkTiming(url: string) {
  if (typeof window === 'undefined') return;

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'resource' && entry.name.includes(url)) {
        const timing = entry as PerformanceResourceTiming;

        console.log(`[Network] ${url}:`, {
          dns: timing.domainLookupEnd - timing.domainLookupStart,
          tcp: timing.connectEnd - timing.connectStart,
          request: timing.responseStart - timing.requestStart,
          response: timing.responseEnd - timing.responseStart,
          total: timing.duration
        });
      }
    }
  });

  observer.observe({ entryTypes: ['resource'] });
}

// Usage
measureNetworkTiming('/api/data');
```

---

## Bundle Analysis Workflows

### Workflow 1: Identify Large Dependencies

```bash
# Generate bundle analysis
ANALYZE=true pnpm turbo run build --filter webapp

# Open .next/analyze/client.html in browser
```

**Look for:**
1. **Large packages** (> 100KB)
2. **Duplicate packages** (multiple versions)
3. **Unused exports** (tree-shaking opportunities)

**Actions:**

```typescript
// ❌ BAD: Import entire library
import _ from 'lodash';
import moment from 'moment';

// ✅ GOOD: Import specific functions
import debounce from 'lodash/debounce';
import { formatDistance } from 'date-fns';

// ✅ BETTER: Dynamic import for heavy libraries
const Chart = dynamic(() => import('react-chartjs-2'), {
  ssr: false,
  loading: () => <Skeleton height={400} />
});
```

### Workflow 2: Code Splitting Strategy

```typescript
// next.config.js
module.exports = {
  webpack(config, { isServer }) {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          // Vendor chunk (node_modules)
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            reuseExistingChunk: true
          },
          // Common chunks (shared between pages)
          common: {
            minChunks: 2,
            priority: 5,
            reuseExistingChunk: true
          },
          // Mantine UI chunk (heavy library)
          mantine: {
            test: /[\\/]node_modules[\\/]@mantine[\\/]/,
            name: 'mantine',
            priority: 15
          }
        }
      };
    }

    return config;
  }
};
```

### Workflow 3: Tree Shaking Verification

```bash
# Check if package supports tree shaking
pnpm why <package-name>

# Check package.json for:
# - "sideEffects": false (enables tree shaking)
# - "module" field (ESM entry point)
```

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "module": "esnext",
    "moduleResolution": "bundler",
    "target": "es2017"
  }
}

// package.json
{
  "type": "module",
  "sideEffects": false
}
```

### Workflow 4: Image Optimization Audit

```typescript
// Script: analyze-images.mjs
import { glob } from 'glob';
import { stat } from 'fs/promises';

const images = await glob('public/**/*.{jpg,jpeg,png,webp,svg}');

for (const image of images) {
  const stats = await stat(image);
  const sizeKB = (stats.size / 1024).toFixed(2);

  if (stats.size > 100 * 1024) {
    console.warn(`⚠️  Large image (${sizeKB}KB): ${image}`);
  }
}
```

**Optimization checklist:**
- [ ] Use Next.js `<Image>` component
- [ ] Convert JPG/PNG to WebP
- [ ] Use appropriate sizes (srcset)
- [ ] Add `priority` for above-fold images
- [ ] Use `placeholder="blur"` for better UX

---

## Core Web Vitals Optimization

### Optimization 1: LCP (Largest Contentful Paint)

**Target:** < 2.5s

**Common causes:**
- Large images not optimized
- Blocking resources (CSS, JS)
- Slow server response time
- Client-side rendering

**Solutions:**

```typescript
// 1. Optimize hero image
import Image from 'next/image';

export function Hero() {
  return (
    <Image
      src="/hero.jpg"
      alt="Hero"
      width={1920}
      height={1080}
      priority  // Preload above-fold image
      quality={85}  // Good balance
      placeholder="blur"
      blurDataURL="data:image/..."
    />
  );
}

// 2. Preload critical resources
// app/layout.tsx
export default function Layout({ children }) {
  return (
    <html>
      <head>
        <link
          rel="preload"
          href="/fonts/inter.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

// 3. Use server components (not client)
// ✅ GOOD: Server component
async function Hero() {
  const data = await fetchHeroData();
  return <HeroContent data={data} />;
}

// ❌ BAD: Client component with useEffect
'use client';
function Hero() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchHeroData().then(setData);
  }, []);

  return data ? <HeroContent data={data} /> : <Skeleton />;
}
```

### Optimization 2: FID / INP (Interaction Responsiveness)

**Target:** FID < 100ms, INP < 200ms

**Common causes:**
- Large JavaScript bundles
- Long tasks (> 50ms)
- Heavy event handlers

**Solutions:**

```typescript
// 1. Debounce expensive operations
import { useDebouncedCallback } from 'use-debounce';

export function SearchInput() {
  const handleSearch = useDebouncedCallback((query: string) => {
    // Expensive search operation
    performSearch(query);
  }, 300);

  return <input onChange={(e) => handleSearch(e.target.value)} />;
}

// 2. Use web workers for heavy computations
// worker.ts
self.addEventListener('message', (e) => {
  const result = heavyComputation(e.data);
  self.postMessage(result);
});

// Component
const worker = new Worker(new URL('./worker.ts', import.meta.url));

worker.postMessage(data);
worker.addEventListener('message', (e) => {
  setResult(e.data);
});

// 3. Break up long tasks with scheduling
async function processLargeDataset(items: Item[]) {
  for (let i = 0; i < items.length; i += 50) {
    const batch = items.slice(i, i + 50);
    await processBatch(batch);

    // Yield to main thread
    await new Promise(resolve => setTimeout(resolve, 0));
  }
}

// 4. Use React transitions for non-urgent updates
import { startTransition } from 'react';

function handleChange(value: string) {
  // Urgent: update input
  setInputValue(value);

  // Non-urgent: update filtered results
  startTransition(() => {
    setFilteredResults(filterResults(value));
  });
}
```

### Optimization 3: CLS (Cumulative Layout Shift)

**Target:** < 0.1

**Common causes:**
- Images without dimensions
- Ads/embeds without reserved space
- Web fonts causing FOIT/FOUT
- Dynamically injected content

**Solutions:**

```typescript
// 1. Always specify image dimensions
<Image
  src="/product.jpg"
  alt="Product"
  width={400}
  height={300}  // Prevents layout shift
/>

// 2. Reserve space for dynamic content
export function AdSlot() {
  return (
    <div
      style={{
        minHeight: 250,  // Reserve space
        backgroundColor: '#f0f0f0'
      }}
    >
      <AdComponent />
    </div>
  );
}

// 3. Use font-display for web fonts
// next.config.js
const nextConfig = {
  experimental: {
    optimizeFonts: true
  }
};

// Or in CSS
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter.woff2') format('woff2');
  font-display: swap;  // Prevents FOIT
}

// 4. Suspense with matching skeleton dimensions
<Suspense
  fallback={
    <Skeleton
      height={400}  // Match actual content height
      width="100%"
    />
  }
>
  <AsyncContent />
</Suspense>
```

---

## Turborepo Cache Optimization

### Optimization 1: Proper Input/Output Configuration

```json
// turbo.json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": [
        "src/**",
        "public/**",
        "package.json",
        "tsconfig.json",
        "next.config.js",
        "!**/*.test.ts",  // Exclude test files
        "!**/*.spec.ts"
      ],
      "outputs": [
        ".next/**",
        "!.next/cache/**"  // Exclude cache
      ]
    },
    "test": {
      "inputs": [
        "src/**",
        "__tests__/**",
        "vitest.config.ts",
        "package.json"
      ],
      "outputs": [
        "coverage/**"
      ]
    }
  }
}
```

### Optimization 2: Cache Key Analysis

```bash
# Analyze cache misses
pnpm turbo run build --dry-run=json > cache-analysis.json

# Check cache hit rate
pnpm turbo run build --summarize

# Example output:
# Tasks:    5 successful, 5 total
# Cached:   4 successful, 4 total
# Time:     2.5s (saved 30s)
# Cache hit rate: 80%
```

### Optimization 3: Remote Cache Setup

```bash
# Enable Vercel remote cache
pnpm turbo login
pnpm turbo link

# Verify remote cache
pnpm turbo run build --remote-cache-read-only
```

```json
// turbo.json
{
  "remoteCache": {
    "signature": true  // Verify cache integrity
  }
}
```

---

## Anti-Patterns and Solutions

### Anti-Pattern 1: Blocking the Main Thread

❌ **BAD:**
```typescript
export function Component() {
  // Blocks rendering for 500ms!
  const data = expensiveSync Computation();

  return <div>{data}</div>;
}
```

✅ **GOOD:**
```typescript
// Move to server component
async function Component() {
  const data = await expensiveComputation();  // On server
  return <div>{data}</div>;
}

// Or use web worker
const worker = new Worker(new URL('./worker.ts', import.meta.url));
```

### Anti-Pattern 2: N+1 Query Problem

❌ **BAD:**
```typescript
const posts = await db.post.findMany();

for (const post of posts) {
  const author = await db.user.findUnique({
    where: { id: post.authorId }
  });
  // 1 query + N queries = N+1!
}
```

✅ **GOOD:**
```typescript
const posts = await db.post.findMany({
  include: {
    author: true  // Single query with join
  }
});
```

### Anti-Pattern 3: Unoptimized Images

❌ **BAD:**
```tsx
<img src="/large-photo.jpg" alt="Photo" />
// No optimization, no responsive sizes, no lazy loading
```

✅ **GOOD:**
```tsx
<Image
  src="/large-photo.jpg"
  alt="Photo"
  width={800}
  height={600}
  sizes="(max-width: 768px) 100vw, 800px"
  quality={85}
  loading={isAboveFold ? 'eager' : 'lazy'}
/>
```

### Anti-Pattern 4: Large Initial Bundle

❌ **BAD:**
```typescript
import Chart from 'chart.js';  // 200KB!
import moment from 'moment';   // 70KB!
import lodash from 'lodash';   // 70KB!

// All loaded upfront, blocking initial render
```

✅ **GOOD:**
```typescript
// Dynamic imports
const Chart = dynamic(() => import('react-chartjs-2'), {
  ssr: false
});

// Smaller alternatives
import { formatDistance } from 'date-fns';
import debounce from 'lodash-es/debounce';
```

### Anti-Pattern 5: No Performance Monitoring

❌ **BAD:**
```typescript
// No instrumentation
export async function GET() {
  const data = await fetchData();
  return Response.json(data);
}
```

✅ **GOOD:**
```typescript
export async function GET() {
  const start = Date.now();

  try {
    const data = await fetchData();
    const duration = Date.now() - start;

    console.info(`[API] /api/data: ${duration}ms`);

    return Response.json(data, {
      headers: {
        'Server-Timing': `total;dur=${duration}`,
        'X-Response-Time': `${duration}ms`
      }
    });
  } catch (error) {
    const duration = Date.now() - start;
    console.error(`[API] /api/data: ${duration}ms (error)`, error);
    throw error;
  }
}
```

---

## Monitoring and Alerting

### Setup 1: Sentry Performance Monitoring

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,  // 10% of transactions

  integrations: [
    new Sentry.BrowserTracing({
      tracePropagationTargets: ['localhost', /^https:\/\/yoursite\.com/],
    }),
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  replaysSessionSampleRate: 0.01,  // 1% of sessions
  replaysOnErrorSampleRate: 1.0,   // 100% of errors
});
```

### Setup 2: Custom Performance Alerts

```typescript
// packages/observability/src/alerting.ts

interface PerformanceThreshold {
  metric: string;
  threshold: number;
  window: number;  // milliseconds
}

const thresholds: PerformanceThreshold[] = [
  { metric: 'LCP', threshold: 2500, window: 60000 },
  { metric: 'FID', threshold: 100, window: 60000 },
  { metric: 'CLS', threshold: 0.1, window: 60000 }
];

export function checkPerformanceThresholds(metrics: WebVitalsMetric[]) {
  for (const threshold of thresholds) {
    const recent = metrics.filter(
      m => m.name === threshold.metric &&
           Date.now() - m.timestamp < threshold.window
    );

    const avg = recent.reduce((sum, m) => sum + m.value, 0) / recent.length;

    if (avg > threshold.threshold) {
      // Send alert
      sendAlert({
        type: 'performance_threshold_exceeded',
        metric: threshold.metric,
        value: avg,
        threshold: threshold.threshold
      });
    }
  }
}
```

---

## Troubleshooting Guide

### Issue 1: LCP Regression

**Symptoms:**
- LCP increased from < 2.5s to > 3s
- Lighthouse score dropped

**Diagnosis:**
```bash
# Run Lighthouse
pnpm lighthouse --url http://localhost:3000

# Check Network tab for large resources
# Look for:
# - Large images (> 100KB)
# - Blocking scripts
# - Slow API responses
```

**Solutions:**
1. Optimize images with Next.js Image
2. Add `priority` to hero image
3. Use server components instead of client
4. Preload critical resources

### Issue 2: High Bundle Size

**Symptoms:**
- Initial bundle > 200KB
- Slow page loads on mobile

**Diagnosis:**
```bash
# Analyze bundle
ANALYZE=true pnpm turbo run build --filter webapp

# Check for:
# - Large dependencies
# - Duplicate packages
# - Unused code
```

**Solutions:**
1. Dynamic imports for heavy components
2. Use smaller alternatives (date-fns vs moment)
3. Import only needed functions
4. Enable tree shaking

### Issue 3: Low Cache Hit Rate

**Symptoms:**
- Turborepo cache < 80%
- Slow builds

**Diagnosis:**
```bash
# Check cache summary
pnpm turbo run build --summarize

# Analyze cache keys
pnpm turbo run build --dry-run=json
```

**Solutions:**
1. Review `inputs` in turbo.json (exclude volatile files)
2. Check `outputs` include all artifacts
3. Verify remote cache is enabled
4. Clear local cache if corrupted: `pnpm turbo run build --force`

### Issue 4: Slow API Response

**Symptoms:**
- API P95 > 2s
- Server-Timing header shows slow queries

**Diagnosis:**
```bash
# Check server logs for slow queries
grep "Slow Query" logs/*.log

# Profile database queries
# Look for:
# - N+1 queries
# - Missing indexes
# - Full table scans
```

**Solutions:**
1. Add database indexes
2. Use includes/select to avoid N+1
3. Implement caching (Redis)
4. Optimize query (coordinate with stack-prisma)

---

**End of Extended Guide**

For quick reference, see `.claude/agents/performance.md`
