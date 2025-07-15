import { anthropic } from '@ai-sdk/anthropic';
import path from 'path';
import { BashToolConfig, SecurityConfig } from './types';

/**
 * Creates a Bash Tool for AI SDK that allows running bash commands
 * Following the documentation: anthropic.tools.bash_20250124
 */
export function createBashTool(config: BashToolConfig) {
  return anthropic.tools.bash_20250124({
    execute: async ({ command, restart }) => {
      try {
        if (restart) {
          return 'Bash tool restarted successfully';
        }

        if (!command) {
          throw new Error('Command is required');
        }

        return await config.execute({ command, restart });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return `Error executing command: ${errorMessage}`;
      }
    },
  });
}

/**
 * Creates a secure bash tool with workspace restrictions and command filtering
 */
export function createSecureBashTool(securityConfig: SecurityConfig) {
  return createBashTool({
    execute: async ({ command }) => {
      // Security validation
      const validationResult = validateBashCommand(command, securityConfig);
      if (!validationResult.allowed) {
        return `Command blocked for security reasons: ${validationResult.reason}`;
      }

      const { exec } = await import('child_process');
      const { promisify } = await import('util');

      const execAsync = promisify(exec);

      try {
        const { stdout, stderr } = await execAsync(command, {
          timeout: 30000, // 30 second timeout
          maxBuffer: securityConfig.maxCommandOutput || 1024 * 1024, // Configurable buffer
          cwd: securityConfig.workspacePath, // Restrict to workspace
        });

        if (stderr) {
          return `STDOUT:\n${stdout}\n\nSTDERR:\n${stderr}`;
        }

        return stdout || 'Command executed successfully (no output)';
      } catch (error: any) {
        if (error.code === 'ETIMEDOUT') {
          return 'Command timed out after 30 seconds';
        }
        return `Error: ${error.message}`;
      }
    },
  });
}

/**
 * Default bash tool implementation that uses Node.js child_process
 */
export function createDefaultBashTool() {
  return createBashTool({
    execute: async ({ command }) => {
      const { exec } = await import('child_process');
      const { promisify } = await import('util');

      const execAsync = promisify(exec);

      try {
        const { stdout, stderr } = await execAsync(command, {
          timeout: 30000, // 30 second timeout
          maxBuffer: 1024 * 1024, // 1MB buffer
        });

        if (stderr) {
          return `STDOUT:\n${stdout}\n\nSTDERR:\n${stderr}`;
        }

        return stdout || 'Command executed successfully (no output)';
      } catch (error: any) {
        if (error.code === 'ETIMEDOUT') {
          return 'Command timed out after 30 seconds';
        }
        return `Error: ${error.message}`;
      }
    },
  });
}

/**
 * Validates bash commands against security configuration
 */
function validateBashCommand(
  command: string,
  securityConfig: SecurityConfig,
): { allowed: boolean; reason?: string } {
  // Check for dangerous commands
  const dangerousCommands = securityConfig.blockedCommands || [
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
  ];

  for (const dangerous of dangerousCommands) {
    if (command.includes(dangerous)) {
      return { allowed: false, reason: `Dangerous command pattern: ${dangerous}` };
    }
  }

  // Check whitelist if provided
  if (securityConfig.allowedCommands && securityConfig.allowedCommands.length > 0) {
    const isAllowed = securityConfig.allowedCommands.some(
      allowed => command.startsWith(allowed) || command.includes(allowed),
    );
    if (!isAllowed) {
      return { allowed: false, reason: 'Command not in allowed list' };
    }
  }

  // Check for path traversal attempts
  if (command.includes('../') || command.includes('..\\')) {
    return { allowed: false, reason: 'Path traversal attempt detected' };
  }

  // Check for absolute paths outside workspace
  if (securityConfig.workspacePath) {
    const workspacePath = path.resolve(securityConfig.workspacePath);
    const commandPath = path.resolve(command);

    if (!commandPath.startsWith(workspacePath)) {
      return { allowed: false, reason: 'Command attempts to access files outside workspace' };
    }
  }

  return { allowed: true };
}
