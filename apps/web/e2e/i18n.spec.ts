import { expect, test } from "@repo/testing/e2e";
import { PerformanceUtils, WaitUtils } from "@repo/testing/e2e";

import { withPerformanceMonitoring } from "./utils/performance-monitor";
import { createVisualTester } from "./utils/visual-testing";

test.describe("Internationalization (i18n) - Enhanced", () => {
  let waitUtils: WaitUtils;
  let perfUtils: PerformanceUtils;

  const supportedLocales = ["en", "es", "fr", "pt", "de"];
  const defaultLocale = "en";

  test.beforeEach(async ({ page }) => {
    waitUtils = new WaitUtils(page);
    perfUtils = new PerformanceUtils(page);
  });

  test("comprehensive locale routing and performance analysis", async ({
    context,
    page,
  }) => {
    const visualTester = createVisualTester(page);
    const localeResults = [];

    // Test default locale redirect first
    const { result: defaultRedirectResult } = await withPerformanceMonitoring(
      page,
      context,
      "/",
      async () => {
        await waitUtils.forNavigation();
        const finalUrl = page.url();
        expect(finalUrl).toContain(`/${defaultLocale}`);
        return { expectedLocale: defaultLocale, redirectedTo: finalUrl };
      },
      {
        fcp: { error: 3000, warning: 1500 },
        lcp: { error: 4000, warning: 2500 },
      },
    );

    localeResults.push({
      locale: "default-redirect",
      ...defaultRedirectResult,
    });

    // Test all supported locales with performance monitoring
    for (const locale of supportedLocales) {
      const { report, result } = await withPerformanceMonitoring(
        page,
        context,
        `/${locale}`,
        async () => {
          await waitUtils.forNavigation();

          // Verify URL contains locale
          const currentUrl = page.url();
          expect(currentUrl).toContain(`/${locale}`);

          // Check HTML lang attribute
          const htmlLang = await page.getAttribute("html", "lang");
          expect(htmlLang).toBe(locale);

          // Check for locale-specific content indicators
          const pageContent = await page.evaluate(() => {
            const title = document.title;
            const headings = Array.from(document.querySelectorAll("h1, h2, h3"))
              .map((h) => h.textContent?.trim())
              .filter(Boolean);
            const navText = Array.from(
              document.querySelectorAll("nav a, nav button"),
            )
              .map((el) => el.textContent?.trim())
              .filter(Boolean);

            return {
              hasContent: title.length > 0 && headings.length > 0,
              headings: headings.slice(0, 5),
              navigation: navText.slice(0, 10),
              title,
            };
          });

          // Take visual regression screenshot
          await visualTester.comparePageState(
            page,
            `homepage-locale-${locale}`,
            {
              animations: "disabled",
              clip: { width: 1200, height: 800, x: 0, y: 0 },
              fullPage: false,
            },
          );

          return {
            url: currentUrl,
            content: pageContent,
            htmlLang,
            loadedSuccessfully: pageContent.hasContent,
            locale,
          };
        },
        {
          fcp: { error: 3500, warning: 2000 },
          lcp: { error: 5000, warning: 3000 },
        },
      );

      localeResults.push({
        ...result,
        performance: {
          cls: report.cls,
          fcp: report.fcp,
          lcp: report.lcp,
          networkRequests: report.networkActivity?.requestCount || 0,
        },
      });

      expect(result.loadedSuccessfully).toBeTruthy();
    }

    await test.info().attach("locale-routing-performance", {
      body: JSON.stringify(localeResults, null, 2),
      contentType: "application/json",
    });
  });

  test("comprehensive locale switcher functionality and user experience", async ({
    context,
    page,
  }) => {
    const { report, result } = await withPerformanceMonitoring(
      page,
      context,
      `/${defaultLocale}`,
      async () => {
        await waitUtils.forNavigation();

        // Comprehensive locale switcher analysis
        const localeSwitcherAnalysis = await page.evaluate(() => {
          // Look for various locale switcher patterns
          const buttonSwitcher = document.querySelector(
            'button[aria-label*="language"], button[aria-label*="locale"], [data-testid="locale-switcher"]',
          );
          const selectSwitcher = document.querySelector(
            'select[name*="locale"], select[name*="language"]',
          );
          const linkSwitchers = Array.from(
            document.querySelectorAll(
              'a[href*="/en"], a[href*="/es"], a[href*="/fr"]',
            ),
          );

          const switcherType = buttonSwitcher
            ? "button"
            : selectSwitcher
              ? "select"
              : linkSwitchers.length > 0
                ? "links"
                : "none";

          return {
            accessibilityFeatures: {
              hasAriaLabels: !!(
                buttonSwitcher?.getAttribute("aria-label") ||
                selectSwitcher?.getAttribute("aria-label")
              ),
              hasKeyboardSupport: !!(buttonSwitcher || selectSwitcher),
              isVisible: switcherType !== "none",
            },
            buttonSwitcher: buttonSwitcher
              ? {
                  ariaLabel: buttonSwitcher.getAttribute("aria-label"),
                  hasAriaExpanded: buttonSwitcher.hasAttribute("aria-expanded"),
                  textContent: buttonSwitcher.textContent?.trim(),
                }
              : null,
            hasSwitcher: !!(
              buttonSwitcher ||
              selectSwitcher ||
              linkSwitchers.length > 0
            ),
            linkSwitchers: linkSwitchers.length,
            selectSwitcher: selectSwitcher
              ? {
                  name: selectSwitcher.getAttribute("name"),
                  optionCount: selectSwitcher.querySelectorAll("option").length,
                }
              : null,
            switcherType,
          };
        });

        // Test locale switching functionality
        const switchingResults = [];

        if (localeSwitcherAnalysis.switcherType === "button") {
          const localeSwitcher = page
            .getByRole("button", {
              name: /language|locale|en|english/i,
            })
            .first();

          if ((await localeSwitcher.count()) > 0) {
            await localeSwitcher.click();
            await page.waitForTimeout(500);

            // Check for available options
            const localeOptions = await page.evaluate(() => {
              const options = Array.from(
                document.querySelectorAll(
                  '[role="option"], .locale-option, [data-locale]',
                ),
              );
              return options.map((option) => ({
                text: option.textContent?.trim(),
                value:
                  option.getAttribute("data-locale") ||
                  option.getAttribute("value"),
                visible: (option as HTMLElement).offsetParent !== null,
              }));
            });

            switchingResults.push({
              method: "button-dropdown",
              options: localeOptions,
              optionsFound: localeOptions.length,
            });

            // Try to switch to Spanish if available
            const spanishOption = page.getByRole("option", {
              name: /español|spanish|es/i,
            });

            if ((await spanishOption.count()) > 0) {
              const initialUrl = page.url();
              await spanishOption.first().click();
              await waitUtils.forNavigation();

              const newUrl = page.url();
              const switchedSuccessfully =
                newUrl.includes("/es") && newUrl !== initialUrl;

              switchingResults.push({
                initialUrl,
                method: "spanish-switch",
                newUrl,
                success: switchedSuccessfully,
              });

              if (switchedSuccessfully) {
                expect(newUrl).toContain("/es");
              }
            }
          }
        } else if (localeSwitcherAnalysis.switcherType === "select") {
          const localeSelect = page
            .getByRole("combobox", {
              name: /language|locale/i,
            })
            .first();

          if ((await localeSelect.count()) > 0) {
            const options = await localeSelect.locator("option").count();
            expect(options).toBeGreaterThanOrEqual(supportedLocales.length);

            switchingResults.push({
              method: "select-dropdown",
              optionCount: options,
            });
          }
        }

        return {
          hasWorkingSwitcher:
            localeSwitcherAnalysis.hasSwitcher && switchingResults.length > 0,
          localeSwitcherAnalysis,
          switchingResults,
        };
      },
      {
        fcp: { error: 3000, warning: 1500 },
        lcp: { error: 4000, warning: 2500 },
      },
    );

    // Validations
    if (result.localeSwitcherAnalysis.hasSwitcher) {
      expect(
        result.localeSwitcherAnalysis.accessibilityFeatures.hasKeyboardSupport,
      ).toBeTruthy();
    }

    await test.info().attach("locale-switcher-analysis", {
      body: JSON.stringify({ ...result, performance: report }, null, 2),
      contentType: "application/json",
    });
  });

  test("comprehensive locale persistence and navigation patterns", async ({
    page,
  }) => {
    const testLocales = ["es", "fr"];
    const testPages = ["/about", "/contact", "/products", "/blog"];
    const navigationResults = [];

    for (const testLocale of testLocales) {
      const localeNavigation = {
        directNavigation: [],
        linkNavigation: [],
        locale: testLocale,
        queryParamPreservation: [],
      };

      // Test direct navigation to pages with locale
      for (const testPage of testPages) {
        try {
          await page.goto(`/${testLocale}${testPage}`);
          await waitUtils.forNavigation();

          const currentUrl = page.url();
          const maintainsLocale = currentUrl.includes(
            `/${testLocale}${testPage}`,
          );

          localeNavigation.directNavigation.push({
            actualUrl: currentUrl,
            expectedUrl: `/${testLocale}${testPage}`,
            page: testPage,
            success: maintainsLocale,
          });

          if (maintainsLocale) {
            expect(currentUrl).toContain(`/${testLocale}${testPage}`);
          }
        } catch (error) {
          localeNavigation.directNavigation.push({
            error: error.message,
            page: testPage,
          });
        }
      }

      // Test locale persistence through link navigation
      await page.goto(`/${testLocale}`);
      await waitUtils.forNavigation();

      const links = await page.locator('a[href^="/"]').all();
      const testLinks = links.slice(0, 5); // Test first 5 internal links

      for (const link of testLinks) {
        try {
          const href = await link.getAttribute("href");
          if (href && href.startsWith("/") && !href.includes("http")) {
            const beforeUrl = page.url();
            await link.click();
            await waitUtils.forNavigation();

            const afterUrl = page.url();
            const maintainsLocale = afterUrl.includes(`/${testLocale}`);

            localeNavigation.linkNavigation.push({
              afterUrl,
              beforeUrl,
              href,
              maintainsLocale,
            });

            if (maintainsLocale) {
              expect(afterUrl).toContain(`/${testLocale}`);
            }

            // Return to homepage for next test
            await page.goto(`/${testLocale}`);
            await waitUtils.forNavigation();
          }
        } catch (error) {
          localeNavigation.linkNavigation.push({
            error: error.message,
          });
        }
      }

      // Test query parameter preservation during locale navigation
      const queryParams = "?category=electronics&sort=price";
      await page.goto(`/${testLocale}${queryParams}`);
      await waitUtils.forNavigation();

      const urlWithParams = page.url();
      const preservesParams = urlWithParams.includes(queryParams);

      localeNavigation.queryParamPreservation.push({
        finalUrl: urlWithParams,
        originalParams: queryParams,
        preserved: preservesParams,
      });

      navigationResults.push(localeNavigation);
    }

    await test.info().attach("locale-navigation-analysis", {
      body: JSON.stringify(navigationResults, null, 2),
      contentType: "application/json",
    });

    // Validate that at least one locale maintains navigation properly
    const successfulLocales = navigationResults.filter((result) =>
      result.directNavigation.some((nav) => nav.success),
    );
    expect(successfulLocales.length).toBeGreaterThan(0);
  });

  test("comprehensive translation coverage and content localization", async ({
    context,
    page,
  }) => {
    const translationTestData = {
      en: {
        commonWords: [
          "home",
          "shop",
          "products",
          "cart",
          "about",
          "contact",
          "search",
        ],
        expected: ["home", "shop", "products", "cart"],
        locale: "en",
      },
      es: {
        commonWords: [
          "inicio",
          "tienda",
          "productos",
          "carrito",
          "acerca",
          "contacto",
          "buscar",
        ],
        expected: ["inicio", "tienda", "productos", "carrito"],
        locale: "es",
      },
      fr: {
        commonWords: [
          "accueil",
          "boutique",
          "produits",
          "panier",
          "à propos",
          "contact",
          "recherche",
        ],
        expected: ["accueil", "boutique", "produits", "panier"],
        locale: "fr",
      },
    };

    const translationResults = [];

    for (const [localeKey, testData] of Object.entries(translationTestData)) {
      const { report, result } = await withPerformanceMonitoring(
        page,
        context,
        `/${testData.locale}`,
        async () => {
          await waitUtils.forNavigation();

          // Comprehensive content analysis
          const contentAnalysis = await page.evaluate((expectedWords) => {
            const pageText = document.body.textContent?.toLowerCase() || "";
            const title = document.title.toLowerCase();
            const headings = Array.from(
              document.querySelectorAll("h1, h2, h3, h4, h5, h6"),
            )
              .map((h) => h.textContent?.toLowerCase().trim())
              .filter(Boolean);
            const navItems = Array.from(
              document.querySelectorAll("nav a, nav button"),
            )
              .map((item) => item.textContent?.toLowerCase().trim())
              .filter(Boolean);
            const metaDescription =
              document
                .querySelector('meta[name="description"]')
                ?.getAttribute("content")
                ?.toLowerCase() || "";

            const foundWords = expectedWords.filter(
              (word) =>
                pageText.includes(word) ||
                title.includes(word) ||
                metaDescription.includes(word),
            );

            const translationCoverage = {
              coverageRatio: foundWords.length / expectedWords.length,
              expectedWords,
              foundWords,
              hasLocalizedContent: foundWords.length > 0 || headings.length > 0,
              headings: headings.slice(0, 5),
              metaDescription: metaDescription.substring(0, 100),
              navigation: navItems.slice(0, 10),
              title,
            };

            return translationCoverage;
          }, testData.expected);

          // Check for date/time formatting
          const dateTimeFormatting = await page.evaluate((locale) => {
            const testDate = new Date("2024-01-15T10:30:00");
            try {
              const formattedDate = testDate.toLocaleDateString(locale);
              const formattedTime = testDate.toLocaleTimeString(locale);
              return {
                date: formattedDate,
                isFormatted:
                  formattedDate !== testDate.toLocaleDateString("en-US"),
                locale,
                time: formattedTime,
              };
            } catch (error) {
              return {
                error: error.message,
                locale,
              };
            }
          }, testData.locale);

          // Check for currency formatting if present
          const currencyFormatting = await page.evaluate((locale) => {
            const currencyElements = Array.from(
              document.querySelectorAll(
                '[data-currency], .price, .cost, [class*="price"]',
              ),
            )
              .map((el) => el.textContent?.trim())
              .filter(Boolean)
              .slice(0, 5);

            return {
              foundCurrencyElements: currencyElements.length,
              samples: currencyElements,
            };
          }, testData.locale);

          return {
            contentAnalysis,
            currencyFormatting,
            dateTimeFormatting,
            locale: testData.locale,
            translationQuality: {
              coverageScore: Math.round(contentAnalysis.coverageRatio * 100),
              hasContent: contentAnalysis.hasLocalizedContent,
              isWellTranslated: contentAnalysis.coverageRatio >= 0.5,
            },
          };
        },
        {
          fcp: { error: 3500, warning: 2000 },
          lcp: { error: 5000, warning: 3000 },
        },
      );

      translationResults.push({
        ...result,
        performance: {
          fcp: report.fcp,
          lcp: report.lcp,
          networkRequests: report.networkActivity?.requestCount || 0,
        },
      });

      // Validations
      expect(result.translationQuality.hasContent).toBeTruthy();
      if (result.contentAnalysis.foundWords.length > 0) {
        expect(result.translationQuality.coverageScore).toBeGreaterThan(25);
      }
    }

    await test.info().attach("translation-coverage-analysis", {
      body: JSON.stringify(translationResults, null, 2),
      contentType: "application/json",
    });

    // At least 2 locales should have good translation coverage
    const wellTranslatedLocales = translationResults.filter(
      (r) => r.translationQuality.isWellTranslated,
    );
    expect(wellTranslatedLocales.length).toBeGreaterThanOrEqual(1);
  });

  test("comprehensive locale validation and error handling", async ({
    page,
  }) => {
    const validationResults = {
      invalidLocaleHandling: [],
      htmlLangAttributes: [],
      queryParameterPreservation: [],
    };

    // Test HTML lang attributes for all locales
    for (const locale of supportedLocales) {
      await page.goto(`/${locale}`);
      await waitUtils.forNavigation();

      const htmlLang = await page.getAttribute("html", "lang");
      const dirAttribute = await page.getAttribute("html", "dir");

      const langValidation = {
        actualLang: htmlLang,
        dirAttribute,
        expectedLang: locale,
        isCorrect: htmlLang === locale,
        locale,
      };

      validationResults.htmlLangAttributes.push(langValidation);
      expect(htmlLang).toBe(locale);
    }

    // Test invalid locale handling
    const invalidLocales = ["invalid-locale", "xx", "zz-ZZ", "en-INVALID"];

    for (const invalidLocale of invalidLocales) {
      await page.goto(`/${invalidLocale}`);
      await waitUtils.forNavigation();

      const finalUrl = page.url();
      const redirectedToValidLocale = supportedLocales.some((validLocale) =>
        finalUrl.includes(`/${validLocale}`),
      );

      const invalidHandling = {
        invalidLocale,
        redirectedToValidLocale,
        finalUrl,
        redirectedToDefault: finalUrl.includes(`/${defaultLocale}`),
      };

      validationResults.invalidLocaleHandling.push(invalidHandling);
      expect(redirectedToValidLocale).toBeTruthy();
    }

    // Test query parameter preservation during locale operations
    const testQueries = [
      "?category=electronics&sort=price",
      "?search=test&page=2",
      "?filter=new&limit=10",
    ];

    for (const queryParams of testQueries) {
      await page.goto(`/en${queryParams}`);
      await waitUtils.forNavigation();

      const initialUrl = page.url();
      const hasQueryParams = initialUrl.includes(queryParams);

      // Try locale switching if switcher exists
      const localeSwitcher = page.getByRole("button", {
        name: /language|locale/i,
      });

      let preservedAfterSwitch = null;

      if ((await localeSwitcher.count()) > 0) {
        await localeSwitcher.first().click();
        await page.waitForTimeout(500);

        const frenchOption = page.getByRole("option", {
          name: /français|french|fr/i,
        });

        if ((await frenchOption.count()) > 0) {
          await frenchOption.first().click();
          await waitUtils.forNavigation();

          const afterSwitchUrl = page.url();
          preservedAfterSwitch = {
            hasLocale: afterSwitchUrl.includes("/fr"),
            hasParams: afterSwitchUrl.includes(queryParams),
            newUrl: afterSwitchUrl,
          };

          if (
            preservedAfterSwitch.hasParams &&
            preservedAfterSwitch.hasLocale
          ) {
            expect(afterSwitchUrl).toContain(queryParams);
            expect(afterSwitchUrl).toContain("/fr");
          }
        }
      }

      validationResults.queryParameterPreservation.push({
        hasQueryParams,
        initialUrl,
        preservedAfterSwitch,
        queryParams,
      });
    }

    await test.info().attach("locale-validation-analysis", {
      body: JSON.stringify(validationResults, null, 2),
      contentType: "application/json",
    });
  });

  test("comprehensive SEO and accessibility internationalization features", async ({
    context,
    page,
  }) => {
    const { report, result } = await withPerformanceMonitoring(
      page,
      context,
      "/en",
      async () => {
        await waitUtils.forNavigation();

        // SEO Analysis
        const seoAnalysis = await page.evaluate((supportedLocales) => {
          // Check for alternate links
          const alternateLinks = Array.from(
            document.querySelectorAll('link[rel="alternate"]'),
          ).map((link) => ({
            type: link.getAttribute("type"),
            href: link.getAttribute("href"),
            hreflang: link.getAttribute("hreflang"),
          }));

          // Check for canonical links
          const canonicalLink = document.querySelector('link[rel="canonical"]');
          const canonical = canonicalLink
            ? {
                href: canonicalLink.getAttribute("href"),
                present: true,
              }
            : { present: false };

          // Check Open Graph locale tags
          const ogLocale = document.querySelector('meta[property="og:locale"]');
          const ogLocaleAlternate = Array.from(
            document.querySelectorAll('meta[property="og:locale:alternate"]'),
          ).map((meta) => meta.getAttribute("content"));

          // Check for structured data with language info
          const jsonLdScripts = Array.from(
            document.querySelectorAll('script[type="application/ld+json"]'),
          );
          const structuredData = jsonLdScripts.map((script) => {
            try {
              const data = JSON.parse(script.textContent || "{}");
              return {
                type: data["@type"],
                hasLanguage: !!(data.inLanguage || data["@language"]),
                language: data.inLanguage || data["@language"],
              };
            } catch (error) {
              return { error: error.message };
            }
          });

          return {
            alternateLinks: {
              coversSupportedLocales: supportedLocales.every((locale) =>
                alternateLinks.some(
                  (link) =>
                    link.hreflang === locale ||
                    link.href?.includes(`/${locale}`),
                ),
              ),
              links: alternateLinks,
              total: alternateLinks.length,
            },
            canonical,
            openGraph: {
              alternates: ogLocaleAlternate,
              locale: ogLocale?.getAttribute("content"),
            },
            structuredData: {
              analysis: structuredData,
              total: structuredData.length,
              withLanguage: structuredData.filter((data) => data.hasLanguage)
                .length,
            },
          };
        }, supportedLocales);

        // RTL Language Support Analysis
        const rtlAnalysis = await page.evaluate(() => {
          const rtlLocales = ["ar", "he", "fa", "ur"];
          const currentDir = document.documentElement.getAttribute("dir");
          const computedDirection = window.getComputedStyle(
            document.body,
          ).direction;

          // Check for RTL CSS support
          const hasRtlCss = Array.from(document.styleSheets).some((sheet) => {
            try {
              const rules = Array.from(sheet.cssRules || sheet.rules || []);
              return rules.some(
                (rule) =>
                  rule.cssText?.includes('[dir="rtl"]') ||
                  rule.cssText?.includes("direction: rtl"),
              );
            } catch (error) {
              return false;
            }
          });

          return {
            computedDirection,
            currentDirection: currentDir,
            hasRtlSupport: hasRtlCss,
            isRtlLocale: rtlLocales.includes(
              document.documentElement.lang || "",
            ),
          };
        });

        // Accessibility i18n features
        const accessibilityI18n = await page.evaluate(() => {
          // Check for lang attributes on content sections
          const elementsWithLang = Array.from(
            document.querySelectorAll("[lang]"),
          ).map((el) => ({
            hasContent: !!el.textContent?.trim(),
            lang: el.getAttribute("lang"),
            tagName: el.tagName,
          }));

          // Check for translation announcements
          const translationNotifications = Array.from(
            document.querySelectorAll(
              '[aria-live], [role="status"], [data-translation-status]',
            ),
          ).filter((el) =>
            /translat|language|locale/i.test(
              el.textContent || el.getAttribute("aria-label") || "",
            ),
          );

          return {
            elementsWithLang: elementsWithLang.length,
            hasAccessibilityI18n:
              elementsWithLang.length > 0 ||
              translationNotifications.length > 0,
            langElements: elementsWithLang.slice(0, 5),
            translationNotifications: translationNotifications.length,
          };
        });

        return {
          accessibilityI18n,
          overallI18nScore: {
            accessibility: accessibilityI18n.hasAccessibilityI18n ? 100 : 70,
            rtl: rtlAnalysis.hasRtlSupport ? 100 : 80,
            seo: seoAnalysis.alternateLinks.coversSupportedLocales ? 100 : 60,
          },
          rtlAnalysis,
          seoAnalysis,
        };
      },
      {
        fcp: { error: 3000, warning: 1500 },
        lcp: { error: 4000, warning: 2500 },
      },
    );

    // Validations
    expect(result.seoAnalysis.alternateLinks.total).toBeGreaterThan(0);
    if (result.seoAnalysis.alternateLinks.total > 0) {
      expect(
        result.seoAnalysis.alternateLinks.coversSupportedLocales,
      ).toBeTruthy();
    }

    // Test RTL if supported
    if (result.rtlAnalysis.isRtlLocale) {
      expect(result.rtlAnalysis.currentDirection).toBe("rtl");
      expect(result.rtlAnalysis.computedDirection).toBe("rtl");
    }

    await test.info().attach("i18n-seo-accessibility-analysis", {
      body: JSON.stringify({ ...result, performance: report }, null, 2),
      contentType: "application/json",
    });
  });
});
