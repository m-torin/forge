/**
 * Vitest Accessibility Testing Setup
 *
 * Configures @testing-library/react and axe-core for enhanced accessibility testing
 * with custom matchers, ARIA validation, and semantic HTML checking.
 *
 * Features:
 * - Extended DOM matchers for accessibility
 * - Axe-core integration for WCAG compliance
 * - Custom ARIA validation helpers
 * - Semantic HTML structure validation
 * - Focus management testing utilities
 */

import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import type { AxeResults } from 'axe-core';
import axeCore from 'axe-core';

// Extend expect with axe-core accessibility testing
declare global {
  namespace Vi {
    interface Assertion<T = any> {
      toHaveNoViolations(): T;
    }
  }
}

// Custom vitest matcher for axe accessibility testing
expect.extend({
  async toHaveNoViolations(
    received: Element | Document,
  ): Promise<{ pass: boolean; message: () => string }> {
    if (!received) {
      return {
        pass: false,
        message: () => 'Expected element to be defined for accessibility testing',
      };
    }

    try {
      const results: AxeResults = await axeCore.run(received as Element);
      const violations = results.violations;

      if (violations.length === 0) {
        return {
          pass: true,
          message: () => 'Expected element to have accessibility violations, but found none',
        };
      }

      const violationMessages = violations
        .map(violation => {
          const nodes = violation.nodes
            .map(node => `    ${node.target.join(', ')}: ${node.failureSummary}`)
            .join('\n');
          return `  ${violation.id}: ${violation.description}\n${nodes}`;
        })
        .join('\n\n');

      return {
        pass: false,
        message: () =>
          `Expected no accessibility violations, but found ${violations.length}:\n\n${violationMessages}`,
      };
    } catch (error) {
      return {
        pass: false,
        message: () =>
          `Accessibility testing failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
});

// Configure Testing Library for accessibility-first testing
configure({
  // Prioritize accessible queries
  defaultHidden: true,

  // Increase timeout for complex accessibility checks
  asyncUtilTimeout: 5000,

  // Use data-testid as fallback only
  testIdAttribute: 'data-testid',
});

// Custom accessibility matchers - compatible with Vitest
declare global {
  namespace Vi {
    interface Assertion<T = any> {
      toHaveNoViolations(): T;
      toHaveProperARIA(): T;
      toHaveAccessibleName(): T;
      toHaveProperHeadingStructure(): T;
      toHaveProperFormLabeling(): T;
      toHaveProperFocusManagement(): T;
      toHaveAccessibleColors(): T;
      toSupportKeyboardNavigation(): T;
      toHaveProperLandmarks(): T;
      toHaveAccessibleTables(): T;
      toHaveProperLiveRegions(): T;
    }
  }

  // Fallback for Jest compatibility
  namespace jest {
    interface Matchers<R> {
      toHaveNoViolations(): R;
      toHaveProperARIA(): R;
      toHaveAccessibleName(): R;
      toHaveProperHeadingStructure(): R;
      toHaveProperFormLabeling(): R;
      toHaveProperFocusManagement(): R;
      toHaveAccessibleColors(): R;
      toSupportKeyboardNavigation(): R;
      toHaveProperLandmarks(): R;
      toHaveAccessibleTables(): R;
      toHaveProperLiveRegions(): R;
    }
  }
}

/**
 * Custom matcher: Check for proper ARIA attributes
 */
expect.extend({
  toHaveProperARIA(received: HTMLElement) {
    const issues: string[] = [];

    // Check for common ARIA issues
    const hasAriaLabel = received.hasAttribute('aria-label');
    const hasAriaLabelledBy = received.hasAttribute('aria-labelledby');
    const hasAriaDescribedBy = received.hasAttribute('aria-describedby');

    // Interactive elements should have accessible names
    const interactiveElements = ['button', 'input', 'select', 'textarea', 'a'];
    if (interactiveElements.includes(received.tagName.toLowerCase())) {
      const hasAccessibleName = hasAriaLabel || hasAriaLabelledBy || received.textContent?.trim();
      if (!hasAccessibleName) {
        issues.push(`Interactive element ${received.tagName.toLowerCase()} lacks accessible name`);
      }
    }

    // Check for invalid ARIA attributes
    const ariaAttributes = Array.from(received.attributes)
      .filter(attr => attr.name.startsWith('aria-'))
      .map(attr => attr.name);

    const validAriaAttributes = [
      'aria-label',
      'aria-labelledby',
      'aria-describedby',
      'aria-expanded',
      'aria-hidden',
      'aria-disabled',
      'aria-required',
      'aria-invalid',
      'aria-live',
      'aria-atomic',
      'aria-relevant',
      'aria-busy',
      'aria-controls',
      'aria-owns',
      'aria-flowto',
      'aria-activedescendant',
      'aria-checked',
      'aria-pressed',
      'aria-selected',
      'aria-level',
      'aria-posinset',
      'aria-setsize',
      'aria-orientation',
      'aria-sort',
      'aria-valuemin',
      'aria-valuemax',
      'aria-valuenow',
      'aria-valuetext',
    ];

    ariaAttributes.forEach(attr => {
      if (!validAriaAttributes.includes(attr)) {
        issues.push(`Invalid ARIA attribute: ${attr}`);
      }
    });

    // Check for proper role usage
    const role = received.getAttribute('role');
    if (role) {
      const validRoles = [
        'button',
        'link',
        'checkbox',
        'radio',
        'textbox',
        'combobox',
        'listbox',
        'option',
        'menu',
        'menuitem',
        'tab',
        'tabpanel',
        'dialog',
        'alertdialog',
        'alert',
        'status',
        'log',
        'marquee',
        'timer',
        'progressbar',
        'slider',
        'spinbutton',
        'grid',
        'gridcell',
        'columnheader',
        'rowheader',
        'tree',
        'treeitem',
        'group',
        'region',
        'banner',
        'navigation',
        'main',
        'complementary',
        'contentinfo',
        'form',
        'search',
        'application',
        'document',
      ];

      if (!validRoles.includes(role)) {
        issues.push(`Invalid role: ${role}`);
      }
    }

    return {
      message: () =>
        `Expected element to have proper ARIA attributes.\nIssues found:\n${issues.join('\n')}`,
      pass: issues.length === 0,
    };
  },

  /**
   * Custom matcher: Check for accessible name
   */
  toHaveAccessibleName(received: HTMLElement, expectedName?: string) {
    const computedName =
      received.getAttribute('aria-label') ||
      received.getAttribute('aria-labelledby') ||
      received.textContent?.trim() ||
      received.getAttribute('alt') ||
      received.getAttribute('title');

    const hasAccessibleName = !!computedName;
    const nameMatches = expectedName ? computedName === expectedName : true;

    return {
      message: () =>
        expectedName
          ? `Expected element to have accessible name "${expectedName}", but got "${computedName}"`
          : `Expected element to have an accessible name, but none found`,
      pass: hasAccessibleName && nameMatches,
    };
  },

  /**
   * Custom matcher: Check heading structure
   */
  toHaveProperHeadingStructure(received: HTMLElement) {
    const headings = received.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"]');
    const issues: string[] = [];

    let previousLevel = 0;
    headings.forEach((heading, index) => {
      const tagName = heading.tagName.toLowerCase();
      const level = tagName.startsWith('h')
        ? parseInt(tagName.charAt(1))
        : parseInt(heading.getAttribute('aria-level') || '1');

      // First heading should be h1 or level 1
      if (index === 0 && level !== 1) {
        issues.push(`First heading should be level 1, got level ${level}`);
      }

      // Check for skipped levels
      if (level > previousLevel + 1) {
        issues.push(`Heading level skipped from ${previousLevel} to ${level}`);
      }

      // Check for accessible name
      const hasAccessibleName =
        heading.textContent?.trim() ||
        heading.getAttribute('aria-label') ||
        heading.getAttribute('aria-labelledby');

      if (!hasAccessibleName) {
        issues.push(`Heading at index ${index} lacks accessible name`);
      }

      previousLevel = level;
    });

    return {
      message: () => `Expected proper heading structure.\nIssues found:\n${issues.join('\n')}`,
      pass: issues.length === 0,
    };
  },

  /**
   * Custom matcher: Check form labeling
   */
  toHaveProperFormLabeling(received: HTMLElement) {
    const formElements = received.querySelectorAll('input, select, textarea');
    const issues: string[] = [];

    formElements.forEach((element, index) => {
      const input = element as HTMLInputElement;
      const id = input.id;
      const type = input.type;

      // Skip hidden inputs
      if (type === 'hidden') return;

      const hasLabel = !!received.querySelector(`label[for="${id}"]`);
      const ariaLabel = input.getAttribute('aria-label');
      const hasAriaLabel = !!ariaLabel;
      const ariaLabelledBy = input.getAttribute('aria-labelledby');
      const hasAriaLabelledBy = !!ariaLabelledBy;
      const hasAriaDescribedBy = !!input.getAttribute('aria-describedby');

      if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy) {
        issues.push(`Form element at index ${index} (${type}) lacks proper labeling`);
      }

      // Check for required field indication
      if (input.required) {
        const hasRequiredIndication =
          (ariaLabel && ariaLabel.includes('required')) ||
          (ariaLabelledBy &&
            received.querySelector(`#${ariaLabelledBy}`)?.textContent?.includes('required')) ||
          !!input.getAttribute('aria-required');

        if (!hasRequiredIndication) {
          issues.push(`Required field at index ${index} lacks required indication`);
        }
      }

      // Check for error association
      if (input.getAttribute('aria-invalid') === 'true') {
        if (!hasAriaDescribedBy) {
          issues.push(`Invalid field at index ${index} lacks error message association`);
        }
      }
    });

    return {
      message: () => `Expected proper form labeling.\nIssues found:\n${issues.join('\n')}`,
      pass: issues.length === 0,
    };
  },

  /**
   * Custom matcher: Check focus management
   */
  toHaveProperFocusManagement(received: HTMLElement) {
    const focusableElements = received.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    const issues: string[] = [];

    focusableElements.forEach((element, index) => {
      const focusable = element as HTMLElement;

      // Check for visible focus indicators
      const computedStyle = window.getComputedStyle(focusable, ':focus');
      const hasOutline = computedStyle.outline !== 'none' && computedStyle.outline !== '0px';
      const hasBoxShadow = computedStyle.boxShadow !== 'none';
      const hasBorder = computedStyle.borderColor !== computedStyle.color;

      if (!hasOutline && !hasBoxShadow && !hasBorder) {
        issues.push(`Focusable element at index ${index} lacks visible focus indicator`);
      }

      // Check tabindex usage
      const tabIndex = focusable.getAttribute('tabindex');
      if (tabIndex && parseInt(tabIndex) > 0) {
        issues.push(
          `Element at index ${index} uses positive tabindex (${tabIndex}), which can disrupt tab order`,
        );
      }
    });

    return {
      message: () => `Expected proper focus management.\nIssues found:\n${issues.join('\n')}`,
      pass: issues.length === 0,
    };
  },

  /**
   * Custom matcher: Check color accessibility
   */
  toHaveAccessibleColors(received: HTMLElement) {
    const issues: string[] = [];

    // This is a simplified check - in practice, you'd use a library like color-contrast
    const elementsWithText = received.querySelectorAll('*');

    elementsWithText.forEach((element, index) => {
      const text = element.textContent?.trim();
      if (!text) return;

      const computedStyle = window.getComputedStyle(element);
      const color = computedStyle.color;
      const backgroundColor = computedStyle.backgroundColor;

      // Basic check for color/background color being set
      if (color === backgroundColor) {
        issues.push(`Element at index ${index} may have insufficient color contrast`);
      }

      // Check for color-only information
      const hasColorOnlyInfo =
        computedStyle.color !== 'initial' &&
        !element.textContent?.includes('*') &&
        !element.getAttribute('aria-label')?.includes('required');

      if (hasColorOnlyInfo && element.textContent?.includes('error')) {
        issues.push(`Element at index ${index} may rely on color alone to convey information`);
      }
    });

    return {
      message: () => `Expected accessible colors.\nIssues found:\n${issues.join('\n')}`,
      pass: issues.length === 0,
    };
  },

  /**
   * Custom matcher: Check keyboard navigation support
   */
  toSupportKeyboardNavigation(received: HTMLElement) {
    const issues: string[] = [];

    // Check for proper keyboard event handlers
    const interactiveElements = received.querySelectorAll(
      'button, [role="button"], a, input, select, textarea',
    );

    interactiveElements.forEach((element, index) => {
      const interactive = element as HTMLElement;

      // Check for onclick without onkeydown/onkeypress
      if (interactive.onclick && !interactive.onkeydown && !interactive.onkeypress) {
        issues.push(
          `Interactive element at index ${index} has click handler but no keyboard handler`,
        );
      }

      // Check for proper tabindex
      if (interactive.getAttribute('role') === 'button' && !interactive.hasAttribute('tabindex')) {
        issues.push(`Element with button role at index ${index} lacks tabindex`);
      }
    });

    return {
      message: () => `Expected keyboard navigation support.\nIssues found:\n${issues.join('\n')}`,
      pass: issues.length === 0,
    };
  },

  /**
   * Custom matcher: Check landmark structure
   */
  toHaveProperLandmarks(received: HTMLElement) {
    const issues: string[] = [];

    const landmarks = received.querySelectorAll(
      'main, nav, header, footer, aside, section, [role="main"], [role="navigation"], [role="banner"], [role="contentinfo"], [role="complementary"], [role="region"]',
    );

    // Check for multiple main landmarks
    const mainLandmarks = received.querySelectorAll('main, [role="main"]');
    if (mainLandmarks.length > 1) {
      issues.push('Multiple main landmarks found - there should only be one per page');
    }

    // Check for accessible names on landmarks
    landmarks.forEach((landmark, index) => {
      const tagName = landmark.tagName.toLowerCase();
      const role = landmark.getAttribute('role');

      // Some landmarks should have accessible names
      if (
        (tagName === 'section' || role === 'region') &&
        !landmark.getAttribute('aria-label') &&
        !landmark.getAttribute('aria-labelledby')
      ) {
        issues.push(`Section/region landmark at index ${index} lacks accessible name`);
      }
    });

    return {
      message: () => `Expected proper landmark structure.\nIssues found:\n${issues.join('\n')}`,
      pass: issues.length === 0,
    };
  },

  /**
   * Custom matcher: Check accessible tables
   */
  toHaveAccessibleTables(received: HTMLElement) {
    const tables = received.querySelectorAll('table');
    const issues: string[] = [];

    tables.forEach((table, tableIndex) => {
      // Check for table caption or accessible name
      const hasCaption = !!table.querySelector('caption');
      const hasAriaLabel = !!table.getAttribute('aria-label');
      const hasAriaLabelledBy = !!table.getAttribute('aria-labelledby');

      if (!hasCaption && !hasAriaLabel && !hasAriaLabelledBy) {
        issues.push(`Table at index ${tableIndex} lacks accessible name`);
      }

      // Check for proper headers
      const headers = table.querySelectorAll('th');
      const cells = table.querySelectorAll('td');

      if (cells.length > 0 && headers.length === 0) {
        issues.push(`Table at index ${tableIndex} has data cells but no header cells`);
      }

      // Check for scope or headers attributes on complex tables
      headers.forEach((header, headerIndex) => {
        if (!header.hasAttribute('scope') && !header.hasAttribute('id')) {
          issues.push(
            `Header cell at table ${tableIndex}, header ${headerIndex} lacks scope or id attribute`,
          );
        }
      });
    });

    return {
      message: () => `Expected accessible tables.\nIssues found:\n${issues.join('\n')}`,
      pass: issues.length === 0,
    };
  },

  /**
   * Custom matcher: Check live regions
   */
  toHaveProperLiveRegions(received: HTMLElement) {
    const liveRegions = received.querySelectorAll(
      '[aria-live], [role="alert"], [role="status"], [role="log"]',
    );
    const issues: string[] = [];

    liveRegions.forEach((region, index) => {
      const ariaLive = region.getAttribute('aria-live');
      const role = region.getAttribute('role');

      // Check for valid aria-live values
      if (ariaLive && !['polite', 'assertive', 'off'].includes(ariaLive)) {
        issues.push(`Live region at index ${index} has invalid aria-live value: ${ariaLive}`);
      }

      // Check for proper role usage
      if (role === 'alert' && ariaLive && ariaLive !== 'assertive') {
        issues.push(
          `Alert region at index ${index} should have aria-live="assertive" or no aria-live attribute`,
        );
      }

      if (role === 'status' && ariaLive && ariaLive !== 'polite') {
        issues.push(
          `Status region at index ${index} should have aria-live="polite" or no aria-live attribute`,
        );
      }
    });

    return {
      message: () => `Expected proper live regions.\nIssues found:\n${issues.join('\n')}`,
      pass: issues.length === 0,
    };
  },
});

