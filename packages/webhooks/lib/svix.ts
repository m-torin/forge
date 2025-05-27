import 'server-only';
import { Svix } from 'svix';

import { auth } from '@repo/auth/server';

import { keys } from '../keys';

const svixToken = keys().SVIX_TOKEN;

export const send = async (eventType: string, payload: object) => {
  if (!svixToken) {
    throw new Error('SVIX_TOKEN is not set');
  }

  const svix = new Svix(svixToken);
  const session = await auth.api.getSession({
    headers: new Headers(), // You'll need to pass proper headers in real usage
  });
  const orgId = session?.session?.activeOrganizationId;

  if (!orgId) {
    return;
  }

  return svix.message.create(orgId, {
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
  if (!svixToken) {
    throw new Error('SVIX_TOKEN is not set');
  }

  const svix = new Svix(svixToken);
  const session = await auth.api.getSession({
    headers: new Headers(), // You'll need to pass proper headers in real usage
  });
  const orgId = session?.session?.activeOrganizationId;

  if (!orgId) {
    return;
  }

  return svix.authentication.appPortalAccess(orgId, {
    application: {
      uid: orgId,
      name: orgId,
    },
  });
};
