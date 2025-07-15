'use client';

import { Button } from '#/components/ui/button';
import { isPrototypeMode } from '#/lib/prototype-mode';
import type { ChatMessage } from '#/lib/types';
import { BACKDROP_STYLES, Z_INDEX } from '#/lib/ui-constants';
import { generateUUID } from '#/lib/utils';
import { useDisclosure, useLocalStorage } from '@mantine/hooks';
import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronRight, Edit3, GitBranch, GitCommit, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

/**
 * Interface for a conversation branch containing messages and metadata
 */
export interface ConversationBranch {
  id: string;
  parentId: string | null;
  name: string;
  description?: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  metadata?: {
    model?: string;
    temperature?: number;
    systemPrompt?: string;
  };
}

/**
 * Interface for the complete conversation tree structure
 */
export interface ConversationTree {
  chatId: string;
  branches: ConversationBranch[];
  activeBranchId: string;
}

/**
 * Props for ConversationBranching component
 */
interface ConversationBranchingProps {
  chatId: string;
  messages: ChatMessage[];
  onBranchSwitch: (branchId: string, messages: ChatMessage[]) => void;
  onMessageEdit: (messageId: string, newContent: string) => void;
  className?: string;
}

/**
 * Conversation branching component for creating and managing conversation branches
 * @param chatId - Current chat identifier
 * @param messages - Current conversation messages
 * @param onBranchSwitch - Callback when switching between branches
 * @param onMessageEdit - Callback for editing messages
 * @param className - Additional CSS classes
 */
