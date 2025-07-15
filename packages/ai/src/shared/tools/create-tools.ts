import { createBashTool, createDefaultBashTool, createSecureBashTool } from './bash-tool';
import { createComputerTool, createDefaultComputerTool } from './computer-tool';
import {
  createDefaultTextEditorTool,
  createSecureTextEditorTool,
  createTextEditorTool,
} from './text-editor-tool';
import {
  BashToolConfig,
  ComputerToolConfig,
  SafeToolsConfig,
  SecurityConfig,
  TextEditorToolConfig,
} from './types';

export interface ToolsConfig {
  bash?: BashToolConfig;
  textEditor?: TextEditorToolConfig;
  computer?: ComputerToolConfig;
}

/**
 * Creates all AI SDK tools with custom configurations
 */
export function createTools(config?: ToolsConfig) {
  return {
    bash: config?.bash ? createBashTool(config.bash) : createDefaultBashTool(),
    textEditor: config?.textEditor
      ? createTextEditorTool(config.textEditor)
      : createDefaultTextEditorTool(),
    computer: config?.computer ? createComputerTool(config.computer) : createDefaultComputerTool(),
  };
}

/**
 * Creates secure AI SDK tools with workspace restrictions and safety controls
 */
export function createSecureTools(config: SafeToolsConfig) {
  return {
    bash: createSecureBashTool(config.security),
    str_replace_editor: createSecureTextEditorTool(config.security), // AI SDK expects this specific key
    computer: config.computer ? createComputerTool(config.computer) : createDefaultComputerTool(),
  };
}

/**
 * Creates a tools object for use with AI SDK generateText/streamText
 * Note: The text editor tool must be named 'str_replace_editor' as per documentation
 */
export function createToolsForAI(useDefaults = true) {
  if (useDefaults) {
    return {
      bash: createDefaultBashTool(),
      str_replace_editor: createDefaultTextEditorTool(), // AI SDK expects this specific key
      computer: createDefaultComputerTool(),
    };
  }

  return createTools();
}

/**
 * Creates secure tools with default safety configuration
 */
export function createSecureToolsForAI(workspacePath?: string) {
  const defaultSecurityConfig: SecurityConfig = {
    workspacePath: workspacePath || process.cwd(), // Default to current working directory
    blockedCommands: [
      'rm -rf',
      'sudo',
      'chmod 777',
      'dd if=',
      '> /dev/',
      'mkfs',
      'fdisk',
      'shutdown',
      'reboot',
      'halt',
      'poweroff',
      'init 0',
      'init 6',
      'killall',
      'pkill',
      'kill -9',
      'kill -SIGKILL',
      'chown root',
      'chmod +s',
      'setuid',
      'setgid',
      'wget',
      'curl',
      'nc',
      'netcat',
      'telnet',
      'ssh',
      'scp',
      'mount',
      'umount',
      'format',
      'wipe',
      'dd',
      'echo "password" | sudo -S',
      'su -',
      'su root',
    ],
    blockedFileExtensions: [
      '.env',
      '.key',
      '.pem',
      '.p12',
      '.pfx',
      '.crt',
      '.pem',
      '.pkey',
      '.id_rsa',
      '.id_dsa',
      '.ssh',
      '.gpg',
      '.asc',
      '.pgp',
      '.config',
      '.conf',
      '.ini',
      '.cfg',
      '.properties',
      '.htaccess',
      '.htpasswd',
      '.git',
      '.gitignore',
      '.bashrc',
      '.bash_profile',
      '.zshrc',
      '.profile',
      '.sudoers',
      '.passwd',
      '.shadow',
      '.group',
    ],
    allowedFileExtensions: [
      '.txt',
      '.md',
      '.js',
      '.ts',
      '.jsx',
      '.tsx',
      '.json',
      '.yaml',
      '.yml',
      '.css',
      '.scss',
      '.html',
      '.xml',
      '.csv',
      '.log',
      '.sql',
      '.py',
      '.rb',
      '.php',
      '.java',
      '.cpp',
      '.c',
      '.h',
      '.go',
      '.rs',
      '.sh',
      '.bash',
      '.zsh',
      '.fish',
      '.ps1',
      '.bat',
      '.vue',
      '.svelte',
      '.astro',
      '.elm',
      '.clj',
      '.hs',
      '.ml',
    ],
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxCommandOutput: 1024 * 1024, // 1MB
    requireUserConfirmation: false, // Can be enabled for extra safety
  };

  return createSecureTools({
    security: defaultSecurityConfig,
  });
}
