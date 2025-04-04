import * as stories from './Button.stories'

describe('Button Component', () => {
  it('renders primary button correctly', () => {
    cy.mountStory(stories.Primary)
    cy.get('button')
      .should('have.class', 'btn-primary')
      .and('be.visible')
  })

  it('renders secondary button correctly', () => {
    cy.mountStory(stories.Secondary)
    cy.get('button')
      .should('have.class', 'btn-secondary')
      .and('be.visible')
  })

  it('handles click events', () => {
    cy.mountStory(stories.Primary)
    cy.get('button').click()
    // Add your click handler assertions here
  })

  it('maintains accessibility standards', () => {
    cy.mountStory(stories.Primary)
    cy.checkA11y('button')
  })
})