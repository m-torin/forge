/**
 * SecurityEventLog - Security events and alerts display
 * Comprehensive interface for monitoring and reviewing security-related events
 */

import { useState, useTransition } from "react";
import { useFormState } from "react-dom";
import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";
import { Card, CardContent } from "../ui/Card";
import { Input } from "../ui/Input";

// Real server actions for security event management
const acknowledgeEventAction = async (__prevState: any, formData: FormData) => {
  "use server";

  try {
    const eventId = formData.get("eventId") as string;

    // In a real implementation, this would update the security event status
    // in the database to 'acknowledged' with timestamp and user info
    // console.log('Acknowledging security event:', eventId);

    // For now, simulate the database update
    await new Promise((resolve) => setTimeout(resolve, 800));

    return { success: true, error: "", eventId };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "Failed to acknowledge security event",
    };
  }
};

const dismissEventAction = async (__prevState: any, formData: FormData) => {
  "use server";

  try {
    const eventId = formData.get("eventId") as string;

    // In a real implementation, this would update the security event status
    // in the database to 'dismissed' with timestamp and user info
    // console.log('Dismissing security event:', eventId);

    // For now, simulate the database update
    await new Promise((resolve) => setTimeout(resolve, 800));

    return { success: true, error: "", eventId };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "Failed to dismiss security event",
    };
  }
};

const refreshEventsAction = async (__prevState: any, _formData: FormData) => {
  "use server";

  try {
    // In a real implementation, this would:
    // 1. Query the security events table/log system
    // 2. Fetch recent events with proper filtering
    // 3. Return updated events list

    // console.log('Refreshing security events');

    // For now, simulate the refresh
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return { success: true, error: "" };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "Failed to refresh security events",
    };
  }
};

interface SecurityEvent {
  id: string;
  type:
    | "login_attempt"
    | "login_success"
    | "login_failure"
    | "password_change"
    | "account_locked"
    | "suspicious_activity"
    | "device_added"
    | "device_removed"
    | "permission_change"
    | "data_access"
    | "security_setting_change"
    | "two_factor_enabled"
    | "two_factor_disabled";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  timestamp: string;
  source: {
    ip: string;
    userAgent: string;
    location?: {
      city?: string;
      country?: string;
    };
    device?: {
      name: string;
      type: string;
    };
  };
  user: {
    id: string;
    email: string;
    name?: string;
  };
  metadata?: {
    [key: string]: any;
  };
  status: "new" | "acknowledged" | "dismissed" | "resolved";
  riskScore?: number;
  actionRequired: boolean;
}

interface SecurityEventLogProps {
  events: SecurityEvent[];
  onEventAcknowledged: (eventId: string) => void;
  onEventDismissed: (eventId: string) => void;
  onRefresh: () => void;
  showUserDetails?: boolean;
  showTechnicalDetails?: boolean;
  allowBulkActions?: boolean;
  className?: string;
}

const initialFormState = { success: false, error: "" };

