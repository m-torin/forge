import { createOpenAI } from '@ai-sdk/openai';
import { WorkflowContext, QStashWorkflowAbort, upstashServe as serve } from '@repo/orchestration/server';
import { generateText, tool, ToolExecutionError } from 'ai';
import { z } from 'zod';
import { updateWorkflowStatus, getExecutionIdFromContext } from '@/lib/workflow-status-updater';

export const dynamic = 'force-dynamic';

const createWorkflowOpenAI = (context: WorkflowContext) => {
  return createOpenAI({
    apiKey: process.env.OPENAI_API_KEY ?? "",
    compatibility: "strict",
    fetch: async (input, init) => {
      try {
        // Prepare headers from init.headers
        const headers = init?.headers
          ? Object.fromEntries(new Headers(init.headers).entries())
          : {};

        // Prepare body from init.body
        const body = init?.body ? JSON.parse(init.body as string) : undefined;

        // Make HTTP request using context.run
        const responseInfo = await context.run("http-request", async () => {
          const response = await fetch(input.toString(), {
            method: init?.method || 'GET',
            headers,
            body: init?.body,
          });
          
          const responseHeaders: Record<string, string[]> = {};
          response.headers.forEach((value, key) => {
            responseHeaders[key] = [value];
          });
          
          return {
            status: response.status,
            header: responseHeaders,
            body: await response.json(),
          };
        });

        // Construct headers for the response
        const responseHeaders = new Headers(
          Object.entries(responseInfo.header).reduce((acc, [key, values]) => {
            acc[key] = values.join(", ");
            return acc;
          }, {} as Record<string, string>)
        );

        // Return the constructed response
        return new Response(JSON.stringify(responseInfo.body), {
          status: responseInfo.status,
          headers: responseHeaders,
        });
      } catch (error) {
        if (error instanceof QStashWorkflowAbort) {
          throw error
        } else {
          console.error("Error in fetch implementation:", error);
          throw error; // Rethrow error for further handling
        }
      }
    },
  });
};

export const { POST } = serve<{ prompt: string }>(async (context) => {
  console.log('[VERCEL-AI-SDK] Starting AI workflow with payload:', context.requestPayload)

  // Get execution ID for status tracking
  const executionId = getExecutionIdFromContext(context)
  if (executionId) {
    console.log('[VERCEL-AI-SDK] Found execution ID:', executionId)
    updateWorkflowStatus(executionId, {
      stepUpdates: [{
        stepId: 'execute',
        status: 'running',
        startedAt: new Date(),
        output: 'Starting AI text generation...'
      }]
    })
  }

  const openai = createWorkflowOpenAI(context)

  const prompt = await context.run("get prompt", async () => {
    if (executionId) {
      updateWorkflowStatus(executionId, {
        stepUpdates: [{
          stepId: 'execute',
          status: 'running',
          output: 'Processing prompt...'
        }]
      })
    }
    return context.requestPayload.prompt
  })

  try {
    if (executionId) {
      updateWorkflowStatus(executionId, {
        stepUpdates: [{
          stepId: 'execute',
          status: 'running',
          output: 'Generating text with AI model...'
        }]
      })
    }
    
    const result = await generateText({
      model: openai('gpt-3.5-turbo'),

      maxTokens: 2048,
      tools: {
        weather: tool({
          description: 'Get the weather in a location',
          parameters: z.object({
            latitude: z.number(),
            longitude: z.number(),
          }),
          execute: async ({ latitude, longitude }) => context.call("weather tool", {
            url: `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&hourly=temperature_2m&daily=sunrise,sunset&timezone=auto`,
            method: 'GET',
          })
        }),
        cityAttractions: tool({
          description: 'Get tourist attractions in a city',
          parameters: z.object({
            city: z.string().describe('The city to get attractions for')
          }),
          execute: async ({ city }) => context.call("attractions tool", {
            url: 'https://places.googleapis.com/v1/places:searchText',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY ?? "",
              'X-Goog-FieldMask': 'places.displayName,places.formattedAddress'
            },
            body: {
              textQuery: `tourist attractions in ${city}`
            }
          })
        }),
      },
      prompt,
      maxSteps: 6
    });
    await context.run("text", () => {
      console.log(`TEXT: ${result.text}`);
      if (executionId) {
        updateWorkflowStatus(executionId, {
          stepUpdates: [{
            stepId: 'execute',
            status: 'running',
            output: 'AI generation completed, processing results...'
          }]
        })
      }
      return result.text
    })

    console.log('[VERCEL-AI-SDK] Workflow completed successfully')
    
    if (executionId) {
      updateWorkflowStatus(executionId, {
        status: 'completed',
        completedAt: new Date(),
        stepUpdates: [{
          stepId: 'execute',
          status: 'completed',
          completedAt: new Date(),
          output: `AI text generation completed successfully`
        }],
        output: { 
          success: true, 
          text: result.text, 
          toolResults: result.toolResults,
          usage: result.usage 
        }
      })
    }
    
    return { 
      success: true, 
      text: result.text, 
      toolResults: result.toolResults,
      usage: result.usage 
    }

  } catch (error) {
    if (executionId) {
      updateWorkflowStatus(executionId, {
        status: 'failed',
        completedAt: new Date(),
        stepUpdates: [{
          stepId: 'execute',
          status: 'failed',
          completedAt: new Date(),
          error: error instanceof Error ? error.message : 'AI generation failed'
        }],
        error: error instanceof Error ? error.message : 'AI generation failed'
      })
    }
    
    if (error instanceof ToolExecutionError && error.cause instanceof QStashWorkflowAbort) {
      throw error.cause
    } else {
      throw error
    }
  }
})