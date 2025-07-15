'use client';

import { Button } from '#/components/ui/button';
import { useAnimationSystem } from '#/hooks/ui/use-framer-motion';
import { mockMemoryItems } from '#/lib/mock-data';
import { isPrototypeMode } from '#/lib/prototype-mode';
import { BACKDROP_STYLES, Z_INDEX } from '#/lib/ui-constants';
import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Brain,
  Clock,
  Database,
  Edit3,
  FileText,
  Key,
  Plus,
  Save,
  Search,
  Sparkles,
  Tag,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { useState } from 'react';

interface MemoryItem {
  id: string;
  content: string;
  type: 'fact' | 'preference' | 'context' | 'instruction';
  tags: string[];
  createdAt: string;
  lastUsed: string;
  importance: 'high' | 'medium' | 'low';
}

interface AIMemoryUIProps {
  className?: string;
}

export function AIMemoryUI({ className }: AIMemoryUIProps) {
  const { variants, performance } = useAnimationSystem();
  const [selectedMemory, setSelectedMemory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isAddingMemory, setIsAddingMemory] = useState(false);

  // Use mock data in prototype mode, or load from actual data store
  const prototypeMode = isPrototypeMode();
  const [memories, setMemories] = useState<MemoryItem[]>(prototypeMode ? mockMemoryItems : []);

  const memoryTypes = [
    { id: 'fact', label: 'Facts', icon: FileText, color: 'text-blue-500' },
    { id: 'preference', label: 'Preferences', icon: User, color: 'text-green-500' },
    { id: 'context', label: 'Context', icon: Database, color: 'text-purple-500' },
    { id: 'instruction', label: 'Instructions', icon: Key, color: 'text-orange-500' },
  ];

  return (
    <div className={cx('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">AI Memory</h3>
          {prototypeMode && (
            <span className="rounded-full bg-orange-500/10 px-2 py-1 text-xs text-orange-600">
              INTERACTIVE DEMO
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {prototypeMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const demoMemory = {
                  content: 'User prefers React over Vue.js for new projects',
                  type: 'preference' as const,
                  tags: ['react', 'frontend', 'development'],
                  importance: 'high' as const,
                };
                const fullMemory: MemoryItem = {
                  id: `mem-${Date.now()}`,
                  ...demoMemory,
                  createdAt: new Date().toLocaleDateString(),
                  lastUsed: new Date().toLocaleDateString(),
                };
                setMemories(prev => [fullMemory, ...prev]);
              }}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Quick Add
            </Button>
          )}
          <Button size="sm" onClick={() => setIsAddingMemory(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Memory
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search memories..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border bg-background py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Enhanced Type Filters */}
        <motion.div
          className="flex flex-wrap gap-2"
          variants={variants.staggerContainerFast}
          initial="hidden"
          animate="visible"
        >
          {memoryTypes.map((type, index) => {
            const Icon = type.icon;
            return (
              <motion.button
                key={type.id}
                variants={variants.scaleVariants}
                transition={{ delay: performance.optimizedDuration(index * 0.05) }}
                onClick={() => {
                  performance.batchUpdates([
                    () => setSelectedType(selectedType === type.id ? null : type.id),
                  ]);
                }}
                className={cx(
                  'flex items-center gap-2 rounded-full px-3 py-1.5 text-sm',
                  selectedType === type.id ? 'bg-primary text-primary-foreground' : 'bg-muted',
                )}
                animate={{
                  backgroundColor:
                    selectedType === type.id ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
                  color:
                    selectedType === type.id
                      ? 'hsl(var(--primary-foreground))'
                      : 'hsl(var(--foreground))',
                  transition: { duration: performance.optimizedDuration(0.2) },
                }}
                whileHover={
                  selectedType !== type.id
                    ? {
                        backgroundColor: 'hsl(var(--muted) / 0.8)',
                        scale: 1.05,
                        transition: { duration: performance.optimizedDuration(0.15) },
                      }
                    : { scale: 1.05 }
                }
                whileTap={{ scale: 0.95 }}
                style={{ willChange: 'transform, background-color, color' }}
              >
                <Icon className="h-3 w-3" />
                {type.label}
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      {/* Memory List */}
      <div className="space-y-2">
        {memories.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            {prototypeMode
              ? 'No memory items in demo mode'
              : 'No memory items found. Add one to get started.'}
          </div>
        ) : (
          memories
            .filter(memory => {
              const matchesSearch =
                memory.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                memory.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
              const matchesType = !selectedType || memory.type === selectedType;
              return matchesSearch && matchesType;
            })
            .map(memory => (
              <MemoryCard
                key={memory.id}
                memory={memory}
                isSelected={selectedMemory === memory.id}
                onClick={() => setSelectedMemory(memory.id)}
                onDelete={
                  prototypeMode
                    ? id => {
                        setMemories(prev => prev.filter(m => m.id !== id));
                      }
                    : undefined
                }
              />
            ))
        )}
      </div>

      {/* Add Memory Modal */}
      <AnimatePresence>
        {isAddingMemory && (
          <AddMemoryModal
            onClose={() => setIsAddingMemory(false)}
            onSave={newMemory => {
              const fullMemory: MemoryItem = {
                id: `mem-${Date.now()}`,
                ...newMemory,
                createdAt: new Date().toLocaleDateString(),
                lastUsed: new Date().toLocaleDateString(),
              };
              setMemories(prev => [fullMemory, ...prev]);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Enhanced Memory Card Component
function MemoryCard({
  memory,
  isSelected,
  onClick,
  onDelete,
}: {
  memory: MemoryItem;
  isSelected: boolean;
  onClick: () => void;
  onDelete?: (id: string) => void;
}) {
  const { variants, performance } = useAnimationSystem();
  const typeConfig = {
    fact: { icon: FileText, color: 'text-blue-500' },
    preference: { icon: User, color: 'text-green-500' },
    context: { icon: Database, color: 'text-purple-500' },
    instruction: { icon: Key, color: 'text-orange-500' },
  };

  const config = typeConfig[memory.type];
  const Icon = config.icon;

  return (
    <motion.div
      variants={variants.scaleVariants}
      initial="hidden"
      whileHover={{
        scale: 1.01,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        transition: { duration: performance.optimizedDuration(0.15) },
      }}
      whileTap={{ scale: 0.99 }}
      onClick={() => {
        performance.batchUpdates([() => onClick()]);
      }}
      className={cx('group cursor-pointer rounded-lg border p-4')}
      animate={{
        borderColor: isSelected ? 'hsl(var(--primary))' : 'hsl(var(--border))',
        backgroundColor: isSelected ? 'hsl(var(--primary) / 0.05)' : 'hsl(var(--background))',
        transition: { duration: performance.optimizedDuration(0.2) },
      }}
      style={{ willChange: 'transform, border-color, background-color, box-shadow' }}
    >
      <div className="flex items-start gap-3">
        <motion.div
          className={cx('rounded-lg bg-muted p-2', config.color)}
          whileHover={{
            scale: 1.1,
            rotate: 5,
            transition: { duration: performance.optimizedDuration(0.2) },
          }}
          style={{ willChange: 'transform' }}
        >
          <Icon className="h-4 w-4" />
        </motion.div>

        <div className="flex-1 space-y-2">
          <p className="text-sm font-medium">{memory.content}</p>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {memory.lastUsed}
            </span>
            <span
              className={cx(
                'rounded-full px-2 py-0.5',
                memory.importance === 'high'
                  ? 'bg-red-500/10 text-red-500'
                  : memory.importance === 'medium'
                    ? 'bg-yellow-500/10 text-yellow-500'
                    : 'bg-gray-500/10 text-gray-500',
              )}
            >
              {memory.importance}
            </span>
          </div>

          {memory.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {memory.tags.map(tag => (
                <span
                  key={tag}
                  className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs"
                >
                  <Tag className="h-2.5 w-2.5" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <motion.div
          className="flex items-center gap-1"
          animate={{ opacity: 0 }}
          whileHover={{
            opacity: 1,
            transition: { duration: performance.optimizedDuration(0.15) },
          }}
          style={{ willChange: 'opacity' }}
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{ willChange: 'transform' }}
          >
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={e => {
                e.stopPropagation();
                performance.batchUpdates([
                  () => {
                    // In prototype mode, simulate editing
                    if (isPrototypeMode()) {
                      // Could open edit modal here
                    }
                  },
                ]);
              }}
            >
              <motion.div whileHover={{ rotate: 15 }} style={{ willChange: 'transform' }}>
                <Edit3 className="h-3 w-3" />
              </motion.div>
            </Button>
          </motion.div>
          {onDelete && (
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={{ willChange: 'transform' }}
            >
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-destructive"
                onClick={e => {
                  e.stopPropagation();
                  performance.batchUpdates([() => onDelete(memory.id)]);
                }}
              >
                <motion.div
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  style={{ willChange: 'transform' }}
                >
                  <Trash2 className="h-3 w-3" />
                </motion.div>
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

// Add Memory Modal
function AddMemoryModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave?: (memory: Omit<MemoryItem, 'id' | 'createdAt' | 'lastUsed'>) => void;
}) {
  const { performance } = useAnimationSystem();
  const [content, setContent] = useState('');
  const [selectedType, setSelectedType] = useState<MemoryItem['type']>('fact');
  const [tags, setTags] = useState('');
  const [importance, setImportance] = useState<MemoryItem['importance']>('medium');

  const handleSave = () => {
    if (!content.trim()) return;

    const newMemory = {
      content: content.trim(),
      type: selectedType,
      tags: tags
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean),
      importance,
    };

    onSave?.(newMemory);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-[${Z_INDEX.MODAL_BACKDROP}] flex items-center justify-center p-4 ${BACKDROP_STYLES.HEAVY}`}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="w-full max-w-md space-y-4 rounded-lg border bg-background p-6 shadow-lg"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Add Memory</h3>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
            <X className="h-3 w-3" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Memory Content</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Enter memory content..."
              className="mt-1 w-full resize-none rounded-lg border bg-background p-3 focus:outline-none focus:ring-2 focus:ring-ring"
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Type</label>
            <div className="mt-1 grid grid-cols-2 gap-2">
              {(['fact', 'preference', 'context', 'instruction'] as const).map(type => (
                <motion.button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={cx(
                    'rounded-lg border p-2 text-sm capitalize',
                    selectedType === type ? 'border-primary bg-primary/10' : '',
                  )}
                  animate={{
                    backgroundColor:
                      selectedType === type ? 'hsl(var(--primary) / 0.1)' : 'transparent',
                    borderColor:
                      selectedType === type ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                    transition: { duration: performance.optimizedDuration(0.2) },
                  }}
                  whileHover={{
                    backgroundColor: 'hsl(var(--muted) / 0.5)',
                    scale: 1.02,
                    transition: { duration: performance.optimizedDuration(0.15) },
                  }}
                  whileTap={{ scale: 0.98 }}
                  style={{ willChange: 'transform, background-color, border-color' }}
                >
                  {type}
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Tags</label>
            <input
              type="text"
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="Add tags (comma separated)"
              className="mt-1 w-full rounded-lg border bg-background p-2 focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Importance</label>
            <div className="mt-1 flex gap-2">
              {(['high', 'medium', 'low'] as const).map(level => (
                <motion.button
                  key={level}
                  onClick={() => setImportance(level)}
                  className={cx(
                    'flex-1 rounded-lg border p-2 text-sm capitalize',
                    importance === level ? 'border-primary bg-primary/10' : '',
                  )}
                  animate={{
                    backgroundColor:
                      importance === level ? 'hsl(var(--primary) / 0.1)' : 'transparent',
                    borderColor:
                      importance === level ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                    transition: { duration: performance.optimizedDuration(0.2) },
                  }}
                  whileHover={{
                    backgroundColor: 'hsl(var(--muted) / 0.5)',
                    scale: 1.02,
                    transition: { duration: performance.optimizedDuration(0.15) },
                  }}
                  whileTap={{ scale: 0.98 }}
                  style={{ willChange: 'transform, background-color, border-color' }}
                >
                  {level}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!content.trim()} className="flex-1">
            <Save className="mr-2 h-4 w-4" />
            Save Memory
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Memory Stats Component
export function MemoryStats() {
  const prototypeMode = isPrototypeMode();

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <div className="rounded-lg border bg-muted/30 p-4">
        <div className="mb-2 flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Total Memories</span>
        </div>
        <p className="text-2xl font-bold">{prototypeMode ? mockMemoryItems.length : 142}</p>
      </div>

      <div className="rounded-lg border bg-muted/30 p-4">
        <div className="mb-2 flex items-center gap-2">
          <Clock className="h-4 w-4 text-green-500" />
          <span className="text-sm font-medium">Active Today</span>
        </div>
        <p className="text-2xl font-bold">
          {prototypeMode ? Math.ceil(mockMemoryItems.length * 0.3) : 23}
        </p>
      </div>

      <div className="rounded-lg border bg-muted/30 p-4">
        <div className="mb-2 flex items-center gap-2">
          <Tag className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium">Categories</span>
        </div>
        <p className="text-2xl font-bold">{prototypeMode ? 4 : 8}</p>
      </div>

      <div className="rounded-lg border bg-muted/30 p-4">
        <div className="mb-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-500" />
          <span className="text-sm font-medium">Auto-learned</span>
        </div>
        <p className="text-2xl font-bold">
          {prototypeMode ? Math.ceil(mockMemoryItems.length * 0.6) : 67}
        </p>
      </div>
    </div>
  );
}

// Smart Memory Suggestions Component
export function SmartMemorySuggestions({
  onSuggestionSelect,
}: {
  onSuggestionSelect?: (suggestion: string) => void;
}) {
  const { performance } = useAnimationSystem();
  const prototypeMode = isPrototypeMode();

  const suggestions = [
    'Remember my coding style preference for TypeScript interfaces',
    'Store my favorite debugging techniques for React components',
    'Save my preferred project structure for Next.js apps',
    'Remember my color palette preferences for design projects',
    'Store my preferred meeting times for team collaboration',
  ];

  if (!prototypeMode) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-purple-500" />
        <h4 className="text-sm font-medium">Smart Suggestions</h4>
      </div>

      <div className="space-y-2">
        {suggestions.slice(0, 3).map((suggestion, index) => (
          <motion.button
            key={`suggestion-${suggestion.slice(0, 20)}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: performance.optimizedDuration(index * 0.1) }}
            onClick={() => onSuggestionSelect?.(suggestion)}
            className="w-full rounded-lg border border-dashed border-purple-300 bg-purple-50 p-3 text-left dark:border-purple-700 dark:bg-purple-950/20"
            whileHover={{
              backgroundColor: 'var(--purple-100)',
              scale: 1.01,
              transition: { duration: performance.optimizedDuration(0.15) },
            }}
            whileTap={{ scale: 0.99 }}
            style={
              {
                willChange: 'transform, background-color',
                '--purple-100': '#f3e8ff',
              } as any
            }
          >
            <p className="text-xs text-purple-700 dark:text-purple-300">{suggestion}</p>
          </motion.button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        💡 AI suggests creating these memories based on your conversation patterns
      </p>
    </div>
  );
}

// Memory Relationships Component
export function MemoryRelationships({ memories }: { memories: MemoryItem[] }) {
  const prototypeMode = isPrototypeMode();

  if (!prototypeMode || memories.length < 2) return null;

  // Simple relationship detection based on shared tags
  const relationships = memories
    .slice(0, 3)
    .map(memory => ({
      memory,
      relatedMemories: memories
        .filter(m => m.id !== memory.id)
        .filter(m => m.tags.some(tag => memory.tags.includes(tag)))
        .slice(0, 2),
    }))
    .filter(rel => rel.relatedMemories.length > 0);

  if (relationships.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Database className="h-4 w-4 text-blue-500" />
        <h4 className="text-sm font-medium">Memory Connections</h4>
      </div>

      <div className="space-y-2">
        {relationships.map((rel, _index) => (
          <div
            key={rel.memory.id}
            className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/20"
          >
            <p className="mb-1 text-xs font-medium text-blue-800 dark:text-blue-200">
              &quot;{rel.memory.content.slice(0, 50)}...&quot;
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-300">
              Connected to {rel.relatedMemories.length} other memories via shared tags
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
