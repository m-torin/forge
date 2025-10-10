import { beforeEach, describe, expect, vi } from "vitest";

// Import after mocking
import {
  createServiceAuth,
  parseServiceToken,
  verifyServiceAuth,
} from "../../src/server/api-keys/service-auth";

// Mock auth using vi.hoisted
const {
  mockCreateApiKey,
  mockListApiKeys,
  mockRevokeApiKey,
  mockVerifyApiKey,
} = vi.hoisted(() => {
  const mockVerifyApiKey = vi.fn();
  const mockCreateApiKey = vi.fn();
  const mockListApiKeys = vi.fn();
  const mockRevokeApiKey = vi.fn();
  return {
    mockCreateApiKey,
    mockListApiKeys,
    mockRevokeApiKey,
    mockVerifyApiKey,
  };
});

vi.mock("../../../src/shared/auth", () => ({
  auth: {
    api: {
      createApiKey: mockCreateApiKey,
      listApiKeys: mockListApiKeys,
      revokeApiKey: mockRevokeApiKey,
      verifyApiKey: mockVerifyApiKey,
    },
  },
}));

describe("service Auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createServiceAuth", () => {
    test("should create service auth token with default expiration", async () => {
      const mockApiKey = "ak_test_key_123";

      // Mock successful API key creation (better-auth format)
      mockCreateApiKey.mockResolvedValue({
        key: mockApiKey,
        id: "key-id-123",
      });

      const result = await createServiceAuth({
        permissions: ["read:data", "write:data"],
        serviceId: "test-service",
      });

      expect(result).toStrictEqual({
        expiresAt: expect.any(Date),
        success: true,
        token: mockApiKey,
      });

      expect(mockCreateApiKey).toHaveBeenCalledWith({
        body: {
          name: "Service: test-service",
          metadata: {
            type: "service",
            createdAt: expect.any(String),
            serviceId: "test-service",
          },
        },
        headers: expect.any(Object),
      });

      // Verify the service metadata was set correctly
      const callArgs = mockCreateApiKey.mock.calls[0][0].body;
      expect(callArgs.metadata.serviceId).toBe("test-service");
      expect(callArgs.metadata.type).toBe("service");
    });

    test("should create service auth token with custom expiration", async () => {
      const mockApiKey = "ak_test_key_7days";

      // Mock successful API key creation (better-auth format)
      mockCreateApiKey.mockResolvedValue({
        key: mockApiKey,
        id: "key-id-7days",
      });

      const result = await createServiceAuth({
        expiresIn: "7d",
        permissions: [],
        serviceId: "test-service",
      });

      expect(result.success).toBeTruthy();
      expect(result.token).toBe(mockApiKey);

      // Verify the correct API was called
      expect(mockCreateApiKey).toHaveBeenCalledWith({
        body: {
          name: "Service: test-service",
          metadata: {
            type: "service",
            createdAt: expect.any(String),
            serviceId: "test-service",
          },
        },
        headers: expect.any(Object),
      });
    });

    test("should handle various expiration formats", async () => {
      mockCreateApiKey.mockResolvedValue({
        key: "ak_test_key",
        id: "key-id-test",
      });

      // Test hours
      const result1 = await createServiceAuth({
        expiresIn: "48h",
        permissions: [],
        serviceId: "test",
      });

      expect(result1.success).toBeTruthy();
      expect(mockCreateApiKey).toHaveBeenCalledWith({
        body: {
          name: "Service: test",
          metadata: {
            type: "service",
            createdAt: expect.any(String),
            serviceId: "test",
          },
        },
        headers: expect.any(Object),
      });

      // Test minutes
      vi.clearAllMocks();
      mockCreateApiKey.mockResolvedValue({
        key: "ak_test_key",
        id: "key-id-test",
      });

      const result2 = await createServiceAuth({
        expiresIn: "120m",
        permissions: [],
        serviceId: "test",
      });

      expect(result2.success).toBeTruthy();
      expect(mockCreateApiKey).toHaveBeenCalledTimes(1);
    });

    test("should handle API key creation errors", async () => {
      // Mock API key creation failure (better-auth returns null key on failure)
      mockCreateApiKey.mockResolvedValue({
        key: null,
      });

      const result = await createServiceAuth({
        permissions: [],
        serviceId: "test-service",
      });

      expect(result).toStrictEqual({
        error: "Failed to create service authentication",
        success: false,
      });
    });

    test("should handle creation exceptions", async () => {
      // Mock API key creation throwing error
      mockCreateApiKey.mockRejectedValue(new Error("Connection failed"));

      const result = await createServiceAuth({
        permissions: [],
        serviceId: "test-service",
      });

      expect(result).toStrictEqual({
        error: "Failed to create service authentication",
        success: false,
      });
    });
  });

  describe("verifyServiceAuth", () => {
    test("should verify valid service token", async () => {
      mockVerifyApiKey.mockResolvedValue({
        valid: true,
        key: {
          metadata: {
            type: "service",
            serviceId: "test-service",
          },
          permissions: {
            data: ["read:data"],
          },
        },
      });

      const result = await verifyServiceAuth("valid.token.123");

      expect(result).toStrictEqual({
        isValid: true,
        permissions: ["read:data"],
        serviceId: "test-service",
      });

      expect(mockVerifyApiKey).toHaveBeenCalledWith({
        body: { key: "valid.token.123" },
      });
    });

    test("should reject non-service tokens", async () => {
      mockVerifyApiKey.mockResolvedValue({
        valid: true,
        key: {
          metadata: {
            type: "user", // Not a service token
          },
          permissions: {
            data: ["read:data"],
          },
        },
      });

      const result = await verifyServiceAuth("token");

      expect(result).toStrictEqual({
        isValid: false,
        error: "Token is not a service authentication token",
      });
    });

    test("should handle invalid tokens", async () => {
      mockVerifyApiKey.mockResolvedValue({
        valid: false,
        error: { message: "Invalid API key" },
      });

      const result = await verifyServiceAuth("invalid.token");

      expect(result).toStrictEqual({
        isValid: false,
        error: "Invalid API key",
      });
    });

    test("should handle expired tokens", async () => {
      mockVerifyApiKey.mockResolvedValue({
        valid: false,
        error: { message: "API key expired" },
      });

      const result = await verifyServiceAuth("expired.token");

      expect(result).toStrictEqual({
        isValid: false,
        error: "API key expired",
      });
    });

    test("should handle verification exceptions", async () => {
      mockVerifyApiKey.mockRejectedValue(new Error("Connection failed"));

      const result = await verifyServiceAuth("error.token");

      expect(result).toStrictEqual({
        isValid: false,
        error: "Failed to validate service authentication",
      });
    });

    test("should handle tokens passed via headers", async () => {
      const headers = new Headers({
        authorization: "Bearer service.token.123",
      });

      mockVerifyApiKey.mockResolvedValue({
        valid: true,
        key: {
          metadata: {
            type: "service",
            serviceId: "test-service-2",
          },
          permissions: {
            data: ["write:data"],
          },
        },
      });

      const result = await verifyServiceAuth(headers);

      expect(result).toStrictEqual({
        isValid: true,
        permissions: ["write:data"],
        serviceId: "test-service-2",
      });
    });
  });

  describe("parseServiceToken", () => {
    test("should parse authorization header with Bearer token", () => {
      const headers = new Headers({
        authorization: "Bearer service.token.123",
      });

      const token = parseServiceToken(headers);

      expect(token).toBe("service.token.123");
    });

    test("should parse x-api-key header", () => {
      const headers = new Headers({
        "x-api-key": "api.key.456",
      });

      const token = parseServiceToken(headers);

      expect(token).toBe("api.key.456");
    });

    test("should prefer authorization header over x-api-key", () => {
      const headers = new Headers({
        authorization: "Bearer auth.token",
        "x-api-key": "api.key",
      });

      const token = parseServiceToken(headers);

      expect(token).toBe("auth.token");
    });

    test("should handle lowercase bearer prefix", () => {
      const headers = new Headers({
        authorization: "bearer lowercase.token",
      });

      const token = parseServiceToken(headers);

      expect(token).toBeNull(); // Implementation only accepts 'Bearer' not 'bearer'
    });

    test("should return null when no token found", () => {
      const headers = new Headers();

      const token = parseServiceToken(headers);

      expect(token).toBeNull();
    });

    test("should return null for invalid authorization format", () => {
      const headers = new Headers({
        authorization: "InvalidFormat token",
      });

      const token = parseServiceToken(headers);

      expect(token).toBeNull();
    });

    test("should handle empty authorization header", () => {
      const headers = new Headers({
        authorization: "",
      });

      const token = parseServiceToken(headers);

      expect(token).toBeNull();
    });

    test("should handle malformed Bearer token", () => {
      const headers = new Headers({
        authorization: "Bearer",
      });

      const token = parseServiceToken(headers);

      expect(token).toBeNull();
    });

    test("should handle Bearer token with extra spaces", () => {
      const headers = new Headers({
        authorization: "Bearer  token.with.spaces  ",
      });

      const token = parseServiceToken(headers);

      expect(token).toBe("token.with.spaces");
    });
  });

  describe("additional edge cases", () => {
    test("should handle createServiceAuth with missing serviceId", async () => {
      mockCreateApiKey.mockResolvedValue({
        key: "ak_test_key",
        id: "key-id",
      });

      const result = await createServiceAuth({
        permissions: ["read:data"],
        serviceId: "",
      });

      expect(result.success).toBeTruthy();
      expect(mockCreateApiKey).toHaveBeenCalledWith({
        body: {
          name: "Service: ",
          metadata: {
            type: "service",
            createdAt: expect.any(String),
            serviceId: "",
          },
        },
        headers: expect.any(Object),
      });
    });

    test("should handle verifyServiceAuth with missing metadata", async () => {
      mockVerifyApiKey.mockResolvedValue({
        valid: true,
        key: {
          // Missing metadata
          permissions: {
            data: ["read:data"],
          },
        },
      });

      const result = await verifyServiceAuth("token");

      expect(result).toStrictEqual({
        isValid: false,
        error: "Token is not a service authentication token",
      });
    });

    test("should handle verifyServiceAuth with missing permissions", async () => {
      mockVerifyApiKey.mockResolvedValue({
        valid: true,
        key: {
          metadata: {
            type: "service",
            serviceId: "test-service",
          },
          // Missing permissions
        },
      });

      const result = await verifyServiceAuth("token");

      expect(result).toStrictEqual({
        isValid: true,
        permissions: [],
        serviceId: "test-service",
      });
    });

    test("should handle verifyServiceAuth with non-array permissions", async () => {
      mockVerifyApiKey.mockResolvedValue({
        valid: true,
        key: {
          metadata: {
            type: "service",
            serviceId: "test-service",
          },
          permissions: {
            data: "single-permission", // Not an array
          },
        },
      });

      const result = await verifyServiceAuth("token");

      expect(result).toStrictEqual({
        isValid: true,
        permissions: [],
        serviceId: "test-service",
      });
    });

    test("should handle createServiceAuth with invalid expiration format", async () => {
      mockCreateApiKey.mockResolvedValue({
        key: "ak_test_key",
        id: "key-id",
      });

      const result = await createServiceAuth({
        expiresIn: "invalid-format",
        permissions: [],
        serviceId: "test",
      });

      expect(result.success).toBeTruthy();
      expect(result.expiresAt).toBeInstanceOf(Date);
    });

    test("should handle verifyServiceAuth error without message", async () => {
      mockVerifyApiKey.mockResolvedValue({
        valid: false,
        error: {}, // Error object without message
      });

      const result = await verifyServiceAuth("token");

      expect(result).toStrictEqual({
        isValid: false,
        error: "Token validation failed",
      });
    });

    test("should handle verifyServiceAuth with null error", async () => {
      mockVerifyApiKey.mockResolvedValue({
        valid: false,
        error: null,
      });

      const result = await verifyServiceAuth("token");

      expect(result).toStrictEqual({
        isValid: false,
        error: "Token validation failed",
      });
    });

    test("should handle createServiceAuth with null response", async () => {
      mockCreateApiKey.mockResolvedValue(null);

      const result = await createServiceAuth({
        permissions: [],
        serviceId: "test",
      });

      expect(result).toStrictEqual({
        error: "Failed to create service authentication",
        success: false,
      });
    });

    test("should handle createServiceAuth with undefined response", async () => {
      mockCreateApiKey.mockResolvedValue(undefined);

      const result = await createServiceAuth({
        permissions: [],
        serviceId: "test",
      });

      expect(result).toStrictEqual({
        error: "Failed to create service authentication",
        success: false,
      });
    });

    test("should handle verifyServiceAuth with null response", async () => {
      mockVerifyApiKey.mockResolvedValue(null);

      const result = await verifyServiceAuth("token");

      expect(result).toStrictEqual({
        isValid: false,
        error: "Failed to validate service authentication",
      });
    });

    test("should handle verifyServiceAuth with undefined response", async () => {
      mockVerifyApiKey.mockResolvedValue(undefined);

      const result = await verifyServiceAuth("token");

      expect(result).toStrictEqual({
        isValid: false,
        error: "Failed to validate service authentication",
      });
    });

    test("should handle parseServiceToken with non-Headers object", () => {
      const notHeaders = {
        authorization: "Bearer token",
      } as any;

      const result = parseServiceToken(notHeaders);

      expect(result).toBeNull();
    });

    test("should handle complex expiration calculations", async () => {
      mockCreateApiKey.mockResolvedValue({
        key: "ak_test_key",
        id: "key-id",
      });

      // Test years
      const result1 = await createServiceAuth({
        expiresIn: "2y",
        permissions: [],
        serviceId: "test",
      });
      expect(result1.success).toBeTruthy();

      // Test weeks
      const result2 = await createServiceAuth({
        expiresIn: "4w",
        permissions: [],
        serviceId: "test",
      });
      expect(result2.success).toBeTruthy();

      // Test seconds
      const result3 = await createServiceAuth({
        expiresIn: "3600s",
        permissions: [],
        serviceId: "test",
      });
      expect(result3.success).toBeTruthy();
    });
  });
});
