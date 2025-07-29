import { type Prisma } from '../../../../../prisma-generated/client';

export interface LocationData {
  name: string;
  slug: string;
  type: 'CITY' | 'COUNTRY' | 'FICTIONAL' | 'REGION';
  country?: string;
  description: string;
  metadata?: Record<string, any>;
}

export const SEED_LOCATIONS: LocationData[] = [
  // Major Cities
  {
    name: 'London',
    slug: 'london',
    type: 'CITY',
    country: 'United Kingdom',
    description:
      'The capital city of England and the United Kingdom, known for fashion, culture, and history.',
    metadata: {
      population: 9000000,
      timezone: 'GMT',
      coordinates: { lat: 51.5074, lng: -0.1278 },
    },
  },
  {
    name: 'Baltimore',
    slug: 'baltimore',
    type: 'CITY',
    country: 'United States',
    description: 'A major city in Maryland known for its historic seaport and vibrant culture.',
    metadata: {
      population: 600000,
      timezone: 'EST',
      coordinates: { lat: 39.2904, lng: -76.6122 },
    },
  },
  {
    name: 'Tokyo',
    slug: 'tokyo',
    type: 'CITY',
    country: 'Japan',
    description:
      'The capital of Japan, a bustling metropolis blending modern and traditional culture.',
    metadata: {
      population: 14000000,
      timezone: 'JST',
      coordinates: { lat: 35.6762, lng: 139.6503 },
    },
  },
  {
    name: 'Paris',
    slug: 'paris',
    type: 'CITY',
    country: 'France',
    description: 'The City of Light, renowned for fashion, art, and cuisine.',
    metadata: {
      population: 2200000,
      timezone: 'CET',
      coordinates: { lat: 48.8566, lng: 2.3522 },
    },
  },
  {
    name: 'New York',
    slug: 'new-york',
    type: 'CITY',
    country: 'United States',
    description: 'The Big Apple, a global hub for finance, arts, and fashion.',
    metadata: {
      population: 8300000,
      timezone: 'EST',
      coordinates: { lat: 40.7128, lng: -74.006 },
    },
  },
  // Fictional Locations
  {
    name: 'Neverland',
    slug: 'neverland',
    type: 'FICTIONAL',
    description: 'The magical island where children never grow up, from Peter Pan.',
    metadata: {
      source: 'Peter Pan',
      features: ['Mermaid Lagoon', 'Skull Rock', "Hangman's Tree"],
    },
  },
  {
    name: 'Gotham City',
    slug: 'gotham-city',
    type: 'FICTIONAL',
    country: 'United States',
    description: 'The dark metropolitan home of Batman, plagued by crime and corruption.',
    metadata: {
      source: 'DC Comics',
      notableLocations: ['Wayne Manor', 'Arkham Asylum', 'Crime Alley'],
    },
  },
  {
    name: 'Wakanda',
    slug: 'wakanda',
    type: 'FICTIONAL',
    description: 'A technologically advanced African nation, home of Black Panther.',
    metadata: {
      source: 'Marvel Comics',
      features: ['Vibranium mines', 'Golden City', 'Warrior Falls'],
    },
  },
  {
    name: 'Middle-earth',
    slug: 'middle-earth',
    type: 'FICTIONAL',
    description: 'The fantasy world created by J.R.R. Tolkien, setting of The Lord of the Rings.',
    metadata: {
      source: 'J.R.R. Tolkien',
      regions: ['The Shire', 'Gondor', 'Mordor', 'Rivendell'],
    },
  },
  // Regions
  {
    name: 'Silicon Valley',
    slug: 'silicon-valley',
    type: 'REGION',
    country: 'United States',
    description: 'The global center for technology and innovation in California.',
    metadata: {
      state: 'California',
      majorCities: ['San Jose', 'Palo Alto', 'Mountain View'],
    },
  },
  {
    name: 'The Cotswolds',
    slug: 'cotswolds',
    type: 'REGION',
    country: 'United Kingdom',
    description: 'An area of outstanding natural beauty in south-central England.',
    metadata: {
      area: 'South Central England',
      features: ['Rolling hills', 'Stone villages', 'Historic market towns'],
    },
  },
];

export function createLocation(location: LocationData): Prisma.LocationCreateInput {
  // Map location type to LocationType enum
  const locationTypeMap: Record<string, any> = {
    CITY: 'PLACE',
    COUNTRY: 'PLACE',
    REGION: 'PLACE',
    FICTIONAL: 'PLACE',
  };

  return {
    name: location.name,
    slug: location.slug,
    locationType: locationTypeMap[location.type] || 'PLACE',
    isFictional: location.type === 'FICTIONAL',
    copy: {
      description: location.description,
      country: location.country,
      type: location.type,
      ...location.metadata,
    },
  };
}