export function ConversationBranching({
  chatId,
  messages,
  onBranchSwitch,
  onMessageEdit: _onMessageEdit,
  className,
}: ConversationBranchingProps) {
  const prototypeMode = isPrototypeMode();

  // Enhanced mock conversation tree for prototype mode
  const mockConversationTree: ConversationTree = {
    chatId,
    branches: [
      {
        id: 'main',
        parentId: null,
        name: 'Main Conversation',
        messages,
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        updatedAt: new Date().toISOString(),
        isActive: true,
        metadata: {
          model: 'gpt-4',
          temperature: 0.7,
          systemPrompt: 'You are a helpful assistant.',
        },
      },
      {
        id: 'creative-branch',
        parentId: 'main',
        name: 'Creative Approach',
        messages: messages.slice(0, 2).concat([
          {
            id: 'mock-creative-1',
            role: 'assistant',
            parts: [
              {
                type: 'text',
                text: 'Let me approach this from a more creative angle. Instead of the traditional method, what if we think outside the box and explore innovative solutions that might be more engaging and effective?',
              },
            ],
          } as ChatMessage,
        ]),
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString(),
        isActive: false,
        metadata: {
          model: 'claude-3-sonnet',
          temperature: 0.9,
          systemPrompt: 'You are a creative and innovative assistant.',
        },
      },
      {
        id: 'technical-branch',
        parentId: 'main',
        name: 'Technical Deep-Dive',
        messages: messages.slice(0, 2).concat([
          {
            id: 'mock-technical-1',
            role: 'assistant',
            parts: [
              {
                type: 'text',
                text: 'Let me provide a detailed technical analysis. Here are the key architectural considerations, performance implications, and implementation details you should be aware of:\n\n1. **Performance**: O(n log n) complexity\n2. **Memory**: Linear space complexity\n3. **Scalability**: Horizontal scaling patterns',
              },
            ],
          } as ChatMessage,
        ]),
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        updatedAt: new Date(Date.now() - 1800000).toISOString(),
        isActive: false,
        metadata: {
          model: 'gpt-4',
          temperature: 0.3,
          systemPrompt: 'You are a technical expert focused on detailed analysis.',
        },
      },
      {
        id: 'beginner-branch',
        parentId: 'creative-branch',
        name: 'Beginner-Friendly',
        messages: messages.slice(0, 2).concat([
          {
            id: 'mock-beginner-1',
            role: 'assistant',
            parts: [
              {
                type: 'text',
                text: "Let me break this down into simple, easy-to-understand steps that anyone can follow, regardless of their experience level. Think of it like learning to ride a bike - we'll start with the basics and build up your confidence step by step.",
              },
            ],
            metadata: { createdAt: new Date(Date.now() - 900000).toISOString() },
          } as ChatMessage,
        ]),
        createdAt: new Date(Date.now() - 900000).toISOString(),
        updatedAt: new Date(Date.now() - 900000).toISOString(),
        isActive: false,
        metadata: {
          model: 'gpt-3.5-turbo',
          temperature: 0.5,
          systemPrompt: 'You are a patient teacher focused on clear, simple explanations.',
        },
      },
    ],
    activeBranchId: 'main',
  };

  const [tree, setTree] = useLocalStorage<ConversationTree>({
    key: `conversation-tree-${chatId}`,
    defaultValue: prototypeMode
      ? mockConversationTree
      : {
          chatId,
          branches: [
            {
              id: 'main',
              parentId: null,
              name: 'Main',
              messages,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              isActive: true,
            },
          ],
          activeBranchId: 'main',
        },
  });

  const [showBranchView, { toggle: toggleBranchView }] = useDisclosure(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [_editingBranch, _setEditingBranch] = useState<string | null>(null);
  const [_branchName, _setBranchName] = useState('');

  // Update main branch messages when they change
  useEffect(() => {
    setTree(prev => ({
      ...prev,
      branches: prev.branches.map(branch =>
        branch.id === prev.activeBranchId
          ? { ...branch, messages, updatedAt: new Date().toISOString() }
          : branch,
      ),
    }));
  }, [messages, setTree]);

  // Enhanced mock responses for different branch types
  const generateMockResponse = useCallback(
    (branchName: string, _lastUserMessage: string): ChatMessage => {
      const responseTemplates = {
        creative: [
          'Let me think about this creatively! What if we approached this from a completely different angle?',
          "Here's an innovative way to tackle this challenge that you might not have considered:",
          "I love creative problems! Let's brainstorm some out-of-the-box solutions:",
        ],
        technical: [
          'Let me provide a detailed technical analysis of this problem:',
          'From an engineering perspective, here are the key considerations:',
          "Let's dive deep into the technical implementation details:",
        ],
        simple: [
          'Let me explain this in simple terms that anyone can understand:',
          "No worries! I'll break this down step by step:",
          "Here's the easiest way to think about this:",
        ],
        alternative: [
          "Here's a different approach you could try:",
          'Let me suggest an alternative solution:',
          'Have you considered this alternative method?',
        ],
      };

      const branchType = branchName.toLowerCase().includes('creative')
        ? 'creative'
        : branchName.toLowerCase().includes('technical')
          ? 'technical'
          : branchName.toLowerCase().includes('simple') ||
              branchName.toLowerCase().includes('beginner')
            ? 'simple'
            : 'alternative';

      const templates = responseTemplates[branchType];
      const template = templates[Math.floor(Math.random() * templates.length)];

      return {
        id: generateUUID(),
        role: 'assistant',
        parts: [{ type: 'text', text: template }],
      } as ChatMessage;
    },
    [],
  );

  // Create a new branch from a specific message
  const createBranch = useCallback(
    (fromMessageIndex: number, name?: string) => {
      const activeBranch = tree.branches.find(b => b.id === tree.activeBranchId);
      if (!activeBranch) return;

      const branchMessages = activeBranch.messages.slice(0, fromMessageIndex + 1);
      const branchName = name || `Branch ${tree.branches.length}`;

      // In prototype mode, add a mock response to demonstrate the branch
      let finalMessages = branchMessages;
      if (prototypeMode && branchMessages.length > 0) {
        const lastUserMessage = branchMessages[branchMessages.length - 1];
        if (lastUserMessage.role === 'user') {
          const mockResponse = generateMockResponse(
            branchName,
            (lastUserMessage.parts[0] as any)?.text || '',
          );
          finalMessages = [...branchMessages, mockResponse];
        }
      }

      const newBranch: ConversationBranch = {
        id: generateUUID(),
        parentId: tree.activeBranchId,
        name: branchName,
        messages: finalMessages,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: false,
        metadata: {
          ...activeBranch.metadata,
          // Vary parameters slightly for different branches in prototype mode
          temperature: prototypeMode
            ? Math.max(
                0.1,
                Math.min(
                  1.0,
                  (activeBranch.metadata?.temperature || 0.7) + (Math.random() - 0.5) * 0.4,
                ),
              )
            : activeBranch.metadata?.temperature,
        },
      };

      setTree(prev => ({
        ...prev,
        branches: [...prev.branches, newBranch],
      }));

      return newBranch.id;
    },
    [tree, setTree, prototypeMode, generateMockResponse],
  );

  // Switch to a different branch
  const switchBranch = useCallback(
    (branchId: string) => {
      const branch = tree.branches.find(b => b.id === branchId);
      if (!branch) return;

      setTree(prev => ({
        ...prev,
        activeBranchId: branchId,
        branches: prev.branches.map(b => ({
          ...b,
          isActive: b.id === branchId,
        })),
      }));

      onBranchSwitch(branchId, branch.messages);
    },
    [tree, setTree, onBranchSwitch],
  );

  // Delete a branch
  const deleteBranch = useCallback(
    (branchId: string) => {
      if (branchId === 'main') return; // Can't delete main branch

      setTree(prev => {
        const newBranches = prev.branches.filter(b => b.id !== branchId);
        const newActiveBranchId = prev.activeBranchId === branchId ? 'main' : prev.activeBranchId;

        if (newActiveBranchId !== prev.activeBranchId) {
          const activeBranch = newBranches.find(b => b.id === newActiveBranchId);
          if (activeBranch) {
            onBranchSwitch(newActiveBranchId, activeBranch.messages);
          }
        }

        return {
          ...prev,
          branches: newBranches,
          activeBranchId: newActiveBranchId,
        };
      });
    },
    [setTree, onBranchSwitch],
  );

  // Fork from current point
  const forkConversation = useCallback(() => {
    const branchId = createBranch(messages.length - 1, `Fork ${tree.branches.length}`);
    if (branchId) {
      switchBranch(branchId);
    }
  }, [messages, tree.branches.length, createBranch, switchBranch]);

  // Quick create branches with predefined types (prototype mode enhancement)
  const createQuickBranch = useCallback(
    (type: 'creative' | 'technical' | 'simple') => {
      const branchNames = {
        creative: 'Creative Approach',
        technical: 'Technical Analysis',
        simple: 'Simplified Explanation',
      };

      const branchId = createBranch(messages.length - 1, branchNames[type]);
      if (branchId) {
        switchBranch(branchId);
      }
    },
    [messages, createBranch, switchBranch],
  );

  return (
    <div className={cx('relative', className)}>
      {/* Branch Controls */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={toggleBranchView} className="gap-2">
          <GitBranch className="h-4 w-4" />
          Branches ({tree.branches.length})
        </Button>

        <Button variant="outline" size="sm" onClick={forkConversation} className="gap-2">
          <GitCommit className="h-4 w-4" />
          Fork
        </Button>

        {/* Quick branch creation buttons in prototype mode */}
        {prototypeMode && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => createQuickBranch('creative')}
              className="gap-2 text-purple-600 hover:text-purple-700"
            >
              🎨 Creative
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => createQuickBranch('technical')}
              className="gap-2 text-blue-600 hover:text-blue-700"
            >
              🔧 Technical
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => createQuickBranch('simple')}
              className="gap-2 text-green-600 hover:text-green-700"
            >
              📚 Simple
            </Button>
          </>
        )}
      </div>

      {/* Branch View */}
      <AnimatePresence>
        {showBranchView && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-lg border bg-background p-4 shadow-lg"
          >
            <div className="space-y-3">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">Conversation Branches</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleBranchView}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>

              {/* Branch Tree */}
              <BranchTree
                tree={tree}
                onSwitch={switchBranch}
                onDelete={deleteBranch}
                onRename={(branchId, newName) => {
                  setTree(prev => ({
                    ...prev,
                    branches: prev.branches.map(b =>
                      b.id === branchId ? { ...b, name: newName } : b,
                    ),
                  }));
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message Timeline View */}
      {selectedMessageId && (
        <MessageTimeline
          message={messages.find(m => m.id === selectedMessageId)}
          branches={tree.branches}
          onCreateBranch={name => {
            const messageIndex = messages.findIndex(m => m.id === selectedMessageId);
            if (messageIndex >= 0) {
              const branchId = createBranch(messageIndex, name);
              if (branchId) switchBranch(branchId);
            }
            setSelectedMessageId(null);
          }}
          onClose={() => setSelectedMessageId(null)}
        />
      )}
    </div>
  );
}

