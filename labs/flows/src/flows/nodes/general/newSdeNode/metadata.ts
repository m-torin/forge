import { MetaType } from '#/flows/types';

export const metaAwsEventBridgeEventSourceNode: MetaType = {
  displayName: 'AwsEventBridge Source',
  group: 'source',
  color: 'green',
  icon: 'IconBrandAws',
  type: 'awsEventBridgeSource',
};

export const metaAwsEventBridgeEventDestinationNode: MetaType = {
  displayName: 'AwsEventBridge Destination',
  group: 'destination',
  color: 'red',
  icon: 'IconBrandAws',
  type: 'awsEventBridgeDestination',
};

export const metaAwsEventBridgeEventEnrichmentNode: MetaType = {
  displayName: 'AwsEventBridge Enrichment',
  group: 'general',
  color: 'blue',
  icon: 'IconBrandAws',
  type: 'awsEventBridgeEnrichment',
};
