'use client';

import React, { useState } from 'react';
import {
  Container,
  Title,
  Text,
  Stack,
  Card,
  Group,
  Button,
  TextInput,
  Select,
  Paper,
  Badge,
  ActionIcon,
  Table,
  Code,
  Alert,
  ThemeIcon,
  Tabs,
  TagsInput,
  Switch,
  Modal,
  Collapse,
} from '@mantine/core';
import {
  IconLanguage,
  IconArrowsLeftRight,
  IconArrowRight,
  IconPlus,
  IconTrash,
  IconEdit,
  IconSearch,
  IconCheck,
  IconX,
  IconAlertCircle,
  IconBrandAlgolia,
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';

// Types for Synonyms
interface Synonym {
  objectID: string;
  type: 'synonym' | 'oneWaySynonym' | 'altCorrection1' | 'altCorrection2' | 'placeholder';
  synonyms?: string[];
  input?: string;
  word?: string;
  corrections?: string[];
  replacements?: string[];
  placeholder?: string;
  enabled?: boolean;
}

// Sample synonyms data
const sampleSynonyms: Synonym[] = [
  {
    objectID: 'syn-1',
    type: 'synonym',
    synonyms: ['laptop', 'notebook', 'portable computer', 'macbook'],
    enabled: true,
  },
  {
    objectID: 'syn-2',
    type: 'synonym',
    synonyms: ['phone', 'smartphone', 'mobile', 'cell phone', 'iPhone', 'android'],
    enabled: true,
  },
  {
    objectID: 'syn-3',
    type: 'oneWaySynonym',
    input: 'TV',
    synonyms: ['television', 'smart TV', 'LED TV', 'OLED TV'],
    enabled: true,
  },
  {
    objectID: 'syn-4',
    type: 'oneWaySynonym',
    input: 'cheap',
    synonyms: ['affordable', 'budget', 'economical', 'inexpensive'],
    enabled: true,
  },
  {
    objectID: 'syn-5',
    type: 'altCorrection1',
    word: 'headphones',
    corrections: ['hedphones', 'headfones', 'headphons'],
    enabled: true,
  },
  {
    objectID: 'syn-6',
    type: 'placeholder',
    placeholder: '<color> <product>',
    replacements: ['red laptop', 'blue phone', 'black headphones'],
    enabled: true,
  },
];

// Synonym type configurations
const synonymTypes = {
  synonym: {
    label: 'Multi-directional Synonym',
    icon: IconArrowsLeftRight,
    color: 'blue',
    description: 'All terms are interchangeable',
  },
  oneWaySynonym: {
    label: 'One-way Synonym',
    icon: IconArrowRight,
    color: 'green',
    description: 'Input term maps to synonyms, but not vice versa',
  },
  altCorrection1: {
    label: 'Alternative Correction',
    icon: IconLanguage,
    color: 'orange',
    description: 'Typo corrections with 1 character difference',
  },
  altCorrection2: {
    label: 'Alternative Correction 2',
    icon: IconLanguage,
    color: 'red',
    description: 'Typo corrections with 2 character differences',
  },
  placeholder: {
    label: 'Placeholder',
    icon: IconSearch,
    color: 'purple',
    description: 'Define search patterns with placeholders',
  },
};

// Synonym editor modal
function SynonymEditor({
  synonym,
  onSave,
  onClose,
}: {
  synonym?: Synonym;
  onSave: (synonym: Synonym) => void;
  onClose: () => void;
}) {
  const [editingSynonym, setEditingSynonym] = useState<Synonym>(
    synonym || {
      objectID: `syn-${Date.now()}`,
      type: 'synonym',
      synonyms: [],
      enabled: true,
    },
  );

  const handleSave = () => {
    onSave(editingSynonym);
    onClose();
  };

  return (
    <Modal
      opened={true}
      onClose={onClose}
      title={synonym ? 'Edit Synonym' : 'Create New Synonym'}
      size="lg"
    >
      <Stack gap="md">
        <Select
          label="Synonym Type"
          value={editingSynonym.type}
          onChange={(value) =>
            setEditingSynonym({
              ...editingSynonym,
              type: value as Synonym['type'],
              // Reset fields when type changes
              synonyms: value === 'synonym' || value === 'oneWaySynonym' ? [] : undefined,
              input: value === 'oneWaySynonym' ? '' : undefined,
              word: value === 'altCorrection1' || value === 'altCorrection2' ? '' : undefined,
              corrections:
                value === 'altCorrection1' || value === 'altCorrection2' ? [] : undefined,
              placeholder: value === 'placeholder' ? '' : undefined,
              replacements: value === 'placeholder' ? [] : undefined,
            })
          }
          data={Object.entries(synonymTypes).map(([value, config]) => ({
            value,
            label: config.label,
          }))}
        />

        <Alert icon={<IconAlertCircle />} c="blue">
          <Text size="md">{synonymTypes[editingSynonym.type].description}</Text>
        </Alert>

        {/* Multi-directional synonyms */}
        {editingSynonym.type === 'synonym' && (
          <TagsInput
            label="Synonyms (all interchangeable)"
            value={editingSynonym.synonyms || []}
            onChange={(value) => setEditingSynonym({ ...editingSynonym, synonyms: value })}
            placeholder="Add synonyms..."
            clearable
          />
        )}

        {/* One-way synonyms */}
        {editingSynonym.type === 'oneWaySynonym' && (
          <>
            <TextInput
              label="Input Term"
              value={editingSynonym.input || ''}
              onChange={(e) =>
                setEditingSynonym({ ...editingSynonym, input: e.currentTarget.value })
              }
              placeholder="e.g., TV"
              required
            />
            <TagsInput
              label="Maps To (synonyms)"
              value={editingSynonym.synonyms || []}
              onChange={(value) => setEditingSynonym({ ...editingSynonym, synonyms: value })}
              placeholder="e.g., television, smart TV..."
              clearable
            />
          </>
        )}

        {/* Alternative corrections */}
        {(editingSynonym.type === 'altCorrection1' || editingSynonym.type === 'altCorrection2') && (
          <>
            <TextInput
              label="Correct Word"
              value={editingSynonym.word || ''}
              onChange={(e) =>
                setEditingSynonym({ ...editingSynonym, word: e.currentTarget.value })
              }
              placeholder="e.g., headphones"
              required
            />
            <TagsInput
              label="Common Misspellings"
              value={editingSynonym.corrections || []}
              onChange={(value) => setEditingSynonym({ ...editingSynonym, corrections: value })}
              placeholder="e.g., hedphones, headfones..."
              clearable
            />
          </>
        )}

        {/* Placeholders */}
        {editingSynonym.type === 'placeholder' && (
          <>
            <TextInput
              label="Placeholder Pattern"
              value={editingSynonym.placeholder || ''}
              onChange={(e) =>
                setEditingSynonym({ ...editingSynonym, placeholder: e.currentTarget.value })
              }
              placeholder="e.g., <color> <product>"
              description="Use <placeholder> syntax"
              required
            />
            <TagsInput
              label="Example Replacements"
              value={editingSynonym.replacements || []}
              onChange={(value) => setEditingSynonym({ ...editingSynonym, replacements: value })}
              placeholder="e.g., red laptop, blue phone..."
              clearable
            />
          </>
        )}

        <Switch
          label="Enabled"
          checked={editingSynonym.enabled}
          onChange={(e) =>
            setEditingSynonym({ ...editingSynonym, enabled: e.currentTarget.checked })
          }
        />

        <Group justify="flex-end">
          <Button variant="subtle" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </Group>
      </Stack>
    </Modal>
  );
}

// Test synonym matching
function SynonymTester({ synonyms }: { synonyms: Synonym[] }) {
  const [testQuery, setTestQuery] = useState('');
  const [results, setResults] = useState<{ original: string; expanded: string[] }[]>([]);

  const testSynonyms = () => {
    const words = testQuery.toLowerCase().split(' ');
    const expandedResults: { original: string; expanded: string[] }[] = [];

    words.forEach((word) => {
      const expanded = new Set<string>([word]);

      // Check multi-directional synonyms
      synonyms
        .filter((s) => s.type === 'synonym' && s.enabled)
        .forEach((syn) => {
          if (syn.synonyms?.includes(word)) {
            syn.synonyms.forEach((s) => expanded.add(s));
          }
        });

      // Check one-way synonyms
      synonyms
        .filter((s) => s.type === 'oneWaySynonym' && s.enabled)
        .forEach((syn) => {
          if (syn.input?.toLowerCase() === word) {
            syn.synonyms?.forEach((s) => expanded.add(s));
          }
        });

      // Check corrections
      synonyms
        .filter((s) => (s.type === 'altCorrection1' || s.type === 'altCorrection2') && s.enabled)
        .forEach((syn) => {
          if (syn.corrections?.includes(word)) {
            expanded.add(syn.word!);
          }
        });

      if (expanded.size > 1) {
        expandedResults.push({
          original: word,
          expanded: Array.from(expanded).filter((w) => w !== word),
        });
      }
    });

    setResults(expandedResults);
  };

  return (
    <Card shadow="sm" padding="lg" radius="sm" withBorder={true}>
      <Stack gap="md">
        <Title order={3}>Test Synonyms</Title>
        <Group>
          <TextInput
            value={testQuery}
            onChange={(e) => setTestQuery(e.currentTarget.value)}
            placeholder="Enter a search query..."
            style={{ flex: 1 }}
            onKeyDown={(e) => e.key === 'Enter' && testSynonyms()}
          />
          <Button onClick={testSynonyms}>Test</Button>
        </Group>

        {results.length > 0 && (
          <div>
            <Text size="md" fw={600} mb="xs">
              Query Expansion:
            </Text>
            {results.map((result, i) => (
              <Paper key={i} p="xs" withBorder={true} mb="xs">
                <Group>
                  <Badge c="blue">{result.original}</Badge>
                  <IconArrowRight size={16} />
                  {result.expanded.map((word, j) => (
                    <Badge key={j} c="green" variant="light">
                      {word}
                    </Badge>
                  ))}
                </Group>
              </Paper>
            ))}
          </div>
        )}
      </Stack>
    </Card>
  );
}

export default function AlgoliaSynonyms() {
  const [synonyms, setSynonyms] = useState<Synonym[]>(sampleSynonyms);
  const [editingSynonym, setEditingSynonym] = useState<Synonym | null>(null);
  const [isCreating, { open: startCreating, close: stopCreating }] = useDisclosure(false);
  const [activeTab, setActiveTab] = useState<string>('all');

  const saveSynonym = (synonym: Synonym) => {
    const existingIndex = synonyms.findIndex((s) => s.objectID === synonym.objectID);
    if (existingIndex >= 0) {
      const updated = [...synonyms];
      updated[existingIndex] = synonym;
      setSynonyms(updated);
    } else {
      setSynonyms([...synonyms, synonym]);
    }
  };

  const deleteSynonym = (objectID: string) => {
    setSynonyms(synonyms.filter((s) => s.objectID !== objectID));
  };

  const filteredSynonyms =
    activeTab === 'all' ? synonyms : synonyms.filter((s) => s.type === activeTab);

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <div>
          <Group gap="md" mb="md">
            <ThemeIcon size="xl" variant="light" c="blue">
              <IconLanguage />
            </ThemeIcon>
            <div>
              <Title order={1}>Synonyms Management</Title>
              <Text size="lg" c="dimmed">
                Configure search synonyms and corrections
              </Text>
            </div>
          </Group>
        </div>

        {/* Introduction */}
        <Alert icon={<IconBrandAlgolia />} title="Why Use Synonyms?" c="blue">
          <Stack gap="xs">
            <Text size="md">
              Synonyms help users find what they're looking for, regardless of the terms they use:
            </Text>
            <ul>
              <li>
                <strong>Product variations:</strong> laptop → notebook, MacBook
              </li>
              <li>
                <strong>Brand names:</strong> iPhone → Apple phone
              </li>
              <li>
                <strong>Common misspellings:</strong> hedphones → headphones
              </li>
              <li>
                <strong>Regional differences:</strong> sneakers → trainers
              </li>
              <li>
                <strong>Abbreviations:</strong> TV → television
              </li>
            </ul>
          </Stack>
        </Alert>

        {/* Synonym Tester */}
        <SynonymTester synonyms={synonyms} />

        {/* Synonyms Management */}
        <div>
          <Group justify="space-between" mb="md">
            <Title order={2}>Synonym Dictionary</Title>
            <Button leftSection={<IconPlus />} onClick={startCreating}>
              Add Synonym
            </Button>
          </Group>

          {/* Type filter tabs */}
          <Tabs value={activeTab} onChange={(value) => setActiveTab(value || '')}>
            <Tabs.List>
              <Tabs.Tab value="all">All Types</Tabs.Tab>
              {Object.entries(synonymTypes).map(([type, config]) => {
                const Icon = config.icon;
                const count = synonyms.filter((s) => s.type === type).length;
                return (
                  <Tabs.Tab
                    key={type}
                    value={type}
                    leftSection={<Icon size={16} />}
                    rightSection={
                      <Badge size="xs" color={config.color} variant="light">
                        {count}
                      </Badge>
                    }
                  >
                    {config.label}
                  </Tabs.Tab>
                );
              })}
            </Tabs.List>
          </Tabs>

          {/* Synonyms table */}
          <Table striped highlightOnHover mt="md">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Type</Table.Th>
                <Table.Th>Configuration</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredSynonyms.map((synonym) => {
                const typeConfig = synonymTypes[synonym.type];
                const Icon = typeConfig.icon;

                return (
                  <Table.Tr key={synonym.objectID}>
                    <Table.Td>
                      <Group gap="xs">
                        <ThemeIcon size="md" color={typeConfig.color} variant="light">
                          <Icon size={16} />
                        </ThemeIcon>
                        <Badge color={typeConfig.color} variant="light">
                          {typeConfig.label}
                        </Badge>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      {synonym.type === 'synonym' && (
                        <Group gap="xs">
                          {synonym.synonyms?.map((s, i) => (
                            <React.Fragment key={i}>
                              {i > 0 && <IconArrowsLeftRight size={14} />}
                              <Badge>{s}</Badge>
                            </React.Fragment>
                          ))}
                        </Group>
                      )}
                      {synonym.type === 'oneWaySynonym' && (
                        <Group gap="xs">
                          <Badge c="blue">{synonym.input}</Badge>
                          <IconArrowRight size={14} />
                          {synonym.synonyms?.map((s, i) => (
                            <Badge key={i} c="green">
                              {s}
                            </Badge>
                          ))}
                        </Group>
                      )}
                      {(synonym.type === 'altCorrection1' || synonym.type === 'altCorrection2') && (
                        <Group gap="xs">
                          {synonym.corrections?.map((c, i) => (
                            <Badge key={i} c="red" variant="light">
                              {c}
                            </Badge>
                          ))}
                          <IconArrowRight size={14} />
                          <Badge c="green">{synonym.word}</Badge>
                        </Group>
                      )}
                      {synonym.type === 'placeholder' && <Code>{synonym.placeholder}</Code>}
                    </Table.Td>
                    <Table.Td>
                      <Switch
                        checked={synonym.enabled}
                        onChange={(e) => {
                          const updated = [...synonyms];
                          const index = updated.findIndex((s) => s.objectID === synonym.objectID);
                          updated[index] = { ...synonym, enabled: e.currentTarget.checked };
                          setSynonyms(updated);
                        }}
                      />
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <ActionIcon variant="light" onClick={() => setEditingSynonym(synonym)}>
                          <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon
                          variant="light"
                          c="red"
                          onClick={() => deleteSynonym(synonym.objectID)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </div>

        {/* Synonym editor modal */}
        {(isCreating || editingSynonym) && (
          <SynonymEditor
            synonym={editingSynonym || undefined}
            onSave={saveSynonym}
            onClose={() => {
              setEditingSynonym(null);
              stopCreating();
            }}
          />
        )}

        {/* Implementation guide */}
        <Card shadow="sm" padding="lg" radius="sm" withBorder={true}>
          <Title order={3} mb="md">
            Implementation Code
          </Title>
          <Tabs defaultValue="create">
            <Tabs.List>
              <Tabs.Tab value="create">Create Synonyms</Tabs.Tab>
              <Tabs.Tab value="search">Search with Synonyms</Tabs.Tab>
              <Tabs.Tab value="manage">Manage Synonyms</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="create" pt="md">
              <Code block>
                {`// Multi-directional synonyms
await index.saveSynonym({
  objectID: 'laptop-synonyms',
  type: 'synonym',
  synonyms: ['laptop', 'notebook', 'portable computer']
});

// One-way synonyms
await index.saveSynonym({
  objectID: 'tv-synonyms',
  type: 'oneWaySynonym',
  input: 'TV',
  synonyms: ['television', 'smart TV', 'LED TV']
});

// Typo corrections
await index.saveSynonym({
  objectID: 'headphones-typos',
  type: 'altCorrection1',
  word: 'headphones',
  corrections: ['hedphones', 'headfones']
});`}
              </Code>
            </Tabs.Panel>

            <Tabs.Panel value="search" pt="md">
              <Code block>
                {`// Search automatically uses synonyms
const results = await index.search('TV', {
  synonyms: true // Enabled by default
});

// Results will include items matching:
// - TV
// - television
// - smart TV
// - LED TV`}
              </Code>
            </Tabs.Panel>

            <Tabs.Panel value="manage" pt="md">
              <Code block>
                {`// List all synonyms
const { hits } = await index.searchSynonyms('');

// Delete a synonym
await index.deleteSynonym('laptop-synonyms');

// Clear all synonyms
await index.clearSynonyms();

// Export synonyms for backup
const allSynonyms: any[] = [];
await index.browseSynonyms({
  batch: (batch: any) => {
    allSynonyms.push(...batch)
  }
});`}
              </Code>
            </Tabs.Panel>
          </Tabs>
        </Card>
      </Stack>
    </Container>
  );
}
