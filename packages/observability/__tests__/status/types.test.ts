import { describe, expect, it } from 'vitest';
import type { BetterStackResponse } from '../../status/types';

describe.skip('BetterStackResponse Type', () => {
  it('validates a correctly structured response', () => {
    const validResponse: BetterStackResponse = {
      data: [
        {
          id: 'test-monitor-1',
          type: 'monitor',
          attributes: {
            url: 'https://test-site-1.com',
            pronounceable_name: 'Test Site 1',
            auth_username: '',
            auth_password: '',
            monitor_type: 'http',
            monitor_group_id: null,
            last_checked_at: '2025-03-18T12:00:00Z',
            status: 'up',
            policy_id: null,
            required_keyword: null,
            verify_ssl: true,
            check_frequency: 60,
            call: false,
            sms: false,
            email: true,
            push: true,
            team_wait: null,
            http_method: 'GET',
            request_timeout: 30,
            recovery_period: 180,
            request_headers: [],
            request_body: '',
            follow_redirects: true,
            remember_cookies: true,
            created_at: '2025-01-01T00:00:00Z',
            updated_at: '2025-03-18T12:00:00Z',
            ssl_expiration: null,
            domain_expiration: null,
            regions: ['us', 'eu'],
            expected_status_codes: [],
            port: null,
            confirmation_period: 0,
            paused_at: null,
            paused: false,
            maintenance_from: null,
            maintenance_to: null,
            maintenance_timezone: 'UTC',
          },
          relationships: {
            policy: {
              data: null,
            },
          },
        },
      ],
      pagination: {
        first: 'https://uptime.betterstack.com/api/v2/monitors?page=1',
        last: 'https://uptime.betterstack.com/api/v2/monitors?page=1',
        prev: null,
        next: null,
      },
    };

    // Type validation happens at compile time, so this test just verifies
    // that the object can be assigned to the type without TypeScript errors
    expect(validResponse).toBeDefined();
    expect(validResponse.data.length).toBe(1);
    expect(validResponse.data[0].attributes.status).toBe('up');
  });

  it('validates all possible status values', () => {
    // Create a function that accepts a status value
    const createResponseWithStatus = (
      status:
        | 'down'
        | 'maintenance'
        | 'paused'
        | 'pending'
        | 'up'
        | 'validating',
    ): BetterStackResponse => {
      return {
        data: [
          {
            id: 'test-monitor-1',
            type: 'monitor',
            attributes: {
              url: 'https://test-site-1.com',
              pronounceable_name: 'Test Site 1',
              auth_username: '',
              auth_password: '',
              monitor_type: 'http',
              monitor_group_id: null,
              last_checked_at: '2025-03-18T12:00:00Z',
              status,
              policy_id: null,
              required_keyword: null,
              verify_ssl: true,
              check_frequency: 60,
              call: false,
              sms: false,
              email: true,
              push: true,
              team_wait: null,
              http_method: 'GET',
              request_timeout: 30,
              recovery_period: 180,
              request_headers: [],
              request_body: '',
              follow_redirects: true,
              remember_cookies: true,
              created_at: '2025-01-01T00:00:00Z',
              updated_at: '2025-03-18T12:00:00Z',
              ssl_expiration: null,
              domain_expiration: null,
              regions: ['us', 'eu'],
              expected_status_codes: [],
              port: null,
              confirmation_period: 0,
              paused_at: null,
              paused: false,
              maintenance_from: null,
              maintenance_to: null,
              maintenance_timezone: 'UTC',
            },
            relationships: {
              policy: {
                data: null,
              },
            },
          },
        ],
        pagination: {
          first: 'https://uptime.betterstack.com/api/v2/monitors?page=1',
          last: 'https://uptime.betterstack.com/api/v2/monitors?page=1',
          prev: null,
          next: null,
        },
      };
    };

    // Test each status value
    const downResponse = createResponseWithStatus('down');
    const maintenanceResponse = createResponseWithStatus('maintenance');
    const pausedResponse = createResponseWithStatus('paused');
    const pendingResponse = createResponseWithStatus('pending');
    const upResponse = createResponseWithStatus('up');
    const validatingResponse = createResponseWithStatus('validating');

    // Verify that each response has the correct status
    expect(downResponse.data[0].attributes.status).toBe('down');
    expect(maintenanceResponse.data[0].attributes.status).toBe('maintenance');
    expect(pausedResponse.data[0].attributes.status).toBe('paused');
    expect(pendingResponse.data[0].attributes.status).toBe('pending');
    expect(upResponse.data[0].attributes.status).toBe('up');
    expect(validatingResponse.data[0].attributes.status).toBe('validating');
  });

  it('validates pagination structure', () => {
    const response: BetterStackResponse = {
      data: [],
      pagination: {
        first: 'https://uptime.betterstack.com/api/v2/monitors?page=1',
        last: 'https://uptime.betterstack.com/api/v2/monitors?page=3',
        prev: null,
        next: 'https://uptime.betterstack.com/api/v2/monitors?page=2',
      },
    };

    expect(response.pagination.first).toBe(
      'https://uptime.betterstack.com/api/v2/monitors?page=1',
    );
    expect(response.pagination.last).toBe(
      'https://uptime.betterstack.com/api/v2/monitors?page=3',
    );
    expect(response.pagination.prev).toBeNull();
    expect(response.pagination.next).toBe(
      'https://uptime.betterstack.com/api/v2/monitors?page=2',
    );
  });
});
