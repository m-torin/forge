// src/ui/formFields/CodeEditor/languages/r.ts
import * as monaco from 'monaco-editor';
// Note: Integrating R formatter and validator requires additional setup
// This example provides basic structure

// Language Configuration
export const rLanguageConfiguration: monaco.languages.LanguageConfiguration = {
  comments: {
    lineComment: '#',
    blockComment: ['/*', '*/'], // R typically uses only line comments, but block comments can be defined if needed
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
  ],
  surroundingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
  ],
  folding: {
    markers: {
      start: new RegExp('^\\s*#\\s*region\\b'),
      end: new RegExp('^\\s*#\\s*endregion\\b'),
    },
  },
};

// Monarch Language Configuration
export const rMonarchLanguage: monaco.languages.IMonarchLanguage = {
  tokenizer: {
    root: [
      // Keywords
      [
        /\b(function|return|if|else|for|while|repeat|in|next|break|TRUE|FALSE|NULL|NA|Inf|NaN)\b/,
        'keyword',
      ],

      // Built-in functions
      [
        /\b(print|cat|sum|mean|length|lm|ggplot|data.frame|as.numeric|as.character|library|require)\b/,
        'predefined',
      ],

      // Strings
      [/'([^'\\]|\\.)*'/, 'string'],
      [/"([^"\\]|\\.)*"/, 'string'],

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
export const formatR = (code: string): string => {
  try {
    // Placeholder: Implement integration with an R formatter like styler via WebAssembly or API
    // For demonstration, returning code as-is
    return code;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('R Formatting Error:', error);
    return code; // Return unformatted code on error
  }
};

// Validator Function
export const validateR = (_code: string): monaco.editor.IMarkerData[] => {
  try {
    // Placeholder: Implement R syntax validation using a parser or an API
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
export const registerRLanguge = (monaco: typeof import('monaco-editor')) => {
  monaco.languages.register({ id: 'r' });

  monaco.languages.setLanguageConfiguration('r', rLanguageConfiguration);

  monaco.languages.setMonarchTokensProvider('r', rMonarchLanguage);

  // Register Completion Item Provider
  monaco.languages.registerCompletionItemProvider('r', {
    provideCompletionItems: (model, position) => {
      const suggestions: monaco.languages.CompletionItem[] = [
        // Add basic R snippets or keywords
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
  monaco.languages.registerHoverProvider('r', {
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
