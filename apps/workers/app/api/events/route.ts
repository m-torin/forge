import { type NextRequest } from 'next/server';

import { devLog as logger } from '@repo/orchestration';
import { env } from '../../../env';

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
          logger.error('SSE: Failed to send event:', error);
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
          const logsUrl = `${request.nextUrl.origin}/api/client/logs?count=50`;
          logger.info(`SSE: Fetching from ${logsUrl}`);

          // Use service API key for internal authentication
          const headers: Record<string, string> = {};
          if (env.SERVICE_API_KEY) {
            headers['x-api-key'] = env.SERVICE_API_KEY;
          }

          const response = await fetch(logsUrl, { headers });

          if (!response.ok) {
            const errorText = await response.text();
            logger.warn(
              `SSE: API returned ${response.status} ${response.statusText}: ${errorText}`,
            );
            sendEvent({
              type: 'error',
              message: `API error: ${response.status} - ${errorText}`,
              timestamp: Date.now(),
            });
            return;
          }

          const data = await response.json();

          if (data.runs) {
            sendEvent({
              type: 'workflow-update',
              runs: data.runs,
              timestamp: Date.now(),
            });
          }
        } catch (error) {
          logger.error('SSE: Error fetching workflow data:', error);
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
          logger.error('SSE: Error closing controller:', error);
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
