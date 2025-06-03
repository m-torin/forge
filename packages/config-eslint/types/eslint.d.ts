declare module 'eslint' {
  namespace Linter {
    interface FlatConfig {
      files?: string | string[] | (string | string[])[];
      ignores?: string | string[];
      languageOptions?: {
        ecmaVersion?: number | 'latest';
        sourceType?: 'script' | 'module' | 'commonjs';
        parser?: any;
        parserOptions?: any;
        globals?: Record<string, any> | any;
      };
      linterOptions?:
        | {
            reportUnusedDisableDirectives?: boolean | 'error' | number | string;
            noInlineConfig?: boolean;
          }
        | any;
      plugins?: Record<string, any>;
      processor?: string | any;
      rules?: Record<string, any>;
      settings?: Record<string, any>;
    }

    interface LintMessage {
      column: number;
      endColumn?: number;
      endLine?: number;
      fix?: {
        range: [number, number];
        text: string;
      };
      line: number;
      message: string;
      messageId?: string;
      nodeType: string;
      ruleId: string | null;
      severity: number;
    }
  }
}
