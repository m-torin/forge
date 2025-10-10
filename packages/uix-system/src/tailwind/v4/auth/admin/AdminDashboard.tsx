/**
 * AdminDashboard - Overall admin system dashboard
 * Provides comprehensive overview and navigation for system administration
 */

import { useState, useTransition } from "react";
import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { Input } from "../ui/Input";

interface DashboardStats {
  users: {
    total: number;
    active: number;
    banned: number;
    unverified: number;
    newToday: number;
    newThisWeek: number;
  };
  sessions: {
    total: number;
    active: number;
    expired: number;
    byDevice: {
      desktop: number;
      mobile: number;
      tablet: number;
    };
  };
  organizations: {
    total: number;
    active: number;
    membersTotal: number;
    averageSize: number;
  };
  security: {
    failedLogins: number;
    suspiciousActivity: number;
    twoFactorEnabled: number;
    passwordResets: number;
  };
  apiKeys: {
    total: number;
    active: number;
    expired: number;
    requestsToday: number;
  };
}

interface RecentActivity {
  id: string;
  type:
    | "user_created"
    | "user_banned"
    | "login_failed"
    | "org_created"
    | "admin_action";
  description: string;
  timestamp: string;
  severity: "low" | "medium" | "high" | "critical";
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  metadata?: Record<string, any>;
}

interface SystemAlert {
  id: string;
  type: "warning" | "error" | "info";
  title: string;
  message: string;
  timestamp: string;
  resolved: boolean;
  priority: "low" | "medium" | "high" | "critical";
}

interface AdminDashboardProps {
  stats: DashboardStats;
  recentActivity: RecentActivity[];
  systemAlerts: SystemAlert[];
  onRefresh: () => void;
  onNavigateToUsers: () => void;
  onNavigateToOrganizations: () => void;
  onNavigateToApiKeys: () => void;
  onNavigateToSecurity: () => void;
  className?: string;
}

