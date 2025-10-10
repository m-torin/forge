import { ANTHROPIC_MODEL_IDS } from '../../src/providers/anthropic';
import { OPENAI_MODEL_IDS } from '../../src/providers/openai';
import { PERPLEXITY_MODEL_IDS } from '../../src/providers/perplexity';

export const OPENAI_REASONING = [
  OPENAI_MODEL_IDS.O1,
  OPENAI_MODEL_IDS.O1_MINI,
  OPENAI_MODEL_IDS.O3,
  OPENAI_MODEL_IDS.O3_MINI,
  OPENAI_MODEL_IDS.O4_MINI,
];

export const OPENAI_CHAT = [
  OPENAI_MODEL_IDS.GPT_4O,
  OPENAI_MODEL_IDS.GPT_4O_MINI,
  OPENAI_MODEL_IDS.GPT_41,
];

export const ANTHROPIC_PDF = [ANTHROPIC_MODEL_IDS.SONNET_35];
export const PPLX_RESEARCH = [PERPLEXITY_MODEL_IDS.SONAR_DEEP_RESEARCH];
