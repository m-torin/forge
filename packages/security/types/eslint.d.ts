declare module "eslint" {
  namespace Linter {
    interface FlatConfig {
      [key: string]: any;
      files?: string | string[];
      ignores?: string | string[];
      languageOptions?: {
        globals?: Record<string, boolean | string>;
        parser?: any;
        parserOptions?: any;
        [key: string]: any;
      };
      plugins?: Record<string, any>;
      processor?: string;
      rules?: Record<string, any>;
      settings?: Record<string, any>;
    }

    interface LintMessage {
      column?: number;
      endColumn?: number;
      endLine?: number;
      fix?: {
        range: [number, number];
        text: string;
      };
      line?: number;
      message: string;
      nodeType?: string;
      ruleId: string | null;
      severity: number;
    }
  }
}
