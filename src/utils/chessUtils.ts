import { Chess, Move, Square } from 'chess.js';

export interface ChessMove {
  from: Square;
  to: Square;
  promotion?: 'q' | 'r' | 'b' | 'n';
}

export interface GamePosition {
  fen: string;
  turn: 'w' | 'b';
  castling: string;
  enPassant: string | null;
  halfmove: number;
  fullmove: number;
}

export class ChessGameEngine {
  private game: Chess;

  constructor(fen?: string) {
    this.game = new Chess();
    if (fen) {
      this.game.load(fen);
    }
  }

  // Basic game operations
  makeMove(move: ChessMove): Move | null {
    try {
      return this.game.move(move);
    } catch (error) {
      console.error('Invalid move:', error);
      return null;
    }
  }

  undoMove(): Move | null {
    return this.game.undo();
  }

  isValidMove(move: ChessMove): boolean {
    try {
      const tempGame = new Chess(this.game.fen());
      tempGame.move(move);
      return true;
    } catch {
      return false;
    }
  }

  // Position information
  getPosition(): GamePosition {
    return {
      fen: this.game.fen(),
      turn: this.game.turn(),
      castling: this.game.header()['SetUp'] || 'KQkq',
      enPassant: this.game.history({ verbose: true }).slice(-1)[0]?.flags?.includes('e') ? 
        this.game.history({ verbose: true }).slice(-1)[0]?.to : null,
      halfmove: parseInt(this.game.fen().split(' ')[4]),
      fullmove: parseInt(this.game.fen().split(' ')[5])
    };
  }

  getFen(): string {
    return this.game.fen();
  }

  getTurn(): 'w' | 'b' {
    return this.game.turn();
  }

  isCheck(): boolean {
    return this.game.inCheck();
  }

  isCheckmate(): boolean {
    return this.game.isCheckmate();
  }

  isStalemate(): boolean {
    return this.game.isStalemate();
  }

  isDraw(): boolean {
    return this.game.isDraw();
  }

  isGameOver(): boolean {
    return this.game.isGameOver();
  }

  getGameResult(): 'white' | 'black' | 'draw' | null {
    if (!this.isGameOver()) return null;
    
    if (this.isCheckmate()) {
      return this.getTurn() === 'w' ? 'black' : 'white'; // If white to move and checkmate, black wins
    }
    
    if (this.isStalemate() || this.isDraw()) {
      return 'draw';
    }
    
    return null;
  }

  // Move generation
  getLegalMoves(square?: Square): Move[] {
    const moves = this.game.moves({ verbose: true, square });
    return moves;
  }

  getLegalMovesForSquare(square: Square): Square[] {
    const moves = this.getLegalMoves(square);
    return moves.map(move => move.to);
  }

  // Move history
  getMoveHistory(): Move[] {
    return this.game.history({ verbose: true });
  }

  getPgnHistory(): string {
    return this.game.pgn();
  }

  // Board analysis
  isSquareAttacked(square: Square, by: 'w' | 'b'): boolean {
    // Create a temporary game to test if the square is attacked
    const tempGame = new Chess(this.game.fen());
    const moves = tempGame.moves({ verbose: true });
    
    return moves.some(move => 
      move.to === square && 
      (by === 'w' ? move.color === 'w' : move.color === 'b')
    );
  }

  getAttackingPieces(square: Square): Square[] {
    const moves = this.game.moves({ verbose: true });
    return moves
      .filter(move => move.to === square)
      .map(move => move.from);
  }

  // Piece information
  getPieceAt(square: Square): { type: string; color: 'w' | 'b' } | null {
    const piece = this.game.get(square);
    return piece ? { type: piece.type, color: piece.color } : null;
  }

  // Load/save positions
  loadPosition(fen: string): boolean {
    try {
      this.game.load(fen);
      return true;
    } catch (error) {
      console.error('Invalid FEN:', error);
      return false;
    }
  }

  loadPgn(pgn: string): boolean {
    try {
      this.game.loadPgn(pgn);
      return true;
    } catch (error) {
      console.error('Invalid PGN:', error);
      return false;
    }
  }

  reset(): void {
    this.game.reset();
  }

  // Chess.js instance access (for advanced usage)
  getChessInstance(): Chess {
    return this.game;
  }

  // Clone the current game state
  clone(): ChessGameEngine {
    return new ChessGameEngine(this.getFen());
  }
}

// Utility functions for move notation
export const moveToAlgebraic = (move: ChessMove): string => {
  return `${move.from}${move.to}${move.promotion || ''}`;
};

export const algebraicToMove = (algebraic: string): ChessMove | null => {
  if (algebraic.length < 4) return null;
  
  const from = algebraic.slice(0, 2) as Square;
  const to = algebraic.slice(2, 4) as Square;
  const promotion = algebraic.length > 4 ? algebraic[4] as 'q' | 'r' | 'b' | 'n' : undefined;
  
  return { from, to, promotion };
};

// FEN validation
export const isValidFen = (fen: string): boolean => {
  try {
    const chess = new Chess();
    chess.load(fen);
    return true;
  } catch {
    return false;
  }
};

// Starting position constant
export const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

// Common test positions for development
export const TEST_POSITIONS = {
  startingPosition: STARTING_FEN,
  checkmate: 'rnb1kbnr/pppp1ppp/4p3/8/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3',
  stalemate: '8/8/8/8/8/8/8/k6K w - - 0 1',
  promotion: 'rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 2',
  castling: 'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1',
} as const;