/**
 * AI SDK v5 Agent Patterns
 * Common agent patterns and templates following best practices
 */

import type { LanguageModel } from 'ai';
import {
  agentControlPresets,
  createAgentControlStrategy,
  type PrepareStepCallback,
} from './agent-controls';
import type { AgentDefinition } from './agent-orchestrator';
import {
  hasToolCall,
  stepCountAtMost,
  taskComplete,
  textContains,
  type StepCondition,
} from './step-conditions';

/**
 * Agent pattern configuration
 */
export interface AgentPatternConfig {
  model: LanguageModel;
  tools: Record<string, any>;
  customization?: {
    maxSteps?: number;
    temperature?: number;
    systemPrompt?: string;
    stopConditions?: StepCondition[];
    prepareStep?: PrepareStepCallback;
  };
}

/**
 * Create a research agent that follows a structured research methodology
 */
export function createResearchAgent(id: string, config: AgentPatternConfig): AgentDefinition {
  return {
    id,
    name: 'Research Agent',
    description: 'Conducts comprehensive research following a structured methodology',
    model: config.model,
    tools: config.tools,
    maxSteps: config.customization?.maxSteps || 15,
    temperature: config.customization?.temperature || 0.4,
    system:
      config.customization?.systemPrompt ||
      `You are a professional research agent. Follow this methodology:

1. UNDERSTAND: Clearly understand the research question or topic
2. PLAN: Create a comprehensive research plan
3. SEARCH: Gather information from multiple reliable sources
4. ANALYZE: Critically analyze and synthesize the information
5. VERIFY: Cross-check facts and verify claims
6. SYNTHESIZE: Create a coherent summary with key insights
7. CONCLUDE: Provide clear conclusions and recommendations

Always cite your sources and be transparent about limitations in your research.`,
    stopWhen: config.customization?.stopConditions || [
      stepCountAtMost(15),
      hasToolCall('generate_research_summary'),
      textContains('research complete'),
    ],
    prepareStep: config.customization?.prepareStep || agentControlPresets.researchAgent,
  };
}

/**
 * Create a problem-solving agent that uses structured problem-solving approaches
 */
export function createProblemSolvingAgent(id: string, config: AgentPatternConfig): AgentDefinition {
  return {
    id,
    name: 'Problem Solving Agent',
    description: 'Solves complex problems using structured methodologies',
    model: config.model,
    tools: config.tools,
    maxSteps: config.customization?.maxSteps || 20,
    temperature: config.customization?.temperature || 0.6,
    system:
      config.customization?.systemPrompt ||
      `You are an expert problem-solving agent. Use this systematic approach:

1. DEFINE: Clearly define the problem and its scope
2. ANALYZE: Break down the problem into smaller components
3. EXPLORE: Generate multiple potential solutions
4. EVALUATE: Assess the pros and cons of each solution
5. DECIDE: Choose the best solution based on criteria
6. IMPLEMENT: Create a detailed implementation plan
7. VALIDATE: Test and verify the solution works
8. ITERATE: Refine based on feedback and results

Be creative in solution generation but rigorous in evaluation.`,
    stopWhen: config.customization?.stopConditions || [
      stepCountAtMost(20),
      hasToolCall('validate_solution'),
      textContains('solution validated'),
      taskComplete,
    ],
    prepareStep: config.customization?.prepareStep || agentControlPresets.problemSolvingAgent,
  };
}

/**
 * Create a code generation agent specialized for software development
 */
