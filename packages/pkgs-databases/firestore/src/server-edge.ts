/**
 * Edge Runtime Firestore client
 * Optimized for Vercel Edge Functions, Cloudflare Workers, and other edge environments
 */

import { mergeConfig, validateServerConfig } from './config';
import type { FirestoreClient, FirestoreConfig, FirestoreResult } from './types';

/**
 * Edge-compatible Firestore client implementation
 * Uses Firestore REST API for edge runtime compatibility
 */
class EdgeFirestoreClient implements FirestoreClient {
  private config: FirestoreConfig;
  private baseUrl: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(config: Partial<FirestoreConfig> = {}) {
    this.config = mergeConfig(config);
    this.baseUrl = `https://firestore.googleapis.com/v1/projects/${this.config.projectId}/databases/${this.config.databaseId || '(default)'}`;
  }

  /**
   * Get access token for Firestore REST API
   */
  private async getAccessToken(): Promise<string> {
    // Check if token is still valid
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      // Create JWT for service account
      const jwt = await this.createJWT();

      // Exchange JWT for access token
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          assertion: jwt,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get access token: ${response.statusText}`);
      }

      const tokenData = await response.json();
      this.accessToken = tokenData.access_token;
      this.tokenExpiry = Date.now() + tokenData.expires_in * 1000 - 60000; // 1 minute buffer

      return this.accessToken;
    } catch (error) {
      throw new Error(`Authentication failed: ${error}`);
    }
  }

  /**
   * Create JWT for service account authentication
   */
  private async createJWT(): Promise<string> {
    if (!this.config.clientEmail || !this.config.privateKey) {
      throw new Error('Service account credentials are required for edge runtime');
    }

    const now = Math.floor(Date.now() / 1000);

    const header = {
      alg: 'RS256',
      typ: 'JWT',
    };

    const payload = {
      iss: this.config.clientEmail,
      scope: 'https://www.googleapis.com/auth/datastore',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600, // 1 hour
      iat: now,
    };

    // In edge environment, we'd use Web Crypto API
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      return await this.signJWTWithWebCrypto(header, payload);
    }

    throw new Error('JWT signing not supported in this environment');
  }

  /**
   * Sign JWT using Web Crypto API (edge compatible)
   */
  private async signJWTWithWebCrypto(header: any, payload: any): Promise<string> {
    const encoder = new TextEncoder();

    // Encode header and payload
    const encodedHeader = btoa(JSON.stringify(header))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
    const encodedPayload = btoa(JSON.stringify(payload))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
    const data = `${encodedHeader}.${encodedPayload}`;

    // Import private key
    const privateKey = await crypto.subtle.importKey(
      'pkcs8',
      this.pemToArrayBuffer(this.config.privateKey!),
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256',
      },
      false,
      ['sign'],
    );

    // Sign the data
    const signature = await crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      privateKey,
      encoder.encode(data),
    );

    // Encode signature
    const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    return `${data}.${encodedSignature}`;
  }

  /**
   * Convert PEM to ArrayBuffer
   */
  private pemToArrayBuffer(pem: string): ArrayBuffer {
    const pemContents = pem
      .replace(/-----BEGIN PRIVATE KEY-----/, '')
      .replace(/-----END PRIVATE KEY-----/, '')
      .replace(/\s/g, '');

    const binaryString = atob(pemContents);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Make authenticated request to Firestore REST API
   */
  private async makeRequest(
    method: string,
    path: string,
    body?: any,
    params?: Record<string, string>,
  ): Promise<any> {
    const accessToken = await this.getAccessToken();

    let url = `${this.baseUrl}${path}`;
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }

    const options: RequestInit = {
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`Firestore API error: ${response.status} ${response.statusText}`);
    }

    if (response.status === 204) {
      return null; // No content
    }

    return await response.json();
  }

  /**
   * Convert Firestore REST API document to simple format
   */
  private convertDocument(doc: any) {
    if (!doc.fields) return null;

    const result: any = {};
    for (const [key, value] of Object.entries(doc.fields)) {
      result[key] = this.convertValue(value);
    }

    return result;
  }

  /**
   * Convert Firestore field value
   */
  private convertValue(value: any): any {
    if (value.stringValue !== undefined) return value.stringValue;
    if (value.integerValue !== undefined) return parseInt(value.integerValue);
    if (value.doubleValue !== undefined) return value.doubleValue;
    if (value.booleanValue !== undefined) return value.booleanValue;
    if (value.timestampValue !== undefined) return new Date(value.timestampValue);
    if (value.nullValue !== undefined) return null;
    if (value.arrayValue) return value.arrayValue.values?.map(this.convertValue.bind(this)) || [];
    if (value.mapValue) return this.convertDocument({ fields: value.mapValue.fields });
    return value;
  }

  /**
   * Convert JavaScript value to Firestore field format
   */
  private toFirestoreValue(value: any): any {
    if (value === null) return { nullValue: null };
    if (typeof value === 'string') return { stringValue: value };
    if (typeof value === 'number') {
      return Number.isInteger(value) ? { integerValue: value.toString() } : { doubleValue: value };
    }
    if (typeof value === 'boolean') return { booleanValue: value };
    if (value instanceof Date) return { timestampValue: value.toISOString() };
    if (Array.isArray(value)) {
      return {
        arrayValue: {
          values: value.map(v => this.toFirestoreValue(v)),
        },
      };
    }
    if (typeof value === 'object') {
      const fields: any = {};
      for (const [k, v] of Object.entries(value)) {
        fields[k] = this.toFirestoreValue(v);
      }
      return { mapValue: { fields } };
    }
    return { stringValue: String(value) };
  }

  // Implement FirestoreClient interface for edge environment

  collection(collectionPath: string) {
    return {
      add: async (data: any) => {
        const document = {
          fields: Object.fromEntries(
            Object.entries(data).map(([key, value]) => [key, this.toFirestoreValue(value)]),
          ),
        };

        const result = await this.makeRequest('POST', `/documents/${collectionPath}`, document);

        return {
          id: result.name.split('/').pop(),
          path: result.name,
        };
      },

      doc: (id?: string) => {
        const docId = id || `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        return this.doc(`${collectionPath}/${docId}`);
      },

