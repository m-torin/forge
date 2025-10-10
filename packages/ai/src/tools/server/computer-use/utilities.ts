/**
 * Utility functions for computer use tools
 */

import { type Tool } from 'ai';
import { createBashTool, type BashToolConfig } from './bash-tool';
import { createComputerTool, type ComputerToolConfig } from './computer-tool';
import { createTextEditorTool, type TextEditorConfig } from './text-editor-tool';

/**
 * Combined computer use tools configuration
 */
export interface ComputerUseToolsConfig {
  computer?: ComputerToolConfig;
  bash?: BashToolConfig;
  textEditor?: TextEditorConfig;
  /** Enable all tools by default */
  enableAll?: boolean;
  /** Sandbox mode for all tools */
  sandbox?: boolean;
}

/**
 * Create all computer use tools with a single configuration
 */
export function createComputerUseTools(config: ComputerUseToolsConfig = {}): {
  computer: Tool;
  bash: Tool;
  textEditor: Tool;
  all: Record<string, Tool>;
} {
  const {
    computer: computerConfig = {},
    bash: bashConfig = {},
    textEditor: textEditorConfig = {},
    enableAll = true,
    sandbox = false,
  } = config;

  // Apply global sandbox setting
  const computer = createComputerTool({
    ...computerConfig,
    sandbox: computerConfig.sandbox ?? sandbox,
    enableScreenshot: enableAll && (computerConfig.enableScreenshot ?? true),
    enableInput: enableAll && (computerConfig.enableInput ?? true),
  });

  const bash = createBashTool({
    ...bashConfig,
    sandbox: bashConfig.sandbox ?? sandbox,
    enableExecution: enableAll && (bashConfig.enableExecution ?? true),
  });

  const textEditor = createTextEditorTool({
    ...textEditorConfig,
    sandbox: textEditorConfig.sandbox ?? sandbox,
    allowCreate: enableAll && (textEditorConfig.allowCreate ?? true),
    allowEdit: enableAll && (textEditorConfig.allowEdit ?? true),
  });

  return {
    computer,
    bash,
    textEditor,
    all: {
      computer_20241022: computer,
      bash_20241022: bash,
      textEditor_20241022: textEditor,
    },
  };
}

/**
 * Create secure computer use tools with strict limitations
 */
export function createSecureComputerUseTools(config: ComputerUseToolsConfig = {}): {
  computer: Tool;
  bash: Tool;
  textEditor: Tool;
  all: Record<string, Tool>;
} {
  return createComputerUseTools({
    ...config,
    computer: {
      enableScreenshot: true,
      enableInput: false, // Disable input simulation for security
      sandbox: true,
      ...config.computer,
    },
    bash: {
      enableExecution: true,
      allowedCommands: [/^ls(\s|$)/, /^pwd$/, /^echo\s/, /^cat\s/, /^grep\s/, /^find\s/, /^date$/],
      maxOutputSize: 100 * 1024, // 100KB
      defaultTimeout: 5000, // 5 seconds
      ...config.bash,
    },
    textEditor: {
      allowCreate: false,
      allowEdit: false, // Read-only by default
      allowedExtensions: ['.txt', '.md', '.log'],
      maxFileSize: 1024 * 1024, // 1MB
      ...config.textEditor,
    },
  });
}

/**
 * Tool orchestration patterns
 */
