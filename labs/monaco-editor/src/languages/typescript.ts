// src/ui/formFields/CodeEditor/languages/typescript.ts
import * as monaco from 'monaco-editor';
import * as ts from 'typescript';

// Language Configuration
const typescriptLanguageConfiguration: monaco.languages.LanguageConfiguration =
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
const typescriptMonarchLanguage: monaco.languages.IMonarchLanguage = {
  tokenizer: {
    root: [
      // Keywords
      [
        /\b(function|return|var|let|const|if|else|for|while|switch|case|break|continue|do|new|this|typeof|instanceof|try|catch|finally|throw|class|extends|super|import|export|default|await|async|interface|implements|enum|namespace|type|public|private|protected|static|readonly)\b/,
        'keyword',
      ],

      // Built-in functions
      [/\b(console|window|document|Math|Date|JSON|Promise)\b/, 'predefined'],

      // Types
      [
        /\b(string|number|boolean|any|void|never|unknown|object|Array|Map|Set|Function)\b/,
        'type',
      ],

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
export const validateTypeScript = (
  code: string,
): monaco.editor.IMarkerData[] => {
  const options: ts.CompilerOptions = {
    noEmit: true,
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
  };
  const host = ts.createCompilerHost(options, true);
  const fileName = 'file.ts';
  host.getSourceFile = (sourceFileName, languageVersion) => {
    if (sourceFileName === fileName) {
      return ts.createSourceFile(sourceFileName, code, languageVersion, true);
    }
    return undefined;
  };
  host.writeFile = () => {};
  host.getDefaultLibFileName = () => 'lib.d.ts';

  const program = ts.createProgram([fileName], options, host);
  const diagnostics = ts.getPreEmitDiagnostics(program);

  const markers: monaco.editor.IMarkerData[] = diagnostics.map((diagnostic) => {
    let line = 1;
    let character = 1;
    if (diagnostic.file && diagnostic.start !== undefined) {
      const position = diagnostic.file.getLineAndCharacterOfPosition(
        diagnostic.start,
      );
      line = position.line + 1;
      character = position.character + 1;
    }
    const message = ts.flattenDiagnosticMessageText(
      diagnostic.messageText,
      '\n',
    );
    return {
      startLineNumber: line,
      startColumn: character,
      endLineNumber: line,
      endColumn: character + 1,
      message,
      severity: monaco.MarkerSeverity.Error,
    };
  });

  return markers;
};

// Registration Function
export const registerTypeScriptLanguage = (
  monaco: typeof import('monaco-editor'),
) => {
  monaco.languages.register({ id: 'typescript' });

  monaco.languages.setLanguageConfiguration(
    'typescript',
    typescriptLanguageConfiguration,
  );

  monaco.languages.setMonarchTokensProvider(
    'typescript',
    typescriptMonarchLanguage,
  );

  // Register Completion Item Provider
  monaco.languages.registerCompletionItemProvider('typescript', {
    provideCompletionItems: (model, position) => {
      const suggestions: monaco.languages.CompletionItem[] = [
        // Add basic TypeScript snippets or keywords
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
  monaco.languages.registerHoverProvider('typescript', {
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
