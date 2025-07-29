export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Initialize observability for server-side Node.js runtime
    const { getObservability } = await import('@repo/observability/server/next');
    await getObservability();
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Initialize observability for edge runtime
    const { getObservability } = await import('@repo/observability/server/edge');
    await getObservability();
  }
}

export async function onRequestError(
  error: { digest: string } & Error,
  request: { path: string; method: string },
  context: { routerKind: 'Pages Router' | 'App Router'; routePath: string },
) {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { logError } = await import('@repo/observability/server/next');
    await logError(error, {
      request,
      context,
    });
  }
}