export const computerUsePatterns = {
  /**
   * Take screenshot, find element, and click
   */
  screenshotFindAndClick: async (
    elementDescription: string,
    tools: ReturnType<typeof createComputerUseTools>,
  ) => {
    // Take screenshot
    const screenshot = await tools.computer.execute?.(
      { action: 'screenshot' },
      { toolCallId: 'screenshot', messages: [] },
    );

    // In a real implementation, would use computer vision to find element
    // For now, simulate finding element at coordinates
    const mockCoordinates: [number, number] = [500, 300];

    // Click on element
    const clickResult = await tools.computer.execute?.(
      {
        action: 'click',
        coordinate: mockCoordinates,
      },
      { toolCallId: 'click', messages: [] },
    );

    return {
      screenshot: screenshot.screenshot,
      elementDescription,
      coordinate: mockCoordinates,
      clickResult,
    };
  },

  /**
   * Execute command and capture output to file
   */
  executeAndCapture: async (
    command: string,
    outputFile: string,
    tools: ReturnType<typeof createComputerUseTools>,
  ) => {
    // Execute command
    const bashResult = await tools.bash.execute?.(
      { command },
      { toolCallId: 'bash', messages: [] },
    );

    // Write output to file
    const content = `Command: ${command}

STDOUT:
${bashResult.stdout}

STDERR:
${bashResult.stderr}

Exit Code: ${bashResult.exitCode}`;

    const writeResult = await tools.textEditor.execute?.(
      {
        command: 'create',
        path: outputFile,
        content,
      },
      { toolCallId: 'text-editor', messages: [] },
    );

    return {
      bashResult,
      writeResult,
      outputFile,
    };
  },

  /**
   * Find and modify configuration
   */
  modifyConfiguration: async (
    configFile: string,
    key: string,
    value: string,
    tools: ReturnType<typeof createComputerUseTools>,
  ) => {
    // Search for key in file
    const searchResult = await tools.textEditor.execute?.(
      {
        command: 'search',
        path: configFile,
        searchTerm: key,
      },
      { toolCallId: 'text-editor', messages: [] },
    );

    if (!searchResult.matches || searchResult.matches.length === 0) {
      throw new Error(`Key "${key}" not found in ${configFile}`);
    }

    // Replace the line containing the key
    const match = searchResult.matches[0];
    const oldLine = match.content;
    const newLine = `${key} = ${value}`;

    const replaceResult = await tools.textEditor.execute?.(
      {
        command: 'str_replace_editor',
        path: configFile,
        oldStr: oldLine,
        newStr: newLine,
      },
      { toolCallId: 'text-editor', messages: [] },
    );

    return {
      configFile,
      key,
      oldValue: oldLine,
      newValue: newLine,
      replaceResult,
    };
  },

  /**
   * Interactive form filling
   */
  fillForm: async (
    formData: Record<string, string>,
    tools: ReturnType<typeof createComputerUseTools>,
  ) => {
    const results = [];

    for (const [fieldName, value] of Object.entries(formData)) {
      // Take screenshot to see current state
      await tools.computer.execute?.(
        { action: 'screenshot' },
        { toolCallId: 'screenshot', messages: [] },
      );

      // In real implementation, would find field position
      // For now, simulate field positions
      const fieldPosition: [number, number] = [400, 200 + results.length * 50];

      // Click on field
      await tools.computer.execute?.(
        {
          action: 'click',
          coordinate: fieldPosition,
        },
        { toolCallId: 'click', messages: [] },
      );

      // Clear field
      await tools.computer.execute?.(
        {
          action: 'key',
          key: 'cmd+a',
        },
        { toolCallId: 'key', messages: [] },
      );

      // Type value
      const typeResult = await tools.computer.execute?.(
        {
          action: 'type',
          text: value,
        },
        { toolCallId: 'type', messages: [] },
      );

      results.push({
        field: fieldName,
        value,
        result: typeResult,
      });

      // Tab to next field
      await tools.computer.execute?.(
        {
          action: 'key',
          key: 'Tab',
        },
        { toolCallId: 'tab', messages: [] },
      );
    }

    return results;
  },

  /**
   * Monitor process and capture output
   */
  monitorProcess: async (
    processName: string,
    duration: number,
    tools: ReturnType<typeof createComputerUseTools>,
  ) => {
    const startTime = Date.now();
    const snapshots = [];

    while (Date.now() - startTime < duration * 1000) {
      // Check process
      const psResult = await tools.bash.execute?.(
        {
          command: `ps aux | grep ${processName} | grep -v grep`,
        },
        { toolCallId: 'bash', messages: [] },
      );

      // Take screenshot
      const screenshot = await tools.computer.execute?.(
        { action: 'screenshot' },
        { toolCallId: 'screenshot', messages: [] },
      );

      snapshots.push({
        timestamp: new Date().toISOString(),
        processInfo: psResult.stdout,
        screenshot: screenshot.screenshot,
      });

      // Wait before next check
      await tools.computer.execute?.(
        {
          action: 'wait',
          amount: 5, // 5 seconds between checks
        },
        { toolCallId: 'wait', messages: [] },
      );
    }

    // Save report
    const report = snapshots
      .map(
        s => `Timestamp: ${s.timestamp}
Process Info:
${s.processInfo}
`,
      )
      .join('\n---\n');

    await tools.textEditor.execute?.(
      {
        command: 'create',
        path: `${processName}_monitor_${Date.now()}.log`,
        content: report,
      },
      { toolCallId: 'text-editor', messages: [] },
    );

    return {
      processName,
      duration,
      snapshotCount: snapshots.length,
      reportFile: `${processName}_monitor_${Date.now()}.log`,
    };
  },
} as const;

/**
 * Validation utilities
 */
export const validationUtils = {
  /**
   * Validate coordinate is within screen bounds
   */
  validateCoordinate: (coordinate: [number, number], screenSize: [number, number]): boolean => {
    const [x, y] = coordinate;
    const [width, height] = screenSize;
    return x >= 0 && x <= width && y >= 0 && y <= height;
  },

  /**
   * Validate command is safe
   */
  validateCommand: (command: string, deniedPatterns: RegExp[]): boolean => {
    return !deniedPatterns.some(pattern => pattern.test(command));
  },

  /**
   * Validate file path is safe
   */
  validateFilePath: (path: string, allowedPaths: string[]): boolean => {
    return allowedPaths.some(allowed => path.startsWith(allowed));
  },
};

/**
 * Export all tool names for reference
 */
export const COMPUTER_USE_TOOL_NAMES = {
  COMPUTER: 'computer_20241022',
  BASH: 'bash_20241022',
  TEXT_EDITOR: 'textEditor_20241022',
} as const;
