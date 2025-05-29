import { beforeEach, describe, expect, it, vi } from 'vitest';

import { auth } from '@repo/auth/server';

// Import after mocks
import { getAppPortal, send } from '../lib/svix';

// Create mocks
const mockCreate = vi.fn().mockResolvedValue({ id: 'test-message-id' });
const mockAppPortalAccess = vi.fn().mockResolvedValue('test-app-portal-url');

// Mock modules
vi.mock('svix', () => ({
  Svix: vi.fn().mockImplementation(() => ({
    authentication: {
      appPortalAccess: mockAppPortalAccess,
    },
    message: {
      create: mockCreate,
    },
  })),
}));

describe('@repo/webhooks/lib/svix', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('send', () => {
    it('sends a message with the correct parameters', async () => {
      const eventType = 'test-event';
      const payload = { test: 'data' };

      await send(eventType, payload);

      expect(mockCreate).toHaveBeenCalledWith(
        'test-org-id',
        expect.objectContaining({
          application: {
            uid: 'test-org-id',
            name: 'test-org-id',
          },
          eventType,
          payload: {
            eventType,
            test: 'data',
          },
        }),
      );
    });

    it('returns early when no organization ID is found', async () => {
      // Temporarily mock auth to return no org ID
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({
        session: { activeOrganizationId: undefined },
      });

      const result = await send('event', {});
      expect(result).toBeUndefined();
      expect(mockCreate).not.toHaveBeenCalled();
    });
  });

  describe('getAppPortal', () => {
    it('gets app portal access with correct parameters', async () => {
      await getAppPortal();

      expect(mockAppPortalAccess).toHaveBeenCalledWith(
        'test-org-id',
        expect.objectContaining({
          application: {
            uid: 'test-org-id',
            name: 'test-org-id',
          },
        }),
      );
    });

    it('returns early when no organization ID is found', async () => {
      // Temporarily mock auth to return no org ID
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({
        session: { activeOrganizationId: undefined },
      });

      const result = await getAppPortal();
      expect(result).toBeNull();
      expect(mockAppPortalAccess).not.toHaveBeenCalled();
    });
  });
});
