import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface ChessPuzzle {
  id: number;
  fen: string;
  solution_moves: string; // JSON string of move sequence
  difficulty: number; // 1-5 scale
  theme: string; // e.g., 'tactics', 'endgame', 'opening'
  title?: string;
  description?: string;
}

export interface QuizAttempt {
  puzzleId: number;
  attempts: number;
  solved: boolean;
  timeSpent: number; // in milliseconds
  movesPlayed: string[]; // moves attempted by user
  scoreEarned: number;
  completedAt?: string;
}

export interface QuizState {
  // Current puzzle state
  currentPuzzle: ChessPuzzle | null;
  puzzleIndex: number;
  availablePuzzles: ChessPuzzle[];
  
  // Current attempt state
  currentAttempt: QuizAttempt | null;
  isAttempting: boolean;
  attemptStartTime: number | null;
  
  // Puzzle solving state
  userMoves: string[];
  hintUsed: boolean;
  isShowingHint: boolean;
  puzzleStatus: 'idle' | 'in-progress' | 'solved' | 'failed';
  
  // Session progress
  sessionStats: {
    puzzlesSolved: number;
    totalAttempts: number;
    totalScore: number;
    sessionStartTime: number | null;
  };
  
  // Filters and preferences
  selectedDifficulty: number | null; // null means all difficulties
  selectedTheme: string | null; // null means all themes
  availableThemes: string[];
  
  // Loading states
  isLoadingPuzzles: boolean;
  isSubmittingScore: boolean;
  error: string | null;
}

// Initial state
const initialState: QuizState = {
  currentPuzzle: null,
  puzzleIndex: 0,
  availablePuzzles: [],
  currentAttempt: null,
  isAttempting: false,
  attemptStartTime: null,
  userMoves: [],
  hintUsed: false,
  isShowingHint: false,
  puzzleStatus: 'idle',
  sessionStats: {
    puzzlesSolved: 0,
    totalAttempts: 0,
    totalScore: 0,
    sessionStartTime: null,
  },
  selectedDifficulty: null,
  selectedTheme: null,
  availableThemes: [],
  isLoadingPuzzles: false,
  isSubmittingScore: false,
  error: null,
};

// Async thunks for database operations
export const loadPuzzles = createAsyncThunk(
  'quiz/loadPuzzles',
  async (filters?: { difficulty?: number; theme?: string }) => {
    if (filters?.difficulty && filters?.theme) {
      // Would need a combined filter method in the future
      return await window.electronAPI.database.getPuzzlesByDifficulty(filters.difficulty);
    } else if (filters?.difficulty) {
      return await window.electronAPI.database.getPuzzlesByDifficulty(filters.difficulty);
    } else if (filters?.theme) {
      return await window.electronAPI.database.getPuzzlesByTheme(filters.theme);
    } else {
      return await window.electronAPI.database.getAllPuzzles();
    }
  }
);

export const submitPuzzleScore = createAsyncThunk(
  'quiz/submitScore',
  async (scoreData: { userId: number; puzzleId: number; solved: boolean; attempts: number; scoreEarned: number }) => {
    const result = await window.electronAPI.database.updateScore(scoreData);
    if (!result.success) {
      throw new Error(result.error || 'Failed to submit score');
    }
    return result;
  }
);

