/**
 * Next.js server-side auth exports - Placeholder for future migration
 * Re-exports server functionality with Next.js specific additions
 */

// Re-export all server functionality
export * from './server';

// Next.js specific server features (placeholder)
export async function getServerSideProps(_context: any) {
  return {
    props: {},
  };
}

export async function middleware(_request: any) {
  return new Response('Next.js auth middleware not implemented', { status: 501 });
}

// Next.js API route helpers (placeholder)
export function withAuth(_handler: any) {
  return async function (_req: any, res: any) {
    res.status(501).json({ error: 'Auth wrapper not implemented' });
  };
}

export async function getSession(_req?: any) {
  return null;
}
