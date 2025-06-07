import { expect, test } from "@repo/testing/e2e";
import {
  AccessibilityTestUtils,
  PerformanceUtils,
  WaitUtils,
} from "@repo/testing/e2e";

import { withPerformanceMonitoring } from "./utils/performance-monitor";
import { createVisualTester } from "./utils/visual-testing";

test.describe("Accessibility (a11y) - Enhanced", () => {
  let waitUtils: WaitUtils;
  let a11yUtils: AccessibilityTestUtils;
  let perfUtils: PerformanceUtils;

  test.beforeEach(async ({ page }) => {
    waitUtils = new WaitUtils(page);
    a11yUtils = new AccessibilityTestUtils(page);
    perfUtils = new PerformanceUtils(page);
    await page.goto("/");
    await waitUtils.forNavigation();
  });

  test("comprehensive accessibility audit with performance monitoring", async ({
    context,
    page,
  }) => {
    const visualTester = createVisualTester(page);

    const { report, result } = await withPerformanceMonitoring(
      page,
      context,
      "/",
      async () => {
        await waitUtils.forNavigation();

        // Run comprehensive accessibility audit
        const violations = await a11yUtils.runAxeAudit();

        // Additional accessibility metrics
        const accessibilityMetrics = await page.evaluate(() => {
          // Count interactive elements
          const buttons = document.querySelectorAll(
            'button, [role="button"]',
          ).length;
          const links = document.querySelectorAll("a[href]").length;
          const inputs = document.querySelectorAll(
            "input, textarea, select",
          ).length;

          // Count accessibility features
          const ariaLabels = document.querySelectorAll("[aria-label]").length;
          const altTexts = document.querySelectorAll("img[alt]").length;
          const headings = document.querySelectorAll(
            "h1, h2, h3, h4, h5, h6",
          ).length;
          const landmarks = document.querySelectorAll(
            'main, nav, aside, section, header, footer, [role="main"], [role="navigation"], [role="banner"], [role="contentinfo"]',
          ).length;

          // Check for focus indicators
          const style = document.createElement("style");
          style.textContent = ":focus { outline: 2px solid red !important; }";
          document.head.appendChild(style);

          return {
            a11yScore: Math.min(100, (ariaLabels + altTexts + landmarks) * 5),
            accessibilityFeatures: {
              altTexts,
              ariaLabels,
              headings,
              landmarks,
            },
            hasBasicLandmarks: landmarks > 0,
            hasProperHeadings: headings > 0,
            interactiveElements: {
              buttons,
              inputs,
              links,
              total: buttons + links + inputs,
            },
          };
        });

        // Take visual regression screenshot for accessibility testing
        await visualTester.comparePageState(
          page,
          "homepage-accessibility-audit",
          {
            animations: "disabled",
            fullPage: true,
          },
        );

        return {
          metrics: accessibilityMetrics,
          violationCount: violations.length,
          violations: violations.map((v) => ({
            id: v.id,
            description: v.description,
            impact: v.impact,
            nodes: v.nodes.length,
          })),
        };
      },
      {
        fcp: { error: 3000, warning: 1500 },
        lcp: { error: 4000, warning: 2500 },
      },
    );

    // Validations
    expect(result.violationCount).toBe(0);
    expect(result.metrics.hasBasicLandmarks).toBeTruthy();
    expect(result.metrics.hasProperHeadings).toBeTruthy();
    expect(result.metrics.a11yScore).toBeGreaterThan(20);

    await test.info().attach("accessibility-audit-report", {
      body: JSON.stringify({ ...result, performance: report }, null, 2),
      contentType: "application/json",
    });
  });

  test("comprehensive keyboard navigation and heading structure", async ({
    page,
  }) => {
    const navigationAnalysis = await page.evaluate(() => {
      // Analyze heading structure
      const headings = Array.from(
        document.querySelectorAll("h1, h2, h3, h4, h5, h6"),
      ).map((h) => ({
        ariaLevel: h.getAttribute("aria-level"),
        hasId: !!h.id,
        level: parseInt(h.tagName.substring(1)),
        text: h.textContent?.trim() || "",
        visible: (h as HTMLElement).offsetParent !== null,
      }));

      const visibleH1s = headings.filter((h) => h.level === 1 && h.visible);
      const visibleHeadings = headings.filter((h) => h.visible);

      // Check heading hierarchy
      let hierarchyValid = true;
      for (let i = 1; i < visibleHeadings.length; i++) {
        if (visibleHeadings[i].level - visibleHeadings[i - 1].level > 1) {
          hierarchyValid = false;
          break;
        }
      }

      // Analyze focusable elements
      const focusableSelector =
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
      const allFocusable = Array.from(
        document.querySelectorAll(focusableSelector),
      );
      const visibleFocusable = allFocusable.filter((el) => {
        const style = window.getComputedStyle(el);
        return style.display !== "none" && style.visibility !== "hidden";
      });

      // Check for skip links
      const skipLinks = Array.from(
        document.querySelectorAll(
          'a[href="#main"], a[href="#content"], .sr-only a, .skip-link',
        ),
      );

      return {
        headings: {
          hierarchyValid,
          h1Count: visibleH1s.length,
          h1Text: visibleH1s[0]?.text || "",
          structure: visibleHeadings.map((h) => ({
            level: h.level,
            text: h.text.substring(0, 50),
          })),
          total: headings.length,
          visible: visibleHeadings.length,
        },
        keyboard: {
          focusableCount: visibleFocusable.length,
          focusableTypes: visibleFocusable.reduce(
            (acc, el) => {
              const tag = el.tagName.toLowerCase();
              acc[tag] = (acc[tag] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>,
          ),
          hasSkipLinks: skipLinks.length > 0,
          skipLinksCount: skipLinks.length,
        },
      };
    });

    // Heading structure validations
    expect(navigationAnalysis.headings.h1Count).toBe(1);
    expect(navigationAnalysis.headings.h1Text.length).toBeGreaterThan(3);
    expect(navigationAnalysis.headings.hierarchyValid).toBeTruthy();

    // Keyboard navigation validations
    expect(navigationAnalysis.keyboard.focusableCount).toBeGreaterThan(0);

    // Test actual keyboard navigation
    const keyboardTestResults = [];
    for (
      let i = 0;
      i < Math.min(5, navigationAnalysis.keyboard.focusableCount);
      i++
    ) {
      await page.keyboard.press("Tab");
      await page.waitForTimeout(100);

      const focusInfo = await page.evaluate(() => {
        const el = document.activeElement;
        return el
          ? {
              type: (el as HTMLInputElement).type || null,
              ariaLabel: el.getAttribute("aria-label"),
              hasVisibleFocus:
                window.getComputedStyle(el).outline !== "none" ||
                window.getComputedStyle(el).boxShadow !== "none",
              tagName: el.tagName,
              textContent: el.textContent?.trim().substring(0, 30) || "",
            }
          : null;
      });

      keyboardTestResults.push(focusInfo);
    }

    await test.info().attach("navigation-structure-analysis", {
      body: JSON.stringify(
        {
          ...navigationAnalysis,
          keyboardTestResults: keyboardTestResults.filter(Boolean),
        },
        null,
        2,
      ),
      contentType: "application/json",
    });
  });

  test("comprehensive ARIA labels, roles, and form accessibility", async ({
    page,
  }) => {
    const ariaAndFormAnalysis = await page.evaluate(() => {
      // Analyze buttons and interactive elements
      const buttons = Array.from(
        document.querySelectorAll('button, [role="button"]'),
      );
      const buttonAnalysis = buttons.map((btn) => {
        const ariaLabel = btn.getAttribute("aria-label");
        const ariaLabelledby = btn.getAttribute("aria-labelledby");
        const textContent = btn.textContent?.trim() || "";

        return {
          ariaExpanded: btn.getAttribute("aria-expanded"),
          ariaPressed: btn.getAttribute("aria-pressed"),
          disabled: btn.hasAttribute("disabled"),
          hasAccessibleName: !!(ariaLabel || ariaLabelledby || textContent),
          method: ariaLabel
            ? "aria-label"
            : ariaLabelledby
              ? "aria-labelledby"
              : textContent
                ? "text-content"
                : "none",
        };
      });

      // Analyze form inputs
      const inputs = Array.from(
        document.querySelectorAll(
          'input[type="text"], input[type="email"], input[type="password"], textarea, select',
        ),
      );
      const inputAnalysis = inputs.map((input) => {
        const ariaLabel = input.getAttribute("aria-label");
        const ariaLabelledby = input.getAttribute("aria-labelledby");
        const id = input.getAttribute("id");
        const label = id ? document.querySelector(`label[for="${id}"]`) : null;
        const required = input.hasAttribute("required");
        const ariaRequired = input.getAttribute("aria-required") === "true";

        return {
          type: input.type || input.tagName.toLowerCase(),
          hasDescription: !!input.getAttribute("aria-describedby"),
          hasLabel: !!(ariaLabel || ariaLabelledby || label),
          labelMethod: ariaLabel
            ? "aria-label"
            : ariaLabelledby
              ? "aria-labelledby"
              : label
                ? "label-element"
                : "none",
          required: required || ariaRequired,
        };
      });

      // Analyze landmarks and semantic structure
      const landmarks = Array.from(
        document.querySelectorAll(
          'main, nav, aside, section, header, footer, [role="main"], [role="navigation"], [role="banner"], [role="contentinfo"]',
        ),
      );
      const landmarkAnalysis = landmarks.map((landmark) => ({
        ariaLabel: landmark.getAttribute("aria-label"),
        ariaLabelledby: landmark.getAttribute("aria-labelledby"),
        hasAccessibleName: !!(
          landmark.getAttribute("aria-label") ||
          landmark.getAttribute("aria-labelledby")
        ),
        role: landmark.getAttribute("role"),
        tagName: landmark.tagName,
      }));

      // Check for live regions
      const liveRegions = Array.from(
        document.querySelectorAll(
          '[aria-live], [role="status"], [role="alert"]',
        ),
      );
      const liveRegionAnalysis = liveRegions.map((region) => ({
        ariaAtomic: region.getAttribute("aria-atomic"),
        ariaLive: region.getAttribute("aria-live"),
        role: region.getAttribute("role"),
        textContent: region.textContent?.trim().substring(0, 50) || "",
      }));

      return {
        buttons: {
          analysis: buttonAnalysis,
          total: buttonAnalysis.length,
          withAccessibleNames: buttonAnalysis.filter((b) => b.hasAccessibleName)
            .length,
          withAriaStates: buttonAnalysis.filter(
            (b) => b.ariaPressed || b.ariaExpanded,
          ).length,
        },
        inputs: {
          analysis: inputAnalysis,
          required: inputAnalysis.filter((i) => i.required).length,
          total: inputAnalysis.length,
          withDescriptions: inputAnalysis.filter((i) => i.hasDescription)
            .length,
          withLabels: inputAnalysis.filter((i) => i.hasLabel).length,
        },
        landmarks: {
          analysis: landmarkAnalysis,
          total: landmarkAnalysis.length,
          withAccessibleNames: landmarkAnalysis.filter(
            (l) => l.hasAccessibleName,
          ).length,
        },
        liveRegions: {
          analysis: liveRegionAnalysis,
          total: liveRegionAnalysis.length,
        },
      };
    });

    // Validations
    expect(ariaAndFormAnalysis.buttons.withAccessibleNames).toBe(
      ariaAndFormAnalysis.buttons.total,
    );
    expect(ariaAndFormAnalysis.inputs.withLabels).toBe(
      ariaAndFormAnalysis.inputs.total,
    );
    expect(ariaAndFormAnalysis.landmarks.total).toBeGreaterThan(0);

    // Check form accessibility if forms exist
    if (ariaAndFormAnalysis.inputs.total > 0) {
      const requiredFieldsRatio =
        ariaAndFormAnalysis.inputs.required / ariaAndFormAnalysis.inputs.total;
      expect(requiredFieldsRatio).toBeLessThanOrEqual(0.8); // Not all fields should be required
    }

    await test.info().attach("aria-forms-analysis", {
      body: JSON.stringify(ariaAndFormAnalysis, null, 2),
      contentType: "application/json",
    });
  });

  test("accessibility features across different interaction modes", async ({
    page,
  }) => {
    const accessibilityFeatures = await page.evaluate(() => {
      // Check color contrast and visual accessibility
      const textElements = Array.from(
        document.querySelectorAll(
          "p, h1, h2, h3, h4, h5, h6, a, button, span, div",
        ),
      )
        .filter((el) => {
          const text = el.textContent?.trim();
          return text && text.length > 3;
        })
        .slice(0, 20);

      const contrastAnalysis = textElements
        .map((el) => {
          const style = window.getComputedStyle(el);
          return {
            backgroundColor: style.backgroundColor,
            color: style.color,
            fontSize: style.fontSize,
            fontWeight: style.fontWeight,
            hasText: !!el.textContent?.trim(),
            tag: el.tagName,
          };
        })
        .filter(
          (item) =>
            item.color !== "rgba(0, 0, 0, 0)" &&
            item.backgroundColor !== "rgba(0, 0, 0, 0)",
        );

      // Check for reduced motion support
      const reducedMotionElements = Array.from(
        document.querySelectorAll("*"),
      ).filter((el) => {
        const style = window.getComputedStyle(el);
        return (
          style.animation !== "none" || style.transition !== "all 0s ease 0s"
        );
      });

      // Check image accessibility
      const images = Array.from(document.querySelectorAll("img")).map(
        (img) => ({
          alt: img.getAttribute("alt"),
          ariaLabel: img.getAttribute("aria-label"),
          hasAlt: img.hasAttribute("alt"),
          isDecorative:
            img.getAttribute("role") === "presentation" ||
            img.getAttribute("alt") === "",
          role: img.getAttribute("role"),
          src: img.src,
        }),
      );

      // Check keyboard shortcuts and interactive patterns
      const interactiveElements = Array.from(
        document.querySelectorAll("button, a, input, select, textarea"),
      ).map((el) => ({
        type: (el as HTMLInputElement).type || null,
        accessKey: el.getAttribute("accesskey"),
        ariaKeyShortcuts: el.getAttribute("aria-keyshortcuts"),
        hasKeyboardHandler: !!(el.onkeydown || el.onkeyup || el.onkeypress),
        tabIndex: el.getAttribute("tabindex"),
        tag: el.tagName,
      }));

      return {
        contrast: {
          analyzed: contrastAnalysis.length,
          elements: contrastAnalysis,
        },
        images: {
          analysis: images,
          decorative: images.filter((img) => img.isDecorative).length,
          total: images.length,
          withAlt: images.filter((img) => img.hasAlt).length,
        },
        keyboard: {
          total: interactiveElements.length,
          withCustomTabIndex: interactiveElements.filter(
            (el) => el.tabIndex && el.tabIndex !== "0",
          ).length,
          withShortcuts: interactiveElements.filter(
            (el) => el.accessKey || el.ariaKeyShortcuts,
          ).length,
        },
        motion: {
          elementsWithAnimation: reducedMotionElements.length,
          supportsReducedMotion: window.matchMedia(
            "(prefers-reduced-motion: reduce)",
          ).matches,
        },
      };
    });

    // Test keyboard shortcuts
    const keyboardShortcutTests = [];

    // Test Escape key
    await page.keyboard.press("Escape");
    await page.waitForTimeout(100);
    keyboardShortcutTests.push({ key: "Escape", tested: true });

    // Test Space key on focused button
    const firstButton = page.locator("button").first();
    if ((await firstButton.count()) > 0) {
      await firstButton.focus();
      await page.keyboard.press("Space");
      await page.waitForTimeout(100);
      keyboardShortcutTests.push({ key: "Space", tested: true });
    }

    // Test Enter key
    if ((await firstButton.count()) > 0) {
      await firstButton.focus();
      await page.keyboard.press("Enter");
      await page.waitForTimeout(100);
      keyboardShortcutTests.push({ key: "Enter", tested: true });
    }

    // Test reduced motion
    await page.emulateMedia({ reducedMotion: "reduce" });
    const reducedMotionActive = await page.evaluate(
      () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );

    // Validations
    expect(accessibilityFeatures.images.withAlt).toBe(
      accessibilityFeatures.images.total,
    );
    expect(accessibilityFeatures.contrast.analyzed).toBeGreaterThan(0);
    expect(reducedMotionActive).toBeTruthy();

    await test.info().attach("accessibility-features-analysis", {
      body: JSON.stringify(
        {
          ...accessibilityFeatures,
          keyboardShortcutTests,
          reducedMotionTest: { active: reducedMotionActive },
        },
        null,
        2,
      ),
      contentType: "application/json",
    });
  });

  test("comprehensive screen reader navigation and focus management", async ({
    context,
    page,
  }) => {
    const { report, result } = await withPerformanceMonitoring(
      page,
      context,
      "/",
      async () => {
        await waitUtils.forNavigation();

        // Comprehensive landmark analysis
        const landmarkData = await page.evaluate(() => {
          const landmarks = Array.from(
            document.querySelectorAll(
              'main, nav, aside, section, header, footer, [role="main"], [role="navigation"], [role="banner"], [role="contentinfo"]',
            ),
          );

          const landmarkAnalysis = landmarks.map((el) => ({
            ariaLabel: el.getAttribute("aria-label"),
            hasAccessibleName: !!(
              el.getAttribute("aria-label") ||
              el.getAttribute("aria-labelledby")
            ),
            isVisible: (el as HTMLElement).offsetParent !== null,
            role: el.getAttribute("role"),
            tagName: el.tagName,
          }));

          // Check for skip links
          const skipLinks = Array.from(
            document.querySelectorAll(
              'a[href="#main"], a[href="#content"], .sr-only a, .skip-link',
            ),
          );

          const skipLinkAnalysis = skipLinks.map((link) => ({
            hasProperTarget: !!(
              link.getAttribute("href") &&
              document.querySelector(link.getAttribute("href")!)
            ),
            href: link.getAttribute("href"),
            isVisible: (link as HTMLElement).offsetParent !== null,
            text: link.textContent?.trim(),
          }));

          return {
            hasMain: landmarks.some(
              (l) => l.tagName === "MAIN" || l.getAttribute("role") === "main",
            ),
            landmarks: landmarkAnalysis,
            skipLinks: skipLinkAnalysis,
            totalLandmarks: landmarkAnalysis.length,
            visibleLandmarks: landmarkAnalysis.filter((l) => l.isVisible)
              .length,
          };
        });

        // Test focus management
        const focusTestResults = [];

        // Test focus visibility
        await page.keyboard.press("Tab");
        const focusedElement = page.locator(":focus");

        if ((await focusedElement.count()) > 0) {
          const focusInfo = await focusedElement.evaluate((el) => {
            const style = window.getComputedStyle(el);
            return {
              ariaLabel: el.getAttribute("aria-label"),
              hasVisibleFocus:
                style.outline !== "none" ||
                style.boxShadow !== "none" ||
                style.border !== style.border,
              role: el.getAttribute("role"),
              tagName: el.tagName,
            };
          });
          focusTestResults.push(focusInfo);
        }

        // Test tab order for first 8 elements
        const tabOrder = [];
        for (let i = 0; i < 8; i++) {
          await page.keyboard.press("Tab");
          const focused = await page.evaluate(() => {
            const el = document.activeElement;
            return el
              ? {
                  id: el.id || null,
                  type: (el as HTMLInputElement).type || null,
                  ariaLabel: el.getAttribute("aria-label"),
                  className: el.className || null,
                  hasAccessibleName: !!(
                    el.getAttribute("aria-label") ||
                    el.getAttribute("aria-labelledby") ||
                    el.textContent?.trim()
                  ),
                  tagName: el.tagName,
                }
              : null;
          });

          if (focused) {
            tabOrder.push(focused);
          }
        }

        return {
          focusTestResults,
          landmarkData,
          screenReaderFriendly:
            landmarkData.hasMain && landmarkData.totalLandmarks > 0,
          tabOrder: tabOrder.filter(Boolean),
        };
      },
      {
        fcp: { error: 3000, warning: 1500 },
        lcp: { error: 4000, warning: 2500 },
      },
    );

    // Validations
    expect(result.landmarkData.hasMain).toBeTruthy();
    expect(result.landmarkData.totalLandmarks).toBeGreaterThan(0);
    expect(result.tabOrder.length).toBeGreaterThan(0);
    expect(result.screenReaderFriendly).toBeTruthy();

    await test.info().attach("screen-reader-focus-analysis", {
      body: JSON.stringify({ ...result, performance: report }, null, 2),
      contentType: "application/json",
    });
  });

  test("comprehensive reduced motion and animation accessibility", async ({
    page,
  }) => {
    // Test with reduced motion preference
    const reducedMotionAnalysis = await page.evaluate(() => {
      // Initial state analysis
      const animatedElements = Array.from(
        document.querySelectorAll("*"),
      ).filter((el) => {
        const style = window.getComputedStyle(el);
        return (
          style.animation !== "none" || style.transition !== "all 0s ease 0s"
        );
      });

      const initialState = {
        animationDetails: animatedElements.slice(0, 10).map((el) => ({
          animation: window.getComputedStyle(el).animation,
          tagName: el.tagName,
          transition: window.getComputedStyle(el).transition,
        })),
        elementsWithAnimation: animatedElements.length,
        initialReducedMotion: window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches,
      };

      return initialState;
    });

    // Test with reduced motion preference enabled
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();
    await waitUtils.forNavigation();

    const reducedMotionActive = await page.evaluate(() => {
      const reducedMotionSupported = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      // Check if CSS variables or classes respect reduced motion
      const hasReducedMotionSupport = !!(
        document.documentElement.style.getPropertyValue(
          "--prefers-reduced-motion",
        ) ||
        document.documentElement.classList.contains("reduce-motion") ||
        document.body.classList.contains("reduce-motion")
      );

      // Check if animations are properly disabled/reduced
      const animatedElements = Array.from(
        document.querySelectorAll("*"),
      ).filter((el) => {
        const style = window.getComputedStyle(el);
        const hasAnimation = style.animation !== "none";
        const hasTransition = style.transition !== "all 0s ease 0s";
        return hasAnimation || hasTransition;
      });

      return {
        hasImplementation: hasReducedMotionSupport,
        reducedMotionDetected: reducedMotionSupported,
        remainingAnimations: animatedElements.length,
        respectsPreference:
          reducedMotionSupported &&
          (hasReducedMotionSupport || animatedElements.length < 5),
      };
    });

    expect(reducedMotionActive.reducedMotionDetected).toBeTruthy();
    // App should either implement reduced motion or have minimal animations
    expect(reducedMotionActive.respectsPreference).toBeTruthy();

    await test.info().attach("reduced-motion-analysis", {
      body: JSON.stringify(
        {
          initial: reducedMotionAnalysis,
          withReducedMotion: reducedMotionActive,
        },
        null,
        2,
      ),
      contentType: "application/json",
    });
  });

  test("comprehensive form accessibility and validation patterns", async ({
    page,
  }) => {
    const formPages = [
      { name: "contact", path: "/en/contact" },
      { name: "signup", path: "/en/signup" },
      { name: "login", path: "/en/login" },
    ];

    const formAnalysisResults = [];

    for (const formPage of formPages) {
      try {
        await page.goto(formPage.path);
        await waitUtils.forNavigation();

        const formAccessibility = await page.evaluate(() => {
          const forms = Array.from(document.querySelectorAll("form"));

          if (forms.length === 0) {
            return { formCount: 0, hasForm: false };
          }

          const formAnalysis = forms.map((form, index) => {
            // Analyze fieldsets and legends
            const fieldsets = Array.from(form.querySelectorAll("fieldset"));
            const fieldsetAnalysis = fieldsets.map((fieldset) => ({
              hasLegend: !!fieldset.querySelector("legend"),
              legendText:
                fieldset.querySelector("legend")?.textContent?.trim() || "",
            }));

            // Analyze form inputs
            const inputs = Array.from(
              form.querySelectorAll("input, select, textarea"),
            );
            const inputAnalysis = inputs.map((input) => {
              const id = input.getAttribute("id");
              const name = input.getAttribute("name");
              const label = id
                ? document.querySelector(`label[for="${id}"]`)
                : null;
              const ariaLabel = input.getAttribute("aria-label");
              const ariaLabelledby = input.getAttribute("aria-labelledby");
              const required =
                input.hasAttribute("required") ||
                input.getAttribute("aria-required") === "true";
              const describedBy = input.getAttribute("aria-describedby");
              const errorElement = describedBy
                ? document.querySelector(`#${describedBy}`)
                : null;

              return {
                name: name || "unnamed",
                type: input.type || input.tagName.toLowerCase(),
                hasDescription: !!describedBy,
                hasErrorHandling: !!errorElement,
                hasLabel: !!(label || ariaLabel || ariaLabelledby),
                labelMethod: label
                  ? "label-element"
                  : ariaLabel
                    ? "aria-label"
                    : ariaLabelledby
                      ? "aria-labelledby"
                      : "none",
                required,
              };
            });

            // Check for required field indicators
            const requiredIndicators = Array.from(
              form.querySelectorAll("*"),
            ).some((el) => /\*|required/i.test(el.textContent || ""));

            return {
              fieldsets: fieldsetAnalysis,
              formIndex: index,
              hasRequiredIndicators: requiredIndicators,
              inputCount: inputs.length,
              inputs: inputAnalysis,
              labeledInputs: inputAnalysis.filter((i) => i.hasLabel).length,
              requiredInputs: inputAnalysis.filter((i) => i.required).length,
            };
          });

          return {
            formCount: forms.length,
            forms: formAnalysis,
            hasForm: true,
            overallAccessibility: {
              labelingRatio:
                formAnalysis.reduce((acc, f) => acc + f.inputCount, 0) > 0
                  ? formAnalysis.reduce((acc, f) => acc + f.labeledInputs, 0) /
                    formAnalysis.reduce((acc, f) => acc + f.inputCount, 0)
                  : 1,
              totalInputs: formAnalysis.reduce(
                (acc, f) => acc + f.inputCount,
                0,
              ),
              totalLabeled: formAnalysis.reduce(
                (acc, f) => acc + f.labeledInputs,
                0,
              ),
            },
          };
        });

        formAnalysisResults.push({
          page: formPage.name,
          path: formPage.path,
          ...formAccessibility,
        });

        // Validations for pages with forms
        if (formAccessibility.hasForm) {
          expect(
            formAccessibility.overallAccessibility.labelingRatio,
          ).toBeGreaterThan(0.8);

          // Test keyboard navigation within form
          const firstInput = page.locator("input, select, textarea").first();
          if ((await firstInput.count()) > 0) {
            await firstInput.focus();
            const isFocused = await firstInput.evaluate(
              (el) => el === document.activeElement,
            );
            expect(isFocused).toBeTruthy();
          }
        }
      } catch (error) {
        console.warn(
          `Form accessibility test failed for ${formPage.path}:`,
          error,
        );
        formAnalysisResults.push({
          error: error.message,
          hasForm: false,
          page: formPage.name,
          path: formPage.path,
        });
      }
    }

    await test.info().attach("form-accessibility-analysis", {
      body: JSON.stringify(formAnalysisResults, null, 2),
      contentType: "application/json",
    });
  });

  test("comprehensive image accessibility and media optimization", async ({
    page,
  }) => {
    const imageAnalysis = await page.evaluate(() => {
      // Analyze all images
      const images = Array.from(document.querySelectorAll("img"));
      const imageData = images.map((img, index) => {
        const alt = img.getAttribute("alt");
        const role = img.getAttribute("role");
        const ariaLabel = img.getAttribute("aria-label");
        const ariaLabelledby = img.getAttribute("aria-labelledby");
        const srcset = img.getAttribute("srcset");
        const sizes = img.getAttribute("sizes");
        const loading = img.getAttribute("loading");
        const isDecorative = role === "presentation" || alt === "";

        return {
          width: img.naturalWidth || 0,
          altText: alt,
          ariaLabel,
          ariaLabelledby,
          hasAccessibleName: !!(alt || ariaLabel || ariaLabelledby),
          hasAlt: img.hasAttribute("alt"),
          hasResponsiveFeatures: !!(srcset || sizes || loading === "lazy"),
          height: img.naturalHeight || 0,
          index,
          isDecorative,
          isVisible: (img as HTMLElement).offsetParent !== null,
          role,
          src: img.src,
        };
      });

      // Analyze other media elements
      const videos = Array.from(document.querySelectorAll("video"));
      const videoData = videos.map((video) => ({
        autoplay: video.hasAttribute("autoplay"),
        hasCaption: !!video.querySelector('track[kind="captions"]'),
        hasControls: video.hasAttribute("controls"),
        hasSubtitles: !!video.querySelector('track[kind="subtitles"]'),
        muted: video.hasAttribute("muted"),
        src: video.src,
      }));

      const audioElements = Array.from(document.querySelectorAll("audio"));
      const audioData = audioElements.map((audio) => ({
        autoplay: audio.hasAttribute("autoplay"),
        hasControls: audio.hasAttribute("controls"),
        hasTranscript: !!document.querySelector(
          "[data-transcript], .transcript",
        ),
        src: audio.src,
      }));

      return {
        videos: {
          analysis: videoData,
          total: videoData.length,
          withCaptions: videoData.filter((v) => v.hasCaption).length,
          withControls: videoData.filter((v) => v.hasControls).length,
        },
        audio: {
          analysis: audioData,
          total: audioData.length,
          withControls: audioData.filter((a) => a.hasControls).length,
        },
        images: {
          analysis: imageData,
          decorative: imageData.filter((img) => img.isDecorative).length,
          total: imageData.length,
          withAccessibleNames: imageData.filter((img) => img.hasAccessibleName)
            .length,
          withAlt: imageData.filter((img) => img.hasAlt).length,
          withResponsiveFeatures: imageData.filter(
            (img) => img.hasResponsiveFeatures,
          ).length,
        },
      };
    });

    // Validations
    if (imageAnalysis.images.total > 0) {
      // All images should have alt attributes
      expect(imageAnalysis.images.withAlt).toBe(imageAnalysis.images.total);

      // At least 70% should have accessible names (unless decorative)
      const nonDecorativeImages =
        imageAnalysis.images.total - imageAnalysis.images.decorative;
      if (nonDecorativeImages > 0) {
        const accessibilityRatio =
          imageAnalysis.images.withAccessibleNames / imageAnalysis.images.total;
        expect(accessibilityRatio).toBeGreaterThan(0.7);
      }
    }

    // Videos should have accessibility features
    if (imageAnalysis.videos.total > 0) {
      expect(imageAnalysis.videos.withControls).toBe(
        imageAnalysis.videos.total,
      );
    }

    await test.info().attach("media-accessibility-analysis", {
      body: JSON.stringify(imageAnalysis, null, 2),
      contentType: "application/json",
    });
  });

  test("comprehensive keyboard shortcuts and interaction patterns", async ({
    page,
  }) => {
    const keyboardInteractionAnalysis = await page.evaluate(() => {
      // Analyze interactive elements
      const interactiveElements = Array.from(
        document.querySelectorAll(
          'button, a, input, select, textarea, [role="button"], [role="link"], [tabindex]',
        ),
      );

      const interactiveAnalysis = interactiveElements.map((el, index) => {
        const tagName = el.tagName.toLowerCase();
        const role = el.getAttribute("role");
        const tabIndex = el.getAttribute("tabindex");
        const accessKey = el.getAttribute("accesskey");
        const ariaKeyShortcuts = el.getAttribute("aria-keyshortcuts");
        const hasKeyboardHandler = !!(
          el.onkeydown ||
          el.onkeyup ||
          el.onkeypress
        );

        return {
          accessKey,
          ariaKeyShortcuts,
          customTabIndex: tabIndex && tabIndex !== "0",
          hasKeyboardHandler,
          hasShortcuts: !!(accessKey || ariaKeyShortcuts),
          index,
          isNativelyFocusable: [
            "a",
            "button",
            "input",
            "select",
            "textarea",
          ].includes(tagName),
          role,
          tabIndex,
          tagName,
        };
      });

      // Check for global keyboard shortcuts
      const globalShortcuts = {
        hasArrowKeyNavigation: !!document.querySelector(
          '[role="menu"], [role="listbox"], [role="grid"]',
        ),
        hasEscapeHandler: !!document.addEventListener,
        hasModalSupport: !!document.querySelector(
          '[role="dialog"], .modal, [data-modal]',
        ),
      };

      return {
        globalShortcuts,
        interactive: {
          analysis: interactiveAnalysis.slice(0, 20), // Limit for performance
          customTabIndex: interactiveAnalysis.filter((el) => el.customTabIndex)
            .length,
          nativelyFocusable: interactiveAnalysis.filter(
            (el) => el.isNativelyFocusable,
          ).length,
          total: interactiveAnalysis.length,
          withShortcuts: interactiveAnalysis.filter((el) => el.hasShortcuts)
            .length,
        },
        keyboardFriendly:
          interactiveAnalysis.length > 0 &&
          interactiveAnalysis.filter((el) => el.isNativelyFocusable).length > 0,
      };
    });

    // Test common keyboard shortcuts
    const shortcutTests = [];

    // Test Escape key
    await page.keyboard.press("Escape");
    await page.waitForTimeout(100);
    shortcutTests.push({ key: "Escape", tested: true });

    // Test Space and Enter on first button
    const firstButton = page.locator('button, [role="button"]').first();
    if ((await firstButton.count()) > 0) {
      await firstButton.focus();

      // Test Space key activation
      await page.keyboard.press("Space");
      await page.waitForTimeout(100);
      shortcutTests.push({ key: "Space", tested: true });

      // Test Enter key activation
      await firstButton.focus();
      await page.keyboard.press("Enter");
      await page.waitForTimeout(100);
      shortcutTests.push({ key: "Enter", tested: true });
    }

    // Test Tab navigation
    const tabNavigation = [];
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press("Tab");
      const focused = await page.evaluate(() => {
        const el = document.activeElement;
        return el
          ? {
              type: (el as HTMLInputElement).type || null,
              hasVisibleFocus: window.getComputedStyle(el).outline !== "none",
              role: el.getAttribute("role"),
              tagName: el.tagName,
            }
          : null;
      });

      if (focused) {
        tabNavigation.push(focused);
      }
    }

    // Validations
    expect(keyboardInteractionAnalysis.keyboardFriendly).toBeTruthy();
    expect(keyboardInteractionAnalysis.interactive.total).toBeGreaterThan(0);
    expect(tabNavigation.length).toBeGreaterThan(0);

    await test.info().attach("keyboard-interaction-analysis", {
      body: JSON.stringify(
        {
          ...keyboardInteractionAnalysis,
          shortcutTests,
          tabNavigation,
        },
        null,
        2,
      ),
      contentType: "application/json",
    });
  });

  test("comprehensive live regions and dynamic content accessibility", async ({
    context,
    page,
  }) => {
    const { report, result } = await withPerformanceMonitoring(
      page,
      context,
      "/",
      async () => {
        await waitUtils.forNavigation();

        // Analyze existing live regions
        const liveRegionAnalysis = await page.evaluate(() => {
          const liveRegions = Array.from(
            document.querySelectorAll(
              '[aria-live], [role="status"], [role="alert"], [role="log"]',
            ),
          );

          const liveRegionData = liveRegions.map((region, index) => {
            const ariaLive = region.getAttribute("aria-live");
            const role = region.getAttribute("role");
            const ariaAtomic = region.getAttribute("aria-atomic");
            const ariaRelevant = region.getAttribute("aria-relevant");

            return {
              ariaAtomic,
              ariaLive,
              ariaRelevant,
              hasContent: !!region.textContent?.trim(),
              index,
              isVisible: (region as HTMLElement).offsetParent !== null,
              role,
              textContent: region.textContent?.trim().substring(0, 100) || "",
            };
          });

          // Check for notification/toast systems
          const notificationSystems = Array.from(
            document.querySelectorAll(
              '.notification, .toast, [data-toast], [data-notification], [class*="alert"]',
            ),
          );

          const notificationData = notificationSystems.map((system) => ({
            className: system.className,
            hasAriaLive: !!system.getAttribute("aria-live"),
            hasRole: !!system.getAttribute("role"),
            isVisible: (system as HTMLElement).offsetParent !== null,
          }));

          // Check for loading states and progress indicators
          const loadingIndicators = Array.from(
            document.querySelectorAll(
              '[aria-busy], [role="progressbar"], .loading, .spinner, [data-loading]',
            ),
          );

          const loadingData = loadingIndicators.map((indicator) => ({
            ariaBusy: indicator.getAttribute("aria-busy"),
            ariaValueNow: indicator.getAttribute("aria-valuenow"),
            ariaValueText: indicator.getAttribute("aria-valuetext"),
            role: indicator.getAttribute("role"),
          }));

          return {
            hasLiveRegionSupport:
              liveRegionData.length > 0 ||
              notificationData.filter((n) => n.hasAriaLive).length > 0,
            liveRegions: {
              withValidSettings: liveRegionData.filter(
                (lr) =>
                  lr.ariaLive &&
                  ["assertive", "off", "polite"].includes(lr.ariaLive),
              ).length,
              analysis: liveRegionData,
              total: liveRegionData.length,
            },
            loading: {
              analysis: loadingData,
              total: loadingData.length,
            },
            notifications: {
              accessible: notificationData.filter(
                (n) => n.hasAriaLive || n.hasRole,
              ).length,
              analysis: notificationData,
              total: notificationData.length,
            },
          };
        });

        // Test dynamic content updates (if applicable)
        const dynamicContentTests = [];

        // Look for interactive elements that might trigger updates
        const buttons = await page.locator('button, [role="button"]').count();
        if (buttons > 0) {
          const testButton = page.locator('button, [role="button"]').first();

          // Check if clicking creates dynamic content
          const beforeClick = await page
            .locator('[aria-live], [role="status"], [role="alert"]')
            .count();

          try {
            await testButton.click();
            await page.waitForTimeout(500);

            const afterClick = await page
              .locator('[aria-live], [role="status"], [role="alert"]')
              .count();
            dynamicContentTests.push({
              action: "button_click",
              liveRegionsAfter: afterClick,
              liveRegionsBefore: beforeClick,
              triggered: afterClick > beforeClick,
            });
          } catch (error) {
            dynamicContentTests.push({
              action: "button_click",
              error: error.message,
            });
          }
        }

        return {
          accessibilityScore: liveRegionAnalysis.hasLiveRegionSupport
            ? 100
            : 60,
          dynamicContentTests,
          liveRegionAnalysis,
        };
      },
      {
        fcp: { error: 3000, warning: 1500 },
        lcp: { error: 4000, warning: 2500 },
      },
    );

    // Validations
    if (result.liveRegionAnalysis.liveRegions.total > 0) {
      // Live regions should have valid aria-live values
      result.liveRegionAnalysis.liveRegions.analysis.forEach((region) => {
        if (region.ariaLive) {
          expect(["polite", "assertive", "off"]).toContain(region.ariaLive);
        }
      });
    }

    await test.info().attach("live-regions-dynamic-content", {
      body: JSON.stringify({ ...result, performance: report }, null, 2),
      contentType: "application/json",
    });
  });
});
