
-- Drop the unique constraint on username to allow multiple users with the same email
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_username_key;

-- Create a partial index instead of a constraint to allow multiple NULL usernames
-- This prevents duplicates for custom usernames while allowing multiple users with NULL username
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique_idx ON profiles (username)
WHERE username IS NOT NULL;

-- Update the trigger function to handle conflicts better
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure the trigger is properly set
DROP TRIGGER IF EXISTS create_profile_after_signup ON auth.users;
CREATE TRIGGER create_profile_after_signup
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION create_profile_for_user();