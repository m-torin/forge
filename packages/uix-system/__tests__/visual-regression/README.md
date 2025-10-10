# Visual Regression Test Suite

Comprehensive visual regression testing for the Unified UI System components
using Playwright for cross-browser screenshot comparison and consistency
validation.

## 🎯 Test Coverage

### Core Visual Tests (`VisualRegression.test.ts`)

- **73 component stories** across 6 main components
- **Theme variations**: Light and Dark mode
- **Viewport sizes**: Mobile (375px), Tablet (768px), Desktop (1200px)
- **Interactive states**: Default, Hover, Focus, Open, Validation states
- **Layout consistency**: Full page, responsive, edge cases
- **Animation states**: Including reduced motion support
- **Accessibility**: High contrast, focus indicators

### Cross-Browser Compatibility (`CrossBrowserCompatibility.test.ts`)

- **Browser coverage**: Chromium, Firefox, WebKit
- **Mobile testing**: iPhone Safari, Android Chrome
- **Feature-specific tests**: CSS Grid, Flexbox, Custom Properties
- **Form styling**: Input focus states, validation styling
- **SVG rendering**: Icon consistency across browsers
- **Accessibility features**: High contrast, reduced motion

### Performance Visual Tests (`PerformanceVisualTests.test.ts`)

- **Large dataset handling**: Virtual scrolling with 1000+ items
- **Animation performance**: 60fps validation
- **Memory usage monitoring**: JS heap size tracking
- **Bundle size impact**: Lazy loading states
- **Stress testing**: Maximum/minimum viewports
- **Network simulation**: Slow connection behavior

## 🚀 Quick Start

### Prerequisites

```bash
# Install dependencies
pnpm install

# Start Storybook (required for tests)
pnpm run storybook
```

### Run Tests

```bash
# Run all visual regression tests
pnpm exec playwright test

# Run specific browser
pnpm exec playwright test --project=chromium

# Run with UI mode
pnpm exec playwright test --ui

# Update screenshots (when intentional changes are made)
pnpm exec playwright test --update-snapshots
```

## 📊 Test Configuration

### Playwright Projects

- **chromium**: Desktop Chrome with optimized settings
- **firefox**: Desktop Firefox with specific preferences
- **webkit**: Desktop Safari simulation
- **mobile-chrome**: Galaxy S21 simulation
- **mobile-safari**: iPhone 13 simulation
- **high-contrast**: Accessibility testing
- **reduced-motion**: Motion preference testing
- **large-desktop**: 1920x1080 viewport
- **small-tablet**: 768x1024 viewport

### Screenshot Settings

- **Threshold**: 0.2 (20% pixel difference allowed)
- **Animations**: Disabled by default
- **Full page**: Captures complete page layout
- **Retries**: 2 attempts in CI environment

## 📁 File Structure

```
__tests__/visual-regression/
├── VisualRegression.test.ts          # Core visual tests
├── CrossBrowserCompatibility.test.ts # Browser-specific tests
├── PerformanceVisualTests.test.ts    # Performance-focused tests
└── README.md                         # This file

test-results/
├── visual-regression-results.json    # Test results
├── visual-regression-junit.xml       # JUnit format for CI
└── screenshots/                      # Generated screenshots
    ├── baseline/                     # Reference images
    ├── actual/                       # Test run images
    └── diff/                         # Difference images

playwright-report/                    # HTML test report
```

## 🧪 Test Categories

### 1. Component Coverage Tests

Tests every story of every component across themes and viewports:

| Component            | Stories | Themes | Viewports | Total Screenshots |
| -------------------- | ------- | ------ | --------- | ----------------- |
| LazyIcon             | 12      | 2      | 3         | 72                |
| PageHeader           | 13      | 2      | 3         | 78                |
| LoadingSpinner       | 13      | 2      | 3         | 78                |
| RelationshipCombobox | 15      | 2      | 3         | 90                |
| AccessibleFormField  | 15      | 2      | 3         | 90                |
| FormValidation       | 7       | 2      | 3         | 42                |
| **Total**            | **75**  | **2**  | **3**     | **450**           |

### 2. Interactive State Tests

- **Hover states**: Button and link interactions
- **Focus states**: Keyboard navigation indicators
- **Open states**: Dropdown and modal expansions
- **Validation states**: Error, warning, success indicators
- **Loading states**: Spinner and skeleton animations

### 3. Browser Compatibility Tests

- **Desktop browsers**: Chrome, Firefox, Safari equivalents
- **Mobile browsers**: iOS Safari, Android Chrome
- **Feature support**: Modern CSS features across browsers
- **Rendering differences**: Font antialiasing, input styling

### 4. Performance Visual Tests

- **Animation performance**: Frame rate validation
- **Large datasets**: Virtual scrolling behavior
- **Memory usage**: Component memory footprint
- **Bundle impact**: Lazy loading states
- **Network conditions**: Slow connection simulation

