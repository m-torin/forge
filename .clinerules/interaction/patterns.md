# Interaction Patterns

## [INT-1] Task Completion Options

- **Required**: Yes
- **Summary**: Present structured options after completing tasks.
- **Details**:
  - After completing each task cycle, present 3-5 distinct, actionable options
  - Present options as a numbered list for easy selection
  - Each option should be concise but descriptive
  - Format: `N. [Action]: Brief description of what this will do`

## [INT-2] When to Present Options

- **Required**: Yes
- **Summary**: Present options at appropriate points in the workflow.
- **Details**:
  - After completing any significant task or sequence of operations
  - When reporting back results of a build, test, or other operation
  - At the conclusion of any troubleshooting session
  - When presenting final results of a requested implementation

## [INT-3] Option Types

- **Required**: Yes
- **Summary**: Include a mix of option types.
- **Details**:
  - Direct Follow-ups: Improvements or extensions to the task just completed
  - Next Logical Steps: What would naturally come next in the project workflow
  - Diagnostic Options: Ways to verify or troubleshoot the current solution
  - Documentation: Options to document what was done
  - Alternative Approaches: Different ways to solve the same problem
  - Exploration Options: Ways to better understand the codebase

## [INT-4] Contextual Relevance

- **Required**: Yes
- **Summary**: Ensure options are relevant to the current context.
- **Details**:
  - All options must be directly relevant to the current project context
  - Options should be based on the current state of the project
  - Avoid generic options that could apply to any project
  - Consider the user's likely next needs based on the task just completed

## [INT-5] Option Format

- **Required**: Yes
- **Summary**: Format options consistently.
- **Details**:
  - Present as a numbered list (1, 2, 3, etc.)
  - Each option should be concise but descriptive (one line preferred)
  - Format should be consistent:
    `N. [Action]: Brief description of what this will do`
  - Example:
    `1. [Fix Remaining Errors]: Address the React DOM testing errors in app tests`

## [INT-6] Implementation Considerations

- **Required**: Yes
- **Summary**: Ensure options are specific and actionable.
- **Details**:
  - Ensure options are specific and actionable, not vague
  - Tailor options to the user's demonstrated priorities and interests
  - Include at least one option that addresses any remaining issues or errors
  - When appropriate, include an option for a completely different direction
