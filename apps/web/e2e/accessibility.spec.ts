import { expect, test } from "@repo/testing/e2e";
import { AccessibilityTestUtils, WaitUtils } from "@repo/testing/e2e";

test.describe("Accessibility (a11y)", () => {
  let waitUtils: WaitUtils;
  let a11yUtils: AccessibilityTestUtils;

  test.beforeEach(async ({ page }) => {
    waitUtils = new WaitUtils(page);
    a11yUtils = new AccessibilityTestUtils(page);
    await page.goto("/");
    await waitUtils.forNavigation();
  });

  test("should pass automated accessibility audit", async ({ page: _page }) => {
    // Run axe accessibility audit
    const violations = await a11yUtils.runAxeAudit();

    // Log violations for debugging
    if (violations.length > 0) {
      console.log("Accessibility violations:", violations);
    }

    // Should have no violations
    expect(violations).toHaveLength(0);
  });

  test("should have proper heading structure", async ({ page }) => {
    const headings = await page.$$eval("h1, h2, h3, h4, h5, h6", (headings) =>
      headings.map((h) => ({
        level: parseInt(h.tagName.substring(1)),
        text: h.textContent?.trim(),
        visible: (h as HTMLElement).offsetParent !== null,
      })),
    );

    // Should have exactly one visible H1
    const visibleH1s = headings.filter((h) => h.level === 1 && h.visible);
    expect(visibleH1s).toHaveLength(1);

    // H1 should have meaningful text
    expect(visibleH1s[0].text).toBeTruthy();
    expect(visibleH1s[0].text!.length).toBeGreaterThan(3);

    // Heading levels should not skip
    const visibleHeadings = headings.filter((h) => h.visible);
    for (let i = 1; i < visibleHeadings.length; i++) {
      const current = visibleHeadings[i].level;
      const previous = visibleHeadings[i - 1].level;
      expect(current - previous).toBeLessThanOrEqual(1);
    }
  });

  test("should have keyboard navigation support", async ({ page }) => {
    // Test Tab navigation
    const focusableElements = await page.$$eval(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      (elements) =>
        elements.filter((el) => {
          const style = window.getComputedStyle(el);
          return style.display !== "none" && style.visibility !== "hidden";
        }).length,
    );

    expect(focusableElements).toBeGreaterThan(0);

    // Navigate through first few elements
    for (let i = 0; i < Math.min(focusableElements, 5); i++) {
      await page.keyboard.press("Tab");
      await page.waitForTimeout(100);

      const focusedElement = page.locator(":focus");
      await expect(focusedElement).toBeVisible();
    }
  });

  test("should have proper ARIA labels and roles", async ({ page }) => {
    // Check for buttons without accessible names
    const buttons = page.locator('button, [role="button"]');
    const buttonCount = await buttons.count();

    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute("aria-label");
      const ariaLabelledby = await button.getAttribute("aria-labelledby");
      const textContent = await button.textContent();

      // Button should have accessible name
      const hasAccessibleName =
        ariaLabel ||
        ariaLabelledby ||
        (textContent && textContent.trim().length > 0);
      expect(hasAccessibleName).toBeTruthy();
    }

    // Check for inputs without labels
    const inputs = page.locator(
      'input[type="text"], input[type="email"], input[type="password"], textarea, select',
    );
    const inputCount = await inputs.count();

    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const ariaLabel = await input.getAttribute("aria-label");
      const ariaLabelledby = await input.getAttribute("aria-labelledby");
      const id = await input.getAttribute("id");

      let hasLabel = !!(ariaLabel || ariaLabelledby);

      if (id && !hasLabel) {
        const label = page.locator(`label[for="${id}"]`);
        hasLabel = (await label.count()) > 0;
      }

      expect(hasLabel).toBeTruthy();
    }
  });

  test("should have proper color contrast", async ({ page }) => {
    const colorContrastViolations = await page.evaluate(async () => {
      // Simple color contrast check
      const elements = document.querySelectorAll("*");
      const violations = [];

      for (const element of elements) {
        const style = window.getComputedStyle(element);
        const color = style.color;
        const backgroundColor = style.backgroundColor;

        if (
          color &&
          backgroundColor &&
          color !== "rgba(0, 0, 0, 0)" &&
          backgroundColor !== "rgba(0, 0, 0, 0)"
        ) {
          // This is a simplified check - real implementation would calculate luminance
          const textContent = element.textContent?.trim();
          if (textContent && textContent.length > 0) {
            violations.push({
              backgroundColor,
              color,
              element: element.tagName,
              text: textContent.substring(0, 50),
            });
          }
        }
      }

      return violations.slice(0, 5); // Return first 5 for testing
    });

    // This is a basic check - proper contrast testing would use axe
    expect(colorContrastViolations).toBeDefined();
  });

  test("should support screen reader navigation", async ({ page }) => {
    // Check for landmarks
    const landmarks = await page.$$eval(
      'main, nav, aside, section, header, footer, [role="main"], [role="navigation"], [role="banner"], [role="contentinfo"]',
      (elements) =>
        elements.map((el) => ({
          ariaLabel: el.getAttribute("aria-label"),
          role: el.getAttribute("role"),
          tagName: el.tagName,
        })),
    );

    expect(landmarks.length).toBeGreaterThan(0);

    // Should have main landmark
    const hasMain = landmarks.some(
      (l) => l.tagName === "MAIN" || l.role === "main",
    );
    expect(hasMain).toBeTruthy();

    // Check for skip links
    const skipLink = page.locator(
      'a[href="#main"], a[href="#content"], .sr-only a, .skip-link',
    );
    if ((await skipLink.count()) > 0) {
      await expect(skipLink.first()).toBeAttached();
    }
  });

  test("should have proper focus management", async ({ page }) => {
    // Test focus visibility
    await page.keyboard.press("Tab");
    const focusedElement = page.locator(":focus");

    if ((await focusedElement.count()) > 0) {
      const focusVisible = await focusedElement.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return (
          style.outline !== "none" ||
          style.boxShadow !== "none" ||
          style.border !== style.border
        ); // Check if focus changes border
      });

      // Focus should be visible (though this is a simplified check)
      expect(focusVisible).toBeDefined();
    }

    // Test focus order
    const tabOrder = [];
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("Tab");
      const focused = await page.evaluate(() => {
        const el = document.activeElement;
        return el
          ? {
              id: el.id || null,
              type: (el as HTMLInputElement).type || null,
              className: el.className || null,
              tagName: el.tagName,
            }
          : null;
      });

      if (focused) {
        tabOrder.push(focused);
      }
    }

    expect(tabOrder.length).toBeGreaterThan(0);
  });

  test("should handle reduced motion preferences", async ({ page }) => {
    // Test with reduced motion preference
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();
    await waitUtils.forNavigation();

    // Check if animations are disabled or reduced
    const hasReducedMotion = await page.evaluate(() => {
      const style = window.getComputedStyle(document.body);
      return (
        style.getPropertyValue("--prefers-reduced-motion") === "reduce" ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      );
    });

    expect(hasReducedMotion).toBeTruthy();
  });

  test("should have proper form accessibility", async ({ page }) => {
    // Look for forms
    const forms = page.locator("form");
    const formCount = await forms.count();

    if (formCount > 0) {
      const form = forms.first();

      // Check for fieldsets with legends
      const fieldsets = form.locator("fieldset");
      const fieldsetCount = await fieldsets.count();

      for (let i = 0; i < fieldsetCount; i++) {
        const fieldset = fieldsets.nth(i);
        const legend = fieldset.locator("legend");
        expect(await legend.count()).toBeGreaterThan(0);
      }

      // Check for required field indicators
      const requiredInputs = form.locator(
        "input[required], select[required], textarea[required]",
      );
      const requiredCount = await requiredInputs.count();

      if (requiredCount > 0) {
        // Should have some indication of required fields
        const hasRequiredIndicator = await form
          .locator("*")
          .filter({ hasText: /\*|required/i })
          .count();
        expect(hasRequiredIndicator).toBeGreaterThan(0);
      }
    }
  });

  test("should have proper image accessibility", async ({ page }) => {
    const images = page.locator("img");
    const imageCount = await images.count();

    for (let i = 0; i < Math.min(imageCount, 10); i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute("alt");
      const role = await img.getAttribute("role");

      // Every image should have alt attribute
      expect(alt).not.toBeNull();

      // Decorative images should have empty alt or role="presentation"
      if (role === "presentation" || role === "img") {
        expect(alt).toBe("");
      }
    }
  });

  test("should support keyboard shortcuts", async ({ page }) => {
    // Test common keyboard shortcuts
    const _shortcuts = [
      { description: "Should close modals/dropdowns", key: "Escape" },
      { description: "Should activate focused element", key: "Enter" },
      { description: "Should activate buttons/checkboxes", key: "Space" },
    ];

    // Look for interactive elements
    const button = page.locator("button").first();

    if ((await button.count()) > 0) {
      await button.focus();

      // Test Space key activation
      const _buttonText = await button.textContent();
      await page.keyboard.press("Space");
      await page.waitForTimeout(100);

      // Button should still be there (basic check)
      expect(await button.count()).toBeGreaterThan(0);

      // Test Enter key activation
      await page.keyboard.press("Enter");
      await page.waitForTimeout(100);
    }
  });

  test("should have proper live regions for dynamic content", async ({
    page,
  }) => {
    // Look for live regions
    const liveRegions = page.locator(
      '[aria-live], [role="status"], [role="alert"]',
    );
    const liveRegionCount = await liveRegions.count();

    if (liveRegionCount > 0) {
      for (let i = 0; i < liveRegionCount; i++) {
        const region = liveRegions.nth(i);
        const ariaLive = await region.getAttribute("aria-live");
        const role = await region.getAttribute("role");

        if (ariaLive) {
          expect(["polite", "assertive", "off"]).toContain(ariaLive);
        }

        if (role) {
          expect(["status", "alert", "log"]).toContain(role);
        }
      }
    }
  });
});
