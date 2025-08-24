import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';
import bcrypt from 'bcryptjs';

// Database interface definitions
export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  created_at: string;
  avatar?: string; // Base64 encoded image or URL
}

export interface Puzzle {
  id: number;
  fen: string;
  solution_moves: string; // JSON string of moves array
  difficulty: number; // 1-5 scale
  theme: string;
}

export interface UserScore {
  id: number;
  user_id: number;
  puzzle_id: number;
  is_solved: boolean;
  attempts: number;
  score_earned: number;
  completed_at: string | null;
}

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
}

export interface UpdateScoreData {
  userId: number;
  puzzleId: number;
  solved: boolean;
  attempts: number;
  scoreEarned: number;
}

class DatabaseManager {
  private db: Database.Database;
  private dbPath: string;

  constructor() {
    // Get the user data directory for storing the database
    const userData = app.getPath('userData');
    this.dbPath = path.join(userData, 'planetary-chess.db');
    
    console.log('Database path:', this.dbPath);
    
    // Initialize database
    this.db = new Database(this.dbPath);
    
    // Enable WAL mode for better concurrency
    this.db.pragma('journal_mode = WAL');
    
    // Initialize schema
    this.initializeSchema();
    
    // Seed initial puzzle data
    this.seedPuzzles();
  }

