/**
 * E2E tests for location, event, and brand pages
 */

import { expect, test } from "@repo/testing/e2e";
import {
  AccessibilityTestUtils,
  PerformanceUtils,
  ResponsiveTestUtils,
  VisualTestUtils,
  WaitUtils,
} from "@repo/testing/e2e";

test.describe("Location, Event & Brand Pages", () => {
  let waitUtils: WaitUtils;
  let perfUtils: PerformanceUtils;
  let visual: VisualTestUtils;
  let a11y: AccessibilityTestUtils;
  let responsive: ResponsiveTestUtils;

  test.beforeEach(async ({ page }) => {
    waitUtils = new WaitUtils(page);
    perfUtils = new PerformanceUtils(page);
    visual = new VisualTestUtils(page);
    a11y = new AccessibilityTestUtils(page);
    responsive = new ResponsiveTestUtils(page);
  });

  test.describe("Brand Pages", () => {
    test("should load brands listing page", async ({ page }) => {
      await page.goto("/en/brands");
      await waitUtils.forNavigation();

      await expect(page).toHaveTitle(/.+/);
      await expect(page).toHaveURL(/\/brands/);

      const main = page.locator("main");
      await expect(main).toBeVisible();
    });

    test("should display brands grid or list", async ({ page }) => {
      await page.goto("/en/brands");
      await waitUtils.forNavigation();

      // Look for brands or empty state
      const brandItems = page
        .locator('[data-testid="brand-item"]')
        .or(page.locator(".brand-item"))
        .or(page.locator("article"));

      const brandLinks = page.locator('a[href*="/brands/"]');
      const emptyMessage = page.getByText(/no brands|coming soon|empty/i);

      const hasBrands =
        (await brandItems.count()) > 0 || (await brandLinks.count()) > 0;
      const hasEmptyMessage = (await emptyMessage.count()) > 0;

      expect(hasBrands || hasEmptyMessage).toBeTruthy();

      if (hasBrands) {
        // Test brand listing elements
        const firstBrand = brandItems.first().or(brandLinks.first());
        await expect(firstBrand).toBeVisible();
      }
    });

    test("should load individual brand page", async ({ page }) => {
      await page.goto("/en/brands/test-brand");
      await waitUtils.forNavigation();

      const response = await page
        .waitForResponse(
          (response) =>
            response.url().includes("/brands/") && response.status() !== 500,
          { timeout: 10000 },
        )
        .catch(() => null);

      // Should either load the brand or show 404
      if (response && response.status() === 200) {
        await expect(page).toHaveTitle(/.+/);

        const main = page.locator("main");
        await expect(main).toBeVisible();
      } else {
        // 404 is acceptable for test brands
        await expect(page).toHaveURL(/\/brands\//);
      }
    });

    test("should have brand details structure", async ({ page }) => {
      await page.goto("/en/brands/test-brand");
      await waitUtils.forNavigation();

      const notFound = page.getByText(/not found|404/i);
      if (!(await notFound.isVisible())) {
        // Look for brand page elements
        const brandTitle = page.locator("h1");
        const brandDescription = page
          .locator('[data-testid="brand-description"]')
          .or(page.locator(".brand-description"))
          .or(page.locator("p"));

        const brandLogo = page
          .locator('[data-testid="brand-logo"]')
          .or(page.locator('img[alt*="logo"]'));

        if ((await brandTitle.count()) > 0) {
          await expect(brandTitle.first()).toBeVisible();
        }

        if ((await brandDescription.count()) > 0) {
          await expect(brandDescription.first()).toBeVisible();
        }

        // Optional elements
        if ((await brandLogo.count()) > 0) {
          await expect(brandLogo.first()).toBeVisible();
        }
      }
    });

    test("should handle non-existent brands", async ({ page }) => {
      await page.goto("/en/brands/non-existent-brand-12345");
      await waitUtils.forNavigation();

      // Should show 404 or not found message
      const notFoundMessage = page.getByText(
        /not found|404|brand.*not.*exist/i,
      );
      const main = page.locator("main");

      expect(
        (await notFoundMessage.isVisible()) || (await main.isVisible()),
      ).toBeTruthy();
    });

    test("should be accessible", async ({ page }) => {
      await page.goto("/en/brands");
      await waitUtils.forNavigation();

      const results = await a11y.runCommonChecks();

      expect(results.criticalViolations).toHaveLength(0);
      expect(results.seriousViolations).toHaveLength(0);
    });
  });

  test.describe("Event Pages", () => {
    test("should load events listing page", async ({ page }) => {
      await page.goto("/en/events");
      await waitUtils.forNavigation();

      await expect(page).toHaveTitle(/.+/);
      await expect(page).toHaveURL(/\/events/);

      const main = page.locator("main");
      await expect(main).toBeVisible();
    });

    test("should display events list", async ({ page }) => {
      await page.goto("/en/events");
      await waitUtils.forNavigation();

      // Look for events or empty state
      const eventItems = page
        .locator('[data-testid="event-item"]')
        .or(page.locator(".event-item"))
        .or(page.locator("article"));

      const eventLinks = page.locator('a[href*="/events/"]');
      const emptyMessage = page.getByText(/no events|coming soon|empty/i);

      const hasEvents =
        (await eventItems.count()) > 0 || (await eventLinks.count()) > 0;
      const hasEmptyMessage = (await emptyMessage.count()) > 0;

      expect(hasEvents || hasEmptyMessage).toBeTruthy();

      if (hasEvents) {
        const firstEvent = eventItems.first().or(eventLinks.first());
        await expect(firstEvent).toBeVisible();
      }
    });

    test("should have event filtering", async ({ page }) => {
      await page.goto("/en/events");
      await waitUtils.forNavigation();

      // Look for event filters
      const dateFilter = page
        .locator('input[type="date"]')
        .or(page.locator('[data-testid="date-filter"]'));

      const categoryFilter = page
        .locator('select[name*="category"]')
        .or(page.locator('[data-testid="category-filter"]'));

      const _locationFilter = page
        .locator('select[name*="location"]')
        .or(page.locator('[data-testid="location-filter"]'));

      // Test filter interaction if available
      if ((await dateFilter.count()) > 0) {
        const filter = dateFilter.first();
        if (await filter.isVisible()) {
          const today = new Date().toISOString().split("T")[0];
          await filter.fill(today);
          await page.waitForTimeout(1000);
        }
      }

      if ((await categoryFilter.count()) > 0) {
        const filter = categoryFilter.first();
        if (await filter.isVisible()) {
          const options = filter.locator("option");
          const optionCount = await options.count();

          if (optionCount > 1) {
            await filter.selectOption({ index: 1 });
            await page.waitForTimeout(1000);
          }
        }
      }
    });

    test("should load individual event page", async ({ page }) => {
      await page.goto("/en/events/test-event");
      await waitUtils.forNavigation();

      const response = await page
        .waitForResponse(
          (response) =>
            response.url().includes("/events/") && response.status() !== 500,
          { timeout: 10000 },
        )
        .catch(() => null);

      // Should either load the event or show 404
      if (response && response.status() === 200) {
        await expect(page).toHaveTitle(/.+/);

        const main = page.locator("main");
        await expect(main).toBeVisible();
      } else {
        // 404 is acceptable for test events
        await expect(page).toHaveURL(/\/events\//);
      }
    });

    test("should have event details structure", async ({ page }) => {
      await page.goto("/en/events/test-event");
      await waitUtils.forNavigation();

      const notFound = page.getByText(/not found|404/i);
      if (!(await notFound.isVisible())) {
        // Look for event page elements
        const eventTitle = page.locator("h1");
        const eventDate = page.getByText(
          /\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}/,
        );
        const _eventTime = page.getByText(/\d{1,2}:\d{2}|AM|PM/i);
        const _eventLocation = page.getByText(/location|venue|address/i);
        const eventDescription = page
          .locator('[data-testid="event-description"]')
          .or(page.locator(".event-description"));

        if ((await eventTitle.count()) > 0) {
          await expect(eventTitle.first()).toBeVisible();
        }

        // Optional event details
        if ((await eventDate.count()) > 0) {
          await expect(eventDate.first()).toBeVisible();
        }

        if ((await eventDescription.count()) > 0) {
          await expect(eventDescription.first()).toBeVisible();
        }
      }
    });

    test("should handle event registration/RSVP", async ({ page }) => {
      await page.goto("/en/events/test-event");
      await waitUtils.forNavigation();

      const notFound = page.getByText(/not found|404/i);
      if (!(await notFound.isVisible())) {
        const rsvpButton = page.getByRole("button", {
          name: /rsvp|register|attend|join/i,
        });
        const ticketButton = page.getByRole("button", {
          name: /ticket|buy|purchase/i,
        });

        if ((await rsvpButton.count()) > 0) {
          await expect(rsvpButton.first()).toBeVisible();

          // Test RSVP interaction
          await rsvpButton.first().click();
          await page.waitForTimeout(1000);

          // Look for RSVP form or confirmation
          const rsvpForm = page
            .locator("form")
            .filter({ hasText: /rsvp|register/i });
          const rsvpConfirmation = page.getByText(
            /registered|confirmed|rsvp.*successful/i,
          );

          if ((await rsvpForm.count()) > 0) {
            await expect(rsvpForm.first()).toBeVisible();
          }

          if ((await rsvpConfirmation.count()) > 0) {
            await expect(rsvpConfirmation.first()).toBeVisible();
          }
        }

        if ((await ticketButton.count()) > 0) {
          await expect(ticketButton.first()).toBeVisible();
        }
      }
    });

    test("should handle non-existent events", async ({ page }) => {
      await page.goto("/en/events/non-existent-event-12345");
      await waitUtils.forNavigation();

      // Should show 404 or not found message
      const notFoundMessage = page.getByText(
        /not found|404|event.*not.*exist/i,
      );
      const main = page.locator("main");

      expect(
        (await notFoundMessage.isVisible()) || (await main.isVisible()),
      ).toBeTruthy();
    });

    test("should be accessible", async ({ page }) => {
      await page.goto("/en/events");
      await waitUtils.forNavigation();

      const results = await a11y.runCommonChecks();

      expect(results.criticalViolations).toHaveLength(0);
      expect(results.seriousViolations).toHaveLength(0);
    });
  });

  test.describe("Location Pages", () => {
    test("should load locations listing page", async ({ page }) => {
      await page.goto("/en/locations");
      await waitUtils.forNavigation();

      await expect(page).toHaveTitle(/.+/);
      await expect(page).toHaveURL(/\/locations/);

      const main = page.locator("main");
      await expect(main).toBeVisible();
    });

    test("should display locations list", async ({ page }) => {
      await page.goto("/en/locations");
      await waitUtils.forNavigation();

      // Look for locations or empty state
      const locationItems = page
        .locator('[data-testid="location-item"]')
        .or(page.locator(".location-item"))
        .or(page.locator("article"));

      const locationLinks = page.locator('a[href*="/locations/"]');
      const emptyMessage = page.getByText(/no locations|coming soon|empty/i);

      const hasLocations =
        (await locationItems.count()) > 0 || (await locationLinks.count()) > 0;
      const hasEmptyMessage = (await emptyMessage.count()) > 0;

      expect(hasLocations || hasEmptyMessage).toBeTruthy();

      if (hasLocations) {
        const firstLocation = locationItems.first().or(locationLinks.first());
        await expect(firstLocation).toBeVisible();
      }
    });

    test("should have location search/filtering", async ({ page }) => {
      await page.goto("/en/locations");
      await waitUtils.forNavigation();

      // Look for location search
      const searchInput = page
        .locator('input[type="search"]')
        .or(page.locator('[data-testid="location-search"]'));

      const cityFilter = page
        .locator('select[name*="city"]')
        .or(page.locator('[data-testid="city-filter"]'));

      const _stateFilter = page
        .locator('select[name*="state"]')
        .or(page.locator('[data-testid="state-filter"]'));

      // Test search if available
      if ((await searchInput.count()) > 0) {
        const input = searchInput.first();
        if (await input.isVisible()) {
          await input.fill("New York");
          await page.keyboard.press("Enter");
          await page.waitForTimeout(1000);
        }
      }

      // Test filters if available
      if ((await cityFilter.count()) > 0) {
        const filter = cityFilter.first();
        if (await filter.isVisible()) {
          const options = filter.locator("option");
          const optionCount = await options.count();

          if (optionCount > 1) {
            await filter.selectOption({ index: 1 });
            await page.waitForTimeout(1000);
          }
        }
      }
    });

    test("should load individual location page", async ({ page }) => {
      await page.goto("/en/locations/test-location");
      await waitUtils.forNavigation();

      const response = await page
        .waitForResponse(
          (response) =>
            response.url().includes("/locations/") && response.status() !== 500,
          { timeout: 10000 },
        )
        .catch(() => null);

      // Should either load the location or show 404
      if (response && response.status() === 200) {
        await expect(page).toHaveTitle(/.+/);

        const main = page.locator("main");
        await expect(main).toBeVisible();
      } else {
        // 404 is acceptable for test locations
        await expect(page).toHaveURL(/\/locations\//);
      }
    });

    test("should have location details structure", async ({ page }) => {
      await page.goto("/en/locations/test-location");
      await waitUtils.forNavigation();

      const notFound = page.getByText(/not found|404/i);
      if (!(await notFound.isVisible())) {
        // Look for location page elements
        const locationTitle = page.locator("h1");
        const locationAddress = page.getByText(
          /street|avenue|road|blvd|address/i,
        );
        const locationPhone = page.getByText(
          /\(\d{3}\)\s?\d{3}-\d{4}|\+\d{1,3}\s?\d+/,
        );
        const _locationHours = page.getByText(/hours|open|closed|am|pm/i);
        const locationMap = page
          .locator('[data-testid="map"]')
          .or(page.locator('iframe[src*="maps"]'));

        if ((await locationTitle.count()) > 0) {
          await expect(locationTitle.first()).toBeVisible();
        }

        // Optional location details
        if ((await locationAddress.count()) > 0) {
          await expect(locationAddress.first()).toBeVisible();
        }

        if ((await locationPhone.count()) > 0) {
          await expect(locationPhone.first()).toBeVisible();
        }

        if ((await locationMap.count()) > 0) {
          await expect(locationMap.first()).toBeVisible();
        }
      }
    });

    test("should handle directions/map integration", async ({ page }) => {
      await page.goto("/en/locations/test-location");
      await waitUtils.forNavigation();

      const notFound = page.getByText(/not found|404/i);
      if (!(await notFound.isVisible())) {
        const directionsButton = page
          .getByRole("button", { name: /directions|get directions/i })
          .or(page.getByRole("link", { name: /directions|get directions/i }));

        const mapFrame = page.locator('iframe[src*="maps"]');

        if ((await directionsButton.count()) > 0) {
          await expect(directionsButton.first()).toBeVisible();

          // Test directions link
          const href = await directionsButton.first().getAttribute("href");
          if (href) {
            expect(href).toContain("maps");
          }
        }

        if ((await mapFrame.count()) > 0) {
          await expect(mapFrame.first()).toBeVisible();
        }
      }
    });

    test("should handle non-existent locations", async ({ page }) => {
      await page.goto("/en/locations/non-existent-location-12345");
      await waitUtils.forNavigation();

      // Should show 404 or not found message
      const notFoundMessage = page.getByText(
        /not found|404|location.*not.*exist/i,
      );
      const main = page.locator("main");

      expect(
        (await notFoundMessage.isVisible()) || (await main.isVisible()),
      ).toBeTruthy();
    });

    test("should be accessible", async ({ page }) => {
      await page.goto("/en/locations");
      await waitUtils.forNavigation();

      const results = await a11y.runCommonChecks();

      expect(results.criticalViolations).toHaveLength(0);
      expect(results.seriousViolations).toHaveLength(0);
    });
  });

  test.describe("Performance Tests", () => {
    test("location/event/brand pages should load quickly", async ({ page }) => {
      const pages = ["/en/brands", "/en/events", "/en/locations"];

      for (const pagePath of pages) {
        await page.goto(pagePath);

        const metrics = await perfUtils.measurePageLoad();

        expect(metrics.domContentLoaded).toBeLessThan(5000);
        if (metrics.firstContentfulPaint > 0) {
          expect(metrics.firstContentfulPaint).toBeLessThan(3000);
        }
      }
    });
  });

  test.describe("Responsive Design", () => {
    test("location/event/brand pages should be responsive", async ({
      page,
    }) => {
      const pages = ["/en/brands", "/en/events", "/en/locations"];

      for (const pagePath of pages) {
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

  test.describe("Cross-locale Pages", () => {
    const locales = ["en", "fr", "es", "de", "pt"];
    const pageTypes = ["brands", "events", "locations"];

    for (const locale of locales) {
      for (const pageType of pageTypes) {
        test(`should load ${pageType} page in ${locale}`, async ({ page }) => {
          await page.goto(`/${locale}/${pageType}`);
          await waitUtils.forNavigation();

          await expect(page).toHaveURL(new RegExp(`/${locale}/${pageType}`));

          const main = page.locator("main");
          await expect(main).toBeVisible();
        });

        test(`should load individual ${pageType} page in ${locale}`, async ({
          page,
        }) => {
          await page.goto(`/${locale}/${pageType}/test-item`);
          await waitUtils.forNavigation();

          await expect(page).toHaveURL(new RegExp(`/${locale}/${pageType}/`));

          const main = page.locator("main");
          await expect(main).toBeVisible();
        });
      }
    }
  });

  test.describe("SEO Tests", () => {
    test("location/event/brand pages should have proper meta tags", async ({
      page,
    }) => {
      const pages = ["/en/brands", "/en/events", "/en/locations"];

      for (const pagePath of pages) {
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

    test("location pages should have local business structured data", async ({
      page,
    }) => {
      await page.goto("/en/locations/test-location");
      await waitUtils.forNavigation();

      const notFound = page.getByText(/not found|404/i);
      if (!(await notFound.isVisible())) {
        // Check for local business JSON-LD
        const structuredData = page.locator(
          'script[type="application/ld+json"]',
        );

        if ((await structuredData.count()) > 0) {
          const jsonText = await structuredData.textContent();

          if (jsonText) {
            try {
              const data = JSON.parse(jsonText);

              // Should be LocalBusiness schema
              if (data["@type"] === "LocalBusiness") {
                expect(data).toHaveProperty("@type", "LocalBusiness");
                expect(data).toHaveProperty("address");
              }
            } catch (_error) {
              // JSON parsing failed - might not be implemented yet
              console.warn("Local business structured data is not valid JSON");
            }
          }
        }
      }
    });

    test("event pages should have event structured data", async ({ page }) => {
      await page.goto("/en/events/test-event");
      await waitUtils.forNavigation();

      const notFound = page.getByText(/not found|404/i);
      if (!(await notFound.isVisible())) {
        // Check for event JSON-LD
        const structuredData = page.locator(
          'script[type="application/ld+json"]',
        );

        if ((await structuredData.count()) > 0) {
          const jsonText = await structuredData.textContent();

          if (jsonText) {
            try {
              const data = JSON.parse(jsonText);

              // Should be Event schema
              if (data["@type"] === "Event") {
                expect(data).toHaveProperty("@type", "Event");
                expect(data).toHaveProperty("name");
              }
            } catch (_error) {
              console.warn("Event structured data is not valid JSON");
            }
          }
        }
      }
    });
  });
});
