-- Fix security vulnerabilities in subscribers table RLS policies
-- Drop the overly permissive policies
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;

-- Create secure INSERT policy - only allow users to create their own records
CREATE POLICY "users_can_insert_own_subscription" ON public.subscribers
FOR INSERT
WITH CHECK (auth.uid() = user_id OR auth.email() = email);

-- Create secure UPDATE policy - only allow users to update their own records
CREATE POLICY "users_can_update_own_subscription" ON public.subscribers
FOR UPDATE
USING (auth.uid() = user_id OR auth.email() = email);