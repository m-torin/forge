// src/ui/formFields/CodeEditor/languages/sql.ts
import * as monaco from 'monaco-editor';
import * as sqlFormatter from 'sql-formatter';
// Removed the sql-parser import as per the requirement
// import { parse } from 'sql-parser'; // Removed

// Language Configuration for Comments, Brackets, etc.
export const sqlLanguageConfiguration: monaco.languages.LanguageConfiguration =
  {
    comments: {
      lineComment: '--',
      blockComment: ['/*', '*/'] as [string, string],
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
      { open: "'", close: "'", notIn: ['string', 'comment'] },
      { open: '"', close: '"', notIn: ['string', 'comment'] },
      { open: "'", close: "'", notIn: ['string', 'comment'] }, // For MySQL backticks
    ],
    surroundingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: "'", close: "'" },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
    ],
    folding: {
      markers: {
        start: new RegExp('^\\s*--\\s*#region\\b'),
        end: new RegExp('^\\s*--\\s*#endregion\\b'),
      },
    },
  };

// Monarch Language Configuration for Tokenization
export const sqlMonarchLanguage: monaco.languages.IMonarchLanguage = {
  tokenizer: {
    root: [
      // Keywords
      [
        /\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|DROP|TABLE|INDEX|VIEW|JOIN|LEFT|RIGHT|INNER|OUTER|FULL|GROUP BY|ORDER BY|HAVING|LIMIT|OFFSET|AS|ON|AND|OR|IN|LIKE|IS|NULL|NOT|DISTINCT|UNION|ALL|CASE|WHEN|THEN|ELSE|END|PRIMARY|KEY|FOREIGN|REFERENCES|ALTER|ADD|COLUMN|SET|VALUES|RETURNING)\b/i,
        'keyword',
      ],

      // Built-in functions
      [
        /\b(COUNT|SUM|AVG|MIN|MAX|COALESCE|NULLIF|CAST|CONVERT|LOWER|UPPER|NOW|DATEADD|DATEDIFF|SUBSTRING|LEN|ROUND|ABS|CEILING|FLOOR|GETDATE)\b/i,
        'function',
      ],

      // Numbers
      // eslint-disable-next-line security/detect-unsafe-regex
      [/\b\d+\.\d+(?:[eE][-+]?\d+)?\b/, 'number.float'],
      [/\b\d+\b/, 'number'],

      // Strings
      [/'([^'\\]|\\.)*'/, 'string'],
      [/"([^"\\]|\\.)*"/, 'string'],
      [/\$\w+\$[^$]*\$/, 'string'], // For PostgreSQL dollar-quoted strings

      // Comments
      [/--.*$/, 'comment'],
      [/\/\*/, { token: 'comment.quote', next: '@comment' }],

      // Operators
      [/[<>]=?|[!=]=|[+\-*/%=<>]/, 'operator'],

      // Identifiers
      [/[a-zA-Z_][\w$]*/, 'identifier'],

      // Whitespace
      [/\s+/, 'white'],
    ],

    comment: [
      [/[^/*]+/, 'comment'],
      [/\*\//, { token: 'comment.quote', next: '@pop' }],
      [/./, 'comment'],
    ],
  },

  // Indentation rules
  indentationRules: {
    increaseIndentPattern:
      /^\s*(BEGIN|CREATE|SELECT|INSERT|UPDATE|DELETE|WITH)\b.*$/i,
    decreaseIndentPattern: /^\s*(END|COMMIT|ROLLBACK)\b/i,
  },

  // Auto-closing pairs and surrounding pairs are already defined in LanguageConfiguration

  // Folding rules are already defined in LanguageConfiguration
};

// Define a comprehensive list of keywords and functions
const keywords = [
  'SELECT',
  'FROM',
  'WHERE',
  'INSERT',
  'UPDATE',
  'DELETE',
  'CREATE',
  'DROP',
  'TABLE',
  'INDEX',
  'VIEW',
  'JOIN',
  'LEFT',
  'RIGHT',
  'INNER',
  'OUTER',
  'FULL',
  'GROUP BY',
  'ORDER BY',
  'HAVING',
  'LIMIT',
  'OFFSET',
  'AS',
  'ON',
  'AND',
  'OR',
  'IN',
  'LIKE',
  'IS',
  'NULL',
  'NOT',
  'DISTINCT',
  'UNION',
  'ALL',
  'CASE',
  'WHEN',
  'THEN',
  'ELSE',
  'END',
  'PRIMARY',
  'KEY',
  'FOREIGN',
  'REFERENCES',
  'ALTER',
  'ADD',
  'COLUMN',
  'SET',
  'VALUES',
  'RETURNING',
];

const functions = [
  'COUNT',
  'SUM',
  'AVG',
  'MIN',
  'MAX',
  'COALESCE',
  'NULLIF',
  'CAST',
  'CONVERT',
  'LOWER',
  'UPPER',
  'NOW',
  'DATEADD',
  'DATEDIFF',
  'SUBSTRING',
  'LEN',
  'ROUND',
  'ABS',
  'CEILING',
  'FLOOR',
  'GETDATE',
];

// Define snippets
const snippets = [
  {
    label: 'SELECT * FROM',
    kind: monaco.languages.CompletionItemKind.Snippet,
    insertText: 'SELECT * FROM ${1:table};',
    insertTextRules:
      monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    detail: 'Select all from table',
  },
  {
    label: 'INSERT INTO',
    kind: monaco.languages.CompletionItemKind.Snippet,
    insertText: 'INSERT INTO ${1:table} (${2:columns}) VALUES (${3:values});',
    insertTextRules:
      monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    detail: 'Insert into table',
  },
  {
    label: 'UPDATE SET',
    kind: monaco.languages.CompletionItemKind.Snippet,
    insertText:
      'UPDATE ${1:table} SET ${2:column} = ${3:value} WHERE ${4:condition};',
    insertTextRules:
      monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    detail: 'Update table',
  },
  {
    label: 'DELETE FROM',
    kind: monaco.languages.CompletionItemKind.Snippet,
    insertText: 'DELETE FROM ${1:table} WHERE ${2:condition};',
    insertTextRules:
      monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    detail: 'Delete from table',
  },
  {
    label: 'CREATE TABLE',
    kind: monaco.languages.CompletionItemKind.Snippet,
    insertText: `CREATE TABLE \${1:table_name} (
\t\${2:column_name} \${3:DATA_TYPE} PRIMARY KEY,
\t\${4:column_name} \${5:DATA_TYPE}
);`,
    insertTextRules:
      monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    detail: 'Create Table',
  },
  {
    label: 'ALTER TABLE ADD COLUMN',
    kind: monaco.languages.CompletionItemKind.Snippet,
    insertText:
      'ALTER TABLE ${1:table_name} ADD COLUMN ${2:column_name} ${3:DATA_TYPE};',
    insertTextRules:
      monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    detail: 'Alter Table Add Column',
  },
  {
    label: 'DROP TABLE',
    kind: monaco.languages.CompletionItemKind.Snippet,
    insertText: 'DROP TABLE ${1:table_name};',
    insertTextRules:
      monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    detail: 'Drop Table',
  },
  // Add more snippets as needed
];

// Formatter Function
export const formatSQL = (sql: string): string => {
  try {
    return sqlFormatter.format(sql, { language: 'sql' });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('SQL Formatting Error:', error);
    return sql; // Return unformatted SQL on error
  }
};

// Validator Function
// Since sql-parser is removed, we can either remove this function or implement basic validation.
// Here, we'll return an empty array indicating no errors.
// Alternatively, implement basic checks if needed.
export const validateSQL = (_sql: string): monaco.editor.IMarkerData[] => {
  // Basic validation can be added here if desired.
  // Currently, no validation is performed.
  return [];
};

// Registration Function
export const registerSQLLanguage = (monaco: typeof import('monaco-editor')) => {
  // Register the language
  monaco.languages.register({ id: 'sql' });

  // Set Language Configuration
  monaco.languages.setLanguageConfiguration('sql', sqlLanguageConfiguration);

  // Set Monarch Tokens Provider
  monaco.languages.setMonarchTokensProvider('sql', sqlMonarchLanguage);

  // Register Completion Item Provider
  monaco.languages.registerCompletionItemProvider('sql', {
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position);
      const range: monaco.IRange = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const suggestions: monaco.languages.CompletionItem[] = [];

      // Add keyword suggestions
      keywords.forEach((keyword) => {
        suggestions.push({
          label: keyword,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: keyword,
          detail: 'Keyword',
          range,
        });
      });

      // Add function suggestions
      functions.forEach((func) => {
        suggestions.push({
          label: func,
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: `${func}()`,
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Function',
          range,
        });
      });

      // Add snippet suggestions
      snippets.forEach((snippet) => {
        suggestions.push({
          ...snippet,
          range,
        });
      });

      // Limit the number of suggestions to prevent performance issues
      const MAX_SUGGESTIONS = 100;
      return { suggestions: suggestions.slice(0, MAX_SUGGESTIONS) };
    },
  });

  // Register Hover Provider
  monaco.languages.registerHoverProvider('sql', {
    provideHover: (model, position) => {
      const word = model.getWordAtPosition(position);
      if (word) {
        const { word: hoveredWord } = word;
        if (keywords.includes(hoveredWord.toUpperCase())) {
          return {
            range: new monaco.Range(
              position.lineNumber,
              word.startColumn,
              position.lineNumber,
              word.endColumn,
            ),
            contents: [{ value: `**Keyword:** ${hoveredWord.toUpperCase()}` }],
          };
        }
        if (functions.includes(hoveredWord.toUpperCase())) {
          return {
            range: new monaco.Range(
              position.lineNumber,
              word.startColumn,
              position.lineNumber,
              word.endColumn,
            ),
            contents: [{ value: `**Function:** ${hoveredWord.toUpperCase()}` }],
          };
        }
      }
      return null;
    },
  });
};