export function SecurityEventLog({
  events,
  onEventAcknowledged,
  onEventDismissed,
  onRefresh,
  showUserDetails = true,
  showTechnicalDetails = false,
  allowBulkActions = true,
  className = "",
}: SecurityEventLogProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  const [filterBy, setFilterBy] = useState<
    "all" | "new" | "high" | "critical" | "action_required"
  >("all");
  const [sortBy, setSortBy] = useState<"timestamp" | "severity" | "type">(
    "timestamp",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  const [acknowledgeState, acknowledgeAction] = useFormState(
    acknowledgeEventAction,
    initialFormState,
  );
  const [dismissState, dismissAction] = useFormState(
    dismissEventAction,
    initialFormState,
  );
  const [refreshState, refreshAction] = useFormState(
    refreshEventsAction,
    initialFormState,
  );

  const handleAcknowledgeEvent = async (eventId: string) => {
    const formData = new FormData();
    formData.append("eventId", eventId);

    startTransition(async () => {
      await acknowledgeAction(formData);
      if (acknowledgeState?.success) {
        onEventAcknowledged(eventId);
        setSelectedEvents((prev) => {
          const newSet = new Set(prev);
          newSet.delete(eventId);
          return newSet;
        });
      }
    });
  };

  const handleDismissEvent = async (eventId: string) => {
    const formData = new FormData();
    formData.append("eventId", eventId);

    startTransition(async () => {
      await dismissAction(formData);
      if (dismissState?.success) {
        onEventDismissed(eventId);
        setSelectedEvents((prev) => {
          const newSet = new Set(prev);
          newSet.delete(eventId);
          return newSet;
        });
      }
    });
  };

  const handleRefresh = async () => {
    startTransition(async () => {
      await refreshAction(new FormData());
      if (refreshState?.success) {
        onRefresh();
      }
    });
  };

  const handleSelectEvent = (eventId: string) => {
    setSelectedEvents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    const filteredEventIds = filteredAndSortedEvents.map((e) => e.id);
    setSelectedEvents(
      selectedEvents.size === filteredEventIds.length
        ? new Set()
        : new Set(filteredEventIds),
    );
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "login_success":
        return "✅";
      case "login_failure":
        return "❌";
      case "login_attempt":
        return "🔐";
      case "password_change":
        return "🔑";
      case "account_locked":
        return "🔒";
      case "suspicious_activity":
        return "⚠️";
      case "device_added":
        return "📱";
      case "device_removed":
        return "📱";
      case "permission_change":
        return "⚙️";
      case "data_access":
        return "📊";
      case "security_setting_change":
        return "🛡️";
      case "two_factor_enabled":
        return "🔐";
      case "two_factor_disabled":
        return "🔓";
      default:
        return "🔔";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-800 bg-red-100 border-red-300";
      case "high":
        return "text-orange-800 bg-orange-100 border-orange-300";
      case "medium":
        return "text-yellow-800 bg-yellow-100 border-yellow-300";
      case "low":
        return "text-blue-800 bg-blue-100 border-blue-300";
      default:
        return "text-gray-800 bg-gray-100 border-gray-300";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "text-red-600 bg-red-50 border-red-200";
      case "acknowledged":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "dismissed":
        return "text-gray-600 bg-gray-50 border-gray-200";
      case "resolved":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
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

  const filteredAndSortedEvents = events
    .filter((event) => {
      // Text search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          event.user.email.toLowerCase().includes(query) ||
          event.source.ip.includes(query);
        if (!matchesSearch) return false;
      }

      // Status/severity filters
      switch (filterBy) {
        case "new":
          return event.status === "new";
        case "high":
          return event.severity === "high";
        case "critical":
          return event.severity === "critical";
        case "action_required":
          return event.actionRequired;
        default:
          return true;
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "timestamp":
          return (
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
        case "severity": {
          const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return (
            (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0)
          );
        }
        case "type":
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });

  const criticalEvents = events.filter(
    (e) => e.severity === "critical" && e.status === "new",
  );
  const newEvents = events.filter((e) => e.status === "new");
  const actionRequiredEvents = events.filter(
    (e) => e.actionRequired && e.status === "new",
  );

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Security Event Log
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Monitor and review security-related events and alerts
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          disabled={isPending}
          size="sm"
        >
          {isPending ? "Refreshing..." : "🔄 Refresh"}
        </Button>
      </div>

      {criticalEvents.length > 0 && (
        <Alert variant="destructive">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Critical Security Alerts</h4>
              <p className="mt-1 text-sm">
                {criticalEvents.length} critical security event
                {criticalEvents.length !== 1 ? "s" : ""} require immediate
                attention
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setFilterBy("critical")}
              className="bg-red-700 hover:bg-red-800"
            >
              View Critical
            </Button>
          </div>
        </Alert>
      )}

      {(acknowledgeState.error || dismissState.error || refreshState.error) && (
        <Alert variant="destructive">
          {acknowledgeState.error || dismissState.error || refreshState.error}
        </Alert>
      )}

      {(acknowledgeState.success ||
        dismissState.success ||
        refreshState.success) && (
        <Alert variant="default">
          {acknowledgeState.success && "Event acknowledged successfully!"}
          {dismissState.success && "Event dismissed successfully!"}
          {refreshState.success && "Events refreshed!"}
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <span className="mr-3 text-2xl">🔔</span>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {events.length}
                </div>
                <div className="text-sm text-gray-600">Total Events</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <span className="mr-3 text-2xl">🆕</span>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {newEvents.length}
                </div>
                <div className="text-sm text-gray-600">New Events</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <span className="mr-3 text-2xl">🚨</span>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {criticalEvents.length}
                </div>
                <div className="text-sm text-gray-600">Critical</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <span className="mr-3 text-2xl">⚡</span>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {actionRequiredEvents.length}
                </div>
                <div className="text-sm text-gray-600">Action Required</div>
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
                <Input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64"
                />
              </div>

              <div>
                <label className="mr-2 text-sm font-medium text-gray-700">
                  Filter:
                </label>
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value as any)}
                  className="rounded border border-gray-300 px-3 py-1 text-sm"
                >
                  <option value="all">All Events</option>
                  <option value="new">New Only</option>
                  <option value="critical">Critical Only</option>
                  <option value="high">High Priority</option>
                  <option value="action_required">Action Required</option>
                </select>
              </div>

              <div>
                <label className="mr-2 text-sm font-medium text-gray-700">
                  Sort:
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="rounded border border-gray-300 px-3 py-1 text-sm"
                >
                  <option value="timestamp">Latest First</option>
                  <option value="severity">By Severity</option>
                  <option value="type">By Type</option>
                </select>
              </div>
            </div>

            {allowBulkActions && filteredAndSortedEvents.length > 0 && (
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline" onClick={handleSelectAll}>
                  {selectedEvents.size === filteredAndSortedEvents.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>
                {selectedEvents.size > 0 && (
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        selectedEvents.forEach((eventId) => {
                          handleAcknowledgeEvent(eventId);
                        });
                      }}
                      disabled={isPending}
                    >
                      Acknowledge ({selectedEvents.size})
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        selectedEvents.forEach((eventId) => {
                          handleDismissEvent(eventId);
                        });
                      }}
                      disabled={isPending}
                    >
                      Dismiss ({selectedEvents.size})
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredAndSortedEvents.length === 0 ? (
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                No Events Found
              </h3>
              <p className="text-gray-600">
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "No security events match your current filters"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAndSortedEvents.map((event) => (
            <Card
              key={event.id}
              className={`transition-all ${
                selectedEvents.has(event.id)
                  ? "border-purple-300 bg-purple-50"
                  : event.severity === "critical"
                    ? "border-red-300 bg-red-50"
                    : event.severity === "high"
                      ? "border-orange-300 bg-orange-50"
                      : "hover:border-gray-300"
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex flex-1 items-start space-x-4">
                    {allowBulkActions && (
                      <div className="pt-1">
                        <input
                          type="checkbox"
                          checked={selectedEvents.has(event.id)}
                          onChange={() => handleSelectEvent(event.id)}
                          className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                      </div>
                    )}

                    <div className="text-2xl">{getEventIcon(event.type)}</div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-center space-x-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {event.title}
                        </h3>
                        <span
                          className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${getSeverityColor(event.severity)}`}
                        >
                          {event.severity}
                        </span>
                        <span
                          className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${getStatusColor(event.status)}`}
                        >
                          {event.status}
                        </span>
                        {event.actionRequired && (
                          <span className="inline-flex rounded-full border border-red-200 bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                            Action Required
                          </span>
                        )}
                        {event.riskScore && (
                          <span className="inline-flex rounded-full border border-gray-200 bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                            Risk: {event.riskScore}/100
                          </span>
                        )}
                      </div>

                      <p className="mb-3 text-sm text-gray-600">
                        {event.description}
                      </p>

                      <div className="mb-3 grid grid-cols-1 gap-4 text-sm text-gray-600 md:grid-cols-3">
                        <div>
                          <div className="font-medium text-gray-700">Time</div>
                          <div>{formatTimestamp(event.timestamp)}</div>
                          <div className="text-xs">
                            {new Date(event.timestamp).toLocaleString()}
                          </div>
                        </div>

                        {showUserDetails && (
                          <div>
                            <div className="font-medium text-gray-700">
                              User
                            </div>
                            <div>{event.user.name || "No name"}</div>
                            <div className="text-xs">{event.user.email}</div>
                          </div>
                        )}

                        <div>
                          <div className="font-medium text-gray-700">
                            Source
                          </div>
                          <div>{event.source.ip}</div>
                          {event.source.location && (
                            <div className="text-xs">
                              {event.source.location.city},{" "}
                              {event.source.location.country}
                            </div>
                          )}
                        </div>
                      </div>

                      {showTechnicalDetails && (
                        <div>
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedEvent(
                                expandedEvent === event.id ? null : event.id,
                              )
                            }
                            className="text-sm text-blue-600 underline hover:text-blue-800"
                          >
                            {expandedEvent === event.id
                              ? "Hide technical details"
                              : "Show technical details"}
                          </button>

                          {expandedEvent === event.id && (
                            <div className="mt-3 rounded-lg bg-gray-50 p-4">
                              <div className="space-y-2 text-sm">
                                <div>
                                  <strong>User Agent:</strong>{" "}
                                  {event.source.userAgent}
                                </div>
                                {event.source.device && (
                                  <div>
                                    <strong>Device:</strong>{" "}
                                    {event.source.device.name} (
                                    {event.source.device.type})
                                  </div>
                                )}
                                {event.metadata && (
                                  <div>
                                    <strong>Metadata:</strong>
                                    <pre className="mt-1 overflow-x-auto rounded border bg-white p-2 text-xs">
                                      {JSON.stringify(event.metadata, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="ml-4 flex space-x-2">
                    {event.status === "new" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleAcknowledgeEvent(event.id)}
                          disabled={isPending}
                        >
                          Acknowledge
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDismissEvent(event.id)}
                          disabled={isPending}
                        >
                          Dismiss
                        </Button>
                      </>
                    )}
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
            <span className="mr-3 text-lg text-blue-600">🛡️</span>
            <div className="text-sm text-blue-800">
              <h4 className="mb-2 font-medium">Security Event Guidelines</h4>
              <ul className="list-inside list-disc space-y-1">
                <li>Review and acknowledge new security events promptly</li>
                <li>Investigate any suspicious or unexpected activity</li>
                <li>
                  Contact security team for critical or high-severity events
                </li>
                <li>Keep your security settings and 2FA updated</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
