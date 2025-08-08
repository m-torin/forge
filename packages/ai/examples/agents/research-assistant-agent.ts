/**
 * Real-World Research Assistant Agent Example
 *
 * This example demonstrates a comprehensive research assistant that conducts
 * multi-step research workflows using all advanced agent features including
 * memory persistence, agent coordination, dynamic tool selection, and
 * comprehensive observability.
 */

import { tool } from 'ai';
import { z } from 'zod/v4';

// Import all advanced agent features
import {
  AdvancedToolManager,
  type ToolExecutionContext,
} from '../../src/server/agents/advanced-tool-management';
import {
  AgentCommunicationManager,
  communicationUtils,
  createCommunicationAwareAgent,
  type AgentCapability,
} from '../../src/server/agents/agent-communication';
import { agentConfigurationTemplates } from '../../src/server/agents/agent-configuration-templates';
import {
  AgentMemoryManager,
  createMemoryAwareAgent,
  memoryUtils,
} from '../../src/server/agents/agent-memory';
import {
  AgentObservabilityManager,
  createObservableAgent,
  type AgentMonitoringConfig,
} from '../../src/server/agents/agent-observability';

/**
 * Research Assistant Agent Implementation
 *
 * Features:
 * - Multi-step research workflows with memory persistence
 * - Coordination with specialized research agents
 * - Dynamic tool selection based on research domain
 * - Comprehensive source tracking and citation generation
 * - Performance monitoring and optimization
 */
export class ResearchAssistantAgent {
  private agent: any;
  private memoryManager: AgentMemoryManager;
  private communicationManager: AgentCommunicationManager;
  private toolManager: AdvancedToolManager;
  private observabilityManager: AgentObservabilityManager;
  private researchSessions: Map<string, ResearchSession> = new Map();

  constructor(agentId: string, customConfig?: Partial<AgentMonitoringConfig>) {
    this.setupManagers(agentId, customConfig);
    this.createAgent(agentId);
    this.initializeResearchTools();
    this.registerAgentCapabilities(agentId);
  }

  private setupManagers(agentId: string, customConfig?: Partial<AgentMonitoringConfig>) {
    const researchTemplate = agentConfigurationTemplates.researchAssistant;

    // Extended memory for long-term research projects
    this.memoryManager = new AgentMemoryManager(agentId, {
      ...researchTemplate.memoryConfig,
      maxEntries: 5000, // Large capacity for research data
      retentionDays: 180, // 6 months for research projects
      persistenceEnabled: true,
      searchEnabled: true,
    });

    this.communicationManager = new AgentCommunicationManager();

    this.toolManager = new AdvancedToolManager({
      cacheEnabled: true,
      performanceTracking: true,
      autoOptimization: true,
      cacheTtl: 7200000, // 2 hour cache for research data
      maxCacheSize: 100,
    });

    const monitoringConfig: AgentMonitoringConfig = {
      ...researchTemplate.monitoringConfig,
      alertThresholds: {
        maxExecutionTime: 300000, // 5 minutes for complex research
        maxTokenUsage: 50000, // High token usage for research
        minSuccessRate: 0.8,
        maxErrorRate: 0.2,
      },
      ...customConfig,
    };
    this.observabilityManager = new AgentObservabilityManager(monitoringConfig);
  }

  private createAgent(agentId: string) {
    const baseAgent = {
      id: agentId,
      name: 'Research Assistant Agent',
      description: 'AI-powered research assistant with advanced multi-step research capabilities',
    };

    this.agent = createObservableAgent(
      createCommunicationAwareAgent(
        createMemoryAwareAgent(baseAgent, this.memoryManager.getConfig()),
        this.communicationManager,
        this.getResearchCapabilities(),
      ),
      this.observabilityManager,
    );
  }