export function createCodeGenerationAgent(id: string, config: AgentPatternConfig): AgentDefinition {
  return {
    id,
    name: 'Code Generation Agent',
    description: 'Generates high-quality code following best practices',
    model: config.model,
    tools: config.tools,
    maxSteps: config.customization?.maxSteps || 25,
    temperature: config.customization?.temperature || 0.2,
    system:
      config.customization?.systemPrompt ||
      `You are an expert software developer. Follow these principles:

1. UNDERSTAND: Carefully analyze requirements and constraints
2. DESIGN: Plan the architecture and approach
3. IMPLEMENT: Write clean, efficient, well-documented code
4. TEST: Create comprehensive tests for your code
5. REFACTOR: Improve code quality and maintainability
6. VALIDATE: Ensure the solution meets all requirements
7. DOCUMENT: Provide clear documentation and usage examples

Always follow:
- Clean code principles
- Proper error handling
- Security best practices
- Performance optimization
- Comprehensive testing`,
    stopWhen: config.customization?.stopConditions || [
      stepCountAtMost(25),
      hasToolCall('validate_implementation'),
      textContains('implementation complete'),
      hasToolCall('run_tests'),
    ],
    prepareStep: config.customization?.prepareStep || agentControlPresets.codeAgent,
  };
}

/**
 * Create an analysis agent specialized for data and content analysis
 */
export function createAnalysisAgent(id: string, config: AgentPatternConfig): AgentDefinition {
  return {
    id,
    name: 'Analysis Agent',
    description: 'Performs comprehensive analysis of data and content',
    model: config.model,
    tools: config.tools,
    maxSteps: config.customization?.maxSteps || 12,
    temperature: config.customization?.temperature || 0.3,
    system:
      config.customization?.systemPrompt ||
      `You are a professional data and content analyst. Follow this framework:

1. EXAMINE: Thoroughly examine the data or content
2. STRUCTURE: Organize information into meaningful categories
3. IDENTIFY: Find patterns, trends, and anomalies
4. QUANTIFY: Use metrics and measurements where applicable
5. CONTEXTUALIZE: Provide relevant context and background
6. INTERPRET: Explain what the findings mean
7. RECOMMEND: Suggest actionable recommendations
8. VISUALIZE: Create clear presentations of findings

Be objective, thorough, and evidence-based in your analysis.`,
    stopWhen: config.customization?.stopConditions || [
      stepCountAtMost(12),
      hasToolCall('generate_analysis_report'),
      textContains('analysis complete'),
    ],
    prepareStep:
      config.customization?.prepareStep ||
      createAgentControlStrategy({
        phases: [
          {
            startStep: 0,
            endStep: 3,
            temperature: 0.2,
            system: 'Focus on examining and structuring the data systematically.',
          },
          {
            startStep: 4,
            endStep: 8,
            temperature: 0.4,
            system: 'Analyze patterns and provide interpretations.',
          },
          {
            startStep: 9,
            temperature: 0.3,
            system: 'Generate recommendations and create final report.',
          },
        ],
      }),
  };
}

/**
 * Create a planning agent specialized for strategic planning
 */
export function createPlanningAgent(id: string, config: AgentPatternConfig): AgentDefinition {
  return {
    id,
    name: 'Planning Agent',
    description: 'Creates comprehensive strategic plans',
    model: config.model,
    tools: config.tools,
    maxSteps: config.customization?.maxSteps || 18,
    temperature: config.customization?.temperature || 0.5,
    system:
      config.customization?.systemPrompt ||
      `You are a strategic planning expert. Use this planning framework:

1. ASSESS: Analyze current situation and context
2. ENVISION: Define clear goals and desired outcomes
3. STRATEGIZE: Develop high-level strategies
4. STRUCTURE: Break down into actionable steps
5. PRIORITIZE: Order tasks by importance and dependencies
6. RESOURCE: Identify required resources and constraints
7. TIMELINE: Create realistic timelines and milestones
8. RISK: Identify potential risks and mitigation strategies
9. COMMUNICATE: Present the plan clearly and comprehensively

Create plans that are specific, measurable, achievable, relevant, and time-bound.`,
    stopWhen: config.customization?.stopConditions || [
      stepCountAtMost(18),
      hasToolCall('finalize_plan'),
      textContains('plan finalized'),
      hasToolCall('validate_plan'),
    ],
    prepareStep: config.customization?.prepareStep || agentControlPresets.problemSolvingAgent,
  };
}

