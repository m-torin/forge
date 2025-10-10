/**
 * MultiSessionDashboard - Advanced session management
 * Comprehensive interface for managing multiple active sessions across devices
 */

import { useState, useTransition } from "react";
import { useFormState } from "react-dom";
import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";
import { Card, CardContent } from "../ui/Card";

// Import server actions from the auth package
import {
  refreshSessionsAction,
  revokeAllOtherSessionsAction,
  revokeSessionAction,
} from "@repo/auth/server-actions";

interface SessionData {
  id: string;
  deviceInfo: {
    name: string;
    type: "desktop" | "mobile" | "tablet" | "unknown";
    os: string;
    browser: string;
    version?: string;
  };
  location: {
    city?: string;
    country?: string;
    ip: string;
  };
  activity: {
    createdAt: string;
    lastActiveAt: string;
    isCurrentSession: boolean;
    status: "active" | "idle" | "expired";
  };
  security: {
    isTrusted: boolean;
    riskLevel: "low" | "medium" | "high";
    loginMethod: string;
    twoFactorUsed?: boolean;
  };
}

interface MultiSessionDashboardProps {
  sessions: SessionData[];
  currentSessionId: string;
  onSessionRevoked: (sessionId: string) => void;
  onAllOtherSessionsRevoked: (count: number) => void;
  onRefresh: () => void;
  allowBulkActions?: boolean;
  showSecurityDetails?: boolean;
  showLocationInfo?: boolean;
  className?: string;
}

const initialFormState = { success: false, error: "" };

