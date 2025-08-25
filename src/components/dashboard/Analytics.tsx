import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Target,
  Users,
  Heart,
  MessageCircle,
  Share2
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface AnalyticsData {
  totalPosts: number;
  scheduledPosts: number;
  publishedPosts: number;
  platformBreakdown: { platform: string; posts: number; name: string }[];
  monthlyData: { date: string; posts: number }[];
}

export const Analytics = () => {
  const [timeRange, setTimeRange] = useState('6months');
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalPosts: 0,
    scheduledPosts: 0,
    publishedPosts: 0,
    platformBreakdown: [],
    monthlyData: []
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      // Fetch all posts with platform data
      const { data: posts, error } = await supabase
        .from('posts')
        .select(`
          id,
          created_at,
          status,
          platforms:platform_id (
            name,
            color,
            icon
          )
        `)
        .eq('user_id', user?.id);

      if (error) throw error;

      if (!posts) {
        setLoading(false);
        return;
      }

      // Calculate analytics
      const totalPosts = posts.length;
      const scheduledPosts = posts.filter(p => p.status === 'scheduled').length;
      const publishedPosts = posts.filter(p => p.status === 'published').length;

      // Platform breakdown
      const platformCount: { [key: string]: { count: number; name: string } } = {};
      posts.forEach(post => {
        if (post.platforms) {
          const platformName = post.platforms.name;
          if (platformCount[platformName]) {
            platformCount[platformName].count++;
          } else {
            platformCount[platformName] = {
              count: 1,
              name: platformName
            };
          }
        }
      });

      const platformBreakdown = Object.entries(platformCount).map(([platform, data]) => ({
        platform,
        posts: data.count,
        name: data.name
      }));

      // Monthly data for last 6 months
      const monthlyCount: { [key: string]: number } = {};
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return date.toISOString().slice(0, 7); // YYYY-MM format
      }).reverse();

      // Initialize months with 0
      last6Months.forEach(month => {
        monthlyCount[month] = 0;
      });

      // Count posts by month
      posts.forEach(post => {
        const month = post.created_at.slice(0, 7);
        if (monthlyCount.hasOwnProperty(month)) {
          monthlyCount[month]++;
        }
      });

      const monthlyData = last6Months.map(month => ({
        date: month,
        posts: monthlyCount[month]
      }));

      setAnalytics({
        totalPosts,
        scheduledPosts,
        publishedPosts,
        platformBreakdown,
        monthlyData
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-muted rounded"></div>
            <div className="h-80 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold">Analytics Dashboard</h2>
        <p className="text-muted-foreground">Track your social media performance and engagement</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Posts</p>
                <p className="text-3xl font-bold">{analytics.totalPosts}</p>
                <div className="flex items-center mt-2 text-sm text-success">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +12% from last month
                </div>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Published Posts</p>
                <p className="text-3xl font-bold">{analytics.publishedPosts}</p>
                <div className="flex items-center mt-2 text-sm text-muted-foreground">
                  <Target className="h-4 w-4 mr-1" />
                  All time
                </div>
              </div>
              <div className="p-3 rounded-full bg-secondary/10">
                <Target className="h-6 w-6 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Draft Posts</p>
                <p className="text-3xl font-bold">{analytics.totalPosts - analytics.publishedPosts - analytics.scheduledPosts}</p>
                <div className="flex items-center mt-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4 mr-1" />
                  Ready to schedule
                </div>
              </div>
              <div className="p-3 rounded-full bg-accent/10">
                <Users className="h-6 w-6 text-accent-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Scheduled</p>
                <p className="text-3xl font-bold">{analytics.scheduledPosts}</p>
                <div className="flex items-center mt-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1" />
                  Next 7 days
                </div>
              </div>
              <div className="p-3 rounded-full bg-muted/50">
                <Calendar className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Engagement Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-muted-foreground" />
                <YAxis className="text-muted-foreground" />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="posts" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Platform Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.platformBreakdown}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="platform" className="text-muted-foreground" />
                <YAxis className="text-muted-foreground" />
                <Tooltip />
                <Bar 
                  dataKey="posts" 
                  fill="hsl(var(--secondary))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Platform Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.platformBreakdown.length > 0 ? (
              analytics.platformBreakdown.map((platform, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <div>
                      <p className="font-medium">{platform.name}</p>
                      <p className="text-sm text-muted-foreground">{platform.posts} posts</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary">
                      {((platform.posts / analytics.totalPosts) * 100).toFixed(1)}% of total
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No posts created yet. Create your first post to see platform breakdown.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Posts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.totalPosts > 0 ? (
              <p className="text-center text-muted-foreground py-8">
                You have {analytics.totalPosts} total posts with {analytics.scheduledPosts} scheduled and {analytics.publishedPosts} published.
              </p>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  No posts created yet. Start creating content to see your analytics!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};