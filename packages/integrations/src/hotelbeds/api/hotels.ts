import { safeEnv } from '../../../env';
import type {
  ApiResponse,
  BookingRequest,
  BookingResponse,
  HotelSearchRequest,
  HotelSearchResponse,
  SearchFilters,
} from '../types/hotels';
import { generateSignature, generateTimestamp } from '../utils/auth';

export class HotelbedsHotelsAPI {
  private baseUrl: string;
  private apiKey: string;
  private secret: string;

  constructor() {
    const env = safeEnv();
    this.baseUrl = env.HOTELBEDS_API_BASE;
    this.apiKey = env.HOTELBEDS_API_KEY;
    this.secret = env.HOTELBEDS_SECRET;
  }

  /**
   * Search for hotels based on criteria
   */
  async searchHotels(filters: SearchFilters): Promise<ApiResponse<HotelSearchResponse>> {
    const request: HotelSearchRequest = {
      stay: {
        checkIn: filters.checkIn ?? '',
        checkOut: filters.checkOut ?? '',
      },
      occupancies: [
        {
          rooms: filters.rooms || 1,
          adults: filters.adults || 2,
          children: filters.children || 0,
        },
      ],
      ...(filters.destination && {
        destination: {
          code: filters.destination,
        },
      }),
      ...((filters.minRate || filters.maxRate) && {
        filter: {
          ...(filters.minRate && { minRate: filters.minRate }),
          ...(filters.maxRate && { maxRate: filters.maxRate }),
          ...(filters.minCategory && { minCategory: filters.minCategory }),
          ...(filters.maxCategory && { maxCategory: filters.maxCategory }),
          ...(filters.boardTypes && { boardCodes: filters.boardTypes }),
        },
      }),
      language: 'en',
    };

    const response = await this.makeRequest<HotelSearchResponse>('/hotels', 'POST', request);
    return response;
  }

  /**
   * Get hotel details by hotel code
   */
  async getHotelDetails(hotelCode: string, language = 'en'): Promise<ApiResponse<any>> {
    const response = await this.makeRequest<any>(`/hotels/${hotelCode}`, 'GET', undefined, {
      language,
    });
    return response;
  }

