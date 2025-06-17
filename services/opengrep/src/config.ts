import { z } from 'zod';

export const openGrepEnvSchema = z.object({
  OPENGREP_API_KEY: z.string().optional(),
  OPENGREP_BASE_URL: z.string().url().default('https://semgrep.dev/api'),
  OPENGREP_TIMEOUT: z.coerce.number().positive().default(30000),
  OPENGREP_MAX_RETRIES: z.coerce.number().int().min(0).max(5).default(3),
  SEMGREP_PATH: z.string().default('semgrep'),
});

export type OpenGrepEnv = z.infer<typeof openGrepEnvSchema>;

export function getOpenGrepConfig(): OpenGrepEnv {
  return openGrepEnvSchema.parse(process.env);
}

export const defaultRuleSets = {
  security: ['p/security-audit', 'p/secrets', 'p/owasp-top-ten'],
  javascript: ['p/javascript', 'p/react', 'p/nodejs'],
  typescript: ['p/typescript', 'p/react', 'p/nodejs'],
  python: ['p/python', 'p/django', 'p/flask'],
  general: ['p/code-quality', 'p/performance', 'p/correctness'],
} as const;

export type RuleSet = keyof typeof defaultRuleSets;

export const repoScanConfig = {
  excludePaths: [
    'node_modules/**',
    '.git/**',
    'dist/**',
    'build/**',
    '*.min.js',
    '*.min.css',
    'coverage/**',
    '.next/**',
    '.vercel/**',
    'test-results/**',
    '**/*.test.ts',
    '**/*.test.tsx',
    '**/*.test.js',
    '**/*.test.jsx',
    '**/*.spec.ts',
    '**/*.spec.tsx',
    '**/*.spec.js',
    '**/*.spec.jsx',
  ],
  includePaths: ['apps/**', 'packages/**', 'services/**', 'scripts/**'],
  maxFileSize: '1MB',
  timeout: 300000, // 5 minutes for full repo scan
} as const;
