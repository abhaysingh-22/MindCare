import { Heart, Users, Shield, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 text-foreground">
              About{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                MindCare
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              We believe everyone deserves access to mental health support that's 
              personalized, proactive, and empowering.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-12">Our Mission</h2>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              To democratize mental health support through AI technology that understands, 
              adapts, and grows with each individual's unique emotional journey. We're not 
              just building an app – we're creating a compassionate companion that's available 
              24/7 to support your mental wellness.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-16">Our Values</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center p-6">
                <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Empathy</h3>
                <p className="text-muted-foreground text-sm">
                  Every interaction is designed with deep understanding and compassion
                </p>
              </div>
              
              <div className="text-center p-6">
                <Shield className="w-12 h-12 text-secondary mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Privacy</h3>
                <p className="text-muted-foreground text-sm">
                  Your emotional data is sacred and protected with the highest security
                </p>
              </div>
              
              <div className="text-center p-6">
                <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Accessibility</h3>
                <p className="text-muted-foreground text-sm">
                  Mental health support should be available to everyone, everywhere
                </p>
              </div>
              
              <div className="text-center p-6">
                <Award className="w-12 h-12 text-secondary mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Excellence</h3>
                <p className="text-muted-foreground text-sm">
                  Continuously improving through research and user feedback
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Story */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">Our Story</h2>
            
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="text-xl leading-relaxed mb-6">
                MindCare was born from the recognition that traditional mental health care, 
                while valuable, isn't always accessible when we need it most. Those 3 AM anxiety 
                moments, the sudden stress spikes during a busy day, or the gradual decline in 
                mood that we don't notice until it's overwhelming.
              </p>
              
              <p className="text-xl leading-relaxed mb-6">
                Our team of psychologists, AI researchers, and designers came together with a 
                shared vision: what if technology could provide the kind of understanding, 
                immediate support that we all deserve? What if our phones could become 
                instruments of healing rather than stress?
              </p>
              
              <p className="text-xl leading-relaxed">
                Today, MindCare serves thousands of users worldwide, helping them build 
                resilience, understand their emotions, and develop healthier relationships 
                with their mental health. Every feature is built with real user needs in mind, 
                tested with mental health professionals, and designed to complement, not replace, 
                traditional therapy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-primary to-secondary">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-8">
            Join Our Community
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Start your journey to better mental health today
          </p>
          <Button size="lg" variant="hero" asChild>
            <Link to="/get-app">Get Started</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default About;