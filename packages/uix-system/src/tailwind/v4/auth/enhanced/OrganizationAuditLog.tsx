/**
 * OrganizationAuditLog - Organization activity logging
 * Comprehensive audit trail for organization-level activities and changes
 */

import { useState, useTransition } from "react";
import { useFormState } from "react-dom";
import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { Input } from "../ui/Input";

// Placeholder server actions - these would be implemented in the actions file
const exportAuditLogAction = async (__prevState: any, formData: FormData) => {
  const _startDate = formData.get("startDate") as string;
  const _endDate = formData.get("endDate") as string;
  const _format = formData.get("format") as string;
  const _filters = JSON.parse((formData.get("filters") as string) || "{}");

  // console.log('Exporting audit log:', { startDate, endDate, format, filters });

  await new Promise((resolve) => setTimeout(resolve, 2000));

  return {
    success: true,
    error: "",
    downloadUrl: `https://api.example.com/audit-logs/export?token=${Math.random().toString(36)}`,
    recordCount: Math.floor(Math.random() * 1000) + 100,
  };
};

const refreshAuditLogAction = async (__prevState: any, _formData: FormData) => {
  // console.log('Refreshing audit log');

  await new Promise((resolve) => setTimeout(resolve, 1000));

  return { success: true, error: "" };
};

interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  category:
    | "user"
    | "team"
    | "project"
    | "security"
    | "settings"
    | "billing"
    | "integration";
  actor: {
    id: string;
    email: string;
    name?: string;
    type: "user" | "system" | "api";
  };
  target: {
    type: string;
    id: string;
    name?: string;
  };
  context: {
    ip?: string;
    userAgent?: string;
    location?: {
      city?: string;
      country?: string;
    };
  };
  changes?: {
    field: string;
    from: any;
    to: any;
  }[];
  metadata?: {
    [key: string]: any;
  };
  severity: "low" | "medium" | "high" | "critical";
  outcome: "success" | "failure" | "partial";
}

interface OrganizationAuditLogProps {
  entries: AuditLogEntry[];
  organizationName: string;
  onRefresh: () => void;
  canExport?: boolean;
  showTechnicalDetails?: boolean;
  showUserDetails?: boolean;
  allowFiltering?: boolean;
  className?: string;
}

const initialFormState = { success: false, error: "" };

const ACTION_CATEGORIES = {
  user: { name: "User Management", icon: "👤", color: "blue" },
  team: { name: "Team Management", icon: "👥", color: "green" },
  project: { name: "Project Management", icon: "📁", color: "purple" },
  security: { name: "Security", icon: "🔒", color: "red" },
  settings: { name: "Settings", icon: "⚙️", color: "gray" },
  billing: { name: "Billing", icon: "💳", color: "yellow" },
  integration: { name: "Integrations", icon: "🔌", color: "indigo" },
};

const _COMMON_ACTIONS = [
  "user.created",
  "user.updated",
  "user.deleted",
  "user.invited",
  "user.banned",
  "team.created",
  "team.updated",
  "team.deleted",
  "team.member.added",
  "team.member.removed",
  "project.created",
  "project.updated",
  "project.deleted",
  "project.archived",
  "security.login",
  "security.logout",
  "security.password.changed",
  "security.2fa.enabled",
  "settings.updated",
  "billing.plan.changed",
  "integration.connected",
  "integration.disconnected",
];

