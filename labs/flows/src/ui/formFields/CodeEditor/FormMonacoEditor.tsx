// src/ui/formFields/CodeEditor/FormMonacoEditor.tsx
'use client';

import { Box, BoxProps, Text } from '@mantine/core';
import { useUncontrolled } from '@mantine/hooks';
import dynamic from 'next/dynamic';
import type { DynamicOptionsLoadingProps } from 'next/dynamic';

// Define a generic editor type to avoid monaco-editor dependency
type Editor = {
  dispose: () => void;
  getValue: () => string;
  setValue: (value: string) => void;
  getSelection: () => unknown;
  setSelection: (selection: unknown) => void;
  layout: (dimension: { width: number; height: number }) => void;
  updateOptions: (options: Record<string, unknown>) => void;
};

// Local interface definition without monaco-editor dependency
interface MonacoEditorProps {
  defaultValue: string;
  onChange: (value: string) => void;
  language?: 'javascript' | 'typescript' | 'python' | 'r' | 'sql' | 'json';
  height?: number | string;
  readOnly?: boolean;
  theme?: 'vs-dark' | 'light' | 'dracula';
  onMount?: (editor: Editor) => void;
}

/**
 * Loading component displayed while MonacoEditor is being dynamically imported.
 * It provides a visually appealing placeholder.
 */
const LoadingEditor = ({ isLoading: _isLoading }: DynamicOptionsLoadingProps) => (
  <Box
    h={300}
    bg="var(--mantine-color-gray-1)"
    style={{
      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      borderRadius: '8px',
    }}
  />
);

/**
 * Props interface for FormMonacoEditor, extending Mantine's BoxProps and Monaco Editor props
 */
export interface FormMonacoEditorProps extends BoxProps {
  /** Displays validation errors */
  error?: React.ReactNode;
  /** Controlled value */
  value?: string;
  /** Initial value for uncontrolled mode */
  defaultValue?: string;
  /** Callback to handle value changes */
  onChange?: (value: string) => void;
  /** Programming language for syntax highlighting */
  language?: 'javascript' | 'typescript' | 'python' | 'r' | 'sql' | 'json';
  /** Height of the editor */
  height?: number | string;
  /** Determines if the editor is read-only */
  readOnly?: boolean;
  /** Theme of the editor */
  theme?: 'vs-dark' | 'light' | 'dracula';
  /** Callback when editor mounts */
  onMount?: MonacoEditorProps['onMount'];
  /** If true, autofocuses the editor on mount */
  'data-autofocus'?: boolean;
}

/**
 * FormMonacoEditor component integrates MonacoEditor with Mantine's uncontrolled forms.
 * It manages synchronization between form state and the editor's content, handles theming,
 * read-only state, and displays validation errors.
 */
export function FormMonacoEditor({
  error,
  value,
  defaultValue = '',
  onChange,
  height = 300,
  onMount,
  language = 'typescript',
  readOnly = false,
  theme = 'dracula',
  'data-autofocus': _dataAutofocus,
  ...boxProps
}: FormMonacoEditorProps) {
  /**
   * useUncontrolled manages the editor's value in both controlled and uncontrolled modes.
   */
  const [_value, handleChange] = useUncontrolled<string>({
    value: value ?? '',
    defaultValue: defaultValue ?? '',
    finalValue: '',
    onChange: onChange ?? (() => {}),
  });

  /**
   * Parses the height prop to a numeric value if it's provided as a string with units.
   */
  const numericHeight =
    typeof height === 'string' ? parseInt(height, 10) : height;

  // Dynamically import MonacoEditor
  const MonacoEditor = dynamic<MonacoEditorProps>(
    // @ts-ignore
    async () => {
      const mod = await import('@labs/monaco-editor');
      return mod.MonacoEditor;
    },
    {
      ssr: false,
      loading: LoadingEditor,
    },
  );

  return (
    <Box {...boxProps}>
      <MonacoEditor
        defaultValue={defaultValue}
        onChange={handleChange}
        height={numericHeight}
        {...(onMount && { onMount })}
        language={language}
        readOnly={readOnly}
        theme={theme}
      />
      {error && (
        <Text c="red" size="sm" mt={4}>
          {error}
        </Text>
      )}
    </Box>
  );
}

FormMonacoEditor.displayName = 'FormMonacoEditor';
