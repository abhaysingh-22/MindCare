import { Gamepad2, Trophy, Target, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const ResilienceTraining = () => {
  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-secondary/10 to-primary/10">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-8">
              <Gamepad2 className="w-10 h-10 text-secondary" />
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 text-foreground">
              Gamified{" "}
              <span className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                Resilience Training
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Build mental strength through fun mini-games, challenges, and habit-forming activities.
              Level up your emotional resilience!
            </p>
            
            <Button size="lg" asChild>
              <Link to="/get-app">Start Playing</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Game Features */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-16">Game Features</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center p-6 rounded-2xl bg-card shadow-soft hover-lift">
                <Trophy className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2">Achievements</h3>
                <p className="text-muted-foreground text-sm">
                  Unlock badges for completing challenges
                </p>
              </div>
              
              <div className="text-center p-6 rounded-2xl bg-card shadow-soft hover-lift">
                <Target className="w-12 h-12 text-secondary mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2">Daily Goals</h3>
                <p className="text-muted-foreground text-sm">
                  Complete personalized daily objectives
                </p>
              </div>
              
              <div className="text-center p-6 rounded-2xl bg-card shadow-soft hover-lift">
                <Star className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2">Streak System</h3>
                <p className="text-muted-foreground text-sm">
                  Maintain consistency with streak rewards
                </p>
              </div>
              
              <div className="text-center p-6 rounded-2xl bg-card shadow-soft hover-lift">
                <Gamepad2 className="w-12 h-12 text-secondary mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2">Mini Games</h3>
                <p className="text-muted-foreground text-sm">
                  Fun activities that build patience
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sample Games */}
      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-12">Sample Training Games</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-card rounded-2xl p-8 shadow-soft">
                <h3 className="text-xl font-bold mb-4">Patience Puzzles</h3>
                <p className="text-muted-foreground">
                  Solve increasingly complex puzzles that require patience and persistence. 
                  Perfect for building frustration tolerance.
                </p>
              </div>
              
              <div className="bg-card rounded-2xl p-8 shadow-soft">
                <h3 className="text-xl font-bold mb-4">Gratitude Challenges</h3>
                <p className="text-muted-foreground">
                  Daily prompts and challenges to practice gratitude and positive thinking. 
                  Build lasting habits of appreciation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ResilienceTraining;