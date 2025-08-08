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
  toModelOutput?: (result: string | { type: 'image'; data: string }) => {
    type: 'content';
    value: Array<
      { type: 'text'; text: string } | { type: 'media'; mediaType: string; data: string }
    >;
  };
}

export interface ToolResult {
  type: 'text' | 'image';
  text?: string;
  data?: string;
  mimeType?: string;
}

// Security configuration types
export interface SecurityConfig {
  workspacePath?: string;
  allowedCommands?: string[];
  blockedCommands?: string[];
  allowedFileExtensions?: string[];
  blockedFileExtensions?: string[];
  requireUserConfirmation?: boolean;
  maxFileSize?: number;
  maxCommandOutput?: number;
}

export interface SafeToolsConfig {
  security: SecurityConfig;
  bash?: BashToolConfig;
  textEditor?: TextEditorToolConfig;
  computer?: ComputerToolConfig;
}
