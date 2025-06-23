'use client';

import React, { useState } from 'react';
import {
  Container,
  Title,
  Text,
  Stack,
  Card,
  Grid,
  Badge,
  Group,
  Button,
  TextInput,
  Select,
  Switch,
  Paper,
  Code,
  Alert,
  ThemeIcon,
  ActionIcon,
  JsonInput,
  NumberInput,
} from '@mantine/core';
import {
  IconSparkles,
  IconCalendar,
  IconFilter,
  IconPlus,
  IconTrash,
  IconEdit,
  IconBrandAlgolia,
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';

// Types for Query Rules
interface QueryRule {
  id: string;
  name: string;
  conditions: RuleCondition[];
  consequences: RuleConsequence[];
  enabled: boolean;
  priority?: number;
  validity?: {
    from?: string;
    to?: string;
  };
  tags?: string[];
}

interface RuleCondition {
  pattern: string;
  anchoring?: 'is' | 'startsWith' | 'endsWith' | 'contains';
  alternatives?: boolean;
}

interface RuleConsequence {
  type: 'promote' | 'hide' | 'boost' | 'bury' | 'filter' | 'redirect' | 'userData';
  objectIDs?: string[];
  position?: number;
  filters?: string;
  redirect?: string;
  userData?: any;
}

// Sample query rules
const sampleRules: QueryRule[] = [
  {
    id: 'rule-1',
    name: 'Black Friday Promotion',
    conditions: [
      { pattern: 'black friday', anchoring: 'contains', alternatives: true },
      { pattern: 'deals', anchoring: 'contains' },
    ],
    consequences: [
      { type: 'promote', objectIDs: ['bf-deal-1', 'bf-deal-2'], position: 0 },
      { type: 'filter', filters: 'onSale:true' },
      { type: 'userData', userData: { banner: 'black-friday-2024.jpg' } },
    ],
    enabled: true,
    priority: 100,
    validity: {
      from: '2024-11-20',
      to: '2024-11-30',
    },
    tags: ['seasonal', 'promotion'],
  },
  {
    id: 'rule-2',
    name: 'Hide Out of Stock',
    conditions: [
      { pattern: '*', anchoring: 'is' }, // Apply to all queries
    ],
    consequences: [{ type: 'filter', filters: 'inStock:true' }],
    enabled: true,
    priority: 50,
    tags: ['inventory'],
  },
  {
    id: 'rule-3',
    name: 'Boost Premium Brands',
    conditions: [{ pattern: 'laptop', anchoring: 'contains' }],
    consequences: [{ type: 'boost', objectIDs: ['apple-macbook-pro', 'dell-xps-15'] }],
    enabled: true,
    priority: 75,
    tags: ['merchandising'],
  },
];

// Rule condition editor
function RuleConditionEditor({
  condition,
  onChange,
  onRemove,
}: {
  condition: RuleCondition;
  onChange: (condition: RuleCondition) => void;
  onRemove: () => void;
}) {
  return (
    <Paper p="sm" withBorder={true}>
      <Group align="flex-end">
        <TextInput
          label="Search Pattern"
          value={condition.pattern}
          onChange={(e) => onChange({ ...condition, pattern: e.currentTarget.value })}
          placeholder="e.g., black friday"
          style={{ flex: 1 }}
        />
        <Select
          label="Matching"
          value={condition.anchoring || 'contains'}
          onChange={(value) => onChange({ ...condition, anchoring: value as any })}
          data={[
            { value: 'is', label: 'Exact match' },
            { value: 'startsWith', label: 'Starts with' },
            { value: 'endsWith', label: 'Ends with' },
            { value: 'contains', label: 'Contains' },
          ]}
          style={{ width: 150 }}
        />
        <Switch
          label="Alternatives"
          checked={condition.alternatives || false}
          onChange={(e) => onChange({ ...condition, alternatives: e.currentTarget.checked })}
        />
        <ActionIcon c="red" onClick={onRemove}>
          <IconTrash size={16} />
        </ActionIcon>
      </Group>
    </Paper>
  );
}

// Rule consequence editor
function RuleConsequenceEditor({
  consequence,
  onChange,
  onRemove,
}: {
  consequence: RuleConsequence;
  onChange: (consequence: RuleConsequence) => void;
  onRemove: () => void;
}) {
  return (
    <Paper p="sm" withBorder={true}>
      <Stack gap="sm">
        <Group>
          <Select
            label="Action Type"
            value={consequence.type}
            onChange={(value) => onChange({ ...consequence, type: value as any })}
            data={[
              { value: 'promote', label: 'Promote Products' },
              { value: 'hide', label: 'Hide Products' },
              { value: 'boost', label: 'Boost Products' },
              { value: 'bury', label: 'Bury Products' },
              { value: 'filter', label: 'Apply Filter' },
              { value: 'redirect', label: 'Redirect' },
              { value: 'userData', label: 'Custom Data' },
            ]}
            style={{ width: 200 }}
          />
          <ActionIcon c="red" onClick={onRemove} mt={25}>
            <IconTrash size={16} />
          </ActionIcon>
        </Group>

        {(consequence.type === 'promote' ||
          consequence.type === 'hide' ||
          consequence.type === 'boost' ||
          consequence.type === 'bury') && (
          <>
            <TextInput
              label="Product IDs (comma-separated)"
              value={consequence.objectIDs?.join(', ') || ''}
              onChange={(e) =>
                onChange({
                  ...consequence,
                  objectIDs: e.currentTarget.value
                    .split(',')
                    .map((id) => id.trim())
                    .filter(Boolean),
                })
              }
              placeholder="product-1, product-2"
            />
            {consequence.type === 'promote' && (
              <NumberInput
                label="Position"
                value={consequence.position || 0}
                onChange={(value) => onChange({ ...consequence, position: Number(value) })}
                min={0}
              />
            )}
          </>
        )}

        {consequence.type === 'filter' && (
          <TextInput
            label="Filter Expression"
            value={consequence.filters || ''}
            onChange={(e) => onChange({ ...consequence, filters: e.currentTarget.value })}
            placeholder="onSale:true AND price < 100"
          />
        )}

        {consequence.type === 'redirect' && (
          <TextInput
            label="Redirect URL"
            value={consequence.redirect || ''}
            onChange={(e) => onChange({ ...consequence, redirect: e.currentTarget.value })}
            placeholder="/special-offers"
          />
        )}

        {consequence.type === 'userData' && (
          <JsonInput
            label="Custom Data (JSON)"
            value={JSON.stringify(consequence.userData || {}, null, 2)}
            onChange={(value) => {
              try {
                onChange({ ...consequence, userData: JSON.parse(value) });
              } catch (_error) {
                // Invalid JSON, ignore
              }
            }}
            minRows={3}
          />
        )}
      </Stack>
    </Paper>
  );
}

// Query rule editor
function QueryRuleEditor({
  rule,
  onSave,
  onCancel,
}: {
  rule?: QueryRule;
  onSave: (rule: QueryRule) => void;
  onCancel: () => void;
}) {
  const [editingRule, setEditingRule] = useState<QueryRule>(
    rule || {
      id: `rule-${Date.now()}`,
      name: '',
      conditions: [{ pattern: '', anchoring: 'contains' }],
      consequences: [{ type: 'promote', objectIDs: [] }],
      enabled: true,
      tags: [],
    },
  );

  const addCondition = () => {
    setEditingRule({
      ...editingRule,
      conditions: [...editingRule.conditions, { pattern: '', anchoring: 'contains' }],
    });
  };

  const addConsequence = () => {
    setEditingRule({
      ...editingRule,
      consequences: [...editingRule.consequences, { type: 'promote', objectIDs: [] }],
    });
  };

  return (
    <Card shadow="sm" padding="lg" radius="sm" withBorder={true}>
      <Stack gap="md">
        <TextInput
          label="Rule Name"
          value={editingRule.name}
          onChange={(e) => setEditingRule({ ...editingRule, name: e.currentTarget.value })}
          placeholder="e.g., Black Friday Promotion"
          required
        />

        <div>
          <Group justify="space-between" mb="sm">
            <Text fw={600}>Conditions (IF)</Text>
            <Button size="xs" leftSection={<IconPlus size={14} />} onClick={addCondition}>
              Add Condition
            </Button>
          </Group>
          <Stack gap="sm">
            {editingRule.conditions.map((condition, index) => (
              <RuleConditionEditor
                key={index}
                condition={condition}
                onChange={(updated) => {
                  const conditions = [...editingRule.conditions];
                  conditions[index] = updated;
                  setEditingRule({ ...editingRule, conditions });
                }}
                onRemove={() => {
                  setEditingRule({
                    ...editingRule,
                    conditions: editingRule.conditions.filter((_, i) => i !== index),
                  });
                }}
              />
            ))}
          </Stack>
        </div>

        <div>
          <Group justify="space-between" mb="sm">
            <Text fw={600}>Consequences (THEN)</Text>
            <Button size="xs" leftSection={<IconPlus size={14} />} onClick={addConsequence}>
              Add Consequence
            </Button>
          </Group>
          <Stack gap="sm">
            {editingRule.consequences.map((consequence, index) => (
              <RuleConsequenceEditor
                key={index}
                consequence={consequence}
                onChange={(updated) => {
                  const consequences = [...editingRule.consequences];
                  consequences[index] = updated;
                  setEditingRule({ ...editingRule, consequences });
                }}
                onRemove={() => {
                  setEditingRule({
                    ...editingRule,
                    consequences: editingRule.consequences.filter((_, i) => i !== index),
                  });
                }}
              />
            ))}
          </Stack>
        </div>

        <Grid>
          <Grid.Col span={6}>
            <NumberInput
              label="Priority"
              value={editingRule.priority || 0}
              onChange={(value) => setEditingRule({ ...editingRule, priority: Number(value) })}
              min={0}
              max={1000}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Switch
              label="Enabled"
              checked={editingRule.enabled}
              onChange={(e) => setEditingRule({ ...editingRule, enabled: e.currentTarget.checked })}
              mt="lg"
            />
          </Grid.Col>
        </Grid>

        <Group justify="flex-end">
          <Button variant="subtle" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={() => onSave(editingRule)}>Save Rule</Button>
        </Group>
      </Stack>
    </Card>
  );
}

export default function AlgoliaQueryRules() {
  const [rules, setRules] = useState<QueryRule[]>(sampleRules);
  const [editingRule, setEditingRule] = useState<QueryRule | null>(null);
  const [isCreating, { open: startCreating, close: stopCreating }] = useDisclosure(false);
  const [testQuery, setTestQuery] = useState('');

  const saveRule = (rule: QueryRule) => {
    const existingIndex = rules.findIndex((r) => r.id === rule.id);
    if (existingIndex >= 0) {
      const updated = [...rules];
      updated[existingIndex] = rule;
      setRules(updated);
    } else {
      setRules([...rules, rule]);
    }
    setEditingRule(null);
    stopCreating();
  };

  const deleteRule = (ruleId: string) => {
    setRules(rules.filter((r) => r.id !== ruleId));
  };

  // Test which rules match a query
  const getMatchingRules = (query: string) => {
    return rules
      .filter((rule) => {
        if (!rule.enabled) return false;

        return rule.conditions.some((condition) => {
          const pattern = condition.pattern.toLowerCase();
          const q = query.toLowerCase();

          switch (condition.anchoring) {
            case 'is':
              return q === pattern || (pattern === '*' && q.length > 0);
            case 'startsWith':
              return q.startsWith(pattern);
            case 'endsWith':
              return q.endsWith(pattern);
            case 'contains':
            default:
              return q.includes(pattern) || pattern === '*';
          }
        });
      })
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));
  };

  const matchingRules = testQuery ? getMatchingRules(testQuery) : [];

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <div>
          <Group gap="md" mb="md">
            <ThemeIcon size="xl" variant="light" c="blue">
              <IconSparkles />
            </ThemeIcon>
            <div>
              <Title order={1}>Query Rules</Title>
              <Text size="lg" c="dimmed">
                Create merchandising rules to control search results
              </Text>
            </div>
          </Group>
        </div>

        {/* Introduction */}
        <Alert icon={<IconBrandAlgolia />} title="What are Query Rules?" c="blue">
          <Stack gap="xs">
            <Text size="md">
              Query Rules allow you to control search results based on specific queries:
            </Text>
            <ul>
              <li>Promote specific products for marketing campaigns</li>
              <li>Hide out-of-stock items automatically</li>
              <li>Redirect users to landing pages</li>
              <li>Apply filters based on query context</li>
              <li>Add custom banners or messages</li>
            </ul>
          </Stack>
        </Alert>

        {/* Test Query */}
        <Card shadow="sm" padding="lg" radius="sm" withBorder={true}>
          <Stack gap="md">
            <Title order={3}>Test Your Rules</Title>
            <TextInput
              label="Test Query"
              value={testQuery}
              onChange={(e) => setTestQuery(e.currentTarget.value)}
              placeholder="Try: black friday, laptop, deals"
              leftSection={<IconFilter size={16} />}
            />
            {testQuery && (
              <div>
                <Text size="md" fw={600} mb="xs">
                  Matching Rules ({matchingRules.length}):
                </Text>
                {matchingRules.length === 0 ? (
                  <Text size="md" c="dimmed">
                    No rules match this query
                  </Text>
                ) : (
                  <Stack gap="xs">
                    {matchingRules.map((rule) => (
                      <Paper key={rule.id} p="xs" withBorder={true}>
                        <Group justify="space-between">
                          <Group>
                            <Badge c="blue">{rule.name}</Badge>
                            <Badge variant="light">Priority: {rule.priority || 0}</Badge>
                          </Group>
                          <Group gap="xs">
                            {rule.consequences.map((c, i) => (
                              <Badge key={i} size="md" variant="dot" c="green">
                                {c.type}
                              </Badge>
                            ))}
                          </Group>
                        </Group>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </div>
            )}
          </Stack>
        </Card>

        {/* Rules Management */}
        <div>
          <Group justify="space-between" mb="md">
            <Title order={2}>Active Rules</Title>
            <Button leftSection={<IconPlus />} onClick={startCreating}>
              Create Rule
            </Button>
          </Group>

          {(isCreating || editingRule) && (
            <QueryRuleEditor
              rule={editingRule || undefined}
              onSave={saveRule}
              onCancel={() => {
                setEditingRule(null);
                stopCreating();
              }}
            />
          )}

          <Stack gap="md" mt="md">
            {rules.map((rule) => (
              <Card key={rule.id} shadow="sm" padding="lg" radius="sm" withBorder={true}>
                <Group justify="space-between" mb="md">
                  <div>
                    <Group>
                      <Title order={4}>{rule.name}</Title>
                      <Switch
                        checked={rule.enabled}
                        onChange={(e) => {
                          const updated = [...rules];
                          const index = updated.findIndex((r) => r.id === rule.id);
                          updated[index] = { ...rule, enabled: e.currentTarget.checked };
                          setRules(updated);
                        }}
                      />
                    </Group>
                    <Group gap="xs" mt="xs">
                      {rule.tags?.map((tag: any) => (
                        <Badge key={tag} size="md" variant="light">
                          {tag}
                        </Badge>
                      ))}
                      {rule.priority && (
                        <Badge size="md" c="blue">
                          Priority: {rule.priority}
                        </Badge>
                      )}
                      {rule.validity && (
                        <Badge size="md" color="orange" leftSection={<IconCalendar size={12} />}>
                          {rule.validity.from} - {rule.validity.to}
                        </Badge>
                      )}
                    </Group>
                  </div>
                  <Group>
                    <ActionIcon variant="light" onClick={() => setEditingRule(rule)}>
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon variant="light" c="red" onClick={() => deleteRule(rule.id)}>
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Group>

                <Grid>
                  <Grid.Col span={6}>
                    <Text size="md" fw={600} mb="xs">
                      Conditions:
                    </Text>
                    <Stack gap="xs">
                      {rule.conditions.map((condition, i) => (
                        <Paper key={i} p="xs" withBorder={true}>
                          <Code block>
                            {condition.anchoring} "{condition.pattern}"
                            {condition.alternatives && ' (+ alternatives)'}
                          </Code>
                        </Paper>
                      ))}
                    </Stack>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text size="md" fw={600} mb="xs">
                      Consequences:
                    </Text>
                    <Stack gap="xs">
                      {rule.consequences.map((consequence, i) => (
                        <Paper key={i} p="xs" withBorder={true}>
                          <Badge c="green" size="md">
                            {consequence.type}
                          </Badge>
                          {consequence.objectIDs && (
                            <Text size="xs" mt="xs">
                              Products: {consequence.objectIDs.join(', ')}
                            </Text>
                          )}
                          {consequence.filters && (
                            <Code block mt="xs">
                              {consequence.filters}
                            </Code>
                          )}
                          {consequence.redirect && (
                            <Text size="xs" mt="xs">
                              → {consequence.redirect}
                            </Text>
                          )}
                        </Paper>
                      ))}
                    </Stack>
                  </Grid.Col>
                </Grid>
              </Card>
            ))}
          </Stack>
        </div>

        {/* Implementation Guide */}
        <Card shadow="sm" padding="lg" radius="sm" withBorder={true}>
          <Title order={3} mb="md">
            Implementation Code
          </Title>
          <Code block>
            {`// Create a query rule
const rule = {
  objectID: 'black-friday-2024',
  conditions: [{
    pattern: 'black friday',
    anchoring: 'contains',
    alternatives: true
  }];
  consequence: {
    promote: [
      { objectID: 'product-1', position: 0 },
      { objectID: 'product-2', position: 1 }
    ],
    filterPromotes: true,
    userData: {
      banner: 'black-friday-banner.jpg'
    }
  };
  validity: {
    from: 1732060800; // Unix timestamp
    until: 1732665600
  }
};

// Save the rule
await index.saveRule(rule);

// Apply rules in search
const results = await index.search('black friday', {
  getRankingInfo: true,
  enableRules: true
});`}
          </Code>
        </Card>
      </Stack>
    </Container>
  );
}
