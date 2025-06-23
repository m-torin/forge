export interface DashboardStats {
  users: {
    total: number;
    active: number;
    banned: number;
    admins: number;
  };
  companies: {
    total: number;
    totalMembers: number;
    pendingInvitations: number;
    averageMembers: number;
  };
  apiKeys: {
    total: number;
    active: number;
    expired: number;
    totalRequests: number;
  };
}
