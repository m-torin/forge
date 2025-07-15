import { anthropic } from '@ai-sdk/anthropic';
import { promises as fs } from 'fs';
import path from 'path';
import { SecurityConfig, TextEditorToolConfig } from './types';

/**
 * Creates a Text Editor Tool for AI SDK that provides file viewing and editing capabilities
 * Following the documentation: anthropic.tools.textEditor_20250124
 * Note: When using this tool, the key in the tools object must be named 'str_replace_editor'
 */
export function createTextEditorTool(config: TextEditorToolConfig) {
  return anthropic.tools.textEditor_20250124({
    execute: async ({
      command,
      path: filePath,
      file_text,
      insert_line,
      new_str,
      old_str,
      view_range,
    }) => {
      try {
        return await config.execute({
          command,
          path: filePath,
          file_text,
          insert_line,
          new_str,
          old_str,
          view_range,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return `Error in text editor operation: ${errorMessage}`;
      }
    },
  });
}

/**
 * Creates a secure text editor tool with workspace restrictions and file type filtering
 */
export function createSecureTextEditorTool(securityConfig: SecurityConfig) {
  return createTextEditorTool({
    execute: async ({
      command,
      path: filePath,
      file_text,
      insert_line,
      new_str,
      old_str,
      view_range,
    }) => {
      const absolutePath = path.resolve(filePath);

      // Security validation
      const validationResult = validateFilePath(absolutePath, securityConfig);
      if (!validationResult.allowed) {
        throw new Error(`Access denied: ${validationResult.reason}`);
      }

      // Check file size for read operations
      if (command === 'view' || command === 'str_replace' || command === 'insert') {
        try {
          // eslint-disable-next-line security/detect-non-literal-fs-filename -- Dynamic file stats for size checking
          const stats = await fs.stat(absolutePath);
          if (stats.size > (securityConfig.maxFileSize || 10 * 1024 * 1024)) {
            // Default 10MB
            throw new Error(
              `File too large: ${stats.size} bytes (max: ${securityConfig.maxFileSize || 10 * 1024 * 1024} bytes)`,
            );
          }
        } catch (error: any) {
          if (error.code !== 'ENOENT') {
            throw error;
          }
        }
      }

      switch (command) {
        case 'view': {
          try {
            // eslint-disable-next-line security/detect-non-literal-fs-filename -- Dynamic file stats for directory checking
            const stats = await fs.stat(absolutePath);

            if (stats.isDirectory()) {
              // eslint-disable-next-line security/detect-non-literal-fs-filename -- Dynamic directory reading for listing
              const files = await fs.readdir(absolutePath);
              return `Directory contents of ${filePath}:\n${files.join('\n')}`;
            }

            // eslint-disable-next-line security/detect-non-literal-fs-filename -- Dynamic file reading for text editor
            const content = await fs.readFile(absolutePath, 'utf-8');

            if (view_range && view_range.length === 2) {
              const lines = content.split('\n');
              const [start, end] = view_range;
              const selectedLines = lines.slice(start - 1, end);
              return `Lines ${start}-${end} of ${filePath}:\n${selectedLines.join('\n')}`;
            }

            return `Content of ${filePath}:\n${content}`;
          } catch (error: any) {
            if (error.code === 'ENOENT') {
              return `File not found: ${filePath}`;
            }
            throw error;
          }
        }

        case 'create': {
          if (!file_text) {
            throw new Error('file_text is required for create command');
          }

          // Ensure directory exists
          const dir = path.dirname(absolutePath);
          // eslint-disable-next-line security/detect-non-literal-fs-filename -- Dynamic directory creation for text editor
          await fs.mkdir(dir, { recursive: true });

          // eslint-disable-next-line security/detect-non-literal-fs-filename -- Dynamic file writing for text editor
          await fs.writeFile(absolutePath, file_text, 'utf-8');
          return `File created successfully: ${filePath}`;
        }

        case 'str_replace': {
          if (!old_str || !new_str) {
            throw new Error('old_str and new_str are required for str_replace command');
          }

          // eslint-disable-next-line security/detect-non-literal-fs-filename -- Dynamic file reading for string replacement
          const content = await fs.readFile(absolutePath, 'utf-8');
          // eslint-disable-next-line security/detect-non-literal-regexp -- Dynamic regex for string replacement
          const newContent = content.replace(new RegExp(old_str, 'g'), new_str);
          // eslint-disable-next-line security/detect-non-literal-fs-filename -- Dynamic file writing after string replacement
          await fs.writeFile(absolutePath, newContent, 'utf-8');
          return `String replacement completed in ${filePath}`;
        }

        case 'insert': {
          if (insert_line === undefined || !new_str) {
            throw new Error('insert_line and new_str are required for insert command');
          }

          // eslint-disable-next-line security/detect-non-literal-fs-filename -- Dynamic file reading for line insertion
          const content = await fs.readFile(absolutePath, 'utf-8');
          const lines = content.split('\n');

          if (insert_line < 0 || insert_line > lines.length) {
            throw new Error(`Invalid line number: ${insert_line}. File has ${lines.length} lines.`);
          }

          lines.splice(insert_line, 0, new_str);
          const newContent = lines.join('\n');
          // eslint-disable-next-line security/detect-non-literal-fs-filename -- Dynamic file writing after line insertion
          await fs.writeFile(absolutePath, newContent, 'utf-8');
          return `Line inserted at position ${insert_line} in ${filePath}`;
        }

        case 'undo_edit': {
          // Note: This is a simplified implementation
          // In a real application, you might want to implement a proper undo system
          return 'Undo functionality not implemented in this version';
        }

        default:
          throw new Error(`Unknown command: ${command}`);
      }
    },
  });
}

/**
 * Default text editor tool implementation with file system operations
 */
export function createDefaultTextEditorTool() {
  return createTextEditorTool({
    execute: async ({
      command,
      path: filePath,
      file_text,
      insert_line,
      new_str,
      old_str,
      view_range,
    }) => {
      const absolutePath = path.resolve(filePath);

      // Security check: prevent access to sensitive directories
      const sensitivePaths = ['/etc', '/var', '/usr', '/bin', '/sbin', '/dev', '/proc', '/sys'];
      if (sensitivePaths.some(sensitivePath => absolutePath.startsWith(sensitivePath))) {
        throw new Error('Access denied: Cannot access system directories');
      }

      switch (command) {
        case 'view': {
          try {
            // eslint-disable-next-line security/detect-non-literal-fs-filename -- Dynamic file stats for directory checking
            const stats = await fs.stat(absolutePath);

            if (stats.isDirectory()) {
              // eslint-disable-next-line security/detect-non-literal-fs-filename -- Dynamic directory reading for listing
              const files = await fs.readdir(absolutePath);
              return `Directory contents of ${filePath}:\n${files.join('\n')}`;
            }

            // eslint-disable-next-line security/detect-non-literal-fs-filename -- Dynamic file reading for text editor
            const content = await fs.readFile(absolutePath, 'utf-8');

            if (view_range && view_range.length === 2) {
              const lines = content.split('\n');
              const [start, end] = view_range;
              const selectedLines = lines.slice(start - 1, end);
              return `Lines ${start}-${end} of ${filePath}:\n${selectedLines.join('\n')}`;
            }

            return `Content of ${filePath}:\n${content}`;
          } catch (error: any) {
            if (error.code === 'ENOENT') {
              return `File not found: ${filePath}`;
            }
            throw error;
          }
        }

        case 'create': {
          if (!file_text) {
            throw new Error('file_text is required for create command');
          }

          // Ensure directory exists
          const dir = path.dirname(absolutePath);
          // eslint-disable-next-line security/detect-non-literal-fs-filename -- Dynamic directory creation for text editor
          await fs.mkdir(dir, { recursive: true });

          // eslint-disable-next-line security/detect-non-literal-fs-filename -- Dynamic file writing for text editor
          await fs.writeFile(absolutePath, file_text, 'utf-8');
          return `File created successfully: ${filePath}`;
        }

        case 'str_replace': {
          if (!old_str || !new_str) {
            throw new Error('old_str and new_str are required for str_replace command');
          }

          // eslint-disable-next-line security/detect-non-literal-fs-filename -- Dynamic file reading for string replacement
          const content = await fs.readFile(absolutePath, 'utf-8');
          // eslint-disable-next-line security/detect-non-literal-regexp -- Dynamic regex for string replacement
          const newContent = content.replace(new RegExp(old_str, 'g'), new_str);
          // eslint-disable-next-line security/detect-non-literal-fs-filename -- Dynamic file writing after string replacement
          await fs.writeFile(absolutePath, newContent, 'utf-8');
          return `String replacement completed in ${filePath}`;
        }

        case 'insert': {
          if (insert_line === undefined || !new_str) {
            throw new Error('insert_line and new_str are required for insert command');
          }

          // eslint-disable-next-line security/detect-non-literal-fs-filename -- Dynamic file reading for line insertion
          const content = await fs.readFile(absolutePath, 'utf-8');
          const lines = content.split('\n');

          if (insert_line < 0 || insert_line > lines.length) {
            throw new Error(`Invalid line number: ${insert_line}. File has ${lines.length} lines.`);
          }

          lines.splice(insert_line, 0, new_str);
          const newContent = lines.join('\n');
          // eslint-disable-next-line security/detect-non-literal-fs-filename -- Dynamic file writing after line insertion
          await fs.writeFile(absolutePath, newContent, 'utf-8');
          return `Line inserted at position ${insert_line} in ${filePath}`;
        }

        case 'undo_edit': {
          // Note: This is a simplified implementation
          // In a real application, you might want to implement a proper undo system
          return 'Undo functionality not implemented in this version';
        }

        default:
          throw new Error(`Unknown command: ${command}`);
      }
    },
  });
}

/**
 * Validates file paths against security configuration
 */
function validateFilePath(
  filePath: string,
  securityConfig: SecurityConfig,
): { allowed: boolean; reason?: string } {
  // Check workspace restrictions
  if (securityConfig.workspacePath) {
    const workspacePath = path.resolve(securityConfig.workspacePath);
    if (!filePath.startsWith(workspacePath)) {
      return {
        allowed: false,
        reason: `File path must be within workspace (${securityConfig.workspacePath})`,
      };
    }
  }

  // Check for path traversal attempts
  if (filePath.includes('../') || filePath.includes('..\\')) {
    return { allowed: false, reason: 'Path traversal attempt detected' };
  }

  // Check blocked file extensions
  const blockedExtensions = securityConfig.blockedFileExtensions || [
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
  ];

  const fileExtension = path.extname(filePath).toLowerCase();
  if (blockedExtensions.includes(fileExtension)) {
    return { allowed: false, reason: `Access denied: File extension ${fileExtension} is blocked` };
  }

  // Check allowed file extensions if whitelist is provided
  if (securityConfig.allowedFileExtensions && securityConfig.allowedFileExtensions.length > 0) {
    if (!securityConfig.allowedFileExtensions.includes(fileExtension)) {
      return { allowed: false, reason: `File extension ${fileExtension} not in allowed list` };
    }
  }

  // Check for sensitive system directories
  const sensitivePaths = [
    '/etc',
    '/var',
    '/usr',
    '/bin',
    '/sbin',
    '/dev',
    '/proc',
    '/sys',
    '/boot',
    '/root',
  ];
  if (sensitivePaths.some(sensitivePath => filePath.startsWith(sensitivePath))) {
    return { allowed: false, reason: 'Access denied: Cannot access system directories' };
  }

  return { allowed: true };
}
