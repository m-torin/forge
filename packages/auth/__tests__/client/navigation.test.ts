/**
 * Tests for client navigation helpers
 */

import {
  mockRouterPush,
  mockRouterReplace,
  resetRouterMocks,
} from "@repo/qa/vitest/mocks/internal/next";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect } from "vitest";

describe("client navigation helpers", () => {
  beforeEach(() => {
    resetRouterMocks();
  });

  describe("useAuthRedirect", () => {
    test("should return navigation functions", async () => {
      const navigationModule = await import("#/client/navigation");

      const { result } = renderHook(() => navigationModule.useAuthRedirect());

      expect(result.current).toHaveProperty("redirectAfterLogin");
      expect(result.current).toHaveProperty("redirectToLogin");
      expect(result.current).toHaveProperty("redirectToSignUp");
      expect(typeof result.current.redirectAfterLogin).toBe("function");
      expect(typeof result.current.redirectToLogin).toBe("function");
      expect(typeof result.current.redirectToSignUp).toBe("function");
    });

    describe("redirectAfterLogin", () => {
      test("should redirect to dashboard by default", async () => {
        const navigationModule = await import("#/client/navigation");

        const { result } = renderHook(() => navigationModule.useAuthRedirect());

        result.current.redirectAfterLogin();

        expect(mockRouterReplace).toHaveBeenCalledWith("/dashboard");
      });

      test("should redirect to provided returnUrl", async () => {
        const navigationModule = await import("#/client/navigation");

        const { result } = renderHook(() => navigationModule.useAuthRedirect());

        result.current.redirectAfterLogin("/profile");

        expect(mockRouterReplace).toHaveBeenCalledWith("/profile");
      });

      test("should redirect to custom URL", async () => {
        const navigationModule = await import("#/client/navigation");

        const { result } = renderHook(() => navigationModule.useAuthRedirect());

        result.current.redirectAfterLogin("/admin/users");

        expect(mockRouterReplace).toHaveBeenCalledWith("/admin/users");
      });

      test("should handle empty string returnUrl", async () => {
        const navigationModule = await import("#/client/navigation");

        const { result } = renderHook(() => navigationModule.useAuthRedirect());

        result.current.redirectAfterLogin("");

        expect(mockRouterReplace).toHaveBeenCalledWith("/dashboard");
      });
    });

    describe("redirectToLogin", () => {
      test("should redirect to sign-in page without returnUrl", async () => {
        const navigationModule = await import("#/client/navigation");

        const { result } = renderHook(() => navigationModule.useAuthRedirect());

        result.current.redirectToLogin();

        expect(mockRouterPush).toHaveBeenCalledWith("/sign-in");
      });

      test("should redirect to sign-in page with returnUrl", async () => {
        const navigationModule = await import("#/client/navigation");

        const { result } = renderHook(() => navigationModule.useAuthRedirect());

        result.current.redirectToLogin("/protected-page");

        expect(mockRouterPush).toHaveBeenCalledWith(
          "/sign-in?returnUrl=%2Fprotected-page",
        );
      });

      test("should encode returnUrl properly", async () => {
        const navigationModule = await import("#/client/navigation");

        const { result } = renderHook(() => navigationModule.useAuthRedirect());

        result.current.redirectToLogin("/admin/settings?tab=security");

        expect(mockRouterPush).toHaveBeenCalledWith(
          "/sign-in?returnUrl=%2Fadmin%2Fsettings%3Ftab%3Dsecurity",
        );
      });

      test("should handle complex URLs with special characters", async () => {
        const navigationModule = await import("#/client/navigation");

        const { result } = renderHook(() => navigationModule.useAuthRedirect());

        result.current.redirectToLogin("/search?q=test&sort=date");

        expect(mockRouterPush).toHaveBeenCalledWith(
          "/sign-in?returnUrl=%2Fsearch%3Fq%3Dtest%26sort%3Ddate",
        );
      });

      test("should handle empty string returnUrl", async () => {
        const navigationModule = await import("#/client/navigation");

        const { result } = renderHook(() => navigationModule.useAuthRedirect());

        result.current.redirectToLogin("");

        expect(mockRouterPush).toHaveBeenCalledWith("/sign-in");
      });
    });

    describe("redirectToSignUp", () => {
      test("should redirect to sign-up page without returnUrl", async () => {
        const navigationModule = await import("#/client/navigation");

        const { result } = renderHook(() => navigationModule.useAuthRedirect());

        result.current.redirectToSignUp();

        expect(mockRouterPush).toHaveBeenCalledWith("/sign-up");
      });

      test("should redirect to sign-up page with returnUrl", async () => {
        const navigationModule = await import("#/client/navigation");

        const { result } = renderHook(() => navigationModule.useAuthRedirect());

        result.current.redirectToSignUp("/onboarding");

        expect(mockRouterPush).toHaveBeenCalledWith(
          "/sign-up?returnUrl=%2Fonboarding",
        );
      });

      test("should encode returnUrl properly", async () => {
        const navigationModule = await import("#/client/navigation");

        const { result } = renderHook(() => navigationModule.useAuthRedirect());

        result.current.redirectToSignUp("/welcome?new=true");

        expect(mockRouterPush).toHaveBeenCalledWith(
          "/sign-up?returnUrl=%2Fwelcome%3Fnew%3Dtrue",
        );
      });

      test("should handle paths with fragments", async () => {
        const navigationModule = await import("#/client/navigation");

        const { result } = renderHook(() => navigationModule.useAuthRedirect());

        result.current.redirectToSignUp("/docs#getting-started");

        expect(mockRouterPush).toHaveBeenCalledWith(
          "/sign-up?returnUrl=%2Fdocs%23getting-started",
        );
      });

      test("should handle empty string returnUrl", async () => {
        const navigationModule = await import("#/client/navigation");

        const { result } = renderHook(() => navigationModule.useAuthRedirect());

        result.current.redirectToSignUp("");

        expect(mockRouterPush).toHaveBeenCalledWith("/sign-up");
      });
    });

    describe("multiple calls", () => {
      test("should handle multiple redirect calls", async () => {
        const navigationModule = await import("#/client/navigation");

        const { result } = renderHook(() => navigationModule.useAuthRedirect());

        result.current.redirectToLogin("/page1");
        result.current.redirectToSignUp("/page2");
        result.current.redirectAfterLogin("/page3");

        expect(mockRouterPush).toHaveBeenCalledTimes(2);
        expect(mockRouterReplace).toHaveBeenCalledTimes(1);
        expect(mockRouterPush).toHaveBeenNthCalledWith(
          1,
          "/sign-in?returnUrl=%2Fpage1",
        );
        expect(mockRouterPush).toHaveBeenNthCalledWith(
          2,
          "/sign-up?returnUrl=%2Fpage2",
        );
        expect(mockRouterReplace).toHaveBeenCalledWith("/page3");
      });
    });

    describe("edge cases", () => {
      test("should handle undefined returnUrl", async () => {
        const navigationModule = await import("#/client/navigation");

        const { result } = renderHook(() => navigationModule.useAuthRedirect());

        result.current.redirectAfterLogin(undefined);
        result.current.redirectToLogin(undefined);
        result.current.redirectToSignUp(undefined);

        expect(mockRouterReplace).toHaveBeenCalledWith("/dashboard");
        expect(mockRouterPush).toHaveBeenNthCalledWith(1, "/sign-in");
        expect(mockRouterPush).toHaveBeenNthCalledWith(2, "/sign-up");
      });

      test("should handle null returnUrl", async () => {
        const navigationModule = await import("#/client/navigation");

        const { result } = renderHook(() => navigationModule.useAuthRedirect());

        // @ts-expect-error - testing null input
        result.current.redirectAfterLogin(null);
        // @ts-expect-error - testing null input
        result.current.redirectToLogin(null);
        // @ts-expect-error - testing null input
        result.current.redirectToSignUp(null);

        expect(mockRouterReplace).toHaveBeenCalledWith("/dashboard");
        expect(mockRouterPush).toHaveBeenNthCalledWith(1, "/sign-in");
        expect(mockRouterPush).toHaveBeenNthCalledWith(2, "/sign-up");
      });

      test("should handle very long URLs", async () => {
        const navigationModule = await import("#/client/navigation");

        const { result } = renderHook(() => navigationModule.useAuthRedirect());

        const longUrl =
          "/very-long-path/" +
          "segment/".repeat(50) +
          "?param=" +
          "value".repeat(20);

        result.current.redirectToLogin(longUrl);

        expect(mockRouterPush).toHaveBeenCalledWith(
          `/sign-in?returnUrl=${encodeURIComponent(longUrl)}`,
        );
      });
    });
  });
});
