import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';

// Import reducers
import userReducer from './slices/userSlice';
import gameReducer from './slices/gameSlice';
import quizReducer from './slices/quizSlice';

// Configure the store
export const store = configureStore({
  reducer: {
    user: userReducer,
    game: gameReducer,
    quiz: quizReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore chess.js instances in game state as they contain non-serializable data
        ignoredPaths: ['game.game'],
        ignoredActions: ['game/initializeGame', 'game/makeMove'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production', // Enable Redux DevTools in development
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Create typed hooks for use throughout the app
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Export action creators from all slices for easy access
export { 
  // User actions
  createUser,
  authenticateUser,
  fetchUserStats,
  logout,
  clearError as clearUserError,
  updateStats,
} from './slices/userSlice';

export {
  // Game actions  
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
} from './slices/gameSlice';

export {
  // Quiz actions
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
  clearError as clearQuizError,
  loadPuzzles,
  submitPuzzleScore,
} from './slices/quizSlice';

// Selector helpers for commonly used state combinations
export const selectUserState = (state: RootState) => state.user;
export const selectGameState = (state: RootState) => state.game;
export const selectQuizState = (state: RootState) => state.quiz;

// Combined selectors for complex state queries
export const selectCurrentUser = (state: RootState) => state.user.currentUser;
export const selectIsLoggedIn = (state: RootState) => !!state.user.currentUser;
export const selectCurrentGame = (state: RootState) => state.game.gameEngine;
export const selectCurrentPuzzle = (state: RootState) => state.quiz.currentPuzzle;
export const selectIsGameInProgress = (state: RootState) => 
  state.game.gameEngine !== null && !state.game.isGameOver;
export const selectIsPuzzleInProgress = (state: RootState) => 
  state.quiz.isAttempting && state.quiz.puzzleStatus === 'in-progress';

// Performance tracking selectors
export const selectUserPerformance = (state: RootState) => ({
  currentScore: state.user.stats?.totalScore || 0,
  gameScore: state.game.playerScore,
  sessionScore: state.quiz.sessionStats.totalScore,
  totalPuzzlesSolved: state.user.stats?.totalSolved || 0,
  sessionPuzzlesSolved: state.quiz.sessionStats.puzzlesSolved,
});

// Loading state selectors
export const selectLoadingStates = (state: RootState) => ({
  isLoadingUser: state.user.isLoading,
  isLoadingPuzzles: state.quiz.isLoadingPuzzles,
  isSubmittingScore: state.quiz.isSubmittingScore,
  isAiThinking: state.game.isAiThinking,
});

// Error state selectors
export const selectErrors = (state: RootState) => ({
  userError: state.user.error,
  quizError: state.quiz.error,
});

export default store;