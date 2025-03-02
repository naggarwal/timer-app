-- Drop policies
DROP POLICY IF EXISTS "Users can view their own timesets" ON public.timesets;
DROP POLICY IF EXISTS "Users can insert their own timesets" ON public.timesets;
DROP POLICY IF EXISTS "Users can update their own timesets" ON public.timesets;
DROP POLICY IF EXISTS "Users can delete their own timesets" ON public.timesets;

-- Drop indexes
DROP INDEX IF EXISTS timesets_user_id_idx;

-- Drop table
DROP TABLE IF EXISTS public.timesets; 