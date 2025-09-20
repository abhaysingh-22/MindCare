import { Download, Smartphone, Apple, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const GetApp = () => {
  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-primary to-secondary text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <Download className="w-20 h-20 mx-auto mb-8 opacity-90" />
            
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              Download{" "}
              <span className="bg-gradient-to-r from-white to-primary-glow bg-clip-text text-transparent">
                MindCare
              </span>
            </h1>
            
            <p className="text-xl mb-12 leading-relaxed opacity-90">
              Take the first step towards better mental health. Download our app and 
              start your personalized journey to emotional wellness today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                variant="hero"
                className="flex items-center space-x-3 text-lg px-8 py-6"
              >
                <Apple className="w-6 h-6" />
                <div className="text-left">
                  <div className="text-xs opacity-75">Download on the</div>
                  <div className="font-bold">App Store</div>
                </div>
              </Button>
              
              <Button 
                size="lg" 
                variant="hero"
                className="flex items-center space-x-3 text-lg px-8 py-6"
              >
                <PlayCircle className="w-6 h-6" />
                <div className="text-left">
                  <div className="text-xs opacity-75">Get it on</div>
                  <div className="font-bold">Google Play</div>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* App Features Preview */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-16">What You'll Get</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-8 rounded-2xl bg-card shadow-soft">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Smartphone className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-4">Mobile-First Design</h3>
                <p className="text-muted-foreground">
                  Optimized for your phone with an intuitive interface that makes mental health care effortless
                </p>
              </div>
              
              <div className="text-center p-8 rounded-2xl bg-card shadow-soft">
                <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Download className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-xl font-bold mb-4">Offline Support</h3>
                <p className="text-muted-foreground">
                  Access key features even without internet connection for support anywhere, anytime
                </p>
              </div>
              
              <div className="text-center p-8 rounded-2xl bg-card shadow-soft">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <PlayCircle className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-4">Regular Updates</h3>
                <p className="text-muted-foreground">
                  Continuous improvements and new features based on latest mental health research
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* System Requirements */}
      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">System Requirements</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-card rounded-2xl p-8 shadow-soft">
                <Apple className="w-12 h-12 text-primary mb-6" />
                <h3 className="text-2xl font-bold mb-4">iOS Requirements</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• iOS 14.0 or later</li>
                  <li>• iPhone 8 or newer</li>
                  <li>• 100MB free storage</li>
                  <li>• Microphone access for voice features</li>
                </ul>
              </div>
              
              <div className="bg-card rounded-2xl p-8 shadow-soft">
                <PlayCircle className="w-12 h-12 text-secondary mb-6" />
                <h3 className="text-2xl font-bold mb-4">Android Requirements</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Android 8.0 or later</li>
                  <li>• 3GB RAM minimum</li>
                  <li>• 100MB free storage</li>
                  <li>• Microphone access for voice features</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Notice */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-8">Your Privacy Matters</h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              All your mental health data is encrypted end-to-end and stored securely. 
              We never share your personal information with third parties. You're in 
              complete control of your data, always.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GetApp;