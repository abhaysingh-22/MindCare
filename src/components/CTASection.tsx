import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-primary to-secondary relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-white/5 rounded-full" />
      <div className="absolute bottom-16 right-20 w-24 h-24 bg-white/10 rounded-full" />
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/5 rounded-full" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-6xl font-bold mb-8 text-white leading-tight fade-up">
            Start Your Journey to a{" "}
            <span className="bg-gradient-to-r from-warm to-white bg-clip-text text-transparent">
              Happier You
            </span>
          </h2>
          
          <p className="text-xl lg:text-2xl mb-12 text-white/90 leading-relaxed max-w-2xl mx-auto fade-up" style={{ animationDelay: '0.2s' }}>
            Take the first step towards better mental health with your personal AI companion.
          </p>
          
          <div className="fade-up" style={{ animationDelay: '0.4s' }}>
            <Button 
              size="lg" 
              className="text-xl px-16 py-8 rounded-full bg-white text-primary hover:bg-white/90 hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl"
              asChild
            >
              <Link to="/get-app">Get the App</Link>
            </Button>
          </div>
          
          <p className="mt-8 text-white/70 fade-up" style={{ animationDelay: '0.6s' }}>
            Available on iOS and Android • Free to download
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;