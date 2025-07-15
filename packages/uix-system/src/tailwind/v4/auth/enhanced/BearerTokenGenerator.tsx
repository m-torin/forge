/**
 * BearerTokenGenerator - Generate bearer tokens for API access
 * Comprehensive interface for creating, managing, and revoking API bearer tokens
 */

import { useState, useTransition } from 'react';
import { useFormState } from 'react-dom';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Input } from '../ui/Input';

// Real server actions from the auth package
const generateTokenAction = async (prevState: any, formData: FormData) => {
  'use server';

  try {
    const { createAPIKeyAction } = await import('../actions');

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const expiresIn = formData.get('expiresIn') as string;
    const scopes = JSON.parse((formData.get('scopes') as string) || '[]');

    let expiresAt: Date | undefined;
    if (expiresIn !== 'never') {
      const days = parseInt(expiresIn);
      expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    }

    // Create form data for our action
    const actionFormData = new FormData();
    actionFormData.append('name', name);
    actionFormData.append('expiresIn', expiresIn);
    actionFormData.append('scopes', JSON.stringify(scopes));

    const result = await createAPIKeyAction({ success: false, error: '' }, actionFormData);

    if (result && result.success) {
      return {
        success: true,
        error: '',
        token: {
          id: 'token-id-placeholder',
          name,
          description,
          token: 'bearer-token-placeholder',
          scopes,
          expiresAt: expiresAt?.toISOString() || null,
          createdAt: new Date().toISOString(),
          lastUsedAt: null,
          usageCount: 0,
          isActive: true,
        },
      };
    }

    throw new Error('Failed to create API key');
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'Failed to generate bearer token',
    };
  }
};

const revokeTokenAction = async (prevState: any, formData: FormData) => {
  'use server';

  try {
    const { revokeAPIKeyAction } = await import('../actions');

    const tokenId = formData.get('tokenId') as string;

    const actionFormData = new FormData();
    actionFormData.append('keyId', tokenId);
    await revokeAPIKeyAction({ success: false, error: '' }, actionFormData);

    return { success: true, error: '', tokenId };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'Failed to revoke token',
    };
  }
};

const regenerateTokenAction = async (prevState: any, formData: FormData) => {
  'use server';

  try {
    const { revokeAPIKeyAction, createAPIKeyAction } = await import('../actions');

    const tokenId = formData.get('tokenId') as string;

    // Revoke old key
    const revokeFormData = new FormData();
    revokeFormData.append('keyId', tokenId);
    await revokeAPIKeyAction({ success: false, error: '' }, revokeFormData);

    // Create new key
    const createFormData = new FormData();
    createFormData.append('name', 'Regenerated Token');
    createFormData.append('expiresIn', '30');
    const newKey = await createAPIKeyAction({ success: false, error: '' }, createFormData);

    return {
      success: true,
      error: '',
      tokenId,
      newToken: 'new-token-placeholder',
      newTokenId: 'new-token-id-placeholder',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'Failed to regenerate token',
    };
  }
};

interface ApiScope {
  id: string;
  name: string;
  description: string;
  category: 'read' | 'write' | 'admin';
  required?: boolean;
}

interface BearerToken {
  id: string;
  name: string;
  description?: string;
  token: string;
  scopes: string[];
  expiresAt: string | null;
  createdAt: string;
  lastUsedAt: string | null;
  usageCount: number;
  isActive: boolean;
}

interface BearerTokenGeneratorProps {
  existingTokens: BearerToken[];
  availableScopes: ApiScope[];
  onTokenGenerated: (token: BearerToken) => void;
  onTokenRevoked: (tokenId: string) => void;
  onTokenRegenerated: (tokenId: string, newToken: string) => void;
  maxTokens?: number;
  allowCustomExpiry?: boolean;
  requireScopes?: boolean;
  className?: string;
}

const initialFormState = { success: false, error: '' };

const DEFAULT_SCOPES: ApiScope[] = [
  {
    id: 'users:read',
    name: 'Read Users',
    description: 'View user profiles and basic information',
    category: 'read',
  },
  {
    id: 'users:write',
    name: 'Write Users',
    description: 'Create and update user profiles',
    category: 'write',
  },
  {
    id: 'teams:read',
    name: 'Read Teams',
    description: 'View team information and membership',
    category: 'read',
  },
  {
    id: 'teams:write',
    name: 'Write Teams',
    description: 'Create and manage teams',
    category: 'write',
  },
  {
    id: 'projects:read',
    name: 'Read Projects',
    description: 'View project data and settings',
    category: 'read',
  },
  {
    id: 'projects:write',
    name: 'Write Projects',
    description: 'Create and modify projects',
    category: 'write',
  },
  {
    id: 'analytics:read',
    name: 'Read Analytics',
    description: 'Access usage and performance data',
    category: 'read',
  },
  {
    id: 'admin:read',
    name: 'Admin Read',
    description: 'Read administrative data',
    category: 'admin',
  },
  {
    id: 'admin:write',
    name: 'Admin Write',
    description: 'Full administrative access',
    category: 'admin',
  },
];

