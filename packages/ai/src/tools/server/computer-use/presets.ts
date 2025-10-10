/**
 * Computer Use Tool Presets
 * Pre-configured tool combinations for common use cases
 */

import type { Tool } from 'ai';
import { createComputerUseTools, createSecureComputerUseTools } from './utilities';

/**
 * Development preset - Full access for development tasks
 */
export function createDevelopmentPreset(): Record<string, Tool> {
  const tools = createComputerUseTools({
    enableAll: true,
    sandbox: false,
    bash: {
      enableExecution: true,
      maxOutputSize: 10 * 1024 * 1024, // 10MB
      defaultTimeout: 60000, // 1 minute
    },
    textEditor: {
      allowCreate: true,
      allowEdit: true,
      maxFileSize: 50 * 1024 * 1024, // 50MB
      allowedExtensions: [], // Allow all extensions
    },
    computer: {
      enableScreenshot: true,
      enableInput: true,
      maxWaitTime: 60,
    },
  });

  return tools.all;
}

/**
 * Testing preset - Sandbox mode for safe testing
 */
export function createTestingPreset(): Record<string, Tool> {
  const tools = createComputerUseTools({
    enableAll: true,
    sandbox: true, // All operations are simulated
    bash: {
      enableExecution: true,
      sandbox: true,
    },
    textEditor: {
      allowCreate: true,
      allowEdit: true,
      sandbox: true,
    },
    computer: {
      enableScreenshot: true,
      enableInput: true,
      sandbox: true,
    },
  });

  return tools.all;
}

/**
 * Research preset - Read-only access for analysis
 */
export function createResearchPreset(): Record<string, Tool> {
  const tools = createSecureComputerUseTools({
    bash: {
      enableExecution: true,
      allowedCommands: [
        /^ls(\s|$)/,
        /^find\s/,
        /^grep\s/,
        /^cat\s/,
        /^head\s/,
        /^tail\s/,
        /^wc\s/,
        /^file\s/,
        /^stat\s/,
      ],
    },
    textEditor: {
      allowCreate: false,
      allowEdit: false, // Read-only
      allowedExtensions: [
        '.txt',
        '.md',
        '.json',
        '.yml',
        '.yaml',
        '.js',
        '.ts',
        '.py',
        '.java',
        '.cpp',
        '.c',
        '.html',
        '.css',
        '.xml',
        '.csv',
      ],
    },
    computer: {
      enableScreenshot: true,
      enableInput: false, // No input simulation
    },
  });

  return tools.all;
}

/**
 * Documentation preset - For creating and editing documentation
 */
export function createDocumentationPreset(): Record<string, Tool> {
  const tools = createComputerUseTools({
    bash: {
      enableExecution: true,
      allowedCommands: [/^ls(\s|$)/, /^mkdir\s/, /^touch\s/, /^mv\s/, /^cp\s/, /^echo\s/, /^cat\s/],
    },
    textEditor: {
      allowCreate: true,
      allowEdit: true,
      allowedExtensions: ['.md', '.mdx', '.txt', '.rst', '.adoc', '.tex', '.html', '.xml'],
      deniedPatterns: [/node_modules/, /\.git/, /dist/, /build/],
    },
    computer: {
      enableScreenshot: true,
      enableInput: true,
    },
  });

  return tools.all;
}

/**
 * Web automation preset - For browser automation tasks
 */
export function createWebAutomationPreset(): Record<string, Tool> {
  const tools = createComputerUseTools({
    bash: {
      enableExecution: false, // Disable bash for web automation
    },
    textEditor: {
      allowCreate: true,
      allowEdit: false,
      allowedExtensions: ['.json', '.csv', '.txt'], // For saving data
    },
    computer: {
      enableScreenshot: true,
      enableInput: true,
      maxWaitTime: 30,
    },
  });

  return {
    computer_20241022: tools.computer,
    textEditor_20241022: tools.textEditor,
  };
}

/**
 * Data processing preset - For data manipulation tasks
 */