  private getResearchCapabilities(): AgentCapability[] {
    return [
      communicationUtils.createCapability(
        'academic_search',
        'Search academic databases and repositories',
        { cost: 3, quality: 0.95, availability: 0.9 },
      ),
      communicationUtils.createCapability(
        'web_research',
        'Comprehensive web research and source analysis',
        { cost: 2, quality: 0.85, availability: 0.95 },
      ),
      communicationUtils.createCapability(
        'data_analysis',
        'Statistical and qualitative data analysis',
        { cost: 4, quality: 0.9, availability: 0.8 },
      ),
      communicationUtils.createCapability(
        'synthesis_generation',
        'Synthesize findings into coherent reports',
        { cost: 3, quality: 0.88, availability: 0.95 },
      ),
      communicationUtils.createCapability(
        'citation_management',
        'Generate and manage academic citations',
        { cost: 1, quality: 0.98, availability: 0.99 },
      ),
    ];
  }

  private initializeResearchTools() {
    // Academic Search Tool
    const academicSearchTool = tool({
      description: 'Search academic databases for peer-reviewed papers and research',
      inputSchema: z.object({
        query: z.string().describe('Research query with keywords'),
        databases: z
          .array(z.enum(['arxiv', 'pubmed', 'ieee', 'acm', 'google_scholar']))
          .default(['google_scholar']),
        dateRange: z
          .object({
            start: z.string().optional(),
            end: z.string().optional(),
          })
          .optional(),
        maxResults: z.number().min(1).max(50).default(10),
        sortBy: z.enum(['relevance', 'date', 'citations']).default('relevance'),
      }),
      execute: async ({ query, databases, dateRange: _dateRange, maxResults, sortBy }) => {
        // Simulate academic search
        const papers = [
          {
            id: 'paper_001',
            title: 'Machine Learning Applications in Software Development: A Comprehensive Survey',
            authors: ['Smith, J.', 'Johnson, A.', 'Williams, R.'],
            journal: 'ACM Computing Surveys',
            year: 2024,
            doi: '10.1145/3589334.3645573',
            abstract:
              'This survey examines the current state of machine learning applications in software development...',
            citations: 234,
            database: 'acm',
            relevanceScore: 0.94,
            keywords: ['machine learning', 'software development', 'AI tools'],
            openAccess: true,
            pdfUrl: 'https://example.com/paper1.pdf',
          },
          {
            id: 'paper_002',
            title: 'The Impact of AI Code Assistants on Developer Productivity',
            authors: ['Chen, L.', 'Davis, M.'],
            journal: 'IEEE Software',
            year: 2024,
            doi: '10.1109/MS.2024.3365890',
            abstract:
              'We conducted a longitudinal study measuring the impact of AI code assistants...',
            citations: 89,
            database: 'ieee',
            relevanceScore: 0.91,
            keywords: ['AI assistants', 'productivity', 'code generation'],
            openAccess: false,
            pdfUrl: null,
          },
        ];

        // Filter and sort based on parameters
        let filteredPapers = papers.filter(
          paper =>
            databases.includes(paper.database as any) &&
            paper.title.toLowerCase().includes(query.toLowerCase()),
        );

        if (sortBy === 'citations') {
          filteredPapers.sort((a, b) => b.citations - a.citations);
        } else if (sortBy === 'date') {
          filteredPapers.sort((a, b) => b.year - a.year);
        } else {
          filteredPapers.sort((a, b) => b.relevanceScore - a.relevanceScore);
        }

        return {
          results: filteredPapers.slice(0, maxResults),
          totalFound: filteredPapers.length,
          query,
          searchTime: Math.random() * 2000 + 500, // 500-2500ms
          databases: databases,
        };
      },
    });

    this.toolManager.registerTool(academicSearchTool, {
      id: 'academic_search',
      name: 'Academic Database Search',
      description: 'Searches academic databases for research papers',
      category: 'research',
      version: '3.2.0',
      author: 'research-team',
      tags: ['academic', 'papers', 'research', 'database'],
      complexity: 'moderate',
      reliability: 0.92,
      performance: 0.8,
      cost: 4,
      dependencies: [],
      conflicts: [],
      requirements: { network: 'high', apiKey: 'required' },
      isActive: true,
    });

    // Web Research Tool
    const webResearchTool = tool({
      description: 'Comprehensive web research with source credibility analysis',
      inputSchema: z.object({
        query: z.string().describe('Research query'),
        domains: z.array(z.string()).optional().describe('Specific domains to search'),
        excludeDomains: z.array(z.string()).optional().describe('Domains to exclude'),
        contentType: z.enum(['news', 'blogs', 'academic', 'general']).default('general'),
        maxResults: z.number().min(1).max(20).default(10),
        dateFilter: z.enum(['day', 'week', 'month', 'year', 'all']).default('all'),
      }),
      execute: async ({ query, domains, excludeDomains, contentType, maxResults, dateFilter }) => {
        // Simulate web research
        const sources = [
          {
            id: 'web_001',
            title: 'AI in Software Development: Current Trends and Future Outlook',
            url: 'https://techreview.com/ai-software-development-2024',
            domain: 'techreview.com',
            publishDate: '2024-01-15',
            author: 'Sarah Mitchell',
            summary:
              'An in-depth analysis of how AI is transforming software development practices...',
            credibilityScore: 0.89,
            contentType: 'news',
            wordCount: 2400,
            keyPoints: [
              'AI code completion tools reduce development time by 30-40%',
              'Quality concerns remain with AI-generated code',
              'Developer adoption rates vary significantly by experience level',
            ],
          },
          {
            id: 'web_002',
            title: 'GitHub Copilot Usage Statistics and Developer Survey Results',
            url: 'https://github.blog/copilot-statistics-2024',
            domain: 'github.blog',
            publishDate: '2024-02-01',
            author: 'GitHub Research Team',
            summary: 'Official statistics and survey results from GitHub Copilot usage...',
            credibilityScore: 0.95,
            contentType: 'general',
            wordCount: 1800,
            keyPoints: [
              '1.3 million developers actively use GitHub Copilot',
              '46% report increased productivity',
              'Code acceptance rate averages 35%',
            ],
          },
        ];

        let filteredSources = sources.filter(source => {
          const matchesQuery =
            source.title.toLowerCase().includes(query.toLowerCase()) ||
            source.summary.toLowerCase().includes(query.toLowerCase());
          const matchesDomains = !domains || domains.some(d => source.domain.includes(d));
          const excludedDomains =
            excludeDomains && excludeDomains.some(d => source.domain.includes(d));
          const matchesContentType =
            contentType === 'general' || source.contentType === contentType;

          return matchesQuery && matchesDomains && !excludedDomains && matchesContentType;
        });

        return {
          results: filteredSources.slice(0, maxResults),
          totalFound: filteredSources.length,
          averageCredibility:
            filteredSources.reduce((sum, s) => sum + s.credibilityScore, 0) /
            filteredSources.length,
          searchParameters: { query, contentType, dateFilter },
          recommendedSources: filteredSources.filter(s => s.credibilityScore > 0.9),
        };
      },
    });

    this.toolManager.registerTool(webResearchTool, {
      id: 'web_research',
      name: 'Web Research Tool',
      description: 'Comprehensive web research with credibility analysis',
      category: 'research',
      version: '2.5.0',
      author: 'research-team',
      tags: ['web', 'research', 'credibility', 'sources'],
      complexity: 'moderate',
      reliability: 0.88,
      performance: 0.85,
      cost: 3,
      dependencies: [],
      conflicts: [],
      requirements: { network: 'high' },
      isActive: true,
    });

    // Data Analysis Tool
    const dataAnalysisTool = tool({
      description: 'Analyze research data and generate insights',
      inputSchema: z.object({
        data: z.array(z.record(z.any())).describe('Research data to analyze'),
        analysisType: z.enum(['descriptive', 'comparative', 'trend', 'correlation']),
        variables: z.array(z.string()).optional().describe('Specific variables to analyze'),
        confidenceLevel: z.number().min(0.8).max(0.99).default(0.95),
      }),
      execute: async ({ data, analysisType, variables, confidenceLevel }) => {
        // Simulate data analysis
        const sampleSize = data.length;
        const analysisResults = {
          descriptive: {
            sampleSize,
            variables: variables || Object.keys(data[0] || {}),
            summary: {
              totalDataPoints: sampleSize,
              completenessRate: 0.92,
              outliers: Math.floor(sampleSize * 0.05),
            },
            statistics: {
              mean: 75.6,
              median: 78.2,
              standardDeviation: 12.4,
              range: { min: 45.2, max: 98.7 },
            },
          },
          comparative: {
            groups: ['Group A', 'Group B'],
            significantDifference: true,
            pValue: 0.032,
            effectSize: 0.64,
            confidenceInterval: [0.12, 1.16],
          },
          trend: {
            direction: 'increasing',
            strength: 0.78,
            rSquared: 0.61,
            predictedGrowth: '15% annually',
            trendEquation: 'y = 2.3x + 42.1',
          },
          correlation: {
            correlations: [
              {
                variables: ['productivity', 'ai_usage'],
                coefficient: 0.72,
                significance: 'strong',
              },
              {
                variables: ['experience', 'adoption_rate'],
                coefficient: -0.34,
                significance: 'moderate',
              },
            ],
            strongestCorrelation: { variables: ['productivity', 'ai_usage'], coefficient: 0.72 },
          },
        };

        return {
          analysisType,
          results: analysisResults[analysisType],
          confidenceLevel,
          recommendations: [
            'Consider additional data collection in identified gaps',
            'Validate findings with larger sample size',
            'Investigate causal relationships for strong correlations',
          ],
          visualizations: [
            { type: 'histogram', description: 'Distribution of main variable' },
            { type: 'scatter_plot', description: 'Correlation visualization' },
            { type: 'box_plot', description: 'Outlier identification' },
          ],
        };
      },
    });

    this.toolManager.registerTool(dataAnalysisTool, {
      id: 'data_analysis',
      name: 'Research Data Analysis',
      description: 'Statistical and qualitative analysis of research data',
      category: 'analysis',
      version: '4.1.0',
      author: 'analytics-team',
      tags: ['statistics', 'analysis', 'data', 'insights'],
      complexity: 'complex',
      reliability: 0.91,
      performance: 0.75,
      cost: 5,
      dependencies: [],
      conflicts: [],
      requirements: { cpu: 'high', memory: 'high' },
      isActive: true,
    });

    // Citation Generator Tool
    const citationTool = tool({
      description: 'Generate proper academic citations in various formats',
      inputSchema: z.object({
        sources: z.array(
          z.object({
            type: z.enum(['journal', 'conference', 'book', 'website', 'thesis']),
            title: z.string(),
            authors: z.array(z.string()),
            year: z.number(),
            journal: z.string().optional(),
            volume: z.string().optional(),
            issue: z.string().optional(),
            pages: z.string().optional(),
            doi: z.string().optional(),
            url: z.string().optional(),
            publisher: z.string().optional(),
            accessDate: z.string().optional(),
          }),
        ),
        style: z.enum(['APA', 'MLA', 'Chicago', 'IEEE', 'Harvard']).default('APA'),
      }),
      execute: async ({ sources, style }) => {
        const citations = sources.map((source, index) => {
          let citation = '';

          if (style === 'APA') {
            const authors = source.authors.join(', ');
            citation = `${authors} (${source.year}). ${source.title}.`;

            if (source.journal) {
              citation += ` ${source.journal}`;
              if (source.volume) citation += `, ${source.volume}`;
              if (source.issue) citation += `(${source.issue})`;
              if (source.pages) citation += `, ${source.pages}`;
            }

            if (source.doi) {
              citation += ` https://doi.org/${source.doi}`;
            } else if (source.url) {
              citation += ` ${source.url}`;
            }
          } else {
            // Simplified for other styles
            citation = `${source.authors.join(', ')} "${source.title}" ${source.year}`;
          }

          return {
            id: `citation_${index + 1}`,
            source: source.title,
            citation,
            style,
          };
        });

        return {
          citations,
          style,
          bibliography: citations.map(c => c.citation).join('\n\n'),
          inTextCitations: citations.map(c =>
            style === 'APA'
              ? `(${c.source.split(' ')[0]}, ${sources.find(s => s.title === c.source)?.year})`
              : c.source,
          ),
        };
      },
    });

    this.toolManager.registerTool(citationTool, {
      id: 'citation_generator',
      name: 'Academic Citation Generator',
      description: 'Generates citations in multiple academic formats',
      category: 'formatting',
      version: '2.3.0',
      author: 'academic-tools',
      tags: ['citations', 'bibliography', 'academic', 'formatting'],
      complexity: 'simple',
      reliability: 0.98,
      performance: 0.95,
      cost: 1,
      dependencies: [],
      conflicts: [],
      requirements: {},
      isActive: true,
    });
  }

