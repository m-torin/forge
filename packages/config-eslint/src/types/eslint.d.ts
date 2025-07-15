declare module "eslint" {
  namespace Linter {
    interface FlatConfig {
      files?: (string | string[])[] | string | string[];
      ignores?: string | string[];
      languageOptions?: {
        ecmaVersion?: "latest" | number;
        globals?: any | Record<string, any>;
        parser?: any;
        parserOptions?: any;
        sourceType?: "commonjs" | "module" | "script";
      };
      linterOptions?:
        | any
        | {
            noInlineConfig?: boolean;
            reportUnusedDisableDirectives?: "error" | boolean | number | string;
          };
      plugins?: Record<string, any>;
      processor?: any | string;
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
      ruleId: null | string;
      severity: number;
    }
  }
}
