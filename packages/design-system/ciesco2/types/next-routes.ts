import { type Route } from 'next';
import { type AppRoute, type DynamicRoute, type StaticRoute } from './routes';

// Type-safe route function that returns Next.js Route type
export function typedRoute(path: StaticRoute): Route<StaticRoute>;
export function typedRoute<T extends keyof DynamicRoute>(
  path: T,
  params: DynamicRoute[T]
): Route<string>;
export function typedRoute<T extends AppRoute>(
  path: T,
  params?: T extends keyof DynamicRoute ? DynamicRoute[T] : never
): Route<string> {
  if (params) {
    let result = path as string;
    for (const [key, value] of Object.entries(params)) {
      result = result.replace(`[${key}]`, value as string);
    }
    return result as Route<string>;
  }
  return path as Route<string>;
}