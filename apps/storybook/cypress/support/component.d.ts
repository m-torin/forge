/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />

import type { StoryFn } from "@storybook/react";

type StoryComponent = StoryFn & {
  args?: Record<string, unknown>;
};

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to mount a Storybook story
       * @example cy.mountStory(stories.Default)
       */
      mountStory(story: StoryComponent): Chainable<Element>;
    }
  }
}

export {};
