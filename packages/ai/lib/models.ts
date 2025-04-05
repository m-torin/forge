import { createOpenAI } from "@ai-sdk/openai";

import { keys } from "../keys.ts";

const openai = createOpenAI({
  apiKey: keys().OPENAI_API_KEY,
  compatibility: "strict",
});

export const models = {
  chat: openai("gpt-4o-mini"),
  embeddings: openai("text-embedding-3-small"),
};
