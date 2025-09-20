import { Heart, Gamepad2, Shield, BarChart3 } from "lucide-react";
import FeatureCard from "./FeatureCard";

const FeaturesSection = () => {
  const features = [
    {
      icon: Heart,
      title: "Personalized Uplift Engine",
      description: "Your AI Mood Coach provides curated music, videos, and mindfulness exercises tailored to your current mood. It's like having a personal playlist for your emotions.",
      delay: "0.1s"
    },
    {
      icon: Gamepad2,
      title: "Gamified Resilience Training",
      description: "Fun mini-games and quizzes that make building patience and positive habits easy. Earn streaks, badges, and points to stay motivated and consistent.",
      delay: "0.2s"
    },
    {
      icon: Shield,
      title: "Real-time Emotion Support",
      description: "Detect stress or anger from voice and receive instant, gentle calming prompts. A proactive way to manage difficult moments before they escalate.",
      delay: "0.3s"
    },
    {
      icon: BarChart3,
      title: "Your Personal Dashboard",
      description: "Visual tracking of mood trends and patterns over time, helping you gain emotional self-awareness and celebrate your progress.",
      delay: "0.4s"
    }
  ];

  return (
    <section className="py-24 calm-gradient">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-foreground fade-up">
              Features That{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Care for You
              </span>
            </h2>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed fade-up" style={{ animationDelay: '0.1s' }}>
              Discover how our AI companion transforms mental wellness into an engaging, personalized journey.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={feature.delay}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;