import { describe, expect, it, vi } from "vitest";

import { capitalize, cn, handleError } from "../../lib/utils";

// Mock dependencies
vi.mock("clsx", () => ({
  clsx: (...inputs: unknown[]) => {
    if (inputs.length === 1 && Array.isArray(inputs[0])) {
      return inputs[0].filter(Boolean).join(" ");
    }

    // Handle object syntax
    const classes = inputs.map((input) => {
      if (
        typeof input === "object" &&
        input !== null &&
        !Array.isArray(input)
      ) {
        return Object.entries(input)
          .filter(([_, value]) => Boolean(value))
          .map(([key]) => key)
          .join(" ");
      }
      return input;
    });

    return classes.filter(Boolean).join(" ");
  },
}));

vi.mock("tailwind-merge", () => ({
  twMerge: (className: string) => className,
}));

vi.mock("@repo/observability/error", () => ({
  // @ts-ignore - vi.fn with arguments is not properly typed
  parseError: vi.fn((error) => {
    if (typeof error === "string") return error;
    if (error instanceof Error) return error.message;
    return "Unknown error";
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
  },
}));

describe("Utility Functions", () => {
  describe("cn", () => {
    it("combines class names correctly", () => {
      expect(cn("class1", "class2")).toBe("class1 class2");
      expect(cn("class1", undefined, "class2")).toBe("class1 class2");
      expect(cn("class1", null, "class2")).toBe("class1 class2");
      expect(cn("class1", false && "class2", "class3")).toBe("class1 class3");
      expect(cn("class1", true && "class2", "class3")).toBe(
        "class1 class2 class3",
      );
    });

    it("handles conditional classes", () => {
      const condition = true;
      expect(cn("class1", condition && "class2")).toBe("class1 class2");
      expect(cn("class1", !condition && "class2")).toBe("class1");
    });

    it("handles object syntax", () => {
      expect(cn("class1", { class2: true, class3: false })).toBe(
        "class1 class2",
      );
    });
  });

  describe("capitalize", () => {
    it("capitalizes the first letter of a string", () => {
      expect(capitalize("hello")).toBe("Hello");
      expect(capitalize("world")).toBe("World");
      expect(capitalize("hello world")).toBe("Hello world");
    });

    it("handles empty strings", () => {
      expect(capitalize("")).toBe("");
    });

    it("handles strings that are already capitalized", () => {
      expect(capitalize("Hello")).toBe("Hello");
      expect(capitalize("HELLO")).toBe("HELLO");
    });

    it("handles single character strings", () => {
      expect(capitalize("a")).toBe("A");
      expect(capitalize("A")).toBe("A");
    });
  });

  describe("handleError", () => {
    it("calls toast.error with the parsed error message for string errors", () => {
      handleError("Error message");
      expect(require("sonner").toast.error).toHaveBeenCalledWith(
        "Error message",
      );
    });

    it("calls toast.error with the parsed error message for Error objects", () => {
      handleError(new Error("Error message"));
      expect(require("sonner").toast.error).toHaveBeenCalledWith(
        "Error message",
      );
    });

    it('calls toast.error with "Unknown error" for other error types', () => {
      handleError(null);
      expect(require("sonner").toast.error).toHaveBeenCalledWith(
        "Unknown error",
      );
    });

    it("uses parseError from @repo/observability/error", () => {
      handleError("Error message");
      expect(
        require("@repo/observability/error").parseError,
      ).toHaveBeenCalledWith("Error message");
    });
  });
});
