import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Heart, Share2 } from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';

interface Track {
  id: number;
  title: string;
  artist: string;
  album?: string;
  duration?: number;
  preview_url?: string;
  spotify_id?: string;
  youtube_id?: string;
  mood_tags: string[];
  energy_level: number;
}

interface MusicPlayerProps {
  tracks: Track[];
  currentMood: string;
  onTrackEnd?: (trackId: number, rating: number) => void;
  onMoodChange?: (newMood: number) => void;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  tracks,
  currentMood,
  onTrackEnd,
  onMoodChange
}) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState([70]);
  const [moodRating, setMoodRating] = useState(5);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressInterval = useRef<NodeJS.Timeout>();

  const currentTrack = tracks[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0] / 100;
    }
  }, [volume]);

  useEffect(() => {
    if (isPlaying) {
      startProgressTracking();
    } else {
      stopProgressTracking();
    }

    return () => stopProgressTracking();
  }, [isPlaying]);

  const startProgressTracking = () => {
    progressInterval.current = setInterval(() => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
        setDuration(audioRef.current.duration || 0);
      }
    }, 1000);
  };

  const stopProgressTracking = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
  };

  const handlePlayPause = () => {
    if (!audioRef.current || !currentTrack?.preview_url) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  const handleNextTrack = () => {
    if (currentTrackIndex < tracks.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
      setCurrentTime(0);
      setIsPlaying(false);
    }
  };

  const handlePreviousTrack = () => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1);
      setCurrentTime(0);
      setIsPlaying(false);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      const newTime = (value[0] / 100) * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleTrackEnd = () => {
    setIsPlaying(false);
    
    // Call the callback with track feedback
    if (onTrackEnd && currentTrack) {
      onTrackEnd(currentTrack.id, moodRating);
    }

    // Auto-advance to next track
    if (currentTrackIndex < tracks.length - 1) {
      setTimeout(() => {
        handleNextTrack();
      }, 1000);
    }
  };

  const handleMoodRatingChange = (rating: number) => {
    setMoodRating(rating);
    if (onMoodChange) {
      onMoodChange(rating);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getEnergyColor = (level: number): string => {
    if (level <= 3) return 'bg-blue-500';
    if (level <= 6) return 'bg-green-500';
    return 'bg-red-500';
  };

  if (!tracks.length) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No tracks available for your current mood.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Try adjusting your music preferences or mood settings.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Current Track Info */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <h3 className="text-xl font-bold">{currentTrack?.title}</h3>
              <p className="text-muted-foreground">{currentTrack?.artist}</p>
              {currentTrack?.album && (
                <p className="text-sm text-muted-foreground">{currentTrack.album}</p>
              )}
            </div>

            {/* Mood Tags */}
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="secondary" className="capitalize">
                {currentMood}
              </Badge>
              {currentTrack?.mood_tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              <Badge 
                className={`text-white ${getEnergyColor(currentTrack?.energy_level || 5)}`}
              >
                Energy: {currentTrack?.energy_level || 5}/10
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Music Player Controls */}
      <Card>
        <CardContent className="p-6">
          {/* Audio Element */}
          {currentTrack?.preview_url && (
            <audio
              ref={audioRef}
              src={currentTrack.preview_url}
              onEnded={handleTrackEnd}
              onLoadedMetadata={() => {
                if (audioRef.current) {
                  setDuration(audioRef.current.duration);
                }
              }}
            />
          )}

          {/* Progress Bar */}
          <div className="space-y-2 mb-6">
            <Slider
              value={[duration ? (currentTime / duration) * 100 : 0]}
              onValueChange={handleSeek}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePreviousTrack}
              disabled={currentTrackIndex === 0}
            >
              <SkipBack className="h-5 w-5" />
            </Button>

            <Button
              size="icon"
              onClick={handlePlayPause}
              disabled={!currentTrack?.preview_url}
              className="h-12 w-12"
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextTrack}
              disabled={currentTrackIndex === tracks.length - 1}
            >
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-3 mb-6">
            <Volume2 className="h-4 w-4" />
            <Slider
              value={volume}
              onValueChange={setVolume}
              max={100}
              step={1}
              className="flex-1"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-2">
            <Button variant="ghost" size="sm">
              <Heart className="h-4 w-4 mr-2" />
              Like
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Mood Feedback */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h4 className="font-medium">How is this music making you feel?</h4>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                <Button
                  key={rating}
                  variant={moodRating === rating ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleMoodRatingChange(rating)}
                  className="w-8 h-8 p-0"
                >
                  {rating}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              1 = Much worse • 5 = No change • 10 = Much better
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Playlist */}
      <Card>
        <CardContent className="p-6">
          <h4 className="font-medium mb-4">Your {currentMood} Playlist</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {tracks.map((track, index) => (
              <div
                key={track.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  index === currentTrackIndex
                    ? 'bg-primary/10 border border-primary/20'
                    : 'bg-muted/50 hover:bg-muted'
                }`}
                onClick={() => {
                  setCurrentTrackIndex(index);
                  setCurrentTime(0);
                  setIsPlaying(false);
                }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{track.title}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {track.artist}
                    </p>
                  </div>
                  <div className="flex gap-1 ml-2">
                    {index === currentTrackIndex && isPlaying && (
                      <div className="flex items-center gap-1">
                        <div className="w-1 h-3 bg-primary animate-pulse rounded"></div>
                        <div className="w-1 h-2 bg-primary animate-pulse rounded" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-1 h-4 bg-primary animate-pulse rounded" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};