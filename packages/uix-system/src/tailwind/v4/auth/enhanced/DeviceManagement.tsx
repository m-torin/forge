/**
 * Tailwind v4 RSC Device Management
 * 100% React Server Component for managing user devices and sessions
 */

import { useFormState } from 'react-dom';
import type { BaseProps, FormState } from '../types';
import { createInitialActionState } from '../types';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';

import { revokeAllDevicesAction, revokeDeviceAction, updateDeviceTrustAction } from './actions';

interface Device {
  id: string;
  name: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  os: string;
  browser: string;
  ipAddress: string;
  location?: string;
  isCurrent: boolean;
  lastActive: string;
  createdAt: string;
  trusted: boolean;
  sessionCount: number;
}

interface DeviceManagementProps extends BaseProps {
  devices: Device[];
  currentDeviceId: string;
  title?: string;
  subtitle?: string;
  showTrustOptions?: boolean;
  onDeviceRevoked?: (deviceId: string) => void;
  onDeviceTrusted?: (deviceId: string, trusted: boolean) => void;
}

const _initialState: FormState = { success: false };

export function DeviceManagement({
  devices,
  currentDeviceId,
  title = 'Device Management',
  subtitle = 'Manage devices that have access to your account',
  showTrustOptions = true,
  onDeviceRevoked: _onDeviceRevoked,
  onDeviceTrusted: _onDeviceTrusted,
  className = '',
}: DeviceManagementProps) {
  const [revokeState, revokeAction] = useFormState(revokeDeviceAction, createInitialActionState());
  const [trustState, trustAction] = useFormState(
    updateDeviceTrustAction,
    createInitialActionState(),
  );
  const [revokeAllState, revokeAllAction] = useFormState(
    revokeAllDevicesAction,
    createInitialActionState(),
  );

  const getDeviceIcon = (deviceType: Device['deviceType']) => {
    switch (deviceType) {
      case 'desktop':
        return (
          <svg
            className="h-6 w-6 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        );
      case 'mobile':
        return (
          <svg
            className="h-6 w-6 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 18h.01M8 21h8a1 1 0 001-1V4a1 1 0 00-1-1H8a1 1 0 00-1 1v16a1 1 0 001 1z"
            />
          </svg>
        );
      case 'tablet':
        return (
          <svg
            className="h-6 w-6 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="h-6 w-6 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
            />
          </svg>
        );
    }
  };

  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const otherDevices = devices.filter(device => !device.isCurrent);

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-6 w-6 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-gray-600">{subtitle}</p>}
      </div>

      {(revokeState?.error || trustState?.error || revokeAllState?.error) && (
        <Alert variant="destructive">
          {revokeState?.error || trustState?.error || revokeAllState?.error}
        </Alert>
      )}

      {(revokeState?.success || trustState?.success || revokeAllState?.success) && (
        <Alert variant="success">
          {revokeState?.message || trustState?.message || revokeAllState?.message}
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Current Device</h2>
            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
              Active Now
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {(() => {
            const currentDevice = devices.find(device => device.isCurrent);
            if (!currentDevice) return <p className="text-gray-500">Current device not found</p>;

            return (
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">{getDeviceIcon(currentDevice.deviceType)}</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-medium text-gray-900">{currentDevice.name}</h3>
                    {currentDevice.trusted && showTrustOptions && (
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                        Trusted
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    <p>
                      {currentDevice.os} • {currentDevice.browser}
                    </p>
                    <p>IP: {currentDevice.ipAddress}</p>
                    {currentDevice.location && <p>Location: {currentDevice.location}</p>}
                    <p className="text-xs text-gray-500">
                      {currentDevice.sessionCount} active session
                      {currentDevice.sessionCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">
              Other Devices ({otherDevices.length})
            </h2>
            {otherDevices.length > 0 && (
              <form action={revokeAllAction}>
                <input type="hidden" name="currentDeviceId" value={currentDeviceId} />
                <Button
                  type="submit"
                  variant="destructive"
                  size="sm"
                  disabled={revokeAllState === undefined}
                  onClick={() => {
                    if (!confirm('This will sign out all other devices. Are you sure?')) {
                      return;
                    }
                  }}
                >
                  Sign Out All Others
                </Button>
              </form>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {otherDevices.length === 0 ? (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 h-12 w-12 text-gray-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-gray-900">No Other Devices</h3>
              <p className="mt-1 text-sm text-gray-500">You're only signed in on this device</p>
            </div>
          ) : (
            <div className="space-y-4">
              {otherDevices.map(device => (
                <div
                  key={device.id}
                  className="flex items-start justify-between rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">{getDeviceIcon(device.deviceType)}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-medium text-gray-900">{device.name}</h3>
                        {device.trusted && showTrustOptions && (
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                            Trusted
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        <p>
                          {device.os} • {device.browser}
                        </p>
                        <p>IP: {device.ipAddress}</p>
                        {device.location && <p>Location: {device.location}</p>}
                        <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                          <span>Last active: {formatLastActive(device.lastActive)}</span>
                          <span>
                            {device.sessionCount} session{device.sessionCount !== 1 ? 's' : ''}
                          </span>
                          <span>Added: {new Date(device.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {showTrustOptions && (
                      <form action={trustAction} className="inline">
                        <input type="hidden" name="deviceId" value={device.id} />
                        <input type="hidden" name="trusted" value={(!device.trusted).toString()} />
                        <Button
                          type="submit"
                          variant="outline"
                          size="sm"
                          disabled={trustState === undefined}
                        >
                          {device.trusted ? 'Untrust' : 'Trust'}
                        </Button>
                      </form>
                    )}

                    <form action={revokeAction} className="inline">
                      <input type="hidden" name="deviceId" value={device.id} />
                      <Button
                        type="submit"
                        variant="destructive"
                        size="sm"
                        disabled={revokeState === undefined}
                        onClick={() => {
                          if (!confirm(`Sign out device "${device.name}"?`)) {
                            return;
                          }
                        }}
                      >
                        Sign Out
                      </Button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
              <h4 className="mb-2 font-medium">Device Security Tips</h4>
              <ul className="list-inside list-disc space-y-1">
                <li>Review your devices regularly and sign out unused ones</li>
                <li>Mark frequently used devices as trusted to reduce security prompts</li>
                <li>If you see an unfamiliar device, sign it out immediately</li>
                <li>Use "Sign Out All Others" if you suspect unauthorized access</li>
                <li>Devices are automatically signed out after extended inactivity</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
