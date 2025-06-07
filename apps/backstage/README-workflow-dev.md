# Workflow Development Feedback Loop

This document explains the feedback loop system for developing workflows in the Backstage admin
application.

## Overview

The feedback loop system provides continuous testing and feedback during workflow development. It
automatically runs code quality checks and e2e tests whenever you make changes, ensuring that your
workflow code is always working correctly.

## Quick Start

### 1. Basic Development Cycle

Run a single feedback cycle (lint + typecheck + tests):

```bash
pnpm workflow:cycle
```

### 2. Automatic Watch Mode

Start watching for file changes and automatically run feedback cycles:

```bash
pnpm workflow:cycle:watch
```

### 3. Development with Live Testing

Start the dev server alongside automatic testing:

```bash
pnpm workflow:dev
```

### 4. Interactive Mode

Run the feedback cycle in interactive mode for guided development:

```bash
pnpm workflow:cycle --interactive
```

## Available Scripts

| Script                      | Description                                   |
| --------------------------- | --------------------------------------------- |
| `pnpm workflow:cycle`       | Run complete feedback cycle (quality + tests) |
| `pnpm workflow:cycle:watch` | Watch files and auto-run cycles on changes    |
| `pnpm workflow:dev`         | Start dev server + live testing               |
| `pnpm workflow:test`        | Run only workflow e2e tests                   |
| `pnpm workflow:test:watch`  | Run workflow tests in UI mode                 |
| `pnpm workflow:test:headed` | Run workflow tests in headed mode             |
| `pnpm workflow:fix`         | Run lint and typecheck only                   |
| `pnpm workflow:feedback`    | Run cycle with simple success/fail feedback   |
| `pnpm workflow:report`      | Generate detailed HTML test reports           |

## What Files Are Watched?

The system watches for changes in:

- `app/(authenticated)/workflows/**/*` - Workflow UI components
- `app/api/workflows/**/*` - Workflow API endpoints
- `app/workflows/**/*` - Workflow definitions
- `e2e/workflows.spec.ts` - Workflow e2e tests
- `e2e/utils/**/*` - Test utilities
- `app/api/**/*` - General API changes
- `app/(authenticated)/layout.tsx` - Layout changes
- `app/layout.tsx` - Root layout changes

## Feedback Loop Process

When you run `pnpm workflow:cycle`, the system:

1. **Code Quality**: Runs ESLint and TypeScript checks
2. **Tests**: Executes workflow-specific e2e tests
3. **Report**: Generates detailed feedback report
4. **Feedback**: Provides colored output and next steps

### Example Output

```bash
🔄 Starting Workflow Development Feedback Loop
⏰ 1/7/2025, 2:30:45 PM

[QUALITY] Running code quality checks...
✅ ESLint passed
✅ TypeScript passed

[TEST] Running workflow e2e tests...
✅ All workflow tests passed!

[REPORT] Generating feedback report...

[FEEDBACK] Cycle completed
🎉 All checks passed! Ready for next iteration

📋 What you can do next:
• Continue developing workflows
• Run 'pnpm workflow:cycle:watch' for automatic testing
• Run 'pnpm workflow:dev' to start dev server with live testing

ℹ️ Detailed report saved to: test-results/workflow-reports/
```

## Development Workflow

### Recommended Development Process

1. **Start**: Begin with `pnpm workflow:cycle:watch` for automatic feedback
2. **Develop**: Make changes to workflow files
3. **Feedback**: Watch automatic feedback as you work
4. **Fix**: Address any issues reported
5. **Iterate**: Continue development with confidence

### For Complex Features

1. **Plan**: Run `pnpm workflow:cycle` to ensure starting point is clean
2. **Develop**: Work on feature with watch mode active
3. **Test**: Use `pnpm workflow:test:headed` for visual debugging
4. **Validate**: Run final `pnpm workflow:cycle` before committing

## Troubleshooting

### Common Issues

**Tests are failing but I didn't change test files**

- Your workflow code changes broke existing functionality
- Run `pnpm workflow:test:headed` to see what's happening visually
- Check the console output for specific error messages

**Watch mode isn't detecting changes**

- Ensure you're editing files in the watched directories
- Check that file extensions are .ts, .tsx, .js, or .jsx
- Restart the watcher if needed

**TypeScript errors**

- Run `pnpm typecheck` to see detailed error messages
- Ensure all imports are correct and types are defined
- Check that Prisma client is generated if using database

**Lint errors**

- Run `pnpm lint` to see specific issues
- Most issues can be auto-fixed with `pnpm lint --fix`
- Follow the project's ESLint configuration

### Performance Tips

- Use `pnpm workflow:test` for faster test-only runs
- Use `pnpm workflow:fix` for quick quality checks
- The watcher debounces changes (waits 1 second after last change)

## Reports and Monitoring

### Test Reports

The system generates several types of reports:

1. **JSON Reports**: Detailed machine-readable data in `test-results/workflow-reports/`
2. **Human Reports**: Easy-to-read summaries in `latest-workflow-report.txt`
3. **HTML Reports**: Visual test reports with screenshots (when using `workflow:report`)

### Monitoring Development Progress

- Watch the console output for real-time feedback
- Check `test-results/workflow-reports/latest-workflow-report.txt` for latest status
- Use `pnpm workflow:report` to generate comprehensive HTML reports

## Integration with CI/CD

The same scripts can be used in CI/CD environments:

```bash
# In CI pipeline
pnpm workflow:cycle  # Returns exit code 0 on success, 1 on failure
```

This ensures that your local development feedback matches what will happen in production builds.

## Next Steps

- Start developing workflows with confidence using the feedback loop
- Customize the watched file patterns in `scripts/workflow-watcher.js` if needed
- Add more workflow-specific tests to `e2e/workflows.spec.ts`
- Extend the feedback system for other admin modules as needed

Happy workflow development! 🚀
