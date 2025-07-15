import { cookies } from 'next/headers';
import 'server-only';

/**
 * Configuration for model persistence
 */
export interface ModelPersistenceConfig {
  /** Cookie name for storing the model */
  cookieName?: string;
  /** Cookie options */
  cookieOptions?: {
    maxAge?: number;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
  };
}

/**
 * Default configuration for model persistence
 */
const DEFAULT_CONFIG: Required<ModelPersistenceConfig> = {
  cookieName: 'ai-model',
  cookieOptions: {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  },
};

/**
 * Save the selected AI model to a cookie
 */
export async function saveModelToCookie(
  model: string,
  config: ModelPersistenceConfig = {},
): Promise<void> {
  const { cookieName, cookieOptions } = { ...DEFAULT_CONFIG, ...config };
  const cookieStore = await cookies();

  cookieStore.set(cookieName, model, cookieOptions);
}

/**
 * Get the selected AI model from a cookie
 */
export async function getModelFromCookie(
  config: ModelPersistenceConfig = {},
): Promise<string | undefined> {
  const { cookieName } = { ...DEFAULT_CONFIG, ...config };
  const cookieStore = await cookies();

  return cookieStore.get(cookieName)?.value;
}

/**
 * Get the selected AI model from a cookie with a fallback
 */
export async function getModelFromCookieWithFallback(
  fallbackModel: string,
  config: ModelPersistenceConfig = {},
): Promise<string> {
  const savedModel = await getModelFromCookie(config);
  return savedModel || fallbackModel;
}

/**
 * Clear the model cookie
 */
export async function clearModelCookie(config: ModelPersistenceConfig = {}): Promise<void> {
  const { cookieName } = { ...DEFAULT_CONFIG, ...config };
  const cookieStore = await cookies();

  cookieStore.delete(cookieName);
}

/**
 * Specialized functions for chat models
 */
export const chatModel = {
  /**
   * Save chat model to cookie
   */
  save: (model: string) => saveModelToCookie(model, { cookieName: 'chat-model' }),

  /**
   * Get chat model from cookie
   */
  get: () => getModelFromCookie({ cookieName: 'chat-model' }),

  /**
   * Get chat model with fallback
   */
  getWithFallback: (fallback: string) =>
    getModelFromCookieWithFallback(fallback, { cookieName: 'chat-model' }),

  /**
   * Clear chat model cookie
   */
  clear: () => clearModelCookie({ cookieName: 'chat-model' }),
};
