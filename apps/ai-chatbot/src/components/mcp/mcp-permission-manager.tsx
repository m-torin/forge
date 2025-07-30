'use client';

import { Button } from '#/components/ui/button';
import type { MCPConnection, MCPTool } from '#/lib/mcp/types';
import { BACKDROP_STYLES, Z_INDEX } from '#/lib/ui-constants';
import { useDisclosure, useLocalStorage } from '@mantine/hooks';
import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle,
  Database,
  FileText,
  Globe,
  Info,
  Shield,
  Terminal,
  User,
} from 'lucide-react';
import { useState } from 'react';

// Utility function for risk color
function getRiskColor(risk: string) {
  switch (risk) {
    case 'low':
      return 'text-green-500';
    case 'medium':
      return 'text-yellow-500';
    case 'high':
      return 'text-red-500';
    default:
      return 'text-gray-500';
  }
}

interface Permission {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: 'system' | 'network' | 'data' | 'personal';
  risk: 'low' | 'medium' | 'high';
  enabled: boolean;
}

interface MCPPermissionManagerProps {
  connection: MCPConnection;
  onPermissionChange: (connectionId: string, permissions: Permission[]) => void;
  className?: string;
}

export function MCPPermissionManager({
  connection,
  onPermissionChange,
  className,
}: MCPPermissionManagerProps) {
  const [permissions, setPermissions] = useLocalStorage<Record<string, Permission[]>>({
    key: 'mcp-permissions',
    defaultValue: {},
  });

  const [showDetails, { toggle: toggleDetails }] = useDisclosure();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Default permissions based on tool analysis
  const analyzeToolPermissions = (tools: MCPTool[]): Permission[] => {
    const permissionSet = new Set<string>();
    const permissions: Permission[] = [];

    tools.forEach(tool => {
      const name = tool.name.toLowerCase();
      const _desc = tool.description.toLowerCase();

      // File system access
      if (name.includes('file') || name.includes('read') || name.includes('write')) {
        permissionSet.add('filesystem');
      }

      // Network access
      if (name.includes('http') || name.includes('fetch') || name.includes('api')) {
        permissionSet.add('network');
      }

      // Database access
      if (name.includes('database') || name.includes('query') || name.includes('sql')) {
        permissionSet.add('database');
      }

      // System commands
      if (name.includes('exec') || name.includes('run') || name.includes('shell')) {
        permissionSet.add('system');
      }

      // Personal data
      if (name.includes('user') || name.includes('profile') || name.includes('personal')) {
        permissionSet.add('personal');
      }
    });

    // Convert to permission objects
    if (permissionSet.has('filesystem')) {
      permissions.push({
        id: 'filesystem',
        name: 'File System Access',
        description: 'Read and write files on your local system',
        icon: FileText,
        category: 'system',
        risk: 'high',
        enabled: false,
      });
    }

    if (permissionSet.has('network')) {
      permissions.push({
        id: 'network',
        name: 'Network Requests',
        description: 'Make HTTP requests to external services',
        icon: Globe,
        category: 'network',
        risk: 'medium',
        enabled: true,
      });
    }

    if (permissionSet.has('database')) {
      permissions.push({
        id: 'database',
        name: 'Database Access',
        description: 'Query and modify database records',
        icon: Database,
        category: 'data',
        risk: 'high',
        enabled: false,
      });
    }

    if (permissionSet.has('system')) {
      permissions.push({
        id: 'system',
        name: 'System Commands',
        description: 'Execute system commands and scripts',
        icon: Terminal,
        category: 'system',
        risk: 'high',
        enabled: false,
      });
    }

    if (permissionSet.has('personal')) {
      permissions.push({
        id: 'personal',
        name: 'Personal Data',
        description: 'Access user profile and personal information',
        icon: User,
        category: 'personal',
        risk: 'medium',
        enabled: false,
      });
    }

    return permissions;
  };

  const connectionPermissions =
    permissions[connection.id] || analyzeToolPermissions(connection.tools);

  const togglePermission = (permissionId: string) => {
    const updated = connectionPermissions.map(p =>
      p.id === permissionId ? { ...p, enabled: !p.enabled } : p,
    );

    setPermissions(prev => ({
      ...prev,
      [connection.id]: updated,
    }));

    onPermissionChange(connection.id, updated);
  };

  const categories = [
    { id: 'system', name: 'System', icon: Terminal, color: 'text-orange-500' },
    { id: 'network', name: 'Network', icon: Globe, color: 'text-blue-500' },
    { id: 'data', name: 'Data', icon: Database, color: 'text-purple-500' },
    { id: 'personal', name: 'Personal', icon: User, color: 'text-green-500' },
  ];

  // getRiskColor moved to file level

  const enabledCount = connectionPermissions.filter(p => p.enabled).length;
  const highRiskEnabled = connectionPermissions.filter(p => p.enabled && p.risk === 'high').length;

  return (
    <div className={cx('space-y-4', className)}>
      {/* Summary Card */}
      <div className="rounded-lg border bg-muted/30 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Permissions</h3>
          </div>
          <Button size="sm" variant="ghost" onClick={toggleDetails}>
            {showDetails ? 'Hide' : 'Manage'}
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Active Permissions</span>
            <span className="font-medium">
              {enabledCount} of {connectionPermissions.length}
            </span>
          </div>

          {highRiskEnabled > 0 && (
            <div className="flex items-center gap-2 rounded bg-red-500/10 p-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span>
                {highRiskEnabled} high-risk permission{highRiskEnabled > 1 ? 's' : ''} enabled
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Permissions */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            {/* Category Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={cx(
                  'rounded-lg px-3 py-1.5 text-sm transition-colors',
                  !selectedCategory
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80',
                )}
              >
                All
              </button>
              {categories.map(category => {
                const Icon = category.icon;
                const count = connectionPermissions.filter(p => p.category === category.id).length;

                if (count === 0) return null;

                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={cx(
                      'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors',
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

            {/* Permission List */}
            <div className="space-y-2">
              {connectionPermissions
                .filter(p => !selectedCategory || p.category === selectedCategory)
                .map(permission => (
                  <PermissionItem
                    key={permission.id}
                    permission={permission}
                    onToggle={() => togglePermission(permission.id)}
                  />
                ))}
            </div>

            {/* Security Tips */}
            <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
              <div className="flex items-start gap-2">
                <Info className="mt-0.5 h-4 w-4 text-blue-500" />
                <div className="space-y-1 text-sm">
                  <p className="font-medium">Security Tips</p>
                  <ul className="space-y-0.5 text-muted-foreground">
                    <li>• Only enable permissions you understand and trust</li>
                    <li>• High-risk permissions can access sensitive data</li>
                    <li>• Review permissions regularly and disable unused ones</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Permission Item Component
function PermissionItem({
  permission,
  onToggle,
}: {
  permission: Permission;
  onToggle: () => void;
}) {
  const [_showInfo, { toggle: _toggleInfo }] = useDisclosure();
  const Icon = permission.icon;

  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-start gap-3">
        <div
          className={cx('mt-0.5 rounded-lg p-2', permission.enabled ? 'bg-primary/10' : 'bg-muted')}
        >
          <Icon
            className={cx('h-4 w-4', permission.enabled ? 'text-primary' : 'text-muted-foreground')}
          />
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium">{permission.name}</h4>
              <span
                className={cx(
                  'rounded-full px-1.5 py-0.5 text-xs',
                  getRiskColor(permission.risk),
                  permission.risk === 'high'
                    ? 'bg-red-500/10'
                    : permission.risk === 'medium'
                      ? 'bg-yellow-500/10'
                      : 'bg-green-500/10',
                )}
              >
                {permission.risk} risk
              </span>
            </div>

            <button
              onClick={onToggle}
              className={cx(
                'relative h-5 w-10 rounded-full transition-colors',
                permission.enabled ? 'bg-primary' : 'bg-muted',
              )}
            >
              <motion.div
                animate={{ x: permission.enabled ? 20 : 0 }}
                className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-background"
              />
            </button>
          </div>

          <p className="text-xs text-muted-foreground">{permission.description}</p>

          {permission.risk === 'high' && permission.enabled && (
            <div className="mt-1 flex items-center gap-1.5 text-xs text-yellow-500">
              <AlertTriangle className="h-3 w-3" />
              <span>This permission has elevated access</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Permission Request Modal
export function PermissionRequestModal({
  connection,
  requiredPermissions,
  onApprove,
  onDeny,
}: {
  connection: MCPConnection;
  requiredPermissions: Permission[];
  onApprove: () => void;
  onDeny: () => void;
}) {
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
        className="w-full max-w-md rounded-lg border bg-background p-6 shadow-lg"
      >
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-yellow-500/10 p-3">
            <Shield className="h-6 w-6 text-yellow-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Permission Request</h3>
            <p className="text-sm text-muted-foreground">{connection.name}</p>
          </div>
        </div>

        {/* Message */}
        <p className="mb-4 text-sm">This connection is requesting the following permissions:</p>

        {/* Permissions List */}
        <div className="mb-6 space-y-2">
          {requiredPermissions.map(permission => {
            const Icon = permission.icon;
            return (
              <div
                key={permission.id}
                className="flex items-start gap-3 rounded-lg bg-muted/50 p-3"
              >
                <Icon className={cx('mt-0.5 h-4 w-4', getRiskColor(permission.risk))} />
                <div className="flex-1">
                  <h5 className="text-sm font-medium">{permission.name}</h5>
                  <p className="mt-0.5 text-xs text-muted-foreground">{permission.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={onDeny} className="flex-1">
            Deny
          </Button>
          <Button onClick={onApprove} className="flex-1">
            <CheckCircle className="mr-2 h-4 w-4" />
            Approve
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );

  // getRiskColor function removed (now at file level)
}