  private registerAgentCapabilities(agentId: string) {
    this.communicationManager.registerAgent(agentId, this.getResearchCapabilities(), {
      specialization: 'research_assistant',
      domains: ['computer_science', 'artificial_intelligence', 'software_engineering'],
      experience_level: 'expert',
      languages: ['en'],
    });
  }

  /**
   * Conduct comprehensive research on a given topic
   */
  async conductResearch(
    topic: string,
    sessionId: string,
    requirements: {
      depth: 'basic' | 'comprehensive' | 'expert';
      sources: ('academic' | 'web' | 'industry')[];
      timeline?: string;
      specificQuestions?: string[];
      citationStyle?: 'APA' | 'MLA' | 'Chicago' | 'IEEE';
    },
  ): Promise<ResearchResult> {
    const traceId = this.observabilityManager.startTrace(this.agent.id, sessionId);

    try {
      // Initialize research session
      const researchSession: ResearchSession = {
        id: sessionId,
        topic,
        requirements,
        startTime: Date.now(),
        status: 'in_progress',
        steps: [],
        sources: [],
        findings: [],
      };

      this.researchSessions.set(sessionId, researchSession);

      this.observabilityManager.recordEvent({
        agentId: this.agent.id,
        sessionId,
        type: 'research_started',
        level: 'info',
        message: `Research initiated for topic: ${topic}`,
        data: { topic, requirements },
        tags: ['research', 'start'],
      });

      // Store research parameters in memory
      this.memoryManager.addMemory(
        'task',
        `Research project: ${topic}`,
        { sessionId, requirements, startTime: Date.now() },
        0.95,
        ['research', 'project', 'current'],
      );

      // Step 1: Academic Search (if requested)
      if (requirements.sources.includes('academic')) {
        await this.performAcademicSearch(topic, sessionId, researchSession);
      }

      // Step 2: Web Research (if requested)
      if (requirements.sources.includes('web')) {
        await this.performWebResearch(topic, sessionId, researchSession);
      }

      // Step 3: Data Analysis
      if (researchSession.sources.length > 0) {
        await this.performDataAnalysis(sessionId, researchSession);
      }

      // Step 4: Generate Citations
      if (researchSession.sources.length > 0) {
        await this.generateCitations(
          sessionId,
          researchSession,
          requirements.citationStyle || 'APA',
        );
      }

      // Step 5: Synthesis and Report Generation
      const report = await this.synthesizeFindings(sessionId, researchSession);

      // Mark session as completed
      researchSession.status = 'completed';
      researchSession.endTime = Date.now();
      researchSession.report = report;

      this.observabilityManager.recordEvent({
        agentId: this.agent.id,
        sessionId,
        type: 'research_completed',
        level: 'info',
        message: `Research completed for topic: ${topic}`,
        data: {
          duration: researchSession.endTime - researchSession.startTime,
          sourcesFound: researchSession.sources.length,
          findingsGenerated: researchSession.findings.length,
        },
        tags: ['research', 'completed'],
      });

      return {
        sessionId,
        topic,
        status: 'completed',
        sources: researchSession.sources,
        findings: researchSession.findings,
        report,
        metadata: {
          duration: researchSession.endTime - researchSession.startTime,
          totalSources: researchSession.sources.length,
          steps: researchSession.steps,
        },
      };
    } catch (error) {
      this.observabilityManager.recordEvent({
        agentId: this.agent.id,
        sessionId,
        type: 'research_error',
        level: 'error',
        message: 'Error during research process',
        data: { error: error instanceof Error ? error.message : 'Unknown error', topic },
        tags: ['research', 'error'],
      });

      throw error;
    } finally {
      this.observabilityManager.stopTrace(traceId, {
        steps: [],
        finalResult: { text: 'Research process completed', finishReason: 'stop' },
        totalTokensUsed: 5000, // Estimated
        executionTime: Date.now() - parseInt(traceId.split('_')[1] || '0'),
        stoppedBy: 'completed',
      });
    }
  }

