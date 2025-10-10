import { createMockAuthSession, createMockTeam } from "@repo/qa";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { mockBetterAuthApi, setupAllMocks } from "../../test-helpers/mocks";

// Import after mocking
import {
  createTeamAction,
  deleteTeamAction,
  getTeamAction,
  getTeamStatsAction,
  updateTeamAction,
} from "../../src/server/teams/actions";

// Set up all mocks
setupAllMocks();

// Mock permissions
vi.mock("../../../src/server/teams/permissions", () => ({
  canDeleteTeam: vi.fn().mockResolvedValue(true),
  canManageTeam: vi.fn().mockResolvedValue(true),
  canViewTeamMembers: vi.fn().mockResolvedValue(true),
}));

describe("team Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Set up default session
    vi.mocked(mockBetterAuthApi.getSession).mockResolvedValue(
      createMockAuthSession(),
    );
  });

  describe("createTeam", () => {
    test("should create a new team successfully", async () => {
      const mockTeam = createMockTeam();
      vi.mocked(mockBetterAuthApi.createTeam).mockResolvedValue({
        team: mockTeam,
      });

      const result = await createTeamAction({
        name: "Test Team",
        description: "A test team",
        organizationId: "org-123",
      });

      expect(result.success).toBeTruthy();
      expect(result.team?.name).toBe("Test Team");
      expect(result.team?.description).toBe("A test team");
      expect(vi.mocked(mockBetterAuthApi.createTeam)).toHaveBeenCalledWith({
        headers: expect.any(Headers),
        body: {
          name: "Test Team",
          organizationId: "org-123",
          metadata: { description: "A test team" },
        },
      });
    });

    test("should auto-generate slug if not provided", async () => {
      const mockTeam = createMockTeam({ slug: "my-test-team" });
      vi.mocked(mockBetterAuthApi.createTeam).mockResolvedValue({
        team: mockTeam,
      });

      await createTeamAction({
        name: "My Test Team",
        organizationId: "org-123",
      });

      expect(vi.mocked(mockBetterAuthApi.createTeam)).toHaveBeenCalledWith({
        headers: expect.any(Headers),
        body: {
          name: "My Test Team",
          organizationId: "org-123",
          metadata: undefined,
        },
      });
    });

    test("should handle special characters in team name", async () => {
      const mockTeam = createMockTeam({ name: "Test Team!@#$%" });
      vi.mocked(mockBetterAuthApi.createTeam).mockResolvedValue({
        team: mockTeam,
      });

      const result = await createTeamAction({
        name: "Test Team!@#$%",
        organizationId: "org-123",
      });

      expect(result.success).toBeTruthy();
      expect(result.team?.name).toBe("Test Team!@#$%");
    });

    test("should return error when session is missing", async () => {
      vi.mocked(mockBetterAuthApi.getSession).mockResolvedValue(null);
      vi.mocked(mockBetterAuthApi.createTeam).mockRejectedValue(
        new Error("Unauthorized"),
      );

      const result = await createTeamAction({
        name: "Test Team",
        organizationId: "org-123",
      });

      expect(result.success).toBeFalsy();
      expect(result.error).toBe("Failed to create team");
    });
  });

  describe("updateTeam", () => {
    test("should update team successfully", async () => {
      const mockTeam = createMockTeam({ name: "Updated Team" });
      vi.mocked(mockBetterAuthApi.updateTeam).mockResolvedValue({
        team: mockTeam,
      });

      const result = await updateTeamAction("team-123", {
        name: "Updated Team",
        description: "Updated description",
      });

      expect(result.success).toBeTruthy();
      expect(result.team?.name).toBe("Updated Team");
      expect(vi.mocked(mockBetterAuthApi.updateTeam)).toHaveBeenCalledWith({
        headers: expect.any(Headers),
        body: {
          teamId: "team-123",
          name: "Updated Team",
          metadata: { description: "Updated description" },
        },
      });
    });

    test("should allow partial updates", async () => {
      const mockTeam = createMockTeam();
      vi.mocked(mockBetterAuthApi.updateTeam).mockResolvedValue({
        team: mockTeam,
      });

      await updateTeamAction("team-123", {
        name: "New Name",
      });

      expect(vi.mocked(mockBetterAuthApi.updateTeam)).toHaveBeenCalledWith({
        headers: expect.any(Headers),
        body: {
          teamId: "team-123",
          name: "New Name",
          metadata: undefined,
        },
      });
    });

    test("should handle empty updates", async () => {
      const mockTeam = createMockTeam();
      vi.mocked(mockBetterAuthApi.updateTeam).mockResolvedValue({
        team: mockTeam,
      });

      const result = await updateTeamAction("team-123", {});

      expect(result.success).toBeTruthy();
      expect(vi.mocked(mockBetterAuthApi.updateTeam)).toHaveBeenCalledWith({
        headers: expect.any(Headers),
        body: {
          teamId: "team-123",
          metadata: undefined,
        },
      });
    });
  });

  describe("deleteTeam", () => {
    test("should delete team successfully", async () => {
      vi.mocked(mockBetterAuthApi.deleteTeam).mockResolvedValue({
        success: true,
      });

      const result = await deleteTeamAction("team-123");

      expect(result.success).toBeTruthy();
      expect(vi.mocked(mockBetterAuthApi.removeTeam)).toHaveBeenCalledWith({
        headers: expect.any(Headers),
        body: { teamId: "team-123" },
      });
    });
  });

  describe("getTeam", () => {
    test("should return team details", async () => {
      const mockTeam = createMockTeam();
      vi.mocked(mockBetterAuthApi.getTeam).mockResolvedValue({
        team: {
          ...mockTeam,
          members: [],
        },
      });

      const result = await getTeamAction("team-123");

      expect(result.success).toBeTruthy();
      expect(result.team).toBeDefined();
      expect(result.team?.id).toBe("team-123");
      expect(vi.mocked(mockBetterAuthApi.getTeam)).toHaveBeenCalledWith({
        headers: expect.any(Headers),
        query: { teamId: "team-123" },
      });
    });

    test("should include relations when requested", async () => {
      const mockTeam = createMockTeam();
      const mockMembers = [
        {
          id: "member-1",
          userId: "user-1",
          teamId: "team-123",
          role: "owner",
          user: { id: "user-1", name: "User 1", email: "user1@example.com" },
        },
      ];

      vi.mocked(mockBetterAuthApi.getTeam).mockResolvedValue({
        team: {
          ...mockTeam,
          members: mockMembers,
        },
      });

      const result = await getTeamAction("team-123");

      expect(result.success).toBeTruthy();
      expect(result.team?.teamMembers).toHaveLength(1);
      expect(result.team?.teamMembers?.[0].role).toBe("owner");
    });
  });

  describe("getTeamStats", () => {
    test("should return team statistics", async () => {
      vi.mocked(mockBetterAuthApi.getTeam).mockResolvedValue({
        team: {
          id: "team-123",
          organizationId: "org-123",
          createdAt: new Date("2023-01-01"),
          members: [
            { id: "member-1", role: "owner" },
            { id: "member-2", role: "admin" },
            { id: "member-3", role: "member" },
          ],
        },
      });

      vi.mocked(mockBetterAuthApi.getFullOrganization).mockResolvedValue({
        organization: {
          id: "org-123",
          name: "Test Org",
          invitations: [
            { id: "inv-1", status: "pending", teamId: "team-123" },
            { id: "inv-2", status: "pending", teamId: "team-123" },
            { id: "inv-3", status: "accepted", teamId: "team-123" },
            { id: "inv-4", status: "pending", teamId: "other-team" },
          ],
        },
      });

      const result = await getTeamStatsAction("team-123");

      expect(result.success).toBeTruthy();
      expect(result.stats).toStrictEqual({
        activeMembers: 3,
        memberCount: 3,
        pendingInvitations: 2,
        createdAt: expect.any(Date),
        lastActivity: expect.any(Date),
      });
    });

    test("should return zero counts when no data", async () => {
      vi.mocked(mockBetterAuthApi.getTeam).mockResolvedValue({
        team: {
          id: "team-123",
          organizationId: "org-123",
          createdAt: new Date("2023-01-01"),
          members: [],
        },
      });

      vi.mocked(mockBetterAuthApi.getFullOrganization).mockResolvedValue({
        organization: {
          id: "org-123",
          name: "Test Org",
          invitations: [],
        },
      });

      const result = await getTeamStatsAction("team-123");

      expect(result.success).toBeTruthy();
      expect(result.stats).toStrictEqual({
        activeMembers: 0,
        memberCount: 0,
        pendingInvitations: 0,
        createdAt: expect.any(Date),
        lastActivity: expect.any(Date),
      });
    });
  });
});
