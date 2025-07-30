// types.ts

export type SupportedLanguage = 'python' | 'r' | 'sql' | 'typescript';

export type BaseType =
  | 'null'
  | 'undefined'
  | 'string'
  | 'number'
  | 'boolean'
  | 'object'
  | 'array'
  | 'date'
  | 'bigint'
  | 'integer'
  | 'float'
  | 'decimal'
  | 'dataframe'; // Added for pandas/R support

export type ExtendedType =
  | BaseType
  | 'timestamp'
  | 'interval'
  | 'set'
  | 'ordered_map'
  | 'enum'
  | 'bytes'
  | 'json'
  | 'composite'
  | 'factor'
  | 'timeseries'
  | 'geometric'
  | 'network'
  | 'monetary'
  | 'range'
  | 'numpy'
  | 'pandas'
  | 'tuple'
  | 'union'
  | 'intersection'
  | 'interface'
  | 'type'
  | 'class'
  | 'dict'
  | 'complex'
  | 'atomic'
  | 'matrix'
  | 'xml'
  | 'sql'
  | 'r_object'
  | 'data.frame'
  | 'series'
  | `${string}_class`; // For dynamic R class names

export interface SchemaVersion {
  major: number;
  minor: number;
  patch: number;
  hash: string;
}

export interface ValidationRule {
  numeric?: {
    min?: number;
    max?: number;
    precision?: number;
    scale?: number;
    allowNegative?: boolean;
    isInteger?: boolean;
  };
  string?: {
    minLength?: number;
    length?: number; // Renamed from maxLength to length
    pattern?: string;
    encoding?: string;
  };
  array?: {
    minItems?: number;
    maxItems?: number;
    uniqueItems?: boolean;
    fixedSize?: boolean;
    dimensions?: number[];
  };
  common?: {
    required?: boolean;
    nullable?: boolean;
    immutable?: boolean;
    enumValues?: readonly unknown[];
  };
}

export interface TypeMetadata {
  // Common
  precision?: number;
  scale?: number;
  dimensions?: readonly number[];
  elementType?: ExtendedType;
  enumValues?: readonly unknown[];
  constraints?: Readonly<Record<string, unknown>>;
  format?: string;
  timezone?: string;
  nullable?: boolean;
  isHomogeneous?: boolean;
  uniqueItems?: boolean;
  length?: number; // Used instead of maxLength

  // Python specific
  isNumpy?: boolean;
  isPandas?: boolean;
  dtype?: string;
  itemsize?: number;
  ndim?: number;
  shape?: readonly number[];
  isDataFrame?: boolean;
  isSeries?: boolean;
  isMultiIndex?: boolean; // Added to fix python.ts:53:25 error
  columns?: string[]; // Added for pandas/R support

  // R specific
  isVector?: boolean;
  vectorType?: string; // Added for R vector types
  isFactor?: boolean;
  isMatrix?: boolean;
  isS3?: boolean;
  isS4?: boolean;
  hasLevels?: boolean;
  isOrdered?: boolean;
  levels?: readonly string[];
  className?: string;
  columnTypes?: string[]; // Added to fix r.ts:88:33 error
  contains?: string[]; // Changed from string to string[] to fix r.ts:133:25 error

  // TypeScript specific
  isInterface?: boolean;
  isType?: boolean;
  isClass?: boolean;
  hasGenerics?: boolean;
  genericTypes?: readonly string[];
  isUnion?: boolean;
  isIntersection?: boolean;
  types?: readonly string[];

  // SQL specific
  sqlType?: string;
  isFixedLength?: boolean; // Changed from fixedLength to isFixedLength in other files
  hasTimezone?: boolean;
  isGeometric?: boolean;
  isNetwork?: boolean;

  // Analysis metadata
  error?: string;
  version?: SchemaVersion;
  confidence?: number;

  // Additional properties
  subtype?: string;
  isDefaultDict?: boolean;
  isDecimal?: boolean;
  encoding?: string;
  isDifftime?: boolean;
  isTibble?: boolean;
  isArray?: boolean;
  slots?: string[];
  isNA?: boolean;
  isExact?: boolean;
  isBinary?: boolean;
  isInterval?: boolean;
  isStructured?: boolean;
  isIPv6?: boolean;
  name?: string;
  elements?: Array<{ type: BaseType }>;
  hasIndex?: boolean;
  isCounter?: boolean;
  isComplex?: boolean;
  timeClass?: string;
  isDataTable?: boolean;
  byrow?: boolean;
  isNull?: boolean; // Renamed from isnull to isNull for consistency
  isMoney?: boolean;
  allowNegative?: boolean;
  isCategorical?: boolean;
  hasNamed?: boolean;
  hasRowNames?: boolean;
  isSpecialValue?: boolean;
}

export interface SchemaResult {
  baseType: BaseType;
  specificType: ExtendedType; // Ensured specificType uses ExtendedType
  metadata: TypeMetadata;
  confidence: number;
  language: SupportedLanguage;
  raw?: unknown;
  error?: string;
  version?: SchemaVersion;
}

export interface AnalyzerOptions {
  preserveRaw?: boolean;
  strict?: boolean;
  timeout?: number;
  version?: SchemaVersion;
}

export interface AnalysisState {
  processed: number;
  failed: number;
  checksum: string;
  version: SchemaVersion;
  lastSuccessfulPath: string[];
  errors: Map<string, Error>;
}

export type AnalyzeFunction = (
  code: string,
  options?: AnalyzerOptions,
) => SchemaResult;

export interface SchemaNode {
  type: BaseType;
  specificType: ExtendedType;
  nullable: boolean;
  rules?: Partial<ValidationRule>;
  items?: SchemaNode;
  properties?: Record<string, SchemaNode>;
  required?: string[];
  metadata?: TypeMetadata;
  version?: SchemaVersion;
  checksum?: string;
  state?: AnalysisState;
}
