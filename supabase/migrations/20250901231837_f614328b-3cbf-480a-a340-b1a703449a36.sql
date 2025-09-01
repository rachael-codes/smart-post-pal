-- Add INSERT policy for notifications table
CREATE POLICY "Users can create their own notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create trigger for automatic notification creation when posts are scheduled
CREATE TRIGGER create_post_notification_trigger
AFTER INSERT OR UPDATE ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.create_post_notification();