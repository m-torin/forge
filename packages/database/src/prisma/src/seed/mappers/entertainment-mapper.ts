import { type Prisma } from '../../../../../prisma-generated/client';

// Fandom data
export interface FandomData {
  name: string;
  slug: string;
  description: string;
  category: string;
  metadata?: Record<string, any>;
}

export const SEED_FANDOMS: FandomData[] = [
  {
    name: 'Marvel Cinematic Universe',
    slug: 'marvel-mcu',
    category: 'Superheroes',
    description: 'The interconnected universe of Marvel superhero films and shows.',
    metadata: {
      founded: 2008,
      studio: 'Marvel Studios',
      keyCharacters: ['Iron Man', 'Captain America', 'Thor', 'Black Widow'],
    },
  },
  {
    name: 'Star Wars',
    slug: 'star-wars',
    category: 'Science Fiction',
    description: 'The epic space opera franchise created by George Lucas.',
    metadata: {
      founded: 1977,
      creator: 'George Lucas',
      eras: ['Original Trilogy', 'Prequel Trilogy', 'Sequel Trilogy'],
    },
  },
  {
    name: 'Harry Potter',
    slug: 'harry-potter',
    category: 'Fantasy',
    description: 'The wizarding world created by J.K. Rowling.',
    metadata: {
      founded: 1997,
      creator: 'J.K. Rowling',
      houses: ['Gryffindor', 'Slytherin', 'Hufflepuff', 'Ravenclaw'],
    },
  },
  {
    name: 'Disney Princesses',
    slug: 'disney-princesses',
    category: 'Animation',
    description: 'The official lineup of Disney Princess characters.',
    metadata: {
      studio: 'Walt Disney Animation',
      princesses: ['Cinderella', 'Belle', 'Ariel', 'Moana', 'Elsa'],
    },
  },
  {
    name: 'Pokémon',
    slug: 'pokemon',
    category: 'Anime/Gaming',
    description: 'The multimedia franchise of collectible creatures.',
    metadata: {
      founded: 1996,
      creator: 'Satoshi Tajiri',
      regions: ['Kanto', 'Johto', 'Hoenn', 'Sinnoh'],
    },
  },
];

// Series data
export interface SeriesData {
  name: string;
  slug: string;
  fandomSlug?: string;
  description: string;
  releaseYear: number;
  metadata?: Record<string, any>;
}

export const SEED_SERIES: SeriesData[] = [
  // Marvel Series
  {
    name: 'The Avengers',
    slug: 'avengers',
    fandomSlug: 'marvel-mcu',
    description: "Earth's Mightiest Heroes unite to save the world.",
    releaseYear: 2012,
    metadata: {
      films: ['The Avengers', 'Age of Ultron', 'Infinity War', 'Endgame'],
      director: 'Joss Whedon / Russo Brothers',
    },
  },
  {
    name: 'Spider-Man',
    slug: 'spider-man',
    fandomSlug: 'marvel-mcu',
    description: 'The web-slinging adventures of Peter Parker.',
    releaseYear: 2017,
    metadata: {
      films: ['Homecoming', 'Far From Home', 'No Way Home'],
      actor: 'Tom Holland',
    },
  },
  // Star Wars Series
  {
    name: 'The Mandalorian',
    slug: 'mandalorian',
    fandomSlug: 'star-wars',
    description: 'A lone bounty hunter in the outer reaches of the galaxy.',
    releaseYear: 2019,
    metadata: {
      platform: 'Disney+',
      creator: 'Jon Favreau',
      famousLine: 'This is the way',
    },
  },
  // Harry Potter Series
  {
    name: 'Harry Potter Film Series',
    slug: 'harry-potter-films',
    fandomSlug: 'harry-potter',
    description: 'The boy who lived battles the dark wizard Voldemort.',
    releaseYear: 2001,
    metadata: {
      films: 8,
      director: 'Chris Columbus / David Yates',
    },
  },
  // Standalone Series
  {
    name: 'Stranger Things',
    slug: 'stranger-things',
    description: 'Kids in the 1980s encounter supernatural forces.',
    releaseYear: 2016,
    metadata: {
      platform: 'Netflix',
      creators: 'The Duffer Brothers',
      setting: 'Hawkins, Indiana',
    },
  },
];

// Cast data
export interface CastData {
  name: string;
  slug: string;
  bio: string;
  roles: Array<{ series: string; character: string }>;
}

