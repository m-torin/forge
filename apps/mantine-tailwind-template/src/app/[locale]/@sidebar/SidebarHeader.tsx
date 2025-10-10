"use client";

import { useSidebar } from "#/components/SidebarProvider";
import { ActionIcon, Text } from "@mantine/core";
import { IconX } from "@tabler/icons-react";

export default function SidebarHeader() {
  const { close } = useSidebar();

  return (
    <div className="harmony-text-primary harmony-border flex items-center justify-between border-b p-4 lg:hidden">
      <Text size="lg" fw={600}>
        Navigation
      </Text>
      <ActionIcon
        variant="subtle"
        size="md"
        onClick={close}
        aria-label="Close navigation"
        className="harmony-text-primary hover:harmony-bg-surface"
      >
        <IconX size={18} />
      </ActionIcon>
    </div>
  );
}
