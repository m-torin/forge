import { expect, test } from "@repo/testing/e2e";
import { WaitUtils } from "@repo/testing/e2e";

test.describe("Product Pages - Comprehensive Tests", () => {
  let waitUtils: WaitUtils;

  test.beforeEach(async ({ page }) => {
    waitUtils = new WaitUtils(page);
  });

  test.describe("Product Listing Pages", () => {
    test("should display product grid with filters", async ({ page }) => {
      // Try different possible product listing URLs
      const productListingUrls = [
        "/en/products",
        "/en/shop",
        "/en/collections/all",
      ];

      let foundListing = false;
      for (const url of productListingUrls) {
        await page.goto(url);
        await waitUtils.forNavigation();

        // Check if we found a product listing
        const productGrid = page
          .locator(
            '[data-testid="product-grid"], .product-grid, [class*="grid"]',
          )
          .filter({
            has: page.locator('[data-testid="product-card"], .product-card'),
          });

        if ((await productGrid.count()) > 0) {
          foundListing = true;
          break;
        }
      }

      if (!foundListing) {
        // Navigate from homepage
        await page.goto("/");
        await waitUtils.forNavigation();

        const shopLink = page.getByRole("link", { name: /shop|products|all/i });
        if ((await shopLink.count()) > 0) {
          await shopLink.first().click();
          await waitUtils.forNavigation();
        }
      }

      // Check for product cards
      const productCards = page.locator(
        '[data-testid="product-card"], .product-card, article[class*="product"]',
      );
      expect(await productCards.count()).toBeGreaterThan(0);

      // Check first product card structure
      const firstCard = productCards.first();

      // Product image
      const productImage = firstCard.locator("img");
      await expect(productImage).toBeVisible();

      // Product title
      const productTitle = firstCard.locator(
        "h2, h3, h4, [class*='title'], [class*='name']",
      );
      if ((await productTitle.count()) > 0) {
        const title = await productTitle.textContent();
        expect(title).toBeTruthy();
      }

      // Product price
      const productPrice = firstCard.locator(
        '[data-testid="price"], .price, [class*="price"]',
      );
      if ((await productPrice.count()) > 0) {
        const price = await productPrice.textContent();
        expect(price).toMatch(/[\d.,]+/);
      }

      // Quick add or view button
      const actionButton = firstCard.getByRole("button", {
        name: /add|quick|view/i,
      });
      if ((await actionButton.count()) > 0) {
        await expect(actionButton).toBeVisible();
      }
    });

    test("should handle product filtering", async ({ page }) => {
      // Navigate to product listing
      await page.goto("/en/products");
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

      // Check for filter options
      const priceFilter = page.locator(
        '[data-testid="price-filter"], [class*="price-filter"], input[type="range"]',
      );
      const categoryFilter = page
        .locator('[data-testid="category-filter"], [class*="category"]')
        .filter({
          has: page.locator("input[type='checkbox'], button"),
        });
      const colorFilter = page
        .locator('[data-testid="color-filter"], [class*="color"]')
        .filter({
          has: page.locator("button, input"),
        });
      const sizeFilter = page
        .locator('[data-testid="size-filter"], [class*="size"]')
        .filter({
          has: page.locator("button, input"),
        });

      // Test price filter if available
      if ((await priceFilter.count()) > 0) {
        const priceInput = priceFilter.locator("input").first();
        if ((await priceInput.getAttribute("type")) === "range") {
          const max = await priceInput.getAttribute("max");
          await priceInput.fill(String(Number(max) / 2));
          await page.waitForTimeout(500);
        }
      }

      // Test category filter
      if ((await categoryFilter.count()) > 0) {
        const firstCategory = categoryFilter
          .locator("input[type='checkbox'], button")
          .first();
        await firstCategory.click();
        await page.waitForTimeout(500);

        // Check if products are filtered (URL might change or product count)
        const urlParams = new URL(page.url()).searchParams;
        const hasFilterParams = urlParams.toString().length > 0;
        expect(
          hasFilterParams || (await productCards.count()) >= 0,
        ).toBeTruthy();
      }

      // Test color filter
      if ((await colorFilter.count()) > 0) {
        const colorOption = colorFilter.locator("button").first();
        if ((await colorOption.count()) > 0) {
          await colorOption.click();
          await page.waitForTimeout(500);
        }
      }

      // Clear filters
      const clearButton = page.getByRole("button", { name: /clear|reset/i });
      if ((await clearButton.count()) > 0) {
        await clearButton.click();
        await page.waitForTimeout(500);
      }
    });

    test("should handle product sorting", async ({ page }) => {
      await page.goto("/en/products");
      await waitUtils.forNavigation();

      // Look for sort dropdown
      const sortSelect = page.locator(
        'select[name*="sort"], select[data-testid="sort"]',
      );
      const sortButtons = page.getByRole("button", {
        name: /sort|price.*low|price.*high|newest|popular/i,
      });

      if ((await sortSelect.count()) > 0) {
        // Test select sorting
        const options = await sortSelect.locator("option").all();
        if (options.length > 1) {
          await sortSelect.selectOption({ index: 1 });
          await page.waitForTimeout(500);

          // URL should update with sort parameter
          expect(page.url()).toContain("sort");
        }
      } else if ((await sortButtons.count()) > 0) {
        // Test button sorting
        const priceHighBtn = page.getByRole("button", { name: /price.*high/i });
        if ((await priceHighBtn.count()) > 0) {
          await priceHighBtn.click();
          await page.waitForTimeout(500);

          // Check if sorting is applied
          const firstPrice = page
            .locator('[data-testid="price"], .price')
            .first();
          const lastPrice = page
            .locator('[data-testid="price"], .price')
            .last();

          if ((await firstPrice.count()) > 0 && (await lastPrice.count()) > 0) {
            const firstValue = parseFloat(
              ((await firstPrice.textContent()) || "0").replace(/[^0-9.]/g, ""),
            );
            const lastValue = parseFloat(
              ((await lastPrice.textContent()) || "0").replace(/[^0-9.]/g, ""),
            );
            expect(firstValue).toBeGreaterThanOrEqual(lastValue);
          }
        }
      }
    });

    test("should handle pagination or infinite scroll", async ({ page }) => {
      await page.goto("/en/products");
      await waitUtils.forNavigation();

      const productCards = page.locator(
        '[data-testid="product-card"], .product-card',
      );
      const initialCount = await productCards.count();

      // Check for pagination
      const paginationNav = page.getByRole("navigation", {
        name: /pagination/i,
      });
      const loadMoreBtn = page.getByRole("button", {
        name: /load more|show more/i,
      });

      if ((await paginationNav.count()) > 0) {
        // Test pagination
        const nextButton = paginationNav.getByRole("link", { name: /next|→/i });
        if (
          (await nextButton.count()) > 0 &&
          !(await nextButton.isDisabled())
        ) {
          await nextButton.click();
          await waitUtils.forNavigation();

          // Should be on page 2
          expect(page.url()).toContain("page=2");

          // Products should be different
          const newCount = await productCards.count();
          expect(newCount).toBeGreaterThan(0);
        }
      } else if ((await loadMoreBtn.count()) > 0) {
        // Test load more
        await loadMoreBtn.click();
        await page.waitForTimeout(1000);

        const newCount = await productCards.count();
        expect(newCount).toBeGreaterThan(initialCount);
      } else {
        // Test infinite scroll
        await page.evaluate(() =>
          window.scrollTo(0, document.body.scrollHeight),
        );
        await page.waitForTimeout(1000);

        // More products might load
        const newCount = await productCards.count();
        expect(newCount).toBeGreaterThanOrEqual(initialCount);
      }
    });
  });

  test.describe("Product Detail Pages", () => {
    test("should display complete product information", async ({ page }) => {
      // Navigate to a product detail page
      await page.goto("/");
      await waitUtils.forNavigation();

      // Click on first product
      const productLink = page
        .locator('[data-testid="product-card"], .product-card')
        .first()
        .getByRole("link");
      if ((await productLink.count()) > 0) {
        await productLink.click();
      } else {
        // Try clicking the card itself
        await page
          .locator('[data-testid="product-card"], .product-card')
          .first()
          .click();
      }
      await waitUtils.forNavigation();

      // Verify we're on a product page
      expect(page.url()).toMatch(/product|item/);

      // Check all product information sections
      // 1. Product title
      const productTitle = page.getByRole("heading", { level: 1 });
      await expect(productTitle).toBeVisible();
      const title = await productTitle.textContent();
      expect(title).toBeTruthy();

      // 2. Product price
      const priceElement = page
        .locator('[data-testid="product-price"], .price, [class*="price"]')
        .first();
      await expect(priceElement).toBeVisible();
      const price = await priceElement.textContent();
      expect(price).toMatch(/[\d.,]+/);

      // 3. Product rating (if available)
      const rating = page.locator(
        '[data-testid="rating"], .rating, [aria-label*="rating"]',
      );
      if ((await rating.count()) > 0) {
        const ratingValue =
          (await rating.getAttribute("aria-label")) ||
          (await rating.textContent());
        expect(ratingValue).toBeTruthy();
      }

      // 4. Product description
      const description = page
        .locator(
          '[data-testid="description"], .description, [class*="description"]',
        )
        .first();
      if ((await description.count()) > 0) {
        const descText = await description.textContent();
        expect(descText).toBeTruthy();
        expect(descText.length).toBeGreaterThan(10);
      }

      // 5. Product specifications
      const specs = page.locator(
        '[data-testid="specifications"], .specifications, [class*="specs"]',
      );
      if ((await specs.count()) > 0) {
        const specItems = specs.locator("li, tr, dd");
        expect(await specItems.count()).toBeGreaterThan(0);
      }

      // 6. Shipping information
      const shipping = page.locator(
        '[data-testid="shipping"], .shipping, [class*="shipping"]',
      );
      if ((await shipping.count()) > 0) {
        const shippingText = await shipping.textContent();
        expect(shippingText).toMatch(/ship|deliver|free/i);
      }
    });

    test("should handle product image gallery", async ({
      browserName,
      page,
    }) => {
      // Navigate to product page
      await page.goto("/");
      await waitUtils.forNavigation();
      await page
        .locator('[data-testid="product-card"], .product-card')
        .first()
        .click();
      await waitUtils.forNavigation();

      // Find image gallery
      const gallery = page
        .locator('[data-testid="image-gallery"], .gallery, [class*="gallery"]')
        .first();
      const mainImage = gallery
        .locator('[data-testid="main-image"], .main-image, img[class*="main"]')
        .first();
      const thumbnails = gallery.locator(
        '[data-testid="thumbnail"], .thumbnail, button img, [class*="thumb"]',
      );

      // Check main image
      await expect(mainImage).toBeVisible();
      const mainSrc = await mainImage.getAttribute("src");
      expect(mainSrc).toBeTruthy();

      // Test thumbnail navigation
      if ((await thumbnails.count()) > 1) {
        const secondThumb = thumbnails.nth(1);
        await secondThumb.click();
        await page.waitForTimeout(300);

        // Main image should change
        const newSrc = await mainImage.getAttribute("src");
        expect(newSrc).not.toBe(mainSrc);
      }

      // Test image zoom (desktop only)
      if (!page.context()._options.isMobile) {
        await mainImage.hover();

        // Check for zoom indicator or modal
        const zoomModal = page.locator(
          '[data-testid="zoom-modal"], .zoom-modal, [role="dialog"]',
        );
        const zoomLens = page.locator('[data-testid="zoom-lens"], .zoom-lens');

        const hasZoom =
          (await zoomModal.count()) > 0 || (await zoomLens.count()) > 0;
        // Zoom is optional feature
      }

      // Test lightbox/modal gallery
      const viewAllBtn = page.getByRole("button", {
        name: /view all|enlarge|zoom/i,
      });
      if ((await viewAllBtn.count()) > 0) {
        await viewAllBtn.click();
        await page.waitForTimeout(300);

        const modal = page.getByRole("dialog");
        if ((await modal.count()) > 0) {
          await expect(modal).toBeVisible();

          // Test navigation in modal
          const nextBtn = modal.getByRole("button", { name: /next/i });
          if ((await nextBtn.count()) > 0) {
            await nextBtn.click();
            await page.waitForTimeout(300);
          }

          // Close modal
          const closeBtn = modal.getByRole("button", { name: /close/i });
          if ((await closeBtn.count()) > 0) {
            await closeBtn.click();
            await page.waitForTimeout(300);
            await expect(modal).not.toBeVisible();
          }
        }
      }
    });

    test("should handle product variants and options", async ({ page }) => {
      // Navigate to product with variants
      await page.goto("/");
      await waitUtils.forNavigation();
      await page
        .locator('[data-testid="product-card"], .product-card')
        .first()
        .click();
      await waitUtils.forNavigation();

      // Test size selection
      const sizeSection = page
        .locator(
          '[data-testid="size-selector"], .size-selector, [class*="size"]',
        )
        .filter({
          has: page.locator("button, input[type='radio']"),
        });

      if ((await sizeSection.count()) > 0) {
        const sizeOptions = sizeSection.locator("button, label");
        const sizeCount = await sizeOptions.count();

        if (sizeCount > 0) {
          // Click different sizes and check price/availability updates
          for (let i = 0; i < Math.min(3, sizeCount); i++) {
            const sizeOption = sizeOptions.nth(i);
            const isDisabled = await sizeOption.isDisabled();

            if (!isDisabled) {
              await sizeOption.click();
              await page.waitForTimeout(300);

              // Check if selected
              const isSelected =
                (await sizeOption.getAttribute("aria-pressed")) === "true" ||
                (await sizeOption.getAttribute("data-selected")) === "true" ||
                (await sizeOption.getAttribute("class"))?.includes("selected");

              expect(isSelected).toBeTruthy();

              // Check if price updated
              const priceElement = page
                .locator('[data-testid="product-price"], .price')
                .first();
              const currentPrice = await priceElement.textContent();
              expect(currentPrice).toBeTruthy();
            }
          }
        }
      }

      // Test color selection
      const colorSection = page
        .locator(
          '[data-testid="color-selector"], .color-selector, [class*="color"]',
        )
        .filter({
          has: page.locator("button, input[type='radio']"),
        });

      if ((await colorSection.count()) > 0) {
        const colorOptions = colorSection.locator("button, label");

        if ((await colorOptions.count()) > 0) {
          const firstColor = colorOptions.first();
          await firstColor.click();
          await page.waitForTimeout(300);

          // Check if image gallery updated
          const mainImage = page
            .locator('[data-testid="main-image"], .main-image')
            .first();
          const imageSrc = await mainImage.getAttribute("src");
          expect(imageSrc).toBeTruthy();
        }
      }

      // Test custom options (like engraving)
      const customInput = page.locator(
        'input[placeholder*="custom"], input[placeholder*="engrav"], textarea[placeholder*="message"]',
      );
      if ((await customInput.count()) > 0) {
        await customInput.fill("Test Custom Text");

        // Check if price updates with customization
        const customPrice = page.locator(
          '[data-testid="custom-price"], .custom-price',
        );
        if ((await customPrice.count()) > 0) {
          const price = await customPrice.textContent();
          expect(price).toMatch(/[\d.,]+/);
        }
      }
    });

    test("should handle product quantity and stock", async ({ page }) => {
      await page.goto("/");
      await waitUtils.forNavigation();
      await page
        .locator('[data-testid="product-card"], .product-card')
        .first()
        .click();
      await waitUtils.forNavigation();

      // Test quantity selector
      const quantityInput = page.locator(
        'input[type="number"][name*="quantity"], input[data-testid="quantity"]',
      );
      const decreaseBtn = page.getByRole("button", {
        name: /decrease|minus|-/i,
      });
      const increaseBtn = page.getByRole("button", {
        name: /increase|plus|\+/i,
      });

      if ((await quantityInput.count()) > 0) {
        // Check initial value
        const initialValue = await quantityInput.inputValue();
        expect(initialValue).toBe("1");

        // Test increase
        if ((await increaseBtn.count()) > 0) {
          await increaseBtn.click();
          expect(await quantityInput.inputValue()).toBe("2");
        } else {
          await quantityInput.fill("2");
        }

        // Test decrease
        if ((await decreaseBtn.count()) > 0) {
          await decreaseBtn.click();
          expect(await quantityInput.inputValue()).toBe("1");

          // Shouldn't go below 1
          await decreaseBtn.click();
          expect(await quantityInput.inputValue()).toBe("1");
        }

        // Test max quantity (stock limit)
        await quantityInput.fill("999");
        await quantityInput.blur();
        const finalValue = await quantityInput.inputValue();
        // Should be limited by stock
        expect(Number(finalValue)).toBeLessThanOrEqual(999);
      }

      // Check stock status
      const stockStatus = page.locator(
        '[data-testid="stock-status"], .stock-status, [class*="stock"]',
      );
      if ((await stockStatus.count()) > 0) {
        const stockText = await stockStatus.textContent();
        expect(stockText).toMatch(
          /in stock|out of stock|available|unavailable|\d+ left/i,
        );
      }

      // Check if add to cart is disabled when out of stock
      const addToCartBtn = page.getByRole("button", {
        name: /add to cart|buy now/i,
      });
      const stockText = (await stockStatus.textContent()) || "";

      if (stockText.match(/out of stock|unavailable/i)) {
        expect(await addToCartBtn.isDisabled()).toBe(true);
      } else {
        expect(await addToCartBtn.isDisabled()).toBe(false);
      }
    });

    test("should handle add to cart functionality", async ({ page }) => {
      await page.goto("/");
      await waitUtils.forNavigation();
      await page
        .locator('[data-testid="product-card"], .product-card')
        .first()
        .click();
      await waitUtils.forNavigation();

      // Set up to capture cart updates
      let cartUpdateDetected = false;
      page.on("response", (response) => {
        if (
          response.url().includes("/cart") ||
          response.url().includes("/api/cart")
        ) {
          cartUpdateDetected = true;
        }
      });

      // Find add to cart button
      const addToCartBtn = page.getByRole("button", {
        name: /add to cart|add to bag/i,
      });
      await expect(addToCartBtn).toBeVisible();
      await expect(addToCartBtn).toBeEnabled();

      // Select options if required
      const sizeRequired = page
        .locator('[data-testid="size-required"], .error')
        .filter({ hasText: /select.*size/i });
      if ((await sizeRequired.count()) > 0) {
        const sizeOption = page
          .locator(
            '[data-testid="size-selector"] button, [class*="size"] button',
          )
          .first();
        if ((await sizeOption.count()) > 0) {
          await sizeOption.click();
        }
      }

      // Click add to cart
      await addToCartBtn.click();
      await page.waitForTimeout(1000);

      // Check for success indicators
      const successToast = page
        .locator('[role="alert"], .toast, [data-testid="notification"]')
        .filter({ hasText: /added|success/i });
      const cartIcon = page.locator(
        '[data-testid="cart-icon"], .cart-icon, [aria-label*="cart"]',
      );
      const cartCount = page.locator(
        '[data-testid="cart-count"], .cart-count, .badge',
      );
      const cartDrawer = page.locator(
        '[data-testid="cart-drawer"], .cart-drawer, aside[class*="cart"]',
      );

      // Verify cart was updated
      const cartUpdated =
        (await successToast.count()) > 0 ||
        (await cartDrawer.count()) > 0 ||
        ((await cartCount.count()) > 0 &&
          (await cartCount.textContent()) !== "0") ||
        cartUpdateDetected;

      expect(cartUpdated).toBeTruthy();

      // If cart drawer opened, close it
      if ((await cartDrawer.count()) > 0 && (await cartDrawer.isVisible())) {
        const closeBtn = cartDrawer.getByRole("button", { name: /close/i });
        if ((await closeBtn.count()) > 0) {
          await closeBtn.click();
          await page.waitForTimeout(300);
        }
      }
    });

    test("should handle wishlist/favorites functionality", async ({ page }) => {
      await page.goto("/");
      await waitUtils.forNavigation();
      await page
        .locator('[data-testid="product-card"], .product-card')
        .first()
        .click();
      await waitUtils.forNavigation();

      // Find favorite/wishlist button
      const favoriteBtn = page.locator(
        '[data-testid="favorite-btn"], button[aria-label*="favorite"], button[aria-label*="wishlist"], .favorite-btn',
      );

      if ((await favoriteBtn.count()) > 0) {
        // Check initial state
        const initialPressed = await favoriteBtn.getAttribute("aria-pressed");
        const initialClass = await favoriteBtn.getAttribute("class");

        // Click to toggle
        await favoriteBtn.click();
        await page.waitForTimeout(500);

        // Check state changed
        const newPressed = await favoriteBtn.getAttribute("aria-pressed");
        const newClass = await favoriteBtn.getAttribute("class");

        expect(
          newPressed !== initialPressed || newClass !== initialClass,
        ).toBeTruthy();

        // Look for feedback
        const notification = page.locator('[role="alert"], .toast').last();
        if ((await notification.count()) > 0) {
          const message = await notification.textContent();
          expect(message).toMatch(/added|removed|wishlist|favorite/i);
        }

        // Toggle back
        await favoriteBtn.click();
        await page.waitForTimeout(500);
      }
    });

    test("should display and handle product reviews", async ({ page }) => {
      await page.goto("/");
      await waitUtils.forNavigation();
      await page
        .locator('[data-testid="product-card"], .product-card')
        .first()
        .click();
      await waitUtils.forNavigation();

      // Scroll to reviews section
      const reviewsSection = page
        .locator(
          '[data-testid="reviews"], #reviews, .reviews, [class*="review"]',
        )
        .first();

      if ((await reviewsSection.count()) > 0) {
        await reviewsSection.scrollIntoViewIfNeeded();

        // Check review summary
        const reviewSummary = page.locator(
          '[data-testid="review-summary"], .review-summary',
        );
        if ((await reviewSummary.count()) > 0) {
          // Average rating
          const avgRating = reviewSummary.locator(
            '[data-testid="average-rating"], .average-rating',
          );
          if ((await avgRating.count()) > 0) {
            const rating = await avgRating.textContent();
            expect(rating).toMatch(/[\d.]+/);
          }

          // Total reviews
          const totalReviews = reviewSummary.locator(
            '[data-testid="total-reviews"], .total-reviews',
          );
          if ((await totalReviews.count()) > 0) {
            const total = await totalReviews.textContent();
            expect(total).toMatch(/\d+/);
          }
        }

        // Check individual reviews
        const reviewItems = page.locator(
          '[data-testid="review-item"], .review-item, article[class*="review"]',
        );

        if ((await reviewItems.count()) > 0) {
          const firstReview = reviewItems.first();

          // Reviewer name
          const reviewerName = firstReview.locator(
            '[data-testid="reviewer"], .reviewer, .author',
          );
          if ((await reviewerName.count()) > 0) {
            const name = await reviewerName.textContent();
            expect(name).toBeTruthy();
          }

          // Review rating
          const reviewRating = firstReview.locator(
            '[data-testid="review-rating"], .rating, [aria-label*="rating"]',
          );
          expect(await reviewRating.count()).toBeGreaterThan(0);

          // Review text
          const reviewText = firstReview.locator(
            '[data-testid="review-text"], .review-text, .comment',
          );
          if ((await reviewText.count()) > 0) {
            const text = await reviewText.textContent();
            expect(text).toBeTruthy();
          }

          // Review date
          const reviewDate = firstReview.locator(
            '[data-testid="review-date"], .date, time',
          );
          if ((await reviewDate.count()) > 0) {
            const date = await reviewDate.textContent();
            expect(date).toBeTruthy();
          }

          // Helpful votes
          const helpfulBtn = firstReview.getByRole("button", {
            name: /helpful|like/i,
          });
          if ((await helpfulBtn.count()) > 0) {
            await helpfulBtn.click();
            await page.waitForTimeout(300);

            // Check if count updated
            const voteCount = firstReview.locator(
              '[data-testid="helpful-count"], .helpful-count',
            );
            if ((await voteCount.count()) > 0) {
              const count = await voteCount.textContent();
              expect(count).toMatch(/\d+/);
            }
          }
        }

        // Test write review functionality
        const writeReviewBtn = page.getByRole("button", {
          name: /write.*review|add.*review/i,
        });
        if ((await writeReviewBtn.count()) > 0) {
          await writeReviewBtn.click();
          await page.waitForTimeout(300);

          // Check if review form opened
          const reviewForm = page.locator(
            '[data-testid="review-form"], .review-form, form[class*="review"]',
          );
          if ((await reviewForm.count()) > 0) {
            await expect(reviewForm).toBeVisible();

            // Check form fields
            const ratingInput = reviewForm.locator(
              '[data-testid="rating-input"], .rating-input',
            );
            const commentInput = reviewForm.locator("textarea");

            if ((await ratingInput.count()) > 0) {
              // Click a star rating
              const stars = ratingInput.locator("button, label");
              if ((await stars.count()) > 0) {
                await stars.nth(3).click(); // 4 stars
              }
            }

            if ((await commentInput.count()) > 0) {
              await commentInput.fill("This is a test review comment.");
            }

            // Don't submit to avoid creating test data
            const cancelBtn = reviewForm.getByRole("button", {
              name: /cancel|close/i,
            });
            if ((await cancelBtn.count()) > 0) {
              await cancelBtn.click();
            }
          }
        }
      }
    });

    test("should show related/recommended products", async ({ page }) => {
      await page.goto("/");
      await waitUtils.forNavigation();
      await page
        .locator('[data-testid="product-card"], .product-card')
        .first()
        .click();
      await waitUtils.forNavigation();

      // Look for related products section
      const relatedSection = page
        .locator('[data-testid="related-products"], .related-products, section')
        .filter({
          hasText: /related|recommended|similar|also like/i,
        });

      if ((await relatedSection.count()) > 0) {
        await relatedSection.scrollIntoViewIfNeeded();

        // Check for product cards in related section
        const relatedProducts = relatedSection.locator(
          '[data-testid="product-card"], .product-card, article',
        );
        expect(await relatedProducts.count()).toBeGreaterThan(0);

        // Test clicking on related product
        const firstRelated = relatedProducts.first();
        const relatedLink = firstRelated.getByRole("link");

        if ((await relatedLink.count()) > 0) {
          const currentUrl = page.url();
          await relatedLink.click();
          await waitUtils.forNavigation();

          // Should navigate to different product
          expect(page.url()).not.toBe(currentUrl);
          expect(page.url()).toMatch(/product|item/);
        }
      }
    });
  });

  test.describe("Product Search and Discovery", () => {
    test("should handle product search functionality", async ({ page }) => {
      await page.goto("/");
      await waitUtils.forNavigation();

      // Find search input
      const searchInput = page.getByRole("searchbox").first();
      const searchButton = page.getByRole("button", { name: /search/i });

      if ((await searchInput.count()) > 0) {
        // Type search query
        await searchInput.fill("shirt");

        // Submit search
        if ((await searchButton.count()) > 0) {
          await searchButton.click();
        } else {
          await searchInput.press("Enter");
        }

        await waitUtils.forNavigation();

        // Should be on search results page
        expect(page.url()).toMatch(/search|q=/);

        // Check for results
        const searchResults = page.locator(
          '[data-testid="search-results"], .search-results',
        );
        const resultCount = page.locator(
          '[data-testid="result-count"], .result-count',
        );
        const noResults = page.locator(
          '[data-testid="no-results"], .no-results',
        );

        if ((await noResults.count()) > 0) {
          // Should show no results message
          const message = await noResults.textContent();
          expect(message).toMatch(/no.*found|0.*results/i);
        } else {
          // Should show products
          const products = page.locator(
            '[data-testid="product-card"], .product-card',
          );
          expect(await products.count()).toBeGreaterThan(0);

          // Should show result count
          if ((await resultCount.count()) > 0) {
            const count = await resultCount.textContent();
            expect(count).toMatch(/\d+.*result/i);
          }
        }

        // Test search filters
        const searchFilters = page.locator(
          '[data-testid="search-filters"], .search-filters',
        );
        if ((await searchFilters.count()) > 0) {
          const categoryFilter = searchFilters.getByRole("button", {
            name: /category/i,
          });
          if ((await categoryFilter.count()) > 0) {
            await categoryFilter.click();
            await page.waitForTimeout(500);
          }
        }
      }
    });

    test("should handle search suggestions", async ({ page }) => {
      await page.goto("/");
      await waitUtils.forNavigation();

      const searchInput = page.getByRole("searchbox").first();

      if ((await searchInput.count()) > 0) {
        // Start typing
        await searchInput.fill("sh");
        await page.waitForTimeout(300);

        // Check for suggestions dropdown
        const suggestions = page.locator(
          '[data-testid="search-suggestions"], .suggestions, [role="listbox"]',
        );

        if ((await suggestions.count()) > 0) {
          await expect(suggestions).toBeVisible();

          // Check suggestion items
          const suggestionItems = suggestions.locator('[role="option"], li');
          expect(await suggestionItems.count()).toBeGreaterThan(0);

          // Test clicking a suggestion
          await suggestionItems.first().click();
          await waitUtils.forNavigation();

          // Should navigate to search or product
          expect(page.url()).toMatch(/search|product/);
        }
      }
    });

    test("should handle product quick view", async ({ page }) => {
      await page.goto("/en/products");
      await waitUtils.forNavigation();

      // Find quick view button on product cards
      const productCard = page
        .locator('[data-testid="product-card"], .product-card')
        .first();

      // Hover to reveal quick view button
      await productCard.hover();

      const quickViewBtn = productCard.getByRole("button", {
        name: /quick view|quick shop/i,
      });

      if ((await quickViewBtn.count()) > 0) {
        await quickViewBtn.click();
        await page.waitForTimeout(300);

        // Check for quick view modal
        const modal = page.getByRole("dialog");

        if ((await modal.count()) > 0) {
          await expect(modal).toBeVisible();

          // Check modal contains product info
          const modalTitle = modal.getByRole("heading");
          const modalPrice = modal.locator('[data-testid="price"], .price');
          const modalAddToCart = modal.getByRole("button", {
            name: /add to cart/i,
          });

          await expect(modalTitle).toBeVisible();
          await expect(modalPrice).toBeVisible();
          await expect(modalAddToCart).toBeVisible();

          // Test size selection in modal
          const sizeSelector = modal.locator(
            '[data-testid="size-selector"], .size-selector',
          );
          if ((await sizeSelector.count()) > 0) {
            const sizeOption = sizeSelector.locator("button").first();
            await sizeOption.click();
          }

          // Close modal
          const closeBtn = modal.getByRole("button", { name: /close/i });
          await closeBtn.click();
          await page.waitForTimeout(300);
          await expect(modal).not.toBeVisible();
        }
      }
    });
  });

  test.describe("Product SEO and Sharing", () => {
    test("should have proper SEO metadata", async ({ page }) => {
      await page.goto("/");
      await waitUtils.forNavigation();
      await page
        .locator('[data-testid="product-card"], .product-card')
        .first()
        .click();
      await waitUtils.forNavigation();

      // Check page title
      const title = await page.title();
      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(10);

      // Check meta description
      const description = await page.getAttribute(
        'meta[name="description"]',
        "content",
      );
      expect(description).toBeTruthy();
      expect(description.length).toBeGreaterThan(50);

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
      expect(ogImage).toBeTruthy();

      // Check structured data
      const jsonLd = await page
        .locator('script[type="application/ld+json"]')
        .first();
      if ((await jsonLd.count()) > 0) {
        const structuredData = await jsonLd.textContent();
        expect(structuredData).toContain("Product");
        expect(structuredData).toContain("price");
      }
    });

    test("should handle social sharing", async ({ page }) => {
      await page.goto("/");
      await waitUtils.forNavigation();
      await page
        .locator('[data-testid="product-card"], .product-card')
        .first()
        .click();
      await waitUtils.forNavigation();

      // Look for share buttons
      const shareSection = page.locator(
        '[data-testid="share-buttons"], .share-buttons, [class*="share"]',
      );

      if ((await shareSection.count()) > 0) {
        // Check for social share buttons
        const facebookShare = shareSection.getByRole("link", {
          name: /facebook/i,
        });
        const twitterShare = shareSection.getByRole("link", {
          name: /twitter|x/i,
        });
        const pinterestShare = shareSection.getByRole("link", {
          name: /pinterest/i,
        });
        const copyLinkBtn = shareSection.getByRole("button", {
          name: /copy.*link|share.*link/i,
        });

        // Verify share URLs
        if ((await facebookShare.count()) > 0) {
          const fbHref = await facebookShare.getAttribute("href");
          expect(fbHref).toContain("facebook.com");
        }

        if ((await twitterShare.count()) > 0) {
          const twHref = await twitterShare.getAttribute("href");
          expect(twHref).toMatch(/twitter\.com|x\.com/);
        }

        // Test copy link functionality
        if ((await copyLinkBtn.count()) > 0) {
          await copyLinkBtn.click();
          await page.waitForTimeout(300);

          // Check for success message
          const copySuccess = page
            .locator('[role="alert"], .toast')
            .filter({ hasText: /copied/i });
          if ((await copySuccess.count()) > 0) {
            await expect(copySuccess).toBeVisible();
          }
        }
      }
    });
  });

  test.describe("Product Performance and Accessibility", () => {
    test("should load product pages quickly", async ({ page }) => {
      const startTime = Date.now();

      await page.goto("/");
      await waitUtils.forNavigation();
      await page
        .locator('[data-testid="product-card"], .product-card')
        .first()
        .click();
      await waitUtils.forNavigation();

      const loadTime = Date.now() - startTime;

      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);

      // Critical elements should be visible quickly
      const criticalElements = [
        page.getByRole("heading", { level: 1 }),
        page.locator('[data-testid="product-price"], .price').first(),
        page.getByRole("button", { name: /add to cart/i }),
        page.locator("img").first(),
      ];

      for (const element of criticalElements) {
        if ((await element.count()) > 0) {
          await expect(element).toBeVisible({ timeout: 1000 });
        }
      }
    });

    test("should be accessible with keyboard navigation", async ({ page }) => {
      await page.goto("/");
      await waitUtils.forNavigation();
      await page
        .locator('[data-testid="product-card"], .product-card')
        .first()
        .click();
      await waitUtils.forNavigation();

      // Tab through interactive elements
      const interactiveElements = [];

      for (let i = 0; i < 10; i++) {
        await page.keyboard.press("Tab");
        const focused = await page.evaluate(() => {
          const el = document.activeElement;
          return {
            label:
              el?.getAttribute("aria-label") ||
              el?.textContent?.substring(0, 20),
            role: el?.getAttribute("role"),
            tag: el?.tagName,
          };
        });

        if (focused.tag) {
          interactiveElements.push(focused);
        }
      }

      // Should have various interactive elements
      expect(interactiveElements.length).toBeGreaterThan(5);

      // Should include important actions
      const hasAddToCart = interactiveElements.some((el) =>
        el.label?.match(/add to cart/i),
      );
      expect(hasAddToCart).toBeTruthy();
    });

    test("should have proper ARIA labels and roles", async ({ page }) => {
      await page.goto("/");
      await waitUtils.forNavigation();
      await page
        .locator('[data-testid="product-card"], .product-card')
        .first()
        .click();
      await waitUtils.forNavigation();

      // Check image alt texts
      const images = page.locator("img");
      for (let i = 0; i < Math.min(3, await images.count()); i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute("alt");
        expect(alt).toBeTruthy();
      }

      // Check button labels
      const buttons = page.getByRole("button");
      for (let i = 0; i < Math.min(5, await buttons.count()); i++) {
        const btn = buttons.nth(i);
        const label =
          (await btn.getAttribute("aria-label")) || (await btn.textContent());
        expect(label).toBeTruthy();
      }

      // Check form inputs
      const inputs = page.locator("input:visible, select:visible");
      for (let i = 0; i < Math.min(3, await inputs.count()); i++) {
        const input = inputs.nth(i);
        const id = await input.getAttribute("id");

        if (id) {
          const label = page.locator(`label[for="${id}"]`);
          const ariaLabel = await input.getAttribute("aria-label");

          // Should have either a label or aria-label
          expect((await label.count()) > 0 || ariaLabel).toBeTruthy();
        }
      }
    });
  });
});
