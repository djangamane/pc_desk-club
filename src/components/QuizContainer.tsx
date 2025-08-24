import React, { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { 
  loadPuzzles,
  submitPuzzleScore,
  puzzleSolved,
  puzzleFailed,
  startQuizSession,
  nextPuzzle,
  previousPuzzle,
  selectPuzzle,
} from '../store/slices/quizSlice';
import { fetchUserStats } from '../store/slices/userSlice';
import ChessPuzzle from './ChessPuzzle';

interface QuizContainerProps {
  puzzleSize?: number;
  showControls?: boolean;
  autoAdvance?: boolean;
}

export const QuizContainer: React.FC<QuizContainerProps> = ({
  puzzleSize = 400,
  showControls = true,
  autoAdvance = false,
}) => {
  const dispatch = useAppDispatch();
  const quizState = useAppSelector(state => state.quiz);
  const userState = useAppSelector(state => state.user);
  
  const {
    currentPuzzle,
    puzzleIndex,
    availablePuzzles,
    puzzleStatus,
    sessionStats,
    selectedDifficulty,
    selectedTheme,
    isLoadingPuzzles,
    isSubmittingScore,
    error,
  } = quizState;
  
  const { currentUser, isAuthenticated } = userState;

  // Load puzzles on component mount or when filters change
  useEffect(() => {
    const filters: { difficulty?: number; theme?: string } = {};
    if (selectedDifficulty) filters.difficulty = selectedDifficulty;
    if (selectedTheme) filters.theme = selectedTheme;
    
    dispatch(loadPuzzles(filters));
  }, [dispatch, selectedDifficulty, selectedTheme]);

  // Start quiz session on mount
  useEffect(() => {
    dispatch(startQuizSession());
  }, [dispatch]);

  // Handle puzzle solved
  const handlePuzzleSolved = useCallback(async (scoreEarned: number) => {
    if (!currentPuzzle || !currentUser || !isAuthenticated) {
      console.warn('Cannot save score: missing puzzle, user, or authentication');
      return;
    }

    try {
      // Submit score to database
      const scoreData = {
        userId: currentUser.id,
        puzzleId: currentPuzzle.id,
        solved: true,
        attempts: 1, // This should come from the puzzle attempt state
        scoreEarned,
      };

      const result = await dispatch(submitPuzzleScore(scoreData));
      
      if (submitPuzzleScore.fulfilled.match(result)) {
        console.log('Score saved successfully');
        
        // Refresh user stats after scoring
        dispatch(fetchUserStats(currentUser.id));
        
        // Auto-advance to next puzzle if enabled
        if (autoAdvance && puzzleIndex < availablePuzzles.length - 1) {
          setTimeout(() => {
            dispatch(nextPuzzle());
          }, 2000); // 2 second delay before advancing
        }
      } else {
        console.error('Failed to save score:', result.payload);
      }
    } catch (error) {
      console.error('Error saving puzzle score:', error);
    }
  }, [
    currentPuzzle,
    currentUser,
    isAuthenticated,
    dispatch,
    autoAdvance,
    puzzleIndex,
    availablePuzzles.length
  ]);

  // Handle puzzle failed
  const handlePuzzleFailed = useCallback(() => {
    console.log('Puzzle attempt failed');
    // Could implement attempt tracking here if needed
  }, []);

  // Navigation handlers
  const handleNextPuzzle = useCallback(() => {
    if (puzzleIndex < availablePuzzles.length - 1) {
      dispatch(nextPuzzle());
    }
  }, [dispatch, puzzleIndex, availablePuzzles.length]);

  const handlePreviousPuzzle = useCallback(() => {
    if (puzzleIndex > 0) {
      dispatch(previousPuzzle());
    }
  }, [dispatch, puzzleIndex]);

  const handleSelectPuzzle = useCallback((index: number) => {
    if (index >= 0 && index < availablePuzzles.length) {
      const puzzle = availablePuzzles[index];
      dispatch(selectPuzzle({ puzzle, index }));
    }
  }, [dispatch, availablePuzzles]);

  // Loading state
  if (isLoadingPuzzles) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: puzzleSize,
        fontSize: '18px',
        color: '#666',
      }}>
        Loading puzzles...
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: puzzleSize,
        fontSize: '16px',
        color: '#dc3545',
        textAlign: 'center',
      }}>
        <div>Error loading puzzles:</div>
        <div style={{ marginTop: '8px', fontSize: '14px' }}>{error}</div>
        <button
          onClick={() => dispatch(loadPuzzles())}
          style={{
            marginTop: '16px',
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  // No puzzles available
  if (availablePuzzles.length === 0) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: puzzleSize,
        fontSize: '16px',
        color: '#666',
        textAlign: 'center',
      }}>
        No puzzles available with current filters
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Session stats */}
      {sessionStats.sessionStartTime && (
        <div style={{
          marginBottom: '16px',
          padding: '12px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#495057',
          minWidth: '300px',
          textAlign: 'center',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
            <span>Solved: {sessionStats.puzzlesSolved}</span>
            <span>Attempts: {sessionStats.totalAttempts}</span>
            <span>Score: {sessionStats.totalScore}</span>
          </div>
        </div>
      )}

      {/* Puzzle component */}
      <ChessPuzzle
        size={puzzleSize}
        onSolve={handlePuzzleSolved}
        onFail={handlePuzzleFailed}
      />

      {/* Navigation controls */}
      {showControls && (
        <div style={{
          marginTop: '16px',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
        }}>
          <button
            onClick={handlePreviousPuzzle}
            disabled={puzzleIndex === 0}
            style={{
              padding: '8px 16px',
              backgroundColor: puzzleIndex === 0 ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: puzzleIndex === 0 ? 'not-allowed' : 'pointer',
              fontSize: '14px',
            }}
          >
            ← Previous
          </button>

          <div style={{
            padding: '8px 12px',
            backgroundColor: '#e9ecef',
            borderRadius: '4px',
            fontSize: '14px',
            minWidth: '100px',
            textAlign: 'center',
          }}>
            {puzzleIndex + 1} / {availablePuzzles.length}
          </div>

          <button
            onClick={handleNextPuzzle}
            disabled={puzzleIndex === availablePuzzles.length - 1}
            style={{
              padding: '8px 16px',
              backgroundColor: puzzleIndex === availablePuzzles.length - 1 ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: puzzleIndex === availablePuzzles.length - 1 ? 'not-allowed' : 'pointer',
              fontSize: '14px',
            }}
          >
            Next →
          </button>
        </div>
      )}

      {/* Puzzle selection dropdown */}
      {showControls && availablePuzzles.length > 1 && (
        <div style={{ marginTop: '12px' }}>
          <select
            value={puzzleIndex}
            onChange={(e) => handleSelectPuzzle(parseInt(e.target.value))}
            style={{
              padding: '6px 12px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '14px',
              minWidth: '200px',
            }}
          >
            {availablePuzzles.map((puzzle, index) => (
              <option key={puzzle.id} value={index}>
                Puzzle {index + 1} - {puzzle.theme} (Difficulty {puzzle.difficulty})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Authentication warning */}
      {!isAuthenticated && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: '#fff3cd',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#856404',
          textAlign: 'center',
          maxWidth: '400px',
        }}>
          ⚠️ Sign in to save your puzzle scores and track progress
        </div>
      )}

      {/* Submitting indicator */}
      {isSubmittingScore && (
        <div style={{
          marginTop: '8px',
          fontSize: '14px',
          color: '#007bff',
          fontStyle: 'italic',
        }}>
          Saving score...
        </div>
      )}
    </div>
  );
};

export default QuizContainer;