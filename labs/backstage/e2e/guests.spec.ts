import { expect, test } from '@playwright/test';

import { createAuthHelpers } from '@repo/testing/auth-helpers';
import {
  createApiMocker,
  createVisualTester,
  withPerformanceMonitoring,
} from '@repo/testing/playwright';

const authHelpers = createAuthHelpers('http://localhost:3300');

test.describe('Backstage Guests - User and Organization Management Testing', (_: any) => {
  test.beforeEach(async ({ page }: any) => {
    // Sign in as admin user for all guest management tests
    const testUser = authHelpers.createTestUser({
      name: 'Guests Admin',
      email: `guests-admin-${Date.now()}@example.com`,
    });

    try {
      await authHelpers.signIn(page, testUser);
    } catch {
      await authHelpers.signUp(page, testUser);
    }
  });

  test('guests main page loads with user management interface', async ({ context, page }: any) => {
    const { report, result } = await withPerformanceMonitoring(
      page,
      context,
      '/guests',
      async () => {
        // Verify page loads successfully
        await expect(page).toHaveTitle(/Guests|Users|Backstage/i);

        // Check for main guests container
        const guestsContainer = page.locator('main, [role="main"], .guests-container');
        await expect(guestsContainer).toBeVisible();

        // Look for user management elements
        const userElements = [
          '[data-testid*="user"]',
          '.user-list',
          '.user-grid',
          '.user-table',
          'table:has(th:has-text("User"))',
          'table:has(th:has-text("Name"))',
          'table:has(th:has-text("Email"))',
          'text=Users',
          'text=Members',
          'text=Guests',
        ];

        let userInterfaceFound = false;
        for (const selector of userElements) {
          const elements = page.locator(selector);
          if ((await elements.count()) > 0) {
            await expect(elements.first()).toBeVisible();
            userInterfaceFound = true;
            break;
          }
        }

        // Look for user management actions
        const actionButtons = [
          'button:has-text("Add User")',
          'button:has-text("Invite User")',
          'button:has-text("Create User")',
          'button:has-text("Import Users")',
          '[data-testid*="add-user"]',
          '[data-testid*="invite-user"]',
          'a[href*="create"]',
          'a[href*="invite"]',
        ];

        let actionsFound = false;
        for (const selector of actionButtons) {
          const button = page.locator(selector);
          if ((await button.count()) > 0 && (await button.isVisible())) {
            actionsFound = true;
            break;
          }
        }

        return { actionsFound, userInterfaceFound };
      },
    );

    // Performance assertions
    expect(result.report.metrics.fcp).toBeLessThan(2000);
    expect(result.report.metrics.lcp).toBeLessThan(3000);
  });

  test('user creation and invitation workflow', async ({ context, page }: any) => {
    const apiMocker = createApiMocker(page);

    // Mock user creation API
    await apiMocker.mockEndpoint('/api/users', {
      method: 'POST',
      response: {
        id: 'user-123',
        name: 'Test User',
        createdAt: new Date().toISOString(),
        email: 'test@example.com',
        role: 'member',
        status: 'active',
      },
    });

    // Mock invitation API
    await apiMocker.mockEndpoint('/api/users/invite', {
      method: 'POST',
      response: {
        id: 'invitation-123',
        email: 'invited@example.com',
        invitedAt: new Date().toISOString(),
        status: 'pending',
      },
    });

    await page.goto('/guests');
    await page.waitForLoadState('networkidle');

    // Test user creation
    const createSelectors = [
      'button:has-text("Create")',
      'button:has-text("Add User")',
      'button:has-text("New User")',
      'a:has-text("Create")',
      '[data-testid*="create-user"]',
      '[data-testid*="add-user"]',
      '[href*="create"]',
      '[href*="new"]',
    ];

    let userCreationTested = false;
    for (const selector of createSelectors) {
      const createButton = page.locator(selector).first();
      if ((await createButton.count()) > 0 && (await createButton.isVisible())) {
        await createButton.click();
        await page.waitForLoadState('networkidle');

        // Check if we're on a user creation page
        const currentUrl = page.url();
        if (currentUrl.includes('create') || currentUrl.includes('new')) {
          userCreationTested = true;

          // Look for user form elements
          const formElements = [
            'input[name*="name"]',
            'input[name*="email"]',
            'input[name*="firstName"]',
            'input[name*="lastName"]',
            'select[name*="role"]',
            '[data-testid*="user-form"]',
          ];

          let formFieldsFound = 0;
          for (const formSelector of formElements) {
            if ((await page.locator(formSelector).count()) > 0) {
              formFieldsFound++;
            }
          }

          if (formFieldsFound > 0) {
            // Fill out basic user information
            const nameInput = page
              .locator('input[name*="name"], input[placeholder*="name" i]')
              .first();
            if ((await nameInput.count()) > 0) {
              await nameInput.fill(`Test User ${Date.now()}`);
            }

            const emailInput = page.locator('input[name*="email"], input[type="email"]').first();
            if ((await emailInput.count()) > 0) {
              await emailInput.fill(`testuser${Date.now()}@example.com`);
            }

            const roleSelect = page.locator('select[name*="role"]').first();
            if ((await roleSelect.count()) > 0) {
              await roleSelect.selectOption({ index: 1 });
            }

            // Try to save the user
            const saveButtons = [
              'button:has-text("Save")',
              'button:has-text("Create")',
              'button[type="submit"]',
              '[data-testid*="save"]',
            ];

            for (const saveSelector of saveButtons) {
              const saveButton = page.locator(saveSelector);
              if ((await saveButton.count()) > 0 && (await saveButton.isVisible())) {
                await saveButton.click();
                await page.waitForTimeout(1000);
                break;
              }
            }
          }
          break;
        }
      }
    }

    // Test user invitation workflow
    const inviteSelectors = [
      'button:has-text("Invite")',
      'button:has-text("Send Invitation")',
      'a:has-text("Invite")',
      '[data-testid*="invite"]',
    ];

    for (const selector of inviteSelectors) {
      const inviteButton = page.locator(selector).first();
      if ((await inviteButton.count()) > 0 && (await inviteButton.isVisible())) {
        await inviteButton.click();
        await page.waitForTimeout(1000);

        // Look for invitation form
        const inviteForm = [
          'input[name*="email"]',
          'textarea[name*="message"]',
          'select[name*="role"]',
          '[data-testid*="invite-form"]',
        ];

        for (const formSelector of inviteForm) {
          if ((await page.locator(formSelector).count()) > 0) {
            const emailInput = page.locator('input[name*="email"], input[type="email"]').first();
            if ((await emailInput.count()) > 0) {
              await emailInput.fill(`invited${Date.now()}@example.com`);
            }
            break;
          }
        }
        break;
      }
    }
  });

  test('user search, filtering, and role management', async ({ context, page }: any) => {
    const visualTester = createVisualTester(page);

    await page.goto('/guests');
    await page.waitForLoadState('networkidle');

    // Test user search functionality
    const searchElements = [
      'input[type="search"]',
      'input[placeholder*="search" i]',
      'input[placeholder*="user" i]',
      'input[placeholder*="name" i]',
      '[data-testid*="search"]',
      '.search-input',
    ];

    for (const selector of searchElements) {
      const searchInput = page.locator(selector).first();
      if ((await searchInput.count()) > 0 && (await searchInput.isVisible())) {
        await searchInput.fill('test user');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1000);

        // Take screenshot of search results
        await visualTester.compareScreenshot('guests-search-results', {
          fullPage: true,
          threshold: 0.3,
        });
        break;
      }
    }

    // Test role filtering
    const roleFilterElements = [
      'select:has(option:has-text("Admin"))',
      'select:has(option:has-text("Member"))',
      'button:has-text("Admin")',
      'button:has-text("Member")',
      '[data-testid*="role-filter"]',
      '.role-filter',
    ];

    for (const selector of roleFilterElements) {
      const filterElement = page.locator(selector).first();
      if ((await filterElement.count()) > 0 && (await filterElement.isVisible())) {
        if (await filterElement.evaluate((el: any) => el.tagName === 'SELECT')) {
          await filterElement.selectOption({ index: 1 });
        } else {
          await filterElement.click();
        }
        await page.waitForTimeout(500);
        break;
      }
    }

    // Test status filtering
    const statusFilterElements = [
      'select:has(option:has-text("Active"))',
      'select:has(option:has-text("Inactive"))',
      'button:has-text("Active")',
      'button:has-text("Pending")',
      '[data-testid*="status-filter"]',
    ];

    for (const selector of statusFilterElements) {
      const filterElement = page.locator(selector).first();
      if ((await filterElement.count()) > 0 && (await filterElement.isVisible())) {
        if (await filterElement.evaluate((el: any) => el.tagName === 'SELECT')) {
          await filterElement.selectOption({ index: 1 });
        } else {
          await filterElement.click();
        }
        await page.waitForTimeout(500);
        break;
      }
    }

    // Test role management on existing users
    const userItems = [
      '.user-item',
      '.user-row',
      'tr:has(td:has-text("@"))',
      '[data-testid*="user-item"]',
    ];

    for (const selector of userItems) {
      const items = page.locator(selector);
      if ((await items.count()) > 0) {
        const firstItem = items.first();

        // Look for role change buttons or dropdowns
        const roleActions = [
          'select[name*="role"]',
          'button:has-text("Change Role")',
          '[data-testid*="role-select"]',
        ];

        for (const roleSelector of roleActions) {
          const roleElement = firstItem.locator(roleSelector);
          if ((await roleElement.count()) > 0 && (await roleElement.isVisible())) {
            if (await roleElement.evaluate((el: any) => el.tagName === 'SELECT')) {
              await roleElement.selectOption({ index: 1 });
            } else {
              await roleElement.click();
            }
            await page.waitForTimeout(500);
            break;
          }
        }
        break;
      }
    }
  });

  test('organization management and multi-tenancy', async ({ context, page }: any) => {
    await page.goto('/guests/organizations');
    await page.waitForLoadState('networkidle');

    // Check if organizations page exists
    const orgElements = [
      'text=Organizations',
      'text=Companies',
      'text=Tenants',
      '[data-testid*="organization"]',
      '[data-testid*="org"]',
      '.organization-list',
      '.org-table',
    ];

    let orgManagementFound = false;
    for (const selector of orgElements) {
      if ((await page.locator(selector).count()) > 0) {
        orgManagementFound = true;
        break;
      }
    }

    if (orgManagementFound) {
      // Test organization creation
      const createOrgButtons = [
        'button:has-text("Create Organization")',
        'button:has-text("Add Organization")',
        'button:has-text("New Organization")',
        '[data-testid*="create-org"]',
      ];

      for (const selector of createOrgButtons) {
        const button = page.locator(selector);
        if ((await button.count()) > 0 && (await button.isVisible())) {
          await button.click();
          await page.waitForTimeout(1000);

          // Look for organization form
          const orgForm = [
            'input[name*="name"]',
            'input[name*="company"]',
            'input[name*="domain"]',
            '[data-testid*="org-form"]',
          ];

          for (const formSelector of orgForm) {
            if ((await page.locator(formSelector).count()) > 0) {
              const nameInput = page
                .locator('input[name*="name"], input[placeholder*="name" i]')
                .first();
              if ((await nameInput.count()) > 0) {
                await nameInput.fill(`Test Organization ${Date.now()}`);
              }
              break;
            }
          }
          break;
        }
      }

      // Test organization member management
      const orgItems = [
        '.organization-item',
        '.org-row',
        'tr:has(td)',
        '[data-testid*="org-item"]',
      ];

      for (const selector of orgItems) {
        const items = page.locator(selector);
        if ((await items.count()) > 0) {
          const firstItem = items.first();

          // Look for member management actions
          const memberActions = [
            'button:has-text("Members")',
            'a:has-text("View")',
            'a:has-text("Manage")',
            '[data-testid*="view-org"]',
          ];

          for (const actionSelector of memberActions) {
            const action = firstItem.locator(actionSelector);
            if ((await action.count()) > 0 && (await action.isVisible())) {
              await action.click();
              await page.waitForLoadState('networkidle');

              // Look for member list
              const memberElements = [
                '.member-list',
                '.user-list',
                'table:has(th:has-text("Member"))',
                '[data-testid*="member"]',
              ];

              for (const memberSelector of memberElements) {
                if ((await page.locator(memberSelector).count()) > 0) {
                  break;
                }
              }
              break;
            }
          }
          break;
        }
      }
    } else {
      // If no organizations page, go back to main guests
      await page.goto('/guests');
      const mainContent = page.locator('main, [role="main"]');
      await expect(mainContent).toBeVisible();
    }
  });

  test('user permissions and access control', async ({ context, page }: any) => {
    await page.goto('/guests');
    await page.waitForLoadState('networkidle');

    // Look for permission management features
    const permissionElements = [
      'text=Permissions',
      'text=Access Control',
      'text=Roles',
      'button:has-text("Permissions")',
      '[data-testid*="permission"]',
      '[data-testid*="access"]',
      '.permission-matrix',
      '.role-permissions',
    ];

    let permissionManagementFound = false;
    for (const selector of permissionElements) {
      if ((await page.locator(selector).count()) > 0) {
        permissionManagementFound = true;
        break;
      }
    }

    if (permissionManagementFound) {
      // Test permission editing
      const permissionButtons = [
        'button:has-text("Edit Permissions")',
        'button:has-text("Manage Permissions")',
        '[data-testid*="edit-permissions"]',
      ];

      for (const selector of permissionButtons) {
        const button = page.locator(selector).first();
        if ((await button.count()) > 0 && (await button.isVisible())) {
          await button.click();
          await page.waitForTimeout(1000);

          // Look for permission checkboxes or toggles
          const permissionControls = [
            'input[type="checkbox"]',
            '.permission-toggle',
            '[data-testid*="permission-check"]',
          ];

          for (const controlSelector of permissionControls) {
            const controls = page.locator(controlSelector);
            if ((await controls.count()) > 0) {
              const firstControl = controls.first();
              if (await firstControl.isVisible()) {
                if (await firstControl.evaluate((el: any) => el.type === 'checkbox')) {
                  const mockRequest = new NextRequest('http://localhost') as any;
                  await firstControl.limit(mockRequest);
                } else {
                  await firstControl.click();
                }
                await page.waitForTimeout(500);
              }
              break;
            }
          }
          break;
        }
      }

      // Test role-based permissions
      const rolePermissions = [
        'text=Admin Permissions',
        'text=Member Permissions',
        'text=Guest Permissions',
        '.role-section',
      ];

      for (const selector of rolePermissions) {
        if ((await page.locator(selector).count()) > 0) {
          break;
        }
      }
    }

    // Test user activation/deactivation
    const userItems = [
      '.user-item',
      '.user-row',
      'tr:has(td:has-text("@"))',
      '[data-testid*="user-item"]',
    ];

    for (const selector of userItems) {
      const items = page.locator(selector);
      if ((await items.count()) > 0) {
        const firstItem = items.first();

        // Look for status toggle buttons
        const statusActions = [
          'button:has-text("Activate")',
          'button:has-text("Deactivate")',
          'button:has-text("Suspend")',
          '[data-testid*="toggle-status"]',
        ];

        for (const actionSelector of statusActions) {
          const action = firstItem.locator(actionSelector);
          if ((await action.count()) > 0 && (await action.isVisible())) {
            // Don't actually toggle status in test
            await expect(action).toBeVisible();
            break;
          }
        }
        break;
      }
    }
  });

  test('user activity monitoring and audit logs', async ({ context, page }: any) => {
    await page.goto('/guests');
    await page.waitForLoadState('networkidle');

    // Look for activity monitoring features
    const activityElements = [
      'text=Activity',
      'text=Audit Log',
      'text=User Activity',
      'text=Login History',
      'button:has-text("Activity")',
      '[data-testid*="activity"]',
      '[data-testid*="audit"]',
      '.activity-log',
      '.audit-trail',
    ];

    let activityMonitoringFound = false;
    for (const selector of activityElements) {
      const element = page.locator(selector).first();
      if ((await element.count()) > 0) {
        activityMonitoringFound = true;

        if (await element.isVisible()) {
          await element.click();
          await page.waitForTimeout(1000);

          // Look for activity log entries
          const logElements = [
            '.log-entry',
            '.activity-item',
            'table:has(th:has-text("Action"))',
            'table:has(th:has-text("Time"))',
            '[data-testid*="log-entry"]',
          ];

          for (const logSelector of logElements) {
            if ((await page.locator(logSelector).count()) > 0) {
              break;
            }
          }
        }
        break;
      }
    }

    // Test activity filtering
    const filterElements = [
      'select:has(option:has-text("Login"))',
      'select:has(option:has-text("Create"))',
      'input[type="date"]',
      '[data-testid*="activity-filter"]',
    ];

    for (const selector of filterElements) {
      const filter = page.locator(selector).first();
      if ((await filter.count()) > 0 && (await filter.isVisible())) {
        if (await filter.evaluate((el: any) => el.tagName === 'SELECT')) {
          await filter.selectOption({ index: 1 });
        } else if (await filter.evaluate((el: any) => el.type === 'date')) {
          const today = new Date().toISOString().slice(0, 10);
          await filter.fill(today);
        }
        await page.waitForTimeout(500);
        break;
      }
    }

    // Look for user details or profile views
    const userItems = [
      '.user-item',
      '.user-row',
      'tr:has(td:has-text("@"))',
      '[data-testid*="user-item"]',
    ];

    for (const selector of userItems) {
      const items = page.locator(selector);
      if ((await items.count()) > 0) {
        const firstItem = items.first();

        // Look for view profile or details buttons
        const viewActions = [
          'button:has-text("View")',
          'a:has-text("Profile")',
          'a:has-text("Details")',
          '[data-testid*="view-user"]',
        ];

        for (const actionSelector of viewActions) {
          const action = firstItem.locator(actionSelector);
          if ((await action.count()) > 0 && (await action.isVisible())) {
            await action.click();
            await page.waitForLoadState('networkidle');

            // Look for user profile information
            const profileElements = [
              'text=Profile',
              'text=User Details',
              '.user-profile',
              '.profile-section',
            ];

            for (const profileSelector of profileElements) {
              if ((await page.locator(profileSelector).count()) > 0) {
                break;
              }
            }
            break;
          }
        }
        break;
      }
    }
  });

  test('bulk user operations and import/export', async ({ context, page }: any) => {
    const apiMocker = createApiMocker(page);

    // Mock bulk operations API
    await apiMocker.mockEndpoint('/api/users/bulk', {
      method: 'POST',
      response: {
        errors: ['Invalid email format for user 3'],
        failed: 1,
        processed: 5,
        success: 4,
      },
    });

    await page.goto('/guests');
    await page.waitForLoadState('networkidle');

    // Test bulk selection
    const bulkElements = [
      'input[type="checkbox"]',
      'button:has-text("Select All")',
      '[data-testid*="bulk"]',
      '.bulk-actions',
    ];

    let bulkOperationsTested = false;
    for (const selector of bulkElements) {
      const element = page.locator(selector).first();
      if ((await element.count()) > 0 && (await element.isVisible())) {
        if (await element.evaluate((el: any) => el.type === 'checkbox')) {
          const mockRequest = new NextRequest('http://localhost') as any;
          await element.limit(mockRequest);
        } else {
          await element.click();
        }
        await page.waitForTimeout(500);
        bulkOperationsTested = true;
        break;
      }
    }

    // Test bulk actions if selection was made
    if (bulkOperationsTested) {
      const bulkActionButtons = [
        'button:has-text("Delete Selected")',
        'button:has-text("Export Selected")',
        'button:has-text("Change Role")',
        '[data-testid*="bulk-action"]',
      ];

      for (const actionSelector of bulkActionButtons) {
        const button = page.locator(actionSelector);
        if ((await button.count()) > 0 && (await button.isVisible())) {
          // Don't actually execute bulk actions in test
          await expect(button).toBeVisible();
          break;
        }
      }
    }

    // Test user import functionality
    const importButtons = [
      'button:has-text("Import")',
      'button:has-text("Import Users")',
      '[data-testid*="import"]',
    ];

    for (const selector of importButtons) {
      const button = page.locator(selector);
      if ((await button.count()) > 0 && (await button.isVisible())) {
        await button.click();
        await page.waitForTimeout(1000);

        // Look for import interface
        const importElements = [
          'input[type="file"]',
          'text=CSV',
          'text=Upload',
          '.import-dialog',
          '.file-upload',
        ];

        for (const importSelector of importElements) {
          if ((await page.locator(importSelector).count()) > 0) {
            break;
          }
        }
        break;
      }
    }

    // Test user export functionality
    const exportButtons = [
      'button:has-text("Export")',
      'button:has-text("Export Users")',
      '[data-testid*="export"]',
    ];

    for (const selector of exportButtons) {
      const button = page.locator(selector);
      if ((await button.count()) > 0 && (await button.isVisible())) {
        await button.click();
        await page.waitForTimeout(1000);

        // Look for export options
        const exportElements = [
          'text=CSV',
          'text=Excel',
          'select:has(option:has-text("CSV"))',
          '.export-dialog',
        ];

        for (const exportSelector of exportElements) {
          if ((await page.locator(exportSelector).count()) > 0) {
            break;
          }
        }
        break;
      }
    }
  });

  test('guests performance with large user datasets', async ({ context, page }: any) => {
    const { result } = await withPerformanceMonitoring(page, context, '/guests', async () => {
      // Test pagination with large datasets
      const paginationElements = [
        '.pagination',
        'button:has-text("Next")',
        'button:has-text("Previous")',
        '[data-testid*="pagination"]',
        'nav[aria-label*="pagination" i]',
      ];

      let paginationTested = false;
      for (const selector of paginationElements) {
        const pagination = page.locator(selector);
        if ((await pagination.count()) > 0 && (await pagination.isVisible())) {
          const nextButton = pagination.locator('button:has-text("Next"), button:has-text(">")');
          if ((await nextButton.count()) > 0 && (await nextButton.isVisible())) {
            await nextButton.click();
            await page.waitForLoadState('networkidle');
            paginationTested = true;
          }
          break;
        }
      }

      // Test infinite scroll if available
      const scrollContainer = page.locator('.user-list, .user-table, main');
      if ((await scrollContainer.count()) > 0) {
        await scrollContainer.first().hover();
        await page.mouse.wheel(0, 1000);
        await page.waitForTimeout(1000);
      }

      // Test user count display
      const countElements = [
        'text=/\\d+ users?/',
        'text=/Total: \\d+/',
        '[data-testid*="user-count"]',
        '.user-count',
      ];

      let userCountFound = false;
      for (const selector of countElements) {
        if ((await page.locator(selector).count()) > 0) {
          userCountFound = true;
          break;
        }
      }

      return { paginationTested, userCountFound };
    });

    // Guests page should handle large user lists efficiently
    expect(result.report.metrics.fcp).toBeLessThan(3000);
    expect(result.report.metrics.lcp).toBeLessThan(5000);

    // Check memory usage for large user datasets
    const memoryUsage = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    if (memoryUsage > 0) {
      expect(memoryUsage).toBeLessThan(150 * 1024 * 1024); // Less than 150MB
    }
  });
});