  /**
   * Check room availability for a specific hotel
   */
  async checkAvailability(
    hotelCode: string,
    checkIn: string,
    checkOut: string,
    rooms: number,
    adults: number,
    children: number,
    childrenAges?: number[],
  ): Promise<ApiResponse<HotelSearchResponse>> {
    try {
      const request: HotelSearchRequest = {
        stay: {
          checkIn,
          checkOut,
        },
        occupancies: [
          {
            rooms,
            adults,
            children,
            ...(childrenAges &&
              childrenAges.length > 0 && {
                paxes: childrenAges.map(age => ({
                  type: 'CH' as const,
                  age,
                })),
              }),
          },
        ],
        hotels: {
          hotel: [parseInt(hotelCode, 10)],
        },
        language: 'en',
      };

      const response = await this.makeRequest<HotelSearchResponse>('/hotels', 'POST', request);
      return response;
    } catch (error) {
      throw new Error(
        `Failed to check availability: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Create a hotel booking
   */
  async createBooking(bookingData: BookingRequest): Promise<ApiResponse<BookingResponse>> {
    const response = await this.makeRequest<BookingResponse>('/bookings', 'POST', bookingData);
    return response;
  }

  /**
   * Get booking details by reference
   */
  async getBooking(reference: string): Promise<ApiResponse<BookingResponse>> {
    const response = await this.makeRequest<BookingResponse>(`/bookings/${reference}`, 'GET');
    return response;
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(reference: string): Promise<ApiResponse<BookingResponse>> {
    const response = await this.makeRequest<BookingResponse>(`/bookings/${reference}`, 'DELETE');
    return response;
  }

  /**
   * Get destinations
   */
  async getDestinations(language = 'en'): Promise<ApiResponse<any>> {
    const response = await this.makeRequest<any>('/locations/destinations', 'GET', undefined, {
      language,
    });
    return response;
  }

  /**
   * Get hotels in a destination
   */
  async getHotels(destinationCode: string, language = 'en'): Promise<ApiResponse<any>> {
    const response = await this.makeRequest<any>('/hotels', 'GET', undefined, {
      destinationCode,
      language,
    });
    return response;
  }

  /**
   * Get Disney FastPass availability
   */
  async getDisneyFastPassAvailability(params: {
    date: string;
    parkCode: string;
    attractions?: string[];
    partySize: number;
  }): Promise<ApiResponse<{ availability: any[] }>> {
    const response = await this.makeRequest<{ availability: any[] }>(
      '/disney/fastpass/availability',
      'POST',
      params,
    );
    return response;
  }

  /**
   * Get character dining availability
   */
  async getCharacterDiningAvailability(params: {
    date: string;
    location: string;
    partySize: number;
    mealPeriod?: 'Breakfast' | 'Lunch' | 'Dinner';
  }): Promise<ApiResponse<{ timeSlots: any[] }>> {
    const response = await this.makeRequest<{ timeSlots: any[] }>(
      '/disney/dining/character/availability',
      'POST',
      params,
    );
    return response;
  }

  /**
   * Get special event availability
   */
  async getSpecialEventAvailability(params: {
    eventCode: string;
    date: string;
    partySize: number;
  }): Promise<ApiResponse<{ availability: any }>> {
    const response = await this.makeRequest<{ availability: any }>(
      '/disney/events/availability',
      'POST',
      params,
    );
    return response;
  }

  /**
   * Get celebration packages
   */
  async getCelebrationPackages(params: {
    type: string;
    checkIn: string;
    checkOut: string;
    roomType: string;
  }): Promise<ApiResponse<{ packages: any[] }>> {
    const response = await this.makeRequest<{ packages: any[] }>(
      '/disney/celebrations/packages',
      'POST',
      params,
    );
    return response;
  }

  /**
   * Get dining reservations
   */
  async getDiningReservations(params: {
    date: string;
    partySize: number;
    diningType?: string;
    mealPeriod?: string;
    location?: string;
    cuisine?: string[];
    priceRange?: number;
    diningPlan?: boolean;
  }): Promise<ApiResponse<{ reservations: any[] }>> {
    const response = await this.makeRequest<{ reservations: any[] }>(
      '/disney/dining/reservations',
      'POST',
      params,
    );
    return response;
  }

  /**
   * Get transportation schedule
   */
  async getTransportationSchedule(params: {
    hotelCode: string;
    transportType?: string;
    date?: string;
  }): Promise<ApiResponse<{ schedule: any[] }>> {
    const response = await this.makeRequest<{ schedule: any[] }>(
      '/disney/transportation/schedule',
      'POST',
      params,
    );
    return response;
  }

  /**
   * Get hotel activities
   */
  async getHotelActivities(params: {
    hotelCode: string;
    date?: string;
    activityType?: 'RECREATION' | 'ENTERTAINMENT' | 'CHILDREN' | 'ADULT';
  }): Promise<ApiResponse<{ activities: any[] }>> {
    const response = await this.makeRequest<{ activities: any[] }>(
      '/disney/hotels/activities',
      'POST',
      params,
    );
    return response;
  }

  /**
   * Get hotel amenities
   */
  async getHotelAmenities(hotelCode: string): Promise<ApiResponse<{ amenities: any[] }>> {
    const response = await this.makeRequest<{ amenities: any[] }>(
      `/disney/hotels/${hotelCode}/amenities`,
      'GET',
    );
    return response;
  }

  /**
   * Get room upgrades
   */
  async getRoomUpgrades(params: {
    hotelCode: string;
    currentRoomType: string;
    checkIn: string;
    checkOut: string;
  }): Promise<ApiResponse<{ upgrades: any[] }>> {
    const response = await this.makeRequest<{ upgrades: any[] }>(
      '/disney/rooms/upgrades',
      'POST',
      params,
    );
    return response;
  }

  /**
   * Get package add-ons
   */
  async getPackageAddOns(params: {
    hotelCode: string;
    checkIn: string;
    checkOut: string;
    packageType?: string;
  }): Promise<ApiResponse<{ addOns: any[] }>> {
    const response = await this.makeRequest<{ addOns: any[] }>(
      '/disney/packages/addons',
      'POST',
      params,
    );
    return response;
  }

  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    body?: any,
    queryParams?: Record<string, string | number>,
  ): Promise<ApiResponse<T>> {
    const url = new URL(`${this.baseUrl}${endpoint}`);

    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const headers: Record<string, string> = {
      'Api-key': this.apiKey,
      'X-Signature': generateSignature(this.apiKey, this.secret, generateTimestamp()),
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    const requestOptions: RequestInit = {
      method,
      headers,
    };

    if (body) {
      requestOptions.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url.toString(), requestOptions);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = (await response.json()) as T;

      return {
        data,
        auditData: {
          processTime: '0ms',
          timestamp: new Date().toISOString(),
          requestHost: url.host,
          serverId: 'unknown',
          environment: 'test',
          release: '1.0.0',
          token: 'unknown',
          internal: 'unknown',
        },
      };
    } catch (error) {
      throw new Error(
        `Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
