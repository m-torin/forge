'use client';

import { useQuickAccess } from '#/components/context/quick-access-context';
import { useMcpConnectionStatus } from '#/components/mcp/connection-status';
import { McpMarketplace } from '#/components/mcp/marketplace-ui';
import { Badge } from '#/components/ui/badge';
import { Button } from '#/components/ui/button';
import { useAnimationSystem } from '#/hooks/ui/use-framer-motion';
import { useFixedPosition } from '#/hooks/ui/use-layout-manager';
import { BACKDROP_STYLES, Z_INDEX } from '#/lib/ui-constants';
import { useLocalStorage } from '@mantine/hooks';
import { logInfo } from '@repo/observability';
import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  Brain,
  ChevronRight,
  Database,
  FileText,
  GitBranch,
  Globe,
  Layers,
  Link2,
  Menu,
  MessageSquare,
  Network,
  Play,
  Shield,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface QuickAccessItem {
  id: string;
  title: string;
  description: string;
  icon: any;
  action: () => void;
  category: 'ui' | 'performance' | 'mcp' | 'ai';
  hotkey?: string;
}

export function QuickAccessMenu() {
  const {
    isQuickAccessOpen,
    setIsQuickAccessOpen,
    marketplaceNavigation,
    navigateToMarketplace,
    navigateToMenu,
  } = useQuickAccess();
  const { status, isEnhanced, isDemoMode } = useMcpConnectionStatus();
  const { variants } = useAnimationSystem();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [hasSeenMenu, setHasSeenMenu] = useLocalStorage({
    key: 'quick-access-seen',
    defaultValue: false,
  });

  const { className: fixedPositionClass } = useFixedPosition(
    'quick-access',
    'bottom-right',
    true,
    3,
  );

  // Update MCP Marketplace action to use navigation
  const mcpMarketplaceAction = () => {
    navigateToMarketplace();
  };

  // Reset to menu view when modal closes
  useEffect(() => {
    if (!isQuickAccessOpen) {
      // Small delay to allow closing animation
      const timer = setTimeout(() => {
        navigateToMenu();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isQuickAccessOpen, navigateToMenu]);

  const quickAccessItems: QuickAccessItem[] = [
    // UI/UX Features
    {
      id: 'feature-showcase',
      title: 'Feature Showcase',
      description: "See all features we've built",
      icon: Sparkles,
      category: 'ui',
      action: () => window.open('/?showcase=true', '_blank'),
    },
    {
      id: 'playground',
      title: 'Feature Playground',
      description: 'Interactive demos of all features',
      icon: Play,
      category: 'ui',
      action: () => window.open('/feature-playground', '_blank'),
    },
    {
      id: 'network-status',
      title: 'Network Monitor',
      description: 'Connection quality & status',
      icon: Network,
      category: 'ui',
      action: () => logInfo('Network status feature'),
    },
    {
      id: 'message-reactions',
      title: 'Message Reactions',
      description: 'Quick feedback & ratings',
      icon: MessageSquare,
      category: 'ui',
      action: () => logInfo('Message reactions feature'),
    },

    // Performance Features
    {
      id: 'performance-monitor',
      title: 'Performance Monitor',
      description: 'Real-time FPS & memory',
      icon: Activity,
      category: 'performance',
      action: () => logInfo('Performance monitor feature'),
    },
    {
      id: 'virtual-scroll',
      title: 'Virtual Scrolling',
      description: 'Handle thousands of messages',
      icon: Layers,
      category: 'performance',
      action: () => logInfo('Virtual scrolling feature'),
    },

    // MCP Features
    {
      id: 'mcp-connections',
      title: 'MCP Connections',
      description: 'Manage tool connections',
      icon: Link2,
      category: 'mcp',
      action: () => logInfo('MCP connections feature'),
    },
    {
      id: 'mcp-marketplace',
      title: 'MCP Marketplace',
      description: 'Discover & install tools',
      icon: Globe,
      category: 'mcp',
      action: mcpMarketplaceAction,
    },
    {
      id: 'mcp-permissions',
      title: 'Permission Manager',
      description: 'Security & access control',
      icon: Shield,
      category: 'mcp',
      action: () => logInfo('MCP permissions feature'),
    },
    {
      id: 'tool-chains',
      title: 'Tool Chain Builder',
      description: 'Create complex workflows',
      icon: GitBranch,
      category: 'mcp',
      action: () => logInfo('Tool chain builder feature'),
    },

    // AI Features
    {
      id: 'advanced-rag',
      title: 'Advanced RAG',
      description: 'Million document library - coming soon',
      icon: Database,
      category: 'ai',
      action: () => logInfo('Advanced RAG feature - coming soon'),
    },
    {
      id: 'multi-model',
      title: 'Multi-Model Compare',
      description: 'Compare AI responses',
      icon: Brain,
      category: 'ai',
      action: () => logInfo('Multi-model feature'),
    },
    {
      id: 'conversation-branching',
      title: 'Conversation Branching',
      description: 'Fork & explore alternatives',
      icon: GitBranch,
      category: 'ai',
      action: () => logInfo('Conversation branching feature'),
    },
    {
      id: 'ai-memory',
      title: 'AI Memory System',
      description: 'Persistent personalization',
      icon: Database,
      category: 'ai',
      action: () => logInfo('AI memory feature'),
    },
    {
      id: 'prompt-templates',
      title: 'Prompt Templates',
      description: 'Reusable prompt library',
      icon: FileText,
      category: 'ai',
      action: () => logInfo('Prompt templates feature'),
    },
  ];

  const categories = [
    { id: 'ui', label: 'UI/UX', icon: Sparkles },
    { id: 'performance', label: 'Performance', icon: Zap },
    { id: 'mcp', label: 'MCP Tools', icon: Link2 },
    { id: 'ai', label: 'AI Features', icon: Brain },
  ];

  const filteredItems = selectedCategory
    ? quickAccessItems.filter(item => item.category === selectedCategory)
    : quickAccessItems;

  return (
    <>
      {/* Quick Access Button */}
      <motion.div
        variants={!hasSeenMenu ? variants.pulseVariants : undefined}
        animate={!hasSeenMenu ? 'pulse' : 'visible'}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setIsQuickAccessOpen(true);
            setHasSeenMenu(true);
          }}
          className={cx(
            fixedPositionClass,
            'gap-2 shadow-lg',
            `z-[${Z_INDEX.PANEL}]`,
            !hasSeenMenu && 'ring-2 ring-primary ring-opacity-50',
          )}
        >
          <Menu className="h-4 w-4" />
          <span className="hidden sm:inline">Quick Access</span>
        </Button>
      </motion.div>

      {/* Floating Menu */}
      <AnimatePresence>
        {isQuickAccessOpen && (
          <motion.div
            variants={variants.overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cx(
              'fixed inset-0 flex items-center justify-center p-4',
              BACKDROP_STYLES.MEDIUM,
              `z-[${Z_INDEX.MODAL_BACKDROP}]`,
            )}
            onClick={() => setIsQuickAccessOpen(false)}
          >
            <motion.div
              variants={variants.modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={e => e.stopPropagation()}
              className="max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-lg border bg-background shadow-2xl"
            >
              {/* Header */}
              <div className="border-b p-4">
                <div className="flex items-center justify-between">
                  <div>
                    {marketplaceNavigation.view === 'menu' ? (
                      <>
                        <h2 className="text-lg font-semibold">Quick Access Menu</h2>
                        <p className="text-sm text-muted-foreground">
                          Jump to any feature instantly
                        </p>
                      </>
                    ) : (
                      <>
                        <h2 className="flex items-center gap-2 text-lg font-semibold">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={navigateToMenu}
                            className="h-auto p-1 hover:bg-muted"
                          >
                            <ChevronRight className="h-4 w-4 rotate-180" />
                          </Button>
                          MCP Marketplace
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          Discover and install MCP tools
                        </p>
                      </>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setIsQuickAccessOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Enhanced Features Status - Only show in menu view */}
              {marketplaceNavigation.view === 'menu' && (isEnhanced || isDemoMode) && status && (
                <div className="border-b bg-blue-50/50 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Enhanced Features</span>
                      <Badge variant="outline" className="text-xs">
                        {Object.values(status.features).filter(Boolean).length} active
                      </Badge>
                    </div>
                    {isDemoMode && (
                      <Badge variant="secondary" className="text-xs">
                        Demo Mode
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Advanced MCP functionality with AI SDK v5 integration
                  </div>
                  {status.features && Object.keys(status.features).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {Object.entries(status.features)
                        .filter(([, enabled]) => enabled)
                        .slice(0, 4)
                        .map(([feature]) => (
                          <button
                            key={feature}
                            onClick={() => {
                              // If it's Context7, navigate to marketplace with filter
                              if (feature.toLowerCase().includes('context7')) {
                                navigateToMarketplace('context7');
                              }
                            }}
                            className={cx(
                              'inline-flex items-center rounded-md border px-1.5 py-0.5 text-xs font-medium transition-colors',
                              'border-input bg-background hover:bg-accent hover:text-accent-foreground',
                              feature.toLowerCase().includes('context7') &&
                                'cursor-pointer hover:border-primary',
                            )}
                          >
                            {feature.replace(/([A-Z])/g, ' $1').trim()}
                          </button>
                        ))}
                      {Object.values(status.features).filter(Boolean).length > 4 && (
                        <Badge variant="outline" className="px-1.5 py-0.5 text-xs">
                          +{Object.values(status.features).filter(Boolean).length - 4} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Content Area - Switch between menu and marketplace */}
              {marketplaceNavigation.view === 'menu' ? (
                <>
                  {/* Category Filters */}
                  <div className="border-b p-4">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant={selectedCategory === null ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory(null)}
                      >
                        All Features ({quickAccessItems.length})
                      </Button>
                      {categories.map(category => {
                        const Icon = category.icon;
                        const count = quickAccessItems.filter(
                          item => item.category === category.id,
                        ).length;
                        return (
                          <Button
                            key={category.id}
                            variant={selectedCategory === category.id ? 'default' : 'outline'}
                            size="sm"
                            onClick={() =>
                              setSelectedCategory(
                                selectedCategory === category.id ? null : category.id,
                              )
                            }
                            className="gap-1"
                          >
                            <Icon className="h-3 w-3" />
                            {category.label} ({count})
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Feature Grid */}
                  <div className="max-h-96 overflow-y-auto p-4">
                    <motion.div
                      className="grid gap-2"
                      variants={variants.staggerContainerFast}
                      initial="hidden"
                      animate="visible"
                    >
                      <AnimatePresence mode="popLayout">
                        {filteredItems.map((item, _index) => {
                          const Icon = item.icon;
                          return (
                            <motion.button
                              key={item.id}
                              layout
                              variants={variants.slideUpVariants}
                              onClick={() => {
                                item.action();
                                // Don't close modal if navigating to marketplace
                                if (item.id !== 'mcp-marketplace') {
                                  setIsQuickAccessOpen(false);
                                }
                              }}
                              className="flex items-center gap-3 rounded-lg border p-3 text-left"
                              whileHover={{ backgroundColor: 'var(--muted)' }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                <Icon className="h-4 w-4 text-primary" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="text-sm font-medium">{item.title}</h3>
                                <p className="truncate text-xs text-muted-foreground">
                                  {item.description}
                                </p>
                              </div>
                              <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                            </motion.button>
                          );
                        })}
                      </AnimatePresence>
                    </motion.div>
                  </div>
                </>
              ) : (
                /* Marketplace View */
                <div className="max-h-96 overflow-y-auto p-4">
                  <McpMarketplace
                    className="border-none shadow-none"
                    showFeatured={true}
                    maxItems={6}
                    initialSearchQuery={marketplaceNavigation.filter}
                  />
                </div>
              )}

              {/* Footer */}
              <div className="border-t bg-muted/30 p-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Press Esc to close</span>
                  <span>
                    {marketplaceNavigation.view === 'menu'
                      ? `${filteredItems.length} features available`
                      : 'MCP Package Marketplace'}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
