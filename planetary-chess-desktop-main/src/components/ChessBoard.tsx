import React, { useCallback, useMemo } from 'react';
import { Chessboard } from 'react-chessboard';
import { Square } from 'chess.js';
import { useAppDispatch, useAppSelector } from '../store';
import { makeMove, setSelectedSquare, setAiThinking } from '../store/slices/gameSlice';
import { ChessGameEngine } from '../utils/chessUtils';

interface ChessBoardProps {
  size?: number;
  showCoordinates?: boolean;
  orientation?: 'white' | 'black';
  disabled?: boolean;
  onMoveComplete?: (move: { from: string; to: string; promotion?: string }) => void;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  size = 400,
  showCoordinates = true,
  orientation,
  disabled = false,
  onMoveComplete,
}) => {
  const dispatch = useAppDispatch();
  const gameState = useAppSelector(state => state.game);
  
  const {
    currentFen,
    selectedSquare,
    highlightedSquares,
    lastMove,
    isPlayerTurn,
    playerColor,
    gameMode,
    isAiThinking,
    isGameOver,
  } = gameState;

  // Determine board orientation
  const boardOrientation = orientation || playerColor;

  // Calculate custom squares styling for highlights and last move
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

    return styles;
  }, [selectedSquare, highlightedSquares, lastMove]);

  // Handle piece drag start
  const onPieceDragBegin = useCallback((piece: string, sourceSquare: Square) => {
    // Only allow player to move their pieces during their turn
    if (disabled || isGameOver || !isPlayerTurn) return false;
    
    // Check if it's the player's piece
    const isPlayerPiece = playerColor === 'white' ? 
      piece[0] === 'w' : piece[0] === 'b';
    
    if (!isPlayerPiece) return false;

    dispatch(setSelectedSquare(sourceSquare));
    return true;
  }, [dispatch, disabled, isGameOver, isPlayerTurn, playerColor]);

  // Handle piece drop
  const onPieceDrop = useCallback((sourceSquare: Square, targetSquare: Square, piece: string) => {
    if (disabled || isGameOver || !isPlayerTurn) return false;

    // Create the chess engine to validate the move
    const gameEngine = new ChessGameEngine(currentFen);
    
    // Check if the move is legal
    const moveAttempt = {
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q' as const, // Default promotion to queen
    };

    if (!gameEngine.isValidMove(moveAttempt)) {
      dispatch(setSelectedSquare(null));
      return false;
    }

    // Check if this is a promotion move
    const isPromotion = (
      piece[1] === 'P' && // Is a pawn
      ((playerColor === 'white' && targetSquare[1] === '8') || 
       (playerColor === 'black' && targetSquare[1] === '1'))
    );

    if (isPromotion) {
      // For now, always promote to queen. In a full implementation,
      // you would show a promotion dialog here
      const promotionPiece = 'q';
      
      const move = {
        from: sourceSquare,
        to: targetSquare,
        promotion: promotionPiece,
      };

      dispatch(makeMove(move));
      onMoveComplete?.(move);
    } else {
      const move = {
        from: sourceSquare,
        to: targetSquare,
      };

      dispatch(makeMove(move));
      onMoveComplete?.(move);
    }

    // Trigger AI move if playing against AI
    if (gameMode === 'human-vs-ai' && !isGameOver) {
      // Add a small delay to make AI moves feel more natural
      setTimeout(() => {
        dispatch(setAiThinking(true));
        // AI move logic would go here
        // For now, just clear the thinking state
        setTimeout(() => {
          dispatch(setAiThinking(false));
        }, 1000);
      }, 250);
    }

    return true;
  }, [
    dispatch,
    disabled,
    isGameOver,
    isPlayerTurn,
    currentFen,
    playerColor,
    gameMode,
    onMoveComplete
  ]);

  // Handle square click (for move selection without drag)
  const onSquareClick = useCallback((square: Square) => {
    if (disabled || isGameOver || !isPlayerTurn) return;

    if (selectedSquare) {
      // If a square is already selected, try to make a move
      if (selectedSquare === square) {
        // Clicking the same square deselects it
        dispatch(setSelectedSquare(null));
      } else {
        // Try to make a move to the clicked square
        const gameEngine = new ChessGameEngine(currentFen);
        const moveAttempt = {
          from: selectedSquare as Square,
          to: square,
          promotion: 'q' as const,
        };

        if (gameEngine.isValidMove(moveAttempt)) {
          const move = {
            from: selectedSquare,
            to: square,
          };
          dispatch(makeMove(move));
          onMoveComplete?.(move);
        } else {
          // Invalid move, select the new square if it has a piece
          const piece = gameEngine.getPieceAt(square);
          if (piece && ((playerColor === 'white' && piece.color === 'w') || 
                       (playerColor === 'black' && piece.color === 'b'))) {
            dispatch(setSelectedSquare(square));
          } else {
            dispatch(setSelectedSquare(null));
          }
        }
      }
    } else {
      // No square selected, select this square if it has a player piece
      const gameEngine = new ChessGameEngine(currentFen);
      const piece = gameEngine.getPieceAt(square);
      
      if (piece && ((playerColor === 'white' && piece.color === 'w') || 
                   (playerColor === 'black' && piece.color === 'b'))) {
        dispatch(setSelectedSquare(square));
      }
    }
  }, [
    dispatch,
    selectedSquare,
    disabled,
    isGameOver,
    isPlayerTurn,
    currentFen,
    playerColor,
    onMoveComplete
  ]);

  return (
    <div 
      style={{ 
        position: 'relative',
        opacity: isAiThinking ? 0.7 : 1,
        transition: 'opacity 0.3s ease',
      }}
    >
      <Chessboard
        id="chess-board"
        position={currentFen}
        boardOrientation={boardOrientation}
        boardWidth={size}
        showBoardNotation={showCoordinates}
        onPieceDragBegin={onPieceDragBegin}
        onPieceDrop={onPieceDrop}
        onSquareClick={onSquareClick}
        customSquareStyles={customSquareStyles}
        arePremovesAllowed={false}
        areArrowsAllowed={true}
        customDarkSquareStyle={{ backgroundColor: '#779952' }}
        customLightSquareStyle={{ backgroundColor: '#edeed1' }}
        customPieces={undefined} // Can be customized for different piece sets
      />
      
      {isAiThinking && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            zIndex: 10,
          }}
        >
          AI is thinking...
        </div>
      )}
    </div>
  );
};

export default ChessBoard;