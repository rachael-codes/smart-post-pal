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

// Mock data for demonstration
const engagementData = [
  { date: '2024-01', posts: 12, engagement: 85 },
  { date: '2024-02', posts: 15, engagement: 92 },
  { date: '2024-03', posts: 18, engagement: 88 },
  { date: '2024-04', posts: 22, engagement: 95 },
  { date: '2024-05', posts: 20, engagement: 90 },
  { date: '2024-06', posts: 25, engagement: 97 },
];

const platformData = [
  { platform: 'Instagram', posts: 45, engagement: 92 },
  { platform: 'Twitter', posts: 38, engagement: 78 },
  { platform: 'LinkedIn', posts: 22, engagement: 85 },
  { platform: 'Facebook', posts: 15, engagement: 65 },
];

export const Analytics = () => {
  const [timeRange, setTimeRange] = useState('6months');

  const totalPosts = platformData.reduce((sum, platform) => sum + platform.posts, 0);
  const avgEngagement = Math.round(platformData.reduce((sum, platform) => sum + platform.engagement, 0) / platformData.length);

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
                <p className="text-3xl font-bold">{totalPosts}</p>
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
                <p className="text-sm text-muted-foreground">Avg Engagement</p>
                <p className="text-3xl font-bold">{avgEngagement}%</p>
                <div className="flex items-center mt-2 text-sm text-success">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +5% from last month
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
                <p className="text-sm text-muted-foreground">Total Reach</p>
                <p className="text-3xl font-bold">48.2K</p>
                <div className="flex items-center mt-2 text-sm text-success">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +18% from last month
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
                <p className="text-3xl font-bold">12</p>
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
              <LineChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-muted-foreground" />
                <YAxis className="text-muted-foreground" />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="engagement" 
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
            <CardTitle>Platform Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={platformData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="platform" className="text-muted-foreground" />
                <YAxis className="text-muted-foreground" />
                <Tooltip />
                <Bar 
                  dataKey="engagement" 
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
            {platformData.map((platform, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <div>
                    <p className="font-medium">{platform.platform}</p>
                    <p className="text-sm text-muted-foreground">{platform.posts} posts</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="secondary">
                    {platform.engagement}% engagement
                  </Badge>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Heart className="h-4 w-4" />
                    <span>2.4K</span>
                    <MessageCircle className="h-4 w-4" />
                    <span>182</span>
                    <Share2 className="h-4 w-4" />
                    <span>94</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Best Performing Posts */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { title: "Summer Travel Tips", platform: "Instagram", engagement: 95, likes: 1240, comments: 58 },
              { title: "Tech Trends 2024", platform: "LinkedIn", engagement: 88, likes: 892, comments: 34 },
              { title: "Fitness Monday Motivation", platform: "Facebook", engagement: 82, likes: 567, comments: 23 },
            ].map((post, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{post.title}</h4>
                  <p className="text-sm text-muted-foreground">{post.platform}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className="bg-success/10 text-success-foreground border-success/20">
                    {post.engagement}% engagement
                  </Badge>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Heart className="h-4 w-4" />
                    <span>{post.likes}</span>
                    <MessageCircle className="h-4 w-4" />
                    <span>{post.comments}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};