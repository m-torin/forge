import { anthropic } from '@ai-sdk/anthropic';
import { logInfo } from '@repo/observability/server/next';
import { ComputerToolConfig } from './types';

/**
 * Creates a Computer Tool for AI SDK that enables control of keyboard and mouse actions
 * Following the documentation: anthropic.tools.computer_20250124
 */
export function createComputerTool(config: ComputerToolConfig) {
  return anthropic.tools.computer_20250124({
    displayWidthPx: config.displayWidthPx,
    displayHeightPx: config.displayHeightPx,
    displayNumber: config.displayNumber,

    execute: async ({ action, coordinate, text }) => {
      try {
        const result = await config.execute({ action, coordinate, text });
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return `Error executing computer action: ${errorMessage}`;
      }
    },

    // Note: experimental_toToolResultContent was removed in AI SDK v5
    // Tool result content handling is now managed automatically by the SDK
  });
}

/**
 * Default computer tool implementation with basic functionality
 * Note: This is a mock implementation. In a real application, you would need
 * to implement actual computer control functionality using libraries like:
 * - robotjs (for cross-platform automation)
 * - @nut-tree/nut-js (for screen automation)
 * - node-screenshot (for screenshots)
 */
export function createDefaultComputerTool() {
  return createComputerTool({
    displayWidthPx: 1920,
    displayHeightPx: 1080,
    displayNumber: 0,

    execute: async ({ action, coordinate, text }) => {
      logInfo('Computer Tool Action', {
        operation: 'computer_tool_execute',
        action,
        coordinate,
        text,
      });

      switch (action) {
        case 'screenshot': {
          // Mock screenshot - in real implementation, use a screenshot library
          // Following the documentation example with multipart result
          const mockScreenshotData =
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='; // 1x1 transparent PNG
          return {
            type: 'image',
            data: mockScreenshotData,
          };
        }

        case 'cursor_position': {
          return 'Cursor position: (100, 100)';
        }

        case 'key':
        case 'type':
        case 'scroll':
        case 'wait':
        case 'mouse_move':
        case 'left_click':
        case 'left_click_drag':
        case 'right_click':
        case 'middle_click':
        case 'double_click':
        case 'triple_click':
        case 'hold_key':
        case 'left_mouse_down':
        case 'left_mouse_up': {
          return `executed ${action}${coordinate ? ` at ${coordinate.join(',')}` : ''}${text ? ` with text: ${text}` : ''}`;
        }

        default:
          return `Unknown action: ${action}`;
      }
    },

    toModelOutput: result => {
      // AI SDK v5: toModelOutput with proper content shapes
      if (typeof result === 'string') {
        return {
          type: 'content',
          value: [{ type: 'text', text: result }],
        };
      } else if (result.type === 'image') {
        return {
          type: 'content',
          value: [{ type: 'media', mediaType: 'image/png', data: result.data }],
        };
      }
      return {
        type: 'content',
        value: [{ type: 'text', text: 'Unknown result type' }],
      };
    },
  });
}
