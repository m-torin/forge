/**
 * Example usage of the Hotelbeds integration
 */

import { HotelbedsHotelsAPI } from '../src/hotelbeds';

async function exampleUsage() {
  // Initialize the API client
  const client = new HotelbedsHotelsAPI();

  try {
    // Search for hotels in Orlando
    const searchResult = await client.searchHotels({
      destination: 'MCO', // Orlando
      checkIn: '2024-06-01',
      checkOut: '2024-06-05',
      rooms: 1,
      adults: 2,
      children: 1,
    });

    console.log('Search result:', searchResult);

    // Check availability
    const availability = await client.checkAvailability(
      '12345', // hotel code
      '2024-06-01',
      '2024-06-05',
      1, // rooms
      2, // adults
      1, // children
    );

    console.log('Availability:', availability);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example
exampleUsage();
