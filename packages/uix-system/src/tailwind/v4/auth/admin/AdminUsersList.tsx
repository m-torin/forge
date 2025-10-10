/**
 * AdminUsersList - Core admin user management component
 * Displays all users with search, filtering, and management actions
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
} from "../actions";
import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { Input } from "../ui/Input";

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  banned?: boolean;
  emailVerified?: boolean;
  image?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    sessions: number;
    accounts: number;
  };
}

interface AdminUsersListProps {
  users: User[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  searchQuery?: string;
  roleFilter?: string;
  statusFilter?: string;
  onPageChange: (page: number) => void;
  onSearch: (query: string) => void;
  onFilterRole: (role: string) => void;
  onFilterStatus: (status: string) => void;
  onRefresh: () => void;
  className?: string;
}

const initialFormState = { success: false, error: "" };

export function AdminUsersList({
  users,
  totalCount,
  currentPage,
  pageSize,
  searchQuery = "",
  roleFilter = "",
  statusFilter = "",
  onPageChange,
  onSearch,
  onFilterRole,
  onFilterStatus,
  onRefresh,
  className = "",
}: AdminUsersListProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [localSearch, setLocalSearch] = useState(searchQuery);

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

  const totalPages = Math.ceil(totalCount / pageSize);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(localSearch);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    startTransition(async () => {
      try {
        await setUserRoleAction(userId, newRole);
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

  const handleDeleteUser = async (userId: string) => {
    startTransition(async () => {
      try {
        await adminDeleteUserAction(userId);
        setDeleteState({ success: true, error: "" });
        onRefresh();
      } catch (error) {
        setDeleteState({
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to delete user",
        });
      }
    });
  };

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) return;

    startTransition(async () => {
      try {
        switch (action) {
          case "ban":
            await Promise.all(
              selectedUsers.map((userId) => banUserAction(userId)),
            );
            break;
          case "unban":
            await Promise.all(
              selectedUsers.map((userId) => unbanUserAction(userId)),
            );
            break;
          case "delete":
            await Promise.all(
              selectedUsers.map((userId) => adminDeleteUserAction(userId)),
            );
            break;
          case "revoke-sessions":
            await Promise.all(
              selectedUsers.map((userId) => revokeUserSessionsAction(userId)),
            );
            break;
        }
        setSelectedUsers([]);
        onRefresh();
      } catch (_error) {
        // console.error('Bulk action failed:', error);
      }
    });
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const selectAllUsers = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((user) => user.id));
    }
  };

  const getRoleColor = (role?: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "text-red-600 bg-red-50";
      case "moderator":
        return "text-orange-600 bg-orange-50";
      case "user":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusColor = (user: User) => {
    if (user.banned) return "text-red-600 bg-red-50";
    if (!user.emailVerified) return "text-yellow-600 bg-yellow-50";
    return "text-green-600 bg-green-50";
  };

  const getStatusText = (user: User) => {
    if (user.banned) return "Banned";
    if (!user.emailVerified) return "Unverified";
    return "Active";
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Users Management
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            {totalCount} total users • Page {currentPage} of {totalPages}
          </p>
        </div>
        <Button onClick={onRefresh} disabled={isPending}>
          {isPending ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col gap-4 sm:flex-row"
          >
            <div className="flex-1">
              <Input
                type="search"
                placeholder="Search by email, name, or ID..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={roleFilter}
                onChange={(e) => onFilterRole(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
                <option value="user">User</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => onFilterStatus(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="banned">Banned</option>
                <option value="unverified">Unverified</option>
              </select>
              <Button type="submit">Search</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {selectedUsers.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedUsers.length} user
                {selectedUsers.length !== 1 ? "s" : ""} selected
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction("revoke-sessions")}
                  disabled={isPending}
                >
                  Revoke Sessions
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction("ban")}
                  disabled={isPending}
                >
                  Ban Users
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction("unban")}
                  disabled={isPending}
                >
                  Unban Users
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleBulkAction("delete")}
                  disabled={isPending}
                >
                  Delete Users
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {(banState.error ||
        unbanState.error ||
        roleState.error ||
        deleteState.error ||
        impersonateState.error) && (
        <Alert variant="destructive">
          {banState.error ||
            unbanState.error ||
            roleState.error ||
            deleteState.error ||
            impersonateState.error}
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              checked={
                selectedUsers.length === users.length && users.length > 0
              }
              onChange={selectAllUsers}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Select All
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Sessions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {users.map((user) =>
                  [
                    <tr
                      key={user.id}
                      className={`hover:bg-gray-50 ${selectedUsers.includes(user.id) ? "bg-blue-50" : ""}`}
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => toggleUserSelection(user.id)}
                            className="mr-3 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex items-center">
                            {user.image ? (
                              <img
                                className="h-8 w-8 rounded-full"
                                src={user.image}
                                alt=""
                              />
                            ) : (
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300">
                                <span className="text-xs font-medium text-gray-700">
                                  {user.name?.[0] ||
                                    user.email[0].toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {user.name || "No name"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.email}
                              </div>
                              <div className="text-xs text-gray-400">
                                ID: {user.id.slice(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getRoleColor(user.role)}`}
                        >
                          {user.role || "user"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(user)}`}
                        >
                          {getStatusText(user)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {user._count?.sessions || 0} active
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setExpandedUser(
                                expandedUser === user.id ? null : user.id,
                              )
                            }
                          >
                            {expandedUser === user.id ? "Less" : "More"}
                          </Button>
                          <form action={impersonateAction} className="inline">
                            <input
                              type="hidden"
                              name="userId"
                              value={user.id}
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              type="submit"
                              disabled={isPending}
                            >
                              Impersonate
                            </Button>
                          </form>
                          {user.banned ? (
                            <form action={unbanAction} className="inline">
                              <input
                                type="hidden"
                                name="userId"
                                value={user.id}
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                type="submit"
                                disabled={isPending}
                              >
                                Unban
                              </Button>
                            </form>
                          ) : (
                            <form action={banAction} className="inline">
                              <input
                                type="hidden"
                                name="userId"
                                value={user.id}
                              />
                              <Button
                                size="sm"
                                variant="destructive"
                                type="submit"
                                disabled={isPending}
                              >
                                Ban
                              </Button>
                            </form>
                          )}
                        </div>
                      </td>
                    </tr>,
                    expandedUser === user.id && (
                      <tr key={`${user.id}-expanded`}>
                        <td colSpan={6} className="bg-gray-50 px-6 py-4">
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                              <div>
                                <span className="font-medium text-gray-700">
                                  Email Verified:
                                </span>
                                <span className="ml-2">
                                  {user.emailVerified ? "Yes" : "No"}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">
                                  Accounts:
                                </span>
                                <span className="ml-2">
                                  {user._count?.accounts || 0}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">
                                  Last Updated:
                                </span>
                                <span className="ml-2">
                                  {new Date(
                                    user.updatedAt,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">
                                  Full ID:
                                </span>
                                <span className="ml-2 font-mono text-xs">
                                  {user.id}
                                </span>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <div className="flex items-center gap-2">
                                <select
                                  name="role"
                                  defaultValue={user.role || "user"}
                                  className="rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                  onChange={(e) =>
                                    handleRoleChange(user.id, e.target.value)
                                  }
                                >
                                  <option value="user">User</option>
                                  <option value="moderator">Moderator</option>
                                  <option value="admin">Admin</option>
                                </select>
                              </div>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  revokeUserSessionsAction(user.id)
                                }
                                disabled={isPending}
                              >
                                Revoke All Sessions
                              </Button>

                              <Button
                                size="sm"
                                variant="destructive"
                                type="button"
                                disabled={isPending}
                                onClick={() => {
                                  if (
                                    confirm(
                                      `Are you sure you want to permanently delete user ${user.email}?`,
                                    )
                                  ) {
                                    handleDeleteUser(user.id);
                                  }
                                }}
                              >
                                Delete User
                              </Button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ),
                  ].filter(Boolean),
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex flex-1 justify-between sm:hidden">
            <Button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              Previous
            </Button>
            <Button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">
                  {(currentPage - 1) * pageSize + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(currentPage * pageSize, totalCount)}
                </span>{" "}
                of <span className="font-medium">{totalCount}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm">
                <Button
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  Previous
                </Button>
                {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      onClick={() => onPageChange(page)}
                      className={`relative inline-flex items-center border px-4 py-2 text-sm font-medium ${
                        page === currentPage
                          ? "z-10 border-blue-500 bg-blue-50 text-blue-600"
                          : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </Button>
                  );
                })}
                <Button
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  Next
                </Button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {users.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="mx-auto mb-4 h-12 w-12 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                />
              </svg>
            </div>
            <h3 className="mb-1 text-lg font-medium text-gray-900">
              No users found
            </h3>
            <p className="text-gray-500">
              {searchQuery || roleFilter || statusFilter
                ? "Try adjusting your search criteria or filters."
                : "No users have been created yet."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
