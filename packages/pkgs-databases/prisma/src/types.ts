// Driver adapter types for Prisma 6 with multi-schema support
export type DatabaseProvider = 'postgresql' | 'sqlite' | 'd1';

// Re-export Prisma types for convenience
export type { Prisma } from '@repo/db-prisma/client';

export interface PostgreSQLAdapterOptions {
  connectionString: string;
  schema?: string;

  // Basic SSL (managed service friendly)
  sslMode?: 'disable' | 'prefer' | 'require';

  // Connection management (serverless/Lambda optimized)
  connectionLimit?: number;
  connectTimeout?: number;
  poolTimeout?: number;

  // Managed service features
  pgBouncer?: boolean;
  applicationName?: string;

  // Performance
  statementCacheSize?: number;
}

export interface SQLiteAdapterOptions {
  url: string;
}

export interface D1AdapterOptions {
  CLOUDFLARE_D1_TOKEN: string;
  CLOUDFLARE_ACCOUNT_ID: string;
  CLOUDFLARE_DATABASE_ID: string;
}

// Union type for all adapter options
export type AdapterOptions = PostgreSQLAdapterOptions | SQLiteAdapterOptions | D1AdapterOptions;

export interface PrismaAdapterInstance {
  provider: DatabaseProvider;
  adapter: any; // The actual adapter instance
}

// New generator specific types
export interface GeneratedPrismaClient {
  PrismaClient: any;
}

export interface GeneratedTypes {
  models: Record<string, any>;
  enums: Record<string, any>;
  inputTypes: Record<string, any>;
}

export interface ClientOptions {
  adapter?: any;
  log?: Array<'query' | 'info' | 'warn' | 'error'>;
}

// Runtime environment detection types
export interface RuntimeEnvironment {
  runtime: 'nodejs' | 'vercel-edge' | 'cloudflare' | 'deno';
  hasEnvVar: (name: string) => boolean;
  preferredAdapter?: string;
  capabilities: {
    supportsSQL: boolean;
    supportsHTTP: boolean;
    supportsTCP: boolean;
    supportsWebStreams: boolean;
  };
}

// Adapter configuration interface
export interface AdapterConfig {
  provider: DatabaseProvider;
  options: AdapterOptions;
  runtime?: RuntimeEnvironment;
}

export interface RuntimeConfig {
  runtime: 'nodejs' | 'vercel-edge';
  environment: 'development' | 'production' | 'test';
  moduleFormat?: 'esm' | 'cjs';
  generatedFileExtension?: 'ts' | 'js';
  importFileExtension?: 'ts' | 'js' | '';
}

export interface AdapterFactory<T extends AdapterOptions = AdapterOptions> {
  create: (options: T, runtimeConfig?: RuntimeConfig) => Promise<any>;
  validate: (options: T) => boolean;
  getRequiredDependencies: () => string[];
}

// PostgreSQL type utilities and mappings
export const postgresTypes = {
  // Basic type mappings
  uuid: () => '@db.Uuid',
  jsonb: () => '@db.JsonB',
  json: () => '@db.Json',
  inet: () => '@db.Inet',
  text: () => '@db.Text',
  varchar: (length?: number) => (length ? `@db.VarChar(${length})` : '@db.VarChar'),
  char: (length: number) => `@db.Char(${length})`,

  // Numeric types
  bigint: () => '@db.BigInt',
  integer: () => '@db.Int',
  smallint: () => '@db.SmallInt',
  decimal: (precision?: number, scale?: number) =>
    precision && scale ? `@db.Decimal(${precision}, ${scale})` : '@db.Decimal',
  real: () => '@db.Real',
  doublePrecision: () => '@db.DoublePrecision',

  // Date/time types
  timestamp: (precision?: number) => (precision ? `@db.Timestamp(${precision})` : '@db.Timestamp'),
  timestamptz: (precision?: number) =>
    precision ? `@db.Timestamptz(${precision})` : '@db.Timestamptz',
  date: () => '@db.Date',
  time: (precision?: number) => (precision ? `@db.Time(${precision})` : '@db.Time'),
  timetz: (precision?: number) => (precision ? `@db.Timetz(${precision})` : '@db.Timetz'),

  // Array types
  arrays: {
    text: () => 'String[]',
    integer: () => 'Int[]',
    bigint: () => 'BigInt[]',
    boolean: () => 'Boolean[]',
    uuid: () => 'String[]',
    jsonb: () => 'Json[]',
    timestamp: () => 'DateTime[]',
  },

  // Special types
  bytea: () => '@db.ByteA',
  xml: () => '@db.Xml',
  money: () => '@db.Money',
  bit: (length: number) => `@db.Bit(${length})`,
  varbit: () => '@db.VarBit',
  oid: () => '@db.Oid',
} as const;

// PostgreSQL array type helpers
export type PostgreSQLArrayType =
  | 'String[]'
  | 'Int[]'
  | 'BigInt[]'
  | 'Boolean[]'
  | 'DateTime[]'
  | 'Json[]';