  private async performAcademicSearch(topic: string, sessionId: string, session: ResearchSession) {
    const context = this.createExecutionContext(sessionId, session.steps.length + 1);

    const academicResult = await this.toolManager.executeTool(
      'academic_search',
      {
        query: topic,
        databases: ['arxiv', 'ieee', 'acm', 'google_scholar'],
        maxResults: 15,
        sortBy: 'relevance',
      },
      context,
    );

    if (academicResult.success) {
      const papers = academicResult.result.results;

      for (const paper of papers) {
        session.sources.push({
          id: paper.id,
          type: 'academic',
          title: paper.title,
          authors: paper.authors,
          url: paper.pdfUrl,
          credibility: 0.9 + paper.citations / 1000, // Higher credibility for academic sources
          summary: paper.abstract,
          metadata: {
            journal: paper.journal,
            year: paper.year,
            citations: paper.citations,
            doi: paper.doi,
            openAccess: paper.openAccess,
          },
        });

        // Store in memory
        this.memoryManager.addMemory(
          'knowledge',
          `Academic paper: ${paper.title} by ${paper.authors.join(', ')} (${paper.year})`,
          { sessionId, source: 'academic', citations: paper.citations },
          0.9,
          ['research', 'academic', 'paper'],
        );
      }

      session.steps.push({
        step: 'academic_search',
        status: 'completed',
        results: `Found ${papers.length} academic papers`,
        duration: academicResult.executionTime || 0,
      });
    }
  }

