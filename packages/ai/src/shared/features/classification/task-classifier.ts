/**
 * Task Classification System for AI Applications
 * Provides task type detection, model optimization, and cost estimation
 */

export type TaskType =
  | 'code-generation'
  | 'creative-writing'
  | 'reasoning'
  | 'quick-qa'
  | 'multimodal'
  | 'research'
  | 'general';

export interface TaskClassification {
  type: TaskType;
  confidence: number;
  reasoning: string;
}

export interface ModelCostInfo {
  costPerInputToken: number;
  costPerOutputToken: number;
  averageCostPer1kTokens: number;
}

export interface ModelOptimizationInfo {
  taskTypes: TaskType[];
  costInfo: ModelCostInfo;
  strengthScore: number; // 1-10 rating for the task
}

// Cost data per model (estimated costs per 1K tokens in USD)
const MODEL_COSTS: Record<string, ModelCostInfo> = {
  claude: {
    costPerInputToken: 0.003 / 1000,
    costPerOutputToken: 0.015 / 1000,
    averageCostPer1kTokens: 0.009,
  },
  'claude-reasoning': {
    costPerInputToken: 0.015 / 1000,
    costPerOutputToken: 0.075 / 1000,
    averageCostPer1kTokens: 0.045,
  },
  'lmstudio-code': {
    costPerInputToken: 0, // Local model
    costPerOutputToken: 0,
    averageCostPer1kTokens: 0,
  },
  'gemini-pro': {
    costPerInputToken: 0.00125 / 1000,
    costPerOutputToken: 0.005 / 1000,
    averageCostPer1kTokens: 0.003,
  },
  'gemini-flash': {
    costPerInputToken: 0.000075 / 1000,
    costPerOutputToken: 0.0003 / 1000,
    averageCostPer1kTokens: 0.0002,
  },
  'perplexity-search': {
    costPerInputToken: 0.002 / 1000,
    costPerOutputToken: 0.002 / 1000,
    averageCostPer1kTokens: 0.002,
  },
  'perplexity-research': {
    costPerInputToken: 0.005 / 1000,
    costPerOutputToken: 0.005 / 1000,
    averageCostPer1kTokens: 0.005,
  },
};

// Model optimization profiles - what each model is best at
const MODEL_OPTIMIZATION: Record<string, ModelOptimizationInfo> = {
  claude: {
    taskTypes: ['general', 'creative-writing', 'reasoning', 'multimodal'],
    costInfo: MODEL_COSTS['claude'],
    strengthScore: 8,
  },
  'claude-reasoning': {
    taskTypes: ['reasoning', 'research', 'code-generation'],
    costInfo: MODEL_COSTS['claude-reasoning'],
    strengthScore: 10,
  },
  'lmstudio-code': {
    taskTypes: ['code-generation', 'general'],
    costInfo: MODEL_COSTS['lmstudio-code'],
    strengthScore: 9,
  },
  'gemini-pro': {
    taskTypes: ['multimodal', 'reasoning', 'research', 'code-generation'],
    costInfo: MODEL_COSTS['gemini-pro'],
    strengthScore: 8,
  },
  'gemini-flash': {
    taskTypes: ['quick-qa', 'general', 'code-generation'],
    costInfo: MODEL_COSTS['gemini-flash'],
    strengthScore: 7,
  },
  'perplexity-search': {
    taskTypes: ['research', 'quick-qa'],
    costInfo: MODEL_COSTS['perplexity-search'],
    strengthScore: 9,
  },
  'perplexity-research': {
    taskTypes: ['research', 'reasoning'],
    costInfo: MODEL_COSTS['perplexity-research'],
    strengthScore: 10,
  },
};

// Task detection patterns using keyword matching and heuristics
const TASK_PATTERNS: Record<
  TaskType,
  {
    keywords: string[];
    patterns: RegExp[];
    description: string;
    emoji: string;
  }
