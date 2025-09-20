"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MusicStreamingService = void 0;
const axios_1 = __importDefault(require("axios"));
class MusicStreamingService {
    constructor(database) {
        this.spotifyToken = null;
        this.tokenExpiresAt = 0;
        this.db = database;
    }
    /**
     * Get Spotify access token
     */
    async getSpotifyToken() {
        if (this.spotifyToken && Date.now() < this.tokenExpiresAt) {
            return this.spotifyToken;
        }
        const clientId = process.env.SPOTIFY_CLIENT_ID;
        const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
        if (!clientId || !clientSecret) {
            throw new Error('Spotify credentials not configured');
        }
        try {
            const response = await axios_1.default.post('https://accounts.spotify.com/api/token', 'grant_type=client_credentials', {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
                }
            });
            this.spotifyToken = response.data.access_token;
            this.tokenExpiresAt = Date.now() + (response.data.expires_in * 1000) - 60000; // Refresh 1 minute before expiry
            return this.spotifyToken;
        }
        catch (error) {
            console.error('Error getting Spotify token:', error);
            throw new Error('Failed to authenticate with Spotify');
        }
    }
    /**
     * Search for tracks on Spotify based on mood and genre
     */
    async searchSpotifyTracks(mood, genre, energyLevel, limit = 20) {
        try {
            const token = await this.getSpotifyToken();
            // Build search query based on mood and preferences
            let query = this.buildSpotifySearchQuery(mood, genre, energyLevel);
            const response = await axios_1.default.get('https://api.spotify.com/v1/search', {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                params: {
                    q: query,
                    type: 'track',
                    limit: limit,
                    market: 'US'
                }
            });
            const tracks = response.data.tracks.items.map((track) => ({
                title: track.name,
                artist: track.artists.map((artist) => artist.name).join(', '),
                album: track.album.name,
                duration: Math.round(track.duration_ms / 1000),
                spotify_id: track.id,
                preview_url: track.preview_url,
                mood_tags: JSON.stringify([mood]),
                energy_level: energyLevel || this.estimateEnergyFromSpotifyFeatures(track),
                valence: this.estimateValenceFromMood(mood),
                genre: genre || 'unknown'
            }));
            // Get audio features for better recommendations
            const trackIds = tracks.map(track => track.spotify_id).filter(Boolean);
            if (trackIds.length > 0) {
                const featuresResponse = await axios_1.default.get(`https://api.spotify.com/v1/audio-features?ids=${trackIds.join(',')}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                // Update tracks with actual audio features
                featuresResponse.data.audio_features.forEach((features, index) => {
                    if (features && tracks[index]) {
                        tracks[index].energy_level = Math.round(features.energy * 10);
                        tracks[index].valence = features.valence;
                    }
                });
            }
            return tracks;
        }
        catch (error) {
            console.error('Error searching Spotify tracks:', error);
            return [];
        }
    }
    /**
     * Build Spotify search query based on mood and preferences
     */
    buildSpotifySearchQuery(mood, genre, energyLevel) {
        const moodKeywords = {
            happy: ['happy', 'upbeat', 'cheerful', 'joyful'],
            sad: ['sad', 'melancholy', 'emotional', 'blue'],
            calm: ['calm', 'peaceful', 'relaxing', 'chill'],
            energetic: ['energetic', 'pump up', 'workout', 'high energy'],
            anxious: ['calming', 'soothing', 'anxiety relief', 'peaceful'],
            angry: ['aggressive', 'heavy', 'intense', 'metal'],
            peaceful: ['peaceful', 'ambient', 'meditation', 'zen'],
            motivated: ['motivational', 'inspiring', 'pump up', 'confidence'],
            nostalgic: ['nostalgic', 'throwback', 'memories', 'classic'],
            romantic: ['romantic', 'love', 'intimate', 'tender']
        };
        let queryParts = [];
        // Add mood-based keywords
        const keywords = moodKeywords[mood] || [];
        if (keywords.length > 0) {
            queryParts.push(keywords[Math.floor(Math.random() * keywords.length)]);
        }
        // Add genre if specified
        if (genre && genre !== 'unknown') {
            queryParts.push(`genre:${genre}`);
        }
        // Add energy-based terms
        if (energyLevel) {
            if (energyLevel >= 8) {
                queryParts.push('high energy');
            }
            else if (energyLevel <= 3) {
                queryParts.push('low energy');
            }
        }
        return queryParts.join(' ');
    }
    /**
     * Estimate energy level from Spotify track data (fallback)
     */
    estimateEnergyFromSpotifyFeatures(track) {
        // This is a rough estimation based on available track data
        // In practice, we'd use the audio features API
        const tempo = track.tempo || 120;
        const popularity = track.popularity || 50;
        // Higher tempo and popularity generally indicate higher energy
        const tempoScore = Math.min(10, Math.max(1, (tempo - 60) / 20));
        const popularityScore = Math.min(10, Math.max(1, popularity / 10));
        return Math.round((tempoScore + popularityScore) / 2);
    }
    /**
     * Estimate valence (musical positivity) from mood
     */
    estimateValenceFromMood(mood) {
        const valenceMap = {
            happy: 0.8,
            sad: 0.2,
            calm: 0.5,
            energetic: 0.7,
            anxious: 0.3,
            angry: 0.4,
            peaceful: 0.6,
            motivated: 0.8,
            nostalgic: 0.4,
            romantic: 0.6
        };
        return valenceMap[mood] || 0.5;
    }
    /**
     * Create a playlist on Spotify (requires user authentication)
     */
    async createSpotifyPlaylist(userAccessToken, playlistName, trackIds) {
        try {
            // Get user profile
            const profileResponse = await axios_1.default.get('https://api.spotify.com/v1/me', {
                headers: {
                    'Authorization': `Bearer ${userAccessToken}`
                }
            });
            const userId = profileResponse.data.id;
            // Create playlist
            const playlistResponse = await axios_1.default.post(`https://api.spotify.com/v1/users/${userId}/playlists`, {
                name: playlistName,
                description: 'Generated by MindCare based on your mood',
                public: false
            }, {
                headers: {
                    'Authorization': `Bearer ${userAccessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            const playlistId = playlistResponse.data.id;
            // Add tracks to playlist
            if (trackIds.length > 0) {
                const uris = trackIds.map(id => `spotify:track:${id}`);
                await axios_1.default.post(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
                    uris: uris
                }, {
                    headers: {
                        'Authorization': `Bearer ${userAccessToken}`,
                        'Content-Type': 'application/json'
                    }
                });
            }
            return playlistId;
        }
        catch (error) {
            console.error('Error creating Spotify playlist:', error);
            return null;
        }
    }
    /**
     * Search YouTube for music tracks (alternative to Spotify)
     */
    async searchYouTubeTracks(mood, genre, limit = 10) {
        const apiKey = process.env.YOUTUBE_API_KEY;
        if (!apiKey) {
            console.warn('YouTube API key not configured');
            return [];
        }
        try {
            const query = this.buildYouTubeSearchQuery(mood, genre);
            const response = await axios_1.default.get('https://www.googleapis.com/youtube/v3/search', {
                params: {
                    part: 'snippet',
                    maxResults: limit,
                    q: query,
                    type: 'video',
                    videoCategoryId: '10', // Music category
                    key: apiKey
                }
            });
            const tracks = response.data.items.map((item) => ({
                title: item.snippet.title,
                artist: item.snippet.channelTitle,
                youtube_id: item.id.videoId,
                mood_tags: JSON.stringify([mood]),
                energy_level: this.estimateEnergyFromMood(mood),
                valence: this.estimateValenceFromMood(mood),
                genre: genre || 'unknown',
                preview_url: `https://www.youtube.com/watch?v=${item.id.videoId}`
            }));
            return tracks;
        }
        catch (error) {
            console.error('Error searching YouTube tracks:', error);
            return [];
        }
    }
    /**
     * Build YouTube search query
     */
    buildYouTubeSearchQuery(mood, genre) {
        const moodQueries = {
            happy: 'happy upbeat music',
            sad: 'sad emotional music',
            calm: 'calm relaxing music',
            energetic: 'energetic workout music',
            anxious: 'calming anxiety relief music',
            angry: 'aggressive intense music',
            peaceful: 'peaceful meditation music',
            motivated: 'motivational inspiring music',
            nostalgic: 'nostalgic throwback music',
            romantic: 'romantic love songs'
        };
        let query = moodQueries[mood] || 'music';
        if (genre && genre !== 'unknown') {
            query += ` ${genre}`;
        }
        return query;
    }
    /**
     * Estimate energy level from mood (fallback method)
     */
    estimateEnergyFromMood(mood) {
        const energyMap = {
            happy: 7,
            sad: 3,
            calm: 4,
            energetic: 9,
            anxious: 5,
            angry: 8,
            peaceful: 2,
            motivated: 8,
            nostalgic: 5,
            romantic: 5
        };
        return energyMap[mood] || 5;
    }
    /**
     * Store tracks in local database for faster access
     */
    async storeTracksInDatabase(tracks) {
        const database = this.db.getDatabase();
        const insertedIds = [];
        return new Promise((resolve, reject) => {
            database.serialize(() => {
                const stmt = database.prepare(`
          INSERT OR IGNORE INTO music_tracks 
          (title, artist, album, genre, duration, mood_tags, energy_level, valence, spotify_id, youtube_id, preview_url)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
                let completed = 0;
                let hasError = false;
                tracks.forEach((track) => {
                    stmt.run([
                        track.title,
                        track.artist,
                        track.album || null,
                        track.genre || null,
                        track.duration || null,
                        track.mood_tags || JSON.stringify([]),
                        track.energy_level || 5,
                        track.valence || 0.5,
                        track.spotify_id || null,
                        track.youtube_id || null,
                        track.preview_url || null
                    ], function (err) {
                        if (err && !hasError) {
                            hasError = true;
                            reject(err);
                            return;
                        }
                        if (this.lastID) {
                            insertedIds.push(this.lastID);
                        }
                        completed++;
                        if (completed === tracks.length && !hasError) {
                            stmt.finalize();
                            resolve(insertedIds);
                        }
                    });
                });
                if (tracks.length === 0) {
                    resolve(insertedIds);
                }
            });
        });
    }
    /**
     * Get curated tracks for a specific mood (combines local and external sources)
     */
    async getCuratedTracks(mood, genre, energyLevel, limit = 20) {
        // First, try to get tracks from local database
        const database = this.db.getDatabase();
        const localTracks = await new Promise((resolve, reject) => {
            const moodCondition = `mood_tags LIKE '%"${mood}"%'`;
            const genreCondition = genre ? `AND genre = ?` : '';
            const energyCondition = energyLevel
                ? `AND energy_level BETWEEN ${Math.max(1, energyLevel - 2)} AND ${Math.min(10, energyLevel + 2)}`
                : '';
            const query = `
        SELECT * FROM music_tracks 
        WHERE ${moodCondition} ${genreCondition} ${energyCondition}
        ORDER BY valence DESC
        LIMIT ${Math.min(limit, 10)}
      `;
            const params = genre ? [genre] : [];
            database.all(query, params, (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                const tracks = rows.map(row => ({
                    ...row,
                    mood_tags: JSON.parse(row.mood_tags || '[]')
                }));
                resolve(tracks);
            });
        });
        // If we don't have enough local tracks, fetch from external sources
        if (localTracks.length < limit) {
            const remainingLimit = limit - localTracks.length;
            try {
                // Try Spotify first
                const spotifyTracks = await this.searchSpotifyTracks(mood, genre, energyLevel, remainingLimit);
                // Store new tracks in database for future use
                if (spotifyTracks.length > 0) {
                    await this.storeTracksInDatabase(spotifyTracks);
                }
                // Combine local and external tracks
                return [...localTracks, ...spotifyTracks].slice(0, limit);
            }
            catch (error) {
                console.error('Error fetching external tracks:', error);
                return localTracks;
            }
        }
        return localTracks;
    }
}
exports.MusicStreamingService = MusicStreamingService;
//# sourceMappingURL=MusicStreamingService.js.map