export function createDataProcessingPreset(): Record<string, Tool> {
  const tools = createComputerUseTools({
    bash: {
      enableExecution: true,
      allowedCommands: [
        /^python\s/,
        /^node\s/,
        /^jq\s/,
        /^awk\s/,
        /^sed\s/,
        /^sort\s/,
        /^uniq\s/,
        /^cut\s/,
        /^paste\s/,
        /^join\s/,
      ],
      maxOutputSize: 50 * 1024 * 1024, // 50MB for large datasets
    },
    textEditor: {
      allowCreate: true,
      allowEdit: true,
      allowedExtensions: ['.json', '.csv', '.tsv', '.txt', '.xml', '.yml', '.yaml', '.sql'],
      maxFileSize: 100 * 1024 * 1024, // 100MB
    },
    computer: {
      enableScreenshot: false, // Not needed for data processing
      enableInput: false,
    },
  });

  return {
    bash_20241022: tools.bash,
    textEditor_20241022: tools.textEditor,
  };
}

/**
 * System administration preset - For system management tasks
 */
export function createSystemAdminPreset(): Record<string, Tool> {
  const tools = createComputerUseTools({
    bash: {
      enableExecution: true,
      // Be very careful with system admin commands
      deniedCommands: [/rm\s+-rf\s+\//, /mkfs/, /dd\s+if=/, /format/],
      defaultTimeout: 300000, // 5 minutes for long operations
    },
    textEditor: {
      allowCreate: true,
      allowEdit: true,
      allowedExtensions: [
        '.conf',
        '.cfg',
        '.ini',
        '.yml',
        '.yaml',
        '.service',
        '.sh',
        '.bash',
        '.zsh',
        '.log',
        '.txt',
      ],
    },
    computer: {
      enableScreenshot: true,
      enableInput: true,
    },
  });

  return tools.all;
}

/**
 * Code review preset - For reviewing code without modifications
 */
export function createCodeReviewPreset(): Record<string, Tool> {
  const tools = createSecureComputerUseTools({
    bash: {
      enableExecution: true,
      allowedCommands: [
        /^git\s+(status|log|diff|show|branch|remote)/,
        /^grep\s/,
        /^find\s/,
        /^ag\s/, // Silver searcher
        /^rg\s/, // Ripgrep
        /^cloc\s/, // Count lines of code
      ],
    },
    textEditor: {
      allowCreate: false,
      allowEdit: false,
      allowedExtensions: [], // Allow all for viewing
      maxFileSize: 10 * 1024 * 1024, // 10MB
    },
    computer: {
      enableScreenshot: true,
      enableInput: false,
    },
  });

  return tools.all;
}

/**
 * Preset registry
 */
export const computerUsePresets = {
  development: createDevelopmentPreset,
  testing: createTestingPreset,
  research: createResearchPreset,
  documentation: createDocumentationPreset,
  webAutomation: createWebAutomationPreset,
  dataProcessing: createDataProcessingPreset,
  systemAdmin: createSystemAdminPreset,
  codeReview: createCodeReviewPreset,
} as const;

/**
 * Get preset by name
 */
export function getComputerUsePreset(
  presetName: keyof typeof computerUsePresets,
): Record<string, Tool> {
  const presetFactory = computerUsePresets[presetName];
  if (!presetFactory) {
    throw new Error(`Unknown preset: ${presetName}`);
  }
  return presetFactory();
}

/**
 * Combine multiple presets
 */
export function combinePresets(
  ...presetNames: Array<keyof typeof computerUsePresets>
): Record<string, Tool> {
  const combined: Record<string, Tool> = {};

  for (const presetName of presetNames) {
    const preset = getComputerUsePreset(presetName);
    Object.assign(combined, preset);
  }

  return combined;
}

/**
 * Create custom preset with specific tool selection
 */
export function createCustomPreset(options: {
  includeComputer?: boolean;
  includeBash?: boolean;
  includeTextEditor?: boolean;
  config?: Parameters<typeof createComputerUseTools>[0];
}): Record<string, Tool> {
  const {
    includeComputer = true,
    includeBash = true,
    includeTextEditor = true,
    config = {},
  } = options;

  const tools = createComputerUseTools(config);
  const selected: Record<string, Tool> = {};

  if (includeComputer) {
    selected.computer_20241022 = tools.computer;
  }
  if (includeBash) {
    selected.bash_20241022 = tools.bash;
  }
  if (includeTextEditor) {
    selected.textEditor_20241022 = tools.textEditor;
  }

  return selected;
}
