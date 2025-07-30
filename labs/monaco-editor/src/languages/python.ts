// src/ui/formFields/CodeEditor/languages/python.ts
import * as monaco from 'monaco-editor';
// Note: Integrating a Python formatter like Black or a validator requires additional setup
// This example provides basic structure

// Language Configuration
export const pythonLanguageConfiguration: monaco.languages.LanguageConfiguration =
  {
    comments: {
      lineComment: '#',
      blockComment: ['"""', '"""'],
    },
    brackets: [
      ['{', '}'],
      ['[', ']'],
      ['(', ')'],
    ],
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"', notIn: ['string'] },
      { open: "'", close: "'", notIn: ['string'] },
      { open: '"""', close: '"""', notIn: ['string', 'comment'] },
      { open: "'''", close: "'''", notIn: ['string', 'comment'] },
    ],
    surroundingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
      { open: '"""', close: '"""' },
      { open: "'''", close: "'''" },
    ],
    folding: {
      markers: {
        start: new RegExp('^\\s*#\\s*region\\b'),
        end: new RegExp('^\\s*#\\s*endregion\\b'),
      },
    },
  };

// Monarch Language Configuration
export const pythonMonarchLanguage: monaco.languages.IMonarchLanguage = {
  tokenizer: {
    root: [
      // Keywords
      [
        /\b(def|return|if|else|elif|for|while|import|from|as|pass|break|continue|class|try|except|finally|with|lambda|yield|raise|global|nonlocal|assert|del|async|await)\b/,
        'keyword',
      ],

      // Built-in functions
      [
        /\b(print|len|range|open|str|int|float|list|dict|set|tuple|type|super)\b/,
        'predefined',
      ],

      // Strings
      [/'([^'\\]|\\.)*'/, 'string'],
      [/"([^"\\]|\\.)*"/, 'string'],
      [/'''[^']*'''/, 'string'],
      [/"""[^"]*"""/, 'string'],

      // Numbers
      [/\b\d+\.\d+\b/, 'number.float'],
      [/\b\d+\b/, 'number'],

      // Comments
      [/#.*$/, 'comment'],

      // Operators
      [/[<>]=?|[!=]=|[+\-*/%=<>]/, 'operator'],

      // Identifiers
      [/[a-zA-Z_][\w]*/, 'identifier'],

      // Whitespace
      [/\s+/, 'white'],
    ],
  },
};

// Formatter Function
export const formatPython = (code: string): string => {
  try {
    // Placeholder: Implement integration with a Python formatter like Black via WebAssembly or API
    // For demonstration, returning code as-is
    return code;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Python Formatting Error:', error);
    return code; // Return unformatted code on error
  }
};

// Validator Function
export const validatePython = (_code: string): monaco.editor.IMarkerData[] => {
  try {
    // Placeholder: Implement Python syntax validation using a parser like pyodide or an API
    // For demonstration, assuming no errors
    return [];
  } catch (error: any) {
    const message = error.message || 'Syntax Error';
    // Parsing line and column would require a proper parser
    return [
      {
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: 1,
        endColumn: 1,
        message,
        severity: monaco.MarkerSeverity.Error,
      },
    ];
  }
};

// Registration Function
export const registerPythonLanguage = (
  monaco: typeof import('monaco-editor'),
) => {
  monaco.languages.register({ id: 'python' });

  monaco.languages.setLanguageConfiguration(
    'python',
    pythonLanguageConfiguration,
  );

  monaco.languages.setMonarchTokensProvider('python', pythonMonarchLanguage);

  // Register Completion Item Provider
  monaco.languages.registerCompletionItemProvider('python', {
    provideCompletionItems: (model, position) => {
      const suggestions: monaco.languages.CompletionItem[] = [
        // Add basic Python snippets or keywords
        {
          label: 'print',
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: 'print(${1:object})',
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Print output to console',
          range: {
            startLineNumber: position.lineNumber,
            startColumn: position.column,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
          },
        },
        // Add more suggestions as needed
      ];

      return { suggestions };
    },
  });

  // Register Hover Provider
  monaco.languages.registerHoverProvider('python', {
    provideHover: (model, position) => {
      const word = model.getWordAtPosition(position);
      if (word) {
        const hoveredWord = word.word;
        // Simple hover information
        if (hoveredWord === 'print') {
          return {
            range: new monaco.Range(
              position.lineNumber,
              word.startColumn,
              position.lineNumber,
              word.endColumn,
            ),
            contents: [
              { value: '**print**: Outputs a message to the console.' },
            ],
          };
        }
      }
      return null;
    },
  });
};
