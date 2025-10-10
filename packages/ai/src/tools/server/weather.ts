import { logError } from '@repo/observability';
import { tool } from 'ai';
import 'server-only';
import { z } from 'zod/v3';
import { schemas as commonSchemas } from '../schema-fragments';

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
 * Basic weather tool using Open-Meteo API - Direct AI SDK pattern
 */
const getWeatherTool = tool({
  description: 'Get current weather at a location using Open-Meteo API',
  inputSchema: weatherParameters,
  execute: async args => {
    const { latitude, longitude } = args;

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&hourly=temperature_2m&daily=sunrise,sunset&timezone=auto`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Validate the response structure
      const parsed = weatherDataSchema.safeParse(data);
      if (!parsed.success) {
        throw new Error('Invalid weather data received from API');
      }

      return parsed.data;
    } catch (error) {
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
    }
  },
});

/**
 * Advanced weather tool with Open-Meteo specific features - Direct AI SDK pattern
 */
function createAdvancedWeatherTool(
  config: {
    /** API key for premium weather services */
    apiKey?: string;
    /** Alternative weather API base URL */
    baseUrl?: string;
    /** Additional parameters to include */
    extraParams?: Record<string, string>;
  } = {},
) {
  const { apiKey, baseUrl = 'https://api.open-meteo.com/v1/forecast', extraParams = {} } = config;

  const advancedWeatherSchema = z.object({
    latitude: commonSchemas.latitude,
    longitude: commonSchemas.longitude,
    includeHourly: z.boolean().optional().default(false).describe('Include hourly forecast'),
    includeForecast: z.boolean().optional().default(false).describe('Include daily forecast'),
    models: z
      .array(z.enum(['best_match', 'ecmwf', 'gfs']))
      .optional()
      .describe('Weather models to use'),
    timezone: z.string().optional().default('auto').describe('Timezone for timestamps'),
  });

  return tool({
    description: 'Get detailed weather information with Open-Meteo advanced features',
    inputSchema: advancedWeatherSchema,
    execute: async args => {
      const { latitude, longitude, includeHourly, includeForecast, models, timezone } = args;

      try {
        const params = new URLSearchParams({
          latitude: latitude.toString(),
          longitude: longitude.toString(),
          current: 'temperature_2m,weathercode,windspeed_10m',
          timezone: timezone || 'auto',
          ...extraParams,
        });

        if (includeHourly) {
          params.append('hourly', 'temperature_2m,weathercode,precipitation');
        }

        if (includeForecast) {
          params.append(
            'daily',
            'temperature_2m_max,temperature_2m_min,sunrise,sunset,weathercode',
          );
        }

        if (models && models.length > 0) {
          params.append('models', models.join(','));
        }

        if (apiKey) {
          params.append('key', apiKey);
        }

        const url = `${baseUrl}?${params.toString()}`;
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };

        if (apiKey) {
          headers.Authorization = `Bearer ${apiKey}`;
        }

        const response = await fetch(url, { headers });

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const parsed = weatherDataSchema.safeParse(data);

        if (!parsed.success) {
          // Return raw data if schema validation fails for advanced API responses
          return {
            ...data,
            _metadata: {
              schemaValidation: 'failed',
              rawResponse: true,
              models: models || [],
            },
          };
        }

        return {
          ...parsed.data,
          _metadata: {
            schemaValidation: 'passed',
            models: models || [],
            timezone: timezone || 'auto',
          },
        };
      } catch (error) {
        logError('Weather API error', {
          operation: 'weather_tool_advanced_api_call',
          error: error instanceof Error ? error : new Error(String(error)),
        });

        return {
          error: 'Failed to fetch weather data',
          message: error instanceof Error ? error.message : 'Unknown error',
          fallback: 'You may want to try again or check the coordinates',
          _metadata: {
            failed: true,
            models: models || [],
          },
        };
      }
    },
  });
}

/**
 * Simple weather tool instance (for backward compatibility)
 */
export const getWeather = getWeatherTool;

/**
 * Advanced weather tool instance with default configuration
 */
const getAdvancedWeather = createAdvancedWeatherTool();

/**
 * Weather tools collection for easy export
 */
const weatherTools = {
  basic: getWeatherTool,
  advanced: getAdvancedWeather,
  createAdvanced: createAdvancedWeatherTool,
} as const;

/**
 * Export types for external use
 */
type WeatherData = z.infer<typeof weatherDataSchema>;
type WeatherParameters = z.infer<typeof weatherParameters>;
