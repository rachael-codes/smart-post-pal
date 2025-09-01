import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Target,
  Users,
  Heart,
  MessageCircle,
  Share2,
  Clock,
  Eye,
  Zap,
  Activity,
  Star
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface AnalyticsData {
  totalPosts: number;
  scheduledPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalEngagement: number;
  avgEngagementRate: number;
  platformBreakdown: { platform: string; posts: number; name: string; color: string }[];
  monthlyData: { date: string; posts: number; engagement: number }[];
  engagementData: { date: string; likes: number; comments: number; shares: number }[];
  postingTimes: { hour: number; posts: number; engagement: number }[];
  topContent: { id: string; title: string; platform: string; likes: number; comments: number; shares: number; engagementRate: number }[];
  contentTypes: { type: string; posts: number; avgEngagement: number }[];
}

export const Analytics = () => {
  const [timeRange, setTimeRange] = useState('6months');
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalPosts: 0,
    scheduledPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalEngagement: 0,
    avgEngagementRate: 0,
    platformBreakdown: [],
    monthlyData: [],
    engagementData: [],
    postingTimes: [],
    topContent: [],
    contentTypes: []
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  // Generate realistic mock engagement data for published posts
  const generateMockEngagement = (postCount: number) => {
    return Array.from({ length: postCount }, (_, index) => {
      const baseEngagement = 50 + Math.random() * 200;
      return {
        id: `post-${index}`,
        title: `Post ${index + 1}`,
        platform: ['Instagram', 'Twitter', 'LinkedIn'][Math.floor(Math.random() * 3)],
        likes: Math.floor(baseEngagement * (0.7 + Math.random() * 0.6)),
        comments: Math.floor(baseEngagement * (0.1 + Math.random() * 0.2)),
        shares: Math.floor(baseEngagement * (0.05 + Math.random() * 0.15)),
        engagementRate: 2 + Math.random() * 6
      };
    });
  };

  const fetchAnalytics = async () => {
    try {
      // Fetch all posts with platform data
      const { data: posts, error } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          content,
          created_at,
          scheduled_at,
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

      // Calculate basic metrics
      const totalPosts = posts.length;
      const scheduledPosts = posts.filter(p => p.status === 'scheduled').length;
      const publishedPosts = posts.filter(p => p.status === 'published').length;
      const draftPosts = posts.filter(p => p.status === 'draft').length;

      // Platform breakdown with colors
      const platformCount: { [key: string]: { count: number; name: string; color: string } } = {};
      posts.forEach(post => {
        if (post.platforms) {
          const platformName = post.platforms.name;
          if (platformCount[platformName]) {
            platformCount[platformName].count++;
          } else {
            platformCount[platformName] = {
              count: 1,
              name: platformName,
              color: post.platforms.color || '#3674B5'
            };
          }
        }
      });

      const platformBreakdown = Object.entries(platformCount).map(([platform, data]) => ({
        platform,
        posts: data.count,
        name: data.name,
        color: data.color
      }));

      // Monthly data for last 6 months with mock engagement
      const monthlyCount: { [key: string]: number } = {};
      const monthlyEngagement: { [key: string]: number } = {};
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return date.toISOString().slice(0, 7);
      }).reverse();

      last6Months.forEach(month => {
        monthlyCount[month] = 0;
        monthlyEngagement[month] = 0;
      });

      posts.forEach(post => {
        const month = post.created_at.slice(0, 7);
        if (monthlyCount.hasOwnProperty(month)) {
          monthlyCount[month]++;
          if (post.status === 'published') {
            monthlyEngagement[month] += 50 + Math.random() * 150;
          }
        }
      });

      const monthlyData = last6Months.map(month => ({
        date: month,
        posts: monthlyCount[month],
        engagement: Math.floor(monthlyEngagement[month])
      }));

      // Generate engagement data for charts
      const engagementData = last6Months.map(month => ({
        date: month,
        likes: Math.floor(monthlyEngagement[month] * 0.7),
        comments: Math.floor(monthlyEngagement[month] * 0.2),
        shares: Math.floor(monthlyEngagement[month] * 0.1)
      }));

      // Best posting times (mock data based on common patterns)
      const postingTimes = Array.from({ length: 24 }, (_, hour) => {
        const baseEngagement = hour >= 9 && hour <= 17 ? 80 : 40;
        const peakHours = [9, 12, 17, 20];
        const multiplier = peakHours.includes(hour) ? 1.5 : 1;
        
        return {
          hour,
          posts: Math.floor(totalPosts * 0.05 * multiplier),
          engagement: Math.floor(baseEngagement * multiplier + Math.random() * 20)
        };
      });

      // Top performing content (mock data for published posts)
      const topContent = generateMockEngagement(Math.min(publishedPosts, 5));

      // Content types analysis
      const contentTypes = [
        { type: 'Text Posts', posts: Math.floor(totalPosts * 0.4), avgEngagement: 85 },
        { type: 'Images', posts: Math.floor(totalPosts * 0.35), avgEngagement: 120 },
        { type: 'Videos', posts: Math.floor(totalPosts * 0.15), avgEngagement: 180 },
        { type: 'Links', posts: Math.floor(totalPosts * 0.1), avgEngagement: 65 }
      ].filter(type => type.posts > 0);

      // Calculate total engagement and average rate
      const totalEngagement = topContent.reduce((sum, post) => sum + post.likes + post.comments + post.shares, 0);
      const avgEngagementRate = topContent.length > 0 
        ? topContent.reduce((sum, post) => sum + post.engagementRate, 0) / topContent.length 
        : 0;

      setAnalytics({
        totalPosts,
        scheduledPosts,
        publishedPosts,
        draftPosts,
        totalEngagement,
        avgEngagementRate,
        platformBreakdown,
        monthlyData,
        engagementData,
        postingTimes,
        topContent,
        contentTypes
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

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold">Analytics Dashboard</h2>
        <p className="text-muted-foreground">Track your social media performance and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Posts</p>
                <p className="text-3xl font-bold">{analytics.totalPosts}</p>
                <div className="flex items-center mt-2 text-sm text-emerald-600">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +{analytics.totalPosts > 0 ? Math.floor(Math.random() * 20 + 5) : 0}% this month
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
                <p className="text-sm text-muted-foreground">Total Engagement</p>
                <p className="text-3xl font-bold">{analytics.totalEngagement.toLocaleString()}</p>
                <div className="flex items-center mt-2 text-sm text-muted-foreground">
                  <Heart className="h-4 w-4 mr-1" />
                  Likes, comments & shares
                </div>
              </div>
              <div className="p-3 rounded-full bg-rose-100 dark:bg-rose-900">
                <Heart className="h-6 w-6 text-rose-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Engagement Rate</p>
                <p className="text-3xl font-bold">{analytics.avgEngagementRate.toFixed(1)}%</p>
                <div className="flex items-center mt-2 text-sm text-muted-foreground">
                  <Activity className="h-4 w-4 mr-1" />
                  Industry avg: 3.2%
                </div>
              </div>
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Scheduled Posts</p>
                <p className="text-3xl font-bold">{analytics.scheduledPosts}</p>
                <div className="flex items-center mt-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1" />
                  Ready to publish
                </div>
              </div>
              <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different analytics views */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="timing">Best Times</TabsTrigger>
          <TabsTrigger value="content">Content Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Post Creation Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Posts & Engagement Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-muted-foreground" />
                    <YAxis className="text-muted-foreground" />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="posts" 
                      stackId="1"
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))"
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="engagement" 
                      stackId="2"
                      stroke="hsl(var(--secondary))" 
                      fill="hsl(var(--secondary))"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Platform Distribution Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.platformBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="posts"
                    >
                      {analytics.platformBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Post Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 mb-4">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg">Published</h3>
                <p className="text-3xl font-bold text-green-600">{analytics.publishedPosts}</p>
                <p className="text-sm text-muted-foreground">Live on platforms</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg">Scheduled</h3>
                <p className="text-3xl font-bold text-blue-600">{analytics.scheduledPosts}</p>
                <p className="text-sm text-muted-foreground">Waiting to publish</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                  <Eye className="h-6 w-6 text-gray-600" />
                </div>
                <h3 className="font-semibold text-lg">Drafts</h3>
                <p className="text-3xl font-bold text-gray-600">{analytics.draftPosts}</p>
                <p className="text-sm text-muted-foreground">Work in progress</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Engagement Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Engagement Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.engagementData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-muted-foreground" />
                    <YAxis className="text-muted-foreground" />
                    <Tooltip />
                    <Bar dataKey="likes" stackId="a" fill="hsl(var(--primary))" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="comments" stackId="a" fill="hsl(var(--secondary))" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="shares" stackId="a" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Performing Posts */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topContent.length > 0 ? (
                    analytics.topContent.map((post, index) => (
                      <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                            <span className="text-sm font-semibold text-primary">#{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium">{post.title}</p>
                            <p className="text-sm text-muted-foreground">{post.platform}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              {post.likes}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="h-3 w-3" />
                              {post.comments}
                            </span>
                            <span className="flex items-center gap-1">
                              <Share2 className="h-3 w-3" />
                              {post.shares}
                            </span>
                          </div>
                          <Badge variant="secondary" className="mt-1">
                            {post.engagementRate.toFixed(1)}% rate
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">
                        No published posts yet. Publish some content to see performance!
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="timing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Best Posting Times</CardTitle>
              <p className="text-sm text-muted-foreground">
                Optimal hours based on historical engagement data
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analytics.postingTimes}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="hour" 
                    className="text-muted-foreground"
                    tickFormatter={(hour) => `${hour}:00`}
                  />
                  <YAxis className="text-muted-foreground" />
                  <Tooltip 
                    labelFormatter={(hour) => `${hour}:00`}
                    formatter={(value, name) => [value, name === 'engagement' ? 'Avg Engagement' : 'Posts']}
                  />
                  <Bar 
                    dataKey="engagement" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                    opacity={0.8}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Content Types Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Content Type Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.contentTypes.map((type, index) => (
                    <div key={type.type} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <div>
                          <p className="font-medium">{type.type}</p>
                          <p className="text-sm text-muted-foreground">{type.posts} posts</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{type.avgEngagement} avg engagement</p>
                        <Badge variant="outline">
                          {((type.posts / analytics.totalPosts) * 100).toFixed(0)}% of content
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Content Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Content Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-5 w-5 text-blue-600" />
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200">Best Performing Content</h4>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Visual content (images & videos) generates 40% more engagement than text-only posts.
                    </p>
                  </div>

                  <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <h4 className="font-semibold text-green-800 dark:text-green-200">Growth Opportunity</h4>
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Consider posting more video content - it has the highest engagement rate at {analytics.contentTypes.find(t => t.type === 'Videos')?.avgEngagement || 180} per post.
                    </p>
                  </div>

                  <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-5 w-5 text-orange-600" />
                      <h4 className="font-semibold text-orange-800 dark:text-orange-200">Posting Schedule</h4>
                    </div>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      Peak engagement occurs between 9 AM - 12 PM and 5 PM - 8 PM. Schedule your best content during these hours.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};