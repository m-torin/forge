import { type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  // Create a ReadableStream for SSE
  const stream = new ReadableStream({
    start(controller) {
      let isControllerOpen = true;

      // Function to send data to client
      const sendEvent = (data: any) => {
        if (!isControllerOpen) {
          return; // Don't try to send if controller is closed
        }

        try {
          const message = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(new TextEncoder().encode(message));
        } catch (error) {
          console.error('SSE: Failed to send event:', error);
          isControllerOpen = false;
        }
      };

      // Send initial connection event
      sendEvent({ type: 'connected', timestamp: Date.now() });

      // Set up interval to send workflow status updates
      const interval = setInterval(async () => {
        if (!isControllerOpen) {
          clearInterval(interval);
          return;
        }

        try {
          // Fetch latest workflow runs
          const response = await fetch(`${request.nextUrl.origin}/api/client/logs?count=10`);
          const data = await response.json();

          if (data.runs) {
            sendEvent({
              type: 'workflow-update',
              runs: data.runs,
              timestamp: Date.now(),
            });
          }
        } catch (error) {
          console.error('SSE: Error fetching workflow data:', error);
          sendEvent({
            type: 'error',
            message: 'Failed to fetch workflow data',
            timestamp: Date.now(),
          });
        }
      }, 2000); // Update every 2 seconds

      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        isControllerOpen = false;
        clearInterval(interval);
        try {
          controller.close();
        } catch (error) {
          // Controller might already be closed
          console.error('SSE: Error closing controller:', error);
        }
      });
    },
  });

  // Return SSE response with proper headers
  return new Response(stream, {
    headers: {
      'Access-Control-Allow-Headers': 'Cache-Control',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Content-Type': 'text/event-stream',
    },
  });
}
