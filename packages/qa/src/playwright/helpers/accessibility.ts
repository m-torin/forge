import AxeBuilder from '@axe-core/playwright';
import { type Page } from '@playwright/test';

/**
 * Accessibility testing utilities
 */
export class AccessibilityTestUtils {
  constructor(private readonly page: Page) {}

  /**
   * Run accessibility scan on the current page
   */
  async scan(options?: {
    includedImpacts?: ('minor' | 'moderate' | 'serious' | 'critical')[];
    excludeRules?: string[];
    includeRules?: string[];
  }): Promise<any> {
    const builder = new AxeBuilder({ page: this.page });

    // Note: includedImpacts will be used to filter results after scanning

    if (options?.excludeRules) {
      builder.disableRules(options.excludeRules);
    }

    if (options?.includeRules) {
      builder.withRules(options.includeRules);
    }

    const results = await builder.analyze();

    // Filter by impact levels if specified
    if (options?.includedImpacts && options.includedImpacts.length > 0) {
      results.violations = results.violations.filter(violation =>
        options.includedImpacts!.includes(violation.impact as any),
      );
    }

    return results;
  }

  /**
   * Check specific element for accessibility issues
   */
  async scanElement(selector: string): Promise<any> {
    const builder = new AxeBuilder({ page: this.page }).include(selector);
    return builder.analyze();
  }

  /**
   * Run axe accessibility audit (alias for scan)
   */
  async runAxeAudit(options?: {
    includedImpacts?: ('minor' | 'moderate' | 'serious' | 'critical')[];
    excludeRules?: string[];
    includeRules?: string[];
  }): Promise<any[]> {
    const results = await this.scan(options);
    return results.violations || [];
  }

  /**
   * Common accessibility checks
   */
  async runCommonChecks(): Promise<{
    violations: any[];
    passes: any[];
    incomplete: any[];
    violationCount: number;
    hasViolations: boolean;
    criticalViolations: any[];
    seriousViolations: any[];
  }> {
    const results = await this.scan();

    return {
      criticalViolations: results.violations.filter((v: any) => v.impact === 'critical'),
      hasViolations: results.violations.length > 0,
      incomplete: results.incomplete,
      passes: results.passes,
      seriousViolations: results.violations.filter((v: any) => v.impact === 'serious'),
      violationCount: results.violations.length,
      violations: results.violations,
    };
  }

  /**
   * Check for keyboard navigation
   */
  async checkKeyboardNavigation() {
    // Tab through all interactive elements
    const interactiveElements = await this.page
      .locator('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])')
      .all();

    const results = [];
    for (const element of interactiveElements) {
      const isVisible = await element.isVisible();
      const isEnabled = await element.isEnabled();
      const tabIndex = await element.getAttribute('tabindex');

      results.push({
        canReceiveFocus: isVisible && isEnabled && tabIndex !== '-1',
        element: await element.evaluate(el => el.tagName.toLowerCase()),
        isEnabled,
        isVisible,
        tabIndex,
      });
    }

    return results;
  }

  /**
   * Check color contrast
   */
  async checkColorContrast(): Promise<any> {
    return this.scan({
      includeRules: ['color-contrast'],
    });
  }

  /**
   * Check for proper ARIA usage
   */
  async checkARIA(): Promise<any> {
    return this.scan({
      includeRules: [
        'aria-allowed-attr',
        'aria-required-attr',
        'aria-valid-attr',
        'aria-valid-attr-value',
        'aria-roles',
      ],
    });
  }

  /**
   * Check form accessibility
   */
  async checkFormAccessibility(): Promise<any> {
    return this.scan({
      includeRules: [
        'label',
        'label-title-only',
        'input-button-name',
        'input-image-alt',
        'select-name',
      ],
    });
  }

  /**
   * Check for screen reader compatibility
   */
  async checkScreenReaderSupport() {
    const headings = await this.page.locator('h1, h2, h3, h4, h5, h6').all();
    const landmarks = await this.page
      .locator('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"]')
      .all();
    const images = await this.page.locator('img').all();

    const results = {
      headings: {
        count: headings.length,
        hierarchy: [] as { level: number; text: string | null }[],
      },
      images: {
        total: images.length,
        withAlt: 0,
        withoutAlt: 0,
      },
      landmarks: {
        types: [] as (string | null)[],
        count: landmarks.length,
      },
    };

    // Check heading hierarchy
    for (const heading of headings) {
      const level = await heading.evaluate(el => parseInt(el.tagName[1]));
      const text = await heading.textContent();
      results.headings.hierarchy.push({ level, text });
    }

    // Check landmarks
    for (const landmark of landmarks) {
      const role = await landmark.getAttribute('role');
      results.landmarks.types.push(role);
    }

    // Check images
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      if (alt !== null) {
        results.images.withAlt++;
      } else {
        results.images.withoutAlt++;
      }
    }

    return results;
  }
}

/**
 * WCAG compliance levels
 */
export enum WCAGLevel {
  A = 'A',
  AA = 'AA',
  AAA = 'AAA',
}

/**
 * Accessibility report generator
 */
export class AccessibilityReporter {
  /**
   * Generate HTML report
   */
  static generateHTMLReport(results: any): string {
    const violations = results.violations || [];

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Accessibility Report</title>
        <style>
          body { font-family: Arial, sans-serif, margin: 20px; }
          .violation { margin-bottom: 20px, padding: 10px; border: 1px solid #ccc, }
          .critical { border-color: #ff0000; background-color: #ffe0e0, }
          .serious { border-color: #ff8800; background-color: #fff0e0, }
          .moderate { border-color: #ffaa00; background-color: #fffae0, }
          .minor { border-color: #888888; background-color: #f5f5f5, }
        </style>
      </head>
      <body>
        <h1>Accessibility Report</h1>
        <p>Total violations: ${violations.length}</p>
        ${violations
          .map(
            (v: any) => `
          <div class="violation ${v.impact}">
            <h2>${v.id}: ${v.description}</h2>
            <p><strong>Impact:</strong> ${v.impact}</p>
            <p><strong>Help:</strong> ${v.help}</p>
            <p><strong>Help URL:</strong> <a href="${v.helpUrl}">${v.helpUrl}</a></p>
            <p><strong>Elements affected:</strong> ${v.nodes.length}</p>
          </div>
        `,
          )
          .join('')}
      </body>
      </html>
    `;
  }

  /**
   * Generate markdown report
   */
  static generateMarkdownReport(results: any): string {
    const violations = results.violations || [];

    return `
# Accessibility Report

Total violations: ${violations.length}

${violations
  .map(
    (v: any) => `
## ${v.id}: ${v.description}

- **Impact:** ${v.impact}
- **Help:** ${v.help}
- **Help URL:** [${v.helpUrl}](${v.helpUrl})
- **Elements affected:** ${v.nodes.length}

`,
  )
  .join('')}
    `.trim();
  }
}
