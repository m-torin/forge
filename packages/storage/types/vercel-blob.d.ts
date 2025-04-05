declare module "@vercel/blob/client" {
  export interface PutOptions {
    [key: string]: any;
    contentType?: string;
    pathname: string;
  }

  export interface PutResponse {
    [key: string]: any;
    headers: Record<string, string>;
    url: string;
  }

  export function getPutUrl(options: PutOptions): Promise<PutResponse>;
  export function getUrl(pathname: string): string;
  export function createFolder(options: {
    folderPath: string;
  }): Promise<{ url: string; pathname: string }>;
  export function completeMultipartUpload(): Promise<void>;
}

declare module "@vercel/blob" {
  export * from "@vercel/blob/client";

  export type BlobOptions = Record<string, any>;

  export class BlobAccessError extends Error {
    constructor(message: string);
    name: string;
    status: number;
  }

  export function put(pathname: string, options?: BlobOptions): Promise<any>;
  export function list(options?: BlobOptions): Promise<any>;
  export function get(pathname: string, options?: BlobOptions): Promise<any>;
  export function del(pathname: string): Promise<void>;
  export function head(pathname: string): Promise<any>;
}
