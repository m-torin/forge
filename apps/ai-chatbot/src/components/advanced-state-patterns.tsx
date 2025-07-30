'use client';

/**
 * Advanced State Patterns with Mantine Hooks
 *
 * Demonstrates the use of advanced Mantine hooks for complex state management:
 * - useStateHistory for undo/redo functionality
 * - useMap for key-value state management
 * - useSet for unique collections
 * - useSelection for multi-item selection
 * - useMutationObserver for DOM change detection
 */

import { useAnimationSystem } from '#/hooks/ui/use-framer-motion';
import {
  useCounter,
  useDebouncedValue,
  useListState,
  useLocalStorage,
  useMap,
  useMutationObserver,
  useSet,
  useStateHistory,
  useToggle,
} from '@mantine/hooks';
import { generateId } from 'ai';
import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckSquare,
  Eye,
  Hash,
  History,
  List,
  Minus,
  Plus,
  Redo2,
  Square,
  Trash2,
  Undo2,
} from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

// Enhanced Message History with Undo/Redo
export function MessageHistoryManager() {
  const { variants, performance } = useAnimationSystem();
  const [history, { back, forward, set, reset }] = useStateHistory([
    'Welcome! How can I help you today?',
  ]);
  const [input, setInput] = useState('');
  const [debouncedInput] = useDebouncedValue(input, 300);

  const addMessage = useCallback(() => {
    if (debouncedInput.trim()) {
      set([...history, debouncedInput.trim()]);
      setInput('');
    }
  }, [debouncedInput, history, set]);

  return (
    <div className="space-y-4 rounded-lg border border-border p-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <History size={20} />
          Message History with Undo/Redo
        </h3>
        <motion.div
          className="flex gap-2"
          variants={variants.staggerContainerFast}
          initial="hidden"
          animate="visible"
        >
          <motion.button
            variants={variants.scaleVariants}
            onClick={() => {
              performance.batchUpdates([() => back()]);
            }}
            className="rounded-md p-2 text-foreground"
            whileHover={{
              backgroundColor: 'var(--muted)',
              scale: 1.05,
              transition: { duration: performance.optimizedDuration(0.15) },
            }}
            whileTap={{ scale: 0.95 }}
            style={{ willChange: 'transform, background-color' }}
          >
            <motion.div
              animate={{ rotate: 0 }}
              whileHover={{ rotate: -10 }}
              style={{ willChange: 'transform' }}
            >
              <Undo2 size={16} />
            </motion.div>
          </motion.button>
          <motion.button
            variants={variants.scaleVariants}
            onClick={() => {
              performance.batchUpdates([() => forward()]);
            }}
            className="rounded-md p-2 text-foreground"
            whileHover={{
              backgroundColor: 'var(--muted)',
              scale: 1.05,
              transition: { duration: performance.optimizedDuration(0.15) },
            }}
            whileTap={{ scale: 0.95 }}
            style={{ willChange: 'transform, background-color' }}
          >
            <motion.div
              animate={{ rotate: 0 }}
              whileHover={{ rotate: 10 }}
              style={{ willChange: 'transform' }}
            >
              <Redo2 size={16} />
            </motion.div>
          </motion.button>
          <motion.button
            variants={variants.scaleVariants}
            onClick={() => {
              performance.batchUpdates([() => reset()]);
            }}
            className="rounded-md p-2 text-foreground"
            whileHover={{
              backgroundColor: 'var(--destructive)',
              color: 'var(--destructive-foreground)',
              scale: 1.05,
              transition: { duration: performance.optimizedDuration(0.15) },
            }}
            whileTap={{ scale: 0.95 }}
            style={{ willChange: 'transform, background-color, color' }}
          >
            <motion.div
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              style={{ willChange: 'transform' }}
            >
              <Trash2 size={16} />
            </motion.div>
          </motion.button>
        </motion.div>
      </div>

      <div className="max-h-40 space-y-2 overflow-y-auto">
        <AnimatePresence>
          {history.map((message: string) => {
            const messageId = generateId();
            return (
              <motion.div
                key={`message-${messageId}`}
                variants={variants.slideRightVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="rounded-md bg-muted/50 p-2 text-sm"
                style={{ willChange: 'transform, opacity' }}
              >
                {message}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-md border border-border px-3 py-2"
          onKeyDown={e => e.key === 'Enter' && addMessage()}
        />
        <motion.button
          onClick={() => {
            performance.batchUpdates([() => addMessage()]);
          }}
          disabled={!debouncedInput.trim()}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
          animate={{ opacity: debouncedInput.trim() ? 1 : 0.5 }}
          whileHover={
            debouncedInput.trim()
              ? {
                  scale: 1.05,
                  transition: { duration: performance.optimizedDuration(0.15) },
                }
              : {}
          }
          whileTap={debouncedInput.trim() ? { scale: 0.95 } : {}}
          style={{ willChange: 'transform, opacity' }}
        >
          <motion.div
            animate={{ rotate: 0 }}
            whileHover={{ rotate: 90 }}
            style={{ willChange: 'transform' }}
          >
            <Plus size={16} />
          </motion.div>
        </motion.button>
      </div>
    </div>
  );
}

// Advanced Tag Manager with useMap and useSet
export function AdvancedTagManager() {
  const { variants, performance } = useAnimationSystem();
  const tagCategories = useMap([
    ['important', new Set(['urgent', 'high-priority'])],
    ['topics', new Set(['react', 'javascript', 'typescript'])],
    ['status', new Set(['completed', 'in-progress', 'pending'])],
  ]);

  const selectedTags = useSet<string>();
  const [newCategory, setNewCategory] = useState('');
  const [newTag, setNewTag] = useState('');

  const addNewCategory = useCallback(() => {
    if (newCategory.trim()) {
      tagCategories.set(newCategory.trim(), new Set<string>());
      setNewCategory('');
    }
  }, [newCategory, tagCategories]);

  const addTagToCategory = useCallback(
    (category: string) => {
      if (newTag.trim()) {
        const currentTags = tagCategories.get(category) || new Set();
        currentTags.add(newTag.trim());
        tagCategories.set(category, currentTags);
        setNewTag('');
      }
    },
    [newTag, tagCategories],
  );

  const removeTagFromCategory = useCallback(
    (category: string, tag: string) => {
      const currentTags = tagCategories.get(category);
      if (currentTags) {
        currentTags.delete(tag);
        tagCategories.set(category, currentTags);
      }
    },
    [tagCategories],
  );

  return (
    <div className="space-y-4 rounded-lg border border-border p-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <Hash size={20} />
          Advanced Tag Manager
        </h3>
        <div className="text-sm text-muted-foreground">Selected: {selectedTags.size} tags</div>
      </div>

      {/* Add new category */}
      <div className="flex gap-2">
        <input
          value={newCategory}
          onChange={e => setNewCategory(e.target.value)}
          placeholder="New category name..."
          className="flex-1 rounded-md border border-border px-3 py-2 text-sm"
        />
        <motion.button
          onClick={() => {
            performance.batchUpdates([() => addNewCategory()]);
          }}
          disabled={!newCategory.trim()}
          className="rounded-md bg-secondary px-3 py-2 text-sm text-secondary-foreground"
          animate={{ opacity: newCategory.trim() ? 1 : 0.5 }}
          whileHover={
            newCategory.trim()
              ? {
                  scale: 1.02,
                  transition: { duration: performance.optimizedDuration(0.15) },
                }
              : {}
          }
          whileTap={newCategory.trim() ? { scale: 0.98 } : {}}
          style={{ willChange: 'transform, opacity' }}
        >
          Add Category
        </motion.button>
      </div>

      {/* Tag categories */}
      <div className="space-y-3">
        {Array.from(tagCategories.entries()).map(([category, tags]) => (
          <div key={category} className="rounded-md border border-border p-3">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-sm font-medium capitalize">{category}</h4>
              <motion.button
                onClick={() => {
                  performance.batchUpdates([() => tagCategories.delete(category)]);
                }}
                className="p-1 text-red-500"
                whileHover={{
                  color: 'var(--red-700)',
                  scale: 1.1,
                  transition: { duration: performance.optimizedDuration(0.15) },
                }}
                whileTap={{ scale: 0.9 }}
                style={{ willChange: 'transform, color' }}
              >
                <motion.div
                  animate={{ rotate: 0 }}
                  whileHover={{ rotate: 90 }}
                  style={{ willChange: 'transform' }}
                >
                  <Minus size={14} />
                </motion.div>
              </motion.button>
            </div>

            <div className="mb-2 flex flex-wrap gap-2">
              {Array.from(tags).map(tag => (
                <motion.button
                  key={tag}
                  variants={variants.bounceScaleVariants}
                  initial="hidden"
                  animate="visible"
                  onClick={() => {
                    performance.batchUpdates([
                      () =>
                        selectedTags.has(tag) ? selectedTags.delete(tag) : selectedTags.add(tag),
                    ]);
                  }}
                  className={cx(
                    'flex items-center gap-1 rounded-full px-2 py-1 text-xs',
                    selectedTags.has(tag)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground',
                  )}
                  whileHover={{
                    backgroundColor: selectedTags.has(tag)
                      ? 'var(--primary-hover)'
                      : 'var(--muted-hover)',
                    scale: 1.05,
                    transition: { duration: performance.optimizedDuration(0.15) },
                  }}
                  whileTap={{ scale: 0.95 }}
                  style={{ willChange: 'transform, background-color' }}
                >
                  {selectedTags.has(tag) ? <CheckSquare size={12} /> : <Square size={12} />}
                  {tag}
                  <motion.button
                    onClick={e => {
                      e.stopPropagation();
                      performance.batchUpdates([() => removeTagFromCategory(category, tag)]);
                    }}
                    className="ml-1"
                    whileHover={{
                      color: 'var(--red-500)',
                      scale: 1.2,
                      transition: { duration: performance.optimizedDuration(0.15) },
                    }}
                    whileTap={{ scale: 0.8 }}
                    style={{ willChange: 'transform, color' }}
                  >
                    ×
                  </motion.button>
                </motion.button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                placeholder={`Add tag to ${category}...`}
                className="flex-1 rounded border border-border px-2 py-1 text-xs"
                onKeyDown={e => e.key === 'Enter' && addTagToCategory(category)}
              />
              <motion.button
                onClick={() => {
                  performance.batchUpdates([() => addTagToCategory(category)]);
                }}
                disabled={!newTag.trim()}
                className="rounded bg-primary px-2 py-1 text-xs text-primary-foreground"
                animate={{ opacity: newTag.trim() ? 1 : 0.5 }}
                whileHover={
                  newTag.trim()
                    ? {
                        scale: 1.05,
                        transition: { duration: performance.optimizedDuration(0.15) },
                      }
                    : {}
                }
                whileTap={newTag.trim() ? { scale: 0.95 } : {}}
                style={{ willChange: 'transform, opacity' }}
              >
                <motion.div
                  animate={{ rotate: 0 }}
                  whileHover={{ rotate: 90 }}
                  style={{ willChange: 'transform' }}
                >
                  <Plus size={12} />
                </motion.div>
              </motion.button>
            </div>
          </div>
        ))}
      </div>

      {/* Selected tags summary */}
      {selectedTags.size > 0 && (
        <div className="rounded-md bg-primary/10 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">Selected Tags:</span>
            <button
              onClick={() => selectedTags.clear()}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            {Array.from(selectedTags).map(tag => (
              <span
                key={tag}
                className="rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground"
              >
                {tag as string}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Smart List Manager with useListState and useSelection
export function SmartListManager() {
  const { variants, performance } = useAnimationSystem();
  const [items, handlers] = useListState([
    { id: '1', text: 'Learn Mantine hooks', completed: false },
    { id: '2', text: 'Build awesome UI', completed: true },
    { id: '3', text: 'Optimize performance', completed: false },
  ]);

  const [selection, setSelection] = useState<string[]>([]);

  const toggleSelection = useCallback((id: string) => {
    setSelection(prev => (prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]));
  }, []);

  const clearSelection = useCallback(() => {
    setSelection([]);
  }, []);

  const selectAll = useCallback(() => {
    setSelection(items.map(item => item.id));
  }, [items]);

  const [newItem, setNewItem] = useState('');
  const [counter, { increment, decrement: _decrement, reset: resetCounter }] = useCounter(0);
  const [showCompleted, toggleShowCompleted] = useToggle([true, false]);

  // Local storage for persistence
  const [_savedLists, _setSavedLists] = useLocalStorage<any[]>({
    key: 'smart-lists',
    defaultValue: [],
  });

  const addItem = useCallback(() => {
    if (newItem.trim()) {
      handlers.append({
        id: Date.now().toString(),
        text: newItem.trim(),
        completed: false,
      });
      setNewItem('');
      increment();
    }
  }, [newItem, handlers, increment]);

  const toggleItem = useCallback(
    (id: string) => {
      const index = items.findIndex(item => item.id === id);
      if (index !== -1) {
        handlers.setItem(index, {
          ...items[index],
          completed: !items[index].completed,
        });
      }
    },
    [items, handlers],
  );

  const removeSelected = useCallback(() => {
    const remainingItems = items.filter(item => !selection.includes(item.id));
    handlers.setState(remainingItems);
    clearSelection();
  }, [items, selection, handlers, clearSelection]);

  const filteredItems = showCompleted ? items : items.filter(item => !item.completed);

  return (
    <div className="space-y-4 rounded-lg border border-border p-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <List size={20} />
          Smart List Manager
        </h3>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">Items added: {counter}</div>
          <button
            onClick={resetCounter}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Reset Counter
          </button>
        </div>
      </div>

      {/* Add new item */}
      <div className="flex gap-2">
        <input
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          placeholder="Add new item..."
          className="flex-1 rounded-md border border-border px-3 py-2"
          onKeyDown={e => e.key === 'Enter' && addItem()}
        />
        <motion.button
          onClick={() => {
            performance.batchUpdates([() => addItem()]);
          }}
          disabled={!newItem.trim()}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
          animate={{ opacity: newItem.trim() ? 1 : 0.5 }}
          whileHover={
            newItem.trim()
              ? {
                  scale: 1.02,
                  transition: { duration: performance.optimizedDuration(0.15) },
                }
              : {}
          }
          whileTap={newItem.trim() ? { scale: 0.98 } : {}}
          style={{ willChange: 'transform, opacity' }}
        >
          Add
        </motion.button>
      </div>

      {/* Selection controls */}
      <div className="flex items-center justify-between border-y border-border py-2">
        <motion.div
          className="flex items-center gap-4"
          variants={variants.staggerContainerFast}
          initial="hidden"
          animate="visible"
        >
          <motion.button
            variants={variants.slideRightVariants}
            onClick={() => {
              performance.batchUpdates([() => selectAll()]);
            }}
            className="text-sm text-muted-foreground"
            whileHover={{
              color: 'var(--foreground)',
              scale: 1.05,
              transition: { duration: performance.optimizedDuration(0.15) },
            }}
            style={{ willChange: 'transform, color' }}
          >
            Select All
          </motion.button>
          <motion.button
            variants={variants.slideRightVariants}
            onClick={() => {
              performance.batchUpdates([() => clearSelection()]);
            }}
            className="text-sm text-muted-foreground"
            whileHover={{
              color: 'var(--foreground)',
              scale: 1.05,
              transition: { duration: performance.optimizedDuration(0.15) },
            }}
            style={{ willChange: 'transform, color' }}
          >
            Clear Selection
          </motion.button>
          <motion.button
            variants={variants.slideRightVariants}
            onClick={() => {
              performance.batchUpdates([() => toggleShowCompleted()]);
            }}
            className="text-sm text-muted-foreground"
            whileHover={{
              color: 'var(--foreground)',
              scale: 1.05,
              transition: { duration: performance.optimizedDuration(0.15) },
            }}
            style={{ willChange: 'transform, color' }}
          >
            {showCompleted ? 'Hide' : 'Show'} Completed
          </motion.button>
        </motion.div>

        <AnimatePresence>
          {selection.length > 0 && (
            <motion.button
              variants={variants.bounceScaleVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => {
                performance.batchUpdates([() => removeSelected()]);
              }}
              className="rounded-md bg-red-500 px-3 py-1 text-sm text-white"
              whileHover={{
                backgroundColor: 'var(--red-600)',
                scale: 1.05,
                transition: { duration: performance.optimizedDuration(0.15) },
              }}
              whileTap={{ scale: 0.95 }}
              style={{ willChange: 'transform, background-color' }}
            >
              <motion.span
                key={selection.length}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: performance.optimizedDuration(0.3) }}
              >
                Remove Selected ({selection.length})
              </motion.span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Items list */}
      <div className="max-h-60 space-y-2 overflow-y-auto">
        <AnimatePresence>
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              variants={variants.slideUpVariants}
              initial="hidden"
              exit={{
                opacity: 0,
                x: -100,
                transition: { duration: performance.optimizedDuration(0.2) },
              }}
              className={cx(
                'flex items-center gap-3 rounded-md border border-border p-3',
                selection.includes(item.id) && 'border-primary bg-primary/10',
                item.completed && 'opacity-60',
              )}
              animate={{
                borderColor: selection.includes(item.id) ? 'var(--primary)' : 'var(--border)',
                backgroundColor: selection.includes(item.id) ? 'var(--primary-bg)' : 'transparent',
                opacity: item.completed ? 0.6 : 1,
                transition: { duration: performance.optimizedDuration(0.2) },
              }}
              style={
                {
                  willChange: 'transform, opacity, border-color, background-color',
                  '--primary': 'hsl(var(--primary))',
                  '--border': 'hsl(var(--border))',
                  '--primary-bg': 'hsl(var(--primary) / 0.1)',
                } as any
              }
            >
              <motion.button
                onClick={() => {
                  performance.batchUpdates([() => toggleSelection(item.id)]);
                }}
                className="text-muted-foreground"
                whileHover={{
                  color: 'var(--foreground)',
                  scale: 1.1,
                  transition: { duration: performance.optimizedDuration(0.15) },
                }}
                whileTap={{ scale: 0.9 }}
                style={{ willChange: 'transform, color' }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selection.includes(item.id) ? 'checked' : 'unchecked'}
                    variants={variants.bounceScaleVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {selection.includes(item.id) ? <CheckSquare size={16} /> : <Square size={16} />}
                  </motion.div>
                </AnimatePresence>
              </motion.button>

              <motion.button
                onClick={() => {
                  performance.batchUpdates([() => toggleItem(item.id)]);
                }}
                className={cx('flex-1 text-left', item.completed && 'line-through')}
                animate={{
                  textDecoration: item.completed ? 'line-through' : 'none',
                  opacity: item.completed ? 0.7 : 1,
                  transition: { duration: performance.optimizedDuration(0.2) },
                }}
                whileHover={{
                  scale: 1.01,
                  transition: { duration: performance.optimizedDuration(0.15) },
                }}
                style={{ willChange: 'transform, text-decoration, opacity' }}
              >
                {item.text}
              </motion.button>

              <motion.button
                onClick={() => {
                  performance.batchUpdates([() => handlers.remove(index)]);
                }}
                className="p-1 text-red-500"
                whileHover={{
                  color: 'var(--red-700)',
                  scale: 1.1,
                  transition: { duration: performance.optimizedDuration(0.15) },
                }}
                whileTap={{ scale: 0.9 }}
                style={{ willChange: 'transform, color' }}
              >
                <motion.div
                  animate={{ rotate: 0 }}
                  whileHover={{ rotate: 90 }}
                  style={{ willChange: 'transform' }}
                >
                  <Trash2 size={14} />
                </motion.div>
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredItems.length === 0 && (
        <div className="py-8 text-center text-muted-foreground">
          {items.length === 0 ? 'No items yet' : 'No items match current filter'}
        </div>
      )}
    </div>
  );
}

// DOM Mutation Observer Example
export function DOMChangeTracker() {
  const { variants, performance } = useAnimationSystem();
  const [mutations, setMutations] = useState<string[]>([]);
  const targetRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState('Initial content');
  const [counter, { increment }] = useCounter(0);

  // Use mutation observer to track DOM changes
  useMutationObserver(
    (mutations: MutationRecord[]) => {
      const newMutations = mutations.map(
        (mutation: MutationRecord, _index: number) =>
          `${new Date().toLocaleTimeString()}: ${mutation.type} - ${mutation.target.nodeName}`,
      );
      setMutations(prev => [...newMutations, ...prev].slice(0, 10)); // Keep last 10
    },
    {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
    },
    targetRef.current,
  );

  const addContent = useCallback(() => {
    increment();
    setContent(prev => `${prev} | Added content ${counter + 1}`);
  }, [increment, counter]);

  const changeAttribute = useCallback(() => {
    if (targetRef.current) {
      targetRef.current.setAttribute('data-timestamp', Date.now().toString());
    }
  }, []);

  return (
    <div className="space-y-4 rounded-lg border border-border p-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <Eye size={20} />
          DOM Mutation Observer
        </h3>
        <div className="text-sm text-muted-foreground">Mutations detected: {mutations.length}</div>
      </div>

      {/* Target element to observe */}
      <div
        ref={targetRef}
        className="min-h-[100px] rounded-md border border-dashed border-border bg-muted/20 p-4"
        data-observed="true"
      >
        <p className="text-sm">{content}</p>
      </div>

      {/* Enhanced Controls */}
      <motion.div
        className="flex gap-2"
        variants={variants.staggerContainerFast}
        initial="hidden"
        animate="visible"
      >
        <motion.button
          variants={variants.scaleVariants}
          onClick={() => {
            performance.batchUpdates([() => addContent()]);
          }}
          className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground"
          whileHover={{
            scale: 1.05,
            transition: { duration: performance.optimizedDuration(0.15) },
          }}
          whileTap={{ scale: 0.95 }}
          style={{ willChange: 'transform' }}
        >
          Add Content
        </motion.button>
        <motion.button
          variants={variants.scaleVariants}
          onClick={() => {
            performance.batchUpdates([() => changeAttribute()]);
          }}
          className="rounded-md bg-secondary px-3 py-2 text-sm text-secondary-foreground"
          whileHover={{
            scale: 1.05,
            transition: { duration: performance.optimizedDuration(0.15) },
          }}
          whileTap={{ scale: 0.95 }}
          style={{ willChange: 'transform' }}
        >
          Change Attribute
        </motion.button>
        <motion.button
          variants={variants.scaleVariants}
          onClick={() => {
            performance.batchUpdates([() => setMutations([])]);
          }}
          className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground"
          whileHover={{
            backgroundColor: 'var(--muted-hover)',
            scale: 1.05,
            transition: { duration: performance.optimizedDuration(0.15) },
          }}
          whileTap={{ scale: 0.95 }}
          style={{ willChange: 'transform, background-color' }}
        >
          Clear Log
        </motion.button>
      </motion.div>

      {/* Enhanced Mutations log */}
      <AnimatePresence>
        {mutations.length > 0 && (
          <motion.div
            className="max-h-40 space-y-1 overflow-y-auto rounded-md bg-muted/50 p-3"
            variants={variants.slideUpVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ willChange: 'transform, opacity' }}
          >
            <motion.h4 className="mb-2 text-sm font-medium" variants={variants.fadeVariants}>
              Recent Mutations:
            </motion.h4>
            <motion.div variants={variants.staggerContainer} initial="hidden" animate="visible">
              {mutations.map(mutation => {
                const mutationId = generateId();
                return (
                  <motion.div
                    key={`mutation-${mutationId}`}
                    variants={variants.slideRightVariants}
                    className="font-mono text-xs text-muted-foreground"
                    style={{ willChange: 'transform, opacity' }}
                  >
                    {mutation}
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Main component showcasing all patterns
export function AdvancedStatePatternsShowcase() {
  return (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <h2 className="mb-2 text-2xl font-bold">Advanced Mantine State Patterns</h2>
        <p className="text-muted-foreground">
          Demonstrating useStateHistory, useMap, useSet, useSelection, and useMutationObserver
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <MessageHistoryManager />
        <AdvancedTagManager />
        <SmartListManager />
        <DOMChangeTracker />
      </div>
    </div>
  );
}