// Quiz slice
const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    startQuizSession: (state) => {
      state.sessionStats.sessionStartTime = Date.now();
      state.sessionStats.puzzlesSolved = 0;
      state.sessionStats.totalAttempts = 0;
      state.sessionStats.totalScore = 0;
      state.error = null;
    },

    selectPuzzle: (state, action: PayloadAction<{ puzzle: ChessPuzzle; index: number }>) => {
      state.currentPuzzle = action.payload.puzzle;
      state.puzzleIndex = action.payload.index;
      state.puzzleStatus = 'idle';
      state.userMoves = [];
      state.hintUsed = false;
      state.isShowingHint = false;
      state.currentAttempt = null;
    },

    startPuzzleAttempt: (state) => {
      if (!state.currentPuzzle) return;
      
      state.isAttempting = true;
      state.attemptStartTime = Date.now();
      state.puzzleStatus = 'in-progress';
      state.currentAttempt = {
        puzzleId: state.currentPuzzle.id,
        attempts: 1,
        solved: false,
        timeSpent: 0,
        movesPlayed: [],
        scoreEarned: 0,
      };
    },

    addUserMove: (state, action: PayloadAction<string>) => {
      state.userMoves.push(action.payload);
      if (state.currentAttempt) {
        state.currentAttempt.movesPlayed.push(action.payload);
      }
    },

    puzzleSolved: (state, action: PayloadAction<{ scoreEarned: number }>) => {
      state.puzzleStatus = 'solved';
      state.isAttempting = false;
      
      if (state.currentAttempt && state.attemptStartTime) {
        state.currentAttempt.solved = true;
        state.currentAttempt.scoreEarned = action.payload.scoreEarned;
        state.currentAttempt.timeSpent = Date.now() - state.attemptStartTime;
        state.currentAttempt.completedAt = new Date().toISOString();
        
        // Update session stats
        state.sessionStats.puzzlesSolved += 1;
        state.sessionStats.totalScore += action.payload.scoreEarned;
      }
    },

    puzzleFailed: (state) => {
      state.puzzleStatus = 'failed';
      
      if (state.currentAttempt) {
        state.currentAttempt.attempts += 1;
        state.sessionStats.totalAttempts += 1;
      }
    },

    showHint: (state) => {
      state.isShowingHint = true;
      state.hintUsed = true;
    },

    hideHint: (state) => {
      state.isShowingHint = false;
    },

    resetPuzzle: (state) => {
      state.userMoves = [];
      state.puzzleStatus = 'idle';
      state.isAttempting = false;
      state.attemptStartTime = null;
      state.hintUsed = false;
      state.isShowingHint = false;
      state.currentAttempt = null;
    },

    nextPuzzle: (state) => {
      if (state.puzzleIndex < state.availablePuzzles.length - 1) {
        const nextIndex = state.puzzleIndex + 1;
        const nextPuzzle = state.availablePuzzles[nextIndex];
        
        state.currentPuzzle = nextPuzzle;
        state.puzzleIndex = nextIndex;
        state.puzzleStatus = 'idle';
        state.userMoves = [];
        state.hintUsed = false;
        state.isShowingHint = false;
        state.currentAttempt = null;
        state.isAttempting = false;
        state.attemptStartTime = null;
      }
    },

    previousPuzzle: (state) => {
      if (state.puzzleIndex > 0) {
        const prevIndex = state.puzzleIndex - 1;
        const prevPuzzle = state.availablePuzzles[prevIndex];
        
        state.currentPuzzle = prevPuzzle;
        state.puzzleIndex = prevIndex;
        state.puzzleStatus = 'idle';
        state.userMoves = [];
        state.hintUsed = false;
        state.isShowingHint = false;
        state.currentAttempt = null;
        state.isAttempting = false;
        state.attemptStartTime = null;
      }
    },

    setDifficultyFilter: (state, action: PayloadAction<number | null>) => {
      state.selectedDifficulty = action.payload;
    },

    setThemeFilter: (state, action: PayloadAction<string | null>) => {
      state.selectedTheme = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load puzzles
      .addCase(loadPuzzles.pending, (state) => {
        state.isLoadingPuzzles = true;
        state.error = null;
      })
      .addCase(loadPuzzles.fulfilled, (state, action) => {
        state.isLoadingPuzzles = false;
        state.availablePuzzles = action.payload;
        
        // Extract unique themes for filter options
        const themes = [...new Set(action.payload.map(puzzle => puzzle.theme))];
        state.availableThemes = themes;
        
        // Auto-select first puzzle if none selected
        if (action.payload.length > 0 && !state.currentPuzzle) {
          state.currentPuzzle = action.payload[0];
          state.puzzleIndex = 0;
        }
      })
      .addCase(loadPuzzles.rejected, (state, action) => {
        state.isLoadingPuzzles = false;
        state.error = action.error.message || 'Failed to load puzzles';
      })
      
      // Submit score
      .addCase(submitPuzzleScore.pending, (state) => {
        state.isSubmittingScore = true;
        state.error = null;
      })
      .addCase(submitPuzzleScore.fulfilled, (state) => {
        state.isSubmittingScore = false;
      })
      .addCase(submitPuzzleScore.rejected, (state, action) => {
        state.isSubmittingScore = false;
        state.error = action.error.message || 'Failed to submit score';
      });
  },
});

export const {
  startQuizSession,
  selectPuzzle,
  startPuzzleAttempt,
  addUserMove,
  puzzleSolved,
  puzzleFailed,
  showHint,
  hideHint,
  resetPuzzle,
  nextPuzzle,
  previousPuzzle,
  setDifficultyFilter,
  setThemeFilter,
  clearError,
} = quizSlice.actions;

export default quizSlice.reducer;