### 5. Accessibility Visual Tests

- **High contrast mode**: Windows forced colors
- **Reduced motion**: Animation disable compliance
- **Focus indicators**: Keyboard navigation visibility
- **Color contrast**: WCAG compliance validation

## 🎨 Visual Comparison Process

### 1. Baseline Generation

```bash
# Generate initial baseline screenshots
pnpm exec playwright test --update-snapshots
```

### 2. Comparison Testing

```bash
# Run tests to compare against baselines
pnpm exec playwright test
```

### 3. Diff Analysis

Failed tests generate difference images showing:

- **Red areas**: Pixels that changed
- **Side-by-side**: Expected vs Actual
- **Overlay mode**: Highlight differences

### 4. Baseline Updates

When intentional changes are made:

```bash
# Update specific test baselines
pnpm exec playwright test ComponentName.test.ts --update-snapshots

# Update all baselines
pnpm exec playwright test --update-snapshots
```

## 🔧 Configuration Options

### Environment Variables

```bash
# CI optimization
CI=true              # Enable CI-specific settings
PLAYWRIGHT_WORKERS=2 # Limit parallel execution
PLAYWRIGHT_RETRIES=2 # Retry failed tests

# Screenshot settings
PLAYWRIGHT_UPDATE_SNAPSHOTS=true # Update all baselines
PLAYWRIGHT_THRESHOLD=0.3         # Adjust comparison threshold

# Performance testing
PERFORMANCE_BUDGET=3000 # Maximum load time (ms)
MEMORY_LIMIT=50000000   # Memory limit (bytes)
```

### Custom Matchers

```typescript
// Custom threshold for specific components
await expect(page).toHaveScreenshot("component.png", {
  threshold: 0.1, // Stricter comparison
  animations: "allow", // Enable animations
  clip: { x: 0, y: 0, width: 800, height: 600 } // Specific area
});
```

## 📈 CI/CD Integration

### GitHub Actions

```yaml
- name: Run Visual Regression Tests
  run: pnpm exec playwright test

- name: Upload Test Results
  uses: actions/upload-artifact@v3
  if: failure()
  with:
    name: playwright-report
    path: playwright-report/
```

### Test Results

- **HTML Report**: Interactive test results with screenshots
- **JSON Report**: Machine-readable results for analysis
- **JUnit XML**: Integration with test reporting tools

## 🚨 Troubleshooting

### Common Issues

**Screenshots don't match:**

1. Check if intentional design changes were made
2. Verify consistent testing environment
3. Consider browser/OS differences
4. Adjust threshold if minor differences

**Tests timeout:**

1. Increase timeout in playwright.config.ts
2. Check Storybook server is running
3. Verify network connectivity
4. Optimize test scenarios

**Performance tests fail:**

1. Check system resources during test
2. Verify realistic performance expectations
3. Consider CI environment limitations
4. Review animation complexity

**Cross-browser differences:**

1. Review browser-specific CSS features
2. Check font rendering differences
3. Verify vendor prefix usage
4. Consider progressive enhancement

### Debug Mode

```bash
# Run with debug information
DEBUG=pw:api pnpm exec playwright test

# Run single test with headed browser
pnpm exec playwright test --headed --project=chromium ComponentName

# Generate trace for debugging
pnpm exec playwright test --trace=on
```

## 📚 Best Practices

### 1. Screenshot Strategy

- **Full page**: Capture complete component context
- **Consistent timing**: Wait for all content to load
- **Disable animations**: Ensure consistent captures
- **Appropriate thresholds**: Balance sensitivity and stability

### 2. Test Organization

- **Group related tests**: Use describe blocks effectively
- **Clear naming**: Component-Story-Viewport-Theme-State
- **Focused testing**: Test critical visual aspects
- **Maintainable baselines**: Regular review and updates

### 3. Performance Considerations

- **Parallel execution**: Optimize test runner workers
- **Selective updates**: Update only changed baselines
- **CI optimization**: Use appropriate resources
- **Cleanup**: Remove outdated screenshots

### 4. Maintenance

- **Regular reviews**: Monthly baseline audits
- **Design system updates**: Coordinate with design changes
- **Browser updates**: Test with new browser versions
- **Documentation**: Keep README current

## 🔮 Future Enhancements

### Planned Features

- **Automated baseline updates**: AI-assisted change detection
- **Component variants**: Dynamic story generation
- **Performance budgets**: Automated performance regression detection
- **Visual linting**: Automated design consistency checks
- **Integration testing**: Multi-component interaction tests

### Tool Improvements

- **Better diff visualization**: Enhanced comparison tools
- **Selective testing**: Smart test selection based on changes
- **Cloud integration**: Distributed screenshot storage
- **Analytics**: Visual regression trend analysis