  private initializeSchema(): void {
    // Create users table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create puzzles table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS puzzles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fen TEXT NOT NULL,
        solution_moves TEXT NOT NULL,
        difficulty INTEGER NOT NULL CHECK (difficulty >= 1 AND difficulty <= 5),
        theme TEXT NOT NULL
      )
    `);

    // Create user_scores table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS user_scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        puzzle_id INTEGER NOT NULL,
        is_solved BOOLEAN NOT NULL DEFAULT 0,
        attempts INTEGER NOT NULL DEFAULT 0,
        score_earned INTEGER NOT NULL DEFAULT 0,
        completed_at DATETIME,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (puzzle_id) REFERENCES puzzles (id) ON DELETE CASCADE,
        UNIQUE(user_id, puzzle_id)
      )
    `);

    // Create indexes for better performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_user_scores_user_id ON user_scores (user_id);
      CREATE INDEX IF NOT EXISTS idx_user_scores_puzzle_id ON user_scores (puzzle_id);
      CREATE INDEX IF NOT EXISTS idx_puzzles_difficulty ON puzzles (difficulty);
      CREATE INDEX IF NOT EXISTS idx_puzzles_theme ON puzzles (theme);
    `);

    console.log('Database schema initialized');
  }

  private seedPuzzles(): void {
    // Check if puzzles already exist
    const existingPuzzles = this.db.prepare('SELECT COUNT(*) as count FROM puzzles').get() as { count: number };
    
    if (existingPuzzles.count > 0) {
      console.log('Puzzles already seeded');
      return;
    }

    // Sample puzzle data - these should match your existing quiz questions
    const samplePuzzles = [
      {
        fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
        solution_moves: JSON.stringify(['e7e5', 'Ng1f3']),
        difficulty: 1,
        theme: 'opening'
      },
      {
        fen: 'r1bqkb1r/pppp1ppp/2n2n2/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
        solution_moves: JSON.stringify(['Bf1c4', 'd7d6']),
        difficulty: 2,
        theme: 'tactics'
      },
      {
        fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 4 5',
        solution_moves: JSON.stringify(['Bc4xf7+', 'Ke8f8']),
        difficulty: 3,
        theme: 'attack'
      }
    ];

    const insertPuzzle = this.db.prepare(`
      INSERT INTO puzzles (fen, solution_moves, difficulty, theme)
      VALUES (?, ?, ?, ?)
    `);

    const insertMany = this.db.transaction((puzzles: typeof samplePuzzles) => {
      for (const puzzle of puzzles) {
        insertPuzzle.run(puzzle.fen, puzzle.solution_moves, puzzle.difficulty, puzzle.theme);
      }
    });

    insertMany(samplePuzzles);
    console.log('Sample puzzles seeded');
  }

  // User management methods
  async createUser(userData: CreateUserData): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(userData.password, saltRounds);

      const stmt = this.db.prepare(`
        INSERT INTO users (username, email, password_hash)
        VALUES (?, ?, ?)
      `);

      const result = stmt.run(userData.username, userData.email, passwordHash);
      
      const user = this.db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid) as User;
      
      return { success: true, user };
    } catch (error: any) {
      console.error('Error creating user:', error);
      return { 
        success: false, 
        error: error.code === 'SQLITE_CONSTRAINT_UNIQUE' ? 'Username or email already exists' : 'Failed to create user'
      };
    }
  }

  async authenticateUser(usernameOrEmail: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const user = this.db.prepare(`
        SELECT * FROM users 
        WHERE username = ? OR email = ?
      `).get(usernameOrEmail, usernameOrEmail) as User | undefined;

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      const isValid = await bcrypt.compare(password, user.password_hash);
      
      if (!isValid) {
        return { success: false, error: 'Invalid password' };
      }

      return { success: true, user };
    } catch (error) {
      console.error('Error authenticating user:', error);
      return { success: false, error: 'Authentication failed' };
    }
  }

  getUser(userId: number): User | undefined {
    return this.db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as User | undefined;
  }

  // Puzzle methods
  getAllPuzzles(): Puzzle[] {
    return this.db.prepare('SELECT * FROM puzzles ORDER BY difficulty, id').all() as Puzzle[];
  }

  getPuzzlesByDifficulty(difficulty: number): Puzzle[] {
    return this.db.prepare('SELECT * FROM puzzles WHERE difficulty = ? ORDER BY id').all(difficulty) as Puzzle[];
  }

  getPuzzlesByTheme(theme: string): Puzzle[] {
    return this.db.prepare('SELECT * FROM puzzles WHERE theme = ? ORDER BY difficulty, id').all(theme) as Puzzle[];
  }

  // Scoring methods
  updateScore(data: UpdateScoreData): { success: boolean; error?: string } {
    try {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO user_scores 
        (user_id, puzzle_id, is_solved, attempts, score_earned, completed_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      const completedAt = data.solved ? new Date().toISOString() : null;
      
      stmt.run(
        data.userId,
        data.puzzleId,
        data.solved ? 1 : 0,
        data.attempts,
        data.scoreEarned,
        completedAt
      );

      return { success: true };
    } catch (error) {
      console.error('Error updating score:', error);
      return { success: false, error: 'Failed to update score' };
    }
  }

  getUserScores(userId: number): UserScore[] {
    return this.db.prepare(`
      SELECT * FROM user_scores 
      WHERE user_id = ? 
      ORDER BY completed_at DESC
    `).all(userId) as UserScore[];
  }

  getUserStats(userId: number): { totalSolved: number; totalAttempts: number; totalScore: number; avgScore: number } {
    const stats = this.db.prepare(`
      SELECT 
        COUNT(CASE WHEN is_solved = 1 THEN 1 END) as totalSolved,
        SUM(attempts) as totalAttempts,
        SUM(score_earned) as totalScore,
        AVG(CASE WHEN is_solved = 1 THEN score_earned ELSE 0 END) as avgScore
      FROM user_scores 
      WHERE user_id = ?
    `).get(userId) as any;

    return {
      totalSolved: stats.totalSolved || 0,
      totalAttempts: stats.totalAttempts || 0,
      totalScore: stats.totalScore || 0,
      avgScore: Math.round(stats.avgScore || 0)
    };
  }

  getLeaderboard(limit: number = 10): Array<{ username: string; totalScore: number; totalSolved: number }> {
    return this.db.prepare(`
      SELECT 
        u.username,
        COALESCE(SUM(us.score_earned), 0) as totalScore,
        COALESCE(COUNT(CASE WHEN us.is_solved = 1 THEN 1 END), 0) as totalSolved
      FROM users u
      LEFT JOIN user_scores us ON u.id = us.user_id
      GROUP BY u.id, u.username
      ORDER BY totalScore DESC, totalSolved DESC
      LIMIT ?
    `).all(limit) as Array<{ username: string; totalScore: number; totalSolved: number }>;
  }

  // Close database connection
  close(): void {
    this.db.close();
  }
}

// Singleton instance
let dbInstance: DatabaseManager | null = null;

export function getDatabase(): DatabaseManager {
  if (!dbInstance) {
    dbInstance = new DatabaseManager();
  }
  return dbInstance;
}

export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}