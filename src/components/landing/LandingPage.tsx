import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Bot, 
  BarChart3, 
  Bell, 
  Zap, 
  Users, 
  Clock, 
  Target,
  CheckCircle,
  ArrowRight,
  Star,
  Sparkles
} from 'lucide-react';
import { AuthDialog } from './AuthDialog';

export const LandingPage = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');

  const features = [
    {
      icon: Calendar,
      title: "Smart Content Calendar",
      description: "Plan and visualize your social media content across all platforms with our intuitive calendar interface."
    },
    {
      icon: Bot,
      title: "AI Content Generator",
      description: "Create engaging posts instantly with AI-powered content suggestions tailored to your brand voice."
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Track performance, discover optimal posting times, and get actionable insights to grow your audience."
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Never miss a post with intelligent reminders and real-time notifications with sound alerts."
    },
    {
      icon: Zap,
      title: "One-Click Publishing",
      description: "Publish to multiple social platforms simultaneously with just one click."
    },
    {
      icon: Clock,
      title: "Precise Scheduling",
      description: "Schedule posts down to the exact minute for optimal engagement timing."
    }
  ];

  const stats = [
    { value: "10K+", label: "Active Users" },
    { value: "1M+", label: "Posts Scheduled" },
    { value: "500+", label: "Brands Trust Us" },
    { value: "99.9%", label: "Uptime" }
  ];

  const testimonials = [
      {
        name: "Sarah Johnson",
        role: "Marketing Director", 
        company: "TechStart Inc.",
        content: "SmartPost AI has transformed our social media workflow. The AI content generator saves us hours every week.",
        rating: 5
      },
      {
        name: "Mike Chen",
        role: "Social Media Manager",
        company: "GrowthCo", 
        content: "The analytics insights helped us increase our engagement by 300%. Best investment we've made!",
        rating: 5
      },
      {
        name: "Emily Rodriguez",
        role: "Content Creator",
        company: "Creative Studio",
        content: "Finally, a tool that understands creators. The scheduling is precise and the notifications are perfect.",
        rating: 5
      }
  ];

  const handleAuthClick = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setShowAuth(true);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        {/* Header */}
        <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary text-primary-foreground">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xl font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">SmartPost AI</span>
                <span className="hidden sm:inline text-xs text-muted-foreground ml-2">Social Media Scheduler</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => handleAuthClick('signin')}
              >
                Sign In
              </Button>
              <Button onClick={() => handleAuthClick('signup')}>
                Get Started Free
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-6 py-20 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <Badge variant="secondary" className="text-sm px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Social Media Management
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Manage All Your
              <span className="text-primary"> Social Media </span>
              in One Place
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Schedule posts, generate AI content, track analytics, and never miss a posting opportunity. 
              The complete social media management platform powered by intelligent automation.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6"
                onClick={() => handleAuthClick('signup')}
              >
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-6"
              >
                Watch Demo
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-y bg-muted/30 py-16">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {stats.map((stat, index) => (
                <div key={index} className="space-y-2">
                  <div className="text-3xl font-bold text-primary">{stat.value}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything You Need to Succeed</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to streamline your social media workflow and maximize your reach.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-primary/20 transition-all duration-300 hover:shadow-lg">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="bg-muted/30 py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Loved by Creators Worldwide</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See what our users have to say about their experience with SmartPost AI.
            </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex gap-1">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-muted-foreground italic">"{testimonial.content}"</p>
                    <div className="space-y-1">
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role} at {testimonial.company}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 py-20 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl font-bold">Ready to Transform Your Social Media?</h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of creators and businesses who trust SmartPost AI to manage their social media presence.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6"
                onClick={() => handleAuthClick('signup')}
              >
                Start Your Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
            
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                14-day free trial
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                No credit card required
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Cancel anytime
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t bg-muted/30 py-12">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-primary text-primary-foreground">
                  <Zap className="w-4 h-4" />
                </div>
                <span className="font-semibold">SmartPost AI</span>
              </div>
              
              <div className="text-sm text-muted-foreground">
                © 2024 SmartPost AI. All rights reserved.
              </div>
            </div>
          </div>
        </footer>
      </div>

      <AuthDialog 
        open={showAuth} 
        onOpenChange={setShowAuth}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </>
  );
};