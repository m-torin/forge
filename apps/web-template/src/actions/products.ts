'use server';

// App-specific actions for events and locations that aren't in the database schema yet

import { unstable_cache } from 'next/cache';

// Server action to get events (placeholder until Event model is added)
export async function getEvents() {
  'use server';

  const cached = unstable_cache(
    async () => {
      // Mock events data until Event model is added to schema
      return [
        {
          id: 'event-1',
          name: 'Summer Sale 2024',
          description: 'Get up to 50% off on summer collection',
          endDate: new Date('2024-08-31'),
          slug: 'summer-sale-2024',
          startDate: new Date('2024-06-01'),
        },
        {
          id: 'event-2',
          name: 'Black Friday',
          description: 'Biggest sale of the year',
          endDate: new Date('2024-11-29'),
          slug: 'black-friday',
          startDate: new Date('2024-11-29'),
        },
      ];
    },
    ['events'],
    {
      revalidate: 3600,
      tags: ['events'],
    },
  );

  return cached();
}

// Server action to get locations (placeholder until Location model is added)
export async function getLocations() {
  'use server';

  const cached = unstable_cache(
    async () => {
      // Mock locations data until Location model is added to schema
      return [
        {
          id: 'loc-1',
          name: 'New York Store',
          address: '123 5th Avenue, New York, NY 10001',
          coordinates: { lat: 40.7128, lng: -74.006 },
          country: 'USA',
          slug: 'new-york',
        },
        {
          id: 'loc-2',
          name: 'Los Angeles Store',
          address: '456 Sunset Blvd, Los Angeles, CA 90028',
          coordinates: { lat: 34.0522, lng: -118.2437 },
          country: 'USA',
          slug: 'los-angeles',
        },
        {
          id: 'loc-3',
          name: 'London Store',
          address: '789 Oxford Street, London, UK',
          coordinates: { lat: 51.5074, lng: -0.1278 },
          country: 'UK',
          slug: 'london',
        },
      ];
    },
    ['locations'],
    {
      revalidate: 3600,
      tags: ['locations'],
    },
  );

  return cached();
}
