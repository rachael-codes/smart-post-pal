import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { ContentCalendar } from './ContentCalendar';
import { AIGenerator } from './AIGenerator';
import { PostManager } from './PostManager';
import { Analytics } from './Analytics';
import { Settings } from './Settings';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type DashboardView = 'calendar' | 'generator' | 'posts' | 'analytics' | 'settings';

export const Dashboard = () => {
  const [activeView, setActiveView] = useState<DashboardView>('calendar');
  const { user, signOut } = useAuth();
  const { toast } = useToast();

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
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      default:
        return <ContentCalendar />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b bg-card px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-foreground">
            {activeView === 'calendar' && 'Content Calendar'}
            {activeView === 'generator' && 'AI Content Generator'}
            {activeView === 'posts' && 'Post Manager'}
            {activeView === 'analytics' && 'Analytics'}
            {activeView === 'settings' && 'Settings'}
          </h1>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{user?.email}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};