export function AdminDashboard({
  stats,
  recentActivity,
  systemAlerts,
  onRefresh,
  onNavigateToUsers,
  onNavigateToOrganizations,
  onNavigateToApiKeys,
  onNavigateToSecurity,
  className = "",
}: AdminDashboardProps) {
  const [isPending, _startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTimeframe, setSelectedTimeframe] = useState("7d");

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Navigate to users with search term
      onNavigateToUsers();
    }
  };

  const getActivityIcon = (type: RecentActivity["type"]) => {
    switch (type) {
      case "user_created":
        return "👤";
      case "user_banned":
        return "🚫";
      case "login_failed":
        return "⚠️";
      case "org_created":
        return "🏢";
      case "admin_action":
        return "⚙️";
      default:
        return "📋";
    }
  };

  const getSeverityColor = (severity: RecentActivity["severity"]) => {
    switch (severity) {
      case "critical":
        return "text-red-600 bg-red-50 border-red-200";
      case "high":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
    }
  };

  const getAlertColor = (type: SystemAlert["type"]) => {
    switch (type) {
      case "error":
        return "text-red-600 bg-red-50 border-red-200";
      case "warning":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "info":
        return "text-blue-600 bg-blue-50 border-blue-200";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const unResolvedAlerts = systemAlerts.filter((alert) => !alert.resolved);
  const criticalAlerts = unResolvedAlerts.filter(
    (alert) => alert.priority === "critical",
  );

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-1 text-gray-600">
            System overview and administration tools
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          >
            <option value="1d">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <Button onClick={onRefresh} disabled={isPending}>
            {isPending ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      {criticalAlerts.length > 0 && (
        <Alert variant="destructive">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Critical System Alerts</h3>
              <p>
                {criticalAlerts.length} critical issue
                {criticalAlerts.length !== 1 ? "s" : ""} require immediate
                attention
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={onNavigateToSecurity}>
              View Details
            </Button>
          </div>
        </Alert>
      )}

      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleQuickSearch} className="flex gap-3">
            <div className="flex-1">
              <Input
                type="search"
                placeholder="Quick search users, organizations, or sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card
          className="cursor-pointer transition-shadow hover:shadow-md"
          onClick={onNavigateToUsers}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Users</h3>
              <span className="text-2xl">👥</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-gray-900">
                {stats.users.total.toLocaleString()}
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Active:</span>
                  <span className="font-medium text-green-600">
                    {stats.users.active.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Banned:</span>
                  <span className="font-medium text-red-600">
                    {stats.users.banned.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Unverified:</span>
                  <span className="font-medium text-yellow-600">
                    {stats.users.unverified.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">New this week:</span>
                  <span className="font-medium text-blue-600">
                    +{stats.users.newThisWeek}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Sessions</h3>
              <span className="text-2xl">🔐</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-gray-900">
                {stats.sessions.total.toLocaleString()}
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Active:</span>
                  <span className="font-medium text-green-600">
                    {stats.sessions.active.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Expired:</span>
                  <span className="font-medium text-gray-600">
                    {stats.sessions.expired.toLocaleString()}
                  </span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Desktop:</span>
                    <span>{stats.sessions.byDevice.desktop}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Mobile:</span>
                    <span>{stats.sessions.byDevice.mobile}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-shadow hover:shadow-md"
          onClick={onNavigateToOrganizations}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">
                Organizations
              </h3>
              <span className="text-2xl">🏢</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-gray-900">
                {stats.organizations.total.toLocaleString()}
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Active:</span>
                  <span className="font-medium text-green-600">
                    {stats.organizations.active.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Members:</span>
                  <span className="font-medium text-blue-600">
                    {stats.organizations.membersTotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Avg. Size:</span>
                  <span className="font-medium text-gray-600">
                    {stats.organizations.averageSize.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-shadow hover:shadow-md"
          onClick={onNavigateToSecurity}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Security</h3>
              <span className="text-2xl">🛡️</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-gray-900">
                {stats.security.twoFactorEnabled.toLocaleString()}
              </div>
              <div className="mb-2 text-xs text-gray-500">
                2FA Enabled Users
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Failed Logins:</span>
                  <span className="font-medium text-red-600">
                    {stats.security.failedLogins.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Suspicious Activity:</span>
                  <span className="font-medium text-orange-600">
                    {stats.security.suspiciousActivity.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Password Resets:</span>
                  <span className="font-medium text-blue-600">
                    {stats.security.passwordResets}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card
        className="cursor-pointer transition-shadow hover:shadow-md"
        onClick={onNavigateToApiKeys}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">API Keys</h3>
            <span className="text-2xl">🔑</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {stats.apiKeys.total}
              </div>
              <div className="text-sm text-gray-500">Total Keys</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.apiKeys.active}
              </div>
              <div className="text-sm text-gray-500">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {stats.apiKeys.expired}
              </div>
              <div className="text-sm text-gray-500">Expired</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.apiKeys.requestsToday.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Requests Today</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Recent Activity
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={onNavigateToSecurity}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <p className="py-4 text-center text-gray-500">
                  No recent activity
                </p>
              ) : (
                recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <span className="text-lg">
                        {getActivityIcon(activity.type)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="truncate text-sm text-gray-900">
                          {activity.description}
                        </p>
                        <span
                          className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${getSeverityColor(activity.severity)}`}
                        >
                          {activity.severity}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center space-x-2 text-xs text-gray-500">
                        <span>{formatTimestamp(activity.timestamp)}</span>
                        {activity.userEmail && (
                          <>
                            <span>•</span>
                            <span>{activity.userEmail}</span>
                          </>
                        )}
                        {activity.ipAddress && (
                          <>
                            <span>•</span>
                            <span>{activity.ipAddress}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                System Alerts
              </h3>
              <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                {unResolvedAlerts.length} active
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {unResolvedAlerts.length === 0 ? (
                <div className="py-6 text-center">
                  <span className="mb-2 block text-4xl">✅</span>
                  <p className="text-gray-500">All systems operational</p>
                </div>
              ) : (
                unResolvedAlerts.slice(0, 5).map((alert) => (
                  <div
                    key={alert.id}
                    className={`rounded-lg border p-4 ${getAlertColor(alert.type)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{alert.title}</h4>
                        <p className="mt-1 text-sm">{alert.message}</p>
                        <div className="mt-2 flex items-center space-x-2 text-xs">
                          <span>{formatTimestamp(alert.timestamp)}</span>
                          <span
                            className={`rounded-full px-2 py-1 font-medium ${
                              alert.priority === "critical"
                                ? "bg-red-100 text-red-800"
                                : alert.priority === "high"
                                  ? "bg-orange-100 text-orange-800"
                                  : alert.priority === "medium"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {alert.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Button
              variant="outline"
              onClick={onNavigateToUsers}
              className="flex h-20 flex-col items-center justify-center"
            >
              <span className="mb-2 text-2xl">👥</span>
              <span className="text-sm">Manage Users</span>
            </Button>
            <Button
              variant="outline"
              onClick={onNavigateToOrganizations}
              className="flex h-20 flex-col items-center justify-center"
            >
              <span className="mb-2 text-2xl">🏢</span>
              <span className="text-sm">Organizations</span>
            </Button>
            <Button
              variant="outline"
              onClick={onNavigateToApiKeys}
              className="flex h-20 flex-col items-center justify-center"
            >
              <span className="mb-2 text-2xl">🔑</span>
              <span className="text-sm">API Keys</span>
            </Button>
            <Button
              variant="outline"
              onClick={onNavigateToSecurity}
              className="flex h-20 flex-col items-center justify-center"
            >
              <span className="mb-2 text-2xl">🛡️</span>
              <span className="text-sm">Security</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
