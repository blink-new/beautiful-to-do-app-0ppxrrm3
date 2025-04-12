
-- Drop and recreate the trigger function to ensure it works correctly
DROP TRIGGER IF EXISTS create_profile_after_signup ON auth.users;
DROP FUNCTION IF EXISTS create_profile_for_user();

-- Create the function to handle profile creation on signup
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
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER create_profile_after_signup
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION create_profile_for_user();

-- Add policy to allow users to insert their own profile
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Ensure public can read profiles (needed for joins with todos)
DROP POLICY IF EXISTS "Profiles are publicly viewable" ON profiles;
CREATE POLICY "Profiles are publicly viewable" ON profiles
  FOR SELECT USING (true);