      where: () => {
        throw new Error(
          'Complex queries not supported in edge runtime. Use server-side implementation.',
        );
      },

      orderBy: () => {
        throw new Error(
          'Complex queries not supported in edge runtime. Use server-side implementation.',
        );
      },

      limit: () => {
        throw new Error(
          'Complex queries not supported in edge runtime. Use server-side implementation.',
        );
      },

      get: async () => {
        const result = await this.makeRequest('GET', `/documents/${collectionPath}`);

        return {
          docs:
            result.documents?.map((doc: any) => ({
              id: doc.name.split('/').pop(),
              exists: () => true,
              data: () => this.convertDocument(doc),
            })) || [],
          size: result.documents?.length || 0,
        };
      },
    };
  }

  doc(documentPath: string) {
    return {
      get: async () => {
        try {
          const result = await this.makeRequest('GET', `/documents/${documentPath}`);

          return {
            id: result.name.split('/').pop(),
            exists: () => true,
            data: () => this.convertDocument(result),
          };
        } catch (error) {
          if (error instanceof Error && error.message.includes('404')) {
            return {
              id: documentPath.split('/').pop(),
              exists: () => false,
              data: () => null,
            };
          }
          throw error;
        }
      },

      set: async (data: any, options?: any) => {
        const document = {
          fields: Object.fromEntries(
            Object.entries(data).map(([key, value]) => [key, this.toFirestoreValue(value)]),
          ),
        };

        const params: Record<string, string> = {};
        if (options?.merge) {
          params['updateMask.fieldPaths'] = Object.keys(data).join(',');
        }

        await this.makeRequest('PATCH', `/documents/${documentPath}`, document, params);
        return { writeTime: new Date().toISOString() };
      },

      update: async (data: any) => {
        const document = {
          fields: Object.fromEntries(
            Object.entries(data).map(([key, value]) => [key, this.toFirestoreValue(value)]),
          ),
        };

        const params = {
          'updateMask.fieldPaths': Object.keys(data).join(','),
        };

        await this.makeRequest('PATCH', `/documents/${documentPath}`, document, params);
        return { writeTime: new Date().toISOString() };
      },

      delete: async () => {
        await this.makeRequest('DELETE', `/documents/${documentPath}`);
        return { writeTime: new Date().toISOString() };
      },

      onSnapshot: () => {
        throw new Error('Real-time listeners not supported in edge runtime');
      },

      collection: (collectionPath: string) => {
        return this.collection(`${documentPath}/${collectionPath}`);
      },
    };
  }

  async runTransaction<T>(updateFunction: (transaction: any) => Promise<T>): Promise<T> {
    throw new Error('Transactions not supported in edge runtime');
  }

  batch() {
    throw new Error('Batch operations not supported in edge runtime');
  }

  async getAll(...documentReferences: any[]) {
    throw new Error('Batch reads not supported in edge runtime');
  }

  async terminate() {
    // No-op for edge runtime
  }
}

/**
 * Create edge-compatible Firestore client
 */
export function createEdgeClient(config?: Partial<FirestoreConfig>): FirestoreClient {
  return new EdgeFirestoreClient(config);
}

/**
 * Safe edge operation wrapper
 */
export async function safeEdgeOperation<T>(
  operation: () => Promise<T>,
): Promise<FirestoreResult<T>> {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}

// Default edge client
let defaultEdgeClient: FirestoreClient | null = null;

/**
 * Get or create default edge client
 */
export function getEdgeClient(config?: Partial<FirestoreConfig>): FirestoreClient {
  if (!defaultEdgeClient || config) {
    defaultEdgeClient = createEdgeClient(config);
  }
  return defaultEdgeClient;
}

// Re-export types
export { mergeConfig, validateServerConfig };
export type { FirestoreClient, FirestoreConfig, FirestoreResult };
