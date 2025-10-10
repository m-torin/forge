/**
 * AI SDK v5 Computer Use Tool - computer_20241022
 * Implements Anthropic's computer interaction capabilities
 */

import { logInfo, logWarn } from '@repo/observability/server/next';
import { tool } from 'ai';
import { z } from 'zod/v3';

/**
 * Computer tool action types
 */
export const ComputerActionSchema = z.enum([
  'screenshot',
  'click',
  'double_click',
  'right_click',
  'middle_click',
  'move',
  'drag',
  'type',
  'key',
  'scroll',
  'wait',
]);

/**
 * Computer tool input schema
 */
export const ComputerToolInputSchema = z.object({
  action: ComputerActionSchema,
  coordinate: z
    .tuple([z.number(), z.number()])
    .optional()
    .describe('X,Y coordinates for click/move actions'),
  text: z.string().optional().describe('Text to type'),
  key: z.string().optional().describe('Key or key combination to press (e.g., "Return", "cmd+c")'),
  direction: z
    .enum(['up', 'down', 'left', 'right'])
    .optional()
    .describe('Direction for scroll actions'),
  amount: z.number().optional().describe('Amount to scroll or wait time in seconds'),
});

export type ComputerToolInput = z.infer<typeof ComputerToolInputSchema>;

/**
 * Computer tool configuration
 */
export interface ComputerToolConfig {
  /** Enable screenshot capability */
  enableScreenshot?: boolean;
  /** Enable input simulation */
  enableInput?: boolean;
  /** Custom screenshot provider */
  screenshotProvider?: () => Promise<string>;
  /** Custom input simulator */
  inputSimulator?: (action: ComputerToolInput) => Promise<boolean>;
  /** Sandbox mode - simulates actions without executing */
  sandbox?: boolean;
  /** Maximum wait time in seconds */
  maxWaitTime?: number;
}

/**
 * Create the computer_20241022 tool
 */
