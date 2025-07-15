// telemetry/index.ts

import { Middleware } from '../base';
import { DefaultTelemetryProvider, TelemetryMiddleware } from './middleware';
import { TelemetryProvider, TelemetryOptions } from './types';

export * from './types';
export * from './middleware';

export const createTelemetryMiddleware = (
  provider?: TelemetryProvider,
  options?: TelemetryOptions,
): Middleware => {
  const middleware = new TelemetryMiddleware(
    provider || new DefaultTelemetryProvider(),
    options,
  );
  return middleware.handle;
};
