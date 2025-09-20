# MindCare Music Integration

A comprehensive mood-based music recommendation system that detects user emotions and provides curated playlists to improve mental wellbeing.

## 🎵 Features

### Frontend (React + TypeScript)
- **Interactive Music Player**: Full-featured player with play/pause, skip, volume control
- **Mood Detection Interface**: Manual mood logging and automatic detection
- **Real-time Feedback**: Rate tracks and provide mood feedback
- **Responsive Design**: Works on desktop and mobile devices
- **WebSocket Integration**: Real-time mood updates and music recommendations

### Backend (Node.js + Express + TypeScript)
- **Mood Detection Service**: Automatic mood analysis based on user behavior
- **Music Preferences Service**: Personalized music curation based on user preferences
- **Streaming Integration**: Spotify and YouTube API integration
- **Database Management**: SQLite database for user data and music metadata
- **WebSocket Server**: Real-time communication for mood updates
- **REST API**: Comprehensive endpoints for all music and mood operations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Spotify Developer Account (for music streaming)
- YouTube API Key (optional, for additional music sources)

### Frontend Setup
```bash
# Navigate to frontend directory
cd MindCare

# Install dependencies
npm install

# Start development server
npm run dev
```

### Backend Setup
```bash
# Navigate to backend directory
cd MindCare/backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your API keys
# Required: SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET
# Optional: YOUTUBE_API_KEY

# Build TypeScript
npm run build

# Start development server
npm run dev
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Server Configuration
NODE_ENV=development
PORT=3001

# Database
DB_PATH=./data/mindcare.db

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Spotify API (Required)
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# YouTube API (Optional)
YOUTUBE_API_KEY=your_youtube_api_key

# CORS
FRONTEND_URL=http://localhost:5173

# Mood Detection
MOOD_CHECK_INTERVAL=300000
```

### Getting Spotify API Credentials

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Copy Client ID and Client Secret
4. Add to your `.env` file

## 📊 API Endpoints

### Music Preferences
- `POST /api/music/preferences` - Save user music preferences
- `GET /api/music/preferences/:userId` - Get user preferences
- `PUT /api/music/preferences/:userId` - Update preferences
- `DELETE /api/music/preferences/:userId/:preferenceId` - Remove preference

### Mood Detection
- `POST /api/music/mood/log` - Log user mood manually
- `GET /api/music/mood/detect/:userId` - Detect mood from history
- `GET /api/music/mood/statistics/:userId` - Get mood statistics
- `POST /api/music/mood/auto-detect` - Auto-detect mood from behavior

### Music Recommendations
- `POST /api/music/recommendations` - Get personalized recommendations
- `GET /api/music/curated/:mood` - Get curated music for specific mood
- `POST /api/music/play` - Trigger mood-based music playback

### Music Streaming
- `GET /api/music/search/spotify` - Search Spotify tracks
- `GET /api/music/search/youtube` - Search YouTube tracks
- `POST /api/music/playlist/create` - Create Spotify playlist

## 🎭 How It Works

### 1. Mood Detection
The system uses multiple approaches to detect user mood:

- **Manual Logging**: Users can directly input their mood (1-10 scale) with categories
- **Behavioral Analysis**: Tracks app usage patterns, time of day, activity levels
- **Music History**: Analyzes previously played music to understand preferences
- **Pattern Recognition**: Identifies mood trends over time

### 2. Music Curation
Based on detected mood, the system:

- **Retrieves User Preferences**: Accesses saved genre and artist preferences
- **Matches Mood Categories**: Maps emotions to appropriate music characteristics
- **Energy Level Matching**: Considers desired energy levels (1-10 scale)
- **External API Integration**: Searches Spotify/YouTube for matching tracks
- **Local Database**: Stores frequently accessed tracks for faster retrieval

### 3. Real-time Adaptation
The system continuously improves through:

- **User Feedback**: Tracks ratings and mood changes after music sessions
- **Preference Learning**: Adjusts recommendation weights based on user behavior
- **Mood Tracking**: Monitors mood changes throughout the day
- **Automatic Triggers**: Proactively suggests music when negative moods are detected

## 🗄️ Database Schema

### Core Tables
- **users**: User account information
- **music_preferences**: User's music preferences by mood and genre
- **mood_logs**: Historical mood data with automatic/manual detection
- **music_tracks**: Cached music metadata from streaming services
- **music_sessions**: Tracking of music listening sessions and feedback
- **playlists**: User-created and AI-generated playlists
- **playlist_tracks**: Junction table for playlist-track relationships

## 🔄 Real-time Features

### WebSocket Events
- `join-mood-room`: User joins their mood monitoring room
- `request-mood-update`: Request current mood analysis
- `mood-update`: Receive mood detection results
- `music-recommendations`: Get proactive music suggestions
- `music-played`: Track music playback events
- `submit-feedback`: Send real-time feedback on tracks

### Scheduled Tasks
- **Mood Monitoring**: Checks for users needing mood support every 5 minutes
- **Data Cleanup**: Removes old logs and sessions daily
- **Preference Updates**: Adjusts recommendation algorithms based on feedback

## 🎯 Usage Example

### Basic Integration
```typescript
// Start mood coaching session
const startMoodSession = async (userId: number) => {
  // Detect current mood
  const moodResult = await fetch(`/api/music/mood/detect/${userId}`);
  const mood = await moodResult.json();
  
  // Get music recommendations
  const musicResult = await fetch('/api/music/recommendations', {
    method: 'POST',
    body: JSON.stringify({
      user_id: userId,
      mood_category: mood.mood_category,
      energy_level: mood.energy_level
    })
  });
  
  const recommendations = await musicResult.json();
  
  // Start playing music
  playMusic(recommendations.tracks);
};
```

### Real-time Mood Monitoring
```typescript
// Connect to WebSocket
const socket = io('http://localhost:3001');

// Join user's mood room
socket.emit('join-mood-room', userId);

// Listen for mood updates
socket.on('mood-update', (moodData) => {
  updateUI(moodData);
});

// Listen for music recommendations
socket.on('music-recommendations', (musicData) => {
  if (musicData.reason === 'mood-support') {
    showMoodSupportDialog(musicData.tracks);
  }
});
```

## 🛠️ Development

### Build Commands
```bash
# Frontend
npm run build          # Production build
npm run dev            # Development server
npm run lint           # ESLint check

# Backend
npm run build          # Compile TypeScript
npm run dev            # Development with hot reload
npm run start          # Production server
```

### Testing
```bash
# Backend tests
npm test

# Frontend tests
npm run test
```

## 🚀 Deployment

### Production Setup
1. Build both frontend and backend
2. Set production environment variables
3. Configure database path for production
4. Set up process manager (PM2 recommended)
5. Configure reverse proxy (nginx recommended)

### Docker Deployment
```dockerfile
# Dockerfile example for backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests for new functionality
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🎵 Credits

- **Spotify Web API** for music streaming integration
- **YouTube Data API** for additional music sources
- **Socket.io** for real-time communication
- **SQLite** for local data storage
- **React + TypeScript** for the frontend interface

---

Built with ❤️ for better mental health through music therapy.