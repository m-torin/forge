import type { UserType } from '@/app/(auth)/auth';
import { CHAT_MODEL_IDS, type ChatModelId } from './models';

interface Entitlements {
  maxMessagesPerDay: number;
  availableChatModelIds: ChatModelId[];
}

export const entitlementsByUserType: Record<UserType, Entitlements> = {
  /*
   * For users without an account
   */
  guest: {
    maxMessagesPerDay: 20,
    availableChatModelIds: [...CHAT_MODEL_IDS],
  },

  /*
   * For users with an account
   */
  regular: {
    maxMessagesPerDay: 100,
    availableChatModelIds: [...CHAT_MODEL_IDS],
  },

  /*
   * TODO: For users with an account and a paid membership
   */
};
