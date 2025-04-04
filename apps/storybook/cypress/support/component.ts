import { mount } from 'cypress/react'
import { composeStories } from '@storybook/testing-react'
import '@testing-library/cypress/add-commands'

// Augment the Cypress namespace to include type definitions for
// your custom command.
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to mount a Storybook story
       * @example cy.mountStory(stories.Default)
       */
      mountStory: typeof mountStory
    }
  }
}

/**
 * Mount a story with its args and decorators
 */
function mountStory(story: any) {
  const composed = composeStories({ [story.name]: story })
  const Story = composed[story.name]
  return mount(<Story />)
}

Cypress.Commands.add('mountStory', mountStory)

// Import commands.js using ES2015 syntax:
import './commands'