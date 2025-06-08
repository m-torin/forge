'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  Group,
  Modal,
  MultiSelect,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Textarea,
  NumberInput,
  ActionIcon,
  Badge,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconTrash, IconEdit, IconSearch } from '@tabler/icons-react';
import type { RelationshipEditorConfig } from '../lib/relationship-editor-config';

interface RelationshipEditorProps {
  config: RelationshipEditorConfig;
  primaryEntityId: string;
  currentRelationships: any[];
  availableEntities: any[];
  onRelationshipChange: (relationships: any[]) => void;
  onCreateEntity?: (data: any) => Promise<any>;
}

export function RelationshipEditor({
  config,
  primaryEntityId,
  currentRelationships,
  availableEntities,
  onRelationshipChange,
  onCreateEntity,
}: RelationshipEditorProps) {
  const [selectedEntities, setSelectedEntities] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [opened, { open, close }] = useDisclosure(false);
  const [editingJunction, setEditingJunction] = useState<any>(null);
  const [junctionData, setJunctionData] = useState<Record<string, any>>({});

  // Initialize selected entities from current relationships
  useEffect(() => {
    setSelectedEntities(currentRelationships);
  }, [currentRelationships]);

  // Filter available entities based on search and filters
  const filteredEntities = availableEntities.filter(entity => {
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

    const isSelected = selectedEntities.some(selected => selected.id === entity.id);
    
    if (isSelected) {
      const updated = selectedEntities.filter(selected => selected.id !== entity.id);
      setSelectedEntities(updated);
      onRelationshipChange(updated);
    } else {
      // Check max selections
      if (config.maxSelections && selectedEntities.length >= config.maxSelections) {
        notifications.show({
          title: 'Selection Limit Reached',
          message: `Maximum ${config.maxSelections} selections allowed`,
          color: 'yellow',
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
    config.junctionFields?.forEach(field => {
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
    const updated = selectedEntities.map(entity => {
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
            label={field.label}
            value={value || ''}
            onChange={(e) => setJunctionData(prev => ({ ...prev, [field.name]: e.target.value }))}
            required={field.required}
          />
        );

      case 'textarea':
        return (
          <Textarea
            key={field.name}
            label={field.label}
            value={value || ''}
            onChange={(e) => setJunctionData(prev => ({ ...prev, [field.name]: e.target.value }))}
            required={field.required}
          />
        );

      case 'number':
        return (
          <NumberInput
            key={field.name}
            label={field.label}
            value={value || 0}
            onChange={(val) => setJunctionData(prev => ({ ...prev, [field.name]: val }))}
            required={field.required}
          />
        );

      case 'checkbox':
        return (
          <Checkbox
            key={field.name}
            label={field.label}
            checked={value || false}
            onChange={(e) => setJunctionData(prev => ({ ...prev, [field.name]: e.target.checked }))}
          />
        );

      case 'select':
        return (
          <Select
            key={field.name}
            label={field.label}
            value={value || ''}
            data={field.options || []}
            onChange={(val) => setJunctionData(prev => ({ ...prev, [field.name]: val }))}
            required={field.required}
          />
        );

      case 'multiselect':
        return (
          <MultiSelect
            key={field.name}
            label={field.label}
            value={value || []}
            data={field.options || []}
            onChange={(val) => setJunctionData(prev => ({ ...prev, [field.name]: val }))}
            required={field.required}
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
          <Button
            size="xs"
            variant="light"
            leftSection={<IconPlus size={14} />}
            onClick={open}
          >
            Add {config.relatedEntity}
          </Button>
        </Group>

        <Group gap="xs">
          {selectedEntities.map((entity) => (
            <Chip
              key={entity.id}
              checked
              variant="filled"
              onChange={() => handleEntitySelect(entity)}
            >
              {entity.name || entity.title}
              {config.junctionFields && (
                <ActionIcon
                  size="xs"
                  variant="transparent"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleJunctionEdit(entity, entity.junctionData);
                  }}
                >
                  <IconEdit size={10} />
                </ActionIcon>
              )}
            </Chip>
          ))}
        </Group>

        <Modal opened={opened} onClose={close} title={`Select ${config.relatedEntity}`}>
          <Stack>
            {config.searchable && (
              <TextInput
                placeholder={`Search ${config.relatedEntity}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftSection={<IconSearch size={16} />}
              />
            )}

            {config.filterFields && (
              <Group>
                {config.filterFields.map((field) => (
                  <Select
                    key={field}
                    placeholder={`Filter by ${field}`}
                    value={filterValues[field] || ''}
                    onChange={(value) =>
                      setFilterValues(prev => ({ ...prev, [field]: value || '' }))
                    }
                    data={[
                      // This would be populated dynamically based on available values
                      { value: '', label: `All ${field}` },
                    ]}
                  />
                ))}
              </Group>
            )}

            <Stack mah={300} style={{ overflow: 'auto' }}>
              {filteredEntities.map((entity) => (
                <Card
                  key={entity.id}
                  p="sm"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleEntitySelect(entity)}
                  withBorder={selectedEntities.some(s => s.id === entity.id)}
                >
                  <Text fw={500}>{entity.name || entity.title}</Text>
                  {entity.description && (
                    <Text size="sm" c="dimmed">
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
            opened={!!editingJunction}
            onClose={() => setEditingJunction(null)}
            title={`Edit ${config.name} Details`}
          >
            <Stack>
              <Text size="sm" c="dimmed">
                Editing details for: {editingJunction.name || editingJunction.title}
              </Text>
              
              {config.junctionFields.map(renderJunctionField)}

              <Group justify="flex-end">
                <Button variant="light" onClick={() => setEditingJunction(null)}>
                  Cancel
                </Button>
                <Button onClick={handleJunctionSave}>
                  Save
                </Button>
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
          <Button
            size="xs"
            variant="light"
            leftSection={<IconPlus size={14} />}
            onClick={open}
          >
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
                  <Table.Td key={field.name}>
                    {entity.junctionData?.[field.name] || '—'}
                  </Table.Td>
                ))}
                <Table.Td>
                  <Group gap="xs">
                    {config.junctionFields && (
                      <Tooltip label="Edit details">
                        <ActionIcon
                          size="sm"
                          variant="light"
                          onClick={() => handleJunctionEdit(entity, entity.junctionData)}
                        >
                          <IconEdit size={14} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                    <Tooltip label="Remove">
                      <ActionIcon
                        size="sm"
                        variant="light"
                        color="red"
                        onClick={() => handleEntitySelect(entity)}
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
        <Modal opened={opened} onClose={close} title={`Select ${config.relatedEntity}`} size="lg">
          <Stack>
            {config.searchable && (
              <TextInput
                placeholder={`Search ${config.relatedEntity}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftSection={<IconSearch size={16} />}
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
                        checked={selectedEntities.some(s => s.id === entity.id)}
                        onChange={() => handleEntitySelect(entity)}
                      />
                    </Table.Td>
                    <Table.Td>{entity.name || entity.title}</Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">
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
            opened={!!editingJunction}
            onClose={() => setEditingJunction(null)}
            title={`Edit ${config.name} Details`}
          >
            <Stack>
              <Text size="sm" c="dimmed">
                Editing details for: {editingJunction.name || editingJunction.title}
              </Text>
              
              {config.junctionFields.map(renderJunctionField)}

              <Group justify="flex-end">
                <Button variant="light" onClick={() => setEditingJunction(null)}>
                  Cancel
                </Button>
                <Button onClick={handleJunctionSave}>
                  Save
                </Button>
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
        <Button
          size="xs"
          variant="light"
          leftSection={<IconPlus size={14} />}
          onClick={open}
        >
          Add {config.relatedEntity}
        </Button>
      </Group>

      <Group>
        {selectedEntities.map((entity) => (
          <Card key={entity.id} p="sm" withBorder>
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
                    size="sm"
                    variant="light"
                    onClick={() => handleJunctionEdit(entity, entity.junctionData)}
                  >
                    <IconEdit size={14} />
                  </ActionIcon>
                )}
                <ActionIcon
                  size="sm"
                  variant="light"
                  color="red"
                  onClick={() => handleEntitySelect(entity)}
                >
                  <IconTrash size={14} />
                </ActionIcon>
              </Group>
            </Group>
          </Card>
        ))}
      </Group>

      {/* Entity Selection Modal */}
      <Modal opened={opened} onClose={close} title={`Select ${config.relatedEntity}`} size="lg">
        <Stack>
          {config.searchable && (
            <TextInput
              placeholder={`Search ${config.relatedEntity}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftSection={<IconSearch size={16} />}
            />
          )}

          <Stack gap="xs" mah={400} style={{ overflow: 'auto' }}>
            {filteredEntities.map((entity) => (
              <Card
                key={entity.id}
                p="sm"
                style={{ cursor: 'pointer' }}
                onClick={() => handleEntitySelect(entity)}
                withBorder={selectedEntities.some(s => s.id === entity.id)}
              >
                <Group justify="space-between">
                  <Stack gap="xs">
                    <Text fw={500}>{entity.name || entity.title}</Text>
                    {entity.description && (
                      <Text size="sm" c="dimmed">
                        {entity.description}
                      </Text>
                    )}
                  </Stack>
                  <Checkbox
                    checked={selectedEntities.some(s => s.id === entity.id)}
                    readOnly
                  />
                </Group>
              </Card>
            ))}
          </Stack>
        </Stack>
      </Modal>

      {/* Junction Data Editor Modal */}
      {editingJunction && config.junctionFields && (
        <Modal
          opened={!!editingJunction}
          onClose={() => setEditingJunction(null)}
          title={`Edit ${config.name} Details`}
        >
          <Stack>
            <Text size="sm" c="dimmed">
              Editing details for: {editingJunction.name || editingJunction.title}
            </Text>
            
            {config.junctionFields.map(renderJunctionField)}

            <Group justify="flex-end">
              <Button variant="light" onClick={() => setEditingJunction(null)}>
                Cancel
              </Button>
              <Button onClick={handleJunctionSave}>
                Save
              </Button>
            </Group>
          </Stack>
        </Modal>
      )}
    </Box>
  );
}