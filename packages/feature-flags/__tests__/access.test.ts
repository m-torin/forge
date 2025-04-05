import { describe, expect, it, vi, beforeEach } from "vitest";
import { getFlags } from "../access";
import { NextResponse } from "next/server";
import * as flags from "../index";

// Import the mocked modules
vi.mock("flags");
vi.mock("next/server");
vi.mock("../index", () => ({
  showBetaFeature: {
    key: "showBetaFeature",
    defaultValue: false,
    decide: vi.fn(),
    origin: "test",
    description: "Test flag for showBetaFeature",
    options: {},
  },
}));

describe("Feature Flags Access", () => {
  let mockRequest: { headers: { get: (key: string) => string | null } };

  beforeEach(() => {
    vi.resetAllMocks();

    // Create a mock request object
    mockRequest = {
      headers: {
        get: vi.fn().mockImplementation((key) => {
          if (key === "Authorization") {
            return "Bearer test-flags-secret";
          }
          return null;
        }),
      },
    };
  });

  it("returns 401 when authorization fails", async () => {
    // Mock verifyAccess to return false
    const { verifyAccess } = require("flags");
    verifyAccess.mockResolvedValueOnce(false);

    // Mock NextResponse.json
    const mockJsonResponse = { status: 401 };
    // @ts-ignore - mockReturnValueOnce is added by vitest but not in the type definition
    NextResponse.json.mockReturnValueOnce(mockJsonResponse);

    const result = await getFlags(mockRequest as any);

    expect(verifyAccess).toHaveBeenCalledWith("Bearer test-flags-secret");
    expect(NextResponse.json).toHaveBeenCalledWith(null, { status: 401 });
    expect(result).toBe(mockJsonResponse);
  });

  it("returns flag definitions when authorization succeeds", async () => {
    // Mock verifyAccess to return true
    const { verifyAccess } = require("flags");
    verifyAccess.mockResolvedValueOnce(true);

    // Mock NextResponse.json
    const mockJsonResponse = { data: "test" };
    // @ts-ignore - mockReturnValueOnce is added by vitest but not in the type definition
    NextResponse.json.mockReturnValueOnce(mockJsonResponse);

    const result = await getFlags(mockRequest as any);

    expect(verifyAccess).toHaveBeenCalledWith("Bearer test-flags-secret");
    expect(NextResponse.json).toHaveBeenCalledWith({
      definitions: {
        showBetaFeature: {
          origin: "test",
          description: "Test flag for showBetaFeature",
          options: {},
        },
      },
    });
    expect(result).toBe(mockJsonResponse);
  });

  it("extracts flag definitions correctly", async () => {
    // Mock verifyAccess to return true
    const { verifyAccess } = require("flags");
    verifyAccess.mockResolvedValueOnce(true);

    // Add a mock flag
    const mockFlags = {
      showBetaFeature: {
        key: "showBetaFeature",
        defaultValue: false,
        decide: vi.fn(),
        origin: "test",
        description: "Test flag for showBetaFeature",
        options: { test: true },
      },
      anotherFlag: {
        key: "anotherFlag",
        defaultValue: true,
        decide: vi.fn(),
        origin: "production",
        description: "Another test flag",
        options: { priority: "high" },
      },
    };

    // Replace the mocked flags temporarily
    const originalFlags = { ...flags };
    Object.keys(mockFlags).forEach((key) => {
      (flags as any)[key] = mockFlags[key as keyof typeof mockFlags];
    });

    await getFlags(mockRequest as any);

    expect(NextResponse.json).toHaveBeenCalledWith({
      definitions: {
        showBetaFeature: {
          origin: "test",
          description: "Test flag for showBetaFeature",
          options: { test: true },
        },
        anotherFlag: {
          origin: "production",
          description: "Another test flag",
          options: { priority: "high" },
        },
      },
    });

    // Restore original flags
    Object.keys(flags).forEach((key) => {
      if (key !== "default") {
        delete (flags as any)[key];
      }
    });
    Object.keys(originalFlags).forEach((key) => {
      (flags as any)[key] = (originalFlags as any)[key];
    });
  });
});
