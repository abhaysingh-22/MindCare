import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-app-mockup.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 hero-gradient opacity-90" />
      
      {/* Floating elements for ambiance */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-float" />
      <div className="absolute bottom-32 right-16 w-16 h-16 bg-white/5 rounded-full animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/3 right-20 w-12 h-12 bg-white/8 rounded-full animate-float" style={{ animationDelay: '2s' }} />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-5xl lg:text-7xl font-bold mb-6 text-white leading-tight fade-up">
                Your AI Companion for a{" "}
                <span className="bg-gradient-to-r from-white to-primary-glow bg-clip-text text-transparent">
                  Calmer Mind
                </span>
              </h1>
              
              <p className="text-xl lg:text-2xl mb-8 text-white/90 leading-relaxed fade-up" style={{ animationDelay: '0.2s' }}>
                Proactive, personalized support that helps you feel your best, every day.
              </p>
              
              <div className="fade-up" style={{ animationDelay: '0.4s' }}>
                <Button 
                  size="lg" 
                  variant="hero"
                  className="text-xl px-12 py-6 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 hover:scale-105 transition-all duration-300 glow-on-hover"
                  asChild
                >
                  <Link to="/get-app">Get the App</Link>
                </Button>
              </div>
            </div>
            
            {/* App mockup */}
            <div className="flex justify-center lg:justify-end fade-up" style={{ animationDelay: '0.6s' }}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-glow to-secondary rounded-2xl blur-2xl opacity-30 scale-110" />
                <img 
                  src={heroImage} 
                  alt="Mental Health Companion App Interface"
                  className="relative rounded-2xl shadow-2xl hover-lift w-full max-w-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;