import React from "react";
import { mount } from "cypress/react";
import type { StoryFn } from "@storybook/react";
import "@testing-library/cypress/add-commands";

type StoryComponent = StoryFn & {
  args?: Record<string, unknown>;
};

// Register the custom command
// @ts-expect-error - Cypress.Commands is defined at runtime
Cypress.Commands.add("mountStory", (story: StoryComponent) => {
  const StoryComponent = story as unknown as React.ComponentType;
  return mount(React.createElement(StoryComponent, story.args || {}));
});

// Import additional Cypress commands
import "./commands";
