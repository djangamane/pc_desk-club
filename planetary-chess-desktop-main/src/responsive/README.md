# Responsive Layout System

This responsive layout system provides a comprehensive solution for creating desktop-optimized layouts while maintaining mobile compatibility for the Planetary Chess application.

## Overview

The system consists of:
- **ResponsiveContext**: React context for managing responsive state
- **LayoutManager**: Main component that provides responsive layout capabilities
- **LayoutSection**: Component for organizing content within responsive layouts
- **Utility functions**: Helper functions for responsive calculations

## Quick Start

### Basic Usage

```tsx
import { LayoutManager, LayoutSection } from '../responsive';

function App() {
  return (
    <LayoutManager>
      <LayoutSection section="header">
        <Header />
      </LayoutSection>
      
      <LayoutSection section="chessboard">
        <Chessboard />
      </LayoutSection>
      
      <LayoutSection section="sidebar">
        <Sidebar />
      </LayoutSection>
    </LayoutManager>
  );
}
```

### Using Responsive Context

```tsx
import { useResponsive } from '../responsive';

function MyComponent() {
  const { 
    layoutMode, 
    chessboardSize, 
    calculateDynamicSize,
    isLayoutMode 
  } = useResponsive();
  
  return (
    <div style={{
      fontSize: calculateDynamicSize(16),
      padding: isLayoutMode('mobile') ? '1rem' : '2rem'
    }}>
      Current layout: {layoutMode}
      Chessboard size: {chessboardSize}px
    </div>
  );
}
```

## Components

### LayoutManager

The main component that wraps your application and provides responsive context.

**Props:**
- `children`: React nodes to render
- `className?`: Additional CSS class
- `style?`: Additional inline styles
- `onLayoutChange?`: Callback when layout mode changes

**Example:**
```tsx
<LayoutManager 
  className="my-app"
  onLayoutChange={(mode) => console.log('Layout changed to:', mode)}
>
  {/* Your app content */}
</LayoutManager>
```

### LayoutSection

Component for organizing content within responsive layouts.

**Props:**
- `children`: React nodes to render
- `section`: Section type ('chessboard' | 'sidebar' | 'header' | 'footer')
- `className?`: Additional CSS class
- `style?`: Additional inline styles

**Example:**
```tsx
<LayoutSection section="chessboard" className="chess-container">
  <ChessboardComponent />
</LayoutSection>
```

### ResponsiveProvider

Context provider (used internally by LayoutManager).

**Props:**
- `children`: React nodes to render

## Hooks

### useResponsive

Main hook for accessing responsive context.

**Returns:**
```tsx
{
  viewportInfo: ViewportInfo;           // Current viewport dimensions and breakpoints
  layoutMode: LayoutMode;               // Current layout mode
  layoutConfig: LayoutConfig;           // Current layout configuration
  chessboardSize: number;               // Calculated chessboard size
  calculateDynamicSize: (baseSize: number, scaleFactor?: number) => number;
  isLayoutMode: (mode: LayoutMode) => boolean;
}
```

### useCurrentLayoutMode

Lightweight hook that only returns the current layout mode.

**Returns:** `'mobile' | 'tablet' | 'desktop' | 'large-desktop'`

### useResponsiveUtils

Hook for accessing utility functions without full context.

**Returns:**
```tsx
{
  calculateDynamicSize: (baseSize: number, scaleFactor?: number) => number;
  isLayoutMode: (mode: LayoutMode) => boolean;
  layoutMode: LayoutMode;
}
```

## Utility Functions

### calculateResponsiveFontSize

Calculate font size based on layout mode.

```tsx
import { calculateResponsiveFontSize } from '../responsive';

const fontSize = calculateResponsiveFontSize(16, 'desktop'); // Returns 19
```

### calculateResponsiveSpacing

Calculate spacing based on layout mode.

```tsx
import { calculateResponsiveSpacing } from '../responsive';

const spacing = calculateResponsiveSpacing(10, 'desktop'); // Returns 15
```

### calculateComponentSize

Calculate component size with viewport constraints.

```tsx
import { calculateComponentSize } from '../responsive';

const size = calculateComponentSize(
  viewportInfo,
  200,    // min size
  800,    // max size
  0.9     // viewport percentage
);
```

### generateResponsiveCSSProperties

Generate CSS custom properties for responsive styling.

```tsx
import { generateResponsiveCSSProperties } from '../responsive';

const cssProps = generateResponsiveCSSProperties('desktop', viewportInfo);
// Returns object with CSS custom properties like '--layout-direction': 'row'
```

## Layout Modes

The system supports four layout modes:

### Mobile (< 768px)
- **Direction:** Column (vertical stacking)
- **Chessboard:** 320-380px
- **Sidebar:** Full width, positioned below chessboard
- **Spacing:** 1rem padding, 1rem gap

### Tablet (768px - 1024px)
- **Direction:** Column (vertical stacking)
- **Chessboard:** 450-550px
- **Sidebar:** Full width, positioned below chessboard
- **Spacing:** 1.5rem padding, 1.5rem gap

### Desktop (1024px - 1440px)
- **Direction:** Row (horizontal layout)
- **Chessboard:** 600-800px, 65% of container width
- **Sidebar:** 35% of container width, positioned right
- **Spacing:** 2rem padding, 2rem gap

### Large Desktop (> 1440px)
- **Direction:** Row (horizontal layout)
- **Chessboard:** 700-900px, 70% of container width
- **Sidebar:** 30% of container width, positioned right
- **Spacing:** 2.5rem padding, 2.5rem gap

## Configuration

The responsive behavior is configured in `src/config/responsive.ts`:

```tsx
export const RESPONSIVE_CONFIG: ResponsiveConfig = {
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1440,
  },
  chessboard: {
    mobile: { min: 320, max: 380 },
    tablet: { min: 450, max: 550 },
    desktop: { min: 600, max: 800 },
    largeDesktop: { min: 700, max: 900 },
  },
  // ... layout configurations
};
```

## Higher-Order Component

### withResponsiveLayout

HOC for adding responsive layout to existing components.

```tsx
import { withResponsiveLayout } from '../responsive';

const MyComponent = ({ title }: { title: string }) => (
  <div>{title}</div>
);

const ResponsiveMyComponent = withResponsiveLayout(MyComponent);

// Usage
<ResponsiveMyComponent 
  title="Hello"
  layoutManagerProps={{ 
    className: 'custom-layout',
    onLayoutChange: handleLayoutChange 
  }}
/>
```

## CSS Classes

The system automatically applies CSS classes for styling:

- `.layout-manager`: Main layout container
- `.layout-{mode}`: Layout mode classes (e.g., `.layout-desktop`)
- `.layout-section`: All layout sections
- `.layout-section-{section}`: Section-specific classes
- `.layout-section-{section}-{mode}`: Section and mode specific classes

## Data Attributes

Components include data attributes for CSS targeting:

- `data-layout-mode`: Current layout mode
- `data-viewport-width`: Current viewport width
- `data-viewport-height`: Current viewport height
- `data-section`: Section type (for LayoutSection)

## Example CSS

```css
/* Desktop-specific styles */
.layout-desktop .chessboard {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

/* Mobile-specific styles */
.layout-mobile .sidebar {
  border-top: 1px solid #333;
}

/* Section-specific styles */
.layout-section-chessboard {
  transition: all 0.3s ease-in-out;
}

/* Responsive using data attributes */
[data-layout-mode="large-desktop"] .game-title {
  font-size: 2.5rem;
}
```

## Testing

The system includes comprehensive tests:

```bash
# Run all responsive tests
npm test -- --run contexts/__tests__/ResponsiveContext.test.tsx
npm test -- --run components/__tests__/LayoutManager.test.tsx
npm test -- --run utils/__tests__/responsiveUtils.test.ts
```

## Migration Guide

To migrate existing components to use the responsive system:

1. **Wrap your app with LayoutManager:**
   ```tsx
   // Before
   <div className="app">
     <Game />
   </div>
   
   // After
   <LayoutManager>
     <Game />
   </LayoutManager>
   ```

2. **Use LayoutSection for major sections:**
   ```tsx
   // Before
   <div className="chessboard-container">
     <Chessboard />
   </div>
   
   // After
   <LayoutSection section="chessboard">
     <Chessboard />
   </LayoutSection>
   ```

3. **Replace fixed sizes with responsive calculations:**
   ```tsx
   // Before
   <div style={{ fontSize: 16, padding: 20 }}>
   
   // After
   const { calculateDynamicSize } = useResponsive();
   <div style={{ 
     fontSize: calculateDynamicSize(16), 
     padding: calculateDynamicSize(20) 
   }}>
   ```

4. **Use layout mode for conditional rendering:**
   ```tsx
   // Before
   const isMobile = window.innerWidth < 768;
   
   // After
   const { isLayoutMode } = useResponsive();
   const isMobile = isLayoutMode('mobile');
   ```

## Performance Considerations

- The viewport detection is debounced (100ms) to prevent excessive re-renders
- Use `useCurrentLayoutMode` instead of `useResponsive` when you only need the layout mode
- CSS transitions are applied for smooth layout changes
- Components are optimized for minimal re-renders

## Browser Support

The responsive system supports all modern browsers:
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Troubleshooting

### Common Issues

1. **Context not available error:**
   - Ensure components using responsive hooks are wrapped in `LayoutManager` or `ResponsiveProvider`

2. **Layout not updating on resize:**
   - Check that viewport detection is working (console.log the viewport info)
   - Ensure no CSS is overriding the responsive styles

3. **Incorrect chessboard sizing:**
   - Verify the viewport dimensions are correct
   - Check that the responsive configuration matches your requirements

### Debug Mode

Enable debug logging by adding this to your component:

```tsx
const { viewportInfo, layoutMode } = useResponsive();
console.log('Responsive Debug:', { viewportInfo, layoutMode });
```