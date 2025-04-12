
-- Drop existing table if needed and recreate
DROP TABLE IF EXISTS todos;

-- Create todos table with RLS policies
CREATE TABLE IF NOT EXISTS todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  category TEXT NOT NULL CHECK (category IN ('personal', 'work', 'shopping', 'health', 'other')),
  due_date TIMESTAMPTZ,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to select their own todos
CREATE POLICY "Users can view their own todos" ON todos
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own todos
CREATE POLICY "Users can insert their own todos" ON todos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own todos
CREATE POLICY "Users can update their own todos" ON todos
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own todos
CREATE POLICY "Users can delete their own todos" ON todos
  FOR DELETE USING (auth.uid() = user_id);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS todos_user_id_idx ON todos(user_id);