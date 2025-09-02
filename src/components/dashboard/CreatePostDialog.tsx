import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Calendar as CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Platform {
  id: string;
  name: string;
  color: string;
  icon: string;
}

interface CreatePostDialogProps {
  onPostCreated: () => void;
}

export const CreatePostDialog = ({ onPostCreated }: CreatePostDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<{ hour: string; minute: string }>({ hour: '09', minute: '00' });
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    platform_id: '',
    status: 'draft'
  });

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchPlatforms();
  }, []);

  const fetchPlatforms = async () => {
    try {
      const { data, error } = await supabase
        .from('platforms')
        .select('*');

      if (error) throw error;
      setPlatforms(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading platforms",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addHashtag = () => {
    if (hashtagInput.trim() && !hashtags.includes(hashtagInput.trim())) {
      setHashtags([...hashtags, hashtagInput.trim()]);
      setHashtagInput('');
    }
  };

  const removeHashtag = (tagToRemove: string) => {
    setHashtags(hashtags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      let scheduledDateTime = null;
      if (selectedDate) {
        scheduledDateTime = new Date(selectedDate);
        scheduledDateTime.setHours(parseInt(selectedTime.hour), parseInt(selectedTime.minute), 0, 0);
      }

      const { data: postData, error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          title: formData.title,
          content: formData.content,
          platform_id: formData.platform_id,
          scheduled_at: scheduledDateTime?.toISOString(),
          status: scheduledDateTime ? 'scheduled' : formData.status,
          hashtags: hashtags
        })
        .select('id')
        .single();

      if (error) throw error;

      // Create notification for scheduled posts
      if (scheduledDateTime && postData) {
        await supabase
          .from('notifications')
          .insert({
            user_id: user.id,
            post_id: postData.id,
            message: `Time to post: ${formData.title || 'Your scheduled post'}`,
            scheduled_for: scheduledDateTime.toISOString(),
            type: 'post_reminder'
          });
      }

      toast({
        title: "Post created successfully",
        description: scheduledDateTime ? "Your post has been scheduled." : "Your post has been saved as a draft.",
      });

      // Reset form
      setFormData({ title: '', content: '', platform_id: '', status: 'draft' });
      setSelectedDate(undefined);
      setSelectedTime({ hour: '09', minute: '00' });
      setHashtags([]);
      setHashtagInput('');
      setOpen(false);
      onPostCreated();

    } catch (error: any) {
      toast({
        title: "Error creating post",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Post
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title (Optional)</Label>
            <Input
              id="title"
              placeholder="Enter post title..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              placeholder="What's on your mind?"
              rows={4}
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="platform">Platform *</Label>
            <Select 
              required
              value={formData.platform_id} 
              onValueChange={(value) => setFormData({ ...formData, platform_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                {platforms.map((platform) => (
                  <SelectItem key={platform.id} value={platform.id}>
                    {platform.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Hashtags</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add hashtag..."
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addHashtag();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addHashtag}>
                Add
              </Button>
            </div>
            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {hashtags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    #{tag}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeHashtag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Schedule (Optional)</Label>
            <div className="space-y-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              {selectedDate && (
                <div className="flex gap-2 items-center">
                  <Label className="text-sm">Time:</Label>
                  <Select value={selectedTime.hour} onValueChange={(value) => setSelectedTime({ ...selectedTime, hour: value })}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => (
                        <SelectItem key={i} value={i.toString().padStart(2, '0')}>
                          {i.toString().padStart(2, '0')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-sm">:</span>
                  <Select value={selectedTime.minute} onValueChange={(value) => setSelectedTime({ ...selectedTime, minute: value })}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 60 }, (_, i) => (
                        <SelectItem key={i} value={i.toString().padStart(2, '0')}>
                          {i.toString().padStart(2, '0')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : selectedDate ? `Schedule for ${selectedTime.hour}:${selectedTime.minute}` : 'Save Draft'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};