/**
 * MCP Marketplace UI Components
 * User interface for browsing and managing MCP packages
 */

'use client';

import { Badge } from '#/components/ui/badge';
import { Button } from '#/components/ui/button';
import { Input } from '#/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '#/components/ui/tooltip';
import { cn } from '#/lib/utils';
import { logInfo } from '@repo/observability';
import {
  BookOpen,
  CheckCircle,
  Clock,
  Download,
  Package,
  Search,
  Settings,
  Shield,
  Star,
  Trash2,
  Users,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface MarketplaceUIProps {
  className?: string;
  showFeatured?: boolean;
  maxItems?: number;
  initialSearchQuery?: string;
}

const FEATURED_PACKAGES = [
  {
    id: 'context7-mcp',
    name: 'Context7 - Up-to-date Code Docs',
    description:
      'Up-to-date, version-specific documentation and code examples from library sources',
    version: 'latest',
    author: { name: 'Upstash' },
    rating: 4.9,
    downloads: 50000,
    categories: ['documentation', 'development'],
    capabilities: ['library_documentation', 'code_examples'],
    trustLevel: 'verified',
    featured: true,
    installed: true,
    enabled: true,
  },
  {
    id: 'perplexity-search',
    name: 'Perplexity Web Search',
    description: 'Real-time web search with AI-powered results',
    version: '1.2.0',
    author: { name: 'Perplexity' },
    rating: 4.7,
    downloads: 35000,
    categories: ['search', 'productivity'],
    capabilities: ['web_search', 'current_events'],
    trustLevel: 'verified',
    featured: true,
    installed: true,
    enabled: true,
  },
  {
    id: 'filesystem-tools',
    name: 'Filesystem Operations',
    description: 'File system operations and management tools',
    version: '2.1.0',
    author: { name: 'MCP Community' },
    rating: 4.5,
    downloads: 28000,
    categories: ['utility', 'development'],
    capabilities: ['file_operations', 'directory_management'],
    trustLevel: 'community',
    featured: false,
    installed: true,
    enabled: true,
  },
];

export function McpMarketplace({
  className,
  showFeatured = true,
  maxItems,
  initialSearchQuery = '',
}: MarketplaceUIProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [packages, _setPackages] = useState(FEATURED_PACKAGES);
  const [_loading, _setLoading] = useState(false);

  // Update search query when initialSearchQuery changes
  useEffect(() => {
    if (initialSearchQuery) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  const categories = ['all', 'documentation', 'search', 'productivity', 'development', 'utility'];

  const filteredPackages = packages
    .filter(pkg => {
      const matchesSearch =
        pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pkg.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'all' || pkg.categories.includes(selectedCategory);
      const showPackage = showFeatured ? true : pkg.featured || Math.random() > 0.5; // Show variety

      return matchesSearch && matchesCategory && showPackage;
    })
    .slice(0, maxItems);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold">
            <Package className="h-6 w-6 text-primary" />
            MCP Marketplace
          </h2>
          <p className="text-muted-foreground">
            Discover and install Model Context Protocol tools and servers
          </p>
        </div>

        {showFeatured && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Star className="h-3 w-3 text-yellow-500" />
            Featured
          </Badge>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
          <Input
            placeholder="Search packages..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="capitalize"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Package Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredPackages.map(pkg => (
          <McpPackageCard
            key={pkg.id}
            package={pkg}
            highlighted={Boolean(searchQuery && pkg.id.includes(searchQuery.toLowerCase()))}
          />
        ))}
      </div>

      {filteredPackages.length === 0 && (
        <div className="py-12 text-center">
          <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-medium">No packages found</h3>
          <p className="text-muted-foreground">Try adjusting your search or category filter</p>
        </div>
      )}
    </div>
  );
}