  private async performWebResearch(topic: string, sessionId: string, session: ResearchSession) {
    const context = this.createExecutionContext(sessionId, session.steps.length + 1);

    const webResult = await this.toolManager.executeTool(
      'web_research',
      {
        query: topic,
        contentType: 'general',
        maxResults: 12,
      },
      context,
    );

    if (webResult.success) {
      const sources = webResult.result.results;

      for (const source of sources) {
        session.sources.push({
          id: source.id,
          type: 'web',
          title: source.title,
          authors: [source.author],
          url: source.url,
          credibility: source.credibilityScore,
          summary: source.summary,
          metadata: {
            domain: source.domain,
            publishDate: source.publishDate,
            wordCount: source.wordCount,
            keyPoints: source.keyPoints,
          },
        });

        // Store key points in memory
        for (const point of source.keyPoints) {
          this.memoryManager.addMemory(
            'knowledge',
            point,
            { sessionId, source: 'web', credibility: source.credibilityScore },
            source.credibilityScore,
            ['research', 'web', 'insight'],
          );
        }
      }

      session.steps.push({
        step: 'web_research',
        status: 'completed',
        results: `Found ${sources.length} web sources with average credibility ${webResult.result.averageCredibility.toFixed(2)}`,
        duration: webResult.executionTime || 0,
      });
    }
  }

