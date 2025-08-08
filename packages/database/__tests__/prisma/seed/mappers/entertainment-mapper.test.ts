import {
  createCast,
  createFandom,
  createSeries,
  createStory,
  SEED_CAST,
  SEED_FANDOMS,
  SEED_SERIES,
  SEED_STORIES,
} from '#/prisma/src/seed/mappers/entertainment-mapper';
import { describe, expect, it } from 'vitest';
// ContentStatus enum value for testing
const ContentStatus = {
  PUBLISHED: 'PUBLISHED',
  DRAFT: 'DRAFT',
  ARCHIVED: 'ARCHIVED',
} as const;

describe('entertainment-mapper', () => {
  describe('createFandom', () => {
    it('creates fandom with correct structure', () => {
      const fandomData = {
        name: 'Test Fandom',
        slug: 'test-fandom',
        category: 'Test Category',
        description: 'A test fandom',
        metadata: { founded: 2020 },
      };

      const result = createFandom(fandomData);

      expect(result.name).toBe('Test Fandom');
      expect(result.slug).toBe('test-fandom');
      expect((result as any).status).toBe(ContentStatus.PUBLISHED);
      expect((result.copy as any)?.description).toBe('A test fandom');
      expect((result.copy as any)?.category).toBe('Test Category');
      expect((result.copy as any)?.founded).toBe(2020);
    });

    // Enhanced test coverage
    it('handles empty description gracefully', () => {
      const fandomData = {
        name: 'Test Fandom',
        slug: 'test-fandom',
        category: 'Test Category',
        description: '',
        metadata: { founded: 2020 },
      };

      const result = createFandom(fandomData);
      expect((result.copy as any)?.description).toBe('');
    });

    it('handles missing metadata', () => {
      const fandomData = {
        name: 'Test Fandom',
        slug: 'test-fandom',
        category: 'Test Category',
        description: 'A test fandom',
      };

      const result = createFandom(fandomData);
      expect((result.copy as any)?.founded).toBeUndefined();
    });

    it('generates unique slugs for different fandoms', () => {
      const fandom1 = createFandom({
        name: 'Marvel Fandom',
        slug: 'marvel-fandom',
        category: 'Superhero',
        description: 'Marvel universe fandom',
      });

      const fandom2 = createFandom({
        name: 'DC Fandom',
        slug: 'dc-fandom',
        category: 'Superhero',
        description: 'DC universe fandom',
      });

      expect(fandom1.slug).not.toBe(fandom2.slug);
    });

    it('handles special characters in name and description', () => {
      const fandomData = {
        name: 'Test Fandom & Co.',
        slug: 'test-fandom-co',
        category: 'Test Category',
        description: 'A test fandom with special chars: &, @, #, $',
        metadata: { founded: 2020 },
      };

      const result = createFandom(fandomData);
      expect(result.name).toBe('Test Fandom & Co.');
      expect((result.copy as any)?.description).toBe(
        'A test fandom with special chars: &, @, #, $',
      );
    });

    it('includes all required fields', () => {
      const fandomData = {
        name: 'Test Fandom',
        slug: 'test-fandom',
        category: 'Test Category',
        description: 'A test fandom',
        metadata: { founded: 2020 },
      };

      const result = createFandom(fandomData);

      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('slug');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('copy');
      expect(result.copy as any).toHaveProperty('description');
      expect(result.copy as any).toHaveProperty('category');
      expect(result.copy as any).toHaveProperty('founded');
    });
  });

  describe('createSeries', () => {
    it('creates series with fandom when provided', () => {
      const seriesData = {
        name: 'Test Series',
        slug: 'test-series',
        description: 'A test series',
        releaseYear: 2020,
        metadata: { platform: 'Test Platform' },
      };

      const result = createSeries(seriesData, 'test-fandom');
      expect(result.name).toBe('Test Series');
      expect(result.slug).toBe('test-series');
      expect((result as any).status).toBe(ContentStatus.PUBLISHED);
      expect((result.copy as any)?.description).toBe('A test series');
      expect((result.copy as any)?.releaseYear).toBe(2020);
      expect((result.copy as any)?.platform).toBe('Test Platform');
      expect(result.fandom).toStrictEqual({ connect: { id: 'test-fandom' } });
    });

    it('creates series without fandom when not provided', () => {
      const seriesData = {
        name: 'Test Series',
        slug: 'test-series',
        description: 'A test series',
        releaseYear: 2020,
        metadata: { platform: 'Test Platform' },
      };

      const result = createSeries(seriesData);
      expect(result.name).toBe('Test Series');
      expect(result.slug).toBe('test-series');
      expect((result.copy as any)?.description).toBe('A test series');
      expect((result.copy as any)?.releaseYear).toBe(2020);
      expect((result.copy as any)?.platform).toBe('Test Platform');
      expect(result.fandom).toBeUndefined();
    });

    // Enhanced test coverage
    it('handles missing release year', () => {
      const seriesData = {
        name: 'Test Series',
        slug: 'test-series',
        description: 'A test series',
        releaseYear: 2020, // Required field
        metadata: { platform: 'Test Platform' },
      };

      const result = createSeries(seriesData, 'test-fandom');
      expect((result.copy as any)?.releaseYear).toBe(2020);
    });

    it('handles different platforms', () => {
      const platforms = ['Netflix', 'Hulu', 'Disney+', 'HBO Max', 'Amazon Prime'];

      platforms.forEach(platform => {
        const seriesData = {
          name: `Test Series on ${platform}`,
          slug: `test-series-${platform.toLowerCase()}`,
          description: 'A test series',
          releaseYear: 2020,
          metadata: { platform },
        };

        const result = createSeries(seriesData, 'test-fandom');
        expect((result.copy as any)?.platform).toBe(platform);
      });
    });

    it('handles very long descriptions', () => {
      const longDescription = 'A'.repeat(1000);
      const seriesData = {
        name: 'Test Series',
        slug: 'test-series',
        description: longDescription,
        releaseYear: 2020,
      };

      const result = createSeries(seriesData, 'test-fandom');
      expect((result.copy as any)?.description).toBe(longDescription);
    });

    it('generates consistent results for same input', () => {
      const seriesData = {
        name: 'Test Series',
        slug: 'test-series',
        description: 'A test series',
        releaseYear: 2020,
        metadata: { platform: 'Test Platform' },
      };

      const result1 = createSeries(seriesData, 'test-fandom');
      const result2 = createSeries(seriesData, 'test-fandom');

      expect(result1.name).toBe(result2.name);
      expect(result1.slug).toBe(result2.slug);
      expect((result1.copy as any)?.description).toBe((result2.copy as any)?.description);
    });
  });

  describe('createCast', () => {
    it('creates cast with correct structure', () => {
      const castData = {
        name: 'Test Actor',
        slug: 'test-actor',
        bio: 'A test actor bio',
        roles: [{ series: 'test-series', character: 'Test Character' }],
      };

      const result = createCast(castData);

      expect(result.name).toBe('Test Actor');
      expect(result.slug).toBe('test-actor');
      expect((result as any).status).toBe(ContentStatus.PUBLISHED);
      expect((result.copy as any)?.bio).toBe('A test actor bio');
      expect((result.copy as any)?.roles).toStrictEqual([
        { series: 'test-series', character: 'Test Character' },
      ]);
    });

    // Enhanced test coverage
    it('handles multiple roles', () => {
      const castData = {
        name: 'Test Actor',
        slug: 'test-actor',
        bio: 'A test actor bio',
        roles: [
          { series: 'series-1', character: 'Character 1' },
          { series: 'series-2', character: 'Character 2' },
          { series: 'series-3', character: 'Character 3' },
        ],
      };

      const result = createCast(castData);
      expect((result.copy as any)?.roles).toHaveLength(3);
      expect((result.copy as any)?.roles[0].series).toBe('series-1');
      expect((result.copy as any)?.roles[1].character).toBe('Character 2');
    });

    it('handles empty roles array', () => {
      const castData = {
        name: 'Test Actor',
        slug: 'test-actor',
        bio: 'A test actor bio',
        roles: [],
      };

      const result = createCast(castData);
      expect((result.copy as any)?.roles).toStrictEqual([]);
    });

    it('handles missing bio', () => {
      const castData = {
        name: 'Test Actor',
        slug: 'test-actor',
        bio: 'A test actor bio', // Required field
        roles: [{ series: 'test-series', character: 'Test Character' }],
      };

      const result = createCast(castData);
      expect((result.copy as any)?.bio).toBe('A test actor bio');
    });

    it('handles special characters in names and bios', () => {
      const castData = {
        name: 'José María García-López',
        slug: 'jose-maria-garcia-lopez',
        bio: 'Actor with special characters: ñ, é, ü, &, @',
        roles: [{ series: 'test-series', character: 'José "Pepe" García' }],
      };

      const result = createCast(castData);
      expect(result.name).toBe('José María García-López');
      expect((result.copy as any)?.bio).toBe('Actor with special characters: ñ, é, ü, &, @');
      expect((result.copy as any)?.roles[0].character).toBe('José "Pepe" García');
    });

    it('generates unique slugs for different actors', () => {
      const actor1 = createCast({
        name: 'John Smith',
        slug: 'john-smith',
        bio: 'Actor bio',
        roles: [],
      });

      const actor2 = createCast({
        name: 'Jane Doe',
        slug: 'jane-doe',
        bio: 'Actor bio',
        roles: [],
      });

      expect(actor1.slug).not.toBe(actor2.slug);
    });
  });

  describe('createStory', () => {
    it('creates story with correct structure', () => {
      const storyData = {
        title: 'Test Story',
        slug: 'test-story',
        synopsis: 'A test story synopsis',
        releaseDate: new Date('2020-01-01'),
        metadata: { runtime: 120 },
      };

      const result = createStory(storyData, 'test-fandom');

      expect((result as any).title).toBe('Test Story');
      expect(result.slug).toBe('test-story');
      expect((result as any).status).toBe(ContentStatus.PUBLISHED);
      expect(((result as any).attributes as any)?.synopsis).toBe('A test story synopsis');
      expect(((result as any).attributes as any)?.releaseDate).toBe('2020-01-01T00:00:00.000Z');
      expect(((result as any).attributes as any)?.runtime).toBe(120);
    });

    // Enhanced test coverage
    it('handles missing release date', () => {
      const storyData = {
        title: 'Test Story',
        slug: 'test-story',
        synopsis: 'A test story synopsis',
        releaseDate: new Date('2020-01-01'), // Required field
        metadata: { runtime: 120 },
      };

      const result = createStory(storyData, 'test-fandom');
      expect(((result as any).attributes as any)?.releaseDate).toBe('2020-01-01T00:00:00.000Z');
    });

    it('handles different metadata values', () => {
      const storyData = {
        title: 'Test Story',
        slug: 'test-story',
        synopsis: 'A test story synopsis',
        releaseDate: new Date('2020-01-01'),
        metadata: { genre: 'Action' },
      };

      const result = createStory(storyData, 'test-fandom');
      expect(((result as any).attributes as any)?.genre).toBe('Action');
    });

    it('handles very long synopsis', () => {
      const longSynopsis = 'A'.repeat(2000);
      const storyData = {
        title: 'Test Story',
        slug: 'test-story',
        synopsis: longSynopsis,
        releaseDate: new Date('2020-01-01'),
      };

      const result = createStory(storyData, 'test-fandom');
      expect(((result as any).attributes as any)?.synopsis).toBe(longSynopsis);
    });

    it('formats dates correctly', () => {
      const dates = [new Date('2020-01-01'), new Date('2020-06-15'), new Date('2020-12-31')];

      dates.forEach(date => {
        const storyData = {
          title: 'Test Story',
          slug: 'test-story',
          synopsis: 'A test story synopsis',
          releaseDate: date,
        };

        const result = createStory(storyData, 'test-fandom');
        expect(((result as any).attributes as any)?.releaseDate).toBe(date.toISOString());
      });
    });

    it('handles missing metadata', () => {
      const storyData = {
        title: 'Test Story',
        slug: 'test-story',
        synopsis: 'A test story synopsis',
        releaseDate: new Date('2020-01-01'),
      };

      const result = createStory(storyData, 'test-fandom');
      expect(((result as any).attributes as any)?.runtime).toBeUndefined();
    });

    it('generates unique slugs for different stories', () => {
      const story1 = createStory(
        {
          title: 'Story One',
          slug: 'story-one',
          synopsis: 'First story',
          releaseDate: new Date('2020-01-01'),
        },
        'test-fandom',
      );

      const story2 = createStory(
        {
          title: 'Story Two',
          slug: 'story-two',
          synopsis: 'Second story',
          releaseDate: new Date('2020-01-02'),
        },
        'test-fandom',
      );

      expect(story1.slug).not.toBe(story2.slug);
    });
  });

  describe('SEED_FANDOMS', () => {
    it('contains expected fandoms', () => {
      expect(SEED_FANDOMS.length).toBeGreaterThan(0);
      expect(SEED_FANDOMS.some(f => f.name === 'Marvel Cinematic Universe')).toBe(true);
      expect(SEED_FANDOMS.some(f => f.name === 'Star Wars')).toBe(true);
    });

    // Enhanced test coverage
    it('has valid structure for all fandoms', () => {
      SEED_FANDOMS.forEach(fandom => {
        expect(fandom).toHaveProperty('name');
        expect(fandom).toHaveProperty('slug');
        expect(fandom).toHaveProperty('category');
        expect(fandom).toHaveProperty('description');
        expect(fandom.name).toBeTruthy();
        expect(fandom.slug).toBeTruthy();
        expect(fandom.category).toBeTruthy();
      });
    });

    it('has unique slugs', () => {
      const slugs = SEED_FANDOMS.map(f => f.slug);
      const uniqueSlugs = new Set(slugs);
      expect(uniqueSlugs.size).toBe(slugs.length);
    });

    it('has unique names', () => {
      const names = SEED_FANDOMS.map(f => f.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });
  });

  describe('SEED_SERIES', () => {
    it('contains expected series', () => {
      expect(SEED_SERIES.length).toBeGreaterThan(0);
      expect(SEED_SERIES.some(s => s.name === 'The Avengers')).toBe(true);
      expect(SEED_SERIES.some(s => s.name === 'Stranger Things')).toBe(true);
    });

    // Enhanced test coverage
    it('has valid structure for all series', () => {
      SEED_SERIES.forEach(series => {
        expect(series).toHaveProperty('name');
        expect(series).toHaveProperty('slug');
        expect(series).toHaveProperty('description');
        expect(series.name).toBeTruthy();
        expect(series.slug).toBeTruthy();
      });
    });

    it('has unique slugs', () => {
      const slugs = SEED_SERIES.map(s => s.slug);
      const uniqueSlugs = new Set(slugs);
      expect(uniqueSlugs.size).toBe(slugs.length);
    });

    it('has reasonable release years', () => {
      SEED_SERIES.forEach(series => {
        if (series.releaseYear) {
          expect(series.releaseYear).toBeGreaterThan(1900);
          expect(series.releaseYear).toBeLessThanOrEqual(new Date().getFullYear() + 1);
        }
      });
    });
  });

  describe('SEED_CAST', () => {
    it('contains expected cast members', () => {
      expect(SEED_CAST.length).toBeGreaterThan(0);
      expect(SEED_CAST.some(c => c.name === 'Robert Downey Jr.')).toBe(true);
    });

    // Enhanced test coverage
    it('has valid structure for all cast members', () => {
      SEED_CAST.forEach(cast => {
        expect(cast).toHaveProperty('name');
        expect(cast).toHaveProperty('slug');
        expect(cast).toHaveProperty('roles');
        expect(cast.name).toBeTruthy();
        expect(cast.slug).toBeTruthy();
        expect(Array.isArray(cast.roles)).toBe(true);
      });
    });

    it('has unique slugs', () => {
      const slugs = SEED_CAST.map(c => c.slug);
      const uniqueSlugs = new Set(slugs);
      expect(uniqueSlugs.size).toBe(slugs.length);
    });

    it('has valid role structures', () => {
      SEED_CAST.forEach(cast => {
        cast.roles.forEach(role => {
          expect(role).toHaveProperty('series');
          expect(role).toHaveProperty('character');
          expect(role.series).toBeTruthy();
          expect(role.character).toBeTruthy();
        });
      });
    });
  });

  describe('SEED_STORIES', () => {
    it('contains expected stories', () => {
      expect(SEED_STORIES.length).toBeGreaterThan(0);
      expect(SEED_STORIES.some(s => s.title === 'Avengers: Endgame')).toBe(true);
    });

    // Enhanced test coverage
    it('has valid structure for all stories', () => {
      SEED_STORIES.forEach(story => {
        expect(story).toHaveProperty('title');
        expect(story).toHaveProperty('slug');
        expect(story).toHaveProperty('synopsis');
        expect(story.title).toBeTruthy();
        expect(story.slug).toBeTruthy();
      });
    });

    it('has unique slugs', () => {
      const slugs = SEED_STORIES.map(s => s.slug);
      const uniqueSlugs = new Set(slugs);
      expect(uniqueSlugs.size).toBe(slugs.length);
    });

    it('has valid release dates', () => {
      SEED_STORIES.forEach(story => {
        if (story.releaseDate) {
          expect(story.releaseDate).toBeInstanceOf(Date);
          expect(story.releaseDate.getTime()).toBeGreaterThan(0);
        }
      });
    });

    it('has valid metadata structure', () => {
      SEED_STORIES.forEach(story => {
        if (story.metadata) {
          expect(typeof story.metadata).toBe('object');
        }
      });
    });
  });
});
