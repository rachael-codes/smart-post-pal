import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Instagram, Twitter, Linkedin, Facebook, Music, Youtube, FileText, CheckCircle, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: {
    'en-US': enUS,
  },
});

interface Post {
  id: string;
  title: string;
  content: string;
  scheduled_at: string;
  platform: {
    name: string;
    color: string;
    icon: string;
  };
  status: string;
}

const platformIcons = {
  instagram: Instagram,
  twitter: Twitter,
  linkedin: Linkedin,
  facebook: Facebook,
  music: Music,
  youtube: Youtube,
};

export const ContentCalendar = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user]);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          content,
          scheduled_at,
          status,
          platforms:platform_id (
            name,
            color,
            icon
          )
        `)
        .eq('user_id', user?.id)
        .order('scheduled_at', { ascending: true });

      if (error) throw error;

      setPosts(data?.map(post => ({
        ...post,
        platform: post.platforms
      })) || []);
    } catch (error: any) {
      toast({
        title: "Error loading posts",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calendarEvents = posts.map(post => ({
    id: post.id,
    title: post.title || 'Untitled Post',
    start: new Date(post.scheduled_at),
    end: new Date(post.scheduled_at),
    resource: post,
  }));

  const EventComponent = ({ event }: any) => {
    const post = event.resource;
    const IconComponent = platformIcons[post.platform.icon as keyof typeof platformIcons];
    
    return (
      <div className="flex items-center gap-1 text-xs p-1">
        {IconComponent && <IconComponent className="h-3 w-3" />}
        <span className="truncate">{event.title}</span>
      </div>
    );
  };

  const handleSelectSlot = ({ start }: any) => {
    // Open post creation modal with selected date
    console.log('Selected slot:', start);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Content Calendar</h2>
          <p className="text-muted-foreground">Plan and schedule your social media posts</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Post
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Posts</p>
                <p className="text-2xl font-semibold">{posts.length}</p>
              </div>
              <div className="p-2 rounded-full bg-primary/10">
                <FileText className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-semibold">
                  {posts.filter(p => p.status === 'scheduled').length}
                </p>
              </div>
              <div className="p-2 rounded-full bg-secondary/10">
                <Calendar className="h-4 w-4 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Published</p>
                <p className="text-2xl font-semibold">
                  {posts.filter(p => p.status === 'published').length}
                </p>
              </div>
              <div className="p-2 rounded-full bg-success/10">
                <CheckCircle className="h-4 w-4 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Drafts</p>
                <p className="text-2xl font-semibold">
                  {posts.filter(p => p.status === 'draft').length}
                </p>
              </div>
              <div className="p-2 rounded-full bg-muted/50">
                <Edit className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar */}
      <Card>
        <CardContent className="p-6">
          <div style={{ height: '600px' }}>
            <Calendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              onSelectSlot={handleSelectSlot}
              selectable
              components={{
                event: EventComponent,
              }}
              style={{ height: '100%' }}
              className="rounded-lg"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};