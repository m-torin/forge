import { createLocation, SEED_LOCATIONS } from '#/prisma/src/seed/mappers/location-mapper';
import { describe, expect, it } from 'vitest';

describe('location-mapper', () => {
  describe('createLocation', () => {
    it('creates location with correct structure', () => {
      const locationData = {
        name: 'Test City',
        slug: 'test-city',
        type: 'CITY' as const,
        country: 'United States',
        description: 'A test city',
        metadata: {
          population: 100000,
          timezone: 'EST',
        },
      };

      const result = createLocation(locationData);

      expect(result.name).toBe('Test City');
      expect(result.slug).toBe('test-city');
      expect(result.locationType).toBe('PLACE');
      expect(result.isFictional).toBe(false);
      expect((result.copy as any)?.description).toBe('A test city');
      expect((result.copy as any)?.country).toBe('United States');
      expect((result.copy as any)?.population).toBe(100000);
    });

    it('handles fictional locations', () => {
      const fictionalLocation = {
        name: 'Neverland',
        slug: 'neverland',
        type: 'FICTIONAL' as const,
        description: 'A magical place',
        metadata: {
          source: 'Peter Pan',
        },
      };

      const result = createLocation(fictionalLocation);

      expect(result.isFictional).toBe(true);
      expect((result.copy as any)?.source).toBe('Peter Pan');
    });

    // Enhanced comprehensive test coverage
    it('handles all location types correctly', () => {
      const types = ['CITY', 'COUNTRY', 'FICTIONAL', 'REGION'] as const;

      types.forEach(type => {
        const locationData = {
          name: `Test ${type}`,
          slug: `test-${type.toLowerCase()}`,
          type,
          description: `A test ${type.toLowerCase()}`,
          metadata: { test: true },
        };

        const result = createLocation(locationData);

        expect(result.locationType).toBe('PLACE');
        expect(result.isFictional).toBe(type === 'FICTIONAL');
        expect((result.copy as any)?.type).toBe(type);
      });
    });

    it('handles missing country field', () => {
      const locationData = {
        name: 'Test Location',
        slug: 'test-location',
        type: 'FICTIONAL' as const,
        description: 'A test location without country',
      };

      const result = createLocation(locationData);

      expect((result.copy as any)?.country).toBeUndefined();
      expect(result.isFictional).toBe(true);
    });

    it('handles missing metadata', () => {
      const locationData = {
        name: 'Test Location',
        slug: 'test-location',
        type: 'CITY' as const,
        country: 'United States',
        description: 'A test location',
      };

      const result = createLocation(locationData);

      expect((result.copy as any)?.description).toBe('A test location');
      expect((result.copy as any)?.country).toBe('United States');
      expect((result.copy as any)?.type).toBe('CITY');
      // Should not have any metadata fields
      expect((result.copy as any)?.population).toBeUndefined();
      expect((result.copy as any)?.timezone).toBeUndefined();
    });

    it('handles empty description', () => {
      const locationData = {
        name: 'Test Location',
        slug: 'test-location',
        type: 'CITY' as const,
        country: 'United States',
        description: '',
      };

      const result = createLocation(locationData);

      expect((result.copy as any)?.description).toBe('');
    });

    it('handles very long descriptions', () => {
      const longDescription = 'A'.repeat(2000);
      const locationData = {
        name: 'Test Location',
        slug: 'test-location',
        type: 'CITY' as const,
        country: 'United States',
        description: longDescription,
      };

      const result = createLocation(locationData);

      expect((result.copy as any)?.description).toBe(longDescription);
    });

    it('handles special characters in names and descriptions', () => {
      const locationData = {
        name: 'São Paulo & Co.',
        slug: 'sao-paulo-co',
        type: 'CITY' as const,
        country: 'Brasil',
        description: 'City with special chars: ñ, é, ü, &, @, #, $, %, *, ()',
        metadata: { population: 12000000 },
      };

      const result = createLocation(locationData);

      expect(result.name).toBe('São Paulo & Co.');
      expect((result.copy as any)?.description).toBe(
        'City with special chars: ñ, é, ü, &, @, #, $, %, *, ()',
      );
      expect((result.copy as any)?.country).toBe('Brasil');
    });

    it('handles complex metadata structures', () => {
      const complexMetadata = {
        population: 1000000,
        timezone: 'UTC+1',
        coordinates: { lat: 40.7128, lng: -74.006 },
        features: ['Museum', 'Park', 'Restaurant'],
        nested: {
          district: 'Downtown',
          landmarks: ['City Hall', 'Central Park'],
        },
        array: [1, 2, 3, 4, 5],
        boolean: true,
        nullValue: null,
      };

      const locationData = {
        name: 'Test City',
        slug: 'test-city',
        type: 'CITY' as const,
        country: 'United States',
        description: 'A test city',
        metadata: complexMetadata,
      };

      const result = createLocation(locationData);

      expect((result.copy as any)?.population).toBe(1000000);
      expect((result.copy as any)?.timezone).toBe('UTC+1');
      expect((result.copy as any)?.coordinates).toStrictEqual({ lat: 40.7128, lng: -74.006 });
      expect((result.copy as any)?.features).toStrictEqual(['Museum', 'Park', 'Restaurant']);
      expect((result.copy as any)?.nested).toStrictEqual({
        district: 'Downtown',
        landmarks: ['City Hall', 'Central Park'],
      });
      expect((result.copy as any)?.array).toStrictEqual([1, 2, 3, 4, 5]);
      expect((result.copy as any)?.boolean).toBe(true);
      expect((result.copy as any)?.nullValue).toBeNull();
    });

    it('handles numeric metadata values', () => {
      const locationData = {
        name: 'Test City',
        slug: 'test-city',
        type: 'CITY' as const,
        country: 'United States',
        description: 'A test city',
        metadata: {
          population: 0,
          area: 123.456,
          elevation: -100,
          temperature: 25.5,
        },
      };

      const result = createLocation(locationData);

      expect((result.copy as any)?.population).toBe(0);
      expect((result.copy as any)?.area).toBe(123.456);
      expect((result.copy as any)?.elevation).toBe(-100);
      expect((result.copy as any)?.temperature).toBe(25.5);
    });

    it('handles boolean and null metadata values', () => {
      const locationData = {
        name: 'Test City',
        slug: 'test-city',
        type: 'CITY' as const,
        country: 'United States',
        description: 'A test city',
        metadata: {
          isCapital: true,
          hasAirport: false,
          population: null,
          description: null,
        },
      };

      const result = createLocation(locationData);

      expect((result.copy as any)?.isCapital).toBe(true);
      expect((result.copy as any)?.hasAirport).toBe(false);
      expect((result.copy as any)?.population).toBeNull();
      expect((result.copy as any)?.description).toBeNull();
    });

    it('handles unknown location type gracefully', () => {
      const locationData = {
        name: 'Test Location',
        slug: 'test-location',
        type: 'UNKNOWN' as any,
        description: 'A test location',
      };

      const result = createLocation(locationData);

      // Should default to 'PLACE' for unknown types
      expect(result.locationType).toBe('PLACE');
      expect(result.isFictional).toBe(false);
    });

    it('preserves all required fields in output', () => {
      const locationData = {
        name: 'Test Location',
        slug: 'test-location',
        type: 'CITY' as const,
        country: 'United States',
        description: 'A test location',
        metadata: { population: 100000 },
      };

      const result = createLocation(locationData);

      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('slug');
      expect(result).toHaveProperty('locationType');
      expect(result).toHaveProperty('isFictional');
      expect(result).toHaveProperty('copy');
      expect(result.copy).toHaveProperty('description');
      expect(result.copy).toHaveProperty('country');
      expect(result.copy).toHaveProperty('type');
      expect(result.copy).toHaveProperty('population');
    });

    it('generates consistent results for same input', () => {
      const locationData = {
        name: 'Test City',
        slug: 'test-city',
        type: 'CITY' as const,
        country: 'United States',
        description: 'A test city',
        metadata: { population: 100000 },
      };

      const result1 = createLocation(locationData);
      const result2 = createLocation(locationData);

      expect(result1.name).toBe(result2.name);
      expect(result1.slug).toBe(result2.slug);
      expect(result1.locationType).toBe(result2.locationType);
      expect(result1.isFictional).toBe(result2.isFictional);
      expect(result1.copy).toStrictEqual(result2.copy);
    });

    it('handles edge case with empty strings', () => {
      const locationData = {
        name: '',
        slug: '',
        type: 'CITY' as const,
        country: '',
        description: '',
        metadata: {},
      };

      const result = createLocation(locationData);

      expect(result.name).toBe('');
      expect(result.slug).toBe('');
      expect((result.copy as any)?.country).toBe('');
      expect((result.copy as any)?.description).toBe('');
    });

    it('handles very long names and slugs', () => {
      const longName = 'A'.repeat(500);
      const longSlug = 'b'.repeat(500);

      const locationData = {
        name: longName,
        slug: longSlug,
        type: 'CITY' as const,
        country: 'United States',
        description: 'A test city',
      };

      const result = createLocation(locationData);

      expect(result.name).toBe(longName);
      expect(result.slug).toBe(longSlug);
    });

    it('handles unicode characters in all fields', () => {
      const locationData = {
        name: '北京 (Beijing)',
        slug: 'beijing-china',
        type: 'CITY' as const,
        country: '中国 (China)',
        description: '首都 (Capital) with 汉字 (Chinese characters)',
        metadata: {
          population: 21540000,
          language: '中文 (Chinese)',
        },
      };

      const result = createLocation(locationData);

      expect(result.name).toBe('北京 (Beijing)');
      expect((result.copy as any)?.country).toBe('中国 (China)');
      expect((result.copy as any)?.description).toBe(
        '首都 (Capital) with 汉字 (Chinese characters)',
      );
      expect((result.copy as any)?.language).toBe('中文 (Chinese)');
    });
  });

  describe('SEED_LOCATIONS', () => {
    it('contains expected locations', () => {
      expect(SEED_LOCATIONS.length).toBeGreaterThan(0);
    });

    it('has cities', () => {
      const cities = SEED_LOCATIONS.filter(loc => loc.type === 'CITY');
      expect(cities.length).toBeGreaterThan(0);
      expect(cities.some(city => city.name === 'London')).toBe(true);
      expect(cities.some(city => city.name === 'New York')).toBe(true);
    });

    it('has fictional locations', () => {
      const fictional = SEED_LOCATIONS.filter(loc => loc.type === 'FICTIONAL');
      expect(fictional.length).toBeGreaterThan(0);
      expect(fictional.some(loc => loc.name === 'Neverland')).toBe(true);
    });

    it('has regions', () => {
      const regions = SEED_LOCATIONS.filter(loc => loc.type === 'REGION');
      expect(regions.length).toBeGreaterThan(0);
      expect(regions.some(region => region.name === 'Silicon Valley')).toBe(true);
    });

    // Enhanced seed data validation
    it('has valid structure for all locations', () => {
      SEED_LOCATIONS.forEach(location => {
        expect(location).toHaveProperty('name');
        expect(location).toHaveProperty('slug');
        expect(location).toHaveProperty('type');
        expect(location).toHaveProperty('description');
        expect(location.name).toBeTruthy();
        expect(location.slug).toBeTruthy();
        expect(location.description).toBeTruthy();
        expect(['CITY', 'COUNTRY', 'FICTIONAL', 'REGION']).toContain(location.type);
      });
    });

    it('has unique slugs', () => {
      const slugs = SEED_LOCATIONS.map(loc => loc.slug);
      const uniqueSlugs = new Set(slugs);
      expect(uniqueSlugs.size).toBe(slugs.length);
    });

    it('has unique names', () => {
      const names = SEED_LOCATIONS.map(loc => loc.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });

    it('has valid metadata structure where present', () => {
      SEED_LOCATIONS.forEach(location => {
        if (location.metadata) {
          expect(typeof location.metadata).toBe('object');
          expect(location.metadata).not.toBeNull();
        }
      });
    });

    it('has reasonable population values where present', () => {
      SEED_LOCATIONS.forEach(location => {
        if (location.metadata?.population) {
          expect(typeof location.metadata.population).toBe('number');
          expect(location.metadata.population).toBeGreaterThan(0);
          expect(location.metadata.population).toBeLessThan(100000000); // Sanity check
        }
      });
    });

    it('has valid coordinates where present', () => {
      SEED_LOCATIONS.forEach(location => {
        if (location.metadata?.coordinates) {
          expect(location.metadata.coordinates).toHaveProperty('lat');
          expect(location.metadata.coordinates).toHaveProperty('lng');
          expect(typeof location.metadata.coordinates.lat).toBe('number');
          expect(typeof location.metadata.coordinates.lng).toBe('number');
          expect(location.metadata.coordinates.lat).toBeGreaterThanOrEqual(-90);
          expect(location.metadata.coordinates.lat).toBeLessThanOrEqual(90);
          expect(location.metadata.coordinates.lng).toBeGreaterThanOrEqual(-180);
          expect(location.metadata.coordinates.lng).toBeLessThanOrEqual(180);
        }
      });
    });

    it('has valid timezone values where present', () => {
      const validTimezones = ['GMT', 'EST', 'CST', 'MST', 'PST', 'JST', 'CET', 'UTC'];
      SEED_LOCATIONS.forEach(location => {
        if (location.metadata?.timezone) {
          expect(typeof location.metadata.timezone).toBe('string');
          expect(location.metadata.timezone).toBeTruthy();
        }
      });
    });

    it('has fictional locations marked correctly', () => {
      const fictional = SEED_LOCATIONS.filter(loc => loc.type === 'FICTIONAL');
      fictional.forEach(location => {
        // Fictional locations should have appropriate metadata
        if (location.metadata) {
          expect(location.metadata).toHaveProperty('source');
          expect(location.metadata.source).toBeTruthy();
        }
      });
    });

    it('has cities with country information', () => {
      const cities = SEED_LOCATIONS.filter(loc => loc.type === 'CITY');
      cities.forEach(city => {
        expect(city.country).toBeTruthy();
        expect(typeof city.country).toBe('string');
      });
    });

    it('has reasonable description lengths', () => {
      SEED_LOCATIONS.forEach(location => {
        expect(location.description.length).toBeGreaterThan(10);
        expect(location.description.length).toBeLessThan(1000);
      });
    });
  });
});
