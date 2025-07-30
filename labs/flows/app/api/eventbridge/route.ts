import type { NextRequest } from 'next/server';
import { logError, logInfo } from '@repo/observability';
import {
  EventBridgeClient,
  DescribeEventBusCommand,
  DescribeEventBusCommandOutput,
  ListRulesCommand,
  ListRulesCommandOutput,
  DescribeRuleCommand,
  ListEventBusesCommand,
  ListRuleNamesByTargetCommand,
  ListTagsForResourceCommand,
  ListTargetsByRuleCommand,
} from '@aws-sdk/client-eventbridge';

const client = new EventBridgeClient({
  region: 'us-gov-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    // sessionToken: "YOUR_SESSION_TOKEN" // only necessary for temporary credentials
  },
});

const fetchAllEventBridgeDetails = async (eventBusName = 'default') => {
  try {
    // Fetch basic information about the specified EventBus and assert the type
    const eventBusDetails: DescribeEventBusCommandOutput = await client.send(
      new DescribeEventBusCommand({
        Name: eventBusName,
      }),
    );

    const allEventBuses = await client.send(new ListEventBusesCommand({}));
    // const allEventSources = await client.send(new ListEventSourcesCommand({}));
    // const allPartnerEventSources = await client.send(new ListPartnerEventSourcesCommand({}));

    // List rules and their details for the specified EventBus and assert the type
    const rulesDetails: ListRulesCommandOutput = await client.send(
      new ListRulesCommand({ EventBusName: eventBusName }),
    );

    // Ensure rulesDetails.Rules is defined before proceeding
    const detailedRules = rulesDetails.Rules
      ? await Promise.all(
          rulesDetails.Rules.map(async (rule) => {
            const ruleDetail = await client.send(
              new DescribeRuleCommand({
                Name: rule.Name,
                EventBusName: eventBusName,
              }),
            );
            const targetsResponse = await client.send(
              new ListTargetsByRuleCommand({
                Rule: rule.Name,
                EventBusName: eventBusName,
              }),
            );

            // Check if targetsResponse.Targets is defined before proceeding
            const ruleNamesByTargets = targetsResponse.Targets
              ? await Promise.all(
                  targetsResponse.Targets.map(async (target) => {
                    return client.send(
                      new ListRuleNamesByTargetCommand({
                        TargetArn: target.Arn,
                        EventBusName: eventBusName,
                      }),
                    );
                  }),
                )
              : [];

            return {
              RuleDetail: ruleDetail,
              Targets: targetsResponse.Targets,
              RuleNamesByTargets: ruleNamesByTargets,
            };
          }),
        )
      : [];

    const tags = await client.send(
      new ListTagsForResourceCommand({ ResourceARN: eventBusDetails.Arn }),
    );

    return {
      EventBusDetails: eventBusDetails,
      AllEventBuses: allEventBuses,
      //   AllEventSources: allEventSources,
      //   AllPartnerEventSources: allPartnerEventSources,
      RulesDetails: detailedRules,
      Tags: tags,
    };
  } catch (error) {
    logError('Error fetching EventBridge details', { error });
    throw error;
  }
};

interface DescribeRuleCommandOutput {
  $metadata?: {
    httpStatusCode?: number;
    requestId?: string;
    attempts?: number;
    totalRetryDelay?: number;
  };
  Arn?: string | undefined;
  CreatedBy?: string | undefined;
  Description?: string | undefined;
  EventBusName?: string | undefined;
  EventPattern?: string | undefined;
  Name?: string | undefined;
  State?: string | undefined;
}

interface Target {
  Arn?: string | undefined;
  Id?: string | undefined;
}

interface ListRuleNamesByTargetCommandOutput {
  RuleNames?: string[] | undefined;
}

interface RuleDetailsData {
  RulesDetails: {
    RuleDetail: DescribeRuleCommandOutput;
    Targets: Target[] | undefined;
    RuleNamesByTargets: ListRuleNamesByTargetCommandOutput[];
  }[];
}

const extractRuleDetails = (jsonData: RuleDetailsData) => {
  return (
    jsonData.RulesDetails?.map((rule) => {
      const eventPattern = rule.RuleDetail?.EventPattern
        ? JSON.parse(rule.RuleDetail.EventPattern)
        : {};

      return {
        arn: rule.RuleDetail?.Arn,
        bucketName:
          eventPattern.detail && eventPattern.detail.bucket
            ? eventPattern.detail.bucket.name[0]
            : undefined,
        description: rule.RuleDetail?.Description,
        detailType: eventPattern['detail-type']
          ? eventPattern['detail-type'][0]
          : undefined,
        enabled: rule.RuleDetail?.State === 'ENABLED',
        eventBusName: rule.RuleDetail?.EventBusName,
        name: rule.RuleDetail?.Name,
        source: eventPattern.source ? eventPattern.source[0] : undefined,
        targetArn: rule.Targets?.[0]?.Arn,
      };
    }) ?? []
  );
};

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const eventBusName = url.searchParams.get('id') || 'default';

  try {
    const details = await fetchAllEventBridgeDetails(eventBusName);
    logInfo('EventBridge Details', { details });

    return new Response(
      JSON.stringify({ api: extractRuleDetails(details), details }),
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    logError('Failed to fetch details', { error });
    return new Response(
      JSON.stringify({ error: 'Failed to fetch event bus details and rules' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}
