'use client';

import { Button } from '#/components/ui/button';
import { isPrototypeMode } from '#/lib/prototype-mode';
import { useDisclosure, useListState, useLocalStorage, useTimeout } from '@mantine/hooks';
import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3,
  Brain,
  Check,
  ChevronRight,
  Clock,
  Copy,
  Loader2,
  Sparkles,
  Split,
  Zap,
} from 'lucide-react';
import { useCallback, useState } from 'react';

// Model comparison types
export interface ModelComparison {
  id: string;
  models: string[];
  prompt: string;
  responses: Record<string, ModelResponse>;
  createdAt: string;
  status: 'pending' | 'running' | 'completed' | 'error';
}

interface ModelResponse {
  modelId: string;
  content: string;
  latency: number;
  tokenCount?: number;
  cost?: number;
  status: 'pending' | 'streaming' | 'completed' | 'error';
  error?: string;
  streamStartTime?: number;
  streamEndTime?: number;
}

interface MultiModelComparisonProps {
  onCompare: (prompt: string, models: string[]) => Promise<void>;
  className?: string;
}

export function MultiModelComparison({ onCompare, className }: MultiModelComparisonProps) {
  const prototypeMode = isPrototypeMode();

  // Mock comparison history for prototype mode
  const mockComparisons: ModelComparison[] = [
    {
      id: 'mock-cmp-1',
      models: ['gpt-4-turbo', 'claude-3-opus', 'llama-3-70b'],
      prompt: 'Explain quantum computing in simple terms',
      responses: {
        'gpt-4-turbo': {
          modelId: 'gpt-4-turbo',
          content:
            'Quantum computing is like having a supercomputer that can explore multiple solutions simultaneously. Unlike traditional computers that use bits (0 or 1), quantum computers use quantum bits or "qubits" that can be 0, 1, or both at the same time. This allows them to solve certain complex problems exponentially faster.',
          latency: 1250,
          tokenCount: 85,
          cost: 0.0425,
          status: 'completed',
        },
        'claude-3-opus': {
          modelId: 'claude-3-opus',
          content:
            "Think of quantum computing as nature's way of computing. While classical computers work like a maze solver that tries one path at a time, quantum computers are like having a ghost that can walk through walls and explore all paths simultaneously. They leverage quantum phenomena like superposition and entanglement to process information in fundamentally different ways.",
          latency: 1100,
          tokenCount: 78,
          cost: 0.039,
          status: 'completed',
        },
        'llama-3-70b': {
          modelId: 'llama-3-70b',
          content:
            "Quantum computing harnesses quantum mechanics to process information. Key concepts include: 1) Superposition - qubits can exist in multiple states simultaneously, 2) Entanglement - qubits can be correlated in ways that classical physics doesn't allow, 3) Quantum gates - operations that manipulate qubits. This enables solving certain problems much faster than classical computers.",
          latency: 980,
          tokenCount: 92,
          cost: 0.0184,
          status: 'completed',
        },
      },
      createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      status: 'completed',
    },
    {
      id: 'mock-cmp-2',
      models: ['gpt-4-turbo', 'claude-3-sonnet'],
      prompt: 'Write a Python function to reverse a string',
      responses: {
        'gpt-4-turbo': {
          modelId: 'gpt-4-turbo',
          content:
            'Here\'s a simple Python function to reverse a string:\n\n```python\ndef reverse_string(s):\n    return s[::-1]\n\n# Alternative methods:\ndef reverse_string_loop(s):\n    result = ""\n    for char in s:\n        result = char + result\n    return result\n\ndef reverse_string_builtin(s):\n    return "".join(reversed(s))\n```',
          latency: 850,
          tokenCount: 120,
          cost: 0.06,
          status: 'completed',
        },
        'claude-3-sonnet': {
          modelId: 'claude-3-sonnet',
          content:
            "Here are several ways to reverse a string in Python:\n\n```python\n# Method 1: Slicing (most Pythonic)\ndef reverse_string(text):\n    return text[::-1]\n\n# Method 2: Using reversed() and join()\ndef reverse_string_v2(text):\n    return ''.join(reversed(text))\n\n# Method 3: Recursive approach\ndef reverse_string_recursive(text):\n    if len(text) <= 1:\n        return text\n    return text[-1] + reverse_string_recursive(text[:-1])\n```",
          latency: 920,
          tokenCount: 135,
          cost: 0.0405,
          status: 'completed',
        },
      },
      createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      status: 'completed',
    },
  ];

  const [comparisons, setComparisons] = useLocalStorage<ModelComparison[]>({
    key: 'model-comparisons',
    defaultValue: prototypeMode ? mockComparisons : [],
  });

  const [selectedModels, selectedModelsHandlers] = useListState<string>([]);
  const [isComparing, { open: startComparing, close: stopComparing }] = useDisclosure();
  const [showHistory, { toggle: toggleHistory }] = useDisclosure(false);
  const [prompt, setPrompt] = useState('');

  // Available models for comparison
  const availableModels = [
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', icon: Brain },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', icon: Zap },
    { id: 'claude-3-opus', name: 'Claude 3 Opus', icon: Sparkles },
    { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', icon: Brain },
    { id: 'llama-3-70b', name: 'Llama 3 70B', icon: Zap },
  ];

  // Mock response generation for prototype mode
  const generateMockResponse = useCallback((modelId: string, prompt: string): ModelResponse => {
    type ModelId =
      | 'gpt-4-turbo'
      | 'gpt-3.5-turbo'
      | 'claude-3-opus'
      | 'claude-3-sonnet'
      | 'llama-3-70b';

    const modelCharacteristics: Record<
      ModelId,
      {
        style: string;
        latencyRange: [number, number];
        costMultiplier: number;
        tokenMultiplier: number;
      }
    > = {
      'gpt-4-turbo': {
        style: 'analytical and structured',
        latencyRange: [1200, 1800],
        costMultiplier: 0.5,
        tokenMultiplier: 1.0,
      },
      'gpt-3.5-turbo': {
        style: 'concise and efficient',
        latencyRange: [800, 1200],
        costMultiplier: 0.1,
        tokenMultiplier: 0.8,
      },
      'claude-3-opus': {
        style: 'creative and detailed',
        latencyRange: [1000, 1500],
        costMultiplier: 0.45,
        tokenMultiplier: 1.1,
      },
      'claude-3-sonnet': {
        style: 'balanced and thoughtful',
        latencyRange: [900, 1300],
        costMultiplier: 0.3,
        tokenMultiplier: 0.9,
      },
      'llama-3-70b': {
        style: 'technical and precise',
        latencyRange: [700, 1100],
        costMultiplier: 0.2,
        tokenMultiplier: 0.85,
      },
    };

    const char = modelCharacteristics[modelId as ModelId] || modelCharacteristics['gpt-4-turbo'];
    const baseTokens = 50 + Math.random() * 100;
    const tokens = Math.round(baseTokens * char.tokenMultiplier);
    const latency =
      char.latencyRange[0] + Math.random() * (char.latencyRange[1] - char.latencyRange[0]);

    const responseTemplates: Record<ModelId, string[]> = {
      'gpt-4-turbo': [
        "Here's a comprehensive analysis of your question:",
        'Let me break this down systematically:',
        'To address this properly, consider the following:',
      ],
      'gpt-3.5-turbo': ["Here's a quick overview:", 'Simply put:', 'The key points are:'],
      'claude-3-opus': [
        'This is a fascinating question that touches on several important concepts.',
        'Let me explore this topic with you in detail.',
        "There's a rich landscape of ideas here to consider:",
      ],
      'claude-3-sonnet': [
        "I'd be happy to help you understand this.",
        'This is an important topic worth exploring.',
        'Let me provide a thoughtful response:',
      ],
      'llama-3-70b': [
        'From a technical perspective:',
        'Based on current understanding:',
        'The implementation details involve:',
      ],
    };

    const templates = responseTemplates[modelId as ModelId] || responseTemplates['gpt-4-turbo'];
    const template = templates[Math.floor(Math.random() * templates.length)];

    return {
      modelId,
      content: `${template} [Mock response for "${prompt}" in ${char.style} style. This demonstrates how ${modelId} would typically respond with detailed analysis and examples.]`,
      latency: Math.round(latency),
      tokenCount: tokens,
      cost: (tokens / 1000) * char.costMultiplier,
      status: 'completed',
    };
  }, []);

  // Start comparison
  const startComparison = useCallback(async () => {
    if (selectedModels.length < 2 || !prompt.trim()) return;

    startComparing();

    const comparison: ModelComparison = {
      id: `cmp-${Date.now()}`,
      models: selectedModels,
      prompt,
      responses: {},
      createdAt: new Date().toISOString(),
      status: 'running',
    };

    // Initialize responses
    selectedModels.forEach(modelId => {
      comparison.responses[modelId] = {
        modelId,
        content: '',
        latency: 0,
        status: 'pending',
      };
    });

    setComparisons(prev => [comparison, ...prev]);

    try {
      if (prototypeMode) {
        // Mock comparison with streaming simulation
        for (const modelId of selectedModels) {
          // Update to streaming status
          setComparisons(prev =>
            prev.map(c =>
              c.id === comparison.id
                ? {
                    ...c,
                    responses: {
                      ...c.responses,
                      [modelId]: { ...c.responses[modelId], status: 'streaming' },
                    },
                  }
                : c,
            ),
          );

          // Simulate network delay for each model
          const delay = 1000 + Math.random() * 2000; // 1-3 seconds
          await new Promise(resolve => setTimeout(resolve, delay));

          // Generate mock response
          const mockResponse = generateMockResponse(modelId, prompt);

          // Update with completed response
          setComparisons(prev =>
            prev.map(c =>
              c.id === comparison.id
                ? {
                    ...c,
                    responses: { ...c.responses, [modelId]: mockResponse },
                  }
                : c,
            ),
          );
        }

        // Mark comparison as completed
        setComparisons(prev =>
          prev.map(c => (c.id === comparison.id ? { ...c, status: 'completed' } : c)),
        );
      } else {
        await onCompare(prompt, selectedModels);

        // Update comparison status
        setComparisons(prev =>
          prev.map(c => (c.id === comparison.id ? { ...c, status: 'completed' } : c)),
        );
      }
    } catch (_error) {
      setComparisons(prev =>
        prev.map(c => (c.id === comparison.id ? { ...c, status: 'error' } : c)),
      );
    } finally {
      stopComparing();
    }
  }, [
    selectedModels,
    prompt,
    onCompare,
    setComparisons,
    prototypeMode,
    generateMockResponse,
    startComparing,
    stopComparing,
  ]);

  // Toggle model selection using useListState
  const toggleModel = (modelId: string) => {
    if (selectedModels.includes(modelId)) {
      selectedModelsHandlers.filter(id => id !== modelId);
    } else {
      selectedModelsHandlers.append(modelId);
    }
  };

  return (
    <div className={cx('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Split className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Multi-Model Comparison</h3>
          {prototypeMode && (
            <span className="rounded-full bg-orange-500/10 px-2 py-1 text-xs text-orange-600">
              PROTOTYPE
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {prototypeMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPrompt('Explain the differences between React and Vue.js')}
            >
              Sample Prompt
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={toggleHistory}>
            <Clock className="mr-2 h-4 w-4" />
            History
          </Button>
        </div>
      </div>

      {/* Model Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Select Models to Compare</label>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {availableModels.map(model => {
            const Icon = model.icon;
            const isSelected = selectedModels.includes(model.id);

            return (
              <button
                key={model.id}
                onClick={() => toggleModel(model.id)}
                disabled={isComparing}
                className={cx(
                  'flex items-center gap-2 rounded-lg border p-3 transition-all',
                  isSelected
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:bg-muted/50',
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{model.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Prompt Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Prompt</label>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Enter your prompt to compare model responses..."
          className="min-h-[100px] w-full resize-none rounded-lg border bg-background p-3 focus:outline-none focus:ring-2 focus:ring-ring"
          disabled={isComparing}
        />
      </div>

      {/* Compare Button */}
      <Button
        onClick={startComparison}
        disabled={selectedModels.length < 2 || !prompt.trim() || isComparing}
        className="w-full"
      >
        {isComparing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Comparing...
          </>
        ) : (
          <>
            <BarChart3 className="mr-2 h-4 w-4" />
            Compare Models ({selectedModels.length} selected)
          </>
        )}
      </Button>

      {/* Active Comparison */}
      {comparisons.length > 0 && comparisons[0].status === 'running' && (
        <ComparisonView comparison={comparisons[0]} />
      )}

      {/* History */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <h4 className="text-sm font-medium">Previous Comparisons</h4>
            {comparisons.slice(1).map(comparison => (
              <ComparisonView key={comparison.id} comparison={comparison} isCompact />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Comparison view component
interface ComparisonViewProps {
  comparison: ModelComparison;
  isCompact?: boolean;
}

function ComparisonView({ comparison, isCompact = false }: ComparisonViewProps) {
  const [expandedModel, setExpandedModel] = useState<string | null>(null);
  const [copiedModel, setCopiedModel] = useState<string | null>(null);

  const { start: startCopyReset } = useTimeout(() => setCopiedModel(null), 2000);

  const handleCopy = async (modelId: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedModel(modelId);
    startCopyReset();
  };

  if (isCompact) {
    return (
      <div className="rounded-lg border bg-muted/30 p-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="truncate text-sm font-medium">{comparison.prompt}</p>
          <span className="text-xs text-muted-foreground">
            {new Date(comparison.createdAt).toLocaleTimeString()}
          </span>
        </div>
        <div className="flex gap-2">
          {comparison.models.map(modelId => {
            const response = comparison.responses[modelId];
            return (
              <div
                key={modelId}
                className={cx(
                  'flex-1 rounded px-2 py-1 text-xs',
                  response.status === 'completed'
                    ? 'bg-green-500/10 text-green-600'
                    : response.status === 'error'
                      ? 'bg-red-500/10 text-red-600'
                      : 'bg-muted text-muted-foreground',
                )}
              >
                {modelId}: {response.latency}ms
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border p-4">
      {/* Prompt */}
      <div className="border-b pb-3">
        <h4 className="mb-1 font-medium">Prompt</h4>
        <p className="text-sm text-muted-foreground">{comparison.prompt}</p>
      </div>

      {/* Model Responses */}
      <div className="grid gap-3 md:grid-cols-2">
        {comparison.models.map(modelId => {
          const response = comparison.responses[modelId];
          const model = availableModels.find(m => m.id === modelId);
          const Icon = model?.icon || Brain;

          return (
            <motion.div
              key={modelId}
              layout
              className={cx(
                'overflow-hidden rounded-lg border',
                expandedModel === modelId && 'md:col-span-2',
              )}
            >
              {/* Model Header */}
              <div className="flex items-center justify-between bg-muted/50 p-3">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{model?.name || modelId}</span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Metrics */}
                  {response.status === 'completed' && (
                    <>
                      <span className="text-xs text-muted-foreground">{response.latency}ms</span>
                      {response.tokenCount && (
                        <span className="text-xs text-muted-foreground">
                          {response.tokenCount} tokens
                        </span>
                      )}
                      {response.cost && (
                        <span className="text-xs text-muted-foreground">
                          ${response.cost.toFixed(4)}
                        </span>
                      )}
                    </>
                  )}

                  {/* Actions */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(modelId, response.content)}
                    className="h-7 w-7 p-0"
                  >
                    {copiedModel === modelId ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedModel(expandedModel === modelId ? null : modelId)}
                    className="h-7 w-7 p-0"
                  >
                    <ChevronRight
                      className={cx(
                        'h-3 w-3 transition-transform',
                        expandedModel === modelId && 'rotate-90',
                      )}
                    />
                  </Button>
                </div>
              </div>

              {/* Model Response */}
              <div className="p-3">
                {response.status === 'streaming' && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Streaming response...
                  </div>
                )}

                {response.status === 'error' && (
                  <div className="text-sm text-red-500">
                    Error: {response.error || 'Unknown error'}
                  </div>
                )}

                {response.content && (
                  <div
                    className={cx(
                      'prose prose-sm max-w-none dark:prose-invert',
                      !expandedModel && 'line-clamp-6',
                    )}
                  >
                    {response.content}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Comparison Metrics */}
      {comparison.status === 'completed' && <ComparisonMetrics responses={comparison.responses} />}
    </div>
  );
}

// Comparison metrics visualization
function ComparisonMetrics({ responses }: { responses: Record<string, ModelResponse> }) {
  const metrics = Object.entries(responses).map(([modelId, response]) => ({
    modelId,
    latency: response.latency,
    tokenCount: response.tokenCount || 0,
    cost: response.cost || 0,
  }));

  const maxLatency = Math.max(...metrics.map(m => m.latency));
  const maxTokens = Math.max(...metrics.map(m => m.tokenCount));

  return (
    <div className="space-y-3 border-t pt-3">
      <h5 className="text-sm font-medium">Performance Comparison</h5>

      {/* Latency Comparison */}
      <div className="space-y-2">
        <span className="text-xs text-muted-foreground">Response Time</span>
        {metrics.map(metric => (
          <div key={metric.modelId} className="flex items-center gap-2">
            <span className="w-24 truncate text-xs">{metric.modelId}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(metric.latency / maxLatency) * 100}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-primary"
              />
            </div>
            <span className="w-12 text-right text-xs text-muted-foreground">
              {metric.latency}ms
            </span>
          </div>
        ))}
      </div>

      {/* Token Usage */}
      {maxTokens > 0 && (
        <div className="space-y-2">
          <span className="text-xs text-muted-foreground">Token Usage</span>
          {metrics.map(metric => (
            <div key={metric.modelId} className="flex items-center gap-2">
              <span className="w-24 truncate text-xs">{metric.modelId}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(metric.tokenCount / maxTokens) * 100}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-blue-500"
                />
              </div>
              <span className="w-12 text-right text-xs text-muted-foreground">
                {metric.tokenCount}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Global model list for reference
const availableModels = [
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', icon: Brain },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', icon: Zap },
  { id: 'claude-3-opus', name: 'Claude 3 Opus', icon: Sparkles },
  { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', icon: Brain },
  { id: 'llama-3-70b', name: 'Llama 3 70B', icon: Zap },
];
