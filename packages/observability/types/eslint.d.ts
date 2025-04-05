declare module "eslint" {
  namespace Linter {
    interface FlatConfig {
      files?: string | string[];
      ignores?: string | string[];
      languageOptions?: {
        ecmaVersion?: number | "latest";
        sourceType?: "script" | "module" | "commonjs";
        parser?: any;
        parserOptions?: any;
        globals?: Record<string, boolean | "readonly" | "writable">;
      };
      linterOptions?: {
        reportUnusedDisableDirectives?: boolean | "error";
        noInlineConfig?: boolean;
      };
      plugins?: Record<string, any>;
      processor?: string;
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
