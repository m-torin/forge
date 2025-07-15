import { MetaType } from '#/flows/types';

export const metaWebhookSourceNode: MetaType = {
  displayName: 'Webhook Source',
  group: 'source',
  color: 'green',
  icon: 'IconWebhook',
  type: 'webhookSource',
};

export const metaWebhookEnrichmentNode: MetaType = {
  displayName: 'Webhook Enrichment',
  group: 'general',
  color: 'blue',
  icon: 'IconWebhook',
  type: 'webhook',
};

export const metaWebhookDestinationNode: MetaType = {
  displayName: 'Webhook Destination',
  group: 'destination',
  color: 'red',
  icon: 'IconWebhook',
  type: 'webhookDestination',
};
