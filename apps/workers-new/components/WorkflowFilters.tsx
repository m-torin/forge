'use client'

import { useState } from 'react'
import { 
  Card, Group, TextInput, Select, Button, Stack, Text, Badge, 
  Collapse, ActionIcon 
} from '@mantine/core'
import { 
  IconSearch, IconFilter, IconClearAll, IconChevronDown, IconChevronUp,
  IconCalendar
} from '@tabler/icons-react'
import { useDisclosure } from '@mantine/hooks'

interface WorkflowRun {
  workflowRunId: string
  workflowState: string
  workflowUrl: string
  workflowRunCreatedAt: number
}

interface WorkflowFiltersProps {
  onFilterChange: (filters: WorkflowFilterState) => void
  workflowRuns: WorkflowRun[]
}

export interface WorkflowFilterState {
  search: string
  status: string
  timeRange: string
  workflowType: string
}

export function WorkflowFilters({ onFilterChange, workflowRuns }: WorkflowFiltersProps) {
  const [opened, { toggle }] = useDisclosure(false)
  const [filters, setFilters] = useState<WorkflowFilterState>({
    search: '',
    status: '',
    timeRange: '',
    workflowType: ''
  })

  const updateFilter = (key: keyof WorkflowFilterState, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters: WorkflowFilterState = {
      search: '',
      status: '',
      timeRange: '',
      workflowType: ''
    }
    setFilters(clearedFilters)
    onFilterChange(clearedFilters)
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== '')
  const activeFilterCount = Object.values(filters).filter(value => value !== '').length

  // Extract unique workflow types from runs
  const workflowTypes = Array.from(new Set(
    workflowRuns
      .map(run => run.workflowUrl.split('/').pop())
      .filter((type): type is string => Boolean(type))
  )).sort()

  return (
    <Card withBorder p="md" mb="md">
      <Group justify="space-between" mb="sm">
        <Group gap="sm">
          <IconFilter size={16} />
          <Text fw={500} size="sm">Filters</Text>
          {hasActiveFilters && (
            <Badge size="sm" color="blue" variant="light">
              {activeFilterCount} active
            </Badge>
          )}
        </Group>
        <Group gap="xs">
          {hasActiveFilters && (
            <Button
              variant="subtle"
              size="xs"
              color="gray"
              leftSection={<IconClearAll size={14} />}
              onClick={clearFilters}
            >
              Clear All
            </Button>
          )}
          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={toggle}
            size="sm"
          >
            {opened ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
          </ActionIcon>
        </Group>
      </Group>

      {/* Always visible search */}
      <TextInput
        placeholder="Search by workflow run ID or URL..."
        leftSection={<IconSearch size={16} />}
        value={filters.search}
        onChange={(e) => updateFilter('search', e.target.value)}
        mb="sm"
      />

      {/* Collapsible advanced filters */}
      <Collapse in={opened}>
        <Stack gap="sm">
          <Group grow>
            <Select
              label="Status"
              placeholder="All statuses"
              value={filters.status}
              onChange={(value) => updateFilter('status', value || '')}
              data={[
                { value: '', label: 'All Statuses' },
                { value: 'RUN_STARTED', label: 'Running' },
                { value: 'RUN_SUCCESS', label: 'Successful' },
                { value: 'RUN_FAILED', label: 'Failed' },
                { value: 'RUN_CANCELED', label: 'Canceled' }
              ]}
            />

            <Select
              label="Workflow Type"
              placeholder="All workflows"
              value={filters.workflowType}
              onChange={(value) => updateFilter('workflowType', value || '')}
              data={[
                { value: '', label: 'All Workflows' },
                ...workflowTypes.map(type => ({ value: type, label: type }))
              ]}
            />
          </Group>

          <Select
            label="Time Range"
            placeholder="All time"
            leftSection={<IconCalendar size={16} />}
            value={filters.timeRange}
            onChange={(value) => updateFilter('timeRange', value || '')}
            data={[
              { value: '', label: 'All Time' },
              { value: '1h', label: 'Last Hour' },
              { value: '24h', label: 'Last 24 Hours' },
              { value: '7d', label: 'Last 7 Days' },
              { value: '30d', label: 'Last 30 Days' }
            ]}
          />
        </Stack>
      </Collapse>
    </Card>
  )
}