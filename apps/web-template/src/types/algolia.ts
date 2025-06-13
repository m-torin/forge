// Algolia search types
export interface AlgoliaProduct {
  objectID: string;
  __position: number;
  __queryID?: string;

  // Product information
  name?: string;
  title?: string;
  description?: string;
  short_description?: string;

  // Images
  image?: string;
  image_url?: string;
  images?: string[];

  // Pricing
  price?: number;
  price_range?: {
    min: number;
    max: number;
  };
  currency?: string;
  on_sale?: boolean;
  sale_price?: number;

  // Categories and taxonomy
  category?: string;
  categories?: string[];
  hierarchicalCategories?: {
    lvl0: string;
    lvl1?: string;
    lvl2?: string;
    lvl3?: string;
  };

  // Brand and vendor
  brand?: string;
  vendor?: string;
  manufacturer?: string;

  // Ratings and reviews
  rating?: number;
  reviews?: {
    count: number;
    rating: number;
  };
  nb_reviews?: number;

  // Inventory and shipping
  in_stock?: boolean;
  inventory?: number;
  free_shipping?: boolean;
  shipping_time?: string;

  // Analytics and popularity
  popularity?: number;
  sales?: number;
  views?: number;

  // Product attributes
  color?: string;
  colors?: string[];
  size?: string;
  sizes?: string[];
  material?: string;

  // SEO and metadata
  slug?: string;
  sku?: string;
  barcode?: string;

  // Timestamps
  created_at?: string;
  updated_at?: string;

  // Special flags
  new_arrival?: boolean;
  featured?: boolean;
  eco_friendly?: boolean;

  // Algolia highlighting
  _highlightResult?: {
    name?: { value: string; matchLevel: string; matchedWords: string[] };
    title?: { value: string; matchLevel: string; matchedWords: string[] };
    description?: { value: string; matchLevel: string; matchedWords: string[] };
    brand?: { value: string; matchLevel: string; matchedWords: string[] };
    categories?: Array<{ value: string; matchLevel: string; matchedWords: string[] }>;
  };

  // Algolia snippeting
  _snippetResult?: {
    description?: { value: string; matchLevel: string };
    short_description?: { value: string; matchLevel: string };
  };
}

// Search configuration types
export interface AlgoliaSearchConfig {
  appId: string;
  searchKey: string;
  indexName: string;
}

// Facet types
export interface AlgoliaFacet {
  name: string;
  count: number;
  isRefined?: boolean;
}

// Search state types
export interface AlgoliaSearchState {
  query?: string;
  page?: number;
  hitsPerPage?: number;
  refinementList?: {
    [attribute: string]: string[];
  };
  range?: {
    [attribute: string]: {
      min?: number;
      max?: number;
    };
  };
  sortBy?: string;
}

// Analytics types
export interface AlgoliaAnalytics {
  clickedObjectIDsAfterSearch?: string[];
  clickedFilters?: string[];
  clickedPosition?: number;
  queryID?: string;
  userToken?: string;
}