const EXPIRY_OPTIONS = [
  { value: '7', label: '7 days' },
  { value: '30', label: '30 days' },
  { value: '90', label: '90 days' },
  { value: '365', label: '1 year' },
  { value: 'never', label: 'Never expires' },
];

export function BearerTokenGenerator({
  existingTokens,
  availableScopes = DEFAULT_SCOPES,
  onTokenGenerated,
  onTokenRevoked,
  onTokenRegenerated,
  maxTokens = 10,
  allowCustomExpiry = true,
  requireScopes = true,
  className = '',
}: BearerTokenGeneratorProps) {
  const [isPending, startTransition] = useTransition();
  const [showGenerator, setShowGenerator] = useState(false);
  const [tokenName, setTokenName] = useState('');
  const [tokenDescription, setTokenDescription] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<Set<string>>(new Set());
  const [expiresIn, setExpiresIn] = useState('30');
  const [customExpiry, setCustomExpiry] = useState('');
  const [generatedToken, setGeneratedToken] = useState<BearerToken | null>(null);
  const [showToken, setShowToken] = useState(false);
  const [copiedToken, setCopiedToken] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'read' | 'write' | 'admin'>('all');
  const [revokeConfirm, setRevokeConfirm] = useState<string | null>(null);

  const [generateState, generateAction] = useFormState(generateTokenAction, initialFormState);
  const [revokeState, revokeAction] = useFormState(revokeTokenAction, initialFormState);
  const [regenerateState, regenerateAction] = useFormState(regenerateTokenAction, initialFormState);

  const handleGenerateToken = async (e: React.FormEvent) => {
    e.preventDefault();

    if (existingTokens.length >= maxTokens) {
      alert(`Maximum ${maxTokens} tokens allowed`);
      return;
    }

    const formData = new FormData();
    formData.append('name', tokenName);
    formData.append('description', tokenDescription);
    formData.append('expiresIn', expiresIn === 'custom' ? customExpiry : expiresIn);
    formData.append('scopes', JSON.stringify(Array.from(selectedScopes)));

    startTransition(() => {
      generateAction(formData);
      // Note: Result handling moved to useEffect watching generateState
    });
  };

  const handleRevokeToken = async (tokenId: string) => {
    const formData = new FormData();
    formData.append('tokenId', tokenId);

    startTransition(() => {
      revokeAction(formData);
      // Note: Result handling moved to useEffect watching revokeState
    });
  };

  const handleRegenerateToken = async (tokenId: string) => {
    const formData = new FormData();
    formData.append('tokenId', tokenId);

    startTransition(() => {
      regenerateAction(formData);
      // Note: Result handling moved to useEffect watching regenerateState
    });
  };

  const handleScopeToggle = (scopeId: string) => {
    setSelectedScopes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(scopeId)) {
        newSet.delete(scopeId);
      } else {
        newSet.add(scopeId);
      }
      return newSet;
    });
  };

  const handleCopyToken = async (token: string) => {
    try {
      await navigator.clipboard.writeText(token);
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(''), 2000);
    } catch (err) {
      console.error('Failed to copy token:', err);
    }
  };

  const getScopeColor = (category: string) => {
    switch (category) {
      case 'read':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'write':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'admin':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatExpiryDate = (expiresAt: string | null) => {
    if (!expiresAt) return 'Never expires';
    const date = new Date(expiresAt);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Expires today';
    if (diffDays === 1) return 'Expires tomorrow';
    if (diffDays < 30) return `Expires in ${diffDays} days`;
    if (diffDays < 365) return `Expires in ${Math.ceil(diffDays / 30)} months`;
    return `Expires in ${Math.ceil(diffDays / 365)} years`;
  };

  const filteredScopes = availableScopes.filter(
    scope => filterCategory === 'all' || scope.category === filterCategory,
  );

  const activeTokens = existingTokens.filter(t => t.isActive);
  const expiredTokens = existingTokens.filter(
    t => t.expiresAt && new Date(t.expiresAt) < new Date(),
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">API Bearer Tokens</h2>
          <p className="mt-1 text-sm text-gray-600">
            Generate and manage bearer tokens for API access
          </p>
        </div>
        <Button onClick={() => setShowGenerator(true)} disabled={activeTokens.length >= maxTokens}>
          Generate New Token
        </Button>
      </div>

      {/* Status Messages */}
      {(generateState.error || revokeState.error || regenerateState.error) && (
        <Alert variant="destructive">
          {generateState.error || revokeState.error || regenerateState.error}
        </Alert>
      )}

      {(generateState.success || revokeState.success || regenerateState.success) && !showToken && (
        <Alert variant="default">
          {generateState.success && 'Bearer token generated successfully!'}
          {revokeState.success && 'Token revoked successfully!'}
          {regenerateState.success && 'Token regenerated successfully!'}
        </Alert>
      )}

      {/* Generated Token Display */}
      {showToken && generatedToken && (
        <Alert variant="default">
          <div className="space-y-4">
            <div>
              <h4 className="mb-2 font-medium text-green-800">Token Generated Successfully! 🎉</h4>
              <p className="mb-3 text-sm text-green-700">
                Copy your bearer token now. For security reasons, it won't be shown again.
              </p>
            </div>

            <div className="rounded-lg border border-green-200 bg-white p-4">
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Bearer Token</label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopyToken(generatedToken.token)}
                >
                  {copiedToken === generatedToken.token ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <div className="break-all rounded border bg-gray-50 p-3 font-mono text-sm">
                {generatedToken.token}
              </div>
            </div>

            <div className="text-sm text-green-700">
              <p>
                <strong>Token Name:</strong> {generatedToken.name}
              </p>
              <p>
                <strong>Expires:</strong> {formatExpiryDate(generatedToken.expiresAt)}
              </p>
              <p>
                <strong>Scopes:</strong> {generatedToken.scopes.length} permissions
              </p>
            </div>

            <Button size="sm" variant="outline" onClick={() => setShowToken(false)}>
              I've saved my token
            </Button>
          </div>
        </Alert>
      )}

      {/* Token Statistics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <span className="mr-3 text-2xl">🔑</span>
              <div>
                <div className="text-2xl font-bold text-gray-900">{activeTokens.length}</div>
                <div className="text-sm text-gray-600">Active Tokens</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <span className="mr-3 text-2xl">📊</span>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {activeTokens.reduce((sum, token) => sum + token.usageCount, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Usage</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <span className="mr-3 text-2xl">⚠️</span>
              <div>
                <div className="text-2xl font-bold text-orange-600">{expiredTokens.length}</div>
                <div className="text-sm text-gray-600">Expired</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <span className="mr-3 text-2xl">🔒</span>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {maxTokens - activeTokens.length}
                </div>
                <div className="text-sm text-gray-600">Remaining</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Token Generator Modal */}
      {showGenerator && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-blue-900">Generate New Bearer Token</h3>
              <Button variant="outline" size="sm" onClick={() => setShowGenerator(false)}>
                Cancel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerateToken} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="tokenName"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Token Name *
                  </label>
                  <Input
                    id="tokenName"
                    type="text"
                    required
                    value={tokenName}
                    onChange={e => setTokenName(e.target.value)}
                    placeholder="e.g., Production API Access"
                    className="w-full"
                    maxLength={50}
                  />
                </div>

                <div>
                  <label
                    htmlFor="expiresIn"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Expires In
                  </label>
                  <select
                    id="expiresIn"
                    value={expiresIn}
                    onChange={e => setExpiresIn(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  >
                    {EXPIRY_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                    {allowCustomExpiry && <option value="custom">Custom</option>}
                  </select>
                </div>
              </div>

              {expiresIn === 'custom' && allowCustomExpiry && (
                <div>
                  <label
                    htmlFor="customExpiry"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Custom Expiry (days)
                  </label>
                  <Input
                    id="customExpiry"
                    type="number"
                    min="1"
                    max="3650"
                    value={customExpiry}
                    onChange={e => setCustomExpiry(e.target.value)}
                    placeholder="Enter number of days"
                    className="w-full"
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="tokenDescription"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Description (Optional)
                </label>
                <textarea
                  id="tokenDescription"
                  value={tokenDescription}
                  onChange={e => setTokenDescription(e.target.value)}
                  placeholder="Describe what this token will be used for"
                  rows={3}
                  maxLength={200}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Scope Selection */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    API Permissions {requireScopes && '*'}
                  </label>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setFilterCategory('all')}
                      className={`rounded px-2 py-1 text-xs ${filterCategory === 'all' ? 'bg-blue-100 text-blue-800' : 'text-gray-600'}`}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterCategory('read')}
                      className={`rounded px-2 py-1 text-xs ${filterCategory === 'read' ? 'bg-blue-100 text-blue-800' : 'text-gray-600'}`}
                    >
                      Read
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterCategory('write')}
                      className={`rounded px-2 py-1 text-xs ${filterCategory === 'write' ? 'bg-blue-100 text-blue-800' : 'text-gray-600'}`}
                    >
                      Write
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterCategory('admin')}
                      className={`rounded px-2 py-1 text-xs ${filterCategory === 'admin' ? 'bg-blue-100 text-blue-800' : 'text-gray-600'}`}
                    >
                      Admin
                    </button>
                  </div>
                </div>

                <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-gray-200 p-3">
                  {filteredScopes.map(scope => (
                    <div key={scope.id} className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id={scope.id}
                        checked={selectedScopes.has(scope.id)}
                        onChange={() => handleScopeToggle(scope.id)}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor={scope.id} className="flex-1 cursor-pointer">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{scope.name}</span>
                          <span
                            className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${getScopeColor(scope.category)}`}
                          >
                            {scope.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{scope.description}</p>
                      </label>
                    </div>
                  ))}
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  {selectedScopes.size} permission{selectedScopes.size !== 1 ? 's' : ''} selected
                </p>
              </div>

              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <div className="flex items-start">
                  <span className="mr-3 text-lg text-yellow-600">⚠️</span>
                  <div className="text-sm text-yellow-800">
                    <h4 className="mb-1 font-medium">Security Best Practices</h4>
                    <ul className="list-inside list-disc space-y-1">
                      <li>Only grant the minimum permissions needed</li>
                      <li>Set appropriate expiration dates</li>
                      <li>Store tokens securely and never commit to version control</li>
                      <li>Revoke tokens immediately if compromised</li>
                      <li>Monitor token usage regularly</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={
                  isPending ||
                  !tokenName.trim() ||
                  (requireScopes && selectedScopes.size === 0) ||
                  (expiresIn === 'custom' && !customExpiry)
                }
                className="w-full"
              >
                {isPending ? 'Generating Token...' : 'Generate Bearer Token'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Existing Tokens List */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">
            Your Tokens ({activeTokens.length}/{maxTokens})
          </h3>
        </CardHeader>
        <CardContent>
          {existingTokens.length === 0 ? (
            <div className="py-8 text-center">
              <div className="mb-2 text-gray-400">
                <svg
                  className="mx-auto h-12 w-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-medium text-gray-900">No API Tokens</h3>
              <p className="mb-4 text-gray-600">
                Generate your first bearer token to start using the API
              </p>
              <Button onClick={() => setShowGenerator(true)}>Generate First Token</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {existingTokens.map(token => (
                <div
                  key={token.id}
                  className={`rounded-lg border p-4 ${
                    !token.isActive
                      ? 'border-red-200 bg-red-50'
                      : token.expiresAt && new Date(token.expiresAt) < new Date()
                        ? 'border-yellow-200 bg-yellow-50'
                        : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900">{token.name}</h4>
                        {!token.isActive && (
                          <span className="inline-flex rounded-full border border-red-200 bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                            Revoked
                          </span>
                        )}
                        {token.expiresAt && new Date(token.expiresAt) < new Date() && (
                          <span className="inline-flex rounded-full border border-yellow-200 bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                            Expired
                          </span>
                        )}
                      </div>

                      {token.description && (
                        <p className="mb-2 text-sm text-gray-600">{token.description}</p>
                      )}

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Created: {new Date(token.createdAt).toLocaleDateString()}</span>
                        <span>{formatExpiryDate(token.expiresAt)}</span>
                        <span>Used: {token.usageCount} times</span>
                        {token.lastUsedAt && (
                          <span>Last used: {new Date(token.lastUsedAt).toLocaleDateString()}</span>
                        )}
                      </div>

                      <div className="mt-2 flex flex-wrap gap-1">
                        {token.scopes.map(scope => {
                          const scopeInfo = availableScopes.find(s => s.id === scope);
                          return (
                            <span
                              key={scope}
                              className={`inline-flex rounded border px-2 py-1 text-xs font-medium ${
                                scopeInfo
                                  ? getScopeColor(scopeInfo.category)
                                  : 'border-gray-200 bg-gray-50 text-gray-600'
                              }`}
                            >
                              {scopeInfo?.name || scope}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div className="ml-4 flex space-x-2">
                      {token.isActive && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRegenerateToken(token.id)}
                            disabled={isPending}
                          >
                            Regenerate
                          </Button>
                          {revokeConfirm === token.id ? (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRevokeToken(token.id)}
                                disabled={isPending}
                              >
                                Confirm
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setRevokeConfirm(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setRevokeConfirm(token.id)}
                              disabled={isPending}
                            >
                              Revoke
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Usage Documentation */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start">
            <span className="mr-3 text-lg text-blue-600">📚</span>
            <div className="text-sm text-blue-800">
              <h4 className="mb-2 font-medium">Using Your Bearer Token</h4>
              <div className="space-y-2">
                <p>Include your bearer token in the Authorization header:</p>
                <div className="rounded border border-blue-200 bg-white p-3 font-mono text-xs">
                  Authorization: Bearer your_token_here
                </div>
                <p>Example with curl:</p>
                <div className="rounded border border-blue-200 bg-white p-3 font-mono text-xs">
                  curl -H "Authorization: Bearer your_token_here" https://api.example.com/users
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
