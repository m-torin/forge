import { expect, test } from "@repo/testing/e2e";
import { WaitUtils } from "@repo/testing/e2e";

test.describe("Collection Pages - Comprehensive Tests", () => {
  let waitUtils: WaitUtils;

  test.beforeEach(async ({ page }) => {
    waitUtils = new WaitUtils(page);
  });

  test.describe("Collections Landing Page", () => {
    test("should display all collections", async ({ page }) => {
      // Try different possible collection URLs
      const collectionUrls = [
        "/en/collections",
        "/en/categories",
        "/en/shop/collections",
      ];

      let foundCollections = false;
      for (const url of collectionUrls) {
        await page.goto(url);
        await waitUtils.forNavigation();

        const collectionGrid = page
          .locator(
            '[data-testid="collections-grid"], .collections-grid, [class*="collection"]',
          )
          .filter({
            has: page.locator(
              '[data-testid="collection-card"], .collection-card',
            ),
          });

        if ((await collectionGrid.count()) > 0) {
          foundCollections = true;
          break;
        }
      }

      if (!foundCollections) {
        // Navigate from homepage
        await page.goto("/");
        await waitUtils.forNavigation();

        const collectionsLink = page.getByRole("link", {
          name: /collections|categories|shop all/i,
        });
        if ((await collectionsLink.count()) > 0) {
          await collectionsLink.first().click();
          await waitUtils.forNavigation();
        }
      }

      // Check for collection cards
      const collectionCards = page.locator(
        '[data-testid="collection-card"], .collection-card, article[class*="collection"]',
      );
      expect(await collectionCards.count()).toBeGreaterThan(0);

      // Check first collection card structure
      const firstCard = collectionCards.first();

      // Collection image
      const collectionImage = firstCard.locator("img");
      await expect(collectionImage).toBeVisible();
      const imageSrc = await collectionImage.getAttribute("src");
      expect(imageSrc).toBeTruthy();

      // Collection title
      const collectionTitle = firstCard.locator(
        "h2, h3, h4, [class*='title'], [class*='name']",
      );
      if ((await collectionTitle.count()) > 0) {
        const title = await collectionTitle.textContent();
        expect(title).toBeTruthy();
      }

      // Collection description (optional)
      const collectionDesc = firstCard.locator("p, [class*='description']");
      if ((await collectionDesc.count()) > 0) {
        const desc = await collectionDesc.textContent();
        expect(desc).toBeTruthy();
      }

      // Product count (optional)
      const productCount = firstCard.locator(
        '[data-testid="product-count"], .product-count, [class*="count"]',
      );
      if ((await productCount.count()) > 0) {
        const count = await productCount.textContent();
        expect(count).toMatch(/\d+/);
      }

      // Shop/View link
      const shopLink = firstCard.getByRole("link", {
        name: /shop|view|explore/i,
      });
      if ((await shopLink.count()) > 0) {
        const href = await shopLink.getAttribute("href");
        expect(href).toContain("collection");
      }
    });

    test("should handle collection filtering and sorting", async ({ page }) => {
      // Navigate to collections page
      await page.goto("/en/collections");
      await waitUtils.forNavigation();

      // Look for filter options
      const filterSection = page.locator(
        '[data-testid="collection-filters"], .filters, [class*="filter"]',
      );

      if ((await filterSection.count()) > 0) {
        // Test category filter
        const categoryFilter = filterSection.locator(
          '[data-testid="category-filter"], [class*="category"]',
        );
        if ((await categoryFilter.count()) > 0) {
          const categoryOption = categoryFilter
            .locator("button, input[type='checkbox']")
            .first();
          await categoryOption.click();
          await page.waitForTimeout(500);

          // Check if collections are filtered
          const collectionCards = page.locator(
            '[data-testid="collection-card"], .collection-card',
          );
          expect(await collectionCards.count()).toBeGreaterThan(0);
        }
      }

      // Test sorting
      const sortDropdown = page.locator(
        'select[name*="sort"], [data-testid="sort"]',
      );
      if ((await sortDropdown.count()) > 0) {
        await sortDropdown.selectOption({ index: 1 });
        await page.waitForTimeout(500);

        // URL should update with sort parameter
        expect(page.url()).toContain("sort");
      }
    });

    test("should display featured collections", async ({ page }) => {
      await page.goto("/en/collections");
      await waitUtils.forNavigation();

      // Look for featured section
      const featuredSection = page
        .locator(
          '[data-testid="featured-collections"], .featured-collections, section',
        )
        .filter({
          hasText: /featured|popular|trending/i,
        });

      if ((await featuredSection.count()) > 0) {
        // Check for featured badges or indicators
        const featuredBadge = featuredSection.locator(
          '[data-testid="featured-badge"], .badge, [class*="featured"]',
        );
        if ((await featuredBadge.count()) > 0) {
          const badgeText = await featuredBadge.first().textContent();
          expect(badgeText).toMatch(/featured|new|trending/i);
        }

        // Featured collections might have special styling
        const featuredCards = featuredSection.locator(
          '[data-testid="collection-card"], .collection-card',
        );
        expect(await featuredCards.count()).toBeGreaterThan(0);
      }
    });

    test("should handle responsive collection grid", async ({
      page,
      viewport,
    }) => {
      if (!viewport) return;

      await page.goto("/en/collections");
      await waitUtils.forNavigation();

      const collectionGrid = page.locator(
        '[data-testid="collections-grid"], .collections-grid, [class*="grid"]',
      );
      const collectionCards = page.locator(
        '[data-testid="collection-card"], .collection-card',
      );

      const cardCount = await collectionCards.count();
      if (cardCount > 0) {
        // Check grid layout based on viewport
        const firstCard = collectionCards.first();
        const cardBox = await firstCard.boundingBox();

        if (cardBox) {
          if (viewport.width > 1024) {
            // Desktop: Multiple columns
            expect(cardBox.width).toBeLessThan(viewport.width / 2);
          } else if (viewport.width > 768) {
            // Tablet: 2-3 columns
            expect(cardBox.width).toBeLessThan(viewport.width * 0.6);
          } else {
            // Mobile: Full width or 2 columns
            expect(cardBox.width).toBeGreaterThan(viewport.width * 0.4);
          }
        }
      }
    });
  });

  test.describe("Individual Collection Pages", () => {
    test("should display collection details and products", async ({ page }) => {
      // First navigate to collections
      await page.goto("/en/collections");
      await waitUtils.forNavigation();

      // Click on first collection
      const firstCollection = page
        .locator('[data-testid="collection-card"], .collection-card')
        .first();
      const collectionLink = firstCollection.getByRole("link");

      if ((await collectionLink.count()) > 0) {
        await collectionLink.click();
      } else {
        await firstCollection.click();
      }
      await waitUtils.forNavigation();

      // Verify we're on a collection page
      expect(page.url()).toMatch(/collection|category/);

      // Check collection header
      const collectionHeader = page.locator(
        '[data-testid="collection-header"], .collection-header, header[class*="collection"]',
      );
      if ((await collectionHeader.count()) > 0) {
        // Collection title
        const title = collectionHeader.getByRole("heading", { level: 1 });
        if ((await title.count()) > 0) {
          await expect(title).toBeVisible();
          const titleText = await title.textContent();
          expect(titleText).toBeTruthy();
        }

        // Collection description
        const description = collectionHeader.locator(
          "p, [class*='description']",
        );
        if ((await description.count()) > 0) {
          const descText = await description.textContent();
          expect(descText).toBeTruthy();
        }

        // Collection image/banner
        const banner = collectionHeader.locator("img, [class*='banner']");
        if ((await banner.count()) > 0) {
          await expect(banner).toBeVisible();
        }
      }

      // Check for products in collection
      const productGrid = page.locator(
        '[data-testid="product-grid"], .product-grid, [class*="products"]',
      );
      const productCards = page.locator(
        '[data-testid="product-card"], .product-card',
      );

      expect(await productCards.count()).toBeGreaterThan(0);

      // Check breadcrumbs
      const breadcrumbs = page.getByRole("navigation", { name: /breadcrumb/i });
      if ((await breadcrumbs.count()) > 0) {
        const homeLink = breadcrumbs.getByRole("link", { name: /home/i });
        const collectionsLink = breadcrumbs.getByRole("link", {
          name: /collections/i,
        });

        if ((await homeLink.count()) > 0) {
          const href = await homeLink.getAttribute("href");
          expect(href).toBe("/");
        }

        if ((await collectionsLink.count()) > 0) {
          const href = await collectionsLink.getAttribute("href");
          expect(href).toContain("collections");
        }
      }
    });

    test("should handle collection product filtering", async ({ page }) => {
      // Navigate to a collection
      await page.goto("/en/collections");
      await waitUtils.forNavigation();
      await page
        .locator('[data-testid="collection-card"], .collection-card')
        .first()
        .click();
      await waitUtils.forNavigation();

      // Look for filter sidebar or button
      const filterButton = page.getByRole("button", { name: /filter/i });
      const filterSidebar = page.locator(
        '[data-testid="filters"], .filters, aside[class*="filter"]',
      );

      if ((await filterButton.count()) > 0) {
        // Mobile: Open filter modal
        await filterButton.click();
        await page.waitForTimeout(300);
      }

      // Test price range filter
      const priceFilter = page
        .locator('[data-testid="price-filter"], [class*="price"]')
        .filter({
          has: page.locator("input[type='range'], input[type='number']"),
        });

      if ((await priceFilter.count()) > 0) {
        const minPrice = priceFilter.locator("input").first();
        const maxPrice = priceFilter.locator("input").nth(1);

        if ((await minPrice.count()) > 0 && (await maxPrice.count()) > 0) {
          await minPrice.fill("50");
          await maxPrice.fill("200");
          await page.waitForTimeout(500);

          // Check if products are filtered
          const productPrices = page.locator('[data-testid="price"], .price');
          if ((await productPrices.count()) > 0) {
            const firstPrice = await productPrices.first().textContent();
            const priceValue = parseFloat(
              firstPrice?.replace(/[^0-9.]/g, "") || "0",
            );
            expect(priceValue).toBeGreaterThanOrEqual(50);
          }
        }
      }

      // Test size filter
      const sizeFilter = page
        .locator('[data-testid="size-filter"], [class*="size"]')
        .filter({
          has: page.locator("button, input[type='checkbox']"),
        });

      if ((await sizeFilter.count()) > 0) {
        const sizeOption = sizeFilter
          .locator("button, input[type='checkbox']")
          .first();
        await sizeOption.click();
        await page.waitForTimeout(500);

        // Products should be filtered
        const productCards = page.locator(
          '[data-testid="product-card"], .product-card',
        );
        expect(await productCards.count()).toBeGreaterThan(0);
      }

      // Test color filter
      const colorFilter = page
        .locator('[data-testid="color-filter"], [class*="color"]')
        .filter({
          has: page.locator("button[aria-label], input[type='checkbox']"),
        });

      if ((await colorFilter.count()) > 0) {
        const colorOption = colorFilter.locator("button, input").first();
        await colorOption.click();
        await page.waitForTimeout(500);
      }

      // Test clearing filters
      const clearFilters = page.getByRole("button", { name: /clear|reset/i });
      if ((await clearFilters.count()) > 0) {
        const initialProductCount = await page
          .locator('[data-testid="product-card"]')
          .count();
        await clearFilters.click();
        await page.waitForTimeout(500);

        const newProductCount = await page
          .locator('[data-testid="product-card"]')
          .count();
        expect(newProductCount).toBeGreaterThanOrEqual(initialProductCount);
      }
    });

    test("should handle collection product sorting", async ({ page }) => {
      // Navigate to a collection
      await page.goto("/en/collections");
      await waitUtils.forNavigation();
      await page
        .locator('[data-testid="collection-card"], .collection-card')
        .first()
        .click();
      await waitUtils.forNavigation();

      // Find sort options
      const sortDropdown = page.locator(
        'select[name*="sort"], [data-testid="sort"]',
      );
      const sortButtons = page
        .locator('[data-testid="sort-buttons"], .sort-buttons')
        .getByRole("button");

      if ((await sortDropdown.count()) > 0) {
        // Get sort options
        const options = await sortDropdown.locator("option").all();

        // Test each sort option
        for (let i = 1; i < Math.min(3, options.length); i++) {
          await sortDropdown.selectOption({ index: i });
          await page.waitForTimeout(500);

          // URL should update
          expect(page.url()).toContain("sort");

          // Products should still be displayed
          const products = page.locator('[data-testid="product-card"]');
          expect(await products.count()).toBeGreaterThan(0);
        }
      } else if ((await sortButtons.count()) > 0) {
        // Test button-based sorting
        const priceLowHighBtn = sortButtons
          .filter({ hasText: /price.*low/i })
          .first();
        if ((await priceLowHighBtn.count()) > 0) {
          await priceLowHighBtn.click();
          await page.waitForTimeout(500);

          // Verify prices are sorted
          const prices = await page
            .locator('[data-testid="price"], .price')
            .allTextContents();
          const priceValues = prices.map((p) =>
            parseFloat(p.replace(/[^0-9.]/g, "")),
          );

          for (let i = 1; i < priceValues.length; i++) {
            expect(priceValues[i]).toBeGreaterThanOrEqual(priceValues[i - 1]);
          }
        }
      }
    });

    test("should handle collection pagination", async ({ page }) => {
      // Navigate to a collection with many products
      await page.goto("/en/collections");
      await waitUtils.forNavigation();
      await page
        .locator('[data-testid="collection-card"], .collection-card')
        .first()
        .click();
      await waitUtils.forNavigation();

      const initialProducts = await page
        .locator('[data-testid="product-card"]')
        .count();

      // Check for pagination controls
      const pagination = page.getByRole("navigation", { name: /pagination/i });
      const loadMoreBtn = page.getByRole("button", {
        name: /load more|show more/i,
      });
      const infiniteScroll = page.locator(
        '[data-testid="infinite-scroll-trigger"]',
      );

      if ((await pagination.count()) > 0) {
        // Traditional pagination
        const nextBtn = pagination.getByRole("link", { name: /next|→/i });
        if ((await nextBtn.count()) > 0 && !(await nextBtn.isDisabled())) {
          await nextBtn.click();
          await waitUtils.forNavigation();

          // Should be on page 2
          expect(page.url()).toContain("page=2");

          // Should show different products
          const newProducts = await page
            .locator('[data-testid="product-card"]')
            .count();
          expect(newProducts).toBeGreaterThan(0);
        }
      } else if ((await loadMoreBtn.count()) > 0) {
        // Load more button
        await loadMoreBtn.click();
        await page.waitForTimeout(1000);

        const newProductCount = await page
          .locator('[data-testid="product-card"]')
          .count();
        expect(newProductCount).toBeGreaterThan(initialProducts);
      } else {
        // Infinite scroll
        await page.evaluate(() =>
          window.scrollTo(0, document.body.scrollHeight),
        );
        await page.waitForTimeout(1000);

        const newProductCount = await page
          .locator('[data-testid="product-card"]')
          .count();
        // May or may not load more depending on implementation
        expect(newProductCount).toBeGreaterThanOrEqual(initialProducts);
      }
    });

    test("should display collection sidebar information", async ({ page }) => {
      // Navigate to a collection
      await page.goto("/en/collections");
      await waitUtils.forNavigation();
      await page
        .locator('[data-testid="collection-card"], .collection-card')
        .first()
        .click();
      await waitUtils.forNavigation();

      // Look for collection sidebar
      const sidebar = page.locator(
        '[data-testid="collection-sidebar"], aside.collection-sidebar, [class*="sidebar"]',
      );

      if ((await sidebar.count()) > 0) {
        // Check for collection info
        const collectionInfo = sidebar.locator(
          '[data-testid="collection-info"], .collection-info',
        );
        if ((await collectionInfo.count()) > 0) {
          // Product count
          const productCount = collectionInfo.locator(
            '[data-testid="product-count"], .product-count',
          );
          if ((await productCount.count()) > 0) {
            const count = await productCount.textContent();
            expect(count).toMatch(/\d+.*product/i);
          }

          // Collection tags
          const tags = collectionInfo.locator(
            '[data-testid="collection-tags"], .tags',
          );
          if ((await tags.count()) > 0) {
            const tagItems = tags.locator(".tag, span");
            expect(await tagItems.count()).toBeGreaterThan(0);
          }
        }

        // Check for related collections
        const relatedCollections = sidebar.locator(
          '[data-testid="related-collections"], .related-collections',
        );
        if ((await relatedCollections.count()) > 0) {
          const relatedLinks = relatedCollections.getByRole("link");
          expect(await relatedLinks.count()).toBeGreaterThan(0);

          // Test clicking related collection
          const firstRelated = relatedLinks.first();
          const currentUrl = page.url();
          await firstRelated.click();
          await waitUtils.forNavigation();

          // Should navigate to different collection
          expect(page.url()).not.toBe(currentUrl);
          expect(page.url()).toMatch(/collection/);
        }
      }
    });
  });

  test.describe("Collection Search and Discovery", () => {
    test("should search within collections", async ({ page }) => {
      // Navigate to a collection
      await page.goto("/en/collections");
      await waitUtils.forNavigation();
      await page
        .locator('[data-testid="collection-card"], .collection-card')
        .first()
        .click();
      await waitUtils.forNavigation();

      // Look for collection search
      const collectionSearch = page.locator(
        '[data-testid="collection-search"], .collection-search, input[placeholder*="search.*collection"]',
      );

      if ((await collectionSearch.count()) > 0) {
        await collectionSearch.fill("shirt");
        await collectionSearch.press("Enter");
        await page.waitForTimeout(500);

        // Should show filtered results
        const searchResults = page.locator(
          '[data-testid="search-results"], .search-results',
        );
        const noResults = page.locator(
          '[data-testid="no-results"], .no-results',
        );

        if ((await noResults.count()) > 0) {
          const message = await noResults.textContent();
          expect(message).toMatch(/no.*found/i);
        } else {
          const products = page.locator('[data-testid="product-card"]');
          expect(await products.count()).toBeGreaterThan(0);

          // Products should match search
          const firstProductTitle = await products
            .first()
            .locator("h2, h3, h4")
            .textContent();
          expect(firstProductTitle?.toLowerCase()).toContain("shirt");
        }
      }
    });

    test("should show collection suggestions", async ({ page }) => {
      await page.goto("/en/collections");
      await waitUtils.forNavigation();

      // Look for search input
      const searchInput = page.getByRole("searchbox");

      if ((await searchInput.count()) > 0) {
        await searchInput.fill("sum");
        await page.waitForTimeout(300);

        // Check for suggestions
        const suggestions = page.locator(
          '[data-testid="suggestions"], .suggestions, [role="listbox"]',
        );

        if ((await suggestions.count()) > 0) {
          const collectionSuggestions = suggestions.locator(
            '[data-testid="collection-suggestion"], .collection-suggestion',
          );
          if ((await collectionSuggestions.count()) > 0) {
            // Click a suggestion
            await collectionSuggestions.first().click();
            await waitUtils.forNavigation();

            // Should navigate to collection
            expect(page.url()).toMatch(/collection/);
          }
        }
      }
    });
  });

  test.describe("Collection Interactions", () => {
    test("should handle collection following/subscribing", async ({ page }) => {
      // Navigate to a collection
      await page.goto("/en/collections");
      await waitUtils.forNavigation();
      await page
        .locator('[data-testid="collection-card"], .collection-card')
        .first()
        .click();
      await waitUtils.forNavigation();

      // Look for follow/subscribe button
      const followBtn = page.getByRole("button", {
        name: /follow|subscribe|notify/i,
      });

      if ((await followBtn.count()) > 0) {
        // Check initial state
        const initialText = await followBtn.textContent();

        // Click to follow
        await followBtn.click();
        await page.waitForTimeout(500);

        // Check state changed
        const newText = await followBtn.textContent();
        expect(newText).not.toBe(initialText);

        // Look for confirmation
        const notification = page.locator('[role="alert"], .toast');
        if ((await notification.count()) > 0) {
          const message = await notification.textContent();
          expect(message).toMatch(/subscribed|following|notify/i);
        }

        // Toggle back
        await followBtn.click();
        await page.waitForTimeout(500);
      }
    });

    test("should share collection", async ({ page }) => {
      // Navigate to a collection
      await page.goto("/en/collections");
      await waitUtils.forNavigation();
      await page
        .locator('[data-testid="collection-card"], .collection-card')
        .first()
        .click();
      await waitUtils.forNavigation();

      // Look for share button
      const shareBtn = page.getByRole("button", { name: /share/i });

      if ((await shareBtn.count()) > 0) {
        await shareBtn.click();
        await page.waitForTimeout(300);

        // Check for share modal or dropdown
        const shareModal = page.getByRole("dialog", { name: /share/i });
        const shareDropdown = page.locator(
          '[data-testid="share-dropdown"], .share-dropdown',
        );

        if ((await shareModal.count()) > 0) {
          // Check share options
          const facebookShare = shareModal.getByRole("button", {
            name: /facebook/i,
          });
          const twitterShare = shareModal.getByRole("button", {
            name: /twitter/i,
          });
          const copyLink = shareModal.getByRole("button", {
            name: /copy.*link/i,
          });

          if ((await copyLink.count()) > 0) {
            await copyLink.click();
            await page.waitForTimeout(300);

            // Check for success message
            const copied = page
              .locator('[role="alert"]')
              .filter({ hasText: /copied/i });
            if ((await copied.count()) > 0) {
              await expect(copied).toBeVisible();
            }
          }

          // Close modal
          const closeBtn = shareModal.getByRole("button", { name: /close/i });
          await closeBtn.click();
        }
      }
    });

    test("should handle collection quick filters", async ({ page }) => {
      // Navigate to a collection
      await page.goto("/en/collections");
      await waitUtils.forNavigation();
      await page
        .locator('[data-testid="collection-card"], .collection-card')
        .first()
        .click();
      await waitUtils.forNavigation();

      // Look for quick filter pills
      const quickFilters = page.locator(
        '[data-testid="quick-filters"], .quick-filters',
      );

      if ((await quickFilters.count()) > 0) {
        const filterPills = quickFilters.getByRole("button");

        if ((await filterPills.count()) > 0) {
          // Click first filter
          const firstFilter = filterPills.first();
          const filterText = await firstFilter.textContent();
          await firstFilter.click();
          await page.waitForTimeout(500);

          // Check if filter is active
          const isActive =
            (await firstFilter.getAttribute("aria-pressed")) === "true" ||
            (await firstFilter.getAttribute("class"))?.includes("active");

          expect(isActive).toBeTruthy();

          // Products should be filtered
          const products = page.locator('[data-testid="product-card"]');
          expect(await products.count()).toBeGreaterThan(0);

          // Click again to remove filter
          await firstFilter.click();
          await page.waitForTimeout(500);
        }
      }
    });
  });

  test.describe("Collection SEO and Performance", () => {
    test("should have proper SEO metadata", async ({ page }) => {
      // Navigate to a collection
      await page.goto("/en/collections");
      await waitUtils.forNavigation();
      await page
        .locator('[data-testid="collection-card"], .collection-card')
        .first()
        .click();
      await waitUtils.forNavigation();

      // Check page title
      const title = await page.title();
      expect(title).toBeTruthy();
      expect(title).toContain("Collection");

      // Check meta description
      const description = await page.getAttribute(
        'meta[name="description"]',
        "content",
      );
      expect(description).toBeTruthy();

      // Check canonical URL
      const canonical = await page.getAttribute(
        'link[rel="canonical"]',
        "href",
      );
      if (canonical) {
        expect(canonical).toContain("/collection");
      }

      // Check Open Graph tags
      const ogTitle = await page.getAttribute(
        'meta[property="og:title"]',
        "content",
      );
      const ogDescription = await page.getAttribute(
        'meta[property="og:description"]',
        "content",
      );
      const ogImage = await page.getAttribute(
        'meta[property="og:image"]',
        "content",
      );

      expect(ogTitle).toBeTruthy();
      expect(ogDescription).toBeTruthy();
      if (ogImage) {
        expect(ogImage).toMatch(/\.(jpg|jpeg|png|webp)/i);
      }

      // Check structured data
      const jsonLd = await page.locator('script[type="application/ld+json"]');
      if ((await jsonLd.count()) > 0) {
        const structuredData = await jsonLd.first().textContent();
        expect(structuredData).toContain("CollectionPage");
      }
    });

    test("should load collections efficiently", async ({ page }) => {
      const startTime = Date.now();

      await page.goto("/en/collections");
      await waitUtils.forNavigation();

      const loadTime = Date.now() - startTime;

      // Should load within 2 seconds
      expect(loadTime).toBeLessThan(2000);

      // Critical content should be visible quickly
      const collectionCards = page.locator(
        '[data-testid="collection-card"], .collection-card',
      );
      await expect(collectionCards.first()).toBeVisible({ timeout: 1000 });

      // Test collection page load time
      const collectionStartTime = Date.now();
      await collectionCards.first().click();
      await waitUtils.forNavigation();

      const collectionLoadTime = Date.now() - collectionStartTime;
      expect(collectionLoadTime).toBeLessThan(2500);

      // Products should appear quickly
      const products = page.locator('[data-testid="product-card"]');
      await expect(products.first()).toBeVisible({ timeout: 1000 });
    });

    test("should handle collection errors gracefully", async ({ page }) => {
      // Try to access non-existent collection
      await page.goto("/en/collections/non-existent-collection-12345");
      await waitUtils.forNavigation();

      // Should show 404 or redirect
      const pageContent = await page.textContent("body");

      // Check for 404 page
      const is404 = pageContent?.match(/404|not found/i);
      const redirectedToCollections = page.url().endsWith("/collections");

      expect(is404 || redirectedToCollections).toBeTruthy();

      if (is404) {
        // Should have link back to collections
        const collectionsLink = page.getByRole("link", {
          name: /collections|shop/i,
        });
        if ((await collectionsLink.count()) > 0) {
          await expect(collectionsLink).toBeVisible();
        }
      }
    });

    test("should be accessible", async ({ page }) => {
      // Navigate to collections
      await page.goto("/en/collections");
      await waitUtils.forNavigation();

      // Check heading hierarchy
      const h1 = page.getByRole("heading", { level: 1 });
      expect(await h1.count()).toBe(1);

      // Check image alt texts
      const images = page.locator("img");
      for (let i = 0; i < Math.min(5, await images.count()); i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute("alt");
        expect(alt).toBeTruthy();
      }

      // Navigate to a collection
      await page.locator('[data-testid="collection-card"]').first().click();
      await waitUtils.forNavigation();

      // Test keyboard navigation
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");

      // Should be able to navigate with keyboard
      const focusedElement = await page.evaluate(
        () => document.activeElement?.tagName,
      );
      expect(focusedElement).toMatch(/A|BUTTON|INPUT/);

      // Check ARIA labels on interactive elements
      const buttons = page.getByRole("button");
      for (let i = 0; i < Math.min(3, await buttons.count()); i++) {
        const btn = buttons.nth(i);
        const label =
          (await btn.getAttribute("aria-label")) || (await btn.textContent());
        expect(label).toBeTruthy();
      }
    });
  });
});
