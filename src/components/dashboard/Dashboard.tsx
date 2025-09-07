import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { ContentCalendar } from './ContentCalendar';
import { AIGenerator } from './AIGenerator';
import { PostManager } from './PostManager';
import { TemplateManager } from './TemplateManager';
import { Analytics } from './Analytics';
import { Settings } from './Settings';
import { NotificationBanner } from './NotificationBanner';
import { SubscriptionCard } from './SubscriptionCard';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationService } from '@/hooks/useNotificationService';
import { Button } from '@/components/ui/button';
import { LogOut, User, Menu, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type DashboardView = 'calendar' | 'generator' | 'posts' | 'templates' | 'analytics' | 'settings' | 'subscription';

export const Dashboard = () => {
  const [activeView, setActiveView] = useState<DashboardView>('calendar');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  
  // Initialize notification service
  useNotificationService();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'calendar':
        return <ContentCalendar />;
      case 'generator':
        return <AIGenerator />;
      case 'posts':
        return <PostManager />;
      case 'templates':
        return <TemplateManager />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      case 'subscription':
        return <SubscriptionCard />;
      default:
        return <ContentCalendar />;
    }
  };

  const handleViewChange = (view: DashboardView) => {
    setActiveView(view);
    setIsMobileMenuOpen(false); // Close mobile menu when view changes
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar activeView={activeView} onViewChange={handleViewChange} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed left-0 top-0 bottom-0 z-50 lg:hidden">
            <Sidebar activeView={activeView} onViewChange={handleViewChange} />
          </div>
        </>
      )}
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b bg-card px-4 lg:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            
            <h1 className="text-lg lg:text-2xl font-semibold text-foreground truncate">
              {activeView === 'calendar' && 'Content Calendar'}
              {activeView === 'generator' && 'AI Generator'}
              {activeView === 'posts' && 'Posts'}
              {activeView === 'templates' && 'Templates'}
              {activeView === 'analytics' && 'Analytics'}
              {activeView === 'settings' && 'Settings'}
              {activeView === 'subscription' && 'Subscription'}
            </h1>
          </div>
          
          <div className="flex items-center gap-2 lg:gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span className="hidden md:inline">{user?.email}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Sign Out</span>
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 lg:p-6">
            <NotificationBanner />
            <div className="mt-4">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};