/**
 * Props for BranchTree component
 */
interface BranchTreeProps {
  tree: ConversationTree;
  onSwitch: (branchId: string) => void;
  onDelete: (branchId: string) => void;
  onRename: (branchId: string, name: string) => void;
}

/**
 * Branch tree visualization component
 * @param tree - Conversation tree data
 * @param onSwitch - Callback for switching branches
 * @param onDelete - Callback for deleting branches
 * @param onRename - Callback for renaming branches
 */
function BranchTree({ tree, onSwitch, onDelete, onRename }: BranchTreeProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [expandedBranches, setExpandedBranches] = useState<Set<string>>(new Set(['main']));

  const toggleExpanded = (branchId: string) => {
    setExpandedBranches(prev => {
      const next = new Set(prev);
      if (next.has(branchId)) {
        next.delete(branchId);
      } else {
        next.add(branchId);
      }
      return next;
    });
  };

  const renderBranch = (branch: ConversationBranch, level = 0) => {
    const childBranches = tree.branches.filter(b => b.parentId === branch.id);
    const hasChildren = childBranches.length > 0;
    const isExpanded = expandedBranches.has(branch.id);
    const isActive = branch.id === tree.activeBranchId;

    return (
      <div key={branch.id} className="space-y-1">
        <div
          className={cx(
            'flex items-center gap-2 rounded-lg p-2 transition-colors',
            isActive ? 'bg-primary/10' : 'hover:bg-muted/50',
            'cursor-pointer',
          )}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
        >
          {/* Expand/Collapse */}
          {hasChildren && (
            <button
              onClick={e => {
                e.stopPropagation();
                toggleExpanded(branch.id);
              }}
              className="p-0.5"
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
          )}

          {/* Branch Icon */}
          <GitBranch
            className={cx('h-3 w-3', isActive ? 'text-primary' : 'text-muted-foreground')}
          />

          {/* Branch Name */}
          {editingId === branch.id ? (
            <input
              value={editName}
              onChange={e => setEditName(e.target.value)}
              onBlur={() => {
                onRename(branch.id, editName);
                setEditingId(null);
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  onRename(branch.id, editName);
                  setEditingId(null);
                }
              }}
              className="flex-1 bg-transparent text-sm focus:outline-none"
            />
          ) : (
            <span
              className="flex-1 cursor-pointer text-sm font-medium"
              onClick={() => onSwitch(branch.id)}
              onKeyDown={e => e.key === 'Enter' && onSwitch(branch.id)}
              role="button"
              tabIndex={0}
            >
              {branch.name}
            </span>
          )}

          {/* Branch Info */}
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-xs text-muted-foreground">{branch.messages.length} msgs</span>
            {/* Enhanced metadata display in prototype mode */}
            {isPrototypeMode() && branch.metadata && (
              <div className="flex gap-1">
                {branch.metadata.model && (
                  <span className="rounded bg-muted/60 px-1.5 py-0.5 text-xs text-muted-foreground">
                    {branch.metadata.model}
                  </span>
                )}
                {branch.metadata.temperature && (
                  <span className="rounded bg-muted/60 px-1.5 py-0.5 text-xs text-muted-foreground">
                    T:{branch.metadata.temperature.toFixed(1)}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={e => {
                e.stopPropagation();
                setEditingId(branch.id);
                setEditName(branch.name);
              }}
              className="rounded p-1 hover:bg-muted"
            >
              <Edit3 className="h-3 w-3" />
            </button>

            {branch.id !== 'main' && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  onDelete(branch.id);
                }}
                className="rounded p-1 hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Child Branches */}
        {hasChildren && isExpanded && (
          <div className="ml-2 border-l border-border/50">
            {childBranches.map(child => renderBranch(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-1">
      {tree.branches.filter(b => b.parentId === null).map(branch => renderBranch(branch))}
    </div>
  );
}

/**
 * Props for MessageTimeline component
 */
interface MessageTimelineProps {
  message?: ChatMessage;
  branches: ConversationBranch[];
  onCreateBranch: (name: string) => void;
  onClose: () => void;
}

/**
 * Message timeline component for creating branches from specific messages
 * @param message - Message to branch from
 * @param branches - Existing branches
 * @param onCreateBranch - Callback for creating new branch
 * @param onClose - Callback for closing timeline
 */
function MessageTimeline({ message, branches, onCreateBranch, onClose }: MessageTimelineProps) {
  const [branchName, setBranchName] = useState('');

  if (!message) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`fixed inset-0 z-[${Z_INDEX.MODAL_BACKDROP}] flex items-center justify-center p-4 ${BACKDROP_STYLES.HEAVY}`}
    >
      <div className="w-full max-w-md space-y-4 rounded-lg border bg-background p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Create Branch</h3>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
            <X className="h-3 w-3" />
          </Button>
        </div>

        <div className="space-y-3">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="mb-1 text-sm font-medium">Branch from:</p>
            <p className="text-sm text-muted-foreground">
              {message.role === 'user' ? 'User' : 'Assistant'}:
              {message.parts[0]?.type === 'text'
                ? message.parts[0].text?.slice(0, 100) + '...'
                : 'Non-text content'}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Branch Name</label>
            <input
              value={branchName}
              onChange={e => setBranchName(e.target.value)}
              placeholder="Enter branch name..."
              className="w-full rounded-lg border bg-background p-2 focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={() => {
              onCreateBranch(branchName || `Branch ${branches.length + 1}`);
            }}
            className="flex-1"
          >
            <GitBranch className="mr-2 h-4 w-4" />
            Create Branch
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