export const SEED_CAST: CastData[] = [
  {
    name: 'Robert Downey Jr.',
    slug: 'robert-downey-jr',
    bio: 'Academy Award-nominated actor best known for playing Iron Man in the MCU.',
    roles: [{ series: 'avengers', character: 'Tony Stark / Iron Man' }],
  },
  {
    name: 'Scarlett Johansson',
    slug: 'scarlett-johansson',
    bio: 'Acclaimed actress known for her role as Black Widow.',
    roles: [{ series: 'avengers', character: 'Natasha Romanoff / Black Widow' }],
  },
  {
    name: 'Pedro Pascal',
    slug: 'pedro-pascal',
    bio: 'Chilean-American actor known for The Mandalorian and The Last of Us.',
    roles: [{ series: 'mandalorian', character: 'Din Djarin / The Mandalorian' }],
  },
  {
    name: 'Emma Watson',
    slug: 'emma-watson',
    bio: 'British actress and activist who portrayed Hermione Granger.',
    roles: [{ series: 'harry-potter-films', character: 'Hermione Granger' }],
  },
  {
    name: 'Millie Bobby Brown',
    slug: 'millie-bobby-brown',
    bio: 'Young actress who rose to fame as Eleven in Stranger Things.',
    roles: [{ series: 'stranger-things', character: 'Eleven' }],
  },
];

// Story data
export interface StoryData {
  title: string;
  slug: string;
  seriesSlug?: string;
  fandomSlug?: string;
  synopsis: string;
  releaseDate: Date;
  metadata?: Record<string, any>;
}

export const SEED_STORIES: StoryData[] = [
  {
    title: 'Avengers: Endgame',
    slug: 'avengers-endgame',
    seriesSlug: 'avengers',
    fandomSlug: 'marvel-mcu',
    synopsis:
      "The Avengers assemble one final time to undo Thanos' actions and restore balance to the universe.",
    releaseDate: new Date('2019-04-26'),
    metadata: {
      runtime: 181,
      boxOffice: '$2.798 billion',
      directors: 'Anthony and Joe Russo',
    },
  },
  {
    title: 'The Child Revealed',
    slug: 'mandalorian-child-revealed',
    seriesSlug: 'mandalorian',
    fandomSlug: 'star-wars',
    synopsis: 'The Mandalorian discovers a mysterious child with powerful abilities.',
    releaseDate: new Date('2019-11-12'),
    metadata: {
      episode: 'Chapter 1',
      season: 1,
      character: 'Grogu (Baby Yoda)',
    },
  },
  {
    title: 'The Battle of Hogwarts',
    slug: 'battle-of-hogwarts',
    seriesSlug: 'harry-potter-films',
    fandomSlug: 'harry-potter',
    synopsis: 'The final confrontation between Harry Potter and Lord Voldemort.',
    releaseDate: new Date('2011-07-15'),
    metadata: {
      film: 'Harry Potter and the Deathly Hallows – Part 2',
      location: 'Hogwarts School',
    },
  },
];

// Mapper functions
export function createFandom(fandom: FandomData): Prisma.FandomCreateInput {
  return {
    name: fandom.name,
    slug: fandom.slug,
    copy: {
      description: fandom.description,
      category: fandom.category,
      ...fandom.metadata,
    },
  };
}

export function createSeries(series: SeriesData, fandomId?: string): Prisma.SeriesCreateInput {
  return {
    name: series.name,
    slug: series.slug,
    ...(fandomId && { fandom: { connect: { id: fandomId } } }), // Only connect if fandomId provided
    copy: {
      description: series.description,
      releaseYear: series.releaseYear,
      ...series.metadata,
    },
  };
}

export function createCast(cast: CastData): Prisma.CastCreateInput {
  return {
    name: cast.name,
    slug: cast.slug,
    copy: {
      bio: cast.bio,
      roles: cast.roles,
    },
  };
}

export function createStory(story: StoryData, fandomId?: string): Prisma.StoryCreateInput {
  return {
    name: story.title,
    slug: story.slug,
    ...(fandomId && { fandom: { connect: { id: fandomId } } }), // Only connect if fandomId provided
    copy: {
      description: story.synopsis,
      releaseYear: story.releaseDate.getFullYear(),
      ...story.metadata,
    },
  };
}
