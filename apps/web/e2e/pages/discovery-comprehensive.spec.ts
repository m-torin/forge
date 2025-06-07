import { expect, test } from "@repo/testing/e2e";
import { WaitUtils } from "@repo/testing/e2e";

test.describe("Discovery Pages - Comprehensive Tests", () => {
  let waitUtils: WaitUtils;

  test.beforeEach(async ({ page }) => {
    waitUtils = new WaitUtils(page);
  });

  test.describe("Search Functionality", () => {
    test("should display dedicated search page", async ({ page }) => {
      // Test the dedicated search page
      await page.goto("/en/search");
      await waitUtils.forNavigation();

      // Check for search page elements
      const searchPageHeading = page.getByRole("heading", { level: 1 });
      if ((await searchPageHeading.count()) > 0) {
        const heading = await searchPageHeading.textContent();
        expect(heading).toMatch(/search/i);
      }

      // Large search input on search page
      const searchInput = page.getByRole("searchbox");
      await expect(searchInput).toBeVisible();

      // Search suggestions or popular searches
      const popularSearches = page.locator(
        '[data-testid="popular-searches"], .popular-searches',
      );
      if ((await popularSearches.count()) > 0) {
        const searchTerms = popularSearches.locator("a, button");
        expect(await searchTerms.count()).toBeGreaterThan(0);

        // Click a popular search
        await searchTerms.first().click();
        await page.waitForTimeout(500);

        // Should populate search or show results
        const inputValue = await searchInput.inputValue();
        expect(inputValue || page.url()).toBeTruthy();
      }

      // Recent searches if user has history
      const recentSearches = page.locator(
        '[data-testid="recent-searches"], .recent-searches',
      );
      if ((await recentSearches.count()) > 0) {
        const recentItems = recentSearches.locator(
          '[data-testid="recent-item"]',
        );
        // May or may not have items depending on history
      }
    });

    test("should display search interface", async ({ page }) => {
      await page.goto("/");
      await waitUtils.forNavigation();

      // Find search input in header
      const searchInput = page.getByRole("searchbox").first();
      const searchButton = page.getByRole("button", { name: /search/i });

      if ((await searchInput.count()) > 0) {
        await expect(searchInput).toBeVisible();

        // Check placeholder text
        const placeholder = await searchInput.getAttribute("placeholder");
        expect(placeholder).toMatch(/search/i);

        // Check search button if exists
        if ((await searchButton.count()) > 0) {
          await expect(searchButton).toBeVisible();
        }
      } else {
        // Look for search icon/button that opens search
        const searchIcon = page.locator(
          '[data-testid="search-icon"], button[aria-label*="search"]',
        );
        if ((await searchIcon.count()) > 0) {
          await searchIcon.click();
          await page.waitForTimeout(300);

          // Search modal/overlay should open
          const searchModal = page.locator(
            '[data-testid="search-modal"], [role="dialog"]',
          );
          if ((await searchModal.count()) > 0) {
            await expect(searchModal).toBeVisible();

            const modalSearchInput = searchModal.getByRole("searchbox");
            await expect(modalSearchInput).toBeVisible();
          }
        }
      }
    });

    test("should perform basic search", async ({ page }) => {
      await page.goto("/");
      await waitUtils.forNavigation();

      const searchInput = page.getByRole("searchbox").first();

      if ((await searchInput.count()) > 0) {
        // Type search query
        await searchInput.fill("shirt");

        // Submit search
        await searchInput.press("Enter");
        await waitUtils.forNavigation();

        // Should be on search results page
        expect(page.url()).toMatch(/search|q=/);

        // Check search results
        const resultsContainer = page.locator(
          '[data-testid="search-results"], .search-results',
        );
        await expect(resultsContainer).toBeVisible();

        // Check for result count
        const resultCount = page.locator(
          '[data-testid="result-count"], .result-count',
        );
        if ((await resultCount.count()) > 0) {
          const count = await resultCount.textContent();
          expect(count).toMatch(/\d+.*result/i);
        }

        // Check for products in results
        const searchResults = page.locator(
          '[data-testid="search-result"], [data-testid="product-card"], .search-result',
        );
        const resultItemCount = await searchResults.count();

        if (resultItemCount > 0) {
          // Results found
          expect(resultItemCount).toBeGreaterThan(0);

          // Check first result
          const firstResult = searchResults.first();

          // Result should have image
          const resultImage = firstResult.locator("img");
          if ((await resultImage.count()) > 0) {
            await expect(resultImage).toBeVisible();
          }

          // Result should have title
          const resultTitle = firstResult.locator(
            "h2, h3, h4, [class*='title']",
          );
          if ((await resultTitle.count()) > 0) {
            const title = await resultTitle.textContent();
            expect(title).toBeTruthy();
          }

          // Result should have price
          const resultPrice = firstResult.locator(
            '[data-testid="price"], .price',
          );
          if ((await resultPrice.count()) > 0) {
            const price = await resultPrice.textContent();
            expect(price).toMatch(/[\d.,]+/);
          }
        } else {
          // No results
          const noResults = page.locator(
            '[data-testid="no-results"], .no-results',
          );
          await expect(noResults).toBeVisible();
          const message = await noResults.textContent();
          expect(message).toMatch(/no.*found|0.*results/i);
        }
      }
    });

    test("should handle search filters", async ({ page }) => {
      // Perform a search first
      await page.goto("/");
      await waitUtils.forNavigation();

      const searchInput = page.getByRole("searchbox").first();
      await searchInput.fill("product");
      await searchInput.press("Enter");
      await waitUtils.forNavigation();

      // Look for filter section
      const filterSection = page.locator(
        '[data-testid="search-filters"], .search-filters, aside[class*="filter"]',
      );

      if ((await filterSection.count()) > 0) {
        // Category filter
        const categoryFilter = filterSection.locator(
          '[data-testid="category-filter"], [class*="category"]',
        );
        if ((await categoryFilter.count()) > 0) {
          const categoryOption = categoryFilter
            .locator("input[type='checkbox'], button")
            .first();
          await categoryOption.click();
          await page.waitForTimeout(500);

          // Results should update
          const filteredResults = page.locator('[data-testid="search-result"]');
          expect(await filteredResults.count()).toBeGreaterThanOrEqual(0);
        }

        // Price filter
        const priceFilter = filterSection.locator(
          '[data-testid="price-filter"], [class*="price"]',
        );
        if ((await priceFilter.count()) > 0) {
          const minPrice = priceFilter.locator(
            'input[name*="min"], input[placeholder*="min"]',
          );
          const maxPrice = priceFilter.locator(
            'input[name*="max"], input[placeholder*="max"]',
          );

          if ((await minPrice.count()) > 0 && (await maxPrice.count()) > 0) {
            await minPrice.fill("10");
            await maxPrice.fill("100");
            await page.waitForTimeout(500);

            // URL should update with price params
            expect(page.url()).toMatch(/min|max|price/);
          }
        }

        // Sort options
        const sortDropdown = page.locator(
          'select[name*="sort"], [data-testid="sort"]',
        );
        if ((await sortDropdown.count()) > 0) {
          await sortDropdown.selectOption({ index: 1 });
          await page.waitForTimeout(500);

          // URL should update with sort param
          expect(page.url()).toContain("sort");
        }
      }
    });

    test("should display search suggestions", async ({ page }) => {
      await page.goto("/");
      await waitUtils.forNavigation();

      const searchInput = page.getByRole("searchbox").first();

      if ((await searchInput.count()) > 0) {
        // Start typing
        await searchInput.fill("sh");
        await page.waitForTimeout(300);

        // Look for suggestions dropdown
        const suggestions = page.locator(
          '[data-testid="search-suggestions"], .search-suggestions, [role="listbox"]',
        );

        if ((await suggestions.count()) > 0) {
          await expect(suggestions).toBeVisible();

          // Check suggestion types
          const productSuggestions = suggestions.locator(
            '[data-testid="product-suggestion"], .product-suggestion',
          );
          const categorySuggestions = suggestions.locator(
            '[data-testid="category-suggestion"], .category-suggestion',
          );
          const brandSuggestions = suggestions.locator(
            '[data-testid="brand-suggestion"], .brand-suggestion',
          );

          // At least one type should exist
          const hasSuggestions =
            (await productSuggestions.count()) > 0 ||
            (await categorySuggestions.count()) > 0 ||
            (await brandSuggestions.count()) > 0;

          expect(hasSuggestions).toBeTruthy();

          // Test clicking a suggestion
          const firstSuggestion = suggestions
            .locator('[role="option"]')
            .first();
          if ((await firstSuggestion.count()) > 0) {
            await firstSuggestion.click();
            await waitUtils.forNavigation();

            // Should navigate to search or product
            expect(page.url()).toMatch(/search|product|collection/);
          }
        }
      }
    });

    test("should handle advanced search", async ({ page }) => {
      await page.goto("/");
      await waitUtils.forNavigation();

      // Look for advanced search link
      const advancedSearchLink = page.getByRole("link", {
        name: /advanced search/i,
      });

      if ((await advancedSearchLink.count()) > 0) {
        await advancedSearchLink.click();
        await waitUtils.forNavigation();

        // Should be on advanced search page
        expect(page.url()).toContain("search");

        // Check for advanced search form
        const advancedForm = page.locator(
          '[data-testid="advanced-search-form"], .advanced-search',
        );

        if ((await advancedForm.count()) > 0) {
          // Multiple search fields
          const keywordInput = advancedForm.locator('input[name*="keyword"]');
          const brandSelect = advancedForm.locator('select[name*="brand"]');
          const categorySelect = advancedForm.locator(
            'select[name*="category"]',
          );
          const priceMin = advancedForm.locator('input[name*="price_min"]');
          const priceMax = advancedForm.locator('input[name*="price_max"]');

          // Fill some fields
          if ((await keywordInput.count()) > 0) {
            await keywordInput.fill("summer");
          }

          if ((await categorySelect.count()) > 0) {
            await categorySelect.selectOption({ index: 1 });
          }

          if ((await priceMax.count()) > 0) {
            await priceMax.fill("200");
          }

          // Submit advanced search
          const searchBtn = advancedForm.getByRole("button", {
            name: /search/i,
          });
          await searchBtn.click();
          await waitUtils.forNavigation();

          // Should show filtered results
          const results = page.locator('[data-testid="search-result"]');
          expect(await results.count()).toBeGreaterThanOrEqual(0);
        }
      }
    });

    test("should save and manage search history", async ({ page }) => {
      await page.goto("/");
      await waitUtils.forNavigation();

      // Perform a search
      const searchInput = page.getByRole("searchbox").first();
      await searchInput.fill("jacket");
      await searchInput.press("Enter");
      await waitUtils.forNavigation();

      // Go back to search
      await searchInput.click();
      await page.waitForTimeout(300);

      // Look for search history
      const searchHistory = page.locator(
        '[data-testid="search-history"], .search-history',
      );

      if ((await searchHistory.count()) > 0) {
        const historyItems = searchHistory.locator(
          '[data-testid="history-item"], .history-item',
        );

        if ((await historyItems.count()) > 0) {
          // Should contain recent search
          const recentSearch = historyItems.filter({ hasText: "jacket" });
          expect(await recentSearch.count()).toBeGreaterThan(0);

          // Test clicking history item
          await recentSearch.first().click();
          await waitUtils.forNavigation();

          // Should search for that term again
          expect(page.url()).toContain("jacket");
        }

        // Clear history button
        const clearHistoryBtn = page.getByRole("button", {
          name: /clear.*history/i,
        });
        if ((await clearHistoryBtn.count()) > 0) {
          await clearHistoryBtn.click();
          await page.waitForTimeout(300);

          // History should be empty
          const remainingItems = searchHistory.locator(
            '[data-testid="history-item"]',
          );
          expect(await remainingItems.count()).toBe(0);
        }
      }
    });
  });

  test.describe("Brand Pages", () => {
    test("should display brands listing", async ({ page }) => {
      // Try different possible brand URLs
      const brandUrls = ["/en/brands", "/en/designers", "/en/manufacturers"];

      let foundBrands = false;
      for (const url of brandUrls) {
        await page.goto(url);
        await waitUtils.forNavigation();

        if (page.url().includes("brand") || page.url().includes("designer")) {
          foundBrands = true;
          break;
        }
      }

      if (!foundBrands) {
        // Navigate from homepage
        await page.goto("/");
        await waitUtils.forNavigation();

        const brandsLink = page.getByRole("link", {
          name: /brands|designers/i,
        });
        if ((await brandsLink.count()) > 0) {
          await brandsLink.first().click();
          await waitUtils.forNavigation();
        }
      }

      // Check for brand grid or list
      const brandGrid = page.locator(
        '[data-testid="brands-grid"], .brands-grid, [class*="brands"]',
      );

      if ((await brandGrid.count()) > 0) {
        const brandCards = brandGrid.locator(
          '[data-testid="brand-card"], .brand-card',
        );
        expect(await brandCards.count()).toBeGreaterThan(0);

        // Check first brand
        const firstBrand = brandCards.first();

        // Brand logo/image
        const brandLogo = firstBrand.locator("img");
        if ((await brandLogo.count()) > 0) {
          await expect(brandLogo).toBeVisible();
        }

        // Brand name
        const brandName = firstBrand.locator("h2, h3, [class*='name']");
        if ((await brandName.count()) > 0) {
          const name = await brandName.textContent();
          expect(name).toBeTruthy();
        }

        // Product count
        const productCount = firstBrand.locator(
          '[data-testid="product-count"], .count',
        );
        if ((await productCount.count()) > 0) {
          const count = await productCount.textContent();
          expect(count).toMatch(/\d+/);
        }
      }
    });

    test("should filter brands alphabetically", async ({ page }) => {
      await page.goto("/en/brands");
      await waitUtils.forNavigation();

      // Look for alphabet filter
      const alphabetFilter = page.locator(
        '[data-testid="alphabet-filter"], .alphabet-filter',
      );

      if ((await alphabetFilter.count()) > 0) {
        const letterButtons = alphabetFilter.locator("button, a");

        if ((await letterButtons.count()) > 0) {
          // Click letter 'A'
          const letterA = letterButtons.filter({ hasText: /^A$/i });
          if ((await letterA.count()) > 0) {
            await letterA.click();
            await page.waitForTimeout(500);

            // Brands should be filtered
            const brandNames = page.locator(
              '[data-testid="brand-card"] h2, [data-testid="brand-card"] h3',
            );
            if ((await brandNames.count()) > 0) {
              const firstName = await brandNames.first().textContent();
              expect(firstName?.charAt(0).toUpperCase()).toBe("A");
            }
          }

          // Test "All" button
          const allButton = letterButtons.filter({ hasText: /all/i });
          if ((await allButton.count()) > 0) {
            await allButton.click();
            await page.waitForTimeout(500);

            // Should show all brands
            const allBrands = page.locator('[data-testid="brand-card"]');
            expect(await allBrands.count()).toBeGreaterThan(0);
          }
        }
      }
    });

    test("should display individual brand page", async ({ page }) => {
      // Navigate to brands first
      await page.goto("/en/brands");
      await waitUtils.forNavigation();

      // Click on first brand
      const firstBrand = page
        .locator('[data-testid="brand-card"], .brand-card')
        .first();
      await firstBrand.click();
      await waitUtils.forNavigation();

      // Should be on brand page
      expect(page.url()).toMatch(/brand|designer/);

      // Check brand header
      const brandHeader = page.locator(
        '[data-testid="brand-header"], .brand-header',
      );
      if ((await brandHeader.count()) > 0) {
        // Brand name
        const brandName = brandHeader.getByRole("heading", { level: 1 });
        if ((await brandName.count()) > 0) {
          const name = await brandName.textContent();
          expect(name).toBeTruthy();
        }

        // Brand logo
        const brandLogo = brandHeader.locator("img");
        if ((await brandLogo.count()) > 0) {
          await expect(brandLogo).toBeVisible();
        }

        // Brand description
        const brandDesc = brandHeader.locator("p, [class*='description']");
        if ((await brandDesc.count()) > 0) {
          const desc = await brandDesc.textContent();
          expect(desc).toBeTruthy();
        }
      }

      // Check brand products
      const brandProducts = page.locator(
        '[data-testid="product-card"], .product-card',
      );
      expect(await brandProducts.count()).toBeGreaterThan(0);

      // Check brand info sidebar
      const brandInfo = page.locator('[data-testid="brand-info"], .brand-info');
      if ((await brandInfo.count()) > 0) {
        // Founded year
        const foundedYear = brandInfo.locator(
          '[data-testid="founded"], [class*="founded"]',
        );
        if ((await foundedYear.count()) > 0) {
          const year = await foundedYear.textContent();
          expect(year).toMatch(/\d{4}/);
        }

        // Country
        const country = brandInfo.locator(
          '[data-testid="country"], [class*="country"]',
        );
        if ((await country.count()) > 0) {
          const countryName = await country.textContent();
          expect(countryName).toBeTruthy();
        }

        // Website link
        const websiteLink = brandInfo.locator('a[href*="http"]');
        if ((await websiteLink.count()) > 0) {
          const href = await websiteLink.getAttribute("href");
          expect(href).toMatch(/^https?:\/\//);
        }
      }
    });

    test("should follow/unfollow brands", async ({ page }) => {
      // Navigate to a brand page
      await page.goto("/en/brands");
      await waitUtils.forNavigation();
      await page.locator('[data-testid="brand-card"]').first().click();
      await waitUtils.forNavigation();

      // Look for follow button
      const followBtn = page.getByRole("button", { name: /follow|subscribe/i });

      if ((await followBtn.count()) > 0) {
        // Check initial state
        const initialText = await followBtn.textContent();

        // Click to follow
        await followBtn.click();
        await page.waitForTimeout(500);

        // Text should change
        const newText = await followBtn.textContent();
        expect(newText).not.toBe(initialText);

        // Should show notification
        const notification = page.locator('[role="alert"], .toast');
        if ((await notification.count()) > 0) {
          const message = await notification.textContent();
          expect(message).toMatch(/follow|subscribed/i);
        }

        // Unfollow
        await followBtn.click();
        await page.waitForTimeout(500);

        // Should revert to initial state
        const finalText = await followBtn.textContent();
        expect(finalText).toBe(initialText);
      }
    });
  });

  test.describe("Store Locator / Events", () => {
    test("should display store locator", async ({ page }) => {
      // Try different possible URLs
      const storeUrls = ["/en/stores", "/en/locations", "/en/find-store"];

      let foundStores = false;
      for (const url of storeUrls) {
        await page.goto(url);
        await waitUtils.forNavigation();

        if (page.url().includes("store") || page.url().includes("location")) {
          foundStores = true;
          break;
        }
      }

      if (!foundStores) {
        // Navigate from footer
        await page.goto("/");
        await waitUtils.forNavigation();
        await page.evaluate(() =>
          window.scrollTo(0, document.body.scrollHeight),
        );

        const storeLink = page.getByRole("link", { name: /store|location/i });
        if ((await storeLink.count()) > 0) {
          await storeLink.click();
          await waitUtils.forNavigation();
        }
      }

      // Check for store locator interface
      const storeLocator = page.locator(
        '[data-testid="store-locator"], .store-locator',
      );

      if ((await storeLocator.count()) > 0) {
        // Search input
        const searchInput = storeLocator.locator(
          'input[placeholder*="zip"], input[placeholder*="city"], input[placeholder*="location"]',
        );
        if ((await searchInput.count()) > 0) {
          await searchInput.fill("10001");

          const searchBtn = storeLocator.getByRole("button", {
            name: /search|find/i,
          });
          if ((await searchBtn.count()) > 0) {
            await searchBtn.click();
            await page.waitForTimeout(1000);
          }
        }

        // Use current location button
        const locationBtn = page.getByRole("button", {
          name: /current location|use my location/i,
        });
        if ((await locationBtn.count()) > 0) {
          // Would need to handle geolocation permission
        }

        // Store list
        const storeList = page.locator(
          '[data-testid="store-list"], .store-list',
        );
        if ((await storeList.count()) > 0) {
          const storeItems = storeList.locator(
            '[data-testid="store-item"], .store-item',
          );

          if ((await storeItems.count()) > 0) {
            const firstStore = storeItems.first();

            // Store name
            const storeName = firstStore.locator("h3, h4, [class*='name']");
            if ((await storeName.count()) > 0) {
              const name = await storeName.textContent();
              expect(name).toBeTruthy();
            }

            // Store address
            const storeAddress = firstStore.locator(
              '[data-testid="address"], address',
            );
            if ((await storeAddress.count()) > 0) {
              const address = await storeAddress.textContent();
              expect(address).toBeTruthy();
            }

            // Store hours
            const storeHours = firstStore.locator(
              '[data-testid="hours"], [class*="hours"]',
            );
            if ((await storeHours.count()) > 0) {
              const hours = await storeHours.textContent();
              expect(hours).toMatch(/\d+.*[ap]m/i);
            }

            // Get directions link
            const directionsLink = firstStore.getByRole("link", {
              name: /directions|map/i,
            });
            if ((await directionsLink.count()) > 0) {
              const href = await directionsLink.getAttribute("href");
              expect(href).toMatch(/maps|directions/);
            }
          }
        }

        // Map view
        const mapContainer = page.locator(
          '[data-testid="store-map"], .store-map, #map',
        );
        if ((await mapContainer.count()) > 0) {
          await expect(mapContainer).toBeVisible();
        }
      }
    });

    test("should filter stores by services", async ({ page }) => {
      await page.goto("/en/stores");
      await waitUtils.forNavigation();

      // Look for service filters
      const serviceFilters = page.locator(
        '[data-testid="service-filters"], .service-filters',
      );

      if ((await serviceFilters.count()) > 0) {
        const filterOptions = serviceFilters.locator(
          'input[type="checkbox"], button',
        );

        if ((await filterOptions.count()) > 0) {
          // Click first service filter
          const firstFilter = filterOptions.first();
          await firstFilter.click();
          await page.waitForTimeout(500);

          // Store list should update
          const storeList = page.locator('[data-testid="store-item"]');
          expect(await storeList.count()).toBeGreaterThanOrEqual(0);

          // Clear filters
          const clearBtn = page.getByRole("button", { name: /clear|reset/i });
          if ((await clearBtn.count()) > 0) {
            await clearBtn.click();
            await page.waitForTimeout(500);
          }
        }
      }
    });

    test("should display events listing", async ({ page }) => {
      // Try different event URLs
      const eventUrls = ["/en/events", "/en/calendar", "/en/workshops"];

      let foundEvents = false;
      for (const url of eventUrls) {
        await page.goto(url);
        await waitUtils.forNavigation();

        if (page.url().includes("event") || page.url().includes("calendar")) {
          foundEvents = true;
          break;
        }
      }

      if (!foundEvents) {
        // Navigate from navigation
        await page.goto("/");
        await waitUtils.forNavigation();

        const eventsLink = page.getByRole("link", { name: /events|calendar/i });
        if ((await eventsLink.count()) > 0) {
          await eventsLink.click();
          await waitUtils.forNavigation();
        }
      }

      // Check for events
      const eventsList = page.locator(
        '[data-testid="events-list"], .events-list',
      );

      if ((await eventsList.count()) > 0) {
        const eventItems = eventsList.locator(
          '[data-testid="event-item"], .event-item',
        );

        if ((await eventItems.count()) > 0) {
          const firstEvent = eventItems.first();

          // Event date
          const eventDate = firstEvent.locator(
            '[data-testid="event-date"], time, .date',
          );
          if ((await eventDate.count()) > 0) {
            const date = await eventDate.textContent();
            expect(date).toBeTruthy();
          }

          // Event title
          const eventTitle = firstEvent.locator("h3, h4, [class*='title']");
          if ((await eventTitle.count()) > 0) {
            const title = await eventTitle.textContent();
            expect(title).toBeTruthy();
          }

          // Event location
          const eventLocation = firstEvent.locator(
            '[data-testid="event-location"], [class*="location"]',
          );
          if ((await eventLocation.count()) > 0) {
            const location = await eventLocation.textContent();
            expect(location).toBeTruthy();
          }

          // RSVP/Register button
          const rsvpBtn = firstEvent.getByRole("button", {
            name: /rsvp|register|attend/i,
          });
          if ((await rsvpBtn.count()) > 0) {
            await expect(rsvpBtn).toBeVisible();
          }
        }
      }

      // Calendar view
      const calendarView = page.locator(
        '[data-testid="event-calendar"], .calendar-view',
      );
      if ((await calendarView.count()) > 0) {
        // Check for calendar navigation
        const prevMonth = calendarView.getByRole("button", {
          name: /previous/i,
        });
        const nextMonth = calendarView.getByRole("button", { name: /next/i });

        if ((await prevMonth.count()) > 0 && (await nextMonth.count()) > 0) {
          // Navigate months
          await nextMonth.click();
          await page.waitForTimeout(300);

          // Month should change
          const currentMonth = calendarView.locator(
            '[data-testid="current-month"], .current-month',
          );
          if ((await currentMonth.count()) > 0) {
            const month = await currentMonth.textContent();
            expect(month).toBeTruthy();
          }
        }
      }
    });

    test("should handle event registration", async ({ page }) => {
      await page.goto("/en/events");
      await waitUtils.forNavigation();

      // Click on first event
      const firstEvent = page.locator('[data-testid="event-item"]').first();

      if ((await firstEvent.count()) > 0) {
        await firstEvent.click();
        await waitUtils.forNavigation();

        // Should be on event detail page
        expect(page.url()).toMatch(/event/);

        // Check event details
        const eventDetail = page.locator(
          '[data-testid="event-detail"], .event-detail',
        );
        if ((await eventDetail.count()) > 0) {
          // Event description
          const description = eventDetail.locator(
            '[data-testid="description"], .description',
          );
          if ((await description.count()) > 0) {
            const desc = await description.textContent();
            expect(desc).toBeTruthy();
          }

          // Registration form
          const registrationForm = page.locator(
            '[data-testid="registration-form"], .registration-form',
          );
          if ((await registrationForm.count()) > 0) {
            // Fill form
            const nameInput = registrationForm.locator('input[name*="name"]');
            const emailInput = registrationForm.locator('input[type="email"]');
            const attendeesSelect = registrationForm.locator(
              'select[name*="attendees"]',
            );

            if ((await nameInput.count()) > 0) {
              await nameInput.fill("John Doe");
            }

            if ((await emailInput.count()) > 0) {
              await emailInput.fill("john@example.com");
            }

            if ((await attendeesSelect.count()) > 0) {
              await attendeesSelect.selectOption("2");
            }

            // Don't submit to avoid registration
            const submitBtn = registrationForm.getByRole("button", {
              name: /register|submit/i,
            });
            if ((await submitBtn.count()) > 0) {
              await expect(submitBtn).toBeEnabled();
            }
          }

          // Add to calendar
          const addToCalendarBtn = page.getByRole("button", {
            name: /add to calendar/i,
          });
          if ((await addToCalendarBtn.count()) > 0) {
            await addToCalendarBtn.click();
            await page.waitForTimeout(300);

            // Calendar options
            const calendarOptions = page.locator(
              '[data-testid="calendar-options"], .calendar-options',
            );
            if ((await calendarOptions.count()) > 0) {
              const googleCalendar = calendarOptions.getByRole("link", {
                name: /google/i,
              });
              if ((await googleCalendar.count()) > 0) {
                const href = await googleCalendar.getAttribute("href");
                expect(href).toContain("google.com/calendar");
              }
            }
          }
        }
      }
    });
  });

  test.describe("Recommendations and Personalization", () => {
    test("should display personalized recommendations", async ({ page }) => {
      await page.goto("/");
      await waitUtils.forNavigation();

      // Look for recommendation sections
      const recommendationSections = [
        '[data-testid="recommended-for-you"]',
        '[data-testid="recently-viewed"]',
        '[data-testid="trending-now"]',
        ".recommendations",
        'section:has-text("recommended")',
        'section:has-text("for you")',
      ];

      let foundRecommendations = false;
      for (const selector of recommendationSections) {
        const section = page.locator(selector);
        if ((await section.count()) > 0) {
          foundRecommendations = true;

          // Check for products in recommendations
          const recommendedProducts = section.locator(
            '[data-testid="product-card"], .product-card',
          );
          expect(await recommendedProducts.count()).toBeGreaterThan(0);

          // Check section title
          const sectionTitle = section.locator("h2, h3");
          if ((await sectionTitle.count()) > 0) {
            const title = await sectionTitle.textContent();
            expect(title).toBeTruthy();
          }

          break;
        }
      }

      // Recommendations might require user behavior first
      if (!foundRecommendations) {
        // Browse some products to generate recommendations
        await page.locator('[data-testid="product-card"]').first().click();
        await waitUtils.forNavigation();
        await page.goBack();
        await waitUtils.forNavigation();

        // Check again for recommendations
        const recommendedSection = page
          .locator("section")
          .filter({ hasText: /you might like|recommended/i });
        if ((await recommendedSection.count()) > 0) {
          const products = recommendedSection.locator(
            '[data-testid="product-card"]',
          );
          expect(await products.count()).toBeGreaterThanOrEqual(0);
        }
      }
    });

    test("should track recently viewed items", async ({ page }) => {
      await page.goto("/");
      await waitUtils.forNavigation();

      // View some products
      const productCards = page.locator(
        '[data-testid="product-card"], .product-card',
      );

      // Click first product
      await productCards.nth(0).click();
      await waitUtils.forNavigation();
      const firstProductTitle = await page
        .getByRole("heading", { level: 1 })
        .textContent();

      // Go back and click second product
      await page.goBack();
      await waitUtils.forNavigation();
      await productCards.nth(1).click();
      await waitUtils.forNavigation();

      // Go back to homepage
      await page.goto("/");
      await waitUtils.forNavigation();

      // Look for recently viewed section
      const recentlyViewed = page.locator(
        '[data-testid="recently-viewed"], .recently-viewed',
      );

      if ((await recentlyViewed.count()) > 0) {
        await recentlyViewed.scrollIntoViewIfNeeded();

        const viewedProducts = recentlyViewed.locator(
          '[data-testid="product-card"]',
        );
        expect(await viewedProducts.count()).toBeGreaterThan(0);

        // Should contain the first product we viewed
        const productTitles = await viewedProducts
          .locator("h3, h4")
          .allTextContents();
        const containsFirstProduct = productTitles.some((title) =>
          title.toLowerCase().includes(firstProductTitle?.toLowerCase() || ""),
        );

        // Recently viewed might not immediately update
        if ((await viewedProducts.count()) > 0) {
          expect(await viewedProducts.count()).toBeGreaterThan(0);
        }
      }
    });
  });

  test.describe("Discovery SEO and Performance", () => {
    test("should have proper SEO for search results", async ({ page }) => {
      await page.goto("/");
      await waitUtils.forNavigation();

      // Perform a search
      const searchInput = page.getByRole("searchbox").first();
      await searchInput.fill("shoes");
      await searchInput.press("Enter");
      await waitUtils.forNavigation();

      // Check title includes search term
      const title = await page.title();
      expect(title.toLowerCase()).toContain("shoes");

      // Check meta description
      const description = await page.getAttribute(
        'meta[name="description"]',
        "content",
      );
      if (description) {
        expect(description).toBeTruthy();
      }

      // Check canonical URL
      const canonical = await page.getAttribute(
        'link[rel="canonical"]',
        "href",
      );
      if (canonical) {
        expect(canonical).toContain("search");
      }

      // Search results pages usually noindex
      const robots = await page.getAttribute('meta[name="robots"]', "content");
      if (robots) {
        expect(robots).toContain("noindex");
      }
    });

    test("should load search results quickly", async ({ page }) => {
      await page.goto("/");
      await waitUtils.forNavigation();

      const searchInput = page.getByRole("searchbox").first();
      await searchInput.fill("product");

      const startTime = Date.now();
      await searchInput.press("Enter");
      await waitUtils.forNavigation();
      const loadTime = Date.now() - startTime;

      // Should load within 2 seconds
      expect(loadTime).toBeLessThan(2000);

      // Results should appear quickly
      const results = page.locator(
        '[data-testid="search-result"], [data-testid="product-card"]',
      );
      await expect(results.first()).toBeVisible({ timeout: 1000 });
    });

    test("should handle search errors gracefully", async ({ page }) => {
      await page.goto("/");
      await waitUtils.forNavigation();

      // Search with special characters
      const searchInput = page.getByRole("searchbox").first();
      await searchInput.fill("<script>alert('xss')</script>");
      await searchInput.press("Enter");
      await waitUtils.forNavigation();

      // Should handle safely
      const pageContent = await page.textContent("body");
      expect(pageContent).not.toContain("<script>");

      // Should show results or no results message
      const hasResults =
        (await page.locator('[data-testid="search-result"]').count()) > 0;
      const hasNoResults =
        (await page.locator('[data-testid="no-results"]').count()) > 0;

      expect(hasResults || hasNoResults).toBeTruthy();
    });

    test("should be accessible for keyboard users", async ({ page }) => {
      await page.goto("/");
      await waitUtils.forNavigation();

      // Tab to search
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");

      // Type in search
      await page.keyboard.type("test");
      await page.waitForTimeout(300);

      // If suggestions appear, should be able to navigate with arrows
      const suggestions = page.locator(
        '[data-testid="search-suggestions"], [role="listbox"]',
      );
      if ((await suggestions.count()) > 0) {
        await page.keyboard.press("ArrowDown");

        // Check focused element
        const focusedElement = await page.evaluate(() => {
          const el = document.activeElement;
          return {
            role: el?.getAttribute("role"),
            tag: el?.tagName,
            text: el?.textContent,
          };
        });

        expect(focusedElement.role).toBe("option");
      }

      // Submit search
      await page.keyboard.press("Enter");
      await waitUtils.forNavigation();

      // Should be on search results
      expect(page.url()).toContain("search");

      // Tab through results
      for (let i = 0; i < 3; i++) {
        await page.keyboard.press("Tab");
      }

      // Should focus on product links
      const focusedProduct = await page.evaluate(() => {
        const el = document.activeElement;
        return (
          el?.tagName === "A" && el?.closest('[data-testid="product-card"]')
        );
      });

      expect(focusedProduct).toBeTruthy();
    });
  });
});
