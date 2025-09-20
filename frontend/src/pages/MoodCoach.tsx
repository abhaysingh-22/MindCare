import { Heart, Music, Video, Headphones, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { MusicPlayer } from "@/components/MusicPlayer";

const MoodCoach = () => {
  const [showPlayer, setShowPlayer] = useState(false);
  const [currentMood, setCurrentMood] = useState<string>('calm');
  const [tracks, setTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Sample tracks for demonstration
  const sampleTracks = [
    {
      id: 1,
      title: "Peaceful Morning",
      artist: "Nature Sounds",
      album: "Calm Vibes",
      duration: 180,
      preview_url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
      mood_tags: ["calm", "peaceful", "relaxing"],
      energy_level: 3
    },
    {
      id: 2,
      title: "Uplifting Melody",
      artist: "Happy Tunes",
      album: "Good Vibes Only",
      duration: 210,
      preview_url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
      mood_tags: ["happy", "upbeat", "energetic"],
      energy_level: 7
    }
  ];

  const handleStartMoodCoaching = async () => {
    setIsLoading(true);
    
    try {
      // In a real app, this would call your backend API
      // For demo purposes, we'll use sample data
      setTimeout(() => {
        setTracks(sampleTracks);
        setShowPlayer(true);
        setIsLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error loading music:', error);
      setIsLoading(false);
    }
  };

  const handleTrackEnd = (trackId: number, rating: number) => {
    console.log(`Track ${trackId} ended with rating: ${rating}`);
    // Here you would send feedback to your backend
  };

  const handleMoodChange = (newMood: number) => {
    console.log(`Mood changed to: ${newMood}`);
    // Here you would update the user's mood and potentially get new recommendations
  };

  if (showPlayer) {
    return (
      <div className="min-h-screen pt-16 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4">
                Your Personal Mood Coach
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                We detected you might benefit from some {currentMood} music. 
                Let's improve your mood together.
              </p>
              <Button 
                variant="outline" 
                onClick={() => setShowPlayer(false)}
                className="mb-8"
              >
                ← Back to Overview
              </Button>
            </div>
            
            <MusicPlayer
              tracks={tracks}
              currentMood={currentMood}
              onTrackEnd={handleTrackEnd}
              onMoodChange={handleMoodChange}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-8">
              <Heart className="w-10 h-10 text-primary" />
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 text-foreground">
              Your Personal{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Mood Coach
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              AI-powered recommendations tailored to your current emotional state. 
              Get the perfect playlist for your feelings.
            </p>
            
            <div className="flex gap-4 justify-center">
              <Button size="lg" onClick={handleStartMoodCoaching} disabled={isLoading}>
                <Play className="w-4 h-4 mr-2" />
                {isLoading ? 'Loading Music...' : 'Start Mood Coaching'}
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/get-app">Download App</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-8 rounded-2xl bg-card shadow-soft">
                <Music className="w-12 h-12 text-primary mx-auto mb-6" />
                <h3 className="text-xl font-bold mb-4">Curated Music</h3>
                <p className="text-muted-foreground">
                  Personalized playlists that match and enhance your current mood
                </p>
              </div>
              
              <div className="text-center p-8 rounded-2xl bg-card shadow-soft">
                <Video className="w-12 h-12 text-secondary mx-auto mb-6" />
                <h3 className="text-xl font-bold mb-4">Guided Videos</h3>
                <p className="text-muted-foreground">
                  Short videos for meditation, breathing exercises, and motivation
                </p>
              </div>
              
              <div className="text-center p-8 rounded-2xl bg-card shadow-soft">
                <Headphones className="w-12 h-12 text-primary mx-auto mb-6" />
                <h3 className="text-xl font-bold mb-4">Mindfulness Exercises</h3>
                <p className="text-muted-foreground">
                  Audio-guided sessions for relaxation and emotional balance
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-8">
              Experience Mood-Based Music
            </h2>
            <p className="text-xl text-muted-foreground mb-12">
              Try our AI-powered mood detection and music curation system. 
              We'll analyze your current state and provide perfect music recommendations.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="p-6 bg-card rounded-2xl shadow-soft">
                <h3 className="text-lg font-bold mb-4">Automatic Detection</h3>
                <p className="text-muted-foreground mb-4">
                  Our system automatically detects when you might need mood support 
                  and provides appropriate music recommendations.
                </p>
                <Button variant="outline" onClick={handleStartMoodCoaching} disabled={isLoading}>
                  Try Auto-Detection
                </Button>
              </div>
              
              <div className="p-6 bg-card rounded-2xl shadow-soft">
                <h3 className="text-lg font-bold mb-4">Manual Selection</h3>
                <p className="text-muted-foreground mb-4">
                  Choose your current mood and get curated playlists designed 
                  to enhance or transform your emotional state.
                </p>
                <Button variant="outline" onClick={handleStartMoodCoaching} disabled={isLoading}>
                  Choose Mood Manually
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-primary to-secondary">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-8">
            Ready to Feel Better?
          </h2>
          <Button size="lg" variant="hero" asChild>
            <Link to="/get-app">Download Now</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default MoodCoach;