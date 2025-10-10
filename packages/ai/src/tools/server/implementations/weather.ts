import { createToolFromSpec } from '../specifications';

/**
 * Weather tool implementation
 * This is a mock implementation - replace with actual weather API
 */
export const weatherTool = createToolFromSpec('weather', {
  execute: async (params: unknown) => {
    const { latitude, units = 'celsius' } = params as { latitude: any; units?: string };
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

// Only one weather tool needed - the main weatherTool above provides all necessary functionality
