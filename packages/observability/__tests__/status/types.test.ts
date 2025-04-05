import { describe, expect, it } from "vitest";

import type { BetterStackResponse } from "../../status/types";

describe.skip("BetterStackResponse Type", () => {
  it("validates a correctly structured response", () => {
    const validResponse: BetterStackResponse = {
      data: [
        {
          id: "test-monitor-1",
          type: "monitor",
          attributes: {
            monitor_group_id: null,
            policy_id: null,
            auth_username: "",
            pronounceable_name: "Test Site 1",
            monitor_type: "http",
            url: "https://test-site-1.com",
            auth_password: "",
            call: false,
            check_frequency: 60,
            confirmation_period: 0,
            created_at: "2025-01-01T00:00:00Z",
            domain_expiration: null,
            email: true,
            expected_status_codes: [],
            follow_redirects: true,
            http_method: "GET",
            last_checked_at: "2025-03-18T12:00:00Z",
            maintenance_from: null,
            maintenance_timezone: "UTC",
            maintenance_to: null,
            paused: false,
            paused_at: null,
            port: null,
            push: true,
            recovery_period: 180,
            regions: ["us", "eu"],
            remember_cookies: true,
            request_body: "",
            request_headers: [],
            request_timeout: 30,
            required_keyword: null,
            sms: false,
            ssl_expiration: null,
            status: "up",
            team_wait: null,
            updated_at: "2025-03-18T12:00:00Z",
            verify_ssl: true,
          },
          relationships: {
            policy: {
              data: null,
            },
          },
        },
      ],
      pagination: {
        first: "https://uptime.betterstack.com/api/v2/monitors?page=1",
        last: "https://uptime.betterstack.com/api/v2/monitors?page=1",
        next: null,
        prev: null,
      },
    };

    // Type validation happens at compile time, so this test just verifies
    // that the object can be assigned to the type without TypeScript errors
    expect(validResponse).toBeDefined();
    expect(validResponse.data.length).toBe(1);
    expect(validResponse.data[0].attributes.status).toBe("up");
  });

  it("validates all possible status values", () => {
    // Create a function that accepts a status value
    const createResponseWithStatus = (
      status:
        | "down"
        | "maintenance"
        | "paused"
        | "pending"
        | "up"
        | "validating",
    ): BetterStackResponse => {
      return {
        data: [
          {
            id: "test-monitor-1",
            type: "monitor",
            attributes: {
              monitor_group_id: null,
              policy_id: null,
              auth_username: "",
              pronounceable_name: "Test Site 1",
              monitor_type: "http",
              url: "https://test-site-1.com",
              auth_password: "",
              call: false,
              check_frequency: 60,
              confirmation_period: 0,
              created_at: "2025-01-01T00:00:00Z",
              domain_expiration: null,
              email: true,
              expected_status_codes: [],
              follow_redirects: true,
              http_method: "GET",
              last_checked_at: "2025-03-18T12:00:00Z",
              maintenance_from: null,
              maintenance_timezone: "UTC",
              maintenance_to: null,
              paused: false,
              paused_at: null,
              port: null,
              push: true,
              recovery_period: 180,
              regions: ["us", "eu"],
              remember_cookies: true,
              request_body: "",
              request_headers: [],
              request_timeout: 30,
              required_keyword: null,
              sms: false,
              ssl_expiration: null,
              status,
              team_wait: null,
              updated_at: "2025-03-18T12:00:00Z",
              verify_ssl: true,
            },
            relationships: {
              policy: {
                data: null,
              },
            },
          },
        ],
        pagination: {
          first: "https://uptime.betterstack.com/api/v2/monitors?page=1",
          last: "https://uptime.betterstack.com/api/v2/monitors?page=1",
          next: null,
          prev: null,
        },
      };
    };

    // Test each status value
    const downResponse = createResponseWithStatus("down");
    const maintenanceResponse = createResponseWithStatus("maintenance");
    const pausedResponse = createResponseWithStatus("paused");
    const pendingResponse = createResponseWithStatus("pending");
    const upResponse = createResponseWithStatus("up");
    const validatingResponse = createResponseWithStatus("validating");

    // Verify that each response has the correct status
    expect(downResponse.data[0].attributes.status).toBe("down");
    expect(maintenanceResponse.data[0].attributes.status).toBe("maintenance");
    expect(pausedResponse.data[0].attributes.status).toBe("paused");
    expect(pendingResponse.data[0].attributes.status).toBe("pending");
    expect(upResponse.data[0].attributes.status).toBe("up");
    expect(validatingResponse.data[0].attributes.status).toBe("validating");
  });

  it("validates pagination structure", () => {
    const response: BetterStackResponse = {
      data: [],
      pagination: {
        first: "https://uptime.betterstack.com/api/v2/monitors?page=1",
        last: "https://uptime.betterstack.com/api/v2/monitors?page=3",
        next: "https://uptime.betterstack.com/api/v2/monitors?page=2",
        prev: null,
      },
    };

    expect(response.pagination.first).toBe(
      "https://uptime.betterstack.com/api/v2/monitors?page=1",
    );
    expect(response.pagination.last).toBe(
      "https://uptime.betterstack.com/api/v2/monitors?page=3",
    );
    expect(response.pagination.prev).toBeNull();
    expect(response.pagination.next).toBe(
      "https://uptime.betterstack.com/api/v2/monitors?page=2",
    );
  });
});
