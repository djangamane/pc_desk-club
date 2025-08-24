import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
  avatar?: string; // Base64 encoded image or URL
}

export interface UserStats {
  totalSolved: number;
  totalAttempts: number;
  totalScore: number;
  avgScore: number;
}

export interface UserState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  stats: UserStats | null;
}

// Initial state
const initialState: UserState = {
  currentUser: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  stats: null,
};

// Async thunks for user operations
export const createUser = createAsyncThunk(
  'user/createUser',
  async (userData: { username: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.database.createUser(userData);
        if (result.success) {
          return result.user;
        } else {
          return rejectWithValue(result.error || 'Failed to create user');
        }
      } else {
        return rejectWithValue('Electron API not available');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create user');
    }
  }
);

export const authenticateUser = createAsyncThunk(
  'user/authenticateUser',
  async (credentials: { username: string; password: string }, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.database.authenticateUser(credentials.username, credentials.password);
        if (result.success) {
          return result.user;
        } else {
          return rejectWithValue(result.error || 'Authentication failed');
        }
      } else {
        return rejectWithValue('Electron API not available');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Authentication failed');
    }
  }
);

export const fetchUserStats = createAsyncThunk(
  'user/fetchUserStats',
  async (userId: number, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        const stats = await window.electronAPI.database.getUserStats(userId);
        return stats;
      } else {
        return rejectWithValue('Electron API not available');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch user stats');
    }
  }
);

// User slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      state.stats = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateStats: (state, action: PayloadAction<Partial<UserStats>>) => {
      if (state.stats) {
        state.stats = { ...state.stats, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    // Create user
    builder
      .addCase(createUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Authenticate user
    builder
      .addCase(authenticateUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(authenticateUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(authenticateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch user stats
    builder
      .addCase(fetchUserStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError, updateStats } = userSlice.actions;
export default userSlice.reducer;