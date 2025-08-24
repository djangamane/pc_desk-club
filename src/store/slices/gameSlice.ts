import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Chess, Move } from 'chess.js';
import { ChessGameEngine, ChessMove, STARTING_FEN } from '../../utils/chessUtils';

// Types
export interface GameMove {
  from: string;
  to: string;
  promotion?: string;
  san?: string;
  before?: string;
  after?: string;
}

export interface AIConfig {
  difficulty: 'easy' | 'medium' | 'hard';
  thinkingTime: number; // in milliseconds
  randomness: number; // 0-1, higher = more random moves
}

export interface GameState {
  // Chess game state
  gameEngine: ChessGameEngine | null;
  currentFen: string;
  moveHistory: GameMove[];
  isPlayerTurn: boolean;
  isGameOver: boolean;
  gameResult: 'white' | 'black' | 'draw' | null;
  
  // AI state
  isAiThinking: boolean;
  aiConfig: AIConfig;
  
  // Game metadata
  gameStartTime: number | null;
  gameEndTime: number | null;
  totalMoves: number;
  gameMode: 'human-vs-ai' | 'human-vs-human' | 'analysis';
  playerColor: 'white' | 'black';
  
  // Performance tracking
  playerScore: number;
  moveQuality: ('excellent' | 'good' | 'inaccuracy' | 'mistake' | 'blunder')[];
  
  // UI state
  selectedSquare: string | null;
  highlightedSquares: string[];
  lastMove: { from: string; to: string } | null;
}

// Initial state
const initialState: GameState = {
  gameEngine: null,
  currentFen: STARTING_FEN,
  moveHistory: [],
  isPlayerTurn: true,
  isGameOver: false,
  gameResult: null,
  isAiThinking: false,
  aiConfig: {
    difficulty: 'medium',
    thinkingTime: 1000,
    randomness: 0.1,
  },
  gameStartTime: null,
  gameEndTime: null,
  totalMoves: 0,
  gameMode: 'human-vs-ai',
  playerColor: 'white',
  playerScore: 0,
  moveQuality: [],
  selectedSquare: null,
  highlightedSquares: [],
  lastMove: null,
};

