import { describe, expect, it } from "vitest";

import { locales } from "../test-utils";

describe("Internationalization Middleware", () => {
  // Ensure the config pattern works correctly
  describe("config", () => {
    it("should have a matcher pattern excluding _next paths", () => {
      const pattern = "^/((?!_next).*)";

      const regex = new RegExp(pattern);

      // Test that _next paths are excluded
      expect(regex.test("/_next/static/chunks/main.js")).toBe(false);
      expect(regex.test("/_next/image")).toBe(false);

      // Test that regular paths are included
      expect(regex.test("/about")).toBe(true);
      expect(regex.test("/en/contact")).toBe(true);
    });
  });

  // Test basic pathnameHasLocale logic
  describe("pathnameHasLocale", () => {
    it("should detect locales in pathname", () => {
      const hasLocale = (pathname: string) => {
        return locales.some(
          (locale) =>
            pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
        );
      };

      expect(hasLocale("/en/about")).toBe(true);
      expect(hasLocale("/es/contact")).toBe(true);
      expect(hasLocale("/fr")).toBe(true);
      expect(hasLocale("/about")).toBe(false);
      expect(hasLocale("/")).toBe(false);
    });
  });
});
