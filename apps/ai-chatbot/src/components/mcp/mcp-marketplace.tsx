'use client';

import { Button } from '#/components/ui/button';
import { RESPONSIVE } from '#/lib/ui-constants';
import cx from 'classnames';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Clock,
  Code,
  Database,
  Download,
  FileText,
  GitBranch,
  Globe,
  Package,
  Search,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useState } from 'react';

interface MCPServer {
  id: string;
  name: string;
  description: string;
  author: string;
  stars: number;
  downloads: string;
  category: string;
  verified: boolean;
  featured?: boolean;
  transport: 'stdio' | 'sse' | 'custom';
  tags: string[];
  tools: number;
  lastUpdated: string;
  icon?: any;
}

interface MCPMarketplaceProps {
  onInstall: (server: MCPServer) => void;
  className?: string;
}

export function MCPMarketplace({ onInstall, className }: MCPMarketplaceProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'trending'>('popular');

  // Mock data - in reality this would come from an API
  const servers: MCPServer[] = [
    {
      id: 'zapier-mcp',
      name: 'Zapier MCP',
      description: 'Connect to 5000+ apps and automate workflows',
      author: 'Zapier',
      stars: 1200,
      downloads: '10k+',
      category: 'productivity',
      verified: true,
      featured: true,
      transport: 'sse',
      tags: ['automation', 'integration', 'workflows'],
      tools: 150,
      lastUpdated: '2 days ago',
      icon: Zap,
    },
    {
      id: 'github-tools',
      name: 'GitHub Tools',
      description: 'Repository management, issues, PRs, and more',
      author: 'GitHub',
      stars: 800,
      downloads: '5k+',
      category: 'development',
      verified: true,
      transport: 'sse',
      tags: ['git', 'version-control', 'collaboration'],
      tools: 45,
      lastUpdated: '1 week ago',
      icon: GitBranch,
    },
    {
      id: 'web-scraper',
      name: 'Web Scraper Pro',
      description: 'Advanced web scraping and data extraction tools',
      author: 'DataMiner Inc',
      stars: 650,
      downloads: '3k+',
      category: 'data',
      verified: false,
      transport: 'stdio',
      tags: ['scraping', 'data', 'web'],
      tools: 20,
      lastUpdated: '3 days ago',
      icon: Globe,
    },
    {
      id: 'local-files',
      name: 'File System Tools',
      description: 'Read, write, and manage local files safely',
      author: 'Community',
      stars: 450,
      downloads: '8k+',
      category: 'utilities',
      verified: true,
      transport: 'stdio',
      tags: ['files', 'filesystem', 'local'],
      tools: 15,
      lastUpdated: '5 days ago',
      icon: FileText,
    },
    {
      id: 'database-connector',
      name: 'Database Connector',
      description: 'Connect to PostgreSQL, MySQL, MongoDB, and more',
      author: 'DBTools',
      stars: 920,
      downloads: '7k+',
      category: 'data',
      verified: true,
      transport: 'sse',
      tags: ['database', 'sql', 'nosql'],
      tools: 30,
      lastUpdated: '1 day ago',
      icon: Database,
    },
    {
      id: 'ai-enhancer',
      name: 'AI Enhancer Suite',
      description: 'Advanced AI tools for content generation and analysis',
      author: 'AI Labs',
      stars: 1500,
      downloads: '15k+',
      category: 'ai',
      verified: true,
      featured: true,
      transport: 'sse',
      tags: ['ai', 'generation', 'analysis'],
      tools: 60,
      lastUpdated: '12 hours ago',
      icon: Sparkles,
    },
  ];

  const categories = [
    { id: 'all', name: 'All', icon: Package },
    { id: 'productivity', name: 'Productivity', icon: Zap },
    { id: 'development', name: 'Development', icon: Code },
    { id: 'data', name: 'Data & Analytics', icon: Database },
    { id: 'utilities', name: 'Utilities', icon: Shield },
    { id: 'ai', name: 'AI & ML', icon: Sparkles },
  ];

  // Filter and sort servers
  const filteredServers = servers
    .filter(server => {
      const matchesSearch =
        searchQuery === '' ||
        server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        server.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        server.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        !selectedCategory || selectedCategory === 'all' || server.category === selectedCategory;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.stars - a.stars;
        case 'recent':
          return 0; // Would use actual dates
        case 'trending':
          return b.stars - a.stars; // Simplified
        default:
          return 0;
      }
    });

  return (
    <div className={cx('space-y-6', className)}>
      {/* Header */}
      <div>
        <h2 className="mb-2 text-2xl font-bold">MCP Marketplace</h2>
        <p className="text-muted-foreground">
          Discover and install MCP servers to extend your AI capabilities
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search MCP servers..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border bg-background py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Categories and Sort */}
        <div className="flex items-center justify-between gap-4">
          <div
            className={`flex ${RESPONSIVE.SPACING.GAP.SM} overflow-scroll-ios flex-1 overflow-x-auto`}
          >
            {categories.map(category => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() =>
                    setSelectedCategory(selectedCategory === category.id ? null : category.id)
                  }
                  className={cx(
                    'flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm transition-colors',
                    selectedCategory === category.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80',
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {category.name}
                </button>
              );
            })}
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="rounded-lg border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="popular">Most Popular</option>
            <option value="recent">Recently Updated</option>
            <option value="trending">Trending</option>
          </select>
        </div>
      </div>

      {/* Featured Servers */}
      {filteredServers.some(s => s.featured) && (
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 font-semibold">
            <TrendingUp className="h-4 w-4 text-primary" />
            Featured
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {filteredServers
              .filter(s => s.featured)
              .map(server => (
                <FeaturedServerCard
                  key={server.id}
                  server={server}
                  onInstall={() => onInstall(server)}
                />
              ))}
          </div>
        </div>
      )}

      {/* Server Grid */}
      <div className="space-y-3">
        <h3 className="font-semibold">
          {selectedCategory && selectedCategory !== 'all'
            ? categories.find(c => c.id === selectedCategory)?.name
            : 'All Servers'}
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredServers
            .filter(s => !s.featured)
            .map(server => (
              <ServerCard key={server.id} server={server} onInstall={() => onInstall(server)} />
            ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredServers.length === 0 && (
        <div className="py-12 text-center">
          <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-20" />
          <p className="text-muted-foreground">No servers found</p>
          <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}

// Featured Server Card
function FeaturedServerCard({ server, onInstall }: { server: MCPServer; onInstall: () => void }) {
  const Icon = server.icon || Package;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-primary/5 to-primary/10 p-6"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="bg-grid-pattern absolute inset-0" />
      </div>

      <div className="relative space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-3">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">{server.name}</h4>
                {server.verified && <CheckCircle className="h-4 w-4 text-primary" />}
              </div>
              <p className="text-sm text-muted-foreground">by {server.author}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
            <span>{server.stars}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm">{server.description}</p>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Download className="h-3 w-3" />
            {server.downloads}
          </span>
          <span className="flex items-center gap-1">
            <Code className="h-3 w-3" />
            {server.tools} tools
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {server.lastUpdated}
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {server.tags.map(tag => (
            <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-xs">
              {tag}
            </span>
          ))}
        </div>

        {/* Action */}
        <Button onClick={onInstall} className="w-full">
          <Download className="mr-2 h-4 w-4" />
          Install Server
        </Button>
      </div>
    </motion.div>
  );
}

// Regular Server Card
function ServerCard({ server, onInstall }: { server: MCPServer; onInstall: () => void }) {
  const Icon = server.icon || Package;

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="rounded-lg border p-4 transition-all hover:border-primary/50"
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-muted p-2">
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h4 className="truncate text-sm font-medium">{server.name}</h4>
                {server.verified && <CheckCircle className="h-3 w-3 flex-shrink-0 text-primary" />}
              </div>
              <p className="text-xs text-muted-foreground">by {server.author}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="line-clamp-2 text-sm text-muted-foreground">{server.description}</p>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3 text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              {server.stars}
            </span>
            <span className="flex items-center gap-1">
              <Download className="h-3 w-3" />
              {server.downloads}
            </span>
            <span>{server.tools} tools</span>
          </div>
        </div>

        {/* Action */}
        <Button variant="outline" size="sm" onClick={onInstall} className="w-full">
          Install
        </Button>
      </div>
    </motion.div>
  );
}
