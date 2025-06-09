'use client';

import {
  ActionIcon,
  Avatar,
  Badge,
  CloseButton,
  Combobox,
  Group,
  Input,
  InputBase,
  ScrollArea,
  Text,
  useCombobox,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconSelector, IconUser } from '@tabler/icons-react';
import { useCallback, useEffect, useState } from 'react';

import { showErrorNotification } from '../../utils/pim-helpers';
import { getUsersForSelect } from '../actions';

interface User {
  email: string;
  id: string;
  image?: string | null;
  name: string;
}

interface UserSelectProps {
  'data-testid'?: string;
  description?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  onChange?: (value: string[]) => void;
  placeholder?: string;
  required?: boolean;
  value?: string[];
}

/**
 * UserSelect component for selecting multiple users with search functionality
 * Used for assigning users to registries with roles
 */
export function UserSelect({
  'data-testid': testId = 'user-select',
  description,
  disabled = false,
  error,
  label,
  onChange,
  placeholder = 'Search users...',
  required = false,
  value = [],
}: UserSelectProps) {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const combobox = useCombobox({
    onDropdownClose: () => {
      combobox.resetSelectedOption();
      setSearch('');
    },
    onDropdownOpen: () => {
      combobox.updateSelectedOptionIndex('active');
    },
  });

  // Load users based on search
  const loadUsers = useCallback(async (searchTerm: string) => {
    setLoading(true);
    try {
      const result = await getUsersForSelect(searchTerm);
      if (result.success && result.data) {
        setUsers(result.data);
      } else {
        showErrorNotification(result.error || 'Failed to load users');
      }
    } catch (error) {
      showErrorNotification('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load users when search changes
  useEffect(() => {
    loadUsers(debouncedSearch);
  }, [debouncedSearch, loadUsers]);

  // Update selected users when value changes
  useEffect(() => {
    if (value.length > 0) {
      // Find selected users from the current users list
      const selected = users.filter((user) => value.includes(user.id));
      setSelectedUsers(selected);
    } else {
      setSelectedUsers([]);
    }
  }, [value, users]);

  const handleValueSelect = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user && !value.includes(userId)) {
      const newValue = [...value, userId];
      onChange?.(newValue);
      setSelectedUsers([...selectedUsers, user]);
    }
    combobox.closeDropdown();
    setSearch('');
  };

  const handleValueRemove = (userId: string) => {
    const newValue = value.filter((id) => id !== userId);
    onChange?.(newValue);
    setSelectedUsers(selectedUsers.filter((user) => user.id !== userId));
  };

  const renderSelectedUsers = () => {
    if (selectedUsers.length === 0) {
      return <Input.Placeholder>{placeholder}</Input.Placeholder>;
    }

    return (
      <Group gap="xs">
        {selectedUsers.map((user) => (
          <Badge
            key={user.id}
            rightSection={
              !disabled && (
                <ActionIcon
                  color="blue"
                  onClick={() => handleValueRemove(user.id)}
                  radius="xl"
                  size="xs"
                  variant="transparent"
                >
                  <CloseButton size="xs" />
                </ActionIcon>
              )
            }
            variant="light"
          >
            <Group gap="xs">
              <Avatar alt={user.name} size="xs" src={user.image}>
                {user.name.charAt(0)}
              </Avatar>
              <Text size="xs">{user.name}</Text>
            </Group>
          </Badge>
        ))}
      </Group>
    );
  };

  const options = users
    .filter((user) => !value.includes(user.id))
    .map((user) => (
      <Combobox.Option key={user.id} value={user.id}>
        <Group gap="sm">
          <Avatar alt={user.name} size="sm" src={user.image}>
            {user.name.charAt(0)}
          </Avatar>
          <div>
            <Text fw={500} size="sm">
              {user.name}
            </Text>
            <Text c="dimmed" size="xs">
              {user.email}
            </Text>
          </div>
        </Group>
      </Combobox.Option>
    ));

  return (
    <Combobox
      data-testid={testId}
      onOptionSubmit={handleValueSelect}
      store={combobox}
      disabled={disabled}
    >
      <Combobox.DropdownTarget>
        <InputBase
          component="button"
          description={description}
          error={error}
          onClick={() => combobox.toggleDropdown()}
          pointer
          rightSection={
            <Combobox.Chevron>
              <IconSelector size={16} />
            </Combobox.Chevron>
          }
          rightSectionPointerEvents="none"
          disabled={disabled}
          label={label}
          required={required}
          type="button"
        >
          {renderSelectedUsers()}
        </InputBase>
      </Combobox.DropdownTarget>

      <Combobox.Dropdown>
        <Combobox.Search
          leftSection={<IconUser size={16} />}
          onChange={(event) => setSearch(event.currentTarget.value)}
          placeholder="Search users..."
          value={search}
        />
        <Combobox.Options>
          <ScrollArea.Autosize mah={200} type="scroll">
            {loading ? (
              <Combobox.Empty>Loading users...</Combobox.Empty>
            ) : options.length > 0 ? (
              options
            ) : (
              <Combobox.Empty>
                {search ? 'No users found matching your search' : 'No users available'}
              </Combobox.Empty>
            )}
          </ScrollArea.Autosize>
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