/**
 * Accessibility testing utilities
 */
export const accessibilityUtils = {
  /**
   * Check if element is properly focused
   */
  isFocused: (element: HTMLElement): boolean => {
    return document.activeElement === element;
  },

  /**
   * Get all focusable elements within a container
   */
  getFocusableElements: (container: HTMLElement): HTMLElement[] => {
    const focusableSelectors = [
      'button:not([disabled])',
      '[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    return Array.from(container.querySelectorAll(focusableSelectors));
  },

  /**
   * Simulate keyboard navigation
   */
  simulateKeyboardNavigation: async (container: HTMLElement, key: string): Promise<void> => {
    const focusableElements = accessibilityUtils.getFocusableElements(container);
    const currentIndex = focusableElements.findIndex(el => document.activeElement === el);

    let nextIndex = currentIndex;

    switch (key) {
      case 'Tab':
        nextIndex = (currentIndex + 1) % focusableElements.length;
        break;
      case 'Shift+Tab':
        nextIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;
        break;
      case 'ArrowDown':
      case 'ArrowRight':
        nextIndex = Math.min(currentIndex + 1, focusableElements.length - 1);
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        nextIndex = Math.max(currentIndex - 1, 0);
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = focusableElements.length - 1;
        break;
    }

    if (focusableElements[nextIndex]) {
      focusableElements[nextIndex].focus();
    }
  },

  /**
   * Check if element has proper ARIA expanded state
   */
  hasProperExpandedState: (element: HTMLElement): boolean => {
    const ariaExpanded = element.getAttribute('aria-expanded');
    return ariaExpanded === 'true' || ariaExpanded === 'false';
  },

  /**
   * Validate color contrast (simplified implementation)
   */
  validateColorContrast: (element: HTMLElement): { ratio: number; passes: boolean } => {
    const computedStyle = window.getComputedStyle(element);

    // This is a simplified implementation
    // In practice, you'd use a proper color contrast library
    const color = computedStyle.color;
    const backgroundColor = computedStyle.backgroundColor;

    // Mock calculation - replace with actual contrast calculation
    const ratio = 4.5; // Placeholder
    const passes = ratio >= 4.5; // WCAG AA standard

    return { ratio, passes };
  },

  /**
   * Check for proper error announcement
   */
  checkErrorAnnouncement: (container: HTMLElement): boolean => {
    const errorElements = container.querySelectorAll('[aria-invalid="true"]');

    return Array.from(errorElements).every(element => {
      const ariaDescribedBy = element.getAttribute('aria-describedby');
      if (!ariaDescribedBy) return false;

      const errorMessage = container.querySelector(`#${ariaDescribedBy}`);
      return errorMessage && errorMessage.textContent?.trim();
    });
  },
};

/**
 * Common accessibility test patterns
 */
export const accessibilityTestPatterns = {
  /**
   * Test basic accessibility compliance
   */
  testBasicAccessibility: async (container: HTMLElement) => {
    expect(container).toHaveProperARIA();
    expect(container).toHaveProperHeadingStructure();
    expect(container).toHaveProperFormLabeling();
    expect(container).toHaveProperFocusManagement();
    expect(container).toSupportKeyboardNavigation();
    expect(container).toHaveProperLandmarks();
  },

  /**
   * Test form accessibility
   */
  testFormAccessibility: async (form: HTMLElement) => {
    expect(form).toHaveProperFormLabeling();
    expect(form).toHaveProperARIA();
    expect(accessibilityUtils.checkErrorAnnouncement(form)).toBeTruthy();

    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      expect(input).toHaveAccessibleName();
    });
  },

  /**
   * Test keyboard navigation
   */
  testKeyboardNavigation: async (container: HTMLElement) => {
    const focusableElements = accessibilityUtils.getFocusableElements(container);

    if (focusableElements.length === 0) return;

    // Test Tab navigation
    focusableElements[0].focus();
    expect(accessibilityUtils.isFocused(focusableElements[0])).toBeTruthy();

    await accessibilityUtils.simulateKeyboardNavigation(container, 'Tab');
    if (focusableElements.length > 1) {
      expect(accessibilityUtils.isFocused(focusableElements[1])).toBeTruthy();
    }
  },

  /**
   * Test screen reader compatibility
   */
  testScreenReaderCompatibility: (container: HTMLElement) => {
    expect(container).toHaveProperARIA();
    expect(container).toHaveProperLiveRegions();

    // Check for semantic HTML usage
    const semanticElements = container.querySelectorAll(
      'main, nav, header, footer, aside, section, article, h1, h2, h3, h4, h5, h6',
    );
    expect(semanticElements.length).toBeGreaterThan(0);
  },
};
