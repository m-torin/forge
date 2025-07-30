'use client';

import { Button } from '#/components/ui/button';
import { Input } from '#/components/ui/input';
import { shouldUseMockRAG } from '#/lib/mock-data';
import { isPrototypeMode } from '#/lib/prototype-mode';
import { useDisclosure } from '@mantine/hooks';
import { logInfo } from '@repo/observability';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle,
  Database,
  Eye,
  EyeOff,
  Info,
  RotateCcw,
  Save,
  Settings,
  Shield,
  Zap,
} from 'lucide-react';
import { useCallback, useState } from 'react';

interface RAGSettingsProps {
  className?: string;
}

export function RAGSettings({ className }: RAGSettingsProps) {
  const prototypeMode = isPrototypeMode();
  const useMockRAG = shouldUseMockRAG();

  // Settings state
  const [settings, setSettings] = useState({
    // Vector Database
    vectorDatabase: {
      enabled: true,
      provider: 'upstash',
      url: process.env.UPSTASH_VECTOR_REST_URL || '',
      token: process.env.UPSTASH_VECTOR_REST_TOKEN || '',
      indexName: 'knowledge-base',
      dimensions: 1536,
    },
    // Retrieval Settings
    retrieval: {
      topK: 5,
      threshold: 0.7,
      reranking: true,
      chunkSize: 500,
      chunkOverlap: 50,
    },
    // Generation Settings
    generation: {
      model: 'gpt-4',
      maxTokens: 2000,
      temperature: 0.1,
      systemPrompt: `You are a helpful AI assistant with access to a knowledge base. Use the provided context to answer questions accurately and cite your sources when possible.

When answering:
1. Use the context provided to give accurate, specific answers
2. If the context doesn't contain enough information, say so clearly
3. Cite specific sources when making claims
4. Maintain a helpful and professional tone`,
    },
    // Quality Controls
    quality: {
      enableFallback: true,
      confidenceThreshold: 0.8,
      maxRetries: 3,
      enableCaching: true,
      cacheTimeout: 300, // 5 minutes
    },
    // Debug Settings
    debug: {
      enabled: false,
      logQueries: false,
      logRetrievals: false,
      logResponses: false,
    },
  });

  const [saved, setSaved] = useState(false);
  const [showAdvanced, { toggle: toggleAdvanced }] = useDisclosure();
  const [showTokens, { toggle: toggleTokens }] = useDisclosure();

  // Handle setting updates
  const updateSetting = useCallback((section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value,
      },
    }));
  }, []);

  // Handle save
  const handleSave = useCallback(() => {
    // In prototype mode, just show confirmation
    if (prototypeMode) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      return;
    }

    // In production, would save to backend
    logInfo('Saving RAG settings', { settings });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [settings, prototypeMode]);

  // Handle reset
  const handleReset = useCallback(() => {
    setSettings({
      vectorDatabase: {
        enabled: true,
        provider: 'upstash',
        url: '',
        token: '',
        indexName: 'knowledge-base',
        dimensions: 1536,
      },
      retrieval: {
        topK: 5,
        threshold: 0.7,
        reranking: true,
        chunkSize: 500,
        chunkOverlap: 50,
      },
      generation: {
        model: 'gpt-4',
        maxTokens: 2000,
        temperature: 0.1,
        systemPrompt: `You are a helpful AI assistant with access to a knowledge base. Use the provided context to answer questions accurately and cite your sources when possible.

When answering:
1. Use the context provided to give accurate, specific answers
2. If the context doesn't contain enough information, say so clearly
3. Cite specific sources when making claims
4. Maintain a helpful and professional tone`,
      },
      quality: {
        enableFallback: true,
        confidenceThreshold: 0.8,
        maxRetries: 3,
        enableCaching: true,
        cacheTimeout: 300,
      },
      debug: {
        enabled: false,
        logQueries: false,
        logRetrievals: false,
        logResponses: false,
      },
    });
  }, []);

  if (!useMockRAG && !prototypeMode) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Settings className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">RAG Settings</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Configure your RAG system to manage settings.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">RAG Configuration</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={toggleAdvanced} variant="outline" size="sm" className="gap-2">
            {showAdvanced ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
          </Button>
          <Button onClick={handleReset} variant="outline" size="sm">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button onClick={handleSave} className="gap-2">
            {saved ? <CheckCircle className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saved ? 'Saved!' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Vector Database Settings */}
      <div className="rounded-lg border bg-background p-4">
        <h3 className="mb-4 flex items-center gap-2 font-medium">
          <Database className="h-4 w-4" />
          Vector Database
        </h3>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.vectorDatabase.enabled}
              onChange={e => updateSetting('vectorDatabase', 'enabled', e.target.checked)}
              className="rounded"
            />
            <label className="text-sm font-medium">Enable RAG</label>
          </div>

          {settings.vectorDatabase.enabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Provider</label>
                  <select
                    value={settings.vectorDatabase.provider}
                    onChange={e => updateSetting('vectorDatabase', 'provider', e.target.value)}
                    className="mt-1 w-full rounded border bg-background p-2 text-sm"
                  >
                    <option value="upstash">Upstash Vector</option>
                    <option value="pinecone">Pinecone</option>
                    <option value="weaviate">Weaviate</option>
                    <option value="qdrant">Qdrant</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Index Name</label>
                  <Input
                    value={settings.vectorDatabase.indexName}
                    onChange={e => updateSetting('vectorDatabase', 'indexName', e.target.value)}
                    className="mt-1"
                    placeholder="knowledge-base"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Database URL</label>
                  <div className="relative mt-1">
                    <Input
                      type={showTokens ? 'text' : 'password'}
                      value={settings.vectorDatabase.url}
                      onChange={e => updateSetting('vectorDatabase', 'url', e.target.value)}
                      placeholder="https://your-vector-db.upstash.io"
                    />
                    <Button
                      onClick={toggleTokens}
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-7 w-7 p-0"
                    >
                      {showTokens ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Access Token</label>
                  <div className="relative mt-1">
                    <Input
                      type={showTokens ? 'text' : 'password'}
                      value={settings.vectorDatabase.token}
                      onChange={e => updateSetting('vectorDatabase', 'token', e.target.value)}
                      placeholder="your-access-token"
                    />
                  </div>
                </div>
              </div>

              {showAdvanced && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Vector Dimensions</label>
                    <Input
                      type="number"
                      value={settings.vectorDatabase.dimensions}
                      onChange={e =>
                        updateSetting(
                          'vectorDatabase',
                          'dimensions',
                          parseInt(e.target.value) || 1536,
                        )
                      }
                      className="mt-1"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Match your embedding model dimensions
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Retrieval Settings */}
      <div className="rounded-lg border bg-background p-4">
        <h3 className="mb-4 flex items-center gap-2 font-medium">
          <Zap className="h-4 w-4" />
          Retrieval Settings
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Top K Results</label>
            <Input
              type="number"
              min="1"
              max="20"
              value={settings.retrieval.topK}
              onChange={e => updateSetting('retrieval', 'topK', parseInt(e.target.value) || 5)}
              className="mt-1"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Number of relevant chunks to retrieve
            </p>
          </div>
          <div>
            <label className="text-sm font-medium">Similarity Threshold</label>
            <Input
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={settings.retrieval.threshold}
              onChange={e =>
                updateSetting('retrieval', 'threshold', parseFloat(e.target.value) || 0.7)
              }
              className="mt-1"
            />
            <p className="mt-1 text-xs text-muted-foreground">Minimum similarity score (0-1)</p>
          </div>
        </div>

        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 space-y-4"
          >
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.retrieval.reranking}
                onChange={e => updateSetting('retrieval', 'reranking', e.target.checked)}
                className="rounded"
              />
              <label className="text-sm font-medium">Enable Reranking</label>
              <Info className="h-3 w-3 text-muted-foreground" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Chunk Size (characters)</label>
                <Input
                  type="number"
                  min="100"
                  max="2000"
                  value={settings.retrieval.chunkSize}
                  onChange={e =>
                    updateSetting('retrieval', 'chunkSize', parseInt(e.target.value) || 500)
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Chunk Overlap (characters)</label>
                <Input
                  type="number"
                  min="0"
                  max="200"
                  value={settings.retrieval.chunkOverlap}
                  onChange={e =>
                    updateSetting('retrieval', 'chunkOverlap', parseInt(e.target.value) || 50)
                  }
                  className="mt-1"
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Generation Settings */}
      <div className="rounded-lg border bg-background p-4">
        <h3 className="mb-4 flex items-center gap-2 font-medium">
          <Zap className="h-4 w-4" />
          Response Generation
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-sm font-medium">AI Model</label>
            <select
              value={settings.generation.model}
              onChange={e => updateSetting('generation', 'model', e.target.value)}
              className="mt-1 w-full rounded border bg-background p-2 text-sm"
            >
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="claude-3-sonnet">Claude 3 Sonnet</option>
              <option value="claude-3-haiku">Claude 3 Haiku</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Max Tokens</label>
            <Input
              type="number"
              min="100"
              max="4000"
              value={settings.generation.maxTokens}
              onChange={e =>
                updateSetting('generation', 'maxTokens', parseInt(e.target.value) || 2000)
              }
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Temperature</label>
            <Input
              type="number"
              min="0"
              max="2"
              step="0.1"
              value={settings.generation.temperature}
              onChange={e =>
                updateSetting('generation', 'temperature', parseFloat(e.target.value) || 0.1)
              }
              className="mt-1"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="text-sm font-medium">System Prompt</label>
          <textarea
            value={settings.generation.systemPrompt}
            onChange={e => updateSetting('generation', 'systemPrompt', e.target.value)}
            className="mt-1 min-h-32 w-full rounded border bg-background p-3 text-sm"
            rows={6}
            placeholder="Enter system prompt for RAG responses..."
          />
        </div>
      </div>

      {/* Quality Controls */}
      {showAdvanced && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border bg-background p-4"
        >
          <h3 className="mb-4 flex items-center gap-2 font-medium">
            <Shield className="h-4 w-4" />
            Quality Controls
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.quality.enableFallback}
                  onChange={e => updateSetting('quality', 'enableFallback', e.target.checked)}
                  className="rounded"
                />
                <label className="text-sm font-medium">Enable Fallback</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.quality.enableCaching}
                  onChange={e => updateSetting('quality', 'enableCaching', e.target.checked)}
                  className="rounded"
                />
                <label className="text-sm font-medium">Enable Caching</label>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium">Confidence Threshold</label>
                <Input
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.quality.confidenceThreshold}
                  onChange={e =>
                    updateSetting(
                      'quality',
                      'confidenceThreshold',
                      parseFloat(e.target.value) || 0.8,
                    )
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Max Retries</label>
                <Input
                  type="number"
                  min="0"
                  max="10"
                  value={settings.quality.maxRetries}
                  onChange={e =>
                    updateSetting('quality', 'maxRetries', parseInt(e.target.value) || 3)
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Cache Timeout (seconds)</label>
                <Input
                  type="number"
                  min="60"
                  max="3600"
                  value={settings.quality.cacheTimeout}
                  onChange={e =>
                    updateSetting('quality', 'cacheTimeout', parseInt(e.target.value) || 300)
                  }
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Debug Settings */}
      {showAdvanced && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border bg-background p-4"
        >
          <h3 className="mb-4 flex items-center gap-2 font-medium">
            <AlertTriangle className="h-4 w-4" />
            Debug & Monitoring
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.debug.enabled}
                onChange={e => updateSetting('debug', 'enabled', e.target.checked)}
                className="rounded"
              />
              <label className="text-sm font-medium">Enable Debug Mode</label>
            </div>

            <AnimatePresence>
              {settings.debug.enabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="ml-6 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.debug.logQueries}
                      onChange={e => updateSetting('debug', 'logQueries', e.target.checked)}
                      className="rounded"
                    />
                    <label className="text-sm">Log user queries</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.debug.logRetrievals}
                      onChange={e => updateSetting('debug', 'logRetrievals', e.target.checked)}
                      className="rounded"
                    />
                    <label className="text-sm">Log chunk retrievals</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.debug.logResponses}
                      onChange={e => updateSetting('debug', 'logResponses', e.target.checked)}
                      className="rounded"
                    />
                    <label className="text-sm">Log generated responses</label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Prototype Mode Indicator */}
      {prototypeMode && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-800 dark:bg-orange-950/20">
          <p className="text-sm text-orange-800 dark:text-orange-200">
            <strong>Prototype Mode:</strong> These settings are for demonstration purposes. In
            production, changes would be persisted to your configuration system.
          </p>
        </div>
      )}
    </div>
  );
}
