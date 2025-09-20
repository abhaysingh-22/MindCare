import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: string;
}

const FeatureCard = ({ icon: Icon, title, description, delay = "0s" }: FeatureCardProps) => {
  return (
    <div 
      className="bg-card rounded-2xl p-8 shadow-soft hover-lift fade-up card-gradient"
      style={{ animationDelay: delay }}
    >
      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
        <Icon className="w-8 h-8 text-primary" />
      </div>
      
      <h3 className="text-2xl font-bold mb-4 text-card-foreground">
        {title}
      </h3>
      
      <p className="text-muted-foreground leading-relaxed text-lg">
        {description}
      </p>
    </div>
  );
};

export default FeatureCard;