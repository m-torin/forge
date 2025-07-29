import { HotelbedsActivitiesAPI } from '@/hotelbeds';
import { beforeEach, describe, expect, test, vi } from 'vitest';

// Mock environment variables
vi.stubEnv('HOTELBEDS_API_KEY', 'test-key');
vi.stubEnv('HOTELBEDS_SECRET', 'test-secret');
vi.stubEnv('HOTELBEDS_API_BASE', 'https://api.test.hotelbeds.com');

describe('hotelbedsActivitiesAPI', () => {
  beforeEach(() => {
    // Reset fetch mock before each test
    vi.resetAllMocks();
  });

  test('should be instantiable', () => {
    const client = new HotelbedsActivitiesAPI('test-key', 'test-secret');
    expect(client).toBeInstanceOf(HotelbedsActivitiesAPI);
  });

  test('should have required methods', () => {
    const client = new HotelbedsActivitiesAPI();
    expect(typeof client.searchActivities).toBe('function');
    expect(typeof client.getActivityDetails).toBe('function');
    expect(typeof client.checkActivityAvailability).toBe('function');
    expect(typeof client.bookActivity).toBe('function');
    expect(typeof client.getBooking).toBe('function');
    expect(typeof client.cancelBooking).toBe('function');
    expect(typeof client.getCategories).toBe('function');
    expect(typeof client.getDestinations).toBe('function');
    expect(typeof client.searchEvents).toBe('function');
    expect(typeof client.getEventDetails).toBe('function');
    expect(typeof client.getTicketTypes).toBe('function');
    expect(typeof client.purchaseTickets).toBe('function');
  });

  test('should call fetch on searchActivities', async () => {
    const client = new HotelbedsActivitiesAPI('test-key', 'test-secret');
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ activities: [] }),
      headers: new Headers(),
      redirected: false,
      status: 200,
      statusText: 'OK',
      type: 'basic' as const,
      url: '',
      clone: () => ({}) as Response,
      body: null,
      bodyUsed: false,
      arrayBuffer: async () => new ArrayBuffer(0),
      blob: async () => new Blob(),
      formData: async () => new FormData(),
      text: async () => '',
    } as Response);
    const result = await client.searchActivities({
      destination: { code: 'MCO', type: 'DESTINATION' },
      dateFrom: '2024-07-01',
      dateTo: '2024-07-05',
      paxes: [{ type: 'ADULT', age: 30 }],
    });
    expect(result).toHaveProperty('activities');
    expect(global.fetch).toHaveBeenCalledWith();
  });
});
