# Storybook

- _Port:_ **3700** (Storybook)

- _AI Hints:_

  ```typescript
  // Primary: Storybook component documentation - design system showcase
  // Dev: storybook dev -p 3700 --quiet --no-open
  // Build: storybook build for static deployment
  // Stories: *.stories.tsx files for component examples
  // ❌ NEVER: Include production secrets or real API calls in stories
  ```

- _Key Features:_
  - **Component Documentation**: Interactive showcase for @repo/uix-system
    components
  - **Mantine Integration**: All Mantine components with theme variations
  - **Accessibility Testing**: Built-in a11y addon for compliance checking
  - **Chromatic Integration**: Visual regression testing for UI changes
  - **Multiple Themes**: Light/dark mode testing with Mantine theme switching
  - **Code Examples**: Live code examples with editable controls

- _Storybook Configuration:_
  - **Framework**: Next.js integration with webpack5 builder
  - **Addons**: Docs, themes, accessibility, onboarding
  - **Components**: @repo/uix-system with Mantine, Tailwind, auth components
  - **Testing**: Test runner with visual regression via Chromatic
  - **Build**: Static export for deployment and sharing

- _Documentation:_ **[Storybook](../docs/apps/storybook.mdx)**
