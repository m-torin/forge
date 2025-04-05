import { captureException } from "@sentry/nextjs";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { parseError } from "../error";
import { log } from "../log";

// Import the mocked modules
vi.mock("@sentry/nextjs");
vi.mock("../log");

describe("Error Parsing", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it.skip("parses Error objects correctly", () => {
    const error = new Error("Test error message");
    const result = parseError(error);

    expect(result).toBe("Test error message");
    expect(captureException).toHaveBeenCalledWith(error);
    expect(log.error).toHaveBeenCalledWith("Parsing error: Test error message");
  });

  it.skip("parses objects with message property correctly", () => {
    const error = { message: "Object with message property" };
    const result = parseError(error);

    expect(result).toBe("Object with message property");
    expect(captureException).toHaveBeenCalledWith(error);
    expect(log.error).toHaveBeenCalledWith(
      "Parsing error: Object with message property",
    );
  });

  it.skip("handles string errors correctly", () => {
    const error = "String error";
    const result = parseError(error);

    expect(result).toBe("String error");
    expect(captureException).toHaveBeenCalledWith(error);
    expect(log.error).toHaveBeenCalledWith("Parsing error: String error");
  });

  it.skip("handles number errors correctly", () => {
    const error = 42;
    const result = parseError(error);

    expect(result).toBe("42");
    expect(captureException).toHaveBeenCalledWith(error);
    expect(log.error).toHaveBeenCalledWith("Parsing error: 42");
  });

  it.skip("handles null errors correctly", () => {
    const error = null;
    const result = parseError(error);

    expect(result).toBe("null");
    expect(captureException).toHaveBeenCalledWith(error);
    expect(log.error).toHaveBeenCalledWith("Parsing error: null");
  });

  it.skip("handles undefined errors correctly", () => {
    const error = undefined;
    const result = parseError(error);

    expect(result).toBe("undefined");
    expect(captureException).toHaveBeenCalledWith(error);
    expect(log.error).toHaveBeenCalledWith("Parsing error: undefined");
  });

  it.skip("handles errors during error reporting", () => {
    // Mock captureException to throw an error
    (
      captureException as unknown as ReturnType<typeof vi.fn>
    ).mockImplementation(() => {
      throw new Error("Error during capture");
    });

    // Mock console.error to track calls
    const consoleErrorSpy = vi.spyOn(console, "error");

    const error = new Error("Original error");
    const result = parseError(error);

    expect(result).toBe("Original error");
    expect(captureException).toHaveBeenCalledWith(error);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error parsing error:",
      expect.any(Error),
    );
  });
});
