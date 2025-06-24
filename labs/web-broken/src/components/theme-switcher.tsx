"use client";

import { useMantineColorScheme, Button, Group } from "@mantine/core";
import { IconSun, IconMoon, IconDeviceLaptop } from "@tabler/icons-react";
import type { ExtendedDictionary } from "@/i18n";

interface ThemeSwitcherProps {
  dictionary: ExtendedDictionary;
  "data-testid"?: string;
}

export function ThemeSwitcher({
  dictionary,
  "data-testid": testId = "theme-switcher",
}: ThemeSwitcherProps): React.JSX.Element {
  const { setColorScheme, colorScheme } = useMantineColorScheme();

  return (
    <Group data-testid={testId}>
      <Button
        variant={colorScheme === "light" ? "filled" : "subtle"}
        onClick={() => setColorScheme("light")}
        leftSection={<IconSun size={16} />}
        size="sm"
        data-testid="theme-light"
      >
        {dictionary.theme.light}
      </Button>
      <Button
        variant={colorScheme === "dark" ? "filled" : "subtle"}
        onClick={() => setColorScheme("dark")}
        leftSection={<IconMoon size={16} />}
        size="sm"
        data-testid="theme-dark"
      >
        {dictionary.theme.dark}
      </Button>
      <Button
        variant={colorScheme === "auto" ? "filled" : "subtle"}
        onClick={() => setColorScheme("auto")}
        leftSection={<IconDeviceLaptop size={16} />}
        size="sm"
        data-testid="theme-auto"
      >
        {dictionary.theme.auto}
      </Button>
    </Group>
  );
}
