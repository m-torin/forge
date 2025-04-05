"use client";

import { Button, Group, useMantineColorScheme } from "@mantine/core";
import React from "react";

export function ColorSchemesSwitcher() {
  const { clearColorScheme, setColorScheme } = useMantineColorScheme();

  return (
    <Group>
      <Button onClick={() => setColorScheme("light")}>Light</Button>
      <Button onClick={() => setColorScheme("dark")}>Dark</Button>
      <Button onClick={() => setColorScheme("auto")}>Auto</Button>
      <Button onClick={clearColorScheme}>Clear</Button>
    </Group>
  );
}
