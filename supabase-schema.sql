-- HateCRM Schema
-- Run this in your Supabase SQL Editor

-- Enemies table: people you're tracking
CREATE TABLE enemies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    nickname TEXT,
    avatar_url TEXT,
    twitter_handle TEXT,
    tweet_url TEXT,
    position_x FLOAT,
    position_y FLOAT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Grievances table: reasons why you don't like them
CREATE TABLE grievances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    enemy_id UUID REFERENCES enemies(id) ON DELETE CASCADE NOT NULL,
    reason TEXT NOT NULL,
    tweet_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE enemies ENABLE ROW LEVEL SECURITY;
ALTER TABLE grievances ENABLE ROW LEVEL SECURITY;

-- Policies for enemies table
CREATE POLICY "Users can view their own enemies"
    ON enemies FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own enemies"
    ON enemies FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own enemies"
    ON enemies FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own enemies"
    ON enemies FOR DELETE
    USING (auth.uid() = user_id);

-- Policies for grievances table (through enemy ownership)
CREATE POLICY "Users can view grievances for their enemies"
    ON grievances FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM enemies 
            WHERE enemies.id = grievances.enemy_id 
            AND enemies.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert grievances for their enemies"
    ON grievances FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM enemies 
            WHERE enemies.id = grievances.enemy_id 
            AND enemies.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update grievances for their enemies"
    ON grievances FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM enemies 
            WHERE enemies.id = grievances.enemy_id 
            AND enemies.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete grievances for their enemies"
    ON grievances FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM enemies 
            WHERE enemies.id = grievances.enemy_id 
            AND enemies.user_id = auth.uid()
        )
    );

-- Indexes for better performance
CREATE INDEX enemies_user_id_idx ON enemies(user_id);
CREATE INDEX grievances_enemy_id_idx ON grievances(enemy_id);