export function createComputerTool(config: ComputerToolConfig = {}) {
  const {
    enableScreenshot = true,
    enableInput = true,
    screenshotProvider,
    inputSimulator,
    sandbox = false,
    maxWaitTime = 30,
  } = config;

  return tool({
    description: 'Computer interaction tool - take screenshots and simulate user input',
    inputSchema: ComputerToolInputSchema,
    execute: async (input, _options) => {
      logInfo('Computer Tool: Executing action', {
        operation: 'computer_tool_execute',
        metadata: {
          action: input.action,
          sandbox,
          hasCoordinate: !!input.coordinate,
        },
      });

      // Sandbox mode - return simulated results
      if (sandbox) {
        return simulateComputerAction(input);
      }

      try {
        switch (input.action) {
          case 'screenshot': {
            if (!enableScreenshot) {
              throw new Error('Screenshot capability is disabled');
            }

            const screenshot = screenshotProvider
              ? await screenshotProvider()
              : await defaultScreenshotProvider();

            return {
              action: 'screenshot',
              success: true,
              screenshot,
              timestamp: new Date().toISOString(),
            };
          }

          case 'click':
          case 'double_click':
          case 'right_click':
          case 'middle_click': {
            if (!enableInput) {
              throw new Error('Input simulation is disabled');
            }

            if (!input.coordinate) {
              throw new Error(`Coordinate required for ${input.action}`);
            }

            const success = inputSimulator
              ? await inputSimulator(input)
              : await defaultClickSimulator(input.action, input.coordinate);

            return {
              action: input.action,
              success,
              coordinate: input.coordinate,
              timestamp: new Date().toISOString(),
            };
          }

          case 'move':
          case 'drag': {
            if (!enableInput) {
              throw new Error('Input simulation is disabled');
            }

            if (!input.coordinate) {
              throw new Error(`Coordinate required for ${input.action}`);
            }

            const success = inputSimulator
              ? await inputSimulator(input)
              : await defaultMoveSimulator(input.action, input.coordinate);

            return {
              action: input.action,
              success,
              coordinate: input.coordinate,
              timestamp: new Date().toISOString(),
            };
          }

          case 'type': {
            if (!enableInput) {
              throw new Error('Input simulation is disabled');
            }

            if (!input.text) {
              throw new Error('Text required for type action');
            }

            const success = inputSimulator
              ? await inputSimulator(input)
              : await defaultTypeSimulator(input.text);

            return {
              action: 'type',
              success,
              textLength: input.text.length,
              timestamp: new Date().toISOString(),
            };
          }

          case 'key': {
            if (!enableInput) {
              throw new Error('Input simulation is disabled');
            }

            if (!input.key) {
              throw new Error('Key required for key action');
            }

            const success = inputSimulator
              ? await inputSimulator(input)
              : await defaultKeySimulator(input.key);

            return {
              action: 'key',
              success,
              key: input.key,
              timestamp: new Date().toISOString(),
            };
          }

          case 'scroll': {
            if (!enableInput) {
              throw new Error('Input simulation is disabled');
            }

            if (!input.direction || input.amount === undefined) {
              throw new Error('Direction and amount required for scroll action');
            }

            const success = inputSimulator
              ? await inputSimulator(input)
              : await defaultScrollSimulator(input.direction, input.amount);

            return {
              action: 'scroll',
              success,
              direction: input.direction,
              amount: input.amount,
              timestamp: new Date().toISOString(),
            };
          }

          case 'wait': {
            const waitTime = Math.min(input.amount || 1, maxWaitTime);
            await new Promise(resolve => setTimeout(resolve, waitTime * 1000));

            return {
              action: 'wait',
              success: true,
              duration: waitTime,
              timestamp: new Date().toISOString(),
            };
          }

          default:
            throw new Error(`Unknown action: ${input.action}`);
        }
      } catch (error) {
        logWarn('Computer Tool: Action failed', {
          operation: 'computer_tool_error',
          metadata: { action: input.action },
          error: error instanceof Error ? error : new Error(String(error)),
        });

        return {
          action: input.action,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        };
      }
    },
  });
}

/**
 * Simulate computer action in sandbox mode
 */
function simulateComputerAction(input: ComputerToolInput) {
  const baseResult = {
    action: input.action,
    success: true,
    sandbox: true,
    timestamp: new Date().toISOString(),
  };

  switch (input.action) {
    case 'screenshot':
      return {
        ...baseResult,
        screenshot:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        resolution: [1920, 1080],
      };

    case 'click':
    case 'double_click':
    case 'right_click':
    case 'middle_click':
      return {
        ...baseResult,
        coordinate: input.coordinate || [0, 0],
        element: 'simulated_element',
      };

    case 'move':
    case 'drag':
      return {
        ...baseResult,
        coordinate: input.coordinate || [0, 0],
        distance: Math.sqrt(
          Math.pow(input.coordinate?.[0] || 0, 2) + Math.pow(input.coordinate?.[1] || 0, 2),
        ),
      };

    case 'type':
      return {
        ...baseResult,
        textLength: input.text?.length || 0,
        words: input.text?.split(' ').length || 0,
      };

    case 'key':
      return {
        ...baseResult,
        key: input.key,
        modifiers: input.key?.includes('+') ? input.key.split('+').slice(0, -1) : [],
      };

    case 'scroll':
      return {
        ...baseResult,
        direction: input.direction,
        amount: input.amount,
        pixels: (input.amount || 0) * 100,
      };

    case 'wait':
      return {
        ...baseResult,
        duration: input.amount || 1,
      };

    default:
      return baseResult;
  }
}

/**
 * Default screenshot provider (placeholder)
 */
async function defaultScreenshotProvider(): Promise<string> {
  logInfo('Computer Tool: Taking screenshot (simulated)', {
    operation: 'computer_tool_screenshot',
  });

  // In a real implementation, this would capture the screen
  // For now, return a placeholder base64 image
  return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
}

/**
 * Default click simulator (placeholder)
 */