// PostgreSQL native type attributes
export type PostgreSQLNativeType =
  | '@db.Uuid'
  | '@db.JsonB'
  | '@db.Json'
  | '@db.Inet'
  | '@db.Text'
  | '@db.VarChar'
  | '@db.Char'
  | '@db.BigInt'
  | '@db.Int'
  | '@db.SmallInt'
  | '@db.Decimal'
  | '@db.Real'
  | '@db.DoublePrecision'
  | '@db.Timestamp'
  | '@db.Timestamptz'
  | '@db.Date'
  | '@db.Time'
  | '@db.Timetz'
  | '@db.ByteA'
  | '@db.Xml'
  | '@db.Money'
  | '@db.Bit'
  | '@db.VarBit'
  | '@db.Oid';

// PostgreSQL full-text search utilities (requires fullTextSearchPostgres preview feature)
export const postgresSearch = {
  // Full-text search operators
  and: (terms: string[]): string => terms.join(' & '),
  or: (terms: string[]): string => terms.join(' | '),
  not: (term: string): string => `!${term}`,
  phrase: (phrase: string): string => `"${phrase}"`,
  follows: (term1: string, term2: string): string => `${term1} <-> ${term2}`,
  prefix: (term: string): string => `${term}:*`,

  // Complex search query builders
  andNot: (include: string[], exclude: string[]): string => {
    const includePart = include.length > 0 ? include.join(' & ') : '';
    const excludePart = exclude.length > 0 ? exclude.map(term => `!${term}`).join(' & ') : '';
    return [includePart, excludePart].filter(Boolean).join(' & ');
  },

  orWithAnd: (orTerms: string[], andTerms: string[]): string => {
    const orPart = orTerms.length > 0 ? `(${orTerms.join(' | ')})` : '';
    const andPart = andTerms.length > 0 ? andTerms.join(' & ') : '';
    return [orPart, andPart].filter(Boolean).join(' & ');
  },

  // Search relevance sorting helper (for orderBy)
  relevance: (fields: string[], searchTerm: string, sort: 'asc' | 'desc' = 'desc') => ({
    _relevance: {
      fields,
      search: searchTerm,
      sort,
    },
  }),

  // Search utilities for common patterns
  utils: {
    // Escape special characters in search terms
    escape: (term: string): string => {
      return term.replace(/[&|!():<>"']/g, '\\$&');
    },

    // Create a fuzzy search (prefix matching)
    fuzzy: (term: string): string => `${term}:*`,

    // Create phrase search with proximity
    proximity: (term1: string, term2: string, distance: number = 1): string => {
      if (distance === 1) return `${term1} <-> ${term2}`;
      return `${term1} <${distance}> ${term2}`;
    },

    // Build complex search from object
    build: (query: {
      must?: string[];
      should?: string[];
      mustNot?: string[];
      phrases?: string[];
    }): string => {
      const parts: string[] = [];

      if (query.must && query.must.length > 0) {
        parts.push(query.must.join(' & '));
      }

      if (query.should && query.should.length > 0) {
        parts.push(`(${query.should.join(' | ')})`);
      }

      if (query.mustNot && query.mustNot.length > 0) {
        parts.push(query.mustNot.map(term => `!${term}`).join(' & '));
      }

      if (query.phrases && query.phrases.length > 0) {
        parts.push(query.phrases.map(phrase => `"${phrase}"`).join(' & '));
      }

      return parts.join(' & ');
    },
  },
} as const;

// PostgreSQL search query builder type
export interface PostgreSQLSearchQuery {
  must?: string[];
  should?: string[];
  mustNot?: string[];
  phrases?: string[];
}

// Full-text search field type for PostgreSQL
export type PostgreSQLSearchField = {
  search: string;
};

// Advanced search patterns for better PostgreSQL integration
export const postgresAdvanced = {
  /**
   * Create weighted search across multiple fields
   */
  weightedSearch: (
    fields: Array<{ field: string; weight: 'A' | 'B' | 'C' | 'D' }>,
    query: string,
  ) => {
    const weightMap = { A: 1.0, B: 0.4, C: 0.2, D: 0.1 };
    return fields.map(({ field, weight }) => ({
      [field]: {
        search: query,
        mode: 'insensitive' as const,
      },
      _weight: weightMap[weight],
    }));
  },

  /**
   * Create search with highlighting (for results display)
   */
  highlightSearch: (query: string, fields: string[]) => ({
    search: query,
    highlight: {
      fields: fields.reduce((acc, field) => ({ ...acc, [field]: {} }), {}),
    },
  }),

  /**
   * Search with aggregation and faceting
   */
  facetedSearch: (query: string, facets: string[]) => ({
    search: query,
    aggregations: facets.reduce(
      (acc, facet) => ({
        ...acc,
        [`${facet}_terms`]: {
          terms: { field: facet },
        },
      }),
      {},
    ),
  }),

  /**
   * Smart autocomplete search
   */
  autocomplete: (query: string, field: string = 'title') => ({
    [field]: {
      search: postgresSearch.prefix(query),
      mode: 'insensitive' as const,
    },
  }),

  /**
   * Typo-tolerant search
   */
  fuzzySearch: (query: string, maxDistance: number = 2) => {
    const terms = query.split(' ').map(term => (term.length > 3 ? `${term}:*` : term));
    return postgresSearch.or(terms);
  },
} as const;
