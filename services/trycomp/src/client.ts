import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import type {
  TryCompClient,
  TryCompConfig,
  TryCompError,
  ComparisonRequest,
  ComparisonResult,
  AnalysisRequest,
  AnalysisResult,
  DiffRequest,
  DiffResult,
} from './types.js';
import {
  TryCompConfigSchema,
  ComparisonRequestSchema,
  ComparisonResultSchema,
  AnalysisRequestSchema,
  AnalysisResultSchema,
  DiffRequestSchema,
  DiffResultSchema,
} from './types.js';

export class TryCompAIClient implements TryCompClient {
  private config: TryCompConfig;
  private openai?: OpenAI;
  private anthropic?: Anthropic;

  constructor(config: Partial<TryCompConfig> = {}) {
    this.config = TryCompConfigSchema.parse(config);
    this.initializeClients();
  }

  private initializeClients(): void {
    const apiKey =
      this.config.apiKey || process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      throw new Error(
        'API key is required. Set OPENAI_API_KEY or ANTHROPIC_API_KEY environment variable.',
      );
    }

    if (this.config.model.startsWith('gpt-')) {
      this.openai = new OpenAI({
        apiKey: apiKey,
        timeout: this.config.timeout,
      });
    } else if (this.config.model.startsWith('claude-')) {
      this.anthropic = new Anthropic({
        apiKey: apiKey,
        timeout: this.config.timeout,
      });
    }
  }

  async compare(request: ComparisonRequest): Promise<ComparisonResult> {
    const validatedRequest = ComparisonRequestSchema.parse(request);
    const startTime = Date.now();

    const prompt = this.buildComparisonPrompt(validatedRequest);

    try {
      const response = await this.callAI(prompt);
      const processingTime = Date.now() - startTime;

      const result: ComparisonResult = {
        id: this.generateId(),
        timestamp: new Date().toISOString(),
        request: validatedRequest,
        score: this.parseScore(response, 'comparison'),
        analysis: this.parseAnalysis(response, 'comparison'),
        recommendations: this.parseRecommendations(response),
        metadata: {
          model: this.config.model,
          processingTime,
          tokens: this.extractTokenUsage(response),
        },
      };

      return ComparisonResultSchema.parse(result);
    } catch (error) {
      throw this.handleError(error, 'comparison');
    }
  }

  async analyze(request: AnalysisRequest): Promise<AnalysisResult> {
    const validatedRequest = AnalysisRequestSchema.parse(request);
    const startTime = Date.now();

    const prompt = this.buildAnalysisPrompt(validatedRequest);

    try {
      const response = await this.callAI(prompt);
      const processingTime = Date.now() - startTime;

      const result: AnalysisResult = {
        id: this.generateId(),
        timestamp: new Date().toISOString(),
        request: validatedRequest,
        score: this.parseScore(response, 'analysis'),
        analysis: this.parseCodeAnalysis(response),
        recommendations: this.parseRecommendations(response),
        metadata: {
          model: this.config.model,
          processingTime,
          tokens: this.extractTokenUsage(response),
        },
      };

      return AnalysisResultSchema.parse(result);
    } catch (error) {
      throw this.handleError(error, 'analysis');
    }
  }

  async diff(request: DiffRequest): Promise<DiffResult> {
    const validatedRequest = DiffRequestSchema.parse(request);
    const startTime = Date.now();

    const prompt = this.buildDiffPrompt(validatedRequest);

    try {
      const response = await this.callAI(prompt);
      const processingTime = Date.now() - startTime;

      const result: DiffResult = {
        id: this.generateId(),
        timestamp: new Date().toISOString(),
        request: validatedRequest,
        diff: this.parseDiff(response, validatedRequest),
        analysis: this.parseDiffAnalysis(response),
        recommendations: this.parseRecommendations(response),
        metadata: {
          model: this.config.model,
          processingTime,
        },
      };

      return DiffResultSchema.parse(result);
    } catch (error) {
      throw this.handleError(error, 'diff');
    }
  }

  async validateCode(code: string, language?: string): Promise<boolean> {
    try {
      const prompt = `Validate if this is syntactically correct ${language || 'code'}:\n\n${code}\n\nRespond with only 'true' or 'false'.`;
      const response = await this.callAI(prompt);
      return response.trim().toLowerCase() === 'true';
    } catch {
      return false;
    }
  }

  private async callAI(prompt: string): Promise<string> {
    if (this.openai && this.config.model.startsWith('gpt-')) {
      const completion = await this.openai.chat.completions.create({
        model: this.config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 4000,
      });

      return completion.choices[0]?.message?.content || '';
    } else if (this.anthropic && this.config.model.startsWith('claude-')) {
      const completion = await this.anthropic.messages.create({
        model: this.config.model,
        max_tokens: 4000,
        temperature: 0.1,
        messages: [{ role: 'user', content: prompt }],
      });

      if (completion.content[0]?.type === 'text') {
        return completion.content[0].text;
      }
      return '';
    }

    throw new Error(`Unsupported model: ${this.config.model}`);
  }

  private buildComparisonPrompt(request: ComparisonRequest): string {
    return `You are an expert code reviewer and AI assistant. Compare these two code snippets and provide a detailed analysis.

Code A (${request.codeA.filename || 'snippet A'}):
\`\`\`${request.codeA.language || ''}
${request.codeA.content}
\`\`\`

Code B (${request.codeB.filename || 'snippet B'}):
\`\`\`${request.codeB.language || ''}
${request.codeB.content}
\`\`\`

Context: ${request.context || 'General comparison'}
Analysis Type: ${request.comparisonType}

Please provide your response in this JSON format:
{
  "score": {
    "overall": 85,
    "semantic": 90,
    "performance": 80,
    "security": 85,
    "maintainability": 88,
    "style": 82,
    "functionality": 90
  },
  "analysis": {
    "summary": "Brief summary of the comparison",
    "differences": ["Key difference 1", "Key difference 2"],
    "similarities": ["Similarity 1", "Similarity 2"],
    "winner": "codeA|codeB|tie",
    "reasoning": "Detailed reasoning for the winner"
  },
  "recommendations": [
    {
      "type": "improvement",
      "title": "Recommendation title",
      "description": "Detailed description",
      "codeExample": "Optional code example",
      "severity": "low|medium|high|critical",
      "category": "performance|security|style|etc"
    }
  ]
}`;
  }

  private buildAnalysisPrompt(request: AnalysisRequest): string {
    return `You are an expert code reviewer. Analyze this code snippet for quality, security, performance, and other aspects.

Code (${request.code.filename || 'snippet'}):
\`\`\`${request.code.language || ''}
${request.code.content}
\`\`\`

Context: ${request.context || 'General analysis'}
Analysis Type: ${request.analysisType}

Provide response in JSON format:
{
  "score": {
    "overall": 85,
    "quality": 88,
    "security": 80,
    "performance": 85,
    "maintainability": 90,
    "readability": 88,
    "complexity": 75
  },
  "analysis": {
    "summary": "Overall assessment",
    "strengths": ["Strength 1", "Strength 2"],
    "weaknesses": ["Weakness 1", "Weakness 2"],
    "complexity": {
      "cyclomatic": 5,
      "cognitive": 8,
      "lines": 50,
      "functions": 3
    }
  },
  "recommendations": [
    {
      "type": "improvement",
      "title": "Recommendation",
      "description": "Details",
      "severity": "medium",
      "category": "performance"
    }
  ]
}`;
  }

  private buildDiffPrompt(request: DiffRequest): string {
    return `Analyze the differences between these two code versions and assess the impact.

Old Code:
\`\`\`${request.oldCode.language || ''}
${request.oldCode.content}
\`\`\`

New Code:
\`\`\`${request.newCode.language || ''}
${request.newCode.content}
\`\`\`

Provide response in JSON format:
{
  "diff": {
    "additions": 5,
    "deletions": 2,
    "modifications": 3,
    "diffText": "Unified diff format"
  },
  "analysis": {
    "summary": "Summary of changes",
    "impactLevel": "low|medium|high|critical",
    "changeType": "feature|bugfix|refactor|optimization|breaking",
    "affectedAreas": ["Area 1", "Area 2"],
    "riskAssessment": "Risk analysis"
  },
  "recommendations": []
}`;
  }

  private parseScore(response: string, type: string): any {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.score;
      }
    } catch {
      // Return default scores if parsing fails
    }
    return undefined;
  }

  private parseAnalysis(response: string, type: string): any {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.analysis;
      }
    } catch {
      // Return default analysis if parsing fails
    }

    return {
      summary: 'Analysis completed',
      differences: [],
      similarities: [],
      reasoning: 'Unable to parse detailed analysis',
    };
  }

  private parseCodeAnalysis(response: string): any {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.analysis;
      }
    } catch {
      // Return default analysis if parsing fails
    }

    return {
      summary: 'Code analysis completed',
      strengths: [],
      weaknesses: [],
      complexity: {
        lines: 0,
      },
    };
  }

  private parseDiff(response: string, request: DiffRequest): any {
    // Simple diff calculation as fallback
    const oldLines = request.oldCode.content.split('\n');
    const newLines = request.newCode.content.split('\n');

    return {
      additions: Math.max(0, newLines.length - oldLines.length),
      deletions: Math.max(0, oldLines.length - newLines.length),
      modifications: Math.min(oldLines.length, newLines.length),
      diffText: `--- ${request.oldCode.filename || 'old'}\n+++ ${request.newCode.filename || 'new'}\n@@ -1,${oldLines.length} +1,${newLines.length} @@`,
    };
  }

  private parseDiffAnalysis(response: string): any {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.analysis;
      }
    } catch {
      // Return default analysis if parsing fails
    }

    return {
      summary: 'Changes detected',
      impactLevel: 'medium' as const,
      changeType: 'refactor' as const,
      affectedAreas: [],
      riskAssessment: 'Standard code changes',
    };
  }

  private parseRecommendations(response: string): any[] {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.recommendations || [];
      }
    } catch {
      // Return empty recommendations if parsing fails
    }
    return [];
  }

  private extractTokenUsage(response: any): { input: number, output: number } | undefined {
    // This would extract token usage from the AI response if available
    return undefined;
  }

  private generateId(): string {
    return `trycomp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private handleError(error: unknown, operation: string): TryCompError {
    const trycompError: TryCompError = new Error(
      `TryComp ${operation} failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );

    if (error instanceof Error) {
      trycompError.code = 'TRYCOMP_ERROR';
      trycompError.stack = error.stack;
    }

    return trycompError;
  }
}

export function createTryCompClient(config?: Partial<TryCompConfig>): TryCompClient {
  return new TryCompAIClient(config);
}
