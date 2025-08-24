import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { Square } from 'chess.js';
import { useAppDispatch, useAppSelector } from '../store';
import { 
  addUserMove, 
  puzzleSolved, 
  puzzleFailed, 
  showHint, 
  hideHint,
  resetPuzzle,
  startPuzzleAttempt 
} from '../store/slices/quizSlice';
import { ChessGameEngine } from '../utils/chessUtils';

interface ChessPuzzleProps {
  size?: number;
  showCoordinates?: boolean;
  autoStart?: boolean;
  onSolve?: (scoreEarned: number) => void;
  onFail?: () => void;
}

export const ChessPuzzle: React.FC<ChessPuzzleProps> = ({
  size = 400,
  showCoordinates = true,
  autoStart = true,
  onSolve,
  onFail,
}) => {
  const dispatch = useAppDispatch();
  const quizState = useAppSelector(state => state.quiz);
  
  const {
    currentPuzzle,
    userMoves,
    puzzleStatus,
    isAttempting,
    isShowingHint,
    hintUsed,
    currentAttempt,
  } = quizState;

  const [gameEngine, setGameEngine] = useState<ChessGameEngine | null>(null);
  const [solutionMoves, setSolutionMoves] = useState<string[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [highlightedSquares, setHighlightedSquares] = useState<string[]>([]);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);

  // Initialize puzzle when currentPuzzle changes
  useEffect(() => {
    if (currentPuzzle) {
      const engine = new ChessGameEngine(currentPuzzle.fen);
      setGameEngine(engine);
      
      try {
        const moves = JSON.parse(currentPuzzle.solution_moves);
        setSolutionMoves(moves);
        setCurrentMoveIndex(0);
        setLastMove(null);
        setSelectedSquare(null);
        setHighlightedSquares([]);
        
        if (autoStart) {
          dispatch(startPuzzleAttempt());
        }
      } catch (error) {
        console.error('Invalid solution moves format:', error);
      }
    }
  }, [currentPuzzle, autoStart, dispatch]);

  // Get current position FEN
  const currentFen = useMemo(() => {
    return gameEngine?.getFen() || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  }, [gameEngine]);

  // Determine whose turn it is to move (player or solution)
  const isPlayerTurn = useMemo(() => {
    return currentMoveIndex % 2 === 0; // Even indices are player moves, odd are solution moves
  }, [currentMoveIndex]);

  // Get the next expected move from the solution
  const nextSolutionMove = useMemo(() => {
    if (!isPlayerTurn && currentMoveIndex < solutionMoves.length) {
      return solutionMoves[currentMoveIndex];
    }
    return null;
  }, [isPlayerTurn, currentMoveIndex, solutionMoves]);

  // Calculate custom square styles
  const customSquareStyles = useMemo(() => {
    const styles: { [square: string]: React.CSSProperties } = {};

    // Highlight selected square
    if (selectedSquare) {
      styles[selectedSquare] = {
        backgroundColor: 'rgba(255, 255, 0, 0.4)',
        cursor: 'pointer',
      };
    }

    // Highlight legal move squares
    highlightedSquares.forEach(square => {
      styles[square] = {
        backgroundColor: 'rgba(0, 255, 0, 0.3)',
        cursor: 'pointer',
      };
    });

    // Highlight last move
    if (lastMove) {
      styles[lastMove.from] = {
        backgroundColor: 'rgba(255, 255, 0, 0.5)',
      };
      styles[lastMove.to] = {
        backgroundColor: 'rgba(255, 255, 0, 0.5)',
      };
    }

    // Highlight hint move
    if (isShowingHint && isPlayerTurn && currentMoveIndex < solutionMoves.length) {
      const hintMove = solutionMoves[currentMoveIndex];
      if (hintMove.length >= 4) {
        const from = hintMove.slice(0, 2);
        const to = hintMove.slice(2, 4);
        styles[from] = {
          backgroundColor: 'rgba(0, 100, 255, 0.6)',
        };
        styles[to] = {
          backgroundColor: 'rgba(0, 100, 255, 0.4)',
        };
      }
    }

    return styles;
  }, [selectedSquare, highlightedSquares, lastMove, isShowingHint, isPlayerTurn, currentMoveIndex, solutionMoves]);

  // Make the computer's move (solution move)
  const makeComputerMove = useCallback(() => {
    if (!gameEngine || !nextSolutionMove || isPlayerTurn) return;

    const from = nextSolutionMove.slice(0, 2) as Square;
    const to = nextSolutionMove.slice(2, 4) as Square;
    const promotion = nextSolutionMove.length > 4 ? nextSolutionMove[4] as any : undefined;

    const move = gameEngine.makeMove({ from, to, promotion });
    if (move) {
      setLastMove({ from, to });
      setCurrentMoveIndex(prev => prev + 1);
      
      // Check if puzzle is complete
      if (currentMoveIndex + 1 >= solutionMoves.length) {
        const baseScore = currentPuzzle?.difficulty ? currentPuzzle.difficulty * 10 : 10;
        const hintPenalty = hintUsed ? 5 : 0;
        const attemptPenalty = currentAttempt ? (currentAttempt.attempts - 1) * 2 : 0;
        const scoreEarned = Math.max(1, baseScore - hintPenalty - attemptPenalty);
        
        dispatch(puzzleSolved({ scoreEarned }));
        onSolve?.(scoreEarned);
      }
    }
  }, [gameEngine, nextSolutionMove, isPlayerTurn, currentMoveIndex, solutionMoves.length, currentPuzzle, hintUsed, currentAttempt, dispatch, onSolve]);

  // Auto-make computer moves
  useEffect(() => {
    if (!isPlayerTurn && nextSolutionMove && puzzleStatus === 'in-progress') {
      const timer = setTimeout(() => {
        makeComputerMove();
      }, 500); // Half second delay for computer moves
      
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, nextSolutionMove, puzzleStatus, makeComputerMove]);

  // Handle piece drag start
  const onPieceDragBegin = useCallback((piece: string, sourceSquare: Square) => {
    if (!isPlayerTurn || puzzleStatus !== 'in-progress' || !gameEngine) return false;
    
    setSelectedSquare(sourceSquare);
    
    // Get legal moves for this square
    const legalMoves = gameEngine.getLegalMovesForSquare(sourceSquare);
    setHighlightedSquares(legalMoves);
    
    return true;
  }, [isPlayerTurn, puzzleStatus, gameEngine]);

  // Handle piece drop
  const onPieceDrop = useCallback((sourceSquare: Square, targetSquare: Square) => {
    if (!isPlayerTurn || puzzleStatus !== 'in-progress' || !gameEngine) return false;

    const moveString = `${sourceSquare}${targetSquare}`;
    const expectedMove = solutionMoves[currentMoveIndex];
    
    // Check if this move matches the expected solution move
    if (expectedMove && moveString === expectedMove.slice(0, 4)) {
      // Correct move!
      const from = sourceSquare;
      const to = targetSquare;
      const promotion = expectedMove.length > 4 ? expectedMove[4] as any : undefined;
      
      const move = gameEngine.makeMove({ from, to, promotion });
      if (move) {
        dispatch(addUserMove(moveString));
        setLastMove({ from, to });
        setSelectedSquare(null);
        setHighlightedSquares([]);
        setCurrentMoveIndex(prev => prev + 1);
        
        // Hide hint after correct move
        if (isShowingHint) {
          dispatch(hideHint());
        }
        
        return true;
      }
    } else {
      // Wrong move
      dispatch(puzzleFailed());
      dispatch(addUserMove(moveString));
      onFail?.();
      setSelectedSquare(null);
      setHighlightedSquares([]);
      return false;
    }

    return false;
  }, [
    isPlayerTurn,
    puzzleStatus,
    gameEngine,
    solutionMoves,
    currentMoveIndex,
    isShowingHint,
    dispatch,
    onFail
  ]);

  // Handle square click
  const onSquareClick = useCallback((square: Square) => {
    if (!isPlayerTurn || puzzleStatus !== 'in-progress' || !gameEngine) return;

    if (selectedSquare) {
      if (selectedSquare === square) {
        setSelectedSquare(null);
        setHighlightedSquares([]);
      } else {
        // Try to make a move
        const success = onPieceDrop(selectedSquare as Square, square);
        if (!success) {
          // Select new square if it has a piece
          const piece = gameEngine.getPieceAt(square);
          if (piece) {
            setSelectedSquare(square);
            const legalMoves = gameEngine.getLegalMovesForSquare(square);
            setHighlightedSquares(legalMoves);
          } else {
            setSelectedSquare(null);
            setHighlightedSquares([]);
          }
        }
      }
    } else {
      const piece = gameEngine.getPieceAt(square);
      if (piece) {
        setSelectedSquare(square);
        const legalMoves = gameEngine.getLegalMovesForSquare(square);
        setHighlightedSquares(legalMoves);
      }
    }
  }, [isPlayerTurn, puzzleStatus, gameEngine, selectedSquare, onPieceDrop]);

  // Show hint handler
  const handleShowHint = useCallback(() => {
    if (isPlayerTurn && currentMoveIndex < solutionMoves.length) {
      dispatch(showHint());
    }
  }, [isPlayerTurn, currentMoveIndex, solutionMoves.length, dispatch]);

  // Reset puzzle handler
  const handleReset = useCallback(() => {
    if (currentPuzzle) {
      const engine = new ChessGameEngine(currentPuzzle.fen);
      setGameEngine(engine);
      setCurrentMoveIndex(0);
      setLastMove(null);
      setSelectedSquare(null);
      setHighlightedSquares([]);
      dispatch(resetPuzzle());
    }
  }, [currentPuzzle, dispatch]);

  if (!currentPuzzle) {
    return (
      <div style={{ 
        width: size, 
        height: size, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f0f0f0',
        border: '2px dashed #ccc',
        borderRadius: '8px',
      }}>
        <p style={{ color: '#666', fontSize: '16px' }}>No puzzle loaded</p>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <Chessboard
        id="puzzle-board"
        position={currentFen}
        boardWidth={size}
        showBoardNotation={showCoordinates}
        onPieceDragBegin={onPieceDragBegin}
        onPieceDrop={onPieceDrop}
        onSquareClick={onSquareClick}
        customSquareStyles={customSquareStyles}
        arePremovesAllowed={false}
        areArrowsAllowed={false}
        customDarkSquareStyle={{ backgroundColor: '#779952' }}
        customLightSquareStyle={{ backgroundColor: '#edeed1' }}
      />
      
      {/* Puzzle controls */}
      <div style={{ 
        marginTop: '10px', 
        display: 'flex', 
        gap: '10px',
        justifyContent: 'center',
      }}>
        <button
          onClick={handleShowHint}
          disabled={!isPlayerTurn || puzzleStatus !== 'in-progress' || isShowingHint}
          style={{
            padding: '8px 16px',
            backgroundColor: isShowingHint ? '#28a745' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          {isShowingHint ? 'Hint Shown' : 'Show Hint'}
        </button>
        
        <button
          onClick={handleReset}
          style={{
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Reset
        </button>
      </div>
      
      {/* Status display */}
      <div style={{ 
        marginTop: '10px', 
        textAlign: 'center',
        fontSize: '16px',
        fontWeight: 'bold',
      }}>
        {puzzleStatus === 'idle' && 'Ready to start'}
        {puzzleStatus === 'in-progress' && (isPlayerTurn ? 'Your move' : 'Computer move...')}
        {puzzleStatus === 'solved' && '🎉 Puzzle solved!'}
        {puzzleStatus === 'failed' && '❌ Wrong move. Try again!'}
      </div>
      
      {/* Puzzle info */}
      {currentPuzzle && (
        <div style={{ 
          marginTop: '10px', 
          textAlign: 'center',
          fontSize: '14px',
          color: '#666',
        }}>
          <div>Difficulty: {currentPuzzle.difficulty}/5</div>
          <div>Theme: {currentPuzzle.theme}</div>
          {currentPuzzle.title && <div>Title: {currentPuzzle.title}</div>}
        </div>
      )}
    </div>
  );
};

export default ChessPuzzle;