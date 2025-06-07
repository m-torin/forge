import { NextRequest } from 'next/server'

/**
 * Discovery endpoint for Vercel Toolbar
 * This endpoint allows the Vercel Toolbar to discover and override feature flags
 */
export async function GET(request: NextRequest) {
  const baseUrl = request.nextUrl.origin

  return Response.json({
    definitions: {
      'use-local-qstash': {
        description: 'Use local QStash CLI server instead of production QStash',
        origin: `${baseUrl}/lib/flags.ts`,
        options: [
          { label: 'Production QStash', value: false },
          { label: 'Local QStash CLI', value: true },
        ],
      },
    },
  })
}
