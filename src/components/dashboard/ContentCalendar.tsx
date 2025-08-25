import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Plus, Instagram, Twitter, Linkedin, Facebook, Music, Youtube, FileText, CheckCircle, Edit, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth } from 'date-fns';

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
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
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

  const getPostsForDate = (date: Date) => {
    return posts.filter(post => 
      isSameDay(new Date(post.scheduled_at), date)
    );
  };

  const PostItem = ({ post }: { post: Post }) => {
    const IconComponent = platformIcons[post.platform?.icon as keyof typeof platformIcons];
    
    return (
      <div className="flex items-center gap-2 p-2 bg-primary/5 rounded-md mb-2">
        {IconComponent && <IconComponent className="h-4 w-4 text-primary" />}
        <div className="flex-1">
          <p className="text-sm font-medium truncate">{post.title || 'Untitled Post'}</p>
          <p className="text-xs text-muted-foreground">
            {format(new Date(post.scheduled_at), 'HH:mm')}
          </p>
        </div>
        <Badge variant={post.status === 'published' ? 'default' : 'secondary'} className="text-xs">
          {post.status}
        </Badge>
      </div>
    );
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
                <CalendarDays className="h-4 w-4 text-secondary" />
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Calendar View</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Posts for {format(selectedDate, 'MMM d, yyyy')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {getPostsForDate(selectedDate).length === 0 ? (
                <p className="text-muted-foreground text-sm">No posts scheduled for this date.</p>
              ) : (
                getPostsForDate(selectedDate).map(post => (
                  <PostItem key={post.id} post={post} />
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};