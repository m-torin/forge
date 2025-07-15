export interface BashToolConfig {
  execute: (params: { command: string; restart?: boolean }) => Promise<string>;
}

export interface TextEditorToolConfig {
  execute: (params: {
    command: 'view' | 'create' | 'str_replace' | 'insert' | 'undo_edit';
    path: string;
    file_text?: string;
    insert_line?: number;
    new_str?: string;
    old_str?: string;
    view_range?: number[];
  }) => Promise<string>;
}

export interface ComputerToolConfig {
  displayWidthPx: number;
  displayHeightPx: number;
  displayNumber?: number;
  execute: (params: {
    action:
      | 'key'
      | 'type'
      | 'scroll'
      | 'wait'
      | 'mouse_move'
      | 'left_click'
      | 'left_click_drag'
      | 'right_click'
      | 'middle_click'
      | 'double_click'
      | 'triple_click'
      | 'screenshot'
      | 'cursor_position'
      | 'hold_key'
      | 'left_mouse_down'
      | 'left_mouse_up';
    coordinate?: number[];
    text?: string;
  }) => Promise<string | { type: 'image'; data: string }>;
  experimental_toToolResultContent?: (
    result: string | { type: 'image'; data: string },
  ) => Array<{ type: 'text'; text: string } | { type: 'image'; data: string; mimeType?: string }>;
}

export interface ToolResult {
  type: 'text' | 'image';
  text?: string;
  data?: string;
  mimeType?: string;
}

// Security configuration types
export interface SecurityConfig {
  workspacePath?: string; // Restrict operations to this directory
  allowedCommands?: string[]; // Whitelist of allowed bash commands
  blockedCommands?: string[]; // Blacklist of dangerous commands
  allowedFileExtensions?: string[]; // Whitelist of allowed file extensions
  blockedFileExtensions?: string[]; // Blacklist of dangerous file extensions
  requireUserConfirmation?: boolean; // Require user approval for operations
  maxFileSize?: number; // Maximum file size in bytes
  maxCommandOutput?: number; // Maximum command output size in bytes
}

export interface SafeToolsConfig {
  security: SecurityConfig;
  bash?: BashToolConfig;
  textEditor?: TextEditorToolConfig;
  computer?: ComputerToolConfig;
}
