import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Copy, RefreshCw, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface GeneratedContent {
  caption: string;
  hashtags: string[];
  engagementPrediction: number;
}

export const AIGenerator = () => {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('');
  const [tone, setTone] = useState('');
  const [contentType, setContentType] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const platforms = [
    { value: 'instagram', label: 'Instagram' },
    { value: 'twitter', label: 'Twitter/X' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'youtube', label: 'YouTube' },
  ];

  const tones = [
    { value: 'professional', label: 'Professional' },
    { value: 'casual', label: 'Casual' },
    { value: 'funny', label: 'Funny' },
    { value: 'inspiring', label: 'Inspiring' },
    { value: 'educational', label: 'Educational' },
    { value: 'promotional', label: 'Promotional' },
  ];

  const contentTypes = [
    { value: 'post', label: 'Regular Post' },
    { value: 'story', label: 'Story' },
    { value: 'carousel', label: 'Carousel' },
    { value: 'reel', label: 'Reel/Video' },
    { value: 'poll', label: 'Poll' },
    { value: 'announcement', label: 'Announcement' },
  ];

  const handleGenerate = async () => {
    if (!topic || !platform || !tone || !contentType) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields to generate content.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-content', {
        body: {
          topic,
          platform,
          tone,
          contentType,
        },
      });

      if (error) throw error;

      if (data.success) {
        setGeneratedContent(data.data);
        toast({
          title: "Content generated!",
          description: "AI has created your social media content.",
        });
      } else {
        throw new Error(data.error || 'Failed to generate content');
      }
    } catch (error: any) {
      console.error('Generation error:', error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Text copied to clipboard.",
    });
  };

  const handleSaveAsTemplate = async () => {
    if (!generatedContent) return;

    try {
      const { error } = await supabase
        .from('templates')
        .insert({
          user_id: user?.id,
          name: `${platform} ${contentType} - ${topic}`,
          content: generatedContent.caption,
          hashtags: generatedContent.hashtags,
          category: contentType,
          tone,
        });

      if (error) throw error;

      toast({
        title: "Template saved!",
        description: "Your generated content has been saved as a template.",
      });
    } catch (error: any) {
      toast({
        title: "Error saving template",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">AI Content Generator</h2>
        <p className="text-muted-foreground">Generate engaging captions and hashtags with AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Content Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic or Keyword</Label>
              <Input
                id="topic"
                placeholder="e.g., travel, fitness, technology"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a platform" />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a tone" />
                </SelectTrigger>
                <SelectContent>
                  {tones.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contentType">Content Type</Label>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent>
                  {contentTypes.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleGenerate} 
              className="w-full gap-2" 
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {loading ? 'Generating...' : 'Generate Content'}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Content */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {generatedContent ? (
              <>
                {/* Caption */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Caption</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyText(generatedContent.caption)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <Textarea
                    value={generatedContent.caption}
                    onChange={(e) => setGeneratedContent({
                      ...generatedContent,
                      caption: e.target.value
                    })}
                    className="min-h-[120px]"
                  />
                </div>

                {/* Hashtags */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Hashtags</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyText('#' + generatedContent.hashtags.join(' #'))}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {generatedContent.hashtags.map((hashtag, index) => (
                      <Badge key={index} variant="secondary">
                        #{hashtag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Engagement Prediction */}
                <div className="space-y-2">
                  <Label>Engagement Prediction</Label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${generatedContent.engagementPrediction}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {generatedContent.engagementPrediction}%
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={handleGenerate} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Regenerate
                  </Button>
                  <Button onClick={handleSaveAsTemplate} className="gap-2">
                    <Save className="h-4 w-4" />
                    Save as Template
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Generate your first AI-powered content using the form on the left.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};