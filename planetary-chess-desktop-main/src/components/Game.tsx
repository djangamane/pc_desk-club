import { useState, useRef, useEffect } from 'react';
import { Chess, type Chess as ChessType } from 'chess.js';
// Chessboard import removed as we use ResponsiveChessboardContainer
import { quizQuestions, type QuizQuestion } from '../data/quizQuestions';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { calculateScore } from '../utils/scoring';
import { shuffle } from 'lodash';
import { LayoutManager } from './LayoutManager';
import { ResponsiveLayoutWrapper } from './DesktopLayout';
import { ResponsiveChessboardContainer } from './ResponsiveChessboardContainer';
import { DesktopSidebar } from './DesktopSidebar';
import { useResponsive } from '../contexts/ResponsiveContext';
import { GlobalAnimationStyles } from './GlobalAnimationStyles';
import { LayoutTransition, useLayoutTransition } from './LayoutTransition';
import { EnhancedHoverButton } from './EnhancedHoverButton';
import { KeyboardHandler } from './KeyboardHandler';
import { ResponsiveStyleProvider } from './ResponsiveStyleProvider';
import { ResponsiveQuiz } from './ResponsiveQuiz';
import { 
  ResponsiveButton, 
  ResponsivePanel, 
  ResponsiveText, 
  ResponsiveAvatar, 
  ResponsiveContainer,
  ResponsiveFlex 
} from './ResponsiveStyledComponents';
import { 
  FUTURISTIC_THEME,
  createResponsiveTextStyles,
  createResponsiveAvatarStyles,
  getResponsiveFontSize,
  getResponsiveSpacing 
} from '../styles/responsiveStyles';

type GameState = {
  currentQuestion: QuizQuestion;
  remainingQuestions: QuizQuestion[];
  usedQuestions: QuizQuestion[];
  isQuizVisible: boolean;
  lastMoveCorrect: boolean | null;
  currentTaunt: string;
  isGameOver: boolean; // Added to track game over state explicitly
};

type ResponsiveGameState = GameState & {
  layout: {
    mode: 'mobile' | 'tablet' | 'desktop' | 'large-desktop';
    chessboardSize: number;
    sidebarWidth: number;
    containerHeight: number;
  };
};

