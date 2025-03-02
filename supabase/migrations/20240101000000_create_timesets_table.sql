-- Create timesets table
CREATE TABLE public.timesets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  times JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Set up Row Level Security
ALTER TABLE public.timesets ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see only their own timesets
CREATE POLICY "Users can view their own timesets" 
  ON public.timesets FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy for users to insert their own timesets
CREATE POLICY "Users can insert their own timesets" 
  ON public.timesets FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own timesets
CREATE POLICY "Users can update their own timesets" 
  ON public.timesets FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy for users to delete their own timesets
CREATE POLICY "Users can delete their own timesets" 
  ON public.timesets FOR DELETE 
  USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX timesets_user_id_idx ON public.timesets (user_id); 