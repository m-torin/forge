import { z } from 'zod';

export const TryCompConfigSchema = z.object({
  apiKey: z.string().optional(),
  baseUrl: z.string().url().default('https://api.trycomp.ai'),
  model: z.enum(['gpt-4', 'claude-3-sonnet', 'claude-3-haiku']).default('gpt-4'),
  timeout: z.number().positive().default(30000),
  maxRetries: z.number().int().min(0).max(5).default(3),
});

export type TryCompConfig = z.infer<typeof TryCompConfigSchema>;

export const CodeSnippetSchema = z.object({
  content: z.string(),
  language: z.string().optional(),
  filename: z.string().optional(),
  description: z.string().optional(),
});

export type CodeSnippet = z.infer<typeof CodeSnippetSchema>;

export const ComparisonRequestSchema = z.object({
  codeA: CodeSnippetSchema,
  codeB: CodeSnippetSchema,
  comparisonType: z
    .enum([
      'semantic',
      'performance',
      'security',
      'maintainability',
      'style',
      'functionality',
      'all',
    ])
    .default('all'),
  includeScore: z.boolean().default(true),
  includeRecommendations: z.boolean().default(true),
  context: z.string().optional(),
});

export type ComparisonRequest = z.infer<typeof ComparisonRequestSchema>;

export const ComparisonScoreSchema = z.object({
  overall: z.number().min(0).max(100),
  semantic: z.number().min(0).max(100),
  performance: z.number().min(0).max(100),
  security: z.number().min(0).max(100),
  maintainability: z.number().min(0).max(100),
  style: z.number().min(0).max(100),
  functionality: z.number().min(0).max(100),
});

export type ComparisonScore = z.infer<typeof ComparisonScoreSchema>;

export const RecommendationSchema = z.object({
  type: z.enum(['improvement', 'warning', 'optimization', 'refactor']),
  title: z.string(),
  description: z.string(),
  codeExample: z.string().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  category: z.string(),
});

export type Recommendation = z.infer<typeof RecommendationSchema>;

export const ComparisonResultSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  request: ComparisonRequestSchema,
  score: ComparisonScoreSchema.optional(),
  analysis: z.object({
    summary: z.string(),
    differences: z.array(z.string()),
    similarities: z.array(z.string()),
    winner: z.enum(['codeA', 'codeB', 'tie']).optional(),
    reasoning: z.string(),
  }),
  recommendations: z.array(RecommendationSchema).optional(),
  metadata: z.object({
    model: z.string(),
    processingTime: z.number(),
    tokens: z
      .object({
        input: z.number(),
        output: z.number(),
      })
      .optional(),
  }),
});

export type ComparisonResult = z.infer<typeof ComparisonResultSchema>;

export const AnalysisRequestSchema = z.object({
  code: CodeSnippetSchema,
  analysisType: z
    .enum(['quality', 'security', 'performance', 'bugs', 'complexity', 'documentation', 'all'])
    .default('all'),
  includeScore: z.boolean().default(true),
  includeRecommendations: z.boolean().default(true),
  context: z.string().optional(),
});

export type AnalysisRequest = z.infer<typeof AnalysisRequestSchema>;

export const AnalysisScoreSchema = z.object({
  overall: z.number().min(0).max(100),
  quality: z.number().min(0).max(100),
  security: z.number().min(0).max(100),
  performance: z.number().min(0).max(100),
  maintainability: z.number().min(0).max(100),
  readability: z.number().min(0).max(100),
  complexity: z.number().min(0).max(100),
});

export type AnalysisScore = z.infer<typeof AnalysisScoreSchema>;

export const AnalysisResultSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  request: AnalysisRequestSchema,
  score: AnalysisScoreSchema.optional(),
  analysis: z.object({
    summary: z.string(),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    complexity: z.object({
      cyclomatic: z.number().optional(),
      cognitive: z.number().optional(),
      lines: z.number(),
      functions: z.number().optional(),
    }),
  }),
  recommendations: z.array(RecommendationSchema).optional(),
  metadata: z.object({
    model: z.string(),
    processingTime: z.number(),
    tokens: z
      .object({
        input: z.number(),
        output: z.number(),
      })
      .optional(),
  }),
});

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;

export const DiffRequestSchema = z.object({
  oldCode: CodeSnippetSchema,
  newCode: CodeSnippetSchema,
  diffType: z.enum(['unified', 'side-by-side', 'semantic', 'ai-powered']).default('ai-powered'),
  includeContext: z.boolean().default(true),
  includeImpactAnalysis: z.boolean().default(true),
});

export type DiffRequest = z.infer<typeof DiffRequestSchema>;

export const DiffResultSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  request: DiffRequestSchema,
  diff: z.object({
    additions: z.number(),
    deletions: z.number(),
    modifications: z.number(),
    diffText: z.string(),
  }),
  analysis: z.object({
    summary: z.string(),
    impactLevel: z.enum(['low', 'medium', 'high', 'critical']),
    changeType: z.enum(['feature', 'bugfix', 'refactor', 'optimization', 'breaking']),
    affectedAreas: z.array(z.string()),
    riskAssessment: z.string(),
  }),
  recommendations: z.array(RecommendationSchema).optional(),
  metadata: z.object({
    model: z.string(),
    processingTime: z.number(),
  }),
});

export type DiffResult = z.infer<typeof DiffResultSchema>;

export interface TryCompError extends Error {
  code?: string;
  statusCode?: number;
  response?: unknown,
}

export interface TryCompClient {
  compare(request: ComparisonRequest): Promise<ComparisonResult>;
  analyze(request: AnalysisRequest): Promise<AnalysisResult>;
  diff(request: DiffRequest): Promise<DiffResult>;
  validateCode(code: string, language?: string): Promise<boolean>,
}
