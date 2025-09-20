import Database from '../models/Database';
import { MusicPreference, MusicPreferenceRequest, MoodCategory, MusicTrack } from '../types';
export declare class MusicPreferencesService {
    private db;
    constructor(database: Database);
    /**
     * Save user's music preferences
     */
    savePreferences(userId: number, preferences: MusicPreferenceRequest[]): Promise<void>;
    /**
     * Get user's music preferences
     */
    getUserPreferences(userId: number): Promise<MusicPreference[]>;
    /**
     * Get music recommendations based on user preferences and current mood
     */
    getRecommendations(userId: number, currentMood: MoodCategory, energyLevel?: number): Promise<MusicTrack[]>;
    /**
     * Get general music recommendations when no user preferences exist
     */
    private getGeneralRecommendations;
    /**
     * Get mood synonyms for better matching
     */
    private getMoodSynonyms;
    /**
     * Update preference weights based on user feedback
     */
    updatePreferenceWeights(userId: number, genreFeedback: Record<string, number>): Promise<void>;
    /**
     * Add a single preference
     */
    addPreference(userId: number, preference: MusicPreferenceRequest): Promise<number>;
    /**
     * Remove a preference
     */
    removePreference(userId: number, preferenceId: number): Promise<void>;
}
//# sourceMappingURL=MusicPreferencesService.d.ts.map