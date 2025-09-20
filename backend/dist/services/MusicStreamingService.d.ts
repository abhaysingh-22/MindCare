import Database from '../models/Database';
import { MusicTrack, MoodCategory } from '../types';
export declare class MusicStreamingService {
    private db;
    private spotifyToken;
    private tokenExpiresAt;
    constructor(database: Database);
    /**
     * Get Spotify access token
     */
    private getSpotifyToken;
    /**
     * Search for tracks on Spotify based on mood and genre
     */
    searchSpotifyTracks(mood: MoodCategory, genre?: string, energyLevel?: number, limit?: number): Promise<MusicTrack[]>;
    /**
     * Build Spotify search query based on mood and preferences
     */
    private buildSpotifySearchQuery;
    /**
     * Estimate energy level from Spotify track data (fallback)
     */
    private estimateEnergyFromSpotifyFeatures;
    /**
     * Estimate valence (musical positivity) from mood
     */
    private estimateValenceFromMood;
    /**
     * Create a playlist on Spotify (requires user authentication)
     */
    createSpotifyPlaylist(userAccessToken: string, playlistName: string, trackIds: string[]): Promise<string | null>;
    /**
     * Search YouTube for music tracks (alternative to Spotify)
     */
    searchYouTubeTracks(mood: MoodCategory, genre?: string, limit?: number): Promise<MusicTrack[]>;
    /**
     * Build YouTube search query
     */
    private buildYouTubeSearchQuery;
    /**
     * Estimate energy level from mood (fallback method)
     */
    private estimateEnergyFromMood;
    /**
     * Store tracks in local database for faster access
     */
    storeTracksInDatabase(tracks: Partial<MusicTrack>[]): Promise<number[]>;
    /**
     * Get curated tracks for a specific mood (combines local and external sources)
     */
    getCuratedTracks(mood: MoodCategory, genre?: string, energyLevel?: number, limit?: number): Promise<MusicTrack[]>;
}
//# sourceMappingURL=MusicStreamingService.d.ts.map