/**
 * Type declarations for external libraries without TypeScript definitions
 */

declare module 'madge' {
  interface MadgeOptions {
    baseDir?: string;
    fileExtensions?: string[];
    includeNpm?: boolean;
    tsConfig?: string;
    excludeRegExp?: RegExp;
    detectiveOptions?: {
      ts?: {
        skipTypeImports?: boolean;
      };
      tsx?: {
        skipTypeImports?: boolean;
      };
    };
  }

  interface MadgeInstance {
    circular(): string[][];
    obj(): Promise<Record<string, string[]>>;
  }

  function madge(globs: string[], options?: MadgeOptions): Promise<MadgeInstance>;

  export = madge;
}

declare module 'picomatch' {
  interface Options {
    dot?: boolean;
    noglobstar?: boolean;
    noext?: boolean;
    nocase?: boolean;
    nonegate?: boolean;
    maxLength?: number;
  }

  function picomatch(pattern: string, options?: Options): (path: string) => boolean;
  export = picomatch;
}
