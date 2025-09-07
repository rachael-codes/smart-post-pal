import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Calendar,
  Instagram,
  Twitter,
  Linkedin,
  Facebook,
  Music,
  Youtube,
  MoreVertical
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CreatePostDialog } from './CreatePostDialog';
import { PublishPostButton } from './PublishPostButton';

interface Post {
  id: string;
  title: string;
  content: string;
  scheduled_at: string;
  status: string;
  platform: {
    name: string;
    color: string;
    icon: string;
  };
  hashtags: string[];
  created_at: string;
}

const platformIcons = {
  instagram: Instagram,
  twitter: Twitter,
  linkedin: Linkedin,
  facebook: Facebook,
  music: Music,
  youtube: Youtube,
};

const statusColors = {
  draft: 'bg-muted text-muted-foreground',
  scheduled: 'bg-secondary text-secondary-foreground',
  published: 'bg-success text-success-foreground',
  failed: 'bg-destructive text-destructive-foreground',
};

export const PostManager = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
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
          hashtags,
          created_at,
          platforms:platform_id (
            name,
            color,
            icon
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

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

  const handleDeletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      setPosts(posts.filter(post => post.id !== postId));
      toast({
        title: "Post deleted",
        description: "The post has been successfully deleted.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting post",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-semibold">Post Manager</h2>
          <p className="text-sm lg:text-base text-muted-foreground">Manage your scheduled and published posts</p>
        </div>
        <CreatePostDialog onPostCreated={fetchPosts} />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-md border bg-background text-foreground w-full sm:w-auto"
        >
          <option value="all">All Status</option>
          <option value="draft">Drafts</option>
          <option value="scheduled">Scheduled</option>
          <option value="published">Published</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                {posts.length === 0 ? "No posts created yet." : "No posts match your filters."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredPosts.map((post) => {
            const IconComponent = platformIcons[post.platform.icon as keyof typeof platformIcons];
            
            return (
              <Card key={post.id}>
                <CardContent className="p-4 lg:p-6">
                  <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
                    <div className="flex items-start gap-3 lg:gap-4 flex-1 w-full">
                      {/* Platform Icon */}
                      <div className="p-2 rounded-lg bg-muted flex-shrink-0">
                        {IconComponent && <IconComponent className="h-4 w-4 lg:h-5 lg:w-5" />}
                      </div>
                      
                      {/* Post Content */}
                      <div className="flex-1 space-y-2 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <h3 className="font-semibold text-sm lg:text-base truncate">
                            {post.title || 'Untitled Post'}
                          </h3>
                          <Badge className={`${statusColors[post.status as keyof typeof statusColors]} text-xs flex-shrink-0`}>
                            {post.status}
                          </Badge>
                        </div>
                        
                        <p className="text-muted-foreground text-xs lg:text-sm line-clamp-2">
                          {post.content}
                        </p>
                        
                        {/* Hashtags */}
                        {post.hashtags && post.hashtags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {post.hashtags.slice(0, 2).map((hashtag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                #{hashtag}
                              </Badge>
                            ))}
                            {post.hashtags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{post.hashtags.length - 2} more
                              </Badge>
                            )}
                          </div>
                        )}
                        
                        {/* Metadata */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-muted-foreground">
                          <span className="truncate">Platform: {post.platform.name}</span>
                          {post.scheduled_at && (
                            <span className="truncate">
                              Scheduled: {new Date(post.scheduled_at).toLocaleDateString()}
                            </span>
                          )}
                          <span className="truncate">
                            Created: {new Date(post.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        
                        {/* Publish Button */}
                        {(post.status === 'draft' || post.status === 'scheduled') && (
                          <div className="mt-3">
                            <PublishPostButton
                              postId={post.id}
                              platform={post.platform.name}
                              content={post.content}
                              hashtags={post.hashtags}
                              onPublished={fetchPosts}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex-shrink-0 self-start lg:self-auto">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Calendar className="h-4 w-4 mr-2" />
                            Reschedule
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDeletePost(post.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};