// Internal Game component that uses responsive context
function GameInternal() {
  const { layoutMode, chessboardSize, calculateDynamicSize, isLayoutMode } = useResponsive();
  const { previousLayoutMode, isTransitioning, handleTransitionComplete } = useLayoutTransition(layoutMode);
  const navigate = useNavigate();
  const [game] = useState<ChessType>(new Chess());
  const [isThinking, setIsThinking] = useState(false);

  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [questionsResetCount, setQuestionsResetCount] = useState(0);
  const [incorrectAnswersCount, setIncorrectAnswersCount] = useState(0);
  // Initialize responsive game state with shuffled questions
  const [gameState, setGameState] = useState<ResponsiveGameState>(() => {
    const shuffledQuestions = shuffle([...quizQuestions]);
    return {
      currentQuestion: shuffledQuestions[0],
      remainingQuestions: shuffledQuestions.slice(1),
      usedQuestions: [],
      isQuizVisible: true,
      lastMoveCorrect: null,
      currentTaunt: "Before I make my first move, let's see how much you know...",
      isGameOver: false,
      layout: {
        mode: layoutMode,
        chessboardSize: chessboardSize,
        sidebarWidth: calculateDynamicSize(350),
        containerHeight: calculateDynamicSize(600),
      },
    };
  });

  // Update layout state when responsive context changes
  useEffect(() => {
    setGameState(prev => ({
      ...prev,
      layout: {
        mode: layoutMode,
        chessboardSize: chessboardSize,
        sidebarWidth: calculateDynamicSize(350),
        containerHeight: calculateDynamicSize(600),
      },
    }));
  }, [layoutMode, chessboardSize, calculateDynamicSize]);

  const stockfishRef = useRef<Worker | null>(null);

  // Get next question and handle reshuffling when all questions are used
  const getNextQuestion = (): [QuizQuestion, QuizQuestion[], QuizQuestion[]] => {
    // Check if we need to reshuffle (all questions used)
    const needReshuffle = gameState.remainingQuestions.length === 0;

    // Increment reset count if reshuffling
    if (needReshuffle) {
      setQuestionsResetCount(prev => prev + 1);
      console.log("DEBUG: Reshuffling questions, incrementing reset count.");
    }

    const questionsToShuffle = needReshuffle ? [...gameState.usedQuestions] : [...gameState.remainingQuestions];
    const shuffled = shuffle(questionsToShuffle);

    const nextQuestion = shuffled[0];
    const nextRemaining = shuffled.slice(1);
    // If we reshuffled, usedQuestions starts fresh (excluding the new current one)
    // Otherwise, add the current question to usedQuestions
    const nextUsed = needReshuffle ? [] : [...gameState.usedQuestions, gameState.currentQuestion];

    return [nextQuestion, nextRemaining, nextUsed];
  };


  // --- Centralized Game Status Check ---
  const checkGameStatusAndUpdateState = async () => {
    console.log(`DEBUG: Checking game status. isGameOver: ${game.isGameOver()}, isCheckmate: ${game.isCheckmate()}, turn: ${game.turn()}`);

    if (game.isCheckmate()) {
      // Corrected logic based on logs: turn() indicates the player who CANNOT move.
      const playerWon = game.turn() === 'w'; // White (Player) cannot move => Player Won
      const aiWon = game.turn() === 'b';    // Black (AI) cannot move => AI Won

      if (playerWon) {
        // --- PLAYER WIN CONDITION ---
        console.log("Player win condition met!");
        const moves = game.history().length;
        // Pass the reset count to the scoring function
        const score = calculateScore(correctAnswersCount, incorrectAnswersCount, Math.ceil(moves / 2), questionsResetCount);
        // Update log to include reset count
        console.log(`Calculated Score: ${score}, Correct: ${correctAnswersCount}, Incorrect: ${incorrectAnswersCount}, Moves: ${Math.ceil(moves / 2)}, Resets: ${questionsResetCount}`);

        setGameState(prev => ({ ...prev, isGameOver: true, isQuizVisible: false })); // Mark game over immediately

        // Handle leaderboard logic (async)
        try {
          console.log("Fetching leaderboard...");
          const { data: leaderboard, error: fetchError } = await supabase
            .from('scores')
            .select('score')
            .order('score', { ascending: false })
            .limit(10);

          if (fetchError) throw fetchError;
          console.log("Leaderboard data:", leaderboard);

          const qualifies = !leaderboard || leaderboard.length < 10 || score > leaderboard[leaderboard.length - 1].score;
          console.log(`Qualifies for leaderboard: ${qualifies}`);

          if (qualifies) {
            console.log("Prompting for name...");
            const playerName = window.prompt(`You have ranked on the Planetary Chess leaderboard with a score of ${score}! What's your handle?`);
            console.log(`Player entered name: ${playerName}`);

            if (playerName && playerName.trim() !== '') {
              console.log("Saving score to Supabase...");
              const { error: insertError } = await supabase
                .from('scores')
                .insert([{ name: playerName.trim(), score: score }]);

              if (insertError) throw insertError;

              console.log("Score saved successfully.");
              setGameState(prev => ({ ...prev, currentTaunt: `Checkmate! Score: ${score}. Saved to leaderboard as ${playerName.trim()}!` }));
            } else {
              console.log("Player cancelled or entered empty name.");
              setGameState(prev => ({ ...prev, currentTaunt: `Checkmate! Score: ${score}. You qualified but didn't enter a name.` }));
            }
          } else {
            setGameState(prev => ({ ...prev, currentTaunt: `Checkmate! Your score: ${score}. Not quite enough for the leaderboard this time.` }));
          }
        } catch (err) {
          console.error("Error handling win condition:", err);
          const errorMessage = err instanceof Error ? err.message : String(err);
          setGameState(prev => ({ ...prev, currentTaunt: `Checkmate! Score: ${score}. An error occurred processing the leaderboard: ${errorMessage}` }));
        }
        return true; // Game ended

      } else if (aiWon) {
        // --- AI WIN CONDITION ---
        console.log("AI win condition met.");
        setGameState(prev => ({
          ...prev,
          isGameOver: true,
          isQuizVisible: false,
          currentTaunt: "Hah! Checkmated by a baby. How delightfully pathetic! Your intellectual genealogy is as shallow as a colonial water basin."
        }));
        return true; // Game ended
      }
    } else if (game.isDraw()) {
      console.log("Draw condition met.");
      setGameState(prev => ({
        ...prev,
        isGameOver: true,
        isQuizVisible: false,
        currentTaunt: "A draw? How dreadfully bourgeois. Like watching American Idol without the satisfaction of seeing dreams crushed."
      }));
      return true; // Game ended
    } else if (game.isStalemate()) {
      console.log("Stalemate condition met.");
      setGameState(prev => ({
        ...prev,
        isGameOver: true,
        isQuizVisible: false,
        currentTaunt: "Stalemate? How pedestrian. Like a Walmart shopper trying to haggle."
      }));
      return true; // Game ended
    } else if (game.isInsufficientMaterial()) {
       console.log("Insufficient material condition met.");
       setGameState(prev => ({
        ...prev,
        isGameOver: true,
        isQuizVisible: false,
        currentTaunt: "Insufficient material? A pathetic end. Like bringing a spork to a laser gun fight."
      }));
      return true; // Game ended
    } else if (game.isThreefoldRepetition()) {
       console.log("Threefold repetition condition met.");
       setGameState(prev => ({
        ...prev,
        isGameOver: true,
        isQuizVisible: false,
        currentTaunt: "Threefold repetition? Are you stuck in a temporal loop, you simpleton?"
      }));
      return true; // Game ended
    }

    // --- Game Continues ---
    console.log("Game continues.");
    return false; // Game did not end
  };
  // --- End Centralized Game Status Check ---


  useEffect(() => {
    // Skip Stockfish initialization in test environment
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && !window.location.href.includes('test')) {
      try {
        stockfishRef.current = new Worker('/stockfish.js');
        stockfishRef.current.addEventListener('message', handleStockfishMessage);
        stockfishRef.current.postMessage('uci');
        stockfishRef.current.postMessage('ucinewgame');
      } catch (error) {
        console.warn('Stockfish worker initialization failed:', error);
        // Fallback: use a mock worker for testing
        stockfishRef.current = null;
      }
    }

    return () => stockfishRef.current?.terminate();
  }, []);


  const handleStockfishMessage = async (e: MessageEvent) => {
    const message = e.data;
    if (message.startsWith('bestmove')) {
      const move = message.split(' ')[1];
      console.log(`DEBUG: Stockfish suggests move: ${move}`);
      if (move && move !== '(none)') { // Ensure move is valid
         game.move(move);
      } else {
         console.warn("Stockfish returned invalid move:", move);
      }
      setIsThinking(false);

      // Check game status AFTER AI move
      const gameEnded = await checkGameStatusAndUpdateState();

      if (!gameEnded) {
        // If game didn't end, it's player's turn, don't show quiz
        setGameState(prev => ({
          ...prev,
          isQuizVisible: false, // Hide quiz after AI moves
          currentTaunt: prev.currentTaunt // Keep the taunt from the quiz answer
        }));
      }
    }
  };

  const makeAIMove = (difficulty: 'easy' | 'hard') => {
    if (gameState.isGameOver) return; // Don't move if game is already over

    setIsThinking(true);
    // Lower the 'easy' depth range to 1-3
    const depth = difficulty === 'easy'
      ? Math.floor(Math.random() * 3) + 1
      : Math.floor(Math.random() * 3) + 16; // Keep 'hard' depth as 16-18

    // Simplified: Always use Stockfish for now, remove random move logic
    console.log(`DEBUG: Requesting Stockfish move with depth ${depth}`);
    stockfishRef.current?.postMessage(`position fen ${game.fen()}`);
    stockfishRef.current?.postMessage(`go depth ${depth}`);
  };

  const handleQuizAnswer = (selectedAnswer: string) => {
    if (gameState.isGameOver) return; // Don't process if game over

    const isCorrect = selectedAnswer === gameState.currentQuestion.correctAnswer;

    // Update answer counts
    if (isCorrect) {
      setCorrectAnswersCount(prev => prev + 1);
    } else {
      setIncorrectAnswersCount(prev => prev + 1);
    }

    const [nextQuestion, nextRemaining, nextUsed] = getNextQuestion();

    // Set taunt based on answer, prepare for AI move
    setGameState(prev => ({
      ...prev,
      currentQuestion: nextQuestion,
      remainingQuestions: nextRemaining,
      usedQuestions: nextUsed,
      isQuizVisible: false, // Hide quiz immediately
      lastMoveCorrect: isCorrect,
      currentTaunt: isCorrect
        ? gameState.currentQuestion.tauntCorrect
        : gameState.currentQuestion.tauntIncorrect
    }));

    // Trigger AI move after setting state
    makeAIMove(isCorrect ? 'easy' : 'hard');
  };

  /**
   * Handle keyboard-based quiz answer selection
   * @param answerIndex - Index of the selected answer (0-3)
   */
  const handleKeyboardQuizAnswer = (answerIndex: number) => {
    if (gameState.isGameOver || !gameState.isQuizVisible) return;
    
    const options = gameState.currentQuestion.options;
    if (answerIndex >= 0 && answerIndex < options.length) {
      handleQuizAnswer(options[answerIndex]);
    }
  };

  /**
   * Handle keyboard navigation actions
   * @param action - Navigation action to perform
   */
  const handleKeyboardNavigation = (action: 'back' | 'home') => {
    switch (action) {
      case 'back':
      case 'home':
        navigate('/');
        break;
    }
  };

  /**
   * Handle keyboard game control actions
   * @param action - Game control action to perform
   */
  const handleKeyboardGameControl = (action: 'pause' | 'reset') => {
    switch (action) {
      case 'reset':
        // Reset game state (could be implemented in future)
        console.log('Game reset requested via keyboard');
        break;
      case 'pause':
        // Pause game (could be implemented in future)
        console.log('Game pause requested via keyboard');
        break;
    }
  };

  // Must be synchronous for react-chessboard
  const onDrop = (sourceSquare: string, targetSquare: string): boolean => {
    if (gameState.isGameOver) return false; // Don't allow moves if game over

    let moveSuccessful = false;
    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q' // Assuming promotion to queen
      });

      if (move === null) {
        console.log("DEBUG: Invalid player move attempted.");
        moveSuccessful = false;
      } else {
         console.log(`DEBUG: Player moved ${sourceSquare}-${targetSquare}`);
         moveSuccessful = true;

         // Call the async check function but don't await it
         checkGameStatusAndUpdateState().then(gameEnded => {
            if (!gameEnded) {
              // If game didn't end, show quiz for AI's turn
              console.log("DEBUG: Game continues, showing quiz.");
              setGameState(prev => ({
                ...prev,
                isQuizVisible: true // Show quiz before AI moves
              }));
            }
         }).catch(err => {
             // Handle potential errors from the async check if necessary
             console.error("Error during async game status check:", err);
         });
      }

    } catch (error) {
      console.error('Move error:', error);
      moveSuccessful = false; // Move failed
    }

    // Return the synchronous result of the move attempt
    return moveSuccessful;
  };

  const questionNumber = gameState.usedQuestions.length + 1;
  const totalQuestions = quizQuestions.length;

  // Custom light and dark square colors for the chess board
  const customDarkSquareStyle = {
    backgroundColor: '#193f6e',
    boxShadow: 'inset 0 0 3px rgba(0, 195, 255, 0.3)'
  };
  const customLightSquareStyle = {
    backgroundColor: '#236ab0',
    boxShadow: 'inset 0 0 3px rgba(255, 255, 255, 0.2)'
  };

  // Responsive chessboard component
  const ResponsiveChessboard = () => (
    <ResponsiveChessboardContainer
      game={game}
      onPieceDrop={onDrop}
      boardOrientation="black"
      customDarkSquareStyle={customDarkSquareStyle}
      customLightSquareStyle={customLightSquareStyle}
    />
  );

  // Desktop sidebar content
  const DesktopSidebarContent = () => (
    <DesktopSidebar
      currentQuestion={gameState.currentQuestion}
      isThinking={isThinking}
      currentTaunt={gameState.currentTaunt}
      isQuizVisible={gameState.isQuizVisible}
      isGameOver={gameState.isGameOver}
      questionNumber={questionNumber}
      totalQuestions={totalQuestions}
      onQuizAnswer={handleQuizAnswer}
      onNavigate={navigate}
    />
  );

  // Mobile layout component (preserves original mobile design)
  const MobileLayout = () => {
    const avatarSize = 80;
    const avatarStyles = createResponsiveAvatarStyles(layoutMode, avatarSize, true);
    
    // Create a Stewie avatar using responsive styling
    const stewieAvatar = (
      <ResponsiveAvatar
        size={avatarSize}
        withGlow={true}
        style={{
          margin: '0 auto 5px',
          animation: isThinking ? 'responsiveGlow 1.5s infinite ease-in-out' : 'none',
        }}
        data-testid="mobile-stewie-avatar"
      >
        <img
          src="/assets/stewie.png"
          alt="AI Stewie"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'drop-shadow(0 0 8px rgba(0, 195, 255, 0.7))'
          }}
        />
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at center, transparent 0%, rgba(5, 12, 23, 0.3) 90%)',
          borderRadius: '50%',
          zIndex: 2
        }}></div>
        {isThinking && (
          <div style={{
            position: 'absolute',
            bottom: '5px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '40px',
            height: '4px',
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '2px',
            overflow: 'hidden',
            zIndex: 3
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: '30%',
              background: FUTURISTIC_THEME.gradients.button,
              borderRadius: '2px',
              animation: 'responsiveThinkingBar 1.2s infinite',
            }}></div>
          </div>
        )}
      </ResponsiveAvatar>
    );

    return (
      <ResponsiveContainer
        style={{
          justifyContent: 'space-between',
          alignItems: 'center',
          overflow: 'hidden',
          padding: `${getResponsiveSpacing('sm', layoutMode)}px`,
          position: 'relative'
        }}
        data-testid="mobile-layout-container"
      >
        {/* Digital circuit decoration */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent 0%, rgba(0, 195, 255, 0.1) 50%, transparent 100%)', boxShadow: FUTURISTIC_THEME.effects.glow.subtle, zIndex: 1 }}></div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent 0%, rgba(0, 195, 255, 0.1) 50%, transparent 100%)', boxShadow: FUTURISTIC_THEME.effects.glow.subtle, zIndex: 1 }}></div>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '1px', background: 'linear-gradient(180deg, transparent 0%, rgba(0, 195, 255, 0.1) 50%, transparent 100%)', boxShadow: FUTURISTIC_THEME.effects.glow.subtle, zIndex: 1 }}></div>
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '1px', background: 'linear-gradient(180deg, transparent 0%, rgba(0, 195, 255, 0.1) 50%, transparent 100%)', boxShadow: FUTURISTIC_THEME.effects.glow.subtle, zIndex: 1 }}></div>

        {/* Header Section with Stewie Avatar */}
        <ResponsiveFlex
          direction={{ mobile: 'column', tablet: 'column', desktop: 'column', 'large-desktop': 'column' }}
          align="center"
          justify="center"
          gap="sm"
          style={{
            width: '100%',
            textAlign: 'center',
            position: 'relative',
            zIndex: 5,
          }}
        >
          <ResponsiveText
            variant="heading"
            size="2xl"
            as="h1"
            style={{
              margin: '0 0 5px 0',
              textShadow: FUTURISTIC_THEME.effects.glow.subtle,
            }}
          >
            PLANETARY CHESS
          </ResponsiveText>

          {stewieAvatar}

          <ResponsivePanel
            variant="overlay"
            withGlow={true}
            style={{
              width: '85%',
              maxWidth: '500px',
              position: 'relative',
              padding: `${getResponsiveSpacing('sm', layoutMode)}px ${getResponsiveSpacing('base', layoutMode)}px`,
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-10px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '0',
                height: '0',
                borderLeft: '10px solid transparent',
                borderRight: '10px solid transparent',
                borderBottom: `10px solid ${FUTURISTIC_THEME.colors.background.overlay}`,
              }}
            ></div>

            <ResponsiveText
              variant="body"
              size="sm"
              as="p"
              style={{
                margin: 0,
                fontStyle: 'italic'
              }}
            >
              {isThinking ? (
                <span>
                  Processing neural pathways
                  <span style={{display: 'inline-block', animation: 'responsiveBlink 1.2s infinite'}}>...</span>
                </span>
              ) : (
                gameState.currentTaunt
              )}
            </ResponsiveText>
          </ResponsivePanel>

          <ResponsiveText
            variant="caption"
            size="xs"
            style={{
              marginBottom: '5px'
            }}
          >
            <span style={{color: FUTURISTIC_THEME.colors.text.secondary}}>QUANTUM INQUIRY</span>{' '}
            <span style={{color: FUTURISTIC_THEME.colors.secondary}}>{questionNumber}</span>{' '}
            <span style={{color: FUTURISTIC_THEME.colors.text.secondary}}>OF</span>{' '}
            <span style={{color: FUTURISTIC_THEME.colors.secondary}}>{totalQuestions}</span>
          </ResponsiveText>

          <ResponsiveButton
            onClick={() => navigate('/')}
            variant="secondary"
            size="sm"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
            data-testid="mobile-return-button"
          >
            ← Return to Base
          </ResponsiveButton>
        </ResponsiveFlex>

        {/* Chessboard Section */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexGrow: 1,
            position: 'relative',
            zIndex: 2,
            width: '100%',
            maxWidth: '500px',
            margin: '0 auto'
          }}
        >
          <ResponsiveChessboard />
        </div>

        {/* Quiz Section */}
        <div style={{
          width: '90%',
          maxWidth: '400px',
          margin: `${getResponsiveSpacing('base', layoutMode)}px auto`,
          position: 'relative',
          zIndex: 3
        }}>
          <ResponsiveQuiz
            currentQuestion={gameState.currentQuestion}
            isVisible={gameState.isQuizVisible}
            isGameOver={gameState.isGameOver}
            questionNumber={questionNumber}
            totalQuestions={totalQuestions}
            onQuizAnswer={handleQuizAnswer}
            keyboardEnabled={false} // Disable keyboard on mobile to avoid conflicts
            layoutMode={layoutMode}
            data-testid="mobile-quiz"
          />
        </div>

        {/* Game status indicator */}
        <div style={{
          width: '80%',
          maxWidth: '400px',
          margin: `${getResponsiveSpacing('sm', layoutMode)}px auto`,
          height: '4px',
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '2px',
          overflow: 'hidden',
          position: 'relative',
          marginBottom: `${getResponsiveSpacing('base', layoutMode)}px`,
          zIndex: 2
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: isThinking ? '100%' : '30%',
            background: FUTURISTIC_THEME.gradients.button,
            borderRadius: '2px',
            animation: isThinking ? 'responsivePulse 1.5s infinite' : 'none',
            transition: 'width 0.3s ease'
          }}></div>
        </div>
      </ResponsiveContainer>
    );
  };

  // Conditional rendering based on layout mode with transitions
  return (
    <ResponsiveStyleProvider includeAnimations={true}>
      <GlobalAnimationStyles />
      <KeyboardHandler
        onQuizAnswer={handleKeyboardQuizAnswer}
        onNavigate={handleKeyboardNavigation}
        onGameControl={handleKeyboardGameControl}
        isQuizActive={gameState.isQuizVisible}
        isGameOver={gameState.isGameOver}
        enabled={true}
        data-testid="game-keyboard-handler"
      />
      <LayoutTransition
        currentLayoutMode={layoutMode}
        previousLayoutMode={previousLayoutMode}
        onTransitionComplete={handleTransitionComplete}
        data-testid="game-layout-transition"
      >
        <div 
          data-testid="game-container"
          className={isLayoutMode('mobile') || isLayoutMode('tablet') ? 'mobile-layout' : 'desktop-layout'}
        >
          {isLayoutMode('mobile') || isLayoutMode('tablet') ? (
            <MobileLayout />
          ) : (
            <div style={{
              background: FUTURISTIC_THEME.gradients.background,
              minHeight: '100vh',
              position: 'relative'
            }}>
              <ResponsiveLayoutWrapper
                leftPanelContent={<ResponsiveChessboard />}
                rightPanelContent={<DesktopSidebarContent />}
              />
            </div>
          )}
        </div>
      </LayoutTransition>
    </ResponsiveStyleProvider>
  );
}

// Main Game component with responsive layout provider
function Game() {
  return (
    <LayoutManager>
      <GameInternal />
    </LayoutManager>
  );
}

export default Game;