  private async performDataAnalysis(sessionId: string, session: ResearchSession) {
    // Prepare data for analysis
    const analysisData = session.sources.map(source => ({
      id: source.id,
      type: source.type,
      credibility: source.credibility,
      year: source.metadata?.year || new Date().getFullYear(),
      citations: source.metadata?.citations || 0,
      wordCount: source.metadata?.wordCount || 0,
    }));

    const context = this.createExecutionContext(sessionId, session.steps.length + 1);

    const analysisResult = await this.toolManager.executeTool(
      'data_analysis',
      {
        data: analysisData,
        analysisType: 'descriptive',
        variables: ['credibility', 'year', 'citations'],
      },
      context,
    );

    if (analysisResult.success) {
      const insights = analysisResult.result;

      session.findings.push({
        type: 'statistical_analysis',
        content: `Research corpus analysis: ${insights.results.summary.totalDataPoints} sources with ${(insights.results.summary.completenessRate * 100).toFixed(1)}% data completeness`,
        confidence: 0.9,
        sources: session.sources.map(s => s.id),
      });

      // Store analysis insights
      this.memoryManager.addMemory(
        'knowledge',
        `Statistical analysis: ${insights.results.summary.totalDataPoints} sources analyzed, completeness rate: ${insights.results.summary.completenessRate}`,
        { sessionId, analysisType: 'descriptive' },
        0.85,
        ['research', 'analysis', 'statistics'],
      );

      session.steps.push({
        step: 'data_analysis',
        status: 'completed',
        results: `Analyzed ${analysisData.length} sources`,
        duration: analysisResult.executionTime || 0,
      });
    }
  }

