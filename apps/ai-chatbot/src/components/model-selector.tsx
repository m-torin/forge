'use client';

import { Badge } from '#/components/ui/badge';
import { Button } from '#/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu';
import { Switch } from '#/components/ui/switch';
// Remove server-only provider import from client component
import { isRAGEnabled, shouldUseMockRAG } from '#/lib/mock-data';
import { APPLE_BREAKPOINTS, RESPONSIVE } from '#/lib/ui-constants';
import { useViewportSize } from '@mantine/hooks';
import { Brain, Info, Settings, Sparkles } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

/**
 * Props for the ModelSelector component
 */
interface ModelSelectorProps {
  selectedModel: string;
  onModelSelect: (model: string) => void;
  ragEnabled?: boolean;
  onRAGToggle?: (enabled: boolean) => void;
  ragConfig?: {
    similarityThreshold: number;
    maxResults: number;
    namespace?: string;
  };
  onRAGConfigChange?: (config: any) => void;
}

/**
 * Model selector component with RAG configuration options
 * @param selectedModel - Currently selected model ID
 * @param onModelSelect - Callback when model is selected
 * @param ragEnabled - Whether RAG is enabled
 * @param onRAGToggle - Callback for RAG toggle
 * @param ragConfig - RAG configuration settings
 * @param onRAGConfigChange - Callback for RAG config changes
 */
