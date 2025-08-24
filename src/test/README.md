# Comprehensive Responsive Testing Suite

This directory contains a comprehensive testing suite for the desktop chess adaptation, covering all aspects of responsive design, performance, accessibility, and cross-browser compatibility.

## Test Categories

### 1. Integration Tests (`integration/`)
**File**: `responsiveLayout.test.tsx`

Tests the integration between responsive components and layout switching functionality.

**Coverage**:
- Layout switching between mobile and desktop modes
- Component responsiveness during viewport changes
- Game state preservation during layout transitions
- Performance during layout changes

**Requirements Covered**: 1.1, 1.2, 1.3, 3.1

### 2. Visual Regression Tests (`visual/`)
**File**: `screenSizes.test.tsx`

Tests visual consistency across different screen sizes and device types.

**Coverage**:
- Mobile viewports (iPhone, Samsung Galaxy, etc.)
- Tablet viewports (iPad, Surface Pro, etc.)
- Desktop viewports (1080p, 1440p, 4K, ultrawide)
- Edge cases (very narrow, very wide, square viewports)
- Aspect ratio handling

**Requirements Covered**: 2.1, 2.2, 2.3, 2.4

### 3. Cross-Browser Compatibility Tests (`compatibility/`)
**File**: `crossBrowser.test.tsx`

Tests functionality across different desktop browsers.

**Coverage**:
- Chrome desktop compatibility
- Firefox desktop compatibility
- Safari desktop compatibility
- Edge desktop compatibility
- Browser-specific feature detection
- Performance consistency across browsers

**Requirements Covered**: 4.1, 4.2, 4.3, 4.4

### 4. Accessibility Tests (`accessibility/`)
**File**: `keyboardNavigation.test.tsx`

Tests keyboard navigation and screen reader support for desktop users.

**Coverage**:
- Basic keyboard navigation (Tab, Escape, Arrow keys)
- Quiz keyboard shortcuts (number keys 1-4)
- Focus management and visibility
- Screen reader support (ARIA labels, live regions)
- Keyboard shortcut documentation
- Browser shortcut conflict prevention

**Requirements Covered**: 5.1, 5.2, 5.3, 5.4

### 5. Performance Benchmarks (`performance/`)
**File**: `desktopRendering.test.ts`

Tests rendering performance and memory usage for desktop layouts.

**Coverage**:
- Initial render performance across viewport sizes
- Layout transition performance
- Component-specific performance (chessboard, sidebar)
- Memory usage and leak detection
- Animation performance (60fps target)
- Performance regression detection

**Requirements Covered**: 4.4, 6.4

### 6. Comprehensive Test Suite (`comprehensive/`)
**File**: `responsiveTestSuite.test.ts`

Orchestrates all test categories and provides overall test reporting.

**Coverage**:
- Test suite validation
- Environment setup verification
- Requirements coverage validation
- Comprehensive test reporting

## Running Tests

### Individual Test Categories

```bash
# Run integration tests
npm run test:integration

# Run visual regression tests
npm run test:visual

# Run cross-browser compatibility tests
npm run test:compatibility

# Run accessibility tests
npm run test:accessibility

# Run performance benchmarks
npm run test:performance
```

### Comprehensive Test Suite

```bash
# Run the comprehensive test suite orchestrator
npm run test:responsive

# Run all responsive tests
npm run test:responsive-all
```

### Using Custom Configuration

```bash
# Run with responsive-specific configuration
npx vitest --config vitest.responsive.config.ts
```

## Test Environment Setup

The test suite uses the following setup:

- **Testing Framework**: Vitest
- **React Testing**: @testing-library/react
- **User Interaction**: @testing-library/user-event
- **Environment**: jsdom
- **Mocking**: Built-in Vitest mocking

### Key Mocks

- `window.matchMedia` - For responsive breakpoint testing
- `ResizeObserver` - For component resize detection
- `performance` API - For performance measurement
- `requestAnimationFrame` - For animation testing

## Performance Thresholds

The test suite enforces the following performance thresholds:

- **Initial Render**: < 100ms
- **Layout Transitions**: < 80ms
- **Large Viewport Rendering**: < 150ms
- **Animation Frame Rate**: 60fps target
- **Memory Usage**: < 10MB increase per render

