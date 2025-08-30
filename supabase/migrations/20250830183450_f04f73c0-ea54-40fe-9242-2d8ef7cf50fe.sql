-- Create notifications table for scheduled post reminders
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  post_id UUID NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'post_reminder',
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  sent BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add foreign key for notifications if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'notifications_post_id_fkey' 
        AND table_name = 'notifications'
    ) THEN
        ALTER TABLE public.notifications 
        ADD CONSTRAINT notifications_post_id_fkey 
        FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create trigger for notifications updated_at if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_notifications_updated_at'
    ) THEN
        CREATE TRIGGER update_notifications_updated_at
        BEFORE UPDATE ON public.notifications
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

-- Function to create notification when post is scheduled
CREATE OR REPLACE FUNCTION create_post_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create notification for scheduled posts
  IF NEW.scheduled_at IS NOT NULL AND NEW.status = 'scheduled' THEN
    INSERT INTO public.notifications (user_id, post_id, message, scheduled_for)
    VALUES (
      NEW.user_id,
      NEW.id,
      'Time to post: ' || COALESCE(NEW.title, 'Your scheduled post') || ' on ' || (
        SELECT name FROM platforms WHERE id = NEW.platform_id
      ),
      NEW.scheduled_at
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create notifications for scheduled posts
DROP TRIGGER IF EXISTS create_post_notification_trigger ON public.posts;
CREATE TRIGGER create_post_notification_trigger
AFTER INSERT OR UPDATE ON public.posts
FOR EACH ROW
EXECUTE FUNCTION create_post_notification();