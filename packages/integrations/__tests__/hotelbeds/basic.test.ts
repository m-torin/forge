import { HotelbedsHotelsAPI } from '@/hotelbeds';
import { describe, expect, test, vi } from 'vitest';

// Mock environment variables
vi.stubEnv('HOTELBEDS_API_KEY', 'test-key');
vi.stubEnv('HOTELBEDS_SECRET', 'test-secret');
vi.stubEnv('HOTELBEDS_API_BASE', 'https://api.test.hotelbeds.com');

describe('hotelbedsHotelsAPI', () => {
  test('should be instantiable', () => {
    const client = new HotelbedsHotelsAPI();
    expect(client).toBeInstanceOf(HotelbedsHotelsAPI);
  });

  test('should have required methods', () => {
    const client = new HotelbedsHotelsAPI();

    expect(typeof client.searchHotels).toBe('function');
    expect(typeof client.getHotelDetails).toBe('function');
    expect(typeof client.checkAvailability).toBe('function');
    expect(typeof client.createBooking).toBe('function');
  });
});
