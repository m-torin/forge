// src/core/MonacoEditor.tsx

'use client';

import { Box } from '@mantine/core';
import { useEffect, useRef, forwardRef, useImperativeHandle, useCallback } from 'react';
import type { editor as MonacoEditorType } from 'monaco-editor';
import { useResizeObserver, useUncontrolled } from '@mantine/hooks';
import { draculaTheme } from '../themes/dracula';

// Import Language Registrations and Validators
import { formatSQL, registerSQLLanguage, validateSQL } from '../languages/sql';
import {
  registerJavaScriptLanguage,
  validateJavaScript,
} from '../languages/javascript';
import {
  registerTypeScriptLanguage,
  validateTypeScript,
} from '../languages/typescript';
import {
  formatPython,
  registerPythonLanguage,
  validatePython,
} from '../languages/python';
import { formatR, registerRLanguge, validateR } from '../languages/r';

// Import Monaco from the specific ESM bundle to avoid dynamic imports
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

// Define the Monaco Window interface for worker configuration
interface MonacoWindow extends Window {
  MonacoEnvironment?: {
    getWorker: (workerId: string, label: string) => Worker;
  };
}

// Define the props for MonacoEditor
export interface MonacoEditorProps {
  defaultValue: string;
  onChange: (value: string) => void;
  language?: 'javascript' | 'typescript' | 'python' | 'r' | 'sql' | 'json';
  height?: number | string;
  readOnly?: boolean;
  theme?: 'vs-dark' | 'light' | 'dracula';
  onMount?: (editor: MonacoEditorType.IStandaloneCodeEditor) => void;
}

// Configure Monaco Workers using getWorker to point to the public directory
if (typeof window !== 'undefined') {
  (window as MonacoWindow).MonacoEnvironment = {
    getWorker: (workerId, label) => {
      switch (label) {
        case 'typescript':
        case 'javascript':
          return new Worker('/monaco-workers/ts.worker.js', { type: 'module' });
        case 'json':
          return new Worker('/monaco-workers/json.worker.js', {
            type: 'module',
          });
        case 'css':
          return new Worker('/monaco-workers/css.worker.js', {
            type: 'module',
          });
        default:
          return new Worker('/monaco-workers/editor.worker.js', {
            type: 'module',
          });
      }
    },
  };
}

// Forward ref to expose editor instance if needed
export const MonacoEditor = forwardRef<
  MonacoEditorType.IStandaloneCodeEditor,
  MonacoEditorProps
