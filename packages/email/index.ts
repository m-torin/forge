import { Resend } from 'resend';

import { keys } from './keys';

let resendInstance: Resend | null = null;
let hasLoggedWarning = false;

export const resend = new Proxy({ emails: {} } as Resend, {
  get(_, prop) {
    const { RESEND_TOKEN } = keys();

    // Return no-op functions if token is missing
    if (!RESEND_TOKEN) {
      if (!hasLoggedWarning) {
        console.warn('Resend email service is disabled: Missing RESEND_TOKEN');
        hasLoggedWarning = true;
      }

      if (typeof prop === 'string' && ['emails', 'send'].includes(prop)) {
        return {
          create: () => Promise.resolve({ data: { id: 'mock-email-id' }, error: null }),
          send: () => Promise.resolve({ data: { id: 'mock-email-id' }, error: null }),
        };
      }
      return undefined;
    }

    // Initialize Resend instance on first use
    if (!resendInstance) {
      resendInstance = new Resend(RESEND_TOKEN);
    }

    return resendInstance[prop as keyof Resend];
  },
});
