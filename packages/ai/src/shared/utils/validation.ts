export function validateMaxTokens(maxTokens?: number): void {
  if (maxTokens !== undefined) {
    if (typeof maxTokens !== 'number' || maxTokens < 1) {
      throw new Error('Max tokens must be a positive number');
    }
  }
}

export function validatePrompt(prompt: string): void {
  if (!prompt || typeof prompt !== 'string') {
    throw new Error('Prompt is required and must be a string');
  }

  if (prompt.trim().length === 0) {
    throw new Error('Prompt cannot be empty');
  }
}

export function validateTemperature(temperature?: number): void {
  if (temperature !== undefined) {
    if (typeof temperature !== 'number' || temperature < 0 || temperature > 1) {
      throw new Error('Temperature must be a number between 0 and 1');
    }
  }
}