async function defaultClickSimulator(
  action: string,
  coordinate: [number, number],
): Promise<boolean> {
  logInfo(`Computer Tool: Simulating ${action}`, {
    operation: 'computer_tool_click',
    metadata: { action, coordinate },
  });

  // In a real implementation, this would simulate mouse clicks
  return true;
}

/**
 * Default move simulator (placeholder)
 */
async function defaultMoveSimulator(
  action: string,
  coordinate: [number, number],
): Promise<boolean> {
  logInfo(`Computer Tool: Simulating ${action}`, {
    operation: 'computer_tool_move',
    metadata: { action, coordinate },
  });

  // In a real implementation, this would move the mouse
  return true;
}

/**
 * Default type simulator (placeholder)
 */
async function defaultTypeSimulator(text: string): Promise<boolean> {
  logInfo('Computer Tool: Simulating typing', {
    operation: 'computer_tool_type',
    metadata: { textLength: text.length },
  });

  // In a real implementation, this would simulate keyboard typing
  return true;
}

/**
 * Default key simulator (placeholder)
 */
async function defaultKeySimulator(key: string): Promise<boolean> {
  logInfo('Computer Tool: Simulating key press', {
    operation: 'computer_tool_key',
    metadata: { key },
  });

  // In a real implementation, this would simulate key presses
  return true;
}

/**
 * Default scroll simulator (placeholder)
 */
async function defaultScrollSimulator(direction: string, amount: number): Promise<boolean> {
  logInfo('Computer Tool: Simulating scroll', {
    operation: 'computer_tool_scroll',
    metadata: { direction, amount },
  });

  // In a real implementation, this would simulate scrolling
  return true;
}

/**
 * Common computer tool patterns
 */
export const computerToolPatterns = {
  /**
   * Take a screenshot and click on text
   */
  screenshotAndClick: async (text: string, tool: ReturnType<typeof createComputerTool>) => {
    // Take screenshot
    const _screenshot = await tool.execute?.(
      { action: 'screenshot' },
      { toolCallId: 'screenshot', messages: [] },
    );

    // In a real implementation, would analyze screenshot for text location
    // For now, simulate finding text at coordinates
    const mockCoordinate: [number, number] = [500, 300];

    // Click on the text
    return await tool.execute?.(
      {
        action: 'click',
        coordinate: mockCoordinate,
      },
      { toolCallId: 'click', messages: [] },
    );
  },

  /**
   * Fill a form field
   */
  fillField: async (
    fieldName: string,
    value: string,
    tool: ReturnType<typeof createComputerTool>,
  ) => {
    // Click on field (would need visual recognition in real implementation)
    await tool.execute?.(
      {
        action: 'click',
        coordinate: [400, 200], // Mock coordinates
      },
      { toolCallId: 'click-field', messages: [] },
    );

    // Clear field
    await tool.execute?.(
      {
        action: 'key',
        key: 'cmd+a', // Select all
      },
      { toolCallId: 'select-all', messages: [] },
    );

    // Type new value
    return await tool.execute?.(
      {
        action: 'type',
        text: value,
      },
      { toolCallId: 'type', messages: [] },
    );
  },

  /**
   * Navigate menu
   */
  navigateMenu: async (menuPath: string[], tool: ReturnType<typeof createComputerTool>) => {
    for (const _menuItem of menuPath) {
      // Take screenshot to find menu item
      await tool.execute?.(
        { action: 'screenshot' },
        { toolCallId: 'menu-screenshot', messages: [] },
      );

      // Click on menu item (would need visual recognition)
      await tool.execute?.(
        {
          action: 'click',
          coordinate: [300, 100], // Mock coordinates
        },
        { toolCallId: 'menu-click', messages: [] },
      );

      // Wait for menu to open
      await tool.execute?.(
        {
          action: 'wait',
          amount: 0.5,
        },
        { toolCallId: 'wait', messages: [] },
      );
    }
  },
} as const;
