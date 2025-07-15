import { logError } from '@repo/observability';
import 'server-only';
import { z } from 'zod/v4';
import { schemas as commonSchemas, tool } from './simple-tools';

type ToolContext = any; // For backwards compatibility

/**
 * Weather data schema
 */
const weatherDataSchema = z.object({
  current: z.object({
    temperature_2m: z.number(),
    time: z.string().optional(),
  }),
  hourly: z
    .object({
      temperature_2m: z.array(z.number()),
      time: z.array(z.string()).optional(),
    })
    .optional(),
  daily: z
    .object({
      sunrise: z.array(z.string()).optional(),
      sunset: z.array(z.string()).optional(),
    })
    .optional(),
  timezone: z.string().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

/**
 * Weather tool parameters
 */
const weatherParameters = z.object({
  latitude: commonSchemas.latitude,
  longitude: commonSchemas.longitude,
});

/**
 * Creates a weather tool using the Open-Meteo API
 */
export function createWeatherTool(context: ToolContext = {}) {
  return tool.api({
    description: 'Get the current weather at a location',
    parameters: weatherParameters,
    url: (args: z.infer<typeof weatherParameters>) =>
      `https://api.open-meteo.com/v1/forecast?latitude=${args.latitude}&longitude=${args.longitude}&current=temperature_2m&hourly=temperature_2m&daily=sunrise,sunset&timezone=auto`,
    method: 'GET',
    transformResponse: data => {
      // Validate the response structure
      const parsed = weatherDataSchema.safeParse(data);
      if (!parsed.success) {
        throw new Error('Invalid weather data received from API');
      }
      return parsed.data;
    },
    onError: error => {
      logError('Weather API error', {
        operation: 'weather_tool_api_call',
        error: error instanceof Error ? error : new Error(String(error)),
      });
      // Return a valid weather data structure for error cases
      return {
        current: {
          temperature_2m: 0,
          time: new Date().toISOString(),
        },
        error: 'Failed to fetch weather data',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    },
    context,
  });
}

/**
 * Weather tool with additional options
 */
export function createAdvancedWeatherTool(
  config: {
    /** API key for premium weather services */
    apiKey?: string;
    /** Alternative weather API base URL */
    baseUrl?: string;
    /** Additional parameters to include */
    extraParams?: Record<string, string>;
  } = {},
  context: ToolContext = {},
) {
  const { apiKey, baseUrl = 'https://api.open-meteo.com/v1/forecast', extraParams = {} } = config;

  const weatherSchema = z.object({
    latitude: z.number().min(-90).max(90).describe('Latitude coordinate'),
    longitude: z.number().min(-180).max(180).describe('Longitude coordinate'),
    includeHourly: z.boolean().optional().default(false).describe('Include hourly forecast'),
    includeForecast: z.boolean().optional().default(false).describe('Include daily forecast'),
  });

  return tool.api({
    description: 'Get detailed weather information at a location',
    parameters: weatherSchema,
    url: (args: z.infer<typeof weatherSchema>) => {
      const params = new URLSearchParams({
        latitude: args.latitude.toString(),
        longitude: args.longitude.toString(),
        current: 'temperature_2m,weathercode,windspeed_10m',
        timezone: 'auto',
        ...extraParams,
      });

      if (args.includeHourly) {
        params.append('hourly', 'temperature_2m,weathercode');
      }

      if (args.includeForecast) {
        params.append('daily', 'temperature_2m_max,temperature_2m_min,sunrise,sunset,weathercode');
      }

      if (apiKey) {
        params.append('key', apiKey);
      }

      return `${baseUrl}?${params.toString()}`;
    },
    method: 'GET',
    headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined,
    transformResponse: data => {
      const parsed = weatherDataSchema.safeParse(data);
      if (!parsed.success) {
        // Return raw data if schema validation fails for advanced API responses
        return data;
      }
      return parsed.data;
    },
    onError: error => {
      logError('Weather API error', {
        operation: 'weather_tool_advanced_api_call',
        error: error instanceof Error ? error : new Error(String(error)),
      });
      return {
        error: 'Failed to fetch weather data',
        message: error instanceof Error ? error.message : 'Unknown error',
        fallback: 'You may want to try again or check the coordinates',
      };
    },
    context,
  });
}

/**
 * Simple weather tool function (matches chatbot interface)
 */
export const getWeather = createWeatherTool();

/**
 * Advanced weather tool function with additional options
 */
export const getAdvancedWeather = createAdvancedWeatherTool();

/**
 * Export types for external use
 */
export type WeatherData = z.infer<typeof weatherDataSchema>;
export type WeatherParameters = z.infer<typeof weatherParameters>;
