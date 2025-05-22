/*
  # Secure formations data and create public formation list

  1. New Tables
    - `formation_list`
      - Public table containing basic formation information
      - Excludes sensitive notes data
      - Accessible to all users
  
  2. Security Changes
    - Remove public access to formations table
    - Add policy for authenticated users to view formations they've unlocked
    - Enable public access to formation_list table
  
  3. Data Migration
    - Copy existing formation data to formation_list (excluding notes)
*/

-- Create the formation_list table
CREATE TABLE IF NOT EXISTS formation_list (
  id SERIAL PRIMARY KEY,
  etablissement TEXT NOT NULL,
  filiere TEXT NOT NULL,
  voie TEXT NOT NULL,
  ville TEXT NOT NULL,
  departement TEXT NOT NULL,
  places INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Copy data from formations to formation_list
INSERT INTO formation_list (id, etablissement, filiere, voie, ville, departement, places, created_at)
SELECT id, etablissement, filiere, voie, ville, departement, places, created_at
FROM formations;

-- Enable RLS on formation_list
ALTER TABLE formation_list ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to formation_list
CREATE POLICY "Anyone can read formation_list"
  ON formation_list
  FOR SELECT
  USING (true);

-- Remove existing public access policy from formations
DROP POLICY IF EXISTS "Anyone can read formations" ON formations;

-- Create new policy for formations table
CREATE POLICY "Users can read formations they've unlocked"
  ON formations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 
      FROM formation_views 
      WHERE formation_views.formation_id = formations.id 
      AND formation_views.user_id = auth.uid()
    )
  );