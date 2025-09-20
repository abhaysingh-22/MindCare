import * as sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

class Database {
  private db: sqlite3.Database;
  
  constructor(dbPath: string = process.env.DB_PATH || './data/mindcare.db') {
    // Ensure data directory exists
    const dataDir = path.dirname(dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    this.db = new sqlite3.Database(dbPath);
    this.init();
  }

  private async init() {
    const run = promisify(this.db.run.bind(this.db));
    
    try {
      // Users table
      await run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username VARCHAR(255) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Music preferences table
      await run(`
        CREATE TABLE IF NOT EXISTS music_preferences (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          genre VARCHAR(100) NOT NULL,
          artist VARCHAR(255),
          mood_category VARCHAR(50) NOT NULL,
          energy_level INTEGER CHECK(energy_level >= 1 AND energy_level <= 10),
          preference_weight REAL DEFAULT 1.0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // Mood tracking table
      await run(`
        CREATE TABLE IF NOT EXISTS mood_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          mood_score INTEGER CHECK(mood_score >= 1 AND mood_score <= 10),
          mood_category VARCHAR(50) NOT NULL,
          activity VARCHAR(255),
          notes TEXT,
          detected_automatically BOOLEAN DEFAULT FALSE,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // Music tracks table
      await run(`
        CREATE TABLE IF NOT EXISTS music_tracks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title VARCHAR(255) NOT NULL,
          artist VARCHAR(255) NOT NULL,
          album VARCHAR(255),
          genre VARCHAR(100),
          duration INTEGER,
          mood_tags TEXT, -- JSON array of mood tags
          energy_level INTEGER CHECK(energy_level >= 1 AND energy_level <= 10),
          valence REAL CHECK(valence >= 0 AND valence <= 1), -- Musical positivity
          spotify_id VARCHAR(255),
          youtube_id VARCHAR(255),
          preview_url TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // User music sessions table
      await run(`
        CREATE TABLE IF NOT EXISTS music_sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          track_id INTEGER NOT NULL,
          played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          mood_before INTEGER CHECK(mood_before >= 1 AND mood_before <= 10),
          mood_after INTEGER CHECK(mood_after >= 1 AND mood_after <= 10),
          session_duration INTEGER, -- in seconds
          feedback_rating INTEGER CHECK(feedback_rating >= 1 AND feedback_rating <= 5),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (track_id) REFERENCES music_tracks(id) ON DELETE CASCADE
        )
      `);

      // Playlists table
      await run(`
        CREATE TABLE IF NOT EXISTS playlists (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          mood_category VARCHAR(50),
          is_ai_generated BOOLEAN DEFAULT FALSE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // Playlist tracks junction table
      await run(`
        CREATE TABLE IF NOT EXISTS playlist_tracks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          playlist_id INTEGER NOT NULL,
          track_id INTEGER NOT NULL,
          position INTEGER NOT NULL,
          added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
          FOREIGN KEY (track_id) REFERENCES music_tracks(id) ON DELETE CASCADE,
          UNIQUE(playlist_id, track_id)
        )
      `);

      // Create indexes for better performance
      await run('CREATE INDEX IF NOT EXISTS idx_music_preferences_user_id ON music_preferences(user_id)');
      await run('CREATE INDEX IF NOT EXISTS idx_mood_logs_user_id ON mood_logs(user_id)');
      await run('CREATE INDEX IF NOT EXISTS idx_mood_logs_timestamp ON mood_logs(timestamp)');
      await run('CREATE INDEX IF NOT EXISTS idx_music_tracks_genre ON music_tracks(genre)');
      await run('CREATE INDEX IF NOT EXISTS idx_music_tracks_mood_tags ON music_tracks(mood_tags)');
      await run('CREATE INDEX IF NOT EXISTS idx_music_sessions_user_id ON music_sessions(user_id)');
      await run('CREATE INDEX IF NOT EXISTS idx_playlist_tracks_playlist_id ON playlist_tracks(playlist_id)');

      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  public getDatabase(): sqlite3.Database {
    return this.db;
  }

  public async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err: any) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

export default Database;