export function ModelSelector({
  selectedModel,
  onModelSelect,
  ragEnabled = false,
  onRAGToggle,
  ragConfig = { similarityThreshold: 0.7, maxResults: 5 },
  onRAGConfigChange,
}: ModelSelectorProps) {
  const [localRAGEnabled, setLocalRAGEnabled] = useState(ragEnabled);
  const { width: windowWidth } = useViewportSize();
  const isMobile = windowWidth < APPLE_BREAKPOINTS.IPAD_MINI;

  const availableModels = useMemo(() => {
    // Static model list for client-side component
    return [
      { id: 'gpt-4o', name: 'GPT-4o', description: "OpenAI's flagship model", provider: 'OpenAI' },
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        description: 'Fast and efficient model',
        provider: 'OpenAI',
      },
      {
        id: 'grok-2-vision-1212',
        name: 'Grok-2 Vision',
        description: 'xAI vision model',
        provider: 'xAI',
      },
      {
        id: 'grok-3-mini-beta',
        name: 'Grok-3 Mini',
        description: 'xAI compact model',
        provider: 'xAI',
      },
      {
        id: 'claude-3-5-sonnet-20241022',
        name: 'Claude 3.5 Sonnet',
        description: 'Anthropic reasoning model',
        provider: 'Anthropic',
      },
      {
        id: 'claude-3-5-haiku-20241022',
        name: 'Claude 3.5 Haiku',
        description: 'Anthropic fast model',
        provider: 'Anthropic',
      },
    ];
  }, []);

  const currentModel =
    availableModels.find(model => model.id === selectedModel) || availableModels[0];

  // Memoize RAG toggle handler to prevent recreation on every render
  const handleRAGToggle = useCallback(
    (enabled: boolean) => {
      setLocalRAGEnabled(enabled);
      onRAGToggle?.(enabled);
    },
    [onRAGToggle],
  );

  // Memoize RAG status to prevent unnecessary re-computation
  const ragStatus = useMemo(() => {
    if (shouldUseMockRAG()) {
      return { available: true, mode: 'demo' };
    } else if (isRAGEnabled()) {
      return { available: true, mode: 'real' };
    } else {
      return { available: false, mode: 'disabled' };
    }
  }, []);

  // Memoize config change handlers to prevent recreation
  const handleSimilarityThresholdChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onRAGConfigChange?.({
        ...ragConfig,
        similarityThreshold: parseFloat(e.target.value),
      });
    },
    [ragConfig, onRAGConfigChange],
  );

  const handleMaxResultsChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onRAGConfigChange?.({
        ...ragConfig,
        maxResults: parseInt(e.target.value),
      });
    },
    [ragConfig, onRAGConfigChange],
  );

  const handleNamespaceChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onRAGConfigChange?.({
        ...ragConfig,
        namespace: e.target.value || undefined,
      });
    },
    [ragConfig, onRAGConfigChange],
  );

  if (availableModels.length === 0) {
    return (
      <Button variant="outline" size="sm" disabled>
        No models available
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`gap-2 ${RESPONSIVE.TOUCH_TARGET.SMALL} ${isMobile ? 'px-2 text-sm' : ''}`}
        >
          <Sparkles className={isMobile ? 'h-3 w-3' : 'h-4 w-4'} />
          {isMobile
            ? currentModel?.name?.split(' ')[0] || 'Model'
            : currentModel?.name || 'Select Model'}
          {!isMobile && currentModel?.provider && (
            <span className="text-xs text-muted-foreground">({currentModel.provider})</span>
          )}
          {localRAGEnabled && ragStatus.available && (
            <Badge variant="secondary" className={`ml-1 text-xs ${isMobile ? 'px-1' : ''}`}>
              <Brain className={isMobile ? 'h-2 w-2' : 'mr-1 h-3 w-3'} />
              {!isMobile && 'RAG'}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={isMobile ? 'w-72' : 'w-80'}
        side={isMobile ? 'bottom' : 'bottom'}
        sideOffset={isMobile ? 4 : 8}
      >
        {/* Model Selection */}
        <DropdownMenuLabel>Model Selection</DropdownMenuLabel>
        {availableModels.map(model => (
          <DropdownMenuItem
            key={model.id}
            onClick={() => onModelSelect(model.id)}
            className="flex flex-col items-start gap-1 p-3"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium">{model.name}</span>
              <span className="text-xs text-muted-foreground">({model.provider})</span>
            </div>
            <p className="text-xs text-muted-foreground">{model.description}</p>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        {/* RAG Configuration */}
        <DropdownMenuLabel className="flex items-center gap-2">
          <Brain className="h-4 w-4" />
          Knowledge Base (RAG)
        </DropdownMenuLabel>

        <div className="space-y-3 px-2 py-2">
          {/* RAG Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Enable RAG</span>
              {ragStatus.available && (
                <Badge
                  variant={ragStatus.mode === 'demo' ? 'secondary' : 'default'}
                  className="text-xs"
                >
                  {ragStatus.mode === 'demo' ? 'Demo' : 'Real'}
                </Badge>
              )}
            </div>
            <Switch
              checked={localRAGEnabled && ragStatus.available}
              onCheckedChange={handleRAGToggle}
              disabled={!ragStatus.available}
            />
          </div>

          {/* RAG Status */}
          {!ragStatus.available && (
            <div className="flex items-start gap-2 rounded border border-yellow-200 bg-yellow-50 p-2">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-yellow-600" />
              <div className="text-xs text-yellow-700">
                <p className="font-medium">RAG not configured</p>
                <p>Set up Upstash Vector or use demo mode to enable knowledge base features.</p>
              </div>
            </div>
          )}

          {/* RAG Settings (when enabled) */}
          {localRAGEnabled && ragStatus.available && onRAGConfigChange && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>RAG Settings</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-56">
                <div className="space-y-3 p-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      Similarity Threshold: {ragConfig.similarityThreshold}
                    </label>
                    <input
                      type="range"
                      min="0.3"
                      max="1.0"
                      step="0.1"
                      value={ragConfig.similarityThreshold}
                      onChange={handleSimilarityThresholdChange}
                      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      Max Results: {ragConfig.maxResults}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={ragConfig.maxResults}
                      onChange={handleMaxResultsChange}
                      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200"
                    />
                  </div>
                  {ragStatus.mode === 'real' && (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Namespace</label>
                      <input
                        type="text"
                        placeholder="default"
                        value={ragConfig.namespace || ''}
                        onChange={handleNamespaceChange}
                        className="mt-1 w-full rounded border px-2 py-1 text-xs"
                      />
                    </div>
                  )}
                </div>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          )}

          {/* RAG Info */}
          {localRAGEnabled && ragStatus.available && (
            <div className="text-xs text-muted-foreground">
              <p>✓ Knowledge base active</p>
              <p>Responses will include relevant information from your documents.</p>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
