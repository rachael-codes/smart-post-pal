import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Calendar, 
  Sparkles, 
  FileText, 
  BookTemplate,
  BarChart3, 
  Settings,
  Zap
} from 'lucide-react';

type DashboardView = 'calendar' | 'generator' | 'posts' | 'templates' | 'analytics' | 'settings';

interface SidebarProps {
  activeView: DashboardView;
  onViewChange: (view: DashboardView) => void;
}

const navigation: Array<{ id: DashboardView; label: string; icon: any }> = [
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'generator', label: 'AI Generator', icon: Sparkles },
  { id: 'posts', label: 'Posts', icon: FileText },
  { id: 'templates', label: 'Templates', icon: BookTemplate },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar = ({ activeView, onViewChange }: SidebarProps) => {
  return (
    <div className="w-64 bg-card border-r flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary text-primary-foreground">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              SmartPost AI
            </h2>
            <p className="text-xs text-muted-foreground">Social Media Scheduler</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3",
                isActive && "bg-primary text-primary-foreground"
              )}
              onClick={() => onViewChange(item.id)}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      {/* Upgrade Section */}
      <div className="p-4 border-t">
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4 text-center">
          <Sparkles className="h-8 w-8 text-primary mx-auto mb-2" />
          <h3 className="font-semibold text-sm mb-1">Upgrade to Pro</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Unlock unlimited AI generations and advanced analytics
          </p>
          <Button size="sm" className="w-full">
            Upgrade Now
          </Button>
        </div>
      </div>
    </div>
  );
};