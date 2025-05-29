import { createOpenAI } from '@ai-sdk/openai';

import { keys } from '../keys';

let openai: ReturnType<typeof createOpenAI> | null = null;
let hasLoggedWarning = false;

const getOpenAI = () => {
  const apiKey = keys().OPENAI_API_KEY;

  if (!apiKey) {
    if (!hasLoggedWarning) {
      console.warn('[AI] OpenAI API key not configured. AI features are disabled.');
      hasLoggedWarning = true;
    }
    return null;
  }

  if (!openai) {
    openai = createOpenAI({
      apiKey,
      compatibility: 'strict',
    });
  }

  return openai;
};

export const models = new Proxy(
  {} as {
    chat: ReturnType<ReturnType<typeof createOpenAI>>;
    embeddings: ReturnType<ReturnType<typeof createOpenAI>>;
  },
  {
    get(target, prop) {
      const ai = getOpenAI();
      if (!ai) {
        throw new Error('OpenAI is not configured. Please set OPENAI_API_KEY.');
      }

      switch (prop) {
        case 'chat':
          return ai('gpt-4o-mini');
        case 'embeddings':
          return ai('text-embedding-3-small');
        default:
          return undefined;
      }
    },
  },
);