// Game slice
const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    initializeGame: (state, action: PayloadAction<{ fen?: string; playerColor?: 'white' | 'black'; gameMode?: 'human-vs-ai' | 'human-vs-human' | 'analysis' }>) => {
      const { fen, playerColor = 'white', gameMode = 'human-vs-ai' } = action.payload;
      const gameEngine = new ChessGameEngine(fen);
      
      state.gameEngine = gameEngine as any; // Chess.js serialization handling
      state.currentFen = gameEngine.getFen();
      state.moveHistory = [];
      state.playerColor = playerColor;
      state.gameMode = gameMode;
      state.isPlayerTurn = gameEngine.getTurn() === (playerColor === 'white' ? 'w' : 'b');
      state.isGameOver = false;
      state.gameResult = null;
      state.isAiThinking = false;
      state.gameStartTime = Date.now();
      state.gameEndTime = null;
      state.totalMoves = 0;
      state.playerScore = 0;
      state.moveQuality = [];
      state.selectedSquare = null;
      state.highlightedSquares = [];
      state.lastMove = null;
    },

    makeMove: (state, action: PayloadAction<{ from: string; to: string; promotion?: string }>) => {
      if (!state.gameEngine) return;
      
      const gameEngine = new ChessGameEngine(state.currentFen);
      const beforeFen = gameEngine.getFen();
      
      const chessMove: ChessMove = {
        from: action.payload.from as any,
        to: action.payload.to as any,
        promotion: action.payload.promotion as any,
      };
      
      const move = gameEngine.makeMove(chessMove);
      
      if (move) {
        const gameMove: GameMove = {
          from: action.payload.from,
          to: action.payload.to,
          promotion: action.payload.promotion,
          san: move.san,
          before: beforeFen,
          after: gameEngine.getFen(),
        };

        state.currentFen = gameEngine.getFen();
        state.moveHistory.push(gameMove);
        state.isPlayerTurn = gameEngine.getTurn() === (state.playerColor === 'white' ? 'w' : 'b');
        state.totalMoves = Math.ceil(state.moveHistory.length / 2);
        state.selectedSquare = null;
        state.highlightedSquares = [];
        state.lastMove = { from: action.payload.from, to: action.payload.to };
        
        // Check for game over
        if (gameEngine.isGameOver()) {
          state.isGameOver = true;
          state.gameEndTime = Date.now();
          state.gameResult = gameEngine.getGameResult();
        }
        
        // Update serialized game engine
        state.gameEngine = gameEngine as any;
      }
    },

    setAiThinking: (state, action: PayloadAction<boolean>) => {
      state.isAiThinking = action.payload;
    },

    setAiDifficulty: (state, action: PayloadAction<'easy' | 'medium' | 'hard'>) => {
      state.aiConfig.difficulty = action.payload;
      
      // Adjust AI parameters based on difficulty
      switch (action.payload) {
        case 'easy':
          state.aiConfig.thinkingTime = 500;
          state.aiConfig.randomness = 0.3;
          break;
        case 'medium':
          state.aiConfig.thinkingTime = 1000;
          state.aiConfig.randomness = 0.1;
          break;
        case 'hard':
          state.aiConfig.thinkingTime = 2000;
          state.aiConfig.randomness = 0.05;
          break;
      }
    },

    addMoveQuality: (state, action: PayloadAction<'excellent' | 'good' | 'inaccuracy' | 'mistake' | 'blunder'>) => {
      state.moveQuality.push(action.payload);
      
      // Calculate score based on move quality
      const qualityScores = {
        excellent: 10,
        good: 7,
        inaccuracy: 4,
        mistake: 1,
        blunder: -5,
      };
      
      state.playerScore += qualityScores[action.payload];
    },

    updateScore: (state, action: PayloadAction<number>) => {
      state.playerScore += action.payload;
    },

    setSelectedSquare: (state, action: PayloadAction<string | null>) => {
      state.selectedSquare = action.payload;
      
      // Update highlighted squares based on legal moves
      if (action.payload && state.gameEngine) {
        const gameEngine = new ChessGameEngine(state.currentFen);
        const legalMoves = gameEngine.getLegalMovesForSquare(action.payload as any);
        state.highlightedSquares = legalMoves;
      } else {
        state.highlightedSquares = [];
      }
    },

    setGameMode: (state, action: PayloadAction<'human-vs-ai' | 'human-vs-human' | 'analysis'>) => {
      state.gameMode = action.payload;
    },

    setPlayerColor: (state, action: PayloadAction<'white' | 'black'>) => {
      state.playerColor = action.payload;
      if (state.gameEngine) {
        const gameEngine = new ChessGameEngine(state.currentFen);
        state.isPlayerTurn = gameEngine.getTurn() === (action.payload === 'white' ? 'w' : 'b');
      }
    },

    resetGame: (state) => {
      return { ...initialState };
    },

    loadGameFromPgn: (state, action: PayloadAction<string>) => {
      try {
        const gameEngine = new ChessGameEngine();
        
        if (gameEngine.loadPgn(action.payload)) {
          state.gameEngine = gameEngine as any;
          state.currentFen = gameEngine.getFen();
          state.moveHistory = gameEngine.getMoveHistory().map(move => ({
            from: move.from,
            to: move.to,
            promotion: move.promotion,
            san: move.san,
            before: '', // Would need to calculate this
            after: '', // Would need to calculate this
          }));
          state.isPlayerTurn = gameEngine.getTurn() === (state.playerColor === 'white' ? 'w' : 'b');
          state.totalMoves = Math.ceil(state.moveHistory.length / 2);
          
          if (gameEngine.isGameOver()) {
            state.isGameOver = true;
            state.gameEndTime = Date.now();
            state.gameResult = gameEngine.getGameResult();
          }
        }
      } catch (error) {
        console.error('Failed to load PGN:', error);
      }
    },

    undoLastMove: (state) => {
      if (!state.gameEngine || state.moveHistory.length === 0) return;
      
      const gameEngine = new ChessGameEngine(state.currentFen);
      const undoMove = gameEngine.undoMove();
      
      if (undoMove) {
        state.moveHistory.pop();
        state.currentFen = gameEngine.getFen();
        state.isPlayerTurn = gameEngine.getTurn() === (state.playerColor === 'white' ? 'w' : 'b');
        state.totalMoves = Math.ceil(state.moveHistory.length / 2);
        state.selectedSquare = null;
        state.highlightedSquares = [];
        state.lastMove = null;
        state.isGameOver = false;
        state.gameResult = null;
        state.gameEngine = gameEngine as any;
      }
    },
  },
});

export const {
  initializeGame,
  makeMove,
  setAiThinking,
  setAiDifficulty,
  addMoveQuality,
  updateScore,
  setSelectedSquare,
  setGameMode,
  setPlayerColor,
  resetGame,
  loadGameFromPgn,
  undoLastMove,
} = gameSlice.actions;

export default gameSlice.reducer;