export function OrganizationAuditLog({
  entries,
  organizationName,
  onRefresh,
  canExport = true,
  showTechnicalDetails = false,
  showUserDetails = true,
  allowFiltering = true,
  className = "",
}: OrganizationAuditLogProps) {
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [selectedOutcome, setSelectedOutcome] = useState<string>("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<"csv" | "json" | "pdf">(
    "csv",
  );

  const [exportState, exportAction] = useFormState(
    exportAuditLogAction,
    initialFormState,
  );
  const [refreshState, refreshAction] = useFormState(
    refreshAuditLogAction,
    initialFormState,
  );

  const handleRefresh = async () => {
    startTransition(async () => {
      await refreshAction(new FormData());
      if (refreshState?.success) {
        onRefresh();
      }
    });
  };

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("startDate", dateRange.start);
    formData.append("endDate", dateRange.end);
    formData.append("format", exportFormat);
    formData.append(
      "filters",
      JSON.stringify({
        category: selectedCategory,
        severity: selectedSeverity,
        outcome: selectedOutcome,
        search: searchQuery,
      }),
    );

    startTransition(async () => {
      await exportAction(formData);
      if (exportState?.success) {
        // Trigger download
        const link = document.createElement("a");
        link.href = (exportState as any).downloadUrl || "";
        link.download = `audit-log-${organizationName}-${new Date().toISOString().split("T")[0]}.${exportFormat}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setShowExportModal(false);
      }
    });
  };

  const getActionIcon = (action: string) => {
    if (action.includes("create")) return "➕";
    if (action.includes("update") || action.includes("change")) return "✏️";
    if (action.includes("delete") || action.includes("remove")) return "🗑️";
    if (action.includes("login")) return "🔑";
    if (action.includes("logout")) return "🚪";
    if (action.includes("invite")) return "📧";
    if (action.includes("ban") || action.includes("block")) return "🚫";
    if (action.includes("approve")) return "✅";
    return "📝";
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

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case "success":
        return "text-green-600 bg-green-50 border-green-200";
      case "failure":
        return "text-red-600 bg-red-50 border-red-200";
      case "partial":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      blue: "text-blue-600 bg-blue-50 border-blue-200",
      green: "text-green-600 bg-green-50 border-green-200",
      purple: "text-purple-600 bg-purple-50 border-purple-200",
      red: "text-red-600 bg-red-50 border-red-200",
      gray: "text-gray-600 bg-gray-50 border-gray-200",
      yellow: "text-yellow-600 bg-yellow-50 border-yellow-200",
      indigo: "text-indigo-600 bg-indigo-50 border-indigo-200",
    };
    const categoryInfo =
      ACTION_CATEGORIES[category as keyof typeof ACTION_CATEGORIES];
    return colors[categoryInfo?.color as keyof typeof colors] || colors.gray;
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

  const filteredEntries = entries.filter((entry) => {
    // Text search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        entry.action.toLowerCase().includes(query) ||
        entry.actor.email.toLowerCase().includes(query) ||
        entry.actor.name?.toLowerCase().includes(query) ||
        entry.target.name?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Category filter
    if (selectedCategory !== "all" && entry.category !== selectedCategory)
      return false;

    // Severity filter
    if (selectedSeverity !== "all" && entry.severity !== selectedSeverity)
      return false;

    // Outcome filter
    if (selectedOutcome !== "all" && entry.outcome !== selectedOutcome)
      return false;

    // Date range filter
    if (
      dateRange.start &&
      new Date(entry.timestamp) < new Date(dateRange.start)
    )
      return false;
    if (dateRange.end && new Date(entry.timestamp) > new Date(dateRange.end))
      return false;

    return true;
  });

  const severityCounts = entries.reduce(
    (acc, entry) => {
      acc[entry.severity] = (acc[entry.severity] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const outcomeCounts = entries.reduce(
    (acc, entry) => {
      acc[entry.outcome] = (acc[entry.outcome] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Organization Audit Log
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Activity trail for {organizationName}
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
          {canExport && (
            <Button
              onClick={() => setShowExportModal(true)}
              variant="outline"
              size="sm"
            >
              📥 Export
            </Button>
          )}
        </div>
      </div>

      {(exportState.error || refreshState.error) && (
        <Alert variant="destructive">
          {exportState.error || refreshState.error}
        </Alert>
      )}

      {(exportState.success || refreshState.success) && (
        <Alert variant="default">
          {exportState.success &&
            `Audit log exported successfully! ${(exportState as any).recordCount || 0} records included.`}
          {refreshState.success && "Audit log refreshed!"}
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {entries.length}
              </div>
              <div className="text-sm text-gray-600">Total Events</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {severityCounts.critical || 0}
              </div>
              <div className="text-sm text-gray-600">Critical</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {severityCounts.high || 0}
              </div>
              <div className="text-sm text-gray-600">High</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {outcomeCounts.success || 0}
              </div>
              <div className="text-sm text-gray-600">Success</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {outcomeCounts.failure || 0}
              </div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {filteredEntries.length}
              </div>
              <div className="text-sm text-gray-600">Filtered</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {allowFiltering && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
              <div>
                <Input
                  type="text"
                  placeholder="Search activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="all">All Categories</option>
                  {Object.entries(ACTION_CATEGORIES).map(([key, category]) => (
                    <option key={key} value={key}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="all">All Severity</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <select
                  value={selectedOutcome}
                  onChange={(e) => setSelectedOutcome(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="all">All Outcomes</option>
                  <option value="success">Success</option>
                  <option value="failure">Failure</option>
                  <option value="partial">Partial</option>
                </select>
              </div>

              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                    setSelectedSeverity("all");
                    setSelectedOutcome("all");
                    setDateRange({ start: "", end: "" });
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>

            <div className="mt-4 flex items-center space-x-4">
              <div>
                <label className="mr-2 text-sm font-medium text-gray-700">
                  From:
                </label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, start: e.target.value }))
                  }
                  className="rounded border border-gray-300 px-3 py-1 text-sm"
                />
              </div>
              <div>
                <label className="mr-2 text-sm font-medium text-gray-700">
                  To:
                </label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, end: e.target.value }))
                  }
                  className="rounded border border-gray-300 px-3 py-1 text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {showExportModal && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-blue-900">
                Export Audit Log
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExportModal(false)}
              >
                Cancel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleExport} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Export Format
                </label>
                <div className="flex space-x-4">
                  {(["csv", "json", "pdf"] as const).map((format) => (
                    <label key={format} className="flex items-center">
                      <input
                        type="radio"
                        name="format"
                        value={format}
                        checked={exportFormat === format}
                        onChange={(e) => setExportFormat(e.target.value as any)}
                        className="mr-2"
                      />
                      <span className="text-sm capitalize">
                        {format.toUpperCase()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-blue-200 bg-white p-4">
                <h4 className="mb-2 font-medium text-gray-900">
                  Export Summary
                </h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>Records to export: {filteredEntries.length}</p>
                  <p>
                    Date range: {dateRange.start || "All time"} to{" "}
                    {dateRange.end || "Present"}
                  </p>
                  <p>
                    Filters applied:{" "}
                    {[
                      selectedCategory !== "all"
                        ? `Category: ${selectedCategory}`
                        : null,
                      selectedSeverity !== "all"
                        ? `Severity: ${selectedSeverity}`
                        : null,
                      selectedOutcome !== "all"
                        ? `Outcome: ${selectedOutcome}`
                        : null,
                      searchQuery ? `Search: "${searchQuery}"` : null,
                    ]
                      .filter(Boolean)
                      .join(", ") || "None"}
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isPending || filteredEntries.length === 0}
                className="w-full"
              >
                {isPending
                  ? "Preparing Export..."
                  : `Export ${filteredEntries.length} Records`}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                No Audit Entries Found
              </h3>
              <p className="text-gray-600">
                {searchQuery ||
                selectedCategory !== "all" ||
                selectedSeverity !== "all" ||
                selectedOutcome !== "all"
                  ? "Try adjusting your filters"
                  : "No audit log entries available"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredEntries.map((entry) => (
            <Card
              key={entry.id}
              className={`transition-all ${
                entry.severity === "critical"
                  ? "border-red-300 bg-red-50"
                  : entry.severity === "high"
                    ? "border-orange-300 bg-orange-50"
                    : "hover:border-gray-300"
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex flex-1 items-start space-x-4">
                    <div className="text-2xl">
                      {getActionIcon(entry.action)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-center space-x-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {entry.action}
                        </h3>

                        <span
                          className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${getCategoryColor(entry.category)}`}
                        >
                          {ACTION_CATEGORIES[entry.category]?.icon}{" "}
                          {ACTION_CATEGORIES[entry.category]?.name}
                        </span>

                        <span
                          className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${getSeverityColor(entry.severity)}`}
                        >
                          {entry.severity}
                        </span>

                        <span
                          className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${getOutcomeColor(entry.outcome)}`}
                        >
                          {entry.outcome}
                        </span>
                      </div>

                      <div className="mb-3 grid grid-cols-1 gap-4 text-sm text-gray-600 md:grid-cols-3">
                        <div>
                          <div className="font-medium text-gray-700">When</div>
                          <div>{formatTimestamp(entry.timestamp)}</div>
                          <div className="text-xs">
                            {new Date(entry.timestamp).toLocaleString()}
                          </div>
                        </div>

                        {showUserDetails && (
                          <div>
                            <div className="font-medium text-gray-700">Who</div>
                            <div>{entry.actor.name || "No name"}</div>
                            <div className="text-xs">
                              {entry.actor.email} ({entry.actor.type})
                            </div>
                          </div>
                        )}

                        <div>
                          <div className="font-medium text-gray-700">
                            Target
                          </div>
                          <div>{entry.target.name || entry.target.type}</div>
                          <div className="text-xs">ID: {entry.target.id}</div>
                        </div>
                      </div>

                      {entry.changes && entry.changes.length > 0 && (
                        <div className="mb-3">
                          <div className="mb-2 text-sm font-medium text-gray-700">
                            Changes:
                          </div>
                          <div className="space-y-1">
                            {entry.changes.map((change) => (
                              <div
                                key={`change-${entry.id}-${change.field}-${change.from}-${change.to}`}
                                className="rounded bg-gray-50 p-2 text-sm"
                              >
                                <span className="font-medium">
                                  {change.field}:
                                </span>{" "}
                                <span className="text-red-600">
                                  "{String(change.from)}"
                                </span>{" "}
                                →{" "}
                                <span className="text-green-600">
                                  "{String(change.to)}"
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {showTechnicalDetails && (
                        <div>
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedEntry(
                                expandedEntry === entry.id ? null : entry.id,
                              )
                            }
                            className="text-sm text-blue-600 underline hover:text-blue-800"
                          >
                            {expandedEntry === entry.id
                              ? "Hide technical details"
                              : "Show technical details"}
                          </button>

                          {expandedEntry === entry.id && (
                            <div className="mt-3 rounded-lg bg-gray-50 p-4">
                              <div className="space-y-2 text-sm">
                                {entry.context.ip && (
                                  <div>
                                    <strong>IP Address:</strong>{" "}
                                    {entry.context.ip}
                                  </div>
                                )}
                                {entry.context.userAgent && (
                                  <div>
                                    <strong>User Agent:</strong>{" "}
                                    {entry.context.userAgent}
                                  </div>
                                )}
                                {entry.context.location && (
                                  <div>
                                    <strong>Location:</strong>{" "}
                                    {entry.context.location.city},{" "}
                                    {entry.context.location.country}
                                  </div>
                                )}
                                {entry.metadata && (
                                  <div>
                                    <strong>Metadata:</strong>
                                    <pre className="mt-1 overflow-x-auto rounded border bg-white p-2 text-xs">
                                      {JSON.stringify(entry.metadata, null, 2)}
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
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-start">
            <span className="mr-3 text-lg text-green-600">🛡️</span>
            <div className="text-sm text-green-800">
              <h4 className="mb-2 font-medium">Audit Log Compliance</h4>
              <p>
                This audit log provides a complete trail of all organizational
                activities for compliance, security monitoring, and operational
                transparency. All entries are immutable and automatically
                retained according to your data retention policy.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
