import { BarChart3, TrendingUp, Calendar, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-8">
              <BarChart3 className="w-10 h-10 text-primary" />
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 text-foreground">
              Your Personal{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Dashboard
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Track your emotional journey, understand patterns, and celebrate your progress 
              with beautiful visualizations and insights.
            </p>
            
            <Button size="lg" asChild>
              <Link to="/get-app">View Your Dashboard</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Dashboard Features */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-16">Dashboard Features</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-8 rounded-2xl bg-card shadow-soft hover-lift">
                <TrendingUp className="w-12 h-12 text-primary mb-6" />
                <h3 className="text-2xl font-bold mb-4">Mood Trends</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Visualize your emotional patterns over time with beautiful charts and graphs. 
                  Identify what activities and environments boost your wellbeing.
                </p>
              </div>
              
              <div className="p-8 rounded-2xl bg-card shadow-soft hover-lift">
                <Calendar className="w-12 h-12 text-secondary mb-6" />
                <h3 className="text-2xl font-bold mb-4">Activity Calendar</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Track your daily mental health activities, meditation sessions, and mood check-ins 
                  in an intuitive calendar view.
                </p>
              </div>
              
              <div className="p-8 rounded-2xl bg-card shadow-soft hover-lift">
                <Target className="w-12 h-12 text-primary mb-6" />
                <h3 className="text-2xl font-bold mb-4">Goal Progress</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Monitor your progress towards mental health goals with clear metrics and 
                  milestone celebrations that keep you motivated.
                </p>
              </div>
              
              <div className="p-8 rounded-2xl bg-card shadow-soft hover-lift">
                <BarChart3 className="w-12 h-12 text-secondary mb-6" />
                <h3 className="text-2xl font-bold mb-4">Insights & Analytics</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Receive personalized insights about your emotional patterns and suggestions 
                  for improving your mental wellness routine.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sample Dashboard Preview */}
      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-8">Preview Your Journey</h2>
            <p className="text-xl text-muted-foreground mb-12">
              See how tracking your mental health becomes a beautiful, empowering experience
            </p>
            
            {/* Mock dashboard elements */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-card rounded-xl p-6 shadow-soft">
                <div className="text-3xl font-bold text-primary mb-2">7</div>
                <div className="text-sm text-muted-foreground">Day Streak</div>
              </div>
              
              <div className="bg-card rounded-xl p-6 shadow-soft">
                <div className="text-3xl font-bold text-secondary mb-2">85%</div>
                <div className="text-sm text-muted-foreground">Mood Improvement</div>
              </div>
              
              <div className="bg-card rounded-xl p-6 shadow-soft">
                <div className="text-3xl font-bold text-primary mb-2">12</div>
                <div className="text-sm text-muted-foreground">Goals Achieved</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;