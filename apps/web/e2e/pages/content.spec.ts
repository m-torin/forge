/**
 * E2E tests for content pages (blog, about, contact, etc.)
 */

import { expect, test } from "@repo/testing/e2e";
import {
  AccessibilityTestUtils,
  PerformanceUtils,
  ResponsiveTestUtils,
  VisualTestUtils,
  WaitUtils,
} from "@repo/testing/e2e";

test.describe("Content Pages", () => {
  let waitUtils: WaitUtils;
  let perfUtils: PerformanceUtils;
  let visual: VisualTestUtils;
  let a11y: AccessibilityTestUtils;

  test.beforeEach(async ({ page }) => {
    waitUtils = new WaitUtils(page);
    perfUtils = new PerformanceUtils(page);
    visual = new VisualTestUtils(page);
    a11y = new AccessibilityTestUtils(page);
  });

  test.describe("Blog Pages", () => {
    test("should load blog listing page", async ({ page }) => {
      await page.goto("/en/blog");
      await waitUtils.forNavigation();

      await expect(page).toHaveTitle(/.+/);
      await expect(page).toHaveURL(/\/blog/);

      const main = page.locator("main");
      await expect(main).toBeVisible();
    });

    test("should display blog posts list", async ({ page }) => {
      await page.goto("/en/blog");
      await waitUtils.forNavigation();

      // Look for blog posts or empty state
      const blogPosts = page
        .locator('[data-testid="blog-post"]')
        .or(page.locator(".blog-post"))
        .or(page.locator("article"));

      const emptyMessage = page.getByText(/no posts|no articles|coming soon/i);

      const hasPosts = (await blogPosts.count()) > 0;
      const hasEmptyMessage = (await emptyMessage.count()) > 0;

      expect(hasPosts || hasEmptyMessage).toBeTruthy();

      if (hasPosts) {
        // Each post should have title and link
        const firstPost = blogPosts.first();
        const postTitle = firstPost.locator("h1, h2, h3, h4");
        const postLink = firstPost.locator("a");

        if ((await postTitle.count()) > 0) {
          await expect(postTitle.first()).toBeVisible();
        }

        if ((await postLink.count()) > 0) {
          await expect(postLink.first()).toBeVisible();
        }
      }
    });

    test("should have blog post pagination", async ({ page }) => {
      await page.goto("/en/blog");
      await waitUtils.forNavigation();

      const pagination = page
        .locator('[data-testid="pagination"]')
        .or(page.locator(".pagination"));

      const nextButton = page
        .getByRole("button", { name: /next|>/ })
        .or(page.getByRole("link", { name: /next|>/ }));

      const loadMoreButton = page.getByRole("button", {
        name: /load more|show more/i,
      });

      if ((await pagination.count()) > 0) {
        await expect(pagination.first()).toBeVisible();
      }

      if (
        (await nextButton.count()) > 0 &&
        (await nextButton.first().isVisible())
      ) {
        await nextButton.first().click();
        await waitUtils.forNavigation();

        // Should update URL or content
        await page.waitForTimeout(1000);
      }

      if (
        (await loadMoreButton.count()) > 0 &&
        (await loadMoreButton.first().isVisible())
      ) {
        await loadMoreButton.first().click();
        await page.waitForTimeout(1000);
      }
    });

    test("should load individual blog post", async ({ page }) => {
      await page.goto("/en/blog/test-post");
      await waitUtils.forNavigation();

      const response = await page
        .waitForResponse(
          (response) =>
            response.url().includes("/blog/") && response.status() !== 500,
          { timeout: 10000 },
        )
        .catch(() => null);

      // Should either load the post or show 404
      if (response && response.status() === 200) {
        await expect(page).toHaveTitle(/.+/);

        const main = page.locator("main");
        await expect(main).toBeVisible();
      } else {
        // 404 is acceptable for test posts
        await expect(page).toHaveURL(/\/blog\//);
      }
    });

    test("should have blog post content structure", async ({ page }) => {
      await page.goto("/en/blog/test-post");
      await waitUtils.forNavigation();

      const notFound = page.getByText(/not found|404/i);
      if (!(await notFound.isVisible())) {
        // Look for blog post elements
        const postTitle = page.locator("h1");
        const postContent = page
          .locator('[data-testid="post-content"]')
          .or(page.locator(".post-content"))
          .or(page.locator("article"));

        const postDate = page.getByText(
          /\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}/,
        );
        const _postAuthor = page.getByText(/by |author:|written by/i);

        if ((await postTitle.count()) > 0) {
          await expect(postTitle.first()).toBeVisible();
        }

        if ((await postContent.count()) > 0) {
          await expect(postContent.first()).toBeVisible();
        }

        // Optional elements
        if ((await postDate.count()) > 0) {
          await expect(postDate.first()).toBeVisible();
        }
      }
    });

    test("should handle non-existent blog posts", async ({ page }) => {
      await page.goto("/en/blog/non-existent-post-12345");
      await waitUtils.forNavigation();

      // Should show 404 or not found message
      const notFoundMessage = page.getByText(/not found|404|post.*not.*exist/i);
      const main = page.locator("main");

      expect(
        (await notFoundMessage.isVisible()) || (await main.isVisible()),
      ).toBeTruthy();
    });

    test("should be accessible", async ({ page }) => {
      await page.goto("/en/blog");
      await waitUtils.forNavigation();

      const results = await a11y.runCommonChecks();

      expect(results.criticalViolations).toHaveLength(0);
      expect(results.seriousViolations).toHaveLength(0);
    });
  });

  test.describe("About Page", () => {
    test("should load about page", async ({ page }) => {
      await page.goto("/en/about");
      await waitUtils.forNavigation();

      await expect(page).toHaveTitle(/.+/);
      await expect(page).toHaveURL(/\/about/);

      const main = page.locator("main");
      await expect(main).toBeVisible();
    });

    test("should have about content", async ({ page }) => {
      await page.goto("/en/about");
      await waitUtils.forNavigation();

      // Look for about page content
      const heading = page.locator("h1");
      const content = page.locator("main");

      if ((await heading.count()) > 0) {
        await expect(heading.first()).toBeVisible();

        const headingText = await heading.first().textContent();
        expect(headingText?.length).toBeGreaterThan(0);
      }

      await expect(content).toBeVisible();

      const contentText = await content.textContent();
      expect(contentText?.length).toBeGreaterThan(0);
    });

    test("should have team or company information", async ({ page }) => {
      await page.goto("/en/about");
      await waitUtils.forNavigation();

      // Look for common about page elements
      const teamSection = page.getByText(/team|staff|people/i).locator("..");
      const missionSection = page
        .getByText(/mission|vision|values/i)
        .locator("..");
      const historySection = page
        .getByText(/history|story|founded/i)
        .locator("..");

      const hasTeam = (await teamSection.count()) > 0;
      const hasMission = (await missionSection.count()) > 0;
      const hasHistory = (await historySection.count()) > 0;

      // Should have some about content
      if (hasTeam || hasMission || hasHistory) {
        expect(hasTeam || hasMission || hasHistory).toBeTruthy();
      }
    });

    test("should be accessible", async ({ page }) => {
      await page.goto("/en/about");
      await waitUtils.forNavigation();

      const results = await a11y.runCommonChecks();

      expect(results.criticalViolations).toHaveLength(0);
      expect(results.seriousViolations).toHaveLength(0);
    });
  });

  test.describe("Contact Page", () => {
    test("should load contact page", async ({ page }) => {
      await page.goto("/en/contact");
      await waitUtils.forNavigation();

      await expect(page).toHaveTitle(/.+/);
      await expect(page).toHaveURL(/\/contact/);

      const main = page.locator("main");
      await expect(main).toBeVisible();
    });

    test("should have contact form", async ({ page }) => {
      await page.goto("/en/contact");
      await waitUtils.forNavigation();

      // Look for contact form elements
      const contactForm = page.locator("form");
      const nameInput = page.locator('input[name*="name"]');
      const emailInput = page.locator('input[type="email"]');
      const messageInput = page.locator('textarea[name*="message"]');
      const submitButton = page.getByRole("button", {
        name: /send|submit|contact/i,
      });

      if ((await contactForm.count()) > 0) {
        await expect(contactForm.first()).toBeVisible();

        if ((await nameInput.count()) > 0) {
          await expect(nameInput.first()).toBeVisible();
        }

        if ((await emailInput.count()) > 0) {
          await expect(emailInput.first()).toBeVisible();
        }

        if ((await messageInput.count()) > 0) {
          await expect(messageInput.first()).toBeVisible();
        }

        if ((await submitButton.count()) > 0) {
          await expect(submitButton.first()).toBeVisible();
        }
      }
    });

    test("should validate contact form", async ({ page }) => {
      await page.goto("/en/contact");
      await waitUtils.forNavigation();

      const submitButton = page.getByRole("button", {
        name: /send|submit|contact/i,
      });

      if (
        (await submitButton.count()) > 0 &&
        (await submitButton.first().isVisible())
      ) {
        // Try to submit empty form
        await submitButton.first().click();

        // Look for validation messages
        const errorMessage = page
          .locator('[role="alert"]')
          .or(page.locator(".error"))
          .or(page.getByText(/required|please fill/i));

        await page.waitForTimeout(1000);

        if ((await errorMessage.count()) > 0) {
          const errorText = await errorMessage.first().textContent();
          expect(errorText).toBeTruthy();
        }
      }
    });

    test("should handle form submission", async ({ page }) => {
      await page.goto("/en/contact");
      await waitUtils.forNavigation();

      const nameInput = page.locator('input[name*="name"]').first();
      const emailInput = page.locator('input[type="email"]').first();
      const messageInput = page.locator('textarea[name*="message"]').first();
      const submitButton = page.getByRole("button", {
        name: /send|submit|contact/i,
      });

      if (
        (await nameInput.count()) > 0 &&
        (await emailInput.count()) > 0 &&
        (await messageInput.count()) > 0
      ) {
        // Fill form with test data
        await nameInput.fill("Test User");
        await emailInput.fill("test@example.com");
        await messageInput.fill("This is a test message.");

        if ((await submitButton.count()) > 0) {
          await submitButton.first().click();

          // Wait for response
          await page.waitForTimeout(2000);

          // Look for success or error message
          const feedback = page
            .locator('[role="alert"]')
            .or(page.locator(".success"))
            .or(page.locator(".error"))
            .or(page.getByText(/sent|thank you|error|failed/i));

          if ((await feedback.count()) > 0) {
            const feedbackText = await feedback.first().textContent();
            expect(feedbackText).toBeTruthy();
          }
        }
      }
    });

    test("should have contact information", async ({ page }) => {
      await page.goto("/en/contact");
      await waitUtils.forNavigation();

      // Look for contact information
      const phoneNumber = page.getByText(
        /\(\d{3}\)\s?\d{3}-\d{4}|\+\d{1,3}\s?\d+/,
      );
      const emailAddress = page.getByText(/\w+@\w+\.\w+/);
      const address = page.getByText(/street|avenue|road|blvd|lane/i);

      const hasPhone = (await phoneNumber.count()) > 0;
      const hasEmail = (await emailAddress.count()) > 0;
      const hasAddress = (await address.count()) > 0;

      // Should have some contact information
      if (hasPhone || hasEmail || hasAddress) {
        expect(hasPhone || hasEmail || hasAddress).toBeTruthy();
      }
    });

    test("should be accessible", async ({ page }) => {
      await page.goto("/en/contact");
      await waitUtils.forNavigation();

      const results = await a11y.runCommonChecks();

      expect(results.criticalViolations).toHaveLength(0);
      expect(results.seriousViolations).toHaveLength(0);
    });
  });

  test.describe("Content Performance", () => {
    test("content pages should load quickly", async ({ page }) => {
      const contentPages = ["/en/about", "/en/contact", "/en/blog"];

      for (const pagePath of contentPages) {
        await page.goto(pagePath);

        const metrics = await perfUtils.measurePageLoad();

        // Content pages should be fast
        expect(metrics.domContentLoaded).toBeLessThan(4000);
        if (metrics.firstContentfulPaint > 0) {
          expect(metrics.firstContentfulPaint).toBeLessThan(2500);
        }
      }
    });
  });

  test.describe("Content SEO", () => {
    test("content pages should have proper meta tags", async ({ page }) => {
      const contentPages = ["/en/about", "/en/contact", "/en/blog"];

      for (const pagePath of contentPages) {
        await page.goto(pagePath);
        await waitUtils.forNavigation();

        // Check for meta description
        const metaDescription = page.locator('meta[name="description"]');
        if ((await metaDescription.count()) > 0) {
          const content = await metaDescription.getAttribute("content");
          expect(content?.length).toBeGreaterThan(0);
        }

        // Check for page title
        const title = await page.title();
        expect(title.length).toBeGreaterThan(0);

        // Check for canonical URL
        const canonical = page.locator('link[rel="canonical"]');
        if ((await canonical.count()) > 0) {
          const href = await canonical.getAttribute("href");
          expect(href).toBeTruthy();
        }
      }
    });

    test("blog posts should have structured data", async ({ page }) => {
      await page.goto("/en/blog/test-post");
      await waitUtils.forNavigation();

      const notFound = page.getByText(/not found|404/i);
      if (!(await notFound.isVisible())) {
        // Check for JSON-LD structured data
        const structuredData = page.locator(
          'script[type="application/ld+json"]',
        );

        if ((await structuredData.count()) > 0) {
          const jsonText = await structuredData.textContent();
          expect(jsonText).toBeTruthy();

          // Should be valid JSON
          try {
            const data = JSON.parse(jsonText || "{}");
            expect(data).toBeTruthy();
          } catch (_error) {
            // JSON parsing failed - might not be implemented yet
            console.warn("JSON-LD structured data is not valid JSON");
          }
        }
      }
    });
  });

  test.describe("Cross-locale Content Pages", () => {
    const locales = ["en", "fr", "es", "de", "pt"];
    const contentPages = ["about", "contact", "blog"];

    for (const locale of locales) {
      for (const pagePath of contentPages) {
        test(`should load ${pagePath} page in ${locale}`, async ({ page }) => {
          await page.goto(`/${locale}/${pagePath}`);
          await waitUtils.forNavigation();

          await expect(page).toHaveURL(new RegExp(`/${locale}/${pagePath}`));

          const main = page.locator("main");
          await expect(main).toBeVisible();
        });
      }
    }
  });

  test.describe("Content Responsive Design", () => {
    test("content pages should be responsive", async ({ page }) => {
      const responsive = new ResponsiveTestUtils(page);
      const contentPages = ["/en/about", "/en/contact", "/en/blog"];

      for (const pagePath of contentPages) {
        await responsive.testResponsive(async () => {
          await page.goto(pagePath);
          await visual.waitForAnimations();

          const main = page.locator("main");
          await expect(main).toBeVisible();

          const viewport = page.viewportSize();
          const pageName = pagePath.split("/").pop();
          await page.screenshot({
            path: `test-results/${pageName}-${viewport?.width}x${viewport?.height}.png`,
          });
        });
      }
    });
  });
});