/**
 * Create a communication agent specialized for content creation and messaging
 */
export function createCommunicationAgent(id: string, config: AgentPatternConfig): AgentDefinition {
  return {
    id,
    name: 'Communication Agent',
    description: 'Creates effective communication and content',
    model: config.model,
    tools: config.tools,
    maxSteps: config.customization?.maxSteps || 10,
    temperature: config.customization?.temperature || 0.7,
    system:
      config.customization?.systemPrompt ||
      `You are a professional communication specialist. Follow these principles:

1. AUDIENCE: Understand your target audience thoroughly
2. PURPOSE: Define clear communication objectives
3. MESSAGE: Craft core messages that resonate
4. STRUCTURE: Organize content logically and engagingly
5. TONE: Use appropriate tone and style for the context
6. CLARITY: Ensure messages are clear and unambiguous
7. PERSUASION: Use appropriate persuasive techniques
8. FEEDBACK: Consider how the audience will respond
9. REFINEMENT: Polish and perfect the communication

Always prioritize clarity, engagement, and audience value.`,
    stopWhen: config.customization?.stopConditions || [
      stepCountAtMost(10),
      hasToolCall('finalize_content'),
      textContains('content complete'),
      hasToolCall('review_communication'),
    ],
    prepareStep:
      config.customization?.prepareStep ||
      createAgentControlStrategy({
        phases: [
          {
            startStep: 0,
            endStep: 2,
            temperature: 0.5,
            system: 'Focus on understanding audience and objectives.',
          },
          {
            startStep: 3,
            endStep: 6,
            temperature: 0.8,
            system: 'Be creative in crafting engaging content.',
          },
          {
            startStep: 7,
            temperature: 0.4,
            system: 'Refine and polish the communication.',
          },
        ],
      }),
  };
}

/**
 * Create a validation agent that checks and verifies work
 */
export function createValidationAgent(id: string, config: AgentPatternConfig): AgentDefinition {
  return {
    id,
    name: 'Validation Agent',
    description: 'Validates and verifies work quality and correctness',
    model: config.model,
    tools: config.tools,
    maxSteps: config.customization?.maxSteps || 8,
    temperature: config.customization?.temperature || 0.2,
    system:
      config.customization?.systemPrompt ||
      `You are a quality assurance and validation expert. Use this validation framework:

1. REQUIREMENTS: Check against original requirements
2. COMPLETENESS: Verify all components are present
3. ACCURACY: Validate factual correctness
4. CONSISTENCY: Check for internal consistency
5. QUALITY: Assess overall quality standards
6. FUNCTIONALITY: Test that everything works as expected
7. COMPLIANCE: Ensure adherence to standards and guidelines
8. RECOMMENDATIONS: Provide improvement suggestions

Be thorough, objective, and constructive in your validation.`,
    stopWhen: config.customization?.stopConditions || [
      stepCountAtMost(8),
      hasToolCall('generate_validation_report'),
      textContains('validation complete'),
    ],
    prepareStep:
      config.customization?.prepareStep ||
      createAgentControlStrategy({
        phases: [
          {
            startStep: 0,
            endStep: 4,
            temperature: 0.1,
            system: 'Be systematic and thorough in checking requirements and accuracy.',
          },
          {
            startStep: 5,
            temperature: 0.3,
            system: 'Provide constructive feedback and recommendations.',
          },
        ],
      }),
  };
}

/**
 * Agent pattern registry for easy access
 */
export const agentPatterns = {
  research: createResearchAgent,
  problemSolving: createProblemSolvingAgent,
  codeGeneration: createCodeGenerationAgent,
  analysis: createAnalysisAgent,
  planning: createPlanningAgent,
  communication: createCommunicationAgent,
  validation: createValidationAgent,
} as const;

