// src/ui/formFields/CodeEditor/languages/javascript.ts
import * as monaco from 'monaco-editor';

// Language Configuration
export const javascriptLanguageConfiguration: monaco.languages.LanguageConfiguration =
  {
    comments: {
      lineComment: '//',
      blockComment: ['/*', '*/'],
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
      { open: "'", close: "'", notIn: ['string', 'comment'] },
    ],
    surroundingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
      { open: "'", close: "'" },
    ],
    folding: {
      markers: {
        start: new RegExp('^\\s*//\\s*#region\\b'),
        end: new RegExp('^\\s*//\\s*#endregion\\b'),
      },
    },
  };

// Monarch Language Configuration
export const javascriptMonarchLanguage: monaco.languages.IMonarchLanguage = {
  tokenizer: {
    root: [
      // Keywords
      [
        /\b(function|return|var|let|const|if|else|for|while|switch|case|break|continue|do|new|this|typeof|instanceof|try|catch|finally|throw|class|extends|super|import|export|default|await|async)\b/,
        'keyword',
      ],

      // Built-in functions
      [/\b(console|window|document|Math|Date|JSON|Promise)\b/, 'predefined'],

      // Strings
      [/'([^'\\]|\\.)*'/, 'string'],
      [/"([^"\\]|\\.)*"/, 'string'],
      [/\`([^\\`]|\\.)*\`/, 'string'],

      // Numbers
      [/\b\d+\.\d+\b/, 'number.float'],
      [/\b\d+\b/, 'number'],

      // Comments
      [/\/\/.*$/, 'comment'],
      [/\/\*/, 'comment', '@comment'],

      // Operators
      [/[<>]=?|[!=]=|[+\-*/%=<>]/, 'operator'],

      // Identifiers
      [/[a-zA-Z_][\w]*/, 'identifier'],

      // Whitespace
      [/\s+/, 'white'],
    ],

    comment: [
      [/[^/*]+/, 'comment'],
      [/\*\//, 'comment', '@pop'],
      [/./, 'comment'],
    ],
  },
};

// Validator Function
export const validateJavaScript = (
  code: string,
): monaco.editor.IMarkerData[] => {
  try {
    new Function(code); // Simple syntax validation
    return []; // No errors
  } catch (error: any) {
    const message = error.message || 'Syntax Error';
    // Note: Extracting line and column is not straightforward here
    // For robust validation, integrate a parser like Esprima or Acorn
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
export const registerJavaScriptLanguage = (
  monaco: typeof import('monaco-editor'),
) => {
  monaco.languages.register({ id: 'javascript' });

  monaco.languages.setLanguageConfiguration(
    'javascript',
    javascriptLanguageConfiguration,
  );

  monaco.languages.setMonarchTokensProvider(
    'javascript',
    javascriptMonarchLanguage,
  );

  // Register Completion Item Provider
  monaco.languages.registerCompletionItemProvider('javascript', {
    provideCompletionItems: (model, position) => {
      const suggestions: monaco.languages.CompletionItem[] = [
        // Add basic JavaScript snippets or keywords
        {
          label: 'console.log',
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: 'console.log(${1:object});',
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Log output to console',
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
  monaco.languages.registerHoverProvider('javascript', {
    provideHover: (model, position) => {
      const word = model.getWordAtPosition(position);
      if (word) {
        const hoveredWord = word.word;
        // Simple hover information
        if (hoveredWord === 'console') {
          return {
            range: new monaco.Range(
              position.lineNumber,
              word.startColumn,
              position.lineNumber,
              word.endColumn,
            ),
            contents: [
              {
                value:
                  "**console**: Provides access to the browser's debugging console.",
              },
            ],
          };
        }
        if (hoveredWord === 'log') {
          return {
            range: new monaco.Range(
              position.lineNumber,
              word.startColumn,
              position.lineNumber,
              word.endColumn,
            ),
            contents: [{ value: '**log**: Outputs a message to the console.' }],
          };
        }
      }
      return null;
    },
  });
};
