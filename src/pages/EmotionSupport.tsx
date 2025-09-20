import { Shield, Mic, Bell, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const EmotionSupport = () => {
  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-primary/10 to-warm/20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-8">
              <Shield className="w-10 h-10 text-primary" />
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 text-foreground">
              Real-time{" "}
              <span className="bg-gradient-to-r from-primary to-warm bg-clip-text text-transparent">
                Emotion Support
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Proactive emotional support that detects stress and provides instant, 
              gentle guidance when you need it most.
            </p>
            
            <Button size="lg" asChild>
              <Link to="/get-app">Get Support Now</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-16">How It Protects You</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-8 rounded-2xl bg-card shadow-soft">
                <Mic className="w-12 h-12 text-primary mx-auto mb-6" />
                <h3 className="text-xl font-bold mb-4">Voice Detection</h3>
                <p className="text-muted-foreground">
                  Advanced AI analyzes speech patterns to detect stress, anger, or emotional distress
                </p>
              </div>
              
              <div className="text-center p-8 rounded-2xl bg-card shadow-soft">
                <Bell className="w-12 h-12 text-warm mx-auto mb-6" />
                <h3 className="text-xl font-bold mb-4">Instant Alerts</h3>
                <p className="text-muted-foreground">
                  Receive gentle notifications with personalized calming techniques and breathing exercises
                </p>
              </div>
              
              <div className="text-center p-8 rounded-2xl bg-card shadow-soft">
                <Heart className="w-12 h-12 text-secondary mx-auto mb-6" />
                <h3 className="text-xl font-bold mb-4">Gentle Guidance</h3>
                <p className="text-muted-foreground">
                  Compassionate prompts and exercises designed to help you regain emotional balance
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support Features */}
      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">Available Support</h2>
            
            <div className="space-y-8">
              <div className="flex items-start space-x-6 p-6 bg-card rounded-2xl shadow-soft">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Crisis Intervention</h3>
                  <p className="text-muted-foreground">
                    Immediate support and resources when emotional distress reaches critical levels, 
                    including emergency contact suggestions.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-6 p-6 bg-card rounded-2xl shadow-soft">
                <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Stress Management</h3>
                  <p className="text-muted-foreground">
                    Personalized breathing exercises, progressive muscle relaxation, and mindfulness techniques 
                    delivered exactly when you need them.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-6 p-6 bg-card rounded-2xl shadow-soft">
                <div className="w-12 h-12 bg-warm/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bell className="w-6 h-6 text-warm" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Preventive Care</h3>
                  <p className="text-muted-foreground">
                    Early warning system that helps you recognize emotional patterns before they escalate, 
                    promoting long-term emotional wellness.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EmotionSupport;