> = {
  'code-generation': {
    keywords: ['code', 'function', 'class', 'implement', 'debug', 'refactor', 'api', 'algorithm'],
    patterns: [
      /```[\s\S]*?```/,
      /\bfunction\s+\w+/,
      /\bclass\s+\w+/,
      /\bimport\s+/,
      /\bfrom\s+['"][^'"]+['"]/,
    ],
    description: 'Code generation and programming',
    emoji: '💻',
  },
  'creative-writing': {
    keywords: ['write', 'story', 'poem', 'creative', 'narrative', 'character', 'plot', 'essay'],
    patterns: [/write\s+(a|an)\s+(story|poem|essay)/, /create\s+(a|an)\s+(character|plot)/],
    description: 'Creative and narrative writing',
    emoji: '✍️',
  },
  reasoning: {
    keywords: [
      'analyze',
      'reason',
      'logic',
      'think',
      'solve',
      'problem',
      'complex',
      'step by step',
    ],
    patterns: [/step\s+by\s+step/, /let's\s+think/, /analyze\s+this/, /what\s+if/],
    description: 'Complex reasoning and analysis',
    emoji: '🧠',
  },
  'quick-qa': {
    keywords: ['what', 'how', 'when', 'where', 'why', 'who', 'define', 'explain', 'quick'],
    patterns: [/^(what|how|when|where|why|who)\s/i, /^(define|explain)\s/i],
    description: 'Quick questions and answers',
    emoji: '❓',
  },
  multimodal: {
    keywords: ['image', 'picture', 'photo', 'visual', 'describe', 'see', 'look', 'analyze image'],
    patterns: [/describe\s+(this|the)\s+(image|picture|photo)/, /what\s+do\s+you\s+see/],
    description: 'Image and multimodal analysis',
    emoji: '👁️',
  },
  research: {
    keywords: ['research', 'study', 'investigate', 'search', 'find', 'sources', 'citations'],
    patterns: [
      /research\s+(about|on)/,
      /find\s+(information|sources)/,
      /what\s+(are|is)\s+the\s+latest/,
    ],
    description: 'Research and information gathering',
    emoji: '🔍',
  },
  general: {
    keywords: ['help', 'assist', 'tell me', 'chat', 'talk'],
    patterns: [/^(help|assist)\s+me/, /tell\s+me\s+(about|more)/],
    description: 'General conversation and assistance',
    emoji: '💬',
  },
};

/**
 * Classify a user prompt into task types
 */
export function classifyTask(prompt: string): TaskClassification {
  const lowercasePrompt = prompt.toLowerCase();
  const scores: Record<TaskType, number> = {
    'code-generation': 0,
    'creative-writing': 0,
    reasoning: 0,
    'quick-qa': 0,
    multimodal: 0,
    research: 0,
    general: 0,
  };

  // Score each task type based on keywords and patterns
  for (const [taskType, { keywords, patterns }] of Object.entries(TASK_PATTERNS)) {
    const task = taskType as TaskType;

    // Keyword matching
    keywords.forEach(keyword => {
      if (lowercasePrompt.includes(keyword)) {
        scores[task] += 1;
      }
    });

    // Pattern matching (higher weight)
    patterns.forEach(pattern => {
      if (pattern.test(lowercasePrompt)) {
        scores[task] += 2;
      }
    });
  }

  // Additional heuristics
  if (prompt.length < 50 && prompt.includes('?')) {
    scores['quick-qa'] += 2;
  }

  if (prompt.includes('```') || /\.(js|ts|py|java|cpp|html|css)/.test(prompt)) {
    scores['code-generation'] += 3;
  }

  if (
    prompt.length > 200 &&
    (lowercasePrompt.includes('analyze') || lowercasePrompt.includes('complex'))
  ) {
    scores['reasoning'] += 2;
  }

  // Find the highest scoring task type
  let maxScore = 0;
  let bestTask: TaskType = 'general';

  for (const [task, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      bestTask = task as TaskType;
    }
  }

  // Calculate confidence (normalize score to 0-1 range)
  const confidence = Math.min(maxScore / 5, 1);

  // If confidence is too low, default to general
  if (confidence < 0.2) {
    bestTask = 'general';
  }

  return {
    type: bestTask,
    confidence,
    reasoning: `Detected ${TASK_PATTERNS[bestTask].description} based on ${maxScore > 0 ? 'keywords/patterns' : 'default classification'}`,
  };
}

/**
 * Get optimal model for a specific task type
 */
export function getOptimalModelForTask(
  taskType: TaskType,
  availableModelIds: string[] = [],
  preferences?: { preferLocal?: boolean; maxCost?: number },
): {
  modelId: string;
  estimatedCost: number;
  reasoning: string;
  alternatives: Array<{ modelId: string; estimatedCost: number; strengthScore: number }>;
} {
  // Filter models that are good for this task type
  const suitableModels = Object.entries(MODEL_OPTIMIZATION)
    .filter(([modelId]) => availableModelIds.length === 0 || availableModelIds.includes(modelId))
    .filter(([, info]) => info.taskTypes.includes(taskType))
    .map(([modelId, info]) => ({
      modelId,
      cost: info.costInfo.averageCostPer1kTokens,
      strength: info.strengthScore,
      info,
    }));

  // If no suitable models found, use all available models
  if (suitableModels.length === 0) {
    const allModels = Object.entries(MODEL_OPTIMIZATION)
      .filter(([modelId]) => availableModelIds.length === 0 || availableModelIds.includes(modelId))
      .map(([modelId, info]) => ({
        modelId,
        cost: info.costInfo.averageCostPer1kTokens,
        strength: info.strengthScore,
        info,
      }));

    suitableModels.push(...allModels);
  }

  // Apply preferences
  let sortedModels = suitableModels;

  if (preferences?.preferLocal) {
    // Prioritize local models (zero cost)
    sortedModels = suitableModels.sort((a, b) => {
      if (a.cost === 0 && b.cost > 0) return -1;
      if (b.cost === 0 && a.cost > 0) return 1;
      return b.strength - a.strength; // Then by strength
    });
  } else if (preferences && preferences.maxCost !== undefined) {
    // Filter by max cost, then sort by strength
    const maxCost = preferences.maxCost;
    sortedModels = suitableModels
      .filter(model => model.cost <= maxCost)
      .sort((a, b) => b.strength - a.strength);
  } else {
    // Default: balance cost and strength (weighted toward strength)
    sortedModels = suitableModels.sort((a, b) => {
      const scoreA = a.strength * 2 - a.cost * 1000; // Strength more important
      const scoreB = b.strength * 2 - b.cost * 1000;
      return scoreB - scoreA;
    });
  }

  const bestModel = sortedModels[0];
  if (!bestModel) {
    return {
      modelId: 'claude',
      estimatedCost: MODEL_COSTS['claude']?.averageCostPer1kTokens || 0.009,
      reasoning: 'Fallback to default model',
      alternatives: [],
    };
  }

  return {
    modelId: bestModel.modelId,
    estimatedCost: bestModel.cost,
    reasoning: `Best for ${TASK_PATTERNS[taskType].description} (strength: ${bestModel.strength}/10, cost: $${bestModel.cost.toFixed(4)}/1k tokens)`,
    alternatives: sortedModels.slice(1, 4).map(model => ({
      modelId: model.modelId,
      estimatedCost: model.cost,
      strengthScore: model.strength,
    })),
  };
}

/**
 * Estimate cost for a prompt with a specific model
 */
export function estimateCost(prompt: string, modelId: string, expectedOutputTokens = 500): number {
  const costInfo = MODEL_COSTS[modelId];
  if (!costInfo) return 0;

  const inputTokens = Math.ceil(prompt.length / 4); // Rough token estimation
  const inputCost = inputTokens * costInfo.costPerInputToken;
  const outputCost = expectedOutputTokens * costInfo.costPerOutputToken;

  return inputCost + outputCost;
}

/**
 * Get task type emoji and description for UI display
 */
export function getTaskTypeInfo(taskType: TaskType): { emoji: string; description: string } {
  return {
    emoji: TASK_PATTERNS[taskType].emoji,
    description: TASK_PATTERNS[taskType].description,
  };
}

/**
 * Get model optimization info for a specific model
 */
export function getModelOptimizationInfo(modelId: string): ModelOptimizationInfo | undefined {
  return MODEL_OPTIMIZATION[modelId];
}
