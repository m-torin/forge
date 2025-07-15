import { anthropic, AnthropicProviderOptions } from '@ai-sdk/anthropic';

/**
 * Anthropic Reasoning Configuration
 * Enables the model to show its thinking process
 */
export interface AnthropicReasoningConfig {
  enabled: boolean;
  budgetTokens?: number;
}

/**
 * Create Anthropic reasoning provider options
 */
export function createAnthropicReasoningOptions(
  config: AnthropicReasoningConfig,
): AnthropicProviderOptions | undefined {
  if (!config.enabled) return undefined;

  return {
    thinking: {
      type: 'enabled',
      budgetTokens: config.budgetTokens ?? 12000,
    },
  };
}

/**
 * Anthropic Computer Tools
 * Built-in tools for bash, text editing, and computer control
 */

// Bash Tool for running commands
export const createAnthropicBashTool = () => {
  return anthropic.tools.bash_20250124({
    execute: async ({ command, restart }) => {
      if (restart) {
        return 'Bash tool restarted successfully.';
      }

      if (!command) {
        throw new Error('No command provided');
      }

      // Security: Only allow safe commands
      const safeCommands = [
        'ls',
        'pwd',
        'whoami',
        'date',
        'echo',
        'cat',
        'head',
        'tail',
        'grep',
        'find',
        'wc',
        'sort',
        'uniq',
        'ps',
        'top',
        'df',
        'du',
      ];

      const isSafe = safeCommands.some(
        safe => command.trim().startsWith(safe + ' ') || command.trim() === safe,
      );

      if (!isSafe) {
        return `Command '${command}' is not allowed for security reasons. Safe commands include: ${safeCommands.join(', ')}`;
      }

      try {
        // In a real implementation, you would execute the command
        // For now, we'll simulate the response
        return `[Simulated] Executed: ${command}\nOutput: Command executed successfully`;
      } catch (error) {
        return `Error executing command: ${error}`;
      }
    },
  });
};

// Text Editor Tool for file operations
export const createAnthropicTextEditorTool = () => {
  return anthropic.tools.textEditor_20250124({
    execute: async ({
      command,
      path,
      file_text,
      insert_line,
      new_str,
      old_str,
      view_range: _view_range,
    }) => {
      switch (command) {
        case 'view':
          if (!path) return 'Error: Path is required for view command';
          // Simulate viewing a file
          return `[Simulated] Viewing file: ${path}\nContent: This is a simulated file content.`;

        case 'create':
          if (!path || !file_text) {
            return 'Error: Path and file_text are required for create command';
          }
          // Simulate creating a file
          return `[Simulated] Created file: ${path}\nContent: ${file_text}`;

        case 'str_replace':
          if (!path || !old_str || !new_str) {
            return 'Error: Path, old_str, and new_str are required for str_replace command';
          }
          // Simulate string replacement
          return `[Simulated] Replaced '${old_str}' with '${new_str}' in ${path}`;

        case 'insert':
          if (!path || !insert_line || !new_str) {
            return 'Error: Path, insert_line, and new_str are required for insert command';
          }
          // Simulate inserting text
          return `[Simulated] Inserted text at line ${insert_line} in ${path}`;

        case 'undo_edit':
          if (!path) return 'Error: Path is required for undo_edit command';
          // Simulate undoing edit
          return `[Simulated] Undid last edit in ${path}`;

        default:
          return `Unknown command: ${command}`;
      }
    },
  });
};

// Computer Tool for system control
export const createAnthropicComputerTool = () => {
  return anthropic.tools.computer_20250124({
    displayWidthPx: 1920,
    displayHeightPx: 1080,
    displayNumber: 0,

    execute: async ({ action, coordinate, text }) => {
      switch (action) {
        case 'screenshot':
          // Return a simulated screenshot
          return {
            type: 'image',
            data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', // 1x1 transparent PNG
          };

        case 'key':
          if (!text) return 'Error: Text is required for key action';
          return `[Simulated] Pressed key: ${text}`;

        case 'type':
          if (!text) return 'Error: Text is required for type action';
          return `[Simulated] Typed: ${text}`;

        case 'mouse_move':
          if (!coordinate || coordinate.length !== 2) {
            return 'Error: Coordinate [x, y] is required for mouse_move action';
          }
          return `[Simulated] Moved mouse to (${coordinate[0]}, ${coordinate[1]})`;

        case 'left_click':
          if (coordinate && coordinate.length === 2) {
            return `[Simulated] Left clicked at (${coordinate[0]}, ${coordinate[1]})`;
          }
          return '[Simulated] Left clicked at current position';

        case 'right_click':
          if (coordinate && coordinate.length === 2) {
            return `[Simulated] Right clicked at (${coordinate[0]}, ${coordinate[1]})`;
          }
          return '[Simulated] Right clicked at current position';

        case 'double_click':
          if (coordinate && coordinate.length === 2) {
            return `[Simulated] Double clicked at (${coordinate[0]}, ${coordinate[1]})`;
          }
          return '[Simulated] Double clicked at current position';

        case 'cursor_position':
          return '[Simulated] Current cursor position: (960, 540)';

        default:
          return `[Simulated] Executed action: ${action}`;
      }
    },

    // Map tool results for LLM consumption
    experimental_toToolResultContent(result) {
      if (typeof result === 'string') {
        return [{ type: 'text', text: result }];
      }
      return [{ type: 'image', data: result.data, mimeType: 'image/png' }];
    },
  });
};

/**
 * Create all Anthropic computer tools
 */
export function createAnthropicComputerTools() {
  return {
    bash: createAnthropicBashTool(),
    str_replace_editor: createAnthropicTextEditorTool(),
    computer: createAnthropicComputerTool(),
  };
}
