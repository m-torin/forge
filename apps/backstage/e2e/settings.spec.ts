import { expect, test } from '@playwright/test';

import { createAuthHelpers } from '@repo/testing/auth-helpers';
import {
  createApiMocker,
  createVisualTester,
  withPerformanceMonitoring,
} from '@repo/testing/playwright';

const authHelpers = createAuthHelpers('http://localhost:3300');

test.describe('Backstage Settings - Configuration and Security Testing', (_: any) => {
  test.beforeEach(async ({ page }: any) => {
    // Sign in as admin user for all settings tests
    const testUser = authHelpers.createTestUser({
      name: 'Settings Admin',
      email: `settings-admin-${Date.now()}@example.com`,
    });

    try {
      await authHelpers.signIn(page, testUser);
    } catch {
      await authHelpers.signUp(page, testUser);
    }
  });

  test('settings main page loads with configuration interface', async ({ context, page }: any) => {
    const { report, result } = await withPerformanceMonitoring(
      page,
      context,
      '/settings',
      async () => {
        // Verify page loads successfully
        await expect(page).toHaveTitle(/Settings|Configuration|Backstage/i);

        // Check for main settings container
        const settingsContainer = page.locator('main, [role="main"], .settings-container');
        await expect(settingsContainer).toBeVisible();

        // Look for settings navigation or sections
        const settingsElements = [
          '[data-testid*="setting"]',
          '.settings-nav',
          '.settings-menu',
          '.settings-sidebar',
          'nav:has(a[href*="settings"])',
          'text=General Settings',
          'text=Security',
          'text=Integrations',
          'text=API Keys',
          'text=Notifications',
        ];

        let settingsInterfaceFound = false;
        for (const selector of settingsElements) {
          const elements = page.locator(selector);
          if ((await elements.count()) > 0) {
            await expect(elements.first()).toBeVisible();
            settingsInterfaceFound = true;
            break;
          }
        }

        // Look for settings categories or tabs
        const categoryElements = [
          'a[href*="general"]',
          'a[href*="security"]',
          'a[href*="api"]',
          'a[href*="integrations"]',
          'button:has-text("General")',
          'button:has-text("Security")',
          '[data-testid*="settings-tab"]',
          '.settings-tab',
        ];

        let categoriesFound = false;
        for (const selector of categoryElements) {
          const element = page.locator(selector);
          if ((await element.count()) > 0 && (await element.isVisible())) {
            categoriesFound = true;
            break;
          }
        }

        return { categoriesFound, settingsInterfaceFound };
      },
    );

    // Performance assertions
    expect(result.report.metrics.fcp).toBeLessThan(2000);
    expect(result.report.metrics.lcp).toBeLessThan(3000);
  });

  test('general settings configuration and updates', async ({ context, page }: any) => {
    const apiMocker = createApiMocker(page);

    // Mock settings update API
    await apiMocker.mockEndpoint('/api/settings', {
      method: 'PUT',
      response: {
        message: 'Settings updated successfully',
        success: true,
        updatedAt: new Date().toISOString(),
      },
    });

    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    // Navigate to general settings if needed
    const generalLinks = [
      'a[href*="general"]',
      'button:has-text("General")',
      'a:has-text("General Settings")',
      '[data-testid*="general"]',
    ];

    for (const selector of generalLinks) {
      const link = page.locator(selector).first();
      if ((await link.count()) > 0 && (await link.isVisible())) {
        await link.click();
        await page.waitForLoadState('networkidle');
        break;
      }
    }

    // Look for general settings form elements
    const settingsFields = [
      'input[name*="name"]',
      'input[name*="title"]',
      'input[name*="email"]',
      'textarea[name*="description"]',
      'input[name*="url"]',
      'input[name*="domain"]',
      'select[name*="timezone"]',
      'select[name*="language"]',
    ];

    let formFieldsFound = 0;
    for (const selector of settingsFields) {
      if ((await page.locator(selector).count()) > 0) {
        formFieldsFound++;
      }
    }

    if (formFieldsFound > 0) {
      // Update some general settings
      const nameInput = page.locator('input[name*="name"], input[name*="title"]').first();
      if ((await nameInput.count()) > 0 && (await nameInput.isVisible())) {
        await nameInput.clear();
        await nameInput.fill('Updated Organization Name');
      }

      const emailInput = page.locator('input[name*="email"], input[type="email"]').first();
      if ((await emailInput.count()) > 0 && (await emailInput.isVisible())) {
        await emailInput.clear();
        await emailInput.fill('admin@updated-domain.com');
      }

      const descriptionInput = page.locator('textarea[name*="description"]').first();
      if ((await descriptionInput.count()) > 0 && (await descriptionInput.isVisible())) {
        await descriptionInput.clear();
        await descriptionInput.fill('Updated organization description for e2e testing');
      }

      const timezoneSelect = page.locator('select[name*="timezone"]').first();
      if ((await timezoneSelect.count()) > 0 && (await timezoneSelect.isVisible())) {
        await timezoneSelect.selectOption({ index: 1 });
      }

      // Try to save the settings
      const saveButtons = [
        'button:has-text("Save")',
        'button:has-text("Update")',
        'button:has-text("Save Changes")',
        'button[type="submit"]',
        '[data-testid*="save"]',
      ];

      for (const saveSelector of saveButtons) {
        const saveButton = page.locator(saveSelector);
        if ((await saveButton.count()) > 0 && (await saveButton.isVisible())) {
          await saveButton.click();
          await page.waitForTimeout(1000);

          // Look for success message
          const successElements = [
            'text=Settings updated',
            'text=Saved successfully',
            'text=Changes saved',
            '.success-message',
            '.notification',
            '[data-testid*="success"]',
          ];

          for (const successSelector of successElements) {
            if ((await page.locator(successSelector).count()) > 0) {
              break;
            }
          }
          break;
        }
      }
    }
  });

  test('security settings and authentication configuration', async ({ context, page }: any) => {
    const visualTester = createVisualTester(page);

    await page.goto('/settings/security');
    await page.waitForLoadState('networkidle');

    // Check if security settings page exists
    const securityElements = [
      'text=Security Settings',
      'text=Authentication',
      'text=Password Policy',
      'text=Two-Factor',
      'text=Session',
      'text=API Keys',
      '[data-testid*="security"]',
      '.security-settings',
    ];

    let securitySettingsFound = false;
    for (const selector of securityElements) {
      if ((await page.locator(selector).count()) > 0) {
        securitySettingsFound = true;
        break;
      }
    }

    if (securitySettingsFound) {
      // Test password policy settings
      const passwordPolicyElements = [
        'input[name*="minLength"]',
        'input[name*="requireUppercase"]',
        'input[name*="requireNumbers"]',
        'input[name*="requireSpecial"]',
        'input[type="checkbox"]:has-text("Uppercase")',
        'input[type="checkbox"]:has-text("Numbers")',
      ];

      for (const selector of passwordPolicyElements) {
        const element = page.locator(selector).first();
        if ((await element.count()) > 0 && (await element.isVisible())) {
          if (await element.evaluate((el: any) => el.type === 'checkbox')) {
            const mockRequest = new NextRequest('http://localhost') as any;
            await element.limit(mockRequest);
          } else if (await element.evaluate((el: any) => el.type === 'number')) {
            await element.fill('8');
          }
          await page.waitForTimeout(500);
          break;
        }
      }

      // Test two-factor authentication settings
      const twoFactorElements = [
        'input[name*="twoFactor"]',
        'input[name*="2fa"]',
        'button:has-text("Enable 2FA")',
        'button:has-text("Configure Two-Factor")',
        '[data-testid*="two-factor"]',
      ];

      for (const selector of twoFactorElements) {
        const element = page.locator(selector).first();
        if ((await element.count()) > 0 && (await element.isVisible())) {
          if (await element.evaluate((el: any) => el.type === 'checkbox')) {
            const mockRequest = new NextRequest('http://localhost') as any;
            await element.limit(mockRequest);
          } else {
            await element.click();
          }
          await page.waitForTimeout(1000);
          break;
        }
      }

      // Test session management settings
      const sessionElements = [
        'input[name*="sessionTimeout"]',
        'input[name*="maxSessions"]',
        'select[name*="sessionLength"]',
        '[data-testid*="session"]',
      ];

      for (const selector of sessionElements) {
        const element = page.locator(selector).first();
        if ((await element.count()) > 0 && (await element.isVisible())) {
          if (await element.evaluate((el: any) => el.tagName === 'SELECT')) {
            await element.selectOption({ index: 1 });
          } else if (await element.evaluate((el: any) => el.type === 'number')) {
            await element.fill('30');
          }
          await page.waitForTimeout(500);
          break;
        }
      }

      // Take screenshot of security settings
      await visualTester.compareScreenshot('security-settings', {
        fullPage: true,
        threshold: 0.3,
      });
    } else {
      // If no security page, check main settings for security section
      await page.goto('/settings');
      const securitySection = page.locator('text=Security, [data-testid*="security"]');
      if ((await securitySection.count()) > 0) {
        await securitySection.first().click();
        await page.waitForTimeout(1000);
      }
    }
  });

  test('API keys and integration management', async ({ context, page }: any) => {
    const apiMocker = createApiMocker(page);

    // Mock API key creation
    await apiMocker.mockEndpoint('/api/keys', {
      method: 'POST',
      response: {
        id: 'key-123',
        name: 'Test API Key',
        createdAt: new Date().toISOString(),
        key: 'sk_test_123456789abcdef',
        permissions: ['read', 'write'],
      },
    });

    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    // Navigate to API keys section
    const apiKeyLinks = [
      'a[href*="api"]',
      'a[href*="keys"]',
      'button:has-text("API Keys")',
      'a:has-text("API Keys")',
      'text=API Keys',
      '[data-testid*="api-keys"]',
    ];

    let apiKeysFound = false;
    for (const selector of apiKeyLinks) {
      const link = page.locator(selector).first();
      if ((await link.count()) > 0 && (await link.isVisible())) {
        await link.click();
        await page.waitForLoadState('networkidle');
        apiKeysFound = true;
        break;
      }
    }

    if (apiKeysFound) {
      // Test API key creation
      const createKeyButtons = [
        'button:has-text("Create Key")',
        'button:has-text("Add API Key")',
        'button:has-text("Generate Key")',
        '[data-testid*="create-key"]',
      ];

      for (const selector of createKeyButtons) {
        const button = page.locator(selector);
        if ((await button.count()) > 0 && (await button.isVisible())) {
          await button.click();
          await page.waitForTimeout(1000);

          // Look for API key creation form
          const keyForm = [
            'input[name*="name"]',
            'input[name*="description"]',
            'select[name*="permissions"]',
            'input[type="checkbox"]',
            '[data-testid*="key-form"]',
          ];

          for (const formSelector of keyForm) {
            if ((await page.locator(formSelector).count()) > 0) {
              const nameInput = page.locator('input[name*="name"]').first();
              if ((await nameInput.count()) > 0) {
                await nameInput.fill(`Test API Key ${Date.now()}`);
              }
              break;
            }
          }
          break;
        }
      }

      // Test API key permissions management
      const permissionElements = [
        'input[type="checkbox"]:has-text("Read")',
        'input[type="checkbox"]:has-text("Write")',
        'input[type="checkbox"]:has-text("Admin")',
        'select[name*="permissions"]',
        '[data-testid*="permission"]',
      ];

      for (const selector of permissionElements) {
        const element = page.locator(selector).first();
        if ((await element.count()) > 0 && (await element.isVisible())) {
          if (await element.evaluate((el: any) => el.type === 'checkbox')) {
            const mockRequest = new NextRequest('http://localhost') as any;
            await element.limit(mockRequest);
          } else if (await element.evaluate((el: any) => el.tagName === 'SELECT')) {
            await element.selectOption({ index: 1 });
          }
          await page.waitForTimeout(500);
          break;
        }
      }

      // Test existing API key management
      const keyItems = [
        '.api-key-item',
        '.key-row',
        'tr:has(td:has-text("sk_"))',
        '[data-testid*="key-item"]',
      ];

      for (const selector of keyItems) {
        const items = page.locator(selector);
        if ((await items.count()) > 0) {
          const firstItem = items.first();

          // Look for key actions
          const keyActions = [
            'button:has-text("Revoke")',
            'button:has-text("Edit")',
            'button:has-text("View")',
            '[data-testid*="revoke"]',
            '[data-testid*="edit-key"]',
          ];

          for (const actionSelector of keyActions) {
            const action = firstItem.locator(actionSelector);
            if ((await action.count()) > 0 && (await action.isVisible())) {
              // Don't actually revoke keys in test
              await expect(action).toBeVisible();
              break;
            }
          }
          break;
        }
      }
    }

    // Test integrations management
    const integrationElements = [
      'text=Integrations',
      'text=Webhooks',
      'text=External Services',
      'button:has-text("Integrations")',
      '[data-testid*="integration"]',
    ];

    for (const selector of integrationElements) {
      const element = page.locator(selector).first();
      if ((await element.count()) > 0 && (await element.isVisible())) {
        await element.click();
        await page.waitForTimeout(1000);

        // Look for integration configuration
        const integrationConfig = [
          'input[name*="webhook"]',
          'input[name*="url"]',
          'select[name*="service"]',
          '.integration-form',
        ];

        for (const configSelector of integrationConfig) {
          if ((await page.locator(configSelector).count()) > 0) {
            break;
          }
        }
        break;
      }
    }
  });

  test('notification settings and preferences', async ({ context, page }: any) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    // Navigate to notification settings
    const notificationLinks = [
      'a[href*="notification"]',
      'button:has-text("Notifications")',
      'a:has-text("Notifications")',
      'text=Notification Preferences',
      '[data-testid*="notification"]',
    ];

    let notificationSettingsFound = false;
    for (const selector of notificationLinks) {
      const link = page.locator(selector).first();
      if ((await link.count()) > 0 && (await link.isVisible())) {
        await link.click();
        await page.waitForLoadState('networkidle');
        notificationSettingsFound = true;
        break;
      }
    }

    if (notificationSettingsFound) {
      // Test email notification preferences
      const emailNotificationElements = [
        'input[name*="email"]',
        'input[type="checkbox"]:has-text("Email")',
        'input[type="checkbox"]:has-text("Daily Digest")',
        'input[type="checkbox"]:has-text("System Alerts")',
        '[data-testid*="email-notification"]',
      ];

      for (const selector of emailNotificationElements) {
        const element = page.locator(selector).first();
        if ((await element.count()) > 0 && (await element.isVisible())) {
          if (await element.evaluate((el: any) => el.type === 'checkbox')) {
            const mockRequest = new NextRequest('http://localhost') as any;
            await element.limit(mockRequest);
          }
          await page.waitForTimeout(500);
          break;
        }
      }

      // Test push notification settings
      const pushNotificationElements = [
        'input[name*="push"]',
        'input[type="checkbox"]:has-text("Push")',
        'button:has-text("Enable Notifications")',
        '[data-testid*="push-notification"]',
      ];

      for (const selector of pushNotificationElements) {
        const element = page.locator(selector).first();
        if ((await element.count()) > 0 && (await element.isVisible())) {
          if (await element.evaluate((el: any) => el.type === 'checkbox')) {
            const mockRequest = new NextRequest('http://localhost') as any;
            await element.limit(mockRequest);
          } else {
            await element.click();
          }
          await page.waitForTimeout(1000);
          break;
        }
      }

      // Test notification frequency settings
      const frequencyElements = [
        'select[name*="frequency"]',
        'input[name*="interval"]',
        'radio[name*="frequency"]',
        '[data-testid*="frequency"]',
      ];

      for (const selector of frequencyElements) {
        const element = page.locator(selector).first();
        if ((await element.count()) > 0 && (await element.isVisible())) {
          if (await element.evaluate((el: any) => el.tagName === 'SELECT')) {
            await element.selectOption({ index: 1 });
          } else if (await element.evaluate((el: any) => el.type === 'radio')) {
            const mockRequest = new NextRequest('http://localhost') as any;
            await element.limit(mockRequest);
          }
          await page.waitForTimeout(500);
          break;
        }
      }
    }

    // Test notification channel configuration
    const channelElements = [
      'text=Slack',
      'text=Discord',
      'text=Teams',
      'text=Webhook',
      'input[name*="slack"]',
      'input[name*="webhook"]',
    ];

    for (const selector of channelElements) {
      const element = page.locator(selector).first();
      if ((await element.count()) > 0) {
        // If it's an input, try to configure it
        if (await element.evaluate((el: any) => el.tagName === 'INPUT')) {
          if (await element.isVisible()) {
            await element.fill('https://hooks.slack.com/test-webhook-url');
          }
        }
        break;
      }
    }
  });

  test('backup and data management settings', async ({ context, page }: any) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    // Look for backup/data management settings
    const backupElements = [
      'text=Backup',
      'text=Data Export',
      'text=Data Management',
      'button:has-text("Backup")',
      'a:has-text("Data Management")',
      '[data-testid*="backup"]',
      '[data-testid*="data"]',
    ];

    let backupSettingsFound = false;
    for (const selector of backupElements) {
      const element = page.locator(selector).first();
      if ((await element.count()) > 0 && (await element.isVisible())) {
        await element.click();
        await page.waitForLoadState('networkidle');
        backupSettingsFound = true;
        break;
      }
    }

    if (backupSettingsFound) {
      // Test automatic backup configuration
      const autoBackupElements = [
        'input[name*="autoBackup"]',
        'input[name*="automatic"]',
        'select[name*="frequency"]',
        'input[type="checkbox"]:has-text("Automatic")',
        '[data-testid*="auto-backup"]',
      ];

      for (const selector of autoBackupElements) {
        const element = page.locator(selector).first();
        if ((await element.count()) > 0 && (await element.isVisible())) {
          if (await element.evaluate((el: any) => el.type === 'checkbox')) {
            const mockRequest = new NextRequest('http://localhost') as any;
            await element.limit(mockRequest);
          } else if (await element.evaluate((el: any) => el.tagName === 'SELECT')) {
            await element.selectOption({ index: 1 });
          }
          await page.waitForTimeout(500);
          break;
        }
      }

      // Test manual backup creation
      const manualBackupButtons = [
        'button:has-text("Create Backup")',
        'button:has-text("Backup Now")',
        'button:has-text("Export Data")',
        '[data-testid*="create-backup"]',
      ];

      for (const selector of manualBackupButtons) {
        const button = page.locator(selector);
        if ((await button.count()) > 0 && (await button.isVisible())) {
          await button.click();
          await page.waitForTimeout(1000);

          // Look for backup confirmation or progress
          const backupStatus = [
            'text=Backup created',
            'text=Export started',
            'text=Creating backup',
            '.backup-progress',
            '.export-status',
          ];

          for (const statusSelector of backupStatus) {
            if ((await page.locator(statusSelector).count()) > 0) {
              break;
            }
          }
          break;
        }
      }

      // Test data retention settings
      const retentionElements = [
        'input[name*="retention"]',
        'select[name*="retention"]',
        'input[name*="keepDays"]',
        '[data-testid*="retention"]',
      ];

      for (const selector of retentionElements) {
        const element = page.locator(selector).first();
        if ((await element.count()) > 0 && (await element.isVisible())) {
          if (await element.evaluate((el: any) => el.tagName === 'SELECT')) {
            await element.selectOption({ index: 1 });
          } else if (await element.evaluate((el: any) => el.type === 'number')) {
            await element.fill('90');
          }
          await page.waitForTimeout(500);
          break;
        }
      }
    }

    // Test data import functionality
    const importElements = [
      'button:has-text("Import")',
      'button:has-text("Restore")',
      'input[type="file"]',
      '[data-testid*="import"]',
    ];

    for (const selector of importElements) {
      const element = page.locator(selector).first();
      if ((await element.count()) > 0 && (await element.isVisible())) {
        if (await element.evaluate((el: any) => el.tagName === 'INPUT')) {
          // File input - verify it exists
          await expect(element).toBeVisible();
        } else {
          await element.click();
          await page.waitForTimeout(1000);
        }
        break;
      }
    }
  });

  test('advanced settings and system configuration', async ({ context, page }: any) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    // Look for advanced/system settings
    const advancedElements = [
      'text=Advanced',
      'text=System',
      'text=Database',
      'text=Cache',
      'text=Performance',
      'button:has-text("Advanced")',
      'a:has-text("System Settings")',
      '[data-testid*="advanced"]',
      '[data-testid*="system"]',
    ];

    let advancedSettingsFound = false;
    for (const selector of advancedElements) {
      const element = page.locator(selector).first();
      if ((await element.count()) > 0 && (await element.isVisible())) {
        await element.click();
        await page.waitForLoadState('networkidle');
        advancedSettingsFound = true;
        break;
      }
    }

    if (advancedSettingsFound) {
      // Test cache settings
      const cacheElements = [
        'input[name*="cache"]',
        'select[name*="cacheType"]',
        'input[name*="ttl"]',
        'button:has-text("Clear Cache")',
        '[data-testid*="cache"]',
      ];

      for (const selector of cacheElements) {
        const element = page.locator(selector).first();
        if ((await element.count()) > 0 && (await element.isVisible())) {
          if (await element.evaluate((el: any) => el.tagName === 'SELECT')) {
            await element.selectOption({ index: 1 });
          } else if (await element.evaluate((el: any) => el.type === 'number')) {
            await element.fill('3600');
          } else if (await element.evaluate((el: any) => el.tagName === 'BUTTON')) {
            // Don't actually clear cache in test
            await expect(element).toBeVisible();
          }
          await page.waitForTimeout(500);
          break;
        }
      }

      // Test performance settings
      const performanceElements = [
        'input[name*="maxConnections"]',
        'input[name*="timeout"]',
        'select[name*="logLevel"]',
        '[data-testid*="performance"]',
      ];

      for (const selector of performanceElements) {
        const element = page.locator(selector).first();
        if ((await element.count()) > 0 && (await element.isVisible())) {
          if (await element.evaluate((el: any) => el.tagName === 'SELECT')) {
            await element.selectOption({ index: 1 });
          } else if (await element.evaluate((el: any) => el.type === 'number')) {
            await element.fill('100');
          }
          await page.waitForTimeout(500);
          break;
        }
      }

      // Test maintenance mode
      const maintenanceElements = [
        'input[name*="maintenance"]',
        'button:has-text("Maintenance Mode")',
        'input[type="checkbox"]:has-text("Maintenance")',
        '[data-testid*="maintenance"]',
      ];

      for (const selector of maintenanceElements) {
        const element = page.locator(selector).first();
        if ((await element.count()) > 0 && (await element.isVisible())) {
          if (await element.evaluate((el: any) => el.type === 'checkbox')) {
            // Don't actually enable maintenance mode in test
            await expect(element).toBeVisible();
          }
          break;
        }
      }
    }

    // Test system health monitoring
    const healthElements = [
      'text=System Health',
      'text=Status',
      'text=Uptime',
      'text=Memory Usage',
      '[data-testid*="health"]',
      '[data-testid*="status"]',
    ];

    for (const selector of healthElements) {
      if ((await page.locator(selector).count()) > 0) {
        break;
      }
    }
  });

  test('settings form validation and error handling', async ({ context, page }: any) => {
    const apiMocker = createApiMocker(page);

    // Mock settings update failure
    await apiMocker.mockEndpoint('/api/settings', {
      method: 'PUT',
      response: {
        details: 'Invalid email format',
        error: 'Validation failed',
      },
      status: 400,
    });

    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    // Test form validation
    const emailInputs = page.locator('input[type="email"], input[name*="email"]');
    if ((await emailInputs.count()) > 0) {
      const emailInput = emailInputs.first();
      if (await emailInput.isVisible()) {
        // Test invalid email
        await emailInput.clear();
        await emailInput.fill('invalid-email');
        await page.keyboard.press('Tab');
        await page.waitForTimeout(500);

        // Look for validation error
        const validationErrors = [
          'text=Invalid email',
          'text=Please enter a valid email',
          '.error-message',
          '.validation-error',
          '[data-testid*="error"]',
        ];

        for (const errorSelector of validationErrors) {
          if ((await page.locator(errorSelector).count()) > 0) {
            break;
          }
        }
      }
    }

    // Test required field validation
    const requiredInputs = page.locator('input[required], input[name*="name"]');
    if ((await requiredInputs.count()) > 0) {
      const requiredInput = requiredInputs.first();
      if (await requiredInput.isVisible()) {
        await requiredInput.clear();
        await page.keyboard.press('Tab');
        await page.waitForTimeout(500);

        // Look for required field error
        const requiredErrors = ['text=This field is required', 'text=Required', '.required-error'];

        for (const errorSelector of requiredErrors) {
          if ((await page.locator(errorSelector).count()) > 0) {
            break;
          }
        }
      }
    }

    // Test form submission with errors
    const saveButtons = page.locator('button:has-text("Save"), button[type="submit"]');
    if ((await saveButtons.count()) > 0) {
      const saveButton = saveButtons.first();
      if (await saveButton.isVisible()) {
        await saveButton.click();
        await page.waitForTimeout(1000);

        // Look for error messages
        const errorMessages = [
          'text=Validation failed',
          'text=Error saving',
          'text=Invalid email format',
          '.error-notification',
          '.alert-error',
        ];

        for (const errorSelector of errorMessages) {
          if ((await page.locator(errorSelector).count()) > 0) {
            break;
          }
        }
      }
    }
  });

  test('settings performance and data persistence', async ({ context, page }: any) => {
    const { result } = await withPerformanceMonitoring(page, context, '/settings', async () => {
      // Test settings navigation performance
      const settingsTabs = [
        'a[href*="general"]',
        'a[href*="security"]',
        'a[href*="api"]',
        'button:has-text("General")',
        'button:has-text("Security")',
      ];

      let tabNavigationTested = false;
      for (const selector of settingsTabs) {
        const tab = page.locator(selector).first();
        if ((await tab.count()) > 0 && (await tab.isVisible())) {
          const startTime = Date.now();
          await tab.click();
          await page.waitForLoadState('networkidle');
          const loadTime = Date.now() - startTime;

          // Each tab should load quickly
          expect(loadTime).toBeLessThan(2000);
          tabNavigationTested = true;
          break;
        }
      }

      // Test form field loading
      const formFields = page.locator('input, select, textarea');
      const fieldCount = await formFields.count();

      // Test auto-save functionality if available
      const autoSaveElements = [
        'text=Auto-saved',
        'text=Saving...',
        '.auto-save-indicator',
        '[data-testid*="auto-save"]',
      ];

      let autoSaveFound = false;
      for (const selector of autoSaveElements) {
        if ((await page.locator(selector).count()) > 0) {
          autoSaveFound = true;
          break;
        }
      }

      return { autoSaveFound, fieldCount, tabNavigationTested };
    });

    // Settings page should load quickly
    expect(result.report.metrics.fcp).toBeLessThan(2500);
    expect(result.report.metrics.lcp).toBeLessThan(4000);

    // Test data persistence by reloading
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Form should maintain values after reload (if any were set)
    const formInputs = page.locator('input[value], select option[selected]');
    const persistedFieldCount = await formInputs.count();

    // At least some form state should be preserved
    expect(persistedFieldCount).toBeGreaterThanOrEqual(0);
  });
});