export function MultiSessionDashboard({
  sessions,
  currentSessionId,
  onSessionRevoked,
  onAllOtherSessionsRevoked,
  onRefresh,
  allowBulkActions = true,
  showSecurityDetails = true,
  showLocationInfo = true,
  className = "",
}: MultiSessionDashboardProps) {
  const [isPending, _startTransition] = useTransition();
  const [selectedSessions, setSelectedSessions] = useState<Set<string>>(
    new Set(),
  );
  const [sortBy, setSortBy] = useState<
    "lastActive" | "created" | "location" | "device"
  >("lastActive");
  const [filterBy, setFilterBy] = useState<
    "all" | "active" | "idle" | "trusted" | "untrusted"
  >("all");
  const [showRevokeConfirm, setShowRevokeConfirm] = useState<string | null>(
    null,
  );

  const [revokeState, revokeAction] = useFormState(
    revokeSessionAction,
    initialFormState,
  );
  const [revokeAllState, revokeAllAction] = useFormState(
    revokeAllOtherSessionsAction,
    initialFormState,
  );
  const [refreshState, refreshAction] = useFormState(
    refreshSessionsAction,
    initialFormState,
  );

  const handleRevokeSession = (sessionId: string) => {
    const formData = new FormData();
    formData.append("sessionId", sessionId);
    revokeAction(formData);
  };

  // Handle state changes from revokeAction
  if (revokeState.success) {
    onSessionRevoked("revoked-session-id"); // In real implementation, you'd track which session was revoked
    setShowRevokeConfirm(null);
  }

  const handleRevokeAllOther = () => {
    revokeAllAction(new FormData());
  };

  // Handle state changes from revokeAllAction
  if (revokeAllState.success) {
    onAllOtherSessionsRevoked((revokeAllState as any).count || 0);
    setSelectedSessions(new Set());
  }

  const handleRefresh = () => {
    refreshAction(new FormData());
  };

  // Handle state changes from refreshAction
  if (refreshState.success) {
    onRefresh();
  }

  const handleSelectSession = (sessionId: string) => {
    if (sessionId === currentSessionId) return; // Can't select current session

    setSelectedSessions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    const otherSessions = sessions.filter((s) => s.id !== currentSessionId);
    setSelectedSessions(
      selectedSessions.size === otherSessions.length
        ? new Set()
        : new Set(otherSessions.map((s) => s.id)),
    );
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "desktop":
        return "🖥️";
      case "mobile":
        return "📱";
      case "tablet":
        return "📱";
      default:
        return "💻";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-50 border-green-200";
      case "idle":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "expired":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const formatDuration = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return "Just now";
  };

  const filteredAndSortedSessions = sessions
    .filter((session) => {
      switch (filterBy) {
        case "active":
          return session.activity.status === "active";
        case "idle":
          return session.activity.status === "idle";
        case "trusted":
          return session.security.isTrusted;
        case "untrusted":
          return !session.security.isTrusted;
        default:
          return true;
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "lastActive":
          return (
            new Date(b.activity.lastActiveAt).getTime() -
            new Date(a.activity.lastActiveAt).getTime()
          );
        case "created":
          return (
            new Date(b.activity.createdAt).getTime() -
            new Date(a.activity.createdAt).getTime()
          );
        case "location":
          return (a.location.country || "").localeCompare(
            b.location.country || "",
          );
        case "device":
          return a.deviceInfo.name.localeCompare(b.deviceInfo.name);
        default:
          return 0;
      }
    });

  const activeSessions = sessions.filter((s) => s.activity.status === "active");
  const otherSessions = sessions.filter((s) => s.id !== currentSessionId);

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Session Management
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage and monitor all your active sessions across devices
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            disabled={isPending}
            size="sm"
          >
            {isPending ? "Refreshing..." : "🔄 Refresh"}
          </Button>
          {allowBulkActions && otherSessions.length > 0 && (
            <Button
              onClick={handleRevokeAllOther}
              variant="destructive"
              disabled={isPending}
              size="sm"
            >
              {isPending ? "Revoking..." : "Revoke All Others"}
            </Button>
          )}
        </div>
      </div>

      {(revokeState.error || revokeAllState.error || refreshState.error) && (
        <Alert variant="destructive">
          {revokeState.error || revokeAllState.error || refreshState.error}
        </Alert>
      )}

      {(revokeState.success ||
        revokeAllState.success ||
        refreshState.success) && (
        <Alert variant="default">
          {revokeState.success && "Session revoked successfully!"}
          {revokeAllState.success &&
            `${revokeAllState.count || 0} sessions revoked successfully!`}
          {refreshState.success && "Sessions refreshed!"}
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <span className="mr-3 text-2xl">📊</span>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {sessions.length}
                </div>
                <div className="text-sm text-gray-600">Total Sessions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <span className="mr-3 text-2xl">✅</span>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {activeSessions.length}
                </div>
                <div className="text-sm text-gray-600">Active Sessions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <span className="mr-3 text-2xl">🔒</span>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {sessions.filter((s) => s.security.isTrusted).length}
                </div>
                <div className="text-sm text-gray-600">Trusted Sessions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <span className="mr-3 text-2xl">⚠️</span>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {
                    sessions.filter((s) => s.security.riskLevel === "high")
                      .length
                  }
                </div>
                <div className="text-sm text-gray-600">High Risk</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div>
                <label className="mr-2 text-sm font-medium text-gray-700">
                  Sort by:
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="rounded border border-gray-300 px-3 py-1 text-sm"
                >
                  <option value="lastActive">Last Active</option>
                  <option value="created">Created</option>
                  <option value="location">Location</option>
                  <option value="device">Device</option>
                </select>
              </div>

              <div>
                <label className="mr-2 text-sm font-medium text-gray-700">
                  Filter by:
                </label>
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value as any)}
                  className="rounded border border-gray-300 px-3 py-1 text-sm"
                >
                  <option value="all">All Sessions</option>
                  <option value="active">Active Only</option>
                  <option value="idle">Idle Only</option>
                  <option value="trusted">Trusted Only</option>
                  <option value="untrusted">Untrusted Only</option>
                </select>
              </div>
            </div>

            {allowBulkActions && otherSessions.length > 0 && (
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline" onClick={handleSelectAll}>
                  {selectedSessions.size === otherSessions.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>
                {selectedSessions.size > 0 && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      selectedSessions.forEach((sessionId) => {
                        handleRevokeSession(sessionId);
                      });
                    }}
                    disabled={isPending}
                  >
                    Revoke Selected ({selectedSessions.size})
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredAndSortedSessions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
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
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                No Sessions Found
              </h3>
              <p className="text-gray-600">
                Try adjusting your filters or refresh the list
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAndSortedSessions.map((session) => (
            <Card
              key={session.id}
              className={`transition-all ${
                session.activity.isCurrentSession
                  ? "border-blue-300 bg-blue-50"
                  : selectedSessions.has(session.id)
                    ? "border-purple-300 bg-purple-50"
                    : "hover:border-gray-300"
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex flex-1 items-start space-x-4">
                    {allowBulkActions && !session.activity.isCurrentSession && (
                      <div className="pt-1">
                        <input
                          type="checkbox"
                          checked={selectedSessions.has(session.id)}
                          onChange={() => handleSelectSession(session.id)}
                          className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                      </div>
                    )}

                    <div className="text-3xl">
                      {getDeviceIcon(session.deviceInfo.type)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-center space-x-2">
                        <h3 className="truncate text-lg font-medium text-gray-900">
                          {session.deviceInfo.name}
                        </h3>
                        {session.activity.isCurrentSession && (
                          <span className="inline-flex rounded-full border border-blue-200 bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                            Current
                          </span>
                        )}
                        <span
                          className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${getStatusColor(session.activity.status)}`}
                        >
                          {session.activity.status}
                        </span>
                        {showSecurityDetails && (
                          <span
                            className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${getRiskColor(session.security.riskLevel)}`}
                          >
                            {session.security.riskLevel} risk
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-4 text-sm text-gray-600 md:grid-cols-3">
                        <div>
                          <div className="mb-1 font-medium text-gray-700">
                            Device
                          </div>
                          <div>
                            {session.deviceInfo.browser} on{" "}
                            {session.deviceInfo.os}
                          </div>
                          {session.deviceInfo.version && (
                            <div className="text-xs">
                              v{session.deviceInfo.version}
                            </div>
                          )}
                        </div>

                        {showLocationInfo && (
                          <div>
                            <div className="mb-1 font-medium text-gray-700">
                              Location
                            </div>
                            <div>
                              {session.location.city && session.location.country
                                ? `${session.location.city}, ${session.location.country}`
                                : session.location.country ||
                                  "Unknown location"}
                            </div>
                            <div className="text-xs">{session.location.ip}</div>
                          </div>
                        )}

                        <div>
                          <div className="mb-1 font-medium text-gray-700">
                            Activity
                          </div>
                          <div>
                            Last active:{" "}
                            {formatDuration(session.activity.lastActiveAt)}
                          </div>
                          <div className="text-xs">
                            Created:{" "}
                            {formatDuration(session.activity.createdAt)}
                          </div>
                        </div>
                      </div>

                      {showSecurityDetails && (
                        <div className="mt-3 border-t border-gray-200 pt-3">
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-1">
                              <span
                                className={
                                  session.security.isTrusted ? "🔒" : "⚠️"
                                }
                              >
                                {session.security.isTrusted ? "🔒" : "⚠️"}
                              </span>
                              <span
                                className={
                                  session.security.isTrusted
                                    ? "text-green-600"
                                    : "text-orange-600"
                                }
                              >
                                {session.security.isTrusted
                                  ? "Trusted device"
                                  : "Untrusted device"}
                              </span>
                            </div>
                            <div>Login: {session.security.loginMethod}</div>
                            {session.security.twoFactorUsed && (
                              <div className="flex items-center space-x-1">
                                <span>🛡️</span>
                                <span className="text-green-600">2FA used</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="ml-4 flex space-x-2">
                    {!session.activity.isCurrentSession &&
                      (showRevokeConfirm === session.id ? (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRevokeSession(session.id)}
                            disabled={isPending}
                          >
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowRevokeConfirm(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setShowRevokeConfirm(session.id)}
                          disabled={isPending}
                        >
                          Revoke
                        </Button>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start">
            <span className="mr-3 text-lg text-blue-600">ℹ️</span>
            <div className="text-sm text-blue-800">
              <h4 className="mb-2 font-medium">Session Security Tips</h4>
              <ul className="list-inside list-disc space-y-1">
                <li>
                  Regularly review and revoke sessions from unfamiliar devices
                  or locations
                </li>
                <li>
                  Use trusted devices when possible and enable 2FA for added
                  security
                </li>
                <li>Sign out of shared or public computers when finished</li>
                <li>Report any suspicious activity immediately</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