  private async generateCitations(sessionId: string, session: ResearchSession, style: string) {
    const citationSources = session.sources
      .filter(source => source.type === 'academic')
      .map(source => ({
        type: 'journal' as const,
        title: source.title,
        authors: source.authors,
        year: source.metadata?.year || new Date().getFullYear(),
        journal: source.metadata?.journal || 'Unknown Journal',
        doi: source.metadata?.doi,
        url: source.url,
      }));

    if (citationSources.length === 0) return;

    const context = this.createExecutionContext(sessionId, session.steps.length + 1);

    const citationResult = await this.toolManager.executeTool(
      'citation_generator',
      {
        sources: citationSources,
        style: style as any,
      },
      context,
    );

    if (citationResult.success) {
      session.bibliography = citationResult.result.bibliography;
      session.inTextCitations = citationResult.result.inTextCitations;

      session.steps.push({
        step: 'citation_generation',
        status: 'completed',
        results: `Generated ${citationResult.result.citations.length} citations in ${style} format`,
        duration: citationResult.executionTime || 0,
      });
    }
  }

  private async synthesizeFindings(sessionId: string, session: ResearchSession): Promise<string> {
    // Retrieve relevant context from memory
    const _researchContext = this.memoryManager.getRelevantContext(
      `research synthesis ${session.topic}`,
      20,
    );

    // Create comprehensive report
    const report = `# Research Report: ${session.topic}

## Executive Summary
This research was conducted using ${session.sources.length} sources across ${session.requirements.sources.join(', ')} domains. The study provides ${session.requirements.depth} coverage of the topic.

## Methodology
- **Sources Analyzed**: ${session.sources.length} total sources
  - Academic Papers: ${session.sources.filter(s => s.type === 'academic').length}
  - Web Sources: ${session.sources.filter(s => s.type === 'web').length}
- **Research Duration**: ${session.endTime ? ((session.endTime - session.startTime) / 1000 / 60).toFixed(1) : 'ongoing'} minutes
- **Processing Steps**: ${session.steps.length}

## Key Findings
${session.findings.map((finding, i) => `${i + 1}. ${finding.content} (Confidence: ${(finding.confidence * 100).toFixed(1)}%)`).join('\n')}

## Source Analysis
- **Average Source Credibility**: ${(session.sources.reduce((sum, s) => sum + s.credibility, 0) / session.sources.length).toFixed(2)}
- **Most Credible Source**: ${session.sources.reduce((max, s) => (s.credibility > max.credibility ? s : max)).title}
- **Publication Years**: ${Math.min(...session.sources.map(s => s.metadata?.year || 2024))} - ${Math.max(...session.sources.map(s => s.metadata?.year || 2024))}

## Recommendations for Further Research
1. Expand search to additional academic databases
2. Include more recent publications (last 6 months)
3. Consider longitudinal studies for trend analysis
4. Investigate conflicting findings in more detail

${
  session.bibliography
    ? `## Bibliography
${session.bibliography}`
    : ''
}

---
*Report generated by Research Assistant Agent on ${new Date().toISOString()}*
*Session ID: ${sessionId}*`;

    // Store the complete report in memory
    this.memoryManager.addMemory(
      'knowledge',
      `Research report completed for: ${session.topic}`,
      { sessionId, reportLength: report.length, sourcesUsed: session.sources.length },
      0.95,
      ['research', 'report', 'completed'],
    );

    return report;
  }

  private createExecutionContext(sessionId: string, stepNumber: number): ToolExecutionContext {
    return {
      agentId: this.agent.id,
      sessionId,
      stepNumber,
      previousResults: [],
      availableTools: ['academic_search', 'web_research', 'data_analysis', 'citation_generator'],
      executionLimits: {
        maxCalls: 20,
        timeout: 60000,
      },
    };
  }

