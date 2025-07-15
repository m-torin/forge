// computeEvent.ts

import {
  ComputeResult,
  generateEventId,
  createComputeSuccess,
  createComputeError,
  FormValues,
} from '#/flows/nodes/internal';
import { logError } from '@repo/observability';

/**
 * Process input data according to node configuration
 * @param data - Raw input data
 * @returns Processed data with any transformations applied
 */
const _processInput = (data: Record<string, any>): Record<string, any> => {
  // Add any input processing logic here
  return data;
};

const replaceTemplateVariables = (
  template: string,
  input: Record<string, any>,
): string => {
  return template.replace(
    /\{\{(\w+)\}\}/g,
    (_, key) => input[key] || `{{${key}}}`,
  );
};

/**
 * Main compute function that processes incoming data
 * Validates, transforms, and generates events based on the input
 *
 * @param input - Raw input data to process
 * @param data - Form values containing node settings
 * @returns Promise<ComputeResult> - Result of the computation
 */
export const computeFunction = async (
  input: Record<string, any>,
  data: FormValues,
): Promise<ComputeResult> => {
  try {
    if (!input || !data?.metadata) {
      throw new Error('Missing required inputs or configuration');
    }

    const {
      model,
      prompt,
      systemPrompt,
      temperature,
      maxTokens,
      topP,
      presencePenalty,
      frequencyPenalty,
    } = data.metadata;

    // Replace template variables in prompt
    const processedPrompt = replaceTemplateVariables(prompt, input);

    // Prepare OpenAI API request
    const messages = [
      ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
      { role: 'user', content: processedPrompt },
    ];

    // Make OpenAI API call
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        top_p: topP,
        presence_penalty: presencePenalty,
        frequency_penalty: frequencyPenalty,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const result = await response.json();
    const eventId = generateEventId('openai');

    return createComputeSuccess({
      eventIds: [eventId],
      processedData: {
        [eventId]: {
          input,
          prompt: processedPrompt,
          response: result.choices[0].message.content,
          usage: result.usage,
        },
      },
    });
  } catch (error) {
    logError('OpenAI compute error', { error });
    return createComputeError(error);
  }
};

/**
 * Exported compute function for use in node configuration
 */
export const computeWrapper = computeFunction;
