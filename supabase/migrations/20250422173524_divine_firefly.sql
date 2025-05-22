/*
  # Create formations and user-related tables

  1. New Tables
    - `formations`
      - `id` (int, primary key)
      - `etablissement` (text)
      - `filiere` (text)
      - `voie` (text)
      - `ville` (text)
      - `departement` (text)
      - `places` (int)
      - `notes` (text)
      - `created_at` (timestamp)
    - `user_profiles`
      - `id` (int, primary key)
      - `user_id` (uuid, references auth.users)
      - `tokens` (int)
      - `created_at` (timestamp)
    - `formation_views`
      - `id` (int, primary key)
      - `user_id` (uuid, references auth.users)
      - `formation_id` (int, references formations)
      - `created_at` (timestamp)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users

  3. Functions
    - `use_token_for_formation` function to handle token usage
*/

-- Create formations table
CREATE TABLE IF NOT EXISTS formations (
  id SERIAL PRIMARY KEY,
  etablissement TEXT NOT NULL,
  filiere TEXT NOT NULL,
  voie TEXT NOT NULL,
  ville TEXT NOT NULL,
  departement TEXT NOT NULL,
  places INT NOT NULL,
  notes TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tokens INT DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create formation views table
CREATE TABLE IF NOT EXISTS formation_views (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  formation_id INT REFERENCES formations(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, formation_id)
);

-- Enable RLS
ALTER TABLE formations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE formation_views ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Formations table policies
CREATE POLICY "Anyone can read formations" 
  ON formations
  FOR SELECT
  USING (true);

-- User profiles policies
CREATE POLICY "Users can read their own profile" 
  ON user_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Formation views policies
CREATE POLICY "Users can read their own formation views" 
  ON formation_views
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own formation views" 
  ON formation_views
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create use_token function
CREATE OR REPLACE FUNCTION use_token_for_formation(p_user_id UUID, p_formation_id INT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_tokens INT;
  v_formation_viewed BOOLEAN;
BEGIN
  -- Check if user has already viewed this formation
  SELECT EXISTS (
    SELECT 1 FROM formation_views 
    WHERE user_id = p_user_id AND formation_id = p_formation_id
  ) INTO v_formation_viewed;
  
  -- If already viewed, return success without consuming a token
  IF v_formation_viewed THEN
    RETURN TRUE;
  END IF;
  
  -- Get user's token count
  SELECT tokens INTO v_user_tokens 
  FROM user_profiles 
  WHERE user_id = p_user_id;
  
  -- If user has no profile yet, create one
  IF v_user_tokens IS NULL THEN
    INSERT INTO user_profiles (user_id, tokens) 
    VALUES (p_user_id, 0)
    RETURNING tokens INTO v_user_tokens;
  END IF;
  
  -- Check if user has tokens
  IF v_user_tokens <= 0 THEN
    RAISE EXCEPTION 'Pas assez de tokens disponibles';
  END IF;
  
  -- Begin transaction
  BEGIN
    -- Decrement token
    UPDATE user_profiles 
    SET tokens = tokens - 1 
    WHERE user_id = p_user_id;
    
    -- Record the view
    INSERT INTO formation_views (user_id, formation_id) 
    VALUES (p_user_id, p_formation_id);
    
    RETURN TRUE;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE;
  END;
END;
$$;

-- Create trigger to create user profile on user creation
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_profile_for_user();