export interface User {
    id: number;
    username: string;
    email: string;
    password_hash: string;
    created_at: string;
    updated_at: string;
}
export interface MusicPreference {
    id: number;
    user_id: number;
    genre: string;
    artist?: string;
    mood_category: MoodCategory;
    energy_level: number;
    preference_weight: number;
    created_at: string;
}
export interface MoodLog {
    id: number;
    user_id: number;
    mood_score: number;
    mood_category: MoodCategory;
    activity?: string;
    notes?: string;
    detected_automatically: boolean;
    timestamp: string;
}
export interface MusicTrack {
    id: number;
    title: string;
    artist: string;
    album?: string;
    genre?: string;
    duration?: number;
    mood_tags: string[];
    energy_level: number;
    valence: number;
    spotify_id?: string;
    youtube_id?: string;
    preview_url?: string;
    created_at: string;
}
export interface MusicSession {
    id: number;
    user_id: number;
    track_id: number;
    played_at: string;
    mood_before: number;
    mood_after?: number;
    session_duration?: number;
    feedback_rating?: number;
}
export interface Playlist {
    id: number;
    user_id: number;
    name: string;
    description?: string;
    mood_category?: MoodCategory;
    is_ai_generated: boolean;
    created_at: string;
    updated_at: string;
}
export interface PlaylistTrack {
    id: number;
    playlist_id: number;
    track_id: number;
    position: number;
    added_at: string;
}
export type MoodCategory = 'happy' | 'sad' | 'calm' | 'energetic' | 'anxious' | 'angry' | 'peaceful' | 'motivated' | 'nostalgic' | 'romantic';
export interface MoodDetectionResult {
    mood_category: MoodCategory;
    mood_score: number;
    confidence: number;
    suggested_tracks: MusicTrack[];
}
export interface PlaybackRequest {
    user_id: number;
    mood_category?: MoodCategory;
    energy_level?: number;
    genre_preference?: string;
    duration_limit?: number;
}
export interface CreateUserRequest {
    username: string;
    email: string;
    password: string;
}
export interface LoginRequest {
    email: string;
    password: string;
}
export interface AuthResponse {
    user: Omit<User, 'password_hash'>;
    token: string;
}
export interface MusicPreferenceRequest {
    genre: string;
    artist?: string;
    mood_category: MoodCategory;
    energy_level: number;
    preference_weight?: number;
}
export interface TrackFeedbackRequest {
    session_id: number;
    mood_after: number;
    feedback_rating: number;
}
//# sourceMappingURL=index.d.ts.map