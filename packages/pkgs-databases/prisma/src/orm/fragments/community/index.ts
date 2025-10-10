/**
 * Community and content fragments
 * Comprehensive fragments for community-generated content and articles
 */

// Article fragments
export * from './article';

// Post fragments
export * from './post';

// Type exports
export type {
  // Article types
  ArticleBasicResult,
  ArticleCompleteResult,
  ArticleCompleteWithRelationsResult,
  ArticleComprehensiveResult,
  ArticleWithDeletedByResult,
  ArticleWithUserResult,
} from './article';

export type {
  // Post types
  PostBasicResult,
  PostCompleteResult,
  PostCompleteWithRelationsResult,
  PostComprehensiveResult,
  PostWithAuthorResult,
} from './post';
