import { createToolFromSpec } from '../specifications';

/**
 * Weather tool implementation
 * This is a mock implementation - replace with actual weather API
 */
export const weatherTool = createToolFromSpec('weather', {
  execute: async ({ latitude, units = 'celsius' }) => {
    // Mock implementation
    // In production, this would call a weather API like OpenWeatherMap

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Generate mock weather data based on latitude
    const baseTemp = 20 - Math.abs(latitude) / 4;
    const variation = Math.random() * 10 - 5;
    const temperature = Math.round(baseTemp + variation);

    const descriptions = [
      'Clear sky',
      'Few clouds',
      'Scattered clouds',
      'Broken clouds',
      'Light rain',
      'Moderate rain',
    ];

    const description = descriptions[Math.floor(Math.random() * descriptions.length)];

    return {
      temperature: units === 'fahrenheit' ? Math.round((temperature * 9) / 5 + 32) : temperature,
      unit: units === 'fahrenheit' ? '°F' : '°C',
      description,
      humidity: Math.round(40 + Math.random() * 40),
      windSpeed: Math.round(5 + Math.random() * 20),
      precipitation: description.includes('rain') ? Math.round(Math.random() * 10) : 0,
    };
  },
});

/**
 * Enhanced weather tool with additional features
 */
export const enhancedWeatherTool = createToolFromSpec('weather', {
  execute: async ({ latitude, units = 'celsius' }) => {
    // Enhanced implementation with more detailed data
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 150));

    // Generate more realistic weather data
    const baseTemp = 20 - Math.abs(latitude) / 4;
    const variation = Math.random() * 10 - 5;
    const temperature = Math.round(baseTemp + variation);

    const descriptions = [
      'Clear sky',
      'Few clouds',
      'Scattered clouds',
      'Broken clouds',
      'Light rain',
      'Moderate rain',
      'Heavy rain',
      'Thunderstorm',
    ];

    const description = descriptions[Math.floor(Math.random() * descriptions.length)];

    return {
      temperature: units === 'fahrenheit' ? Math.round((temperature * 9) / 5 + 32) : temperature,
      unit: units === 'fahrenheit' ? '°F' : '°C',
      description,
      humidity: Math.round(40 + Math.random() * 40),
      windSpeed: Math.round(5 + Math.random() * 20),
      windDirection: Math.round(Math.random() * 360),
      pressure: Math.round(1000 + Math.random() * 50),
      visibility: Math.round(5 + Math.random() * 15),
      precipitation: description.includes('rain') ? Math.round(Math.random() * 10) : 0,
      uvIndex: Math.round(1 + Math.random() * 10),
      feelsLike:
        units === 'fahrenheit'
          ? Math.round(((temperature + Math.random() * 5) * 9) / 5 + 32)
          : Math.round(temperature + Math.random() * 5),
    };
  },
});
