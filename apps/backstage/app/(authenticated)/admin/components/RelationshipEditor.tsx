'use client';

import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  Group,
  Modal,
  MultiSelect,
  NumberInput,
  Select,
  Stack,
  Table,
  Text,
  Textarea,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconEdit, IconPlus, IconSearch, IconTrash } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import type { RelationshipEditorConfig } from '../lib/relationship-editor-config';

interface RelationshipEditorProps {
  availableEntities: any[];
  config: RelationshipEditorConfig;
  currentRelationships: any[];
  onCreateEntity?: (data: any) => Promise<any>;
  onRelationshipChange: (relationships: any[]) => void;
  primaryEntityId: string;
}

export function RelationshipEditor({
  availableEntities,
  config,
  currentRelationships,
  onCreateEntity,
  onRelationshipChange,
  primaryEntityId,
}: RelationshipEditorProps) {
  const [selectedEntities, setSelectedEntities] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [opened, { close, open }] = useDisclosure(false);
  const [editingJunction, setEditingJunction] = useState<any>(null);
  const [junctionData, setJunctionData] = useState<Record<string, any>>({});

  // Initialize selected entities from current relationships
  useEffect(() => {
    setSelectedEntities(currentRelationships);
  }, [currentRelationships]);

  // Filter available entities based on search and filters
  const filteredEntities = availableEntities.filter((entity) => {
    // Search filter
    if (searchTerm) {
      const searchText = [entity.name, entity.title, entity.slug, entity.description]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!searchText.includes(searchTerm.toLowerCase())) {
        return false;
      }
    }

    // Field filters
    if (config.filterFields) {
      for (const field of config.filterFields) {
        const filterValue = filterValues[field];
        if (filterValue && entity[field] !== filterValue) {
          return false;
        }
      }
    }

    return true;
  });

  // Handle entity selection
  const handleEntitySelect = (entity: any) => {
    if (!config.allowMultiSelect) {
      setSelectedEntities([entity]);
      onRelationshipChange([entity]);
      return;
    }

    const isSelected = selectedEntities.some((selected) => selected.id === entity.id);

    if (isSelected) {
      const updated = selectedEntities.filter((selected) => selected.id !== entity.id);
      setSelectedEntities(updated);
      onRelationshipChange(updated);
    } else {
      // Check max selections
      if (config.maxSelections && selectedEntities.length >= config.maxSelections) {
        notifications.show({
          color: 'yellow',
          message: `Maximum ${config.maxSelections} selections allowed`,
          title: 'Selection Limit Reached',
        });
        return;
      }

      const updated = [...selectedEntities, entity];
      setSelectedEntities(updated);
      onRelationshipChange(updated);
    }
  };

  // Handle junction data editing
  const handleJunctionEdit = (entity: any, junctionInfo?: any) => {
    setEditingJunction(entity);

    // Initialize junction data with defaults
    const initialData: Record<string, any> = {};
    config.junctionFields?.forEach((field) => {
      if (junctionInfo && junctionInfo[field.name] !== undefined) {
        initialData[field.name] = junctionInfo[field.name];
      } else if (field.defaultValue !== undefined) {
        initialData[field.name] = field.defaultValue;
      }
    });

    setJunctionData(initialData);
    open();
  };

  // Save junction data
  const handleJunctionSave = () => {
    if (!editingJunction) return;

    // Update the relationship with junction data
    const updated = selectedEntities.map((entity) => {
      if (entity.id === editingJunction.id) {
        return {
          ...entity,
          junctionData: { ...junctionData },
        };
      }
      return entity;
    });

    setSelectedEntities(updated);
    onRelationshipChange(updated);
    close();
    setEditingJunction(null);
    setJunctionData({});
  };

  // Render junction field editor
  const renderJunctionField = (field: any) => {
    const value = junctionData[field.name];

    switch (field.type) {
      case 'text':
        return (
          <TextInput
            key={field.name}
            onChange={(e) => setJunctionData((prev) => ({ ...prev, [field.name]: e.target.value }))}
            label={field.label}
            required={field.required}
            value={value || ''}
          />
        );

      case 'textarea':
        return (
          <Textarea
            key={field.name}
            onChange={(e) => setJunctionData((prev) => ({ ...prev, [field.name]: e.target.value }))}
            label={field.label}
            required={field.required}
            value={value || ''}
          />
        );

      case 'number':
        return (
          <NumberInput
            key={field.name}
            onChange={(val) => setJunctionData((prev) => ({ ...prev, [field.name]: val }))}
            label={field.label}
            required={field.required}
            value={value || 0}
          />
        );

      case 'checkbox':
        return (
          <Checkbox
            key={field.name}
            onChange={(e) =>
              setJunctionData((prev) => ({ ...prev, [field.name]: e.target.checked }))
            }
            checked={value || false}
            label={field.label}
          />
        );

      case 'select':
        return (
          <Select
            key={field.name}
            onChange={(val) => setJunctionData((prev) => ({ ...prev, [field.name]: val }))}
            data={field.options || []}
            label={field.label}
            required={field.required}
            value={value || ''}
          />
        );

      case 'multiselect':
        return (
          <MultiSelect
            key={field.name}
            onChange={(val) => setJunctionData((prev) => ({ ...prev, [field.name]: val }))}
            data={field.options || []}
            label={field.label}
            required={field.required}
            value={value || []}
          />
        );

      default:
        return null;
    }
  };

  // Render based on display mode
  if (config.displayMode === 'chips') {
    return (
      <Box>
        <Group justify="space-between" mb="sm">
          <Text fw={500}>{config.name}</Text>
          <Button leftSection={<IconPlus size={14} />} onClick={open} size="xs" variant="light">
            Add {config.relatedEntity}
          </Button>
        </Group>

        <Group gap="xs">
          {selectedEntities.map((entity) => (
            <Chip
              key={entity.id}
              onChange={() => handleEntitySelect(entity)}
              checked
              variant="filled"
            >
              {entity.name || entity.title}
              {config.junctionFields && (
                <ActionIcon
                  onClick={(e) => {
                    e.stopPropagation();
                    handleJunctionEdit(entity, entity.junctionData);
                  }}
                  size="xs"
                  variant="transparent"
                >
                  <IconEdit size={10} />
                </ActionIcon>
              )}
            </Chip>
          ))}
        </Group>

        <Modal onClose={close} opened={opened} title={`Select ${config.relatedEntity}`}>
          <Stack>
            {config.searchable && (
              <TextInput
                leftSection={<IconSearch size={16} />}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Search ${config.relatedEntity}...`}
                value={searchTerm}
              />
            )}

            {config.filterFields && (
              <Group>
                {config.filterFields.map((field) => (
                  <Select
                    key={field}
                    onChange={(value) =>
                      setFilterValues((prev) => ({ ...prev, [field]: value || '' }))
                    }
                    placeholder={`Filter by ${field}`}
                    data={[
                      // This would be populated dynamically based on available values
                      { label: `All ${field}`, value: '' },
                    ]}
                    value={filterValues[field] || ''}
                  />
                ))}
              </Group>
            )}

            <Stack style={{ overflow: 'auto' }} mah={300}>
              {filteredEntities.map((entity) => (
                <Card
                  key={entity.id}
                  onClick={() => handleEntitySelect(entity)}
                  withBorder={selectedEntities.some((s) => s.id === entity.id)}
                  style={{ cursor: 'pointer' }}
                  p="sm"
                >
                  <Text fw={500}>{entity.name || entity.title}</Text>
                  {entity.description && (
                    <Text c="dimmed" size="sm">
                      {entity.description}
                    </Text>
                  )}
                </Card>
              ))}
            </Stack>
          </Stack>
        </Modal>

        {/* Junction Data Editor Modal */}
        {editingJunction && config.junctionFields && (
          <Modal
            onClose={() => setEditingJunction(null)}
            opened={!!editingJunction}
            title={`Edit ${config.name} Details`}
          >
            <Stack>
              <Text c="dimmed" size="sm">
                Editing details for: {editingJunction.name || editingJunction.title}
              </Text>

              {config.junctionFields.map(renderJunctionField)}

              <Group justify="flex-end">
                <Button onClick={() => setEditingJunction(null)} variant="light">
                  Cancel
                </Button>
                <Button onClick={handleJunctionSave}>Save</Button>
              </Group>
            </Stack>
          </Modal>
        )}
      </Box>
    );
  }

  if (config.displayMode === 'table') {
    return (
      <Box>
        <Group justify="space-between" mb="sm">
          <Text fw={500}>{config.name}</Text>
          <Button leftSection={<IconPlus size={14} />} onClick={open} size="xs" variant="light">
            Add {config.relatedEntity}
          </Button>
        </Group>

        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              {config.junctionFields?.map((field) => (
                <Table.Th key={field.name}>{field.label}</Table.Th>
              ))}
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {selectedEntities.map((entity) => (
              <Table.Tr key={entity.id}>
                <Table.Td>{entity.name || entity.title}</Table.Td>
                {config.junctionFields?.map((field) => (
                  <Table.Td key={field.name}>{entity.junctionData?.[field.name] || '—'}</Table.Td>
                ))}
                <Table.Td>
                  <Group gap="xs">
                    {config.junctionFields && (
                      <Tooltip label="Edit details">
                        <ActionIcon
                          onClick={() => handleJunctionEdit(entity, entity.junctionData)}
                          size="sm"
                          variant="light"
                        >
                          <IconEdit size={14} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                    <Tooltip label="Remove">
                      <ActionIcon
                        color="red"
                        onClick={() => handleEntitySelect(entity)}
                        size="sm"
                        variant="light"
                      >
                        <IconTrash size={14} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>

        {/* Entity Selection Modal */}
        <Modal onClose={close} opened={opened} size="lg" title={`Select ${config.relatedEntity}`}>
          <Stack>
            {config.searchable && (
              <TextInput
                leftSection={<IconSearch size={16} />}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Search ${config.relatedEntity}...`}
                value={searchTerm}
              />
            )}

            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Select</Table.Th>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Details</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredEntities.map((entity) => (
                  <Table.Tr key={entity.id}>
                    <Table.Td>
                      <Checkbox
                        onChange={() => handleEntitySelect(entity)}
                        checked={selectedEntities.some((s) => s.id === entity.id)}
                      />
                    </Table.Td>
                    <Table.Td>{entity.name || entity.title}</Table.Td>
                    <Table.Td>
                      <Text c="dimmed" size="sm">
                        {entity.description || entity.status || '—'}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Stack>
        </Modal>

        {/* Junction Data Editor Modal */}
        {editingJunction && config.junctionFields && (
          <Modal
            onClose={() => setEditingJunction(null)}
            opened={!!editingJunction}
            title={`Edit ${config.name} Details`}
          >
            <Stack>
              <Text c="dimmed" size="sm">
                Editing details for: {editingJunction.name || editingJunction.title}
              </Text>

              {config.junctionFields.map(renderJunctionField)}

              <Group justify="flex-end">
                <Button onClick={() => setEditingJunction(null)} variant="light">
                  Cancel
                </Button>
                <Button onClick={handleJunctionSave}>Save</Button>
              </Group>
            </Stack>
          </Modal>
        )}
      </Box>
    );
  }

  // Default cards display mode
  return (
    <Box>
      <Group justify="space-between" mb="sm">
        <Text fw={500}>{config.name}</Text>
        <Button leftSection={<IconPlus size={14} />} onClick={open} size="xs" variant="light">
          Add {config.relatedEntity}
        </Button>
      </Group>

      <Group>
        {selectedEntities.map((entity) => (
          <Card key={entity.id} withBorder p="sm">
            <Group justify="space-between">
              <Stack gap="xs">
                <Text fw={500} size="sm">
                  {entity.name || entity.title}
                </Text>
                {entity.junctionData && config.junctionFields && (
                  <Group gap="xs">
                    {config.junctionFields.map((field) => {
                      const value = entity.junctionData[field.name];
                      if (!value) return null;
                      return (
                        <Badge key={field.name} size="xs" variant="light">
                          {field.label}: {value}
                        </Badge>
                      );
                    })}
                  </Group>
                )}
              </Stack>
              <Group gap="xs">
                {config.junctionFields && (
                  <ActionIcon
                    onClick={() => handleJunctionEdit(entity, entity.junctionData)}
                    size="sm"
                    variant="light"
                  >
                    <IconEdit size={14} />
                  </ActionIcon>
                )}
                <ActionIcon
                  color="red"
                  onClick={() => handleEntitySelect(entity)}
                  size="sm"
                  variant="light"
                >
                  <IconTrash size={14} />
                </ActionIcon>
              </Group>
            </Group>
          </Card>
        ))}
      </Group>

      {/* Entity Selection Modal */}
      <Modal onClose={close} opened={opened} size="lg" title={`Select ${config.relatedEntity}`}>
        <Stack>
          {config.searchable && (
            <TextInput
              leftSection={<IconSearch size={16} />}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search ${config.relatedEntity}...`}
              value={searchTerm}
            />
          )}

          <Stack style={{ overflow: 'auto' }} gap="xs" mah={400}>
            {filteredEntities.map((entity) => (
              <Card
                key={entity.id}
                onClick={() => handleEntitySelect(entity)}
                withBorder={selectedEntities.some((s) => s.id === entity.id)}
                style={{ cursor: 'pointer' }}
                p="sm"
              >
                <Group justify="space-between">
                  <Stack gap="xs">
                    <Text fw={500}>{entity.name || entity.title}</Text>
                    {entity.description && (
                      <Text c="dimmed" size="sm">
                        {entity.description}
                      </Text>
                    )}
                  </Stack>
                  <Checkbox checked={selectedEntities.some((s) => s.id === entity.id)} readOnly />
                </Group>
              </Card>
            ))}
          </Stack>
        </Stack>
      </Modal>

      {/* Junction Data Editor Modal */}
      {editingJunction && config.junctionFields && (
        <Modal
          onClose={() => setEditingJunction(null)}
          opened={!!editingJunction}
          title={`Edit ${config.name} Details`}
        >
          <Stack>
            <Text c="dimmed" size="sm">
              Editing details for: {editingJunction.name || editingJunction.title}
            </Text>

            {config.junctionFields.map(renderJunctionField)}

            <Group justify="flex-end">
              <Button onClick={() => setEditingJunction(null)} variant="light">
                Cancel
              </Button>
              <Button onClick={handleJunctionSave}>Save</Button>
            </Group>
          </Stack>
        </Modal>
      )}
    </Box>
  );
}
