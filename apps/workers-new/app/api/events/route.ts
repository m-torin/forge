import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

interface SSEEvent {
  type: 'connected' | 'workflow-update' | 'error'
  data?: unknown
  timestamp: number
}

export async function GET(request: NextRequest) {
  console.log('[SSE] New client connected')

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      console.log('[SSE] Stream started')
      let isActive = true
      
      // Send initial connection event
      const initialEvent: SSEEvent = {
        type: 'connected',
        data: { message: 'SSE connection established' },
        timestamp: Date.now()
      }
      
      controller.enqueue(`data: ${JSON.stringify(initialEvent)}\n\n`)

      // Set up polling interval for workflow updates
      const pollInterval = setInterval(async () => {
        if (!isActive) {
          clearInterval(pollInterval)
          return
        }

        try {
          // Fetch workflow logs from local endpoint
          const response = await fetch(`${request.nextUrl.origin}/api/workflow-logs`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          })

          if (response.ok && isActive) {
            const data = await response.json()
            
            const updateEvent: SSEEvent = {
              type: 'workflow-update',
              data: {
                runs: data.runs || [],
                totalRuns: data.totalRuns || 0
              },
              timestamp: Date.now()
            }
            
            if (isActive) {
              controller.enqueue(`data: ${JSON.stringify(updateEvent)}\n\n`)
              console.log('[SSE] Sent workflow update:', data.runs?.length || 0, 'runs')
            }
          }
        } catch (error) {
          console.error('[SSE] Error fetching workflow data:', error)
          
          if (isActive) {
            const errorEvent: SSEEvent = {
              type: 'error',
              data: { 
                message: 'Failed to fetch workflow data',
                error: error instanceof Error ? error.message : 'Unknown error'
              },
              timestamp: Date.now()
            }
            
            controller.enqueue(`data: ${JSON.stringify(errorEvent)}\n\n`)
          }
        }
      }, 2000) // Poll every 2 seconds

      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        console.log('[SSE] Client disconnected')
        isActive = false
        clearInterval(pollInterval)
        try {
          controller.close()
        } catch (e) {
          // Controller might already be closed
        }
      })
    },
  })

  // Return SSE response
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  })
}