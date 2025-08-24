# DesktopSidebar Component

The `DesktopSidebar` component provides a desktop-optimized sidebar layout for the Planetary Chess game, containing AI interaction, quiz questions, and game controls.

## Features

- **Responsive Design**: Only renders on desktop and large desktop layouts (hidden on mobile/tablet)
- **AI Avatar**: Animated Stewie avatar with thinking states and glow effects
- **Interactive Quiz**: Question display with multiple choice answers and hover effects
- **Dynamic Sizing**: Automatically scales based on screen size using responsive utilities
- **Game Controls**: Navigation buttons and question counter
- **Accessibility**: Proper ARIA labels, keyboard navigation support, and semantic HTML

## Usage

```tsx
import { DesktopSidebar } from '../components/DesktopSidebar';
import { ResponsiveProvider } from '../contexts/ResponsiveContext';

function GameLayout() {
  return (
    <ResponsiveProvider>
      <div style={{ display: 'flex' }}>
        {/* Main game area */}
        <div style={{ flex: 1 }}>
          {/* Chessboard and other content */}
        </div>
        
        {/* Desktop sidebar */}
        <DesktopSidebar
          currentQuestion={currentQuestion}
          isThinking={isAIThinking}
          currentTaunt={aiTaunt}
          isQuizVisible={showQuiz}
          isGameOver={gameEnded}
          questionNumber={currentQuestionNum}
          totalQuestions={totalQuestions}
          onQuizAnswer={handleQuizAnswer}
          onNavigate={handleNavigation}
        />
      </div>
    </ResponsiveProvider>
  );
}
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `currentQuestion` | `QuizQuestion` | Current quiz question object |
| `isThinking` | `boolean` | Whether AI is currently thinking |
| `currentTaunt` | `string` | Current AI taunt/message to display |
| `isQuizVisible` | `boolean` | Whether to show the quiz section |
| `isGameOver` | `boolean` | Whether the game has ended |
| `questionNumber` | `number` | Current question number (1-based) |
| `totalQuestions` | `number` | Total number of questions |
| `onQuizAnswer` | `(answer: string) => void` | Callback when user selects an answer |
| `onNavigate` | `(path: string) => void` | Callback for navigation actions |
| `layoutMode` | `LayoutMode` (optional) | Override layout mode for testing |

## Layout Behavior

- **Mobile/Tablet**: Component returns `null` (not rendered)
- **Desktop**: Renders as a fixed-width sidebar (350px base, scaled by responsive utilities)
- **Large Desktop**: Larger dimensions and spacing for better use of screen space

## Styling

The component uses:
- Futuristic color scheme with cyan/blue gradients
- Orbitron font family for headers and buttons
- CSS animations for thinking states and hover effects
- Responsive sizing based on viewport dimensions
- Backdrop blur effects for modern glass-morphism appearance

## Animations

- **Thinking State**: Pulsing glow effect on avatar and animated progress bar
- **Hover Effects**: Smooth transitions on buttons with enhanced shadows
- **Layout Transitions**: Smooth scaling and positioning changes

## Accessibility

- Semantic HTML structure with proper headings
- Alt text for avatar image
- Keyboard navigation support for all interactive elements
- High contrast colors for readability
- Screen reader friendly text content

## Testing

The component includes comprehensive tests covering:
- Rendering in different layout modes
- Quiz interaction functionality
- AI thinking state animations
- Navigation callbacks
- Accessibility features
- Edge cases and error handling

Run tests with:
```bash
npm test -- DesktopSidebar
```

## Integration

The DesktopSidebar integrates with:
- `ResponsiveContext` for layout mode detection
- `QuizQuestion` data structure from quiz questions
- Existing game state management
- Navigation routing system

See `DesktopSidebarExample.tsx` for a complete integration example.