/**
 * Tailwind v4 RSC Backup Codes Manager
 * 100% React Server Component for managing 2FA backup codes
 */

import { useFormState } from 'react-dom';
import type { BaseProps, FormState } from '../types';
import { createInitialActionState } from '../types';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';

import {
  downloadBackupCodesAction,
  generateBackupCodesAction,
  revokeBackupCodesAction,
} from './actions';

interface BackupCode {
  id: string;
  code: string;
  used: boolean;
  usedAt?: string;
  usedFromIp?: string;
}

interface BackupCodesManagerProps extends BaseProps {
  backupCodes: BackupCode[];
  twoFactorEnabled: boolean;
  title?: string;
  subtitle?: string;
  onCodesGenerated?: (codes: BackupCode[]) => void;
  onCodeUsed?: (codeId: string) => void;
}

const _initialState: FormState = { success: false };

export function BackupCodesManager({
  backupCodes,
  twoFactorEnabled,
  title = 'Backup Codes',
  subtitle = 'Manage your two-factor authentication backup codes',
  onCodesGenerated: _onCodesGenerated,
  onCodeUsed: _onCodeUsed,
  className = '',
}: BackupCodesManagerProps) {
  const [generateState, generateAction] = useFormState(
    generateBackupCodesAction,
    createInitialActionState(),
  );
  const [downloadState, _downloadAction] = useFormState(
    downloadBackupCodesAction,
    createInitialActionState(),
  );
  const [revokeState, revokeAction] = useFormState(
    revokeBackupCodesAction,
    createInitialActionState(),
  );

  const unusedCodes = backupCodes.filter(code => !code.used);
  const usedCodes = backupCodes.filter(code => code.used);

  const handleDownload = () => {
    if (backupCodes.length === 0) return;

    const codesText = backupCodes
      .filter(code => !code.used)
      .map(code => code.code)
      .join('\n');

    const blob = new Blob(
      [
        `Your Two-Factor Authentication Backup Codes
`,
        `Generated: ${new Date().toLocaleString()}
`,
        `
`,
        `Keep these codes safe and secure!
`,
        `Each code can only be used once.
`,
        `
`,
        `Backup Codes:
`,
        codesText,
        '\n',
        `
`,
        `If you lose access to your authenticator app, you can use these codes to sign in.
`,
        `After using a code, it will no longer be valid.
`,
      ],
      { type: 'text/plain' },
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-codes-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!twoFactorEnabled) {
    return (
      <Card className={`mx-auto w-full max-w-2xl ${className}`}>
        <CardContent className="p-8 text-center">
          <div className="mx-auto mb-4 h-12 w-12 text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            Two-Factor Authentication Not Enabled
          </h3>
          <p className="mb-4 text-gray-600">
            Backup codes are only available when two-factor authentication is enabled on your
            account.
          </p>
          <Button variant="primary">Enable Two-Factor Authentication</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
          <svg
            className="h-6 w-6 text-yellow-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 5.25a3 3 0 0 1 3 3m0 0a3 3 0 0 1-3 3H12M6.75 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 0H8.25m2.25 0H12m0 0h2.25M12 13.5V9m0 0a3 3 0 1 1 6 0c0 .75-.274 1.433-.722 1.957L12 13.5Z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-gray-600">{subtitle}</p>}
      </div>

      {(generateState?.error || downloadState?.error || revokeState?.error) && (
        <Alert variant="destructive">
          {generateState?.error || downloadState?.error || revokeState?.error}
        </Alert>
      )}

      {(generateState?.success || downloadState?.success || revokeState?.success) && (
        <Alert variant="success">
          {generateState?.message || downloadState?.message || revokeState?.message}
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Backup Codes Status</h2>
            <div className="flex items-center space-x-2">
              <span
                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                  unusedCodes.length > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {unusedCodes.length} unused
              </span>
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                {usedCodes.length} used
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{backupCodes.length}</div>
              <div className="text-sm text-gray-600">Total Codes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{unusedCodes.length}</div>
              <div className="text-sm text-gray-600">Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{usedCodes.length}</div>
              <div className="text-sm text-gray-600">Used</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <form action={generateAction} className="inline">
              <div className="mb-2 flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="confirmRegenerate"
                  name="confirmRegenerate"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="confirmRegenerate" className="text-sm text-gray-700">
                  I understand this will invalidate all existing codes
                </label>
              </div>
              <Button type="submit" variant="primary" disabled={generateState === undefined}>
                {generateState === undefined ? 'Generating...' : 'Generate New Codes'}
              </Button>
            </form>

            {unusedCodes.length > 0 && (
              <Button variant="outline" onClick={handleDownload}>
                Download Codes
              </Button>
            )}

            {backupCodes.length > 0 && (
              <form action={revokeAction} className="inline">
                <div className="mb-2 flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="confirmRevoke"
                    name="confirmRevoke"
                    className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <label htmlFor="confirmRevoke" className="text-sm text-gray-700">
                    I want to revoke all backup codes
                  </label>
                </div>
                <Button type="submit" variant="destructive" disabled={revokeState === undefined}>
                  {revokeState === undefined ? 'Revoking...' : 'Revoke All Codes'}
                </Button>
              </form>
            )}
          </div>
        </CardContent>
      </Card>

      {backupCodes.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          {unusedCodes.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900">Available Codes</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {unusedCodes.map(code => (
                    <div
                      key={code.id}
                      className="flex items-center justify-between rounded-lg border bg-gray-50 p-3"
                    >
                      <code className="select-all font-mono text-sm text-gray-900">
                        {code.code}
                      </code>
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                        Available
                      </span>
                    </div>
                  ))}
                </div>
                {unusedCodes.length <= 2 && (
                  <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                    <div className="flex items-start">
                      <svg
                        className="mr-2 mt-0.5 h-5 w-5 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div className="text-sm text-yellow-800">
                        <p className="font-medium">Low backup codes</p>
                        <p>Consider generating new codes before you run out.</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {usedCodes.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900">Used Codes</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {usedCodes.map(code => (
                    <div
                      key={code.id}
                      className="flex items-center justify-between rounded-lg border bg-gray-50 p-3 opacity-60"
                    >
                      <code className="font-mono text-sm text-gray-500 line-through">
                        {code.code}
                      </code>
                      <div className="text-right">
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                          Used
                        </span>
                        {code.usedAt && (
                          <div className="mt-1 text-xs text-gray-500">
                            {new Date(code.usedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start">
            <svg
              className="mr-3 mt-0.5 h-5 w-5 text-blue-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div className="text-sm text-blue-800">
              <h4 className="mb-2 font-medium">Important Information</h4>
              <ul className="list-inside list-disc space-y-1">
                <li>Each backup code can only be used once</li>
                <li>Save these codes in a secure location (password manager, safe, etc.)</li>
                <li>Use backup codes only when you can't access your authenticator app</li>
                <li>Generate new codes if you're running low or if codes are compromised</li>
                <li>Generating new codes will invalidate all existing codes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
