export type RelationshipOption = {
  id: string;
  name: string;
};

export type RelationshipFetcher = (query: string) => Promise<RelationshipOption[]>;

export type OrderDirection = 'asc' | 'desc';

export type OrderBy<TKeys extends string = string> = {
  key: TKeys;
  dir: OrderDirection;
};

export type ColumnDef<T> = {
  key: keyof T | string;
  title: string;
  width?: number;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginationResult<T> = {
  data: T[];
  pagination: Pagination;
};

export type ArchiveFetchOptions<TSortKeys extends string = 'name' | 'slug' | 'updatedAt'> = {
  q?: string;
  page: number;
  pageSize: number;
  orderBy?: OrderBy<TSortKeys>;
  includeDeleted?: boolean;
};

export type ArchiveConfig<T, TSortKeys extends string = 'name' | 'slug' | 'updatedAt'> = {
  columns: ColumnDef<T>[];
  defaultSort?: OrderBy<TSortKeys>;
  searchFields: (keyof T | string)[];
  fetchPage: (
    opts: ArchiveFetchOptions<TSortKeys>,
  ) => Promise<{ rows: T[]; total: number } | PaginationResult<T>>;
  deleteMany?: (ids: string[]) => Promise<void>;
};

export type EditorRelationships = Record<
  string,
  {
    mode: 'single' | 'multi';
    fetch: RelationshipFetcher;
    valueKey?: string; // defaults to 'id'
    labelKey?: string; // defaults to 'name'
  }
>;

export type EditorConfig<TModel, TCreate, TUpdate> = {
  schema: any; // Zod schema type kept generic to avoid coupling
  toCreate: (values: any) => TCreate;
  toUpdate: (values: any) => TUpdate;
  loadById: (idOrSlug: string) => Promise<TModel | null>;
  create: (data: TCreate) => Promise<{ id: string } | { success: true; data: { id: string } }>;
  update: (id: string, data: TUpdate) => Promise<void | { success: boolean }>;
  relationships?: EditorRelationships;
};

export type EntityConfig<
  TModel,
  TCreate,
  TUpdate,
  TSortKeys extends string = 'name' | 'slug' | 'updatedAt',
> = {
  key: string;
  display: { singular: string; plural: string };
  archive: ArchiveConfig<TModel, TSortKeys>;
  editor: EditorConfig<TModel, TCreate, TUpdate>;
};