/**
 * Agent pattern metadata for discovery and selection
 */
export const agentPatternMetadata = {
  research: {
    name: 'Research Agent',
    description: 'Conducts comprehensive research following structured methodology',
    useCases: [
      'Market research',
      'Academic research',
      'Competitive analysis',
      'Information gathering',
    ],
    requiredTools: ['web_search', 'fetch_content', 'analyze_source'],
    optionalTools: ['generate_summary', 'create_report'],
    complexity: 'medium',
    averageSteps: 12,
  },
  problemSolving: {
    name: 'Problem Solving Agent',
    description: 'Solves complex problems using structured approaches',
    useCases: ['Technical troubleshooting', 'Business problem solving', 'Process optimization'],
    requiredTools: ['analyze_problem', 'generate_solutions'],
    optionalTools: ['validate_solution', 'create_implementation_plan'],
    complexity: 'high',
    averageSteps: 15,
  },
  codeGeneration: {
    name: 'Code Generation Agent',
    description: 'Generates high-quality code following best practices',
    useCases: ['Software development', 'Code refactoring', 'API creation', 'Test generation'],
    requiredTools: ['write_code', 'test_code'],
    optionalTools: ['validate_implementation', 'generate_documentation'],
    complexity: 'high',
    averageSteps: 18,
  },
  analysis: {
    name: 'Analysis Agent',
    description: 'Performs comprehensive analysis of data and content',
    useCases: ['Data analysis', 'Content analysis', 'Performance analysis', 'Trend identification'],
    requiredTools: ['analyze_data', 'generate_insights'],
    optionalTools: ['create_visualizations', 'generate_report'],
    complexity: 'medium',
    averageSteps: 10,
  },
  planning: {
    name: 'Planning Agent',
    description: 'Creates comprehensive strategic plans',
    useCases: ['Project planning', 'Strategic planning', 'Resource planning', 'Timeline creation'],
    requiredTools: ['create_plan', 'prioritize_tasks'],
    optionalTools: ['validate_plan', 'create_timeline'],
    complexity: 'medium',
    averageSteps: 14,
  },
  communication: {
    name: 'Communication Agent',
    description: 'Creates effective communication and content',
    useCases: ['Content creation', 'Marketing copy', 'Documentation', 'Presentations'],
    requiredTools: ['create_content', 'review_content'],
    optionalTools: ['optimize_content', 'generate_variants'],
    complexity: 'low',
    averageSteps: 8,
  },
  validation: {
    name: 'Validation Agent',
    description: 'Validates and verifies work quality and correctness',
    useCases: ['Quality assurance', 'Code review', 'Content review', 'Compliance checking'],
    requiredTools: ['validate_requirements', 'check_quality'],
    optionalTools: ['generate_validation_report', 'suggest_improvements'],
    complexity: 'low',
    averageSteps: 6,
  },
} as const;

/**
 * Get recommended agent pattern for a given use case
 */
export function getRecommendedAgentPattern(useCase: string): keyof typeof agentPatterns | null {
  const normalizedUseCase = useCase.toLowerCase();

  for (const [pattern, metadata] of Object.entries(agentPatternMetadata)) {
    if (metadata.useCases.some(uc => normalizedUseCase.includes(uc.toLowerCase()))) {
      return pattern as keyof typeof agentPatterns;
    }
  }

  return null;
}

/**
 * Create a multi-agent system for complex workflows
 */
export function createMultiAgentSystem(
  id: string,
  patterns: Array<{
    pattern: keyof typeof agentPatterns;
    config: AgentPatternConfig;
    customization?: any;
  }>,
): AgentDefinition[] {
  return patterns.map((p, index) => {
    const agentId = `${id}_${p.pattern}_${index}`;
    return agentPatterns[p.pattern](agentId, {
      ...p.config,
      customization: p.customization,
    });
  });
}
