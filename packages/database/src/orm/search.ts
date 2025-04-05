import type { Prisma } from "@prisma/client";
import type { BaseQueryOptions, PaginationOptions } from "./utils.js";

/**
 * SearchOptions defines parameters for the global search function.
 * This combines base query options and global search specifics.
 */
export interface SearchOptions extends BaseQueryOptions {
  query: string;
  types?: Array<"users">;
  limit?: number;
  offset?: number;
  includeDetails?: boolean;
  pagination?: PaginationOptions;
}

/**
 * SearchResult represents a standardized search result across different entity types
 */
export interface SearchResult {
  id: number;
  type: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  url?: string;
  details?: Record<string, any>;
  score?: number;
}
