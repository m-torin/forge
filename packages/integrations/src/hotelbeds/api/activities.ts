import { ActivityBookingRequest, ActivityPax, ActivitySearchRequest } from '../types/activities';

const HOTELBEDS_ACTIVITIES_API_BASE = 'https://api.test.hotelbeds.com/activity-api';

interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  body?: any;
  cache?: RequestCache;
  revalidate?: number;
}

export class HotelbedsActivitiesAPI {
  private apiKey: string;
  private secret: string;

  constructor(apiKey?: string, secret?: string) {
    this.apiKey = apiKey || process.env.HOTELBEDS_API_KEY || '';
    this.secret = secret || process.env.HOTELBEDS_SECRET || '';
  }

  private generateSignature(): string {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = require('crypto')
      .createHash('sha256')
      .update(this.apiKey + this.secret + timestamp)
      .digest('hex');
    return signature;
  }

  private getHeaders(): Record<string, string> {
    const signature = this.generateSignature();
    return {
      'Api-key': this.apiKey,
      'X-Signature': signature,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Accept-Encoding': 'gzip',
    };
  }

  private async makeRequest<T>(options: RequestOptions): Promise<T> {
    const { method, endpoint, body, cache = 'force-cache', revalidate: _revalidate } = options;
    const requestOptions: RequestInit = {
      method,
      headers: this.getHeaders(),
      cache,
    };
    if (body) requestOptions.body = JSON.stringify(body);
    const response = await fetch(`${HOTELBEDS_ACTIVITIES_API_BASE}${endpoint}`, requestOptions);
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorData}`);
    }
    return response.json();
  }

  async searchActivities(searchParams: ActivitySearchRequest, useCache = true): Promise<any> {
    return this.makeRequest({
      method: 'POST',
      endpoint: '/3.0/activities/search',
      body: searchParams,
      cache: useCache ? 'force-cache' : 'no-store',
      revalidate: useCache ? 300 : undefined,
    });
  }

  async getActivityDetails(activityCode: string, useCache = true): Promise<any> {
    return this.makeRequest({
      method: 'GET',
      endpoint: `/3.0/activities/${activityCode}`,
      cache: useCache ? 'force-cache' : 'no-store',
      revalidate: useCache ? 3600 : undefined,
    });
  }

  async checkActivityAvailability(
    activityCode: string,
    date: string,
    paxes: ActivityPax[],
  ): Promise<any> {
    return this.makeRequest({
      method: 'POST',
      endpoint: `/3.0/activities/${activityCode}/availability`,
      body: { date, paxes },
      cache: 'no-store',
    });
  }

  async bookActivity(bookingRequest: ActivityBookingRequest): Promise<any> {
    return this.makeRequest({
      method: 'POST',
      endpoint: '/3.0/bookings',
      body: bookingRequest,
      cache: 'no-store',
    });
  }

  async getBooking(reference: string): Promise<any> {
    return this.makeRequest({
      method: 'GET',
      endpoint: `/3.0/bookings/${reference}`,
      cache: 'no-store',
    });
  }

  async cancelBooking(reference: string): Promise<any> {
    return this.makeRequest({
      method: 'DELETE',
      endpoint: `/3.0/bookings/${reference}`,
      cache: 'no-store',
    });
  }

  async getCategories(): Promise<any> {
    return this.makeRequest({
      method: 'GET',
      endpoint: '/3.0/activities/categories',
      cache: 'force-cache',
      revalidate: 86400,
    });
  }

  async getDestinations(): Promise<any> {
    return this.makeRequest({
      method: 'GET',
      endpoint: '/3.0/activities/destinations',
      cache: 'force-cache',
      revalidate: 86400,
    });
  }

  async searchEvents(params: any): Promise<any> {
    return this.makeRequest({
      method: 'POST',
      endpoint: '/3.0/events/search',
      body: params,
      cache: 'force-cache',
      revalidate: 300,
    });
  }

  async getEventDetails(eventId: string): Promise<any> {
    return this.makeRequest({
      method: 'GET',
      endpoint: `/3.0/events/${eventId}`,
      cache: 'force-cache',
      revalidate: 3600,
    });
  }

  async getTicketTypes(eventId: string): Promise<any> {
    return this.makeRequest({
      method: 'GET',
      endpoint: `/3.0/events/${eventId}/tickettypes`,
      cache: 'force-cache',
      revalidate: 3600,
    });
  }

  async purchaseTickets(purchaseRequest: any): Promise<any> {
    return this.makeRequest({
      method: 'POST',
      endpoint: '/3.0/tickets/purchase',
      body: purchaseRequest,
      cache: 'no-store',
    });
  }
}
