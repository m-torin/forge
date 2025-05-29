import 'server-only';
import { Svix } from 'svix';

import { auth } from '@repo/auth/server';

import { keys } from '../keys';

let svix: Svix | null = null;
let hasLoggedWarning = false;

const getSvix = () => {
  const svixToken = keys().SVIX_TOKEN;

  if (!svixToken) {
    if (!hasLoggedWarning) {
      console.warn('[Webhooks] SVIX_TOKEN not configured. Webhook functionality is disabled.');
      hasLoggedWarning = true;
    }
    return null;
  }

  if (!svix) {
    svix = new Svix(svixToken);
  }

  return svix;
};

export const send = async (eventType: string, payload: object) => {
  const svixClient = getSvix();

  if (!svixClient) {
    // Silently return when Svix is not configured
    return;
  }

  const session = await auth.api.getSession({
    headers: new Headers(), // You'll need to pass proper headers in real usage
  });
  const orgId = session?.session?.activeOrganizationId;

  if (!orgId) {
    return;
  }

  return svixClient.message.create(orgId, {
    application: {
      uid: orgId,
      name: orgId,
    },
    eventType,
    payload: {
      eventType,
      ...payload,
    },
  });
};

export const getAppPortal = async () => {
  const svixClient = getSvix();

  if (!svixClient) {
    // Return null when Svix is not configured
    return null;
  }

  const session = await auth.api.getSession({
    headers: new Headers(), // You'll need to pass proper headers in real usage
  });
  const orgId = session?.session?.activeOrganizationId;

  if (!orgId) {
    return null;
  }

  return svixClient.authentication.appPortalAccess(orgId, {
    application: {
      uid: orgId,
      name: orgId,
    },
  });
};