## Accessibility Standards

Tests validate compliance with:

- **WCAG 2.1 AA** guidelines
- **Keyboard Navigation** standards
- **Screen Reader** compatibility
- **Focus Management** best practices

## Browser Support

Tests validate compatibility with:

- **Chrome** (latest)
- **Firefox** (latest)
- **Safari** (latest)
- **Edge** (latest)

## Coverage Requirements

The test suite maintains:

- **Line Coverage**: 80%
- **Function Coverage**: 80%
- **Branch Coverage**: 80%
- **Statement Coverage**: 80%

## Continuous Integration

The test suite is designed for CI/CD integration:

- **JSON Output**: Test results in machine-readable format
- **Coverage Reports**: HTML and JSON coverage reports
- **Performance Metrics**: Exportable performance data
- **Failure Reporting**: Detailed failure information

## Test Data and Fixtures

### Viewport Configurations

```typescript
const mobileViewports = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 12', width: 390, height: 844 },
  { name: 'Samsung Galaxy S21', width: 360, height: 800 }
]

const desktopViewports = [
  { name: 'Laptop', width: 1366, height: 768 },
  { name: 'Desktop 1080p', width: 1920, height: 1080 },
  { name: 'Desktop 4K', width: 3840, height: 2160 }
]
```

### Performance Benchmarks

```typescript
const performanceThresholds = {
  renderTime: 100,    // ms
  layoutTime: 50,     // ms
  paintTime: 30,      // ms
  memoryIncrease: 10  // MB
}
```

## Troubleshooting

### Common Issues

1. **Test Timeouts**: Increase `testTimeout` in vitest config
2. **Memory Leaks**: Check component cleanup in `afterEach` hooks
3. **Flaky Tests**: Add proper `waitFor` assertions
4. **Mock Issues**: Verify mock setup in `beforeEach` hooks

### Debug Mode

```bash
# Run tests with debug output
npm run test:responsive -- --reporter=verbose

# Run specific test file with debugging
npx vitest src/test/integration/responsiveLayout.test.tsx --reporter=verbose
```

## Contributing

When adding new tests:

1. Follow the existing test structure and naming conventions
2. Add appropriate mocks and setup in `beforeEach`
3. Clean up resources in `afterEach`
4. Update this README with new test coverage
5. Ensure tests are deterministic and not flaky
6. Add performance assertions where appropriate
7. Include accessibility checks for new UI components

## Requirements Traceability

| Requirement | Test Files | Description |
|-------------|------------|-------------|
| 1.1 | integration, visual | Desktop viewport utilization |
| 1.2 | integration, visual | Layout switching at breakpoints |
| 1.3 | integration, visual, comprehensive | Responsive component scaling |
| 2.1 | visual, performance | Larger chessboard for desktop |
| 2.2 | visual, performance | Chessboard scaling logic |
| 2.3 | visual, accessibility | Enhanced visual feedback |
| 2.4 | visual, performance | Drag and drop responsiveness |
| 3.1 | integration, visual | Horizontal layout structure |
| 3.2 | integration, visual | Dedicated quiz panel |
| 3.3 | integration, visual | Persistent AI sidebar |
| 3.4 | integration, visual | No scrolling requirement |
| 4.1 | compatibility, performance | Enhanced hover effects |
| 4.2 | compatibility, performance | AI thinking indicators |
| 4.3 | compatibility, performance | Quiz animations |
| 4.4 | compatibility, performance | Visual feedback performance |
| 5.1 | accessibility | Keyboard shortcuts |
| 5.2 | accessibility | Quiz number key selection |
| 5.3 | accessibility | Keyboard navigation |
| 5.4 | accessibility | Input method compatibility |
| 6.1 | visual | Futuristic theme preservation |
| 6.2 | visual | Design language consistency |
| 6.3 | visual | Proportional scaling |
| 6.4 | visual, performance | Background element scaling |
| 7.1 | N/A | Mobile dependency removal |
| 7.2 | N/A | Mobile code exclusion |
| 7.3 | N/A | Mobile asset exclusion |
| 7.4 | N/A | Mobile API avoidance |