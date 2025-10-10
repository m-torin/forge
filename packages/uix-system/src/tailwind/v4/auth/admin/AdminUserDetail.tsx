/**
 * AdminUserDetail - Detailed user management with ban/unban/impersonate
 * Provides comprehensive user management interface for administrators
 */

import { useState, useTransition } from "react";
import { useFormState } from "react-dom";
import {
  adminDeleteUserAction,
  banUserAction,
  impersonateUserAction,
  revokeUserSessionsAction,
  setUserRoleAction,
  unbanUserAction,
  updateUserAction,
} from "../actions";
import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { Input } from "../ui/Input";

interface UserAccount {
  id: string;
  provider: string;
  providerAccountId: string;
  type: string;
  scope?: string;
  token_type?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserSession {
  id: string;
  token: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

interface UserOrganization {
  id: string;
  name: string;
  slug: string;
  role: string;
  createdAt: string;
}

interface DetailedUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
  banned?: boolean;
  emailVerified?: boolean;
  image?: string;
  createdAt: string;
  updatedAt: string;
  twoFactorEnabled?: boolean;
  lastSignInAt?: string;
  signInCount?: number;
  _count?: {
    sessions: number;
    accounts: number;
    organizations: number;
  };
  accounts?: UserAccount[];
  sessions?: UserSession[];
  organizations?: UserOrganization[];
}

interface AdminUserDetailProps {
  user: DetailedUser;
  onRefresh: () => void;
  onBack: () => void;
  className?: string;
}

const initialFormState = { success: false, error: "" };

export function AdminUserDetail({
  user,
  onRefresh,
  onBack,
  className = "",
}: AdminUserDetailProps) {
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<
    "overview" | "sessions" | "accounts" | "organizations"
  >("overview");
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    name: user.name || "",
    email: user.email,
    role: user.role || "user",
  });

  // Form states for different actions
  const [banState, banAction] = useFormState(banUserAction, initialFormState);
  const [unbanState, unbanAction] = useFormState(
    unbanUserAction,
    initialFormState,
  );
  const [roleState, setRoleState] = useState(initialFormState);
  const [deleteState, setDeleteState] = useState(initialFormState);
  const [impersonateState, impersonateAction] = useFormState(
    impersonateUserAction,
    initialFormState,
  );
  const [updateState, setUpdateState] = useState(initialFormState);

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", editData.name);
    formData.append("email", editData.email);

    startTransition(async () => {
      try {
        await updateUserAction({
          name: editData.name,
          email: editData.email,
        });
        setUpdateState({ success: true, error: "" });
        setEditMode(false);
        onRefresh();
      } catch (error) {
        setUpdateState({
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to update user",
        });
      }
    });
  };

  const handleRoleChange = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newRole = formData.get("role") as string;

    startTransition(async () => {
      try {
        await setUserRoleAction(user.id, newRole);
        setRoleState({ success: true, error: "" });
        onRefresh();
      } catch (error) {
        setRoleState({
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to update role",
        });
      }
    });
  };

  const handleRevokeSession = async (sessionId: string) => {
    if (confirm("Are you sure you want to revoke this session?")) {
      startTransition(async () => {
        await revokeUserSessionsAction(sessionId);
        onRefresh();
      });
    }
  };

  const getRoleColor = (role?: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "text-red-600 bg-red-50 border-red-200";
      case "moderator":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "user":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusColor = (user: DetailedUser) => {
    if (user.banned) return "text-red-600 bg-red-50 border-red-200";
    if (!user.emailVerified)
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-green-600 bg-green-50 border-green-200";
  };

  const getStatusText = (user: DetailedUser) => {
    if (user.banned) return "Banned";
    if (!user.emailVerified) return "Unverified";
    return "Active";
  };

  const tabs = [
    { id: "overview", label: "Overview", count: null },
    { id: "sessions", label: "Sessions", count: user._count?.sessions || 0 },
    { id: "accounts", label: "Accounts", count: user._count?.accounts || 0 },
    {
      id: "organizations",
      label: "Organizations",
      count: user._count?.organizations || 0,
    },
  ] as const;

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            ← Back to Users
          </Button>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              User Details
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Comprehensive user management and information
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onRefresh} disabled={isPending}>
            {isPending ? "Refreshing..." : "Refresh"}
          </Button>
          <form action={impersonateAction} className="inline">
            <input type="hidden" name="userId" value={user.id} />
            <Button
              variant="outline"
              type="submit"
              disabled={isPending || user.banned}
            >
              Impersonate User
            </Button>
          </form>
        </div>
      </div>

      {(banState.error ||
        unbanState.error ||
        roleState.error ||
        deleteState.error ||
        impersonateState.error ||
        updateState.error) && (
        <Alert variant="destructive">
          {banState.error ||
            unbanState.error ||
            roleState.error ||
            deleteState.error ||
            impersonateState.error ||
            updateState.error}
        </Alert>
      )}

      {(banState.success ||
        unbanState.success ||
        roleState.success ||
        impersonateState.success ||
        updateState.success) && (
        <Alert variant="default">Action completed successfully!</Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {user.image ? (
                <img
                  className="h-16 w-16 rounded-full"
                  src={user.image}
                  alt=""
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-300">
                  <span className="text-xl font-medium text-gray-700">
                    {user.name?.[0] || user.email[0].toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {user.name || "No name set"}
                </h3>
                <p className="text-gray-600">{user.email}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${getRoleColor(user.role)}`}
                  >
                    {user.role || "user"}
                  </span>
                  <span
                    className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${getStatusColor(user)}`}
                  >
                    {getStatusText(user)}
                  </span>
                  {user.twoFactorEnabled && (
                    <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-600">
                      2FA Enabled
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {user.banned ? (
                <form action={unbanAction}>
                  <input type="hidden" name="userId" value={user.id} />
                  <Button variant="outline" type="submit" disabled={isPending}>
                    Unban User
                  </Button>
                </form>
              ) : (
                <form action={banAction}>
                  <input type="hidden" name="userId" value={user.id} />
                  <Button
                    variant="destructive"
                    type="submit"
                    disabled={isPending}
                  >
                    Ban User
                  </Button>
                </form>
              )}
              <Button
                variant="outline"
                onClick={() => setEditMode(!editMode)}
                disabled={isPending}
              >
                {editMode ? "Cancel Edit" : "Edit User"}
              </Button>
            </div>
          </div>
        </CardHeader>
        {editMode && (
          <CardContent className="border-t">
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <Input
                    type="text"
                    value={editData.name}
                    onChange={(e) =>
                      setEditData({ ...editData, name: e.target.value })
                    }
                    placeholder="User's full name"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={editData.email}
                    onChange={(e) =>
                      setEditData({ ...editData, email: e.target.value })
                    }
                    placeholder="user@example.com"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isPending}>
                  Update User
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditMode(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900">
              {user._count?.sessions || 0}
            </div>
            <div className="text-sm text-gray-600">Active Sessions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900">
              {user._count?.accounts || 0}
            </div>
            <div className="text-sm text-gray-600">Connected Accounts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900">
              {user.signInCount || 0}
            </div>
            <div className="text-sm text-gray-600">Total Sign-ins</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900">
              {user._count?.organizations || 0}
            </div>
            <div className="text-sm text-gray-600">Organizations</div>
          </CardContent>
        </Card>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap border-b-2 px-1 py-2 text-sm font-medium ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              {tab.label}
              {tab.count !== null && (
                <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-900">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h4 className="text-lg font-medium text-gray-900">
                User Information
              </h4>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">
                  User ID:
                </span>
                <span className="font-mono text-sm text-gray-900">
                  {user.id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">
                  Email Verified:
                </span>
                <span
                  className={`text-sm ${user.emailVerified ? "text-green-600" : "text-red-600"}`}
                >
                  {user.emailVerified ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">
                  Created:
                </span>
                <span className="text-sm text-gray-900">
                  {new Date(user.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">
                  Last Updated:
                </span>
                <span className="text-sm text-gray-900">
                  {new Date(user.updatedAt).toLocaleString()}
                </span>
              </div>
              {user.lastSignInAt && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">
                    Last Sign In:
                  </span>
                  <span className="text-sm text-gray-900">
                    {new Date(user.lastSignInAt).toLocaleString()}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h4 className="text-lg font-medium text-gray-900">
                Role Management
              </h4>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRoleChange} className="space-y-4">
                <input type="hidden" name="userId" value={user.id} />
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Current Role:{" "}
                    <span
                      className={`font-semibold ${user.role === "admin" ? "text-red-600" : user.role === "moderator" ? "text-orange-600" : "text-green-600"}`}
                    >
                      {user.role || "user"}
                    </span>
                  </label>
                  <select
                    name="role"
                    defaultValue={user.role || "user"}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="user">User</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <Button type="submit" disabled={isPending}>
                  Update Role
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "sessions" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-medium text-gray-900">
                Active Sessions
              </h4>
              <Button
                variant="destructive"
                onClick={() => revokeUserSessionsAction(user.id)}
                disabled={isPending}
              >
                Revoke All Sessions
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {user.sessions && user.sessions.length > 0 ? (
              <div className="space-y-4">
                {user.sessions.map((session) => (
                  <div key={session.id} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          Session {session.id.slice(0, 8)}...
                        </div>
                        <div className="mt-1 text-sm text-gray-600">
                          IP: {session.ipAddress || "Unknown"}
                        </div>
                        <div className="text-sm text-gray-600">
                          User Agent:{" "}
                          {session.userAgent?.slice(0, 60) || "Unknown"}...
                        </div>
                        <div className="text-sm text-gray-600">
                          Created:{" "}
                          {new Date(session.createdAt).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">
                          Expires:{" "}
                          {new Date(session.expiresAt).toLocaleString()}
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRevokeSession(session.id)}
                        disabled={isPending}
                      >
                        Revoke
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                No active sessions found
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "accounts" && (
        <Card>
          <CardHeader>
            <h4 className="text-lg font-medium text-gray-900">
              Connected Accounts
            </h4>
          </CardHeader>
          <CardContent>
            {user.accounts && user.accounts.length > 0 ? (
              <div className="space-y-4">
                {user.accounts.map((account) => (
                  <div key={account.id} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium capitalize text-gray-900">
                          {account.provider}
                        </div>
                        <div className="mt-1 text-sm text-gray-600">
                          Account ID: {account.providerAccountId}
                        </div>
                        <div className="text-sm text-gray-600">
                          Type: {account.type}
                        </div>
                        <div className="text-sm text-gray-600">
                          Connected:{" "}
                          {new Date(account.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          account.provider === "google"
                            ? "bg-red-50 text-red-600"
                            : account.provider === "github"
                              ? "bg-gray-50 text-gray-600"
                              : "bg-blue-50 text-blue-600"
                        }`}
                      >
                        {account.provider}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                No connected accounts found
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "organizations" && (
        <Card>
          <CardHeader>
            <h4 className="text-lg font-medium text-gray-900">
              Organization Memberships
            </h4>
          </CardHeader>
          <CardContent>
            {user.organizations && user.organizations.length > 0 ? (
              <div className="space-y-4">
                {user.organizations.map((org) => (
                  <div key={org.id} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          {org.name}
                        </div>
                        <div className="mt-1 text-sm text-gray-600">
                          Slug: {org.slug}
                        </div>
                        <div className="text-sm text-gray-600">
                          Joined: {new Date(org.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          org.role === "owner"
                            ? "bg-purple-50 text-purple-600"
                            : org.role === "admin"
                              ? "bg-red-50 text-red-600"
                              : org.role === "moderator"
                                ? "bg-orange-50 text-orange-600"
                                : "bg-green-50 text-green-600"
                        }`}
                      >
                        {org.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                No organization memberships found
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="border-red-200">
        <CardHeader className="bg-red-50">
          <h4 className="text-lg font-medium text-red-900">Danger Zone</h4>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-red-200 p-4">
            <div>
              <h5 className="font-medium text-red-900">Delete User Account</h5>
              <p className="mt-1 text-sm text-red-700">
                Permanently delete this user account and all associated data.
                This action cannot be undone.
              </p>
            </div>
            <div>
              <input type="hidden" name="userId" value={user.id} />
              <Button
                variant="destructive"
                type="button"
                disabled={isPending}
                onClick={() => {
                  if (
                    confirm(
                      `Are you sure you want to permanently delete user ${user.email}? This action cannot be undone.`,
                    )
                  ) {
                    // Delete the user directly
                    startTransition(async () => {
                      try {
                        await adminDeleteUserAction(user.id);
                        setDeleteState({ success: true, error: "" });
                        onRefresh();
                      } catch (error) {
                        setDeleteState({
                          success: false,
                          error:
                            error instanceof Error
                              ? error.message
                              : "Failed to delete user",
                        });
                      }
                    });
                  }
                }}
              >
                Delete User
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