  /**
   * Get research session details
   */
  getResearchSession(sessionId: string): ResearchSession | undefined {
    return this.researchSessions.get(sessionId);
  }

  /**
   * Export research data for analysis
   */
  exportResearchData(sessionId?: string): any {
    const session = sessionId ? this.researchSessions.get(sessionId) : null;

    return {
      sessions: sessionId ? [session] : Array.from(this.researchSessions.values()),
      memory: memoryUtils.exportMemory(this.memoryManager),
      performance: {
        memory: this.memoryManager.getMemoryMetrics(),
        tools: this.toolManager.generateUsageReport(),
        observability: this.observabilityManager.generateHealthReport(this.agent.id),
      },
    };
  }
}

// Type definitions for research session tracking
interface ResearchSession {
  id: string;
  topic: string;
  requirements: any;
  startTime: number;
  endTime?: number;
  status: 'in_progress' | 'completed' | 'failed';
  steps: Array<{
    step: string;
    status: string;
    results: string;
    duration: number;
  }>;
  sources: Array<{
    id: string;
    type: 'academic' | 'web' | 'industry';
    title: string;
    authors: string[];
    url?: string;
    credibility: number;
    summary: string;
    metadata: any;
  }>;
  findings: Array<{
    type: string;
    content: string;
    confidence: number;
    sources: string[];
  }>;
  bibliography?: string;
  inTextCitations?: string[];
  report?: string;
}

interface ResearchResult {
  sessionId: string;
  topic: string;
  status: string;
  sources: any[];
  findings: any[];
  report: string;
  metadata: {
    duration: number;
    totalSources: number;
    steps: any[];
  };
}

/**
 * Example usage of the Research Assistant Agent
 */
export async function demonstrateResearchAssistant() {
  console.log('🔬 Creating Research Assistant Agent with Advanced Features...');

  const researchAgent = new ResearchAssistantAgent('research-agent-001', {
    traceLevel: 'debug',
  });

  const researchTopics = [
    {
      topic: 'Impact of AI Code Assistants on Software Development Productivity',
      requirements: {
        depth: 'comprehensive' as const,
        sources: ['academic', 'web'] as const,
        specificQuestions: [
          'What is the measured productivity impact?',
          'What are the adoption barriers?',
          'How does code quality change?',
        ],
        citationStyle: 'APA' as const,
      },
    },
    {
      topic: 'Machine Learning in Automated Testing',
      requirements: {
        depth: 'expert' as const,
        sources: ['academic'] as const,
        timeline: '2022-2024',
        citationStyle: 'IEEE' as const,
      },
    },
  ];

  console.log('\n📚 Conducting Research Projects...');

  for (const [index, project] of researchTopics.entries()) {
    const sessionId = `research_session_${index + 1}`;

    console.log(`
--- Research Project ${index + 1}: ${project.topic} ---`);

    try {
      const result = await researchAgent.conductResearch(
        project.topic,
        sessionId,
        project.requirements,
      );

      console.log(
        `
✅ Research completed in ${(result.metadata.duration / 1000 / 60).toFixed(1)} minutes`,
      );
      console.log(`📄 Sources found: ${result.metadata.totalSources}`);
      console.log(`🔍 Key findings: ${result.findings.length}`);

      // Show excerpt from report
      const reportExcerpt = result.report.substring(0, 300) + '...';
      console.log(`
📊 Report excerpt:
${reportExcerpt}`);
    } catch (error) {
      console.error(`❌ Research failed: ${error}`);
    }
  }

  // Export research data
  const exportData = researchAgent.exportResearchData();
  console.log(`
📈 Total research sessions: ${exportData.sessions.length}`);
  console.log(`🧠 Memory entries: ${exportData.performance.memory.totalMemories}`);
  console.log(`🔧 Tool executions: ${exportData.performance.tools.totalExecutions}`);

  console.log('✅ Research Assistant demonstration completed!');

  return researchAgent;
}

export default ResearchAssistantAgent;
