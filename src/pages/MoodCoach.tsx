import { Heart, Music, Video, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const MoodCoach = () => {
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
            
            <Button size="lg" asChild>
              <Link to="/get-app">Start Your Journey</Link>
            </Button>
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