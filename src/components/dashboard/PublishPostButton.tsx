import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PublishPostButtonProps {
  postId: string;
  platform: string;
  content: string;
  hashtags?: string[];
  onPublished?: () => void;
}

export const PublishPostButton = ({ 
  postId, 
  platform, 
  content, 
  hashtags, 
  onPublished 
}: PublishPostButtonProps) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const { toast } = useToast();

  const handlePublish = async () => {
    setIsPublishing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('publish-post', {
        body: {
          postId,
          platform,
          content,
          hashtags
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Post published successfully!",
          description: `Your post has been published to ${platform}.`,
        });
        onPublished?.();
      } else {
        throw new Error(data?.error || 'Unknown error occurred');
      }
    } catch (error: any) {
      console.error('Error publishing post:', error);
      toast({
        title: "Failed to publish post",
        description: error.message || 'An error occurred while publishing your post.',
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Button
      onClick={handlePublish}
      disabled={isPublishing}
      size="sm"
      className="gap-2"
    >
      {isPublishing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Send className="h-4 w-4" />
      )}
      {isPublishing ? 'Publishing...' : 'Publish Now'}
    </Button>
  );
};