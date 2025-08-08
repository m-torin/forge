/**
 * Shared observability utilities and types
 * This module provides isomorphic logging functions that work in any environment
 */
export declare const getRuntimeInfo: () =>
  | {
      type: string;
      variant: string;
      version?: undefined;
      isNextJs?: undefined;
    }
  | {
      type: string;
      version: string;
      variant?: undefined;
      isNextJs?: undefined;
    }
  | {
      type: string;
      isNextJs: boolean;
      variant?: undefined;
      version?: undefined;
    }
  | {
      type: string;
      version: string;
      isNextJs: boolean;
      variant?: undefined;
    }
  | {
      type: string;
      variant?: undefined;
      version?: undefined;
      isNextJs?: undefined;
    };
export declare const getRuntimeEnvironment: () =>
  | {
      type: string;
      variant: string;
      version?: undefined;
      isNextJs?: undefined;
    }
  | {
      type: string;
      version: string;
      variant?: undefined;
      isNextJs?: undefined;
    }
  | {
      type: string;
      isNextJs: boolean;
      variant?: undefined;
      version?: undefined;
    }
  | {
      type: string;
      version: string;
      isNextJs: boolean;
      variant?: undefined;
    }
  | {
      type: string;
      variant?: undefined;
      version?: undefined;
      isNextJs?: undefined;
    };
export declare function setObservabilityInstance(instance: any): void;
export declare const logDebug: (message: string | Error, context?: any) => void;
export declare const logInfo: (message: string | Error, context?: any) => void;
export declare const logWarn: (message: string | Error, context?: any) => void;
export declare const logError: (message: string | Error, context?: any) => void;
export type {
  ObservabilityClient,
  ObservabilityContext,
  ObservabilityServer,
  ObservabilityUser,
} from './types';
//# sourceMappingURL=shared.d.ts.map