function McpPackageCard({
  package: pkg,
  highlighted = false,
}: {
  package: any;
  highlighted?: boolean;
}) {
  const [isInstalling, setIsInstalling] = useState(false);

  const handleInstall = async () => {
    setIsInstalling(true);
    // Simulate installation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsInstalling(false);
  };

  const handleToggle = () => {
    // Toggle package enabled state
    logInfo('MCP package toggled', { packageId: pkg.id, packageName: pkg.name });
  };

  const handleUninstall = () => {
    // Uninstall package
    logInfo('MCP package uninstalled', { packageId: pkg.id, packageName: pkg.name });
  };

  const getTrustLevelColor = (level: string) => {
    switch (level) {
      case 'verified':
        return 'text-green-600 bg-green-50';
      case 'trusted':
        return 'text-blue-600 bg-blue-50';
      case 'community':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTrustLevelIcon = (level: string) => {
    switch (level) {
      case 'verified':
        return <CheckCircle className="h-3 w-3" />;
      case 'trusted':
        return <Shield className="h-3 w-3" />;
      default:
        return <Users className="h-3 w-3" />;
    }
  };

  return (
    <div
      className={cn(
        'rounded-lg border p-4 transition-shadow hover:shadow-md',
        highlighted && 'bg-primary/5 ring-2 ring-primary ring-opacity-50',
      )}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <h3 className="truncate font-semibold">{pkg.name}</h3>
            {pkg.featured && <Star className="h-4 w-4 flex-shrink-0 text-yellow-500" />}
          </div>
          <p className="line-clamp-2 text-sm text-muted-foreground">{pkg.description}</p>
        </div>
      </div>

      {/* Metadata */}
      <div className="mb-3 flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Star className="h-3 w-3" />
          {pkg.rating}
        </div>
        <div className="flex items-center gap-1">
          <Download className="h-3 w-3" />
          {pkg.downloads.toLocaleString()}
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />v{pkg.version}
        </div>
      </div>

      {/* Categories and Capabilities */}
      <div className="mb-4 space-y-2">
        <div className="flex flex-wrap gap-1">
          {pkg.categories.slice(0, 2).map((category: string) => (
            <Badge key={category} variant="secondary" className="text-xs">
              {category}
            </Badge>
          ))}
          {pkg.categories.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{pkg.categories.length - 2}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn('flex items-center gap-1 text-xs', getTrustLevelColor(pkg.trustLevel))}
          >
            {getTrustLevelIcon(pkg.trustLevel)}
            {pkg.trustLevel}
          </Badge>

          {pkg.capabilities.length > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="text-xs">
                    <Zap className="mr-1 h-3 w-3" />
                    {pkg.capabilities.length} capabilities
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-sm">
                    <div className="mb-1 font-medium">Capabilities:</div>
                    <ul className="space-y-1 text-xs">
                      {pkg.capabilities.map((cap: string) => (
                        <li key={cap}>• {cap.replace('_', ' ')}</li>
                      ))}
                    </ul>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {pkg.installed ? (
          <>
            <Button
              variant={pkg.enabled ? 'default' : 'outline'}
              size="sm"
              onClick={handleToggle}
              className="flex-1"
            >
              {pkg.enabled ? 'Enabled' : 'Disabled'}
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Configure</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={handleUninstall}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Uninstall</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </>
        ) : (
          <Button onClick={handleInstall} disabled={isInstalling} className="flex-1" size="sm">
            {isInstalling ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Installing...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Install
              </>
            )}
          </Button>
        )}
      </div>

      {/* Context7 specific highlight */}
      {pkg.id === 'context7-mcp' && (
        <div className="mt-3 rounded border border-blue-200 bg-blue-50 p-2">
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <BookOpen className="h-4 w-4" />
            <span className="font-medium">Auto-enabled for documentation</span>
          </div>
          <p className="mt-1 text-xs text-blue-600">
            Automatically provides up-to-date library docs for your coding questions
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Compact marketplace widget for sidebars or dashboards
 */
export function McpMarketplaceWidget({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg border p-4', className)}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-medium">
          <Package className="h-4 w-4" />
          MCP Tools
        </h3>
        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
          View All
        </Button>
      </div>

      <div className="space-y-2">
        {FEATURED_PACKAGES.slice(0, 3).map(pkg => (
          <div key={pkg.id} className="flex items-center justify-between">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <div
                className={cn('h-2 w-2 rounded-full', pkg.enabled ? 'bg-green-500' : 'bg-gray-300')}
              />
              <span className="truncate text-sm">{pkg.name.split(' - ')[0]}</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {pkg.trustLevel}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
