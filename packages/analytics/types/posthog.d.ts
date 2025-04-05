declare module "posthog-js" {
  export type PostHogProperties = Record<
    string,
    string | number | boolean | null | undefined
  >;

  export interface PostHogOptions {
    [key: string]: unknown;
    api_host?: string;
    autocapture?: boolean;
    disable_session_recording?: boolean;
    loaded?: (posthog: PostHog) => void;
  }

  export interface PostHog {
    [key: string]: unknown;
    capture: (event: string, properties?: PostHogProperties) => void;
    identify: (distinctId: string, properties?: PostHogProperties) => void;
    init: (apiKey: string, options?: PostHogOptions) => void;
    register: (properties: PostHogProperties) => void;
    reset: () => void;
  }

  const posthog: PostHog;
  export default posthog;
}

declare module "posthog-js/react" {
  import { type ReactNode } from "react";

  import type { PostHog } from "posthog-js";

  export interface PostHogProviderProps {
    [key: string]: unknown;
    children: ReactNode;
    client?: PostHog;
  }

  export function PostHogProvider(props: PostHogProviderProps): JSX.Element;
  export function usePostHog(): PostHog;
}

declare module "posthog-node" {
  export type PostHogProperties = Record<
    string,
    string | number | boolean | null | undefined
  >;

  export interface PostHogOptions {
    [key: string]: unknown;
    flushAt?: number;
    flushInterval?: number;
    host?: string;
  }

  export interface CaptureProperties {
    distinctId: string;
    event: string;
    properties?: PostHogProperties;
  }

  export interface IdentifyProperties {
    distinctId: string;
    properties?: PostHogProperties;
  }

  export class PostHog {
    constructor(apiKey: string, options?: PostHogOptions);
    capture: (properties: CaptureProperties) => void;
    identify: (properties: IdentifyProperties) => void;
    [key: string]: unknown;
  }
}

declare module "@posthog/node" {
  export * from "posthog-node";
}

declare module "server-only" {
  const serverOnly: unknown;
  export default serverOnly;
}