>(
  (
    {
      defaultValue,
      onChange,
      language = 'javascript',
      height = 300,
      readOnly = false,
      theme = 'dracula',
      onMount,
    },
    ref,
  ) => {
    const editorRef = useRef<MonacoEditorType.IStandaloneCodeEditor | null>(
      null,
    );
    const monacoEl = useRef<HTMLDivElement>(null);
    const [resizeRef, rect] = useResizeObserver();

    // Manage internal states using useUncontrolled
    const [currentTheme] = useUncontrolled<string>({
      value: theme,
      defaultValue: 'dracula',
      finalValue: 'dracula',
      onChange: undefined,
    });

    const [isReadOnly] = useUncontrolled<boolean>({
      value: readOnly,
      defaultValue: false,
      finalValue: false,
      onChange: undefined,
    });

    // Expose editor instance to parent if ref is provided
    useImperativeHandle(
      ref,
      () => editorRef.current as MonacoEditorType.IStandaloneCodeEditor,
    );

    // Initialize Monaco Editor
    useEffect(() => {
      if (monacoEl.current && !editorRef.current) {
        // Define and set the theme
        monaco.editor.defineTheme('dracula', draculaTheme);
        monaco.editor.setTheme(currentTheme);

        // Register languages based on the prop
        switch (language) {
          case 'sql':
            registerSQLLanguage(monaco);
            break;
          case 'javascript':
            registerJavaScriptLanguage(monaco);
            break;
          case 'typescript':
            registerTypeScriptLanguage(monaco);
            break;
          case 'python':
            registerPythonLanguage(monaco);
            break;
          case 'r':
            registerRLanguge(monaco);
            break;
          case 'json':
            // JSON is built into Monaco, so no need to register
            break;
          default:
            break;
        }

        // Configure TypeScript/JavaScript diagnostics if applicable
        if (language === 'javascript' || language === 'typescript') {
          monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: false,
            noSyntaxValidation: false,
          });

          monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
            target: monaco.languages.typescript.ScriptTarget.ESNext,
            allowNonTsExtensions: true,
            moduleResolution:
              monaco.languages.typescript.ModuleResolutionKind.NodeJs,
            module: monaco.languages.typescript.ModuleKind.CommonJS,
            noEmit: true,
            esModuleInterop: true,
            jsx: monaco.languages.typescript.JsxEmit.React,
            allowJs: true,
            typeRoots: ['node_modules/@types'],
          });
        }

        // Create the editor instance
        editorRef.current = monaco.editor.create(monacoEl.current, {
          value: defaultValue,
          language,
          theme: currentTheme,
          readOnly: isReadOnly,
          automaticLayout: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          tabSize: 2,
          wordWrap: 'on',
          lineNumbers: 'on',
          glyphMargin: false,
          folding: true,
          lineDecorationsWidth: 0,
          lineNumbersMinChars: 3,
          renderValidationDecorations: 'on',
          quickSuggestions: {
            other: true,
            comments: true,
            strings: true,
          },
          formatOnPaste: false,
          formatOnType: false,
          acceptSuggestionOnEnter: 'smart',
          cursorBlinking: 'smooth',
          contextmenu: true,
          cursorStyle: 'line',
          autoIndent: 'advanced',
          colorDecorators: true,
          dragAndDrop: true,
          links: true,
          bracketPairColorization: {
            enabled: true,
          },
          guides: {
            bracketPairs: true,
            indentation: true,
            highlightActiveIndentation: true,
            bracketPairsHorizontal: true,
          },
          scrollbar: {
            useShadows: false,
            verticalHasArrows: false,
            horizontalHasArrows: false,
            vertical: 'visible',
            horizontal: 'visible',
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
          },
          parameterHints: {
            enabled: true,
            cycle: true,
          },
          suggest: {
            showKeywords: true,
            showSnippets: true,
            showClasses: true,
            showFunctions: true,
            showConstants: true,
            showConstructors: true,
            showFields: true,
            showInterfaces: true,
            showModules: true,
            showProperties: true,
            showColors: true,
            showFiles: true,
            showFolders: true,
            showTypeParameters: true,
            showUnits: true,
            showUsers: true,
            showValues: true,
            showVariables: true,
            showWords: true,
            showMethods: true,
          },
        });

        // Handle content changes
        editorRef.current.onDidChangeModelContent(() => {
          onChange(editorRef.current?.getValue() || '');
        });

        // Add language-specific features
        switch (language) {
          case 'sql':
            addSQLFeatures(monaco);
            break;
          case 'javascript':
            addJavaScriptFeatures(monaco);
            break;
          case 'typescript':
            addTypeScriptFeatures(monaco);
            break;
          case 'python':
            addPythonFeatures(monaco);
            break;
          case 'r':
            addRFeatures(monaco);
            break;
          default:
            break;
        }

        // Trigger onMount callback
        onMount?.(editorRef.current);
      }

      // Cleanup on unmount
      return () => {
        if (editorRef.current) {
          editorRef.current.dispose();
          editorRef.current = null;
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [defaultValue, onChange, onMount, language, currentTheme, isReadOnly]);

    // Synchronize defaultValue prop changes with editor content
    useEffect(() => {
      if (editorRef.current) {
        const editorValue = editorRef.current.getValue();
        if (editorValue !== defaultValue) {
          const selection = editorRef.current.getSelection();
          editorRef.current.setValue(defaultValue);
          if (selection) {
            editorRef.current.setSelection(selection);
          }
        }
      }
    }, [defaultValue]);

    // Handle theme and readOnly updates
    useEffect(() => {
      if (editorRef.current) {
        monaco.editor.setTheme(currentTheme);
        editorRef.current.updateOptions({
          readOnly: isReadOnly,
          theme: currentTheme,
        });
      }
    }, [currentTheme, isReadOnly]);

    // Handle language changes
    useEffect(() => {
      if (editorRef.current) {
        const model = editorRef.current.getModel();
        if (model) {
          monaco.editor.setModelLanguage(model, language);
          // Re-register language configurations if necessary
          switch (language) {
            case 'sql':
              registerSQLLanguage(monaco);
              validateAndMarkSQL(monaco, editorRef.current);
              break;
            case 'javascript':
              registerJavaScriptLanguage(monaco);
              validateAndMarkJavaScript(monaco, editorRef.current);
              break;
            case 'typescript':
              registerTypeScriptLanguage(monaco);
              validateAndMarkTypeScript(monaco, editorRef.current);
              break;
            case 'python':
              registerPythonLanguage(monaco);
              validateAndMarkPython(monaco, editorRef.current);
              break;
            case 'r':
              registerRLanguge(monaco);
              validateAndMarkR(monaco, editorRef.current);
              break;
            default:
              break;
          }
        }
      }
    }, [language]);

    // Handle editor resizing
    useEffect(() => {
      if (editorRef.current) {
        const editorLayout = editorRef.current.getLayoutInfo();
        editorRef.current.layout({
          width: rect.width || editorLayout.width,
          height: typeof height === 'number' ? height : editorLayout.height,
        });
      }
    }, [rect.width, height]);

    // Language-specific feature addition functions
    const addSQLFeatures = useCallback((monaco: typeof import('monaco-editor')) => {
      // Add SQL formatting action
      editorRef.current?.addAction({
        id: 'format-sql',
        label: 'Format SQL',
        keybindings: [
          // Shift + Alt + F
          monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF,
        ],
        contextMenuGroupId: '2_code',
        contextMenuOrder: 1.5,
        run: () => {
          const currentValue = editorRef.current?.getValue() || '';
          const formatted = formatSQL(currentValue);
          editorRef.current?.setValue(formatted);
        },
      });

      // Debounced validation on content change
      let validationTimeout: NodeJS.Timeout;

      editorRef.current?.onDidChangeModelContent(() => {
        onChange?.(editorRef.current?.getValue() || '');

        clearTimeout(validationTimeout);
        validationTimeout = setTimeout(() => {
          validateAndMarkSQL(monaco, editorRef.current);
        }, 500);
      });

      // Initial validation
      validateAndMarkSQL(monaco, editorRef.current);
    }, [onChange]);

    const addJavaScriptFeatures = useCallback((monaco: typeof import('monaco-editor')) => {
      // Debounced validation on content change
      let validationTimeout: NodeJS.Timeout;

      editorRef.current?.onDidChangeModelContent(() => {
        onChange?.(editorRef.current?.getValue() || '');

        clearTimeout(validationTimeout);
        validationTimeout = setTimeout(() => {
          validateAndMarkJavaScript(monaco, editorRef.current);
        }, 500);
      });

      // Initial validation
      validateAndMarkJavaScript(monaco, editorRef.current);
    }, [onChange]);

    const addTypeScriptFeatures = useCallback((monaco: typeof import('monaco-editor')) => {
      // Debounced validation on content change
      let validationTimeout: NodeJS.Timeout;

      editorRef.current?.onDidChangeModelContent(() => {
        onChange?.(editorRef.current?.getValue() || '');

        clearTimeout(validationTimeout);
        validationTimeout = setTimeout(() => {
          validateAndMarkTypeScript(monaco, editorRef.current);
        }, 500);
      });

      // Initial validation
      validateAndMarkTypeScript(monaco, editorRef.current);
    }, [onChange]);

    const addPythonFeatures = useCallback((monaco: typeof import('monaco-editor')) => {
      // Add Python formatting action
      editorRef.current?.addAction({
        id: 'format-python',
        label: 'Format Python',
        keybindings: [
          // Shift + Alt + F
          monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF,
        ],
        contextMenuGroupId: '2_code',
        contextMenuOrder: 1.5,
        run: () => {
          const currentValue = editorRef.current?.getValue() || '';
          const formatted = formatPython(currentValue);
          editorRef.current?.setValue(formatted);
        },
      });

      // Debounced validation on content change
      let validationTimeout: NodeJS.Timeout;

      editorRef.current?.onDidChangeModelContent(() => {
        onChange?.(editorRef.current?.getValue() || '');

        clearTimeout(validationTimeout);
        validationTimeout = setTimeout(() => {
          validateAndMarkPython(monaco, editorRef.current);
        }, 500);
      });

      // Initial validation
      validateAndMarkPython(monaco, editorRef.current);
    }, [onChange]);

    const addRFeatures = useCallback((monaco: typeof import('monaco-editor')) => {
      // Add R formatting action
      editorRef.current?.addAction({
        id: 'format-r',
        label: 'Format R',
        keybindings: [
          // Shift + Alt + F
          monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF,
        ],
        contextMenuGroupId: '2_code',
        contextMenuOrder: 1.5,
        run: () => {
          const currentValue = editorRef.current?.getValue() || '';
          const formatted = formatR(currentValue);
          editorRef.current?.setValue(formatted);
        },
      });

      // Debounced validation on content change
      let validationTimeout: NodeJS.Timeout;

      editorRef.current?.onDidChangeModelContent(() => {
        onChange?.(editorRef.current?.getValue() || '');

        clearTimeout(validationTimeout);
        validationTimeout = setTimeout(() => {
          validateAndMarkR(monaco, editorRef.current);
        }, 500);
      });

      // Initial validation
      validateAndMarkR(monaco, editorRef.current);
    }, [onChange]);

    // Validation marker functions
    const validateAndMarkSQL = (
      monaco: typeof import('monaco-editor'),
      editor: MonacoEditorType.IStandaloneCodeEditor | null,
    ) => {
      if (!editor) return;
      const model = editor.getModel();
      if (!model) return;

      const value = model.getValue();
      const markers = validateSQL(value);

      monaco.editor.setModelMarkers(model, 'sql', markers);
    };

    const validateAndMarkJavaScript = (
      monaco: typeof import('monaco-editor'),
      editor: MonacoEditorType.IStandaloneCodeEditor | null,
    ) => {
      if (!editor) return;
      const model = editor.getModel();
      if (!model) return;

      const value = model.getValue();
      const markers = validateJavaScript(value);

      monaco.editor.setModelMarkers(model, 'javascript', markers);
    };

    const validateAndMarkTypeScript = (
      monaco: typeof import('monaco-editor'),
      editor: MonacoEditorType.IStandaloneCodeEditor | null,
    ) => {
      if (!editor) return;
      const model = editor.getModel();
      if (!model) return;

      const value = model.getValue();
      const markers = validateTypeScript(value);

      monaco.editor.setModelMarkers(model, 'typescript', markers);
    };

    const validateAndMarkPython = (
      monaco: typeof import('monaco-editor'),
      editor: MonacoEditorType.IStandaloneCodeEditor | null,
    ) => {
      if (!editor) return;
      const model = editor.getModel();
      if (!model) return;

      const value = model.getValue();
      const markers = validatePython(value);

      monaco.editor.setModelMarkers(model, 'python', markers);
    };

    const validateAndMarkR = (
      monaco: typeof import('monaco-editor'),
      editor: MonacoEditorType.IStandaloneCodeEditor | null,
    ) => {
      if (!editor) return;
      const model = editor.getModel();
      if (!model) return;

      const value = model.getValue();
      const markers = validateR(value);

      monaco.editor.setModelMarkers(model, 'r', markers);
    };

    return (
      <Box ref={resizeRef} h={height}>
        <div ref={monacoEl} style={{ width: '100%', height: '100%' }} />
      </Box>
    );
  },
);

MonacoEditor.displayName = 'MonacoEditor';
