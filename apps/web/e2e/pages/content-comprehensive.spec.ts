import { expect, test } from "@repo/testing/e2e";
import { WaitUtils } from "@repo/testing/e2e";

test.describe("Content Pages - Comprehensive Tests", () => {
  let waitUtils: WaitUtils;

  test.beforeEach(async ({ page }) => {
    waitUtils = new WaitUtils(page);
  });

  test.describe("Blog Pages", () => {
    test("should display blog listing page", async ({ page }) => {
      // Try different possible blog URLs
      const blogUrls = ["/en/blog", "/en/news", "/en/articles", "/en/posts"];

      let foundBlog = false;
      for (const url of blogUrls) {
        await page.goto(url);
        await waitUtils.forNavigation();

        const blogGrid = page
          .locator('[data-testid="blog-grid"], .blog-grid, [class*="posts"]')
          .filter({
            has: page.locator('[data-testid="blog-post"], .blog-post, article'),
          });

        if ((await blogGrid.count()) > 0 || page.url().includes("blog")) {
          foundBlog = true;
          break;
        }
      }

      if (!foundBlog) {
        // Navigate from homepage
        await page.goto("/");
        await waitUtils.forNavigation();

        const blogLink = page.getByRole("link", {
          name: /blog|news|articles/i,
        });
        if ((await blogLink.count()) > 0) {
          await blogLink.first().click();
          await waitUtils.forNavigation();
        }
      }

      // Check for blog posts
      const blogPosts = page.locator(
        '[data-testid="blog-post"], .blog-post, article[class*="post"]',
      );
      expect(await blogPosts.count()).toBeGreaterThan(0);

      // Check first post structure
      const firstPost = blogPosts.first();

      // Post image
      const postImage = firstPost.locator("img");
      if ((await postImage.count()) > 0) {
        await expect(postImage).toBeVisible();
        const imageSrc = await postImage.getAttribute("src");
        expect(imageSrc).toBeTruthy();
      }

      // Post title
      const postTitle = firstPost.locator("h2, h3, [class*='title']");
      await expect(postTitle).toBeVisible();
      const title = await postTitle.textContent();
      expect(title).toBeTruthy();

      // Post excerpt
      const postExcerpt = firstPost.locator(
        "p, [class*='excerpt'], [class*='summary']",
      );
      if ((await postExcerpt.count()) > 0) {
        const excerpt = await postExcerpt.textContent();
        expect(excerpt).toBeTruthy();
        expect(excerpt.length).toBeGreaterThan(20);
      }

      // Post metadata
      const postDate = firstPost.locator(
        '[data-testid="post-date"], time, [class*="date"]',
      );
      if ((await postDate.count()) > 0) {
        const date = await postDate.textContent();
        expect(date).toBeTruthy();
      }

      const postAuthor = firstPost.locator(
        '[data-testid="post-author"], [class*="author"]',
      );
      if ((await postAuthor.count()) > 0) {
        const author = await postAuthor.textContent();
        expect(author).toBeTruthy();
      }

      // Read more link
      const readMoreLink = firstPost.getByRole("link", {
        name: /read more|continue|view/i,
      });
      if ((await readMoreLink.count()) > 0) {
        const href = await readMoreLink.getAttribute("href");
        expect(href).toContain("/blog");
      }
    });

    test("should handle blog categories and tags", async ({ page }) => {
      await page.goto("/en/blog");
      await waitUtils.forNavigation();

      // Look for category filter
      const categorySection = page.locator(
        '[data-testid="blog-categories"], .blog-categories, [class*="categories"]',
      );

      if ((await categorySection.count()) > 0) {
        const categoryLinks = categorySection.getByRole("link");

        if ((await categoryLinks.count()) > 0) {
          // Click first category
          const firstCategory = categoryLinks.first();
          const categoryText = await firstCategory.textContent();
          await firstCategory.click();
          await waitUtils.forNavigation();

          // Should filter posts by category
          expect(page.url()).toContain("category");

          // Posts should still be displayed
          const filteredPosts = page.locator(
            '[data-testid="blog-post"], .blog-post',
          );
          expect(await filteredPosts.count()).toBeGreaterThan(0);
        }
      }

      // Look for tag cloud
      const tagSection = page.locator(
        '[data-testid="blog-tags"], .blog-tags, [class*="tags"]',
      );

      if ((await tagSection.count()) > 0) {
        const tagLinks = tagSection.locator("a, button");

        if ((await tagLinks.count()) > 0) {
          // Click a tag
          await tagLinks.first().click();
          await waitUtils.forNavigation();

          // Should filter by tag
          expect(page.url()).toContain("tag");
        }
      }
    });

    test("should display individual blog post", async ({ page }) => {
      // Navigate to blog listing first
      await page.goto("/en/blog");
      await waitUtils.forNavigation();

      // Click on first blog post
      const firstPost = page
        .locator('[data-testid="blog-post"], .blog-post')
        .first();
      const postLink = firstPost.getByRole("link").first();

      await postLink.click();
      await waitUtils.forNavigation();

      // Should be on blog post page
      expect(page.url()).toMatch(/blog.*\/|post.*\//);

      // Check post content
      const postArticle = page.locator(
        'article, [data-testid="blog-article"], .blog-article',
      );
      await expect(postArticle).toBeVisible();

      // Post title
      const postTitle = page.getByRole("heading", { level: 1 });
      await expect(postTitle).toBeVisible();
      const title = await postTitle.textContent();
      expect(title).toBeTruthy();

      // Post metadata
      const postMeta = page.locator(
        '[data-testid="post-meta"], .post-meta, [class*="meta"]',
      );
      if ((await postMeta.count()) > 0) {
        // Author
        const author = postMeta.locator(
          '[data-testid="author"], [class*="author"]',
        );
        if ((await author.count()) > 0) {
          const authorName = await author.textContent();
          expect(authorName).toBeTruthy();
        }

        // Date
        const date = postMeta.locator('time, [data-testid="date"]');
        if ((await date.count()) > 0) {
          const dateText = await date.textContent();
          expect(dateText).toBeTruthy();
        }

        // Reading time
        const readingTime = postMeta.locator(
          '[data-testid="reading-time"], [class*="reading"]',
        );
        if ((await readingTime.count()) > 0) {
          const time = await readingTime.textContent();
          expect(time).toMatch(/\d+.*min/i);
        }
      }

      // Post content
      const postContent = page
        .locator(
          '[data-testid="post-content"], .post-content, [class*="content"]',
        )
        .first();
      await expect(postContent).toBeVisible();

      // Check content has paragraphs
      const paragraphs = postContent.locator("p");
      expect(await paragraphs.count()).toBeGreaterThan(0);

      // Featured image
      const featuredImage = page
        .locator('[data-testid="featured-image"], .featured-image, article img')
        .first();
      if ((await featuredImage.count()) > 0) {
        await expect(featuredImage).toBeVisible();
      }

      // Check for share buttons
      const shareSection = page.locator(
        '[data-testid="share-buttons"], .share-buttons',
      );
      if ((await shareSection.count()) > 0) {
        const shareButtons = shareSection.locator("a, button");
        expect(await shareButtons.count()).toBeGreaterThan(0);
      }
    });

    test("should handle blog post interactions", async ({ page }) => {
      // Navigate to a blog post
      await page.goto("/en/blog");
      await waitUtils.forNavigation();
      await page.locator('[data-testid="blog-post"]').first().click();
      await waitUtils.forNavigation();

      // Test social sharing
      const shareButtons = page.locator(
        '[data-testid="share-buttons"], .share-buttons',
      );
      if ((await shareButtons.count()) > 0) {
        const facebookShare = shareButtons.getByRole("link", {
          name: /facebook/i,
        });
        if ((await facebookShare.count()) > 0) {
          const href = await facebookShare.getAttribute("href");
          expect(href).toContain("facebook.com");
          expect(href).toContain(encodeURIComponent(page.url()));
        }

        const twitterShare = shareButtons.getByRole("link", {
          name: /twitter|x/i,
        });
        if ((await twitterShare.count()) > 0) {
          const href = await twitterShare.getAttribute("href");
          expect(href).toMatch(/twitter\.com|x\.com/);
        }

        const copyLinkBtn = shareButtons.getByRole("button", {
          name: /copy.*link/i,
        });
        if ((await copyLinkBtn.count()) > 0) {
          await copyLinkBtn.click();
          await page.waitForTimeout(300);

          const notification = page
            .locator('[role="alert"]')
            .filter({ hasText: /copied/i });
          if ((await notification.count()) > 0) {
            await expect(notification).toBeVisible();
          }
        }
      }

      // Test newsletter subscription
      const newsletterForm = page.locator(
        '[data-testid="newsletter-form"], .newsletter-form, form[class*="newsletter"]',
      );
      if ((await newsletterForm.count()) > 0) {
        const emailInput = newsletterForm.locator('input[type="email"]');
        const submitBtn = newsletterForm.getByRole("button", {
          name: /subscribe|sign up/i,
        });

        if ((await emailInput.count()) > 0 && (await submitBtn.count()) > 0) {
          await emailInput.fill("test@example.com");
          await submitBtn.click();
          await page.waitForTimeout(1000);

          // Check for success message
          const successMessage = page
            .locator('[role="alert"], .success-message')
            .filter({ hasText: /thank|subscribed/i });
          if ((await successMessage.count()) > 0) {
            await expect(successMessage).toBeVisible();
          }
        }
      }

      // Test related posts
      const relatedPosts = page
        .locator('[data-testid="related-posts"], .related-posts, section')
        .filter({
          hasText: /related|similar|also like/i,
        });

      if ((await relatedPosts.count()) > 0) {
        await relatedPosts.scrollIntoViewIfNeeded();

        const relatedLinks = relatedPosts.getByRole("link");
        expect(await relatedLinks.count()).toBeGreaterThan(0);

        // Click on related post
        const currentUrl = page.url();
        await relatedLinks.first().click();
        await waitUtils.forNavigation();

        // Should navigate to different post
        expect(page.url()).not.toBe(currentUrl);
        expect(page.url()).toMatch(/blog.*\/|post.*\//);
      }
    });

    test("should handle blog comments", async ({ page }) => {
      // Navigate to a blog post
      await page.goto("/en/blog");
      await waitUtils.forNavigation();
      await page.locator('[data-testid="blog-post"]').first().click();
      await waitUtils.forNavigation();

      // Scroll to comments section
      const commentsSection = page
        .locator(
          '[data-testid="comments"], #comments, .comments, [class*="comment"]',
        )
        .first();

      if ((await commentsSection.count()) > 0) {
        await commentsSection.scrollIntoViewIfNeeded();

        // Check for existing comments
        const commentItems = commentsSection.locator(
          '[data-testid="comment-item"], .comment-item',
        );

        if ((await commentItems.count()) > 0) {
          const firstComment = commentItems.first();

          // Comment author
          const commentAuthor = firstComment.locator(
            '[data-testid="comment-author"], .comment-author',
          );
          if ((await commentAuthor.count()) > 0) {
            const author = await commentAuthor.textContent();
            expect(author).toBeTruthy();
          }

          // Comment date
          const commentDate = firstComment.locator(
            '[data-testid="comment-date"], time',
          );
          if ((await commentDate.count()) > 0) {
            const date = await commentDate.textContent();
            expect(date).toBeTruthy();
          }

          // Comment text
          const commentText = firstComment.locator(
            '[data-testid="comment-text"], .comment-text',
          );
          if ((await commentText.count()) > 0) {
            const text = await commentText.textContent();
            expect(text).toBeTruthy();
          }

          // Reply button
          const replyBtn = firstComment.getByRole("button", { name: /reply/i });
          if ((await replyBtn.count()) > 0) {
            await replyBtn.click();
            await page.waitForTimeout(300);

            // Check for reply form
            const replyForm = page.locator(
              '[data-testid="reply-form"], .reply-form',
            );
            if ((await replyForm.count()) > 0) {
              await expect(replyForm).toBeVisible();

              // Cancel reply
              const cancelBtn = replyForm.getByRole("button", {
                name: /cancel/i,
              });
              if ((await cancelBtn.count()) > 0) {
                await cancelBtn.click();
              }
            }
          }
        }

        // Test comment form
        const commentForm = page.locator(
          '[data-testid="comment-form"], .comment-form, form[class*="comment"]',
        );
        if ((await commentForm.count()) > 0) {
          const nameInput = commentForm.locator(
            'input[name*="name"], input[placeholder*="name"]',
          );
          const emailInput = commentForm.locator('input[type="email"]');
          const commentTextarea = commentForm.locator("textarea");
          const submitBtn = commentForm.getByRole("button", {
            name: /submit|post/i,
          });

          if ((await nameInput.count()) > 0) {
            await nameInput.fill("Test User");
          }

          if ((await emailInput.count()) > 0) {
            await emailInput.fill("test@example.com");
          }

          if ((await commentTextarea.count()) > 0) {
            await commentTextarea.fill("This is a test comment.");
          }

          // Don't actually submit to avoid creating test data
          if ((await submitBtn.count()) > 0) {
            await expect(submitBtn).toBeEnabled();
          }
        }
      }
    });

    test("should handle blog search", async ({ page }) => {
      await page.goto("/en/blog");
      await waitUtils.forNavigation();

      // Look for blog search
      const blogSearch = page.locator(
        '[data-testid="blog-search"], .blog-search, input[placeholder*="search.*blog"]',
      );

      if ((await blogSearch.count()) > 0) {
        await blogSearch.fill("product");
        await blogSearch.press("Enter");
        await page.waitForTimeout(500);

        // Should show search results
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
          const posts = page.locator('[data-testid="blog-post"]');
          expect(await posts.count()).toBeGreaterThan(0);

          // Posts should match search
          const firstPostTitle = await posts
            .first()
            .locator("h2, h3")
            .textContent();
          // Title might contain search term
        }
      }
    });

    test("should handle blog pagination", async ({ page }) => {
      await page.goto("/en/blog");
      await waitUtils.forNavigation();

      // Check for pagination
      const pagination = page.getByRole("navigation", { name: /pagination/i });
      const loadMoreBtn = page.getByRole("button", {
        name: /load more|show more/i,
      });

      if ((await pagination.count()) > 0) {
        // Traditional pagination
        const pageLinks = pagination.getByRole("link");
        const nextBtn = pagination.getByRole("link", { name: /next|→/i });

        if ((await nextBtn.count()) > 0 && !(await nextBtn.isDisabled())) {
          await nextBtn.click();
          await waitUtils.forNavigation();

          // Should be on page 2
          expect(page.url()).toContain("page=2");

          // Should show different posts
          const posts = page.locator('[data-testid="blog-post"]');
          expect(await posts.count()).toBeGreaterThan(0);
        }
      } else if ((await loadMoreBtn.count()) > 0) {
        // Load more functionality
        const initialPosts = await page
          .locator('[data-testid="blog-post"]')
          .count();

        await loadMoreBtn.click();
        await page.waitForTimeout(1000);

        const newPostCount = await page
          .locator('[data-testid="blog-post"]')
          .count();
        expect(newPostCount).toBeGreaterThan(initialPosts);
      }
    });
  });

  test.describe("About Page", () => {
    test("should display about page content", async ({ page }) => {
      await page.goto("/en/about");
      await waitUtils.forNavigation();

      // Check page title
      const pageTitle = page.getByRole("heading", { level: 1 });
      await expect(pageTitle).toBeVisible();
      const title = await pageTitle.textContent();
      expect(title).toMatch(/about/i);

      // Check for key sections
      const missionSection = page
        .locator("section, div")
        .filter({ hasText: /mission|vision/i });
      const teamSection = page
        .locator("section, div")
        .filter({ hasText: /team|people/i });
      const valuesSection = page
        .locator("section, div")
        .filter({ hasText: /values|principles/i });

      // At least one key section should exist
      const hasKeySection =
        (await missionSection.count()) > 0 ||
        (await teamSection.count()) > 0 ||
        (await valuesSection.count()) > 0;

      expect(hasKeySection).toBeTruthy();

      // Check for content
      const mainContent = page.locator('main, [role="main"], .main-content');
      const paragraphs = mainContent.locator("p");
      expect(await paragraphs.count()).toBeGreaterThan(0);

      // Check for images
      const contentImages = mainContent.locator("img");
      if ((await contentImages.count()) > 0) {
        const firstImage = contentImages.first();
        await expect(firstImage).toBeVisible();
        const alt = await firstImage.getAttribute("alt");
        expect(alt).toBeTruthy();
      }
    });

    test("should display team members", async ({ page }) => {
      await page.goto("/en/about");
      await waitUtils.forNavigation();

      // Look for team section
      const teamSection = page
        .locator('[data-testid="team-section"], .team-section, section')
        .filter({
          hasText: /team|people|staff/i,
        });

      if ((await teamSection.count()) > 0) {
        await teamSection.scrollIntoViewIfNeeded();

        // Check for team member cards
        const teamMembers = teamSection.locator(
          '[data-testid="team-member"], .team-member',
        );

        if ((await teamMembers.count()) > 0) {
          const firstMember = teamMembers.first();

          // Member photo
          const memberPhoto = firstMember.locator("img");
          if ((await memberPhoto.count()) > 0) {
            await expect(memberPhoto).toBeVisible();
          }

          // Member name
          const memberName = firstMember.locator("h3, h4, [class*='name']");
          if ((await memberName.count()) > 0) {
            const name = await memberName.textContent();
            expect(name).toBeTruthy();
          }

          // Member role
          const memberRole = firstMember.locator(
            '[data-testid="member-role"], .role, [class*="title"]',
          );
          if ((await memberRole.count()) > 0) {
            const role = await memberRole.textContent();
            expect(role).toBeTruthy();
          }

          // Member bio
          const memberBio = firstMember.locator("p, [class*='bio']");
          if ((await memberBio.count()) > 0) {
            const bio = await memberBio.textContent();
            expect(bio).toBeTruthy();
          }

          // Social links
          const socialLinks = firstMember.locator(
            "a[href*='linkedin'], a[href*='twitter']",
          );
          if ((await socialLinks.count()) > 0) {
            const href = await socialLinks.first().getAttribute("href");
            expect(href).toMatch(/linkedin|twitter/);
          }
        }
      }
    });

    test("should display company timeline or history", async ({ page }) => {
      await page.goto("/en/about");
      await waitUtils.forNavigation();

      // Look for timeline/history section
      const timelineSection = page.locator(
        '[data-testid="timeline"], .timeline, [class*="history"]',
      );

      if ((await timelineSection.count()) > 0) {
        await timelineSection.scrollIntoViewIfNeeded();

        // Check for timeline items
        const timelineItems = timelineSection.locator(
          '[data-testid="timeline-item"], .timeline-item',
        );

        if ((await timelineItems.count()) > 0) {
          const firstItem = timelineItems.first();

          // Year/Date
          const itemDate = firstItem.locator(
            '[data-testid="timeline-date"], .date, time',
          );
          if ((await itemDate.count()) > 0) {
            const date = await itemDate.textContent();
            expect(date).toMatch(/\d{4}/); // Should contain year
          }

          // Event title
          const itemTitle = firstItem.locator("h3, h4, [class*='title']");
          if ((await itemTitle.count()) > 0) {
            const title = await itemTitle.textContent();
            expect(title).toBeTruthy();
          }

          // Event description
          const itemDesc = firstItem.locator("p, [class*='description']");
          if ((await itemDesc.count()) > 0) {
            const desc = await itemDesc.textContent();
            expect(desc).toBeTruthy();
          }
        }
      }
    });
  });

  test.describe("Contact Page", () => {
    test("should display contact form", async ({ page }) => {
      await page.goto("/en/contact");
      await waitUtils.forNavigation();

      // Check page title
      const pageTitle = page.getByRole("heading", { level: 1 });
      await expect(pageTitle).toBeVisible();
      const title = await pageTitle.textContent();
      expect(title).toMatch(/contact/i);

      // Check contact form
      const contactForm = page.locator(
        '[data-testid="contact-form"], .contact-form, form',
      );
      await expect(contactForm).toBeVisible();

      // Check form fields
      const nameInput = contactForm.locator(
        'input[name*="name"], input[placeholder*="name"]',
      );
      const emailInput = contactForm.locator('input[type="email"]');
      const subjectInput = contactForm.locator(
        'input[name*="subject"], input[placeholder*="subject"]',
      );
      const messageTextarea = contactForm.locator("textarea");
      const submitBtn = contactForm.getByRole("button", {
        name: /send|submit/i,
      });

      await expect(nameInput).toBeVisible();
      await expect(emailInput).toBeVisible();
      await expect(messageTextarea).toBeVisible();
      await expect(submitBtn).toBeVisible();

      // Subject might be optional
      if ((await subjectInput.count()) > 0) {
        await expect(subjectInput).toBeVisible();
      }
    });

    test("should validate contact form", async ({ page }) => {
      await page.goto("/en/contact");
      await waitUtils.forNavigation();

      const contactForm = page.locator('[data-testid="contact-form"], form');
      const submitBtn = contactForm.getByRole("button", {
        name: /send|submit/i,
      });

      // Try to submit empty form
      await submitBtn.click();
      await page.waitForTimeout(500);

      // Should show validation errors
      const errors = page.locator('[class*="error"], [role="alert"]');
      expect(await errors.count()).toBeGreaterThan(0);

      // Fill form with invalid data
      const emailInput = contactForm.locator('input[type="email"]');
      await emailInput.fill("invalid-email");
      await emailInput.blur();
      await page.waitForTimeout(300);

      // Should show email error
      const emailError = page
        .locator('[id*="email-error"], [class*="error"]')
        .filter({ hasText: /email/i });
      expect(await emailError.count()).toBeGreaterThan(0);

      // Fill form correctly
      await page.fill('input[name*="name"]', "John Doe");
      await emailInput.fill("john@example.com");
      await page.fill("textarea", "This is a test message.");

      // Form should be valid now
      const nameInput = contactForm.locator('input[name*="name"]');
      const isValid = await nameInput.evaluate(
        (el: HTMLInputElement) => el.validity.valid,
      );
      expect(isValid).toBeTruthy();
    });

    test("should handle contact form submission", async ({ page }) => {
      await page.goto("/en/contact");
      await waitUtils.forNavigation();

      const contactForm = page.locator('[data-testid="contact-form"], form');

      // Fill form
      await page.fill('input[name*="name"]', "John Doe");
      await page.fill('input[type="email"]', "john@example.com");
      await page.fill('input[name*="subject"]', "Test Subject");
      await page.fill(
        "textarea",
        "This is a test message from the e2e test suite.",
      );

      // Submit form
      const submitBtn = contactForm.getByRole("button", {
        name: /send|submit/i,
      });
      await submitBtn.click();
      await page.waitForTimeout(2000);

      // Check for success message or redirect
      const successMessage = page
        .locator('[role="alert"], .success-message')
        .filter({ hasText: /thank|sent|received/i });
      const isRedirected = page.url().includes("thank");

      if ((await successMessage.count()) > 0) {
        await expect(successMessage).toBeVisible();
        const message = await successMessage.textContent();
        expect(message).toMatch(/thank|sent|received/i);
      } else if (isRedirected) {
        // Redirected to thank you page
        const thankYouMessage = page
          .getByRole("heading")
          .filter({ hasText: /thank/i });
        if ((await thankYouMessage.count()) > 0) {
          await expect(thankYouMessage).toBeVisible();
        }
      }
    });

    test("should display contact information", async ({ page }) => {
      await page.goto("/en/contact");
      await waitUtils.forNavigation();

      // Look for contact info section
      const contactInfo = page.locator(
        '[data-testid="contact-info"], .contact-info, aside',
      );

      if ((await contactInfo.count()) > 0) {
        // Check for address
        const address = contactInfo.locator(
          '[data-testid="address"], address, [class*="address"]',
        );
        if ((await address.count()) > 0) {
          const addressText = await address.textContent();
          expect(addressText).toBeTruthy();
        }

        // Check for phone
        const phone = contactInfo.locator(
          'a[href^="tel:"], [data-testid="phone"]',
        );
        if ((await phone.count()) > 0) {
          const phoneNumber = await phone.textContent();
          expect(phoneNumber).toMatch(/[\d\s\-\+\(\)]+/);
        }

        // Check for email
        const email = contactInfo.locator(
          'a[href^="mailto:"], [data-testid="email"]',
        );
        if ((await email.count()) > 0) {
          const emailAddress = await email.textContent();
          expect(emailAddress).toMatch(/@/);
        }

        // Check for business hours
        const hours = contactInfo.locator(
          '[data-testid="hours"], .hours, [class*="hours"]',
        );
        if ((await hours.count()) > 0) {
          const hoursText = await hours.textContent();
          expect(hoursText).toMatch(/\d+.*[ap]m/i);
        }
      }
    });

    test("should display location map", async ({ page }) => {
      await page.goto("/en/contact");
      await waitUtils.forNavigation();

      // Look for map
      const mapContainer = page.locator(
        '[data-testid="map"], .map, iframe[src*="maps"], iframe[src*="google"]',
      );

      if ((await mapContainer.count()) > 0) {
        await mapContainer.scrollIntoViewIfNeeded();
        await expect(mapContainer).toBeVisible();

        // If it's an iframe, check src
        if (mapContainer.locator("iframe").count() > 0) {
          const mapSrc = await mapContainer
            .locator("iframe")
            .getAttribute("src");
          expect(mapSrc).toMatch(/maps|google/);
        }
      }
    });

    test("should handle department selection", async ({ page }) => {
      await page.goto("/en/contact");
      await waitUtils.forNavigation();

      // Look for department selector
      const departmentSelect = page.locator(
        'select[name*="department"], [data-testid="department"]',
      );

      if ((await departmentSelect.count()) > 0) {
        // Get options
        const options = await departmentSelect.locator("option").all();
        expect(options.length).toBeGreaterThan(1);

        // Select different department
        await departmentSelect.selectOption({ index: 1 });
        await page.waitForTimeout(300);

        // Form might update based on department
        const contactForm = page.locator('[data-testid="contact-form"], form');

        // Check if additional fields appear
        const additionalFields = contactForm.locator('input[type="text"]');
        // Count might change based on department
      }
    });
  });

  test.describe("FAQ Page", () => {
    test("should display FAQ categories", async ({ page }) => {
      const faqUrls = ["/en/faq", "/en/help", "/en/support"];

      let foundFAQ = false;
      for (const url of faqUrls) {
        await page.goto(url);
        await waitUtils.forNavigation();

        if (page.url().includes("faq") || page.url().includes("help")) {
          foundFAQ = true;
          break;
        }
      }

      if (!foundFAQ) {
        // Try navigation from footer
        await page.goto("/");
        await waitUtils.forNavigation();
        await page.evaluate(() =>
          window.scrollTo(0, document.body.scrollHeight),
        );

        const faqLink = page.getByRole("link", { name: /faq|help/i });
        if ((await faqLink.count()) > 0) {
          await faqLink.click();
          await waitUtils.forNavigation();
        }
      }

      // Check for FAQ content
      const faqSection = page.locator(
        '[data-testid="faq-section"], .faq-section',
      );

      if ((await faqSection.count()) > 0) {
        // Check for categories
        const categories = faqSection.locator(
          '[data-testid="faq-category"], .faq-category',
        );

        if ((await categories.count()) > 0) {
          // Click first category
          await categories.first().click();
          await page.waitForTimeout(300);

          // Should show questions in that category
          const questions = page.locator('[data-testid="faq-item"], .faq-item');
          expect(await questions.count()).toBeGreaterThan(0);
        }
      }
    });

    test("should handle FAQ accordion", async ({ page }) => {
      await page.goto("/en/faq");
      await waitUtils.forNavigation();

      // Find FAQ items
      const faqItems = page.locator(
        '[data-testid="faq-item"], .faq-item, [class*="accordion"]',
      );

      if ((await faqItems.count()) > 0) {
        const firstItem = faqItems.first();

        // Click to expand
        const questionBtn = firstItem
          .locator("button, [role='button']")
          .first();
        await questionBtn.click();
        await page.waitForTimeout(300);

        // Check answer is visible
        const answer = firstItem.locator(
          '[data-testid="faq-answer"], .faq-answer, [class*="answer"]',
        );
        await expect(answer).toBeVisible();
        const answerText = await answer.textContent();
        expect(answerText).toBeTruthy();

        // Click again to collapse
        await questionBtn.click();
        await page.waitForTimeout(300);

        // Answer should be hidden
        const isHidden =
          (await answer.isHidden()) ||
          (await answer.getAttribute("aria-hidden")) === "true";
        expect(isHidden).toBeTruthy();
      }
    });

    test("should search FAQs", async ({ page }) => {
      await page.goto("/en/faq");
      await waitUtils.forNavigation();

      // Look for FAQ search
      const faqSearch = page.locator(
        '[data-testid="faq-search"], input[placeholder*="search.*faq"], input[placeholder*="search.*help"]',
      );

      if ((await faqSearch.count()) > 0) {
        await faqSearch.fill("return");
        await page.waitForTimeout(500);

        // Should filter FAQs
        const visibleFAQs = page.locator('[data-testid="faq-item"]:visible');
        const hiddenFAQs = page.locator('[data-testid="faq-item"]:hidden');

        // Some FAQs should be visible, others hidden
        if ((await visibleFAQs.count()) > 0) {
          // Check visible FAQs contain search term
          const firstVisible = visibleFAQs.first();
          const text = await firstVisible.textContent();
          expect(text?.toLowerCase()).toContain("return");
        }

        // Clear search
        await faqSearch.clear();
        await page.waitForTimeout(500);
      }
    });
  });

  test.describe("Content SEO and Performance", () => {
    test("should have proper SEO metadata for content pages", async ({
      page,
    }) => {
      const contentPages = ["/en/about", "/en/contact", "/en/blog"];

      for (const contentPage of contentPages) {
        await page.goto(contentPage);
        await waitUtils.forNavigation();

        // Check title
        const title = await page.title();
        expect(title).toBeTruthy();
        expect(title.length).toBeGreaterThan(10);
        expect(title.length).toBeLessThan(70); // SEO best practice

        // Check meta description
        const description = await page.getAttribute(
          'meta[name="description"]',
          "content",
        );
        expect(description).toBeTruthy();
        expect(description.length).toBeGreaterThan(50);
        expect(description.length).toBeLessThan(160); // SEO best practice

        // Check Open Graph tags
        const ogTitle = await page.getAttribute(
          'meta[property="og:title"]',
          "content",
        );
        const ogDescription = await page.getAttribute(
          'meta[property="og:description"]',
          "content",
        );
        const ogType = await page.getAttribute(
          'meta[property="og:type"]',
          "content",
        );

        expect(ogTitle).toBeTruthy();
        expect(ogDescription).toBeTruthy();
        expect(ogType).toBeTruthy();

        // Check canonical URL
        const canonical = await page.getAttribute(
          'link[rel="canonical"]',
          "href",
        );
        if (canonical) {
          expect(canonical).toContain(contentPage);
        }
      }
    });

    test("should have structured data for blog posts", async ({ page }) => {
      // Navigate to a blog post
      await page.goto("/en/blog");
      await waitUtils.forNavigation();

      const firstPost = page.locator('[data-testid="blog-post"]').first();
      if ((await firstPost.count()) > 0) {
        await firstPost.click();
        await waitUtils.forNavigation();

        // Check for Article structured data
        const jsonLd = await page.locator('script[type="application/ld+json"]');
        if ((await jsonLd.count()) > 0) {
          const structuredData = await jsonLd.textContent();
          expect(structuredData).toContain("Article");
          expect(structuredData).toContain("author");
          expect(structuredData).toContain("datePublished");
        }
      }
    });

    test("should load content pages quickly", async ({ page }) => {
      const contentPages = [
        { name: "About", url: "/en/about" },
        { name: "Contact", url: "/en/contact" },
        { name: "Blog", url: "/en/blog" },
      ];

      for (const contentPage of contentPages) {
        const startTime = Date.now();
        await page.goto(contentPage.url);
        await waitUtils.forNavigation();
        const loadTime = Date.now() - startTime;

        // Should load within 2 seconds
        expect(loadTime).toBeLessThan(2000);

        // Critical content should be visible quickly
        const heading = page.getByRole("heading", { level: 1 });
        await expect(heading).toBeVisible({ timeout: 800 });
      }
    });

    test("should be accessible", async ({ page }) => {
      const contentPages = ["/en/about", "/en/contact", "/en/blog"];

      for (const contentPage of contentPages) {
        await page.goto(contentPage);
        await waitUtils.forNavigation();

        // Check heading hierarchy
        const h1Count = await page.getByRole("heading", { level: 1 }).count();
        expect(h1Count).toBe(1);

        // Check images have alt text
        const images = page.locator("img");
        for (let i = 0; i < Math.min(5, await images.count()); i++) {
          const img = images.nth(i);
          const alt = await img.getAttribute("alt");
          expect(alt).toBeTruthy();
        }

        // Check form labels (if forms exist)
        const forms = page.locator("form");
        if ((await forms.count()) > 0) {
          const inputs = forms
            .first()
            .locator("input:visible, textarea:visible");
          for (let i = 0; i < Math.min(3, await inputs.count()); i++) {
            const input = inputs.nth(i);
            const id = await input.getAttribute("id");

            if (id) {
              const label = page.locator(`label[for="${id}"]`);
              const ariaLabel = await input.getAttribute("aria-label");

              // Should have either label or aria-label
              expect((await label.count()) > 0 || ariaLabel).toBeTruthy();
            }
          }
        }

        // Check color contrast (basic check)
        const textElements = page.locator("p, h1, h2, h3").first();
        if ((await textElements.count()) > 0) {
          const color = await textElements.evaluate(
            (el) => window.getComputedStyle(el).color,
          );
          expect(color).toBeTruthy();
        }
      }
    });
  });
});
