"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MusicPreferencesService = void 0;
class MusicPreferencesService {
    constructor(database) {
        this.db = database;
    }
    /**
     * Save user's music preferences
     */
    async savePreferences(userId, preferences) {
        const database = this.db.getDatabase();
        return new Promise((resolve, reject) => {
            database.serialize(() => {
                // Clear existing preferences for this user
                database.run('DELETE FROM music_preferences WHERE user_id = ?', [userId], (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    // Insert new preferences
                    const stmt = database.prepare(`
              INSERT INTO music_preferences (user_id, genre, artist, mood_category, energy_level, preference_weight)
              VALUES (?, ?, ?, ?, ?, ?)
            `);
                    let completed = 0;
                    let hasError = false;
                    preferences.forEach((pref) => {
                        stmt.run([
                            userId,
                            pref.genre,
                            pref.artist || null,
                            pref.mood_category,
                            pref.energy_level,
                            pref.preference_weight || 1.0
                        ], (err) => {
                            if (err && !hasError) {
                                hasError = true;
                                reject(err);
                                return;
                            }
                            completed++;
                            if (completed === preferences.length && !hasError) {
                                stmt.finalize();
                                resolve();
                            }
                        });
                    });
                    if (preferences.length === 0) {
                        resolve();
                    }
                });
            });
        });
    }
    /**
     * Get user's music preferences
     */
    async getUserPreferences(userId) {
        const database = this.db.getDatabase();
        return new Promise((resolve, reject) => {
            database.all('SELECT * FROM music_preferences WHERE user_id = ? ORDER BY preference_weight DESC', [userId], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(rows);
            });
        });
    }
    /**
     * Get music recommendations based on user preferences and current mood
     */
    async getRecommendations(userId, currentMood, energyLevel) {
        const database = this.db.getDatabase();
        const userPreferences = await this.getUserPreferences(userId);
        // If no preferences, return general recommendations for the mood
        if (userPreferences.length === 0) {
            return this.getGeneralRecommendations(currentMood, energyLevel);
        }
        // Get preferred genres for this mood category
        const preferredGenres = userPreferences
            .filter(pref => pref.mood_category === currentMood)
            .map(pref => pref.genre);
        if (preferredGenres.length === 0) {
            // No specific preferences for this mood, use general preferences
            return this.getGeneralRecommendations(currentMood, energyLevel);
        }
        return new Promise((resolve, reject) => {
            const genrePlaceholders = preferredGenres.map(() => '?').join(',');
            const moodSynonyms = this.getMoodSynonyms(currentMood);
            const moodConditions = [currentMood, ...moodSynonyms]
                .map(mood => `mood_tags LIKE '%"${mood}"%'`)
                .join(' OR ');
            const query = `
        SELECT * FROM music_tracks 
        WHERE genre IN (${genrePlaceholders})
        AND (${moodConditions})
        ${energyLevel ? `AND energy_level BETWEEN ${Math.max(1, energyLevel - 2)} AND ${Math.min(10, energyLevel + 2)}` : ''}
        ORDER BY valence DESC, energy_level ${energyLevel && energyLevel > 6 ? 'DESC' : 'ASC'}
        LIMIT 20
      `;
            database.all(query, preferredGenres, (err, rows) => {
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
    }
    /**
     * Get general music recommendations when no user preferences exist
     */
    async getGeneralRecommendations(mood, energyLevel) {
        const database = this.db.getDatabase();
        return new Promise((resolve, reject) => {
            const moodSynonyms = this.getMoodSynonyms(mood);
            const moodConditions = [mood, ...moodSynonyms]
                .map(moodItem => `mood_tags LIKE '%"${moodItem}"%'`)
                .join(' OR ');
            const query = `
        SELECT * FROM music_tracks 
        WHERE (${moodConditions})
        ${energyLevel ? `AND energy_level BETWEEN ${Math.max(1, energyLevel - 2)} AND ${Math.min(10, energyLevel + 2)}` : ''}
        ORDER BY valence DESC, energy_level ${energyLevel && energyLevel > 6 ? 'DESC' : 'ASC'}
        LIMIT 15
      `;
            database.all(query, [], (err, rows) => {
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
    }
    /**
     * Get mood synonyms for better matching
     */
    getMoodSynonyms(mood) {
        const synonyms = {
            happy: ['joyful', 'cheerful', 'upbeat', 'positive'],
            sad: ['melancholy', 'sorrowful', 'blue', 'down'],
            calm: ['peaceful', 'relaxed', 'serene', 'tranquil'],
            energetic: ['upbeat', 'dynamic', 'lively', 'vigorous'],
            anxious: ['nervous', 'worried', 'stressed', 'tense'],
            angry: ['furious', 'mad', 'rage', 'frustrated'],
            peaceful: ['calm', 'serene', 'quiet', 'still'],
            motivated: ['inspired', 'driven', 'determined', 'focused'],
            nostalgic: ['wistful', 'reminiscent', 'sentimental', 'reflective'],
            romantic: ['love', 'tender', 'passionate', 'intimate']
        };
        return synonyms[mood] || [];
    }
    /**
     * Update preference weights based on user feedback
     */
    async updatePreferenceWeights(userId, genreFeedback) {
        const database = this.db.getDatabase();
        return new Promise((resolve, reject) => {
            database.serialize(() => {
                const stmt = database.prepare(`
          UPDATE music_preferences 
          SET preference_weight = preference_weight * ?, updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ? AND genre = ?
        `);
                let completed = 0;
                const genres = Object.keys(genreFeedback);
                let hasError = false;
                genres.forEach((genre) => {
                    const weightMultiplier = genreFeedback[genre];
                    stmt.run([weightMultiplier, userId, genre], (err) => {
                        if (err && !hasError) {
                            hasError = true;
                            reject(err);
                            return;
                        }
                        completed++;
                        if (completed === genres.length && !hasError) {
                            stmt.finalize();
                            resolve();
                        }
                    });
                });
                if (genres.length === 0) {
                    resolve();
                }
            });
        });
    }
    /**
     * Add a single preference
     */
    async addPreference(userId, preference) {
        const database = this.db.getDatabase();
        return new Promise((resolve, reject) => {
            database.run(`INSERT INTO music_preferences (user_id, genre, artist, mood_category, energy_level, preference_weight)
         VALUES (?, ?, ?, ?, ?, ?)`, [
                userId,
                preference.genre,
                preference.artist || null,
                preference.mood_category,
                preference.energy_level,
                preference.preference_weight || 1.0
            ], function (err) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(this.lastID);
            });
        });
    }
    /**
     * Remove a preference
     */
    async removePreference(userId, preferenceId) {
        const database = this.db.getDatabase();
        return new Promise((resolve, reject) => {
            database.run('DELETE FROM music_preferences WHERE id = ? AND user_id = ?', [preferenceId, userId], (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }
}
exports.MusicPreferencesService = MusicPreferencesService;
//# sourceMappingURL=MusicPreferencesService.js.map