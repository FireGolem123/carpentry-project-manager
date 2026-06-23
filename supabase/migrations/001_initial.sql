-- Run this in your Supabase SQL editor (Dashboard > SQL Editor > New query)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Build status enum
CREATE TYPE build_status AS ENUM ('in_progress', 'completed', 'sold');

-- Builds table
CREATE TABLE builds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  status build_status NOT NULL DEFAULT 'in_progress',
  primary_material TEXT,
  wood_type TEXT,
  finish_type TEXT,
  other_materials TEXT,
  hours_spent NUMERIC(8, 2),
  material_cost NUMERIC(10, 2),
  sale_price NUMERIC(10, 2),
  buyer_name TEXT,
  sold_via TEXT,
  date_started DATE,
  date_completed DATE,
  date_sold DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Build photos table
CREATE TABLE build_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  build_id UUID NOT NULL REFERENCES builds(id) ON DELETE CASCADE,
  storage_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Expenses table
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  description TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  category TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  build_id UUID REFERENCES builds(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE builds ENABLE ROW LEVEL SECURITY;
ALTER TABLE build_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users" ON builds
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users" ON build_photos
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users" ON expenses
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Storage bucket (run these separately if needed)
INSERT INTO storage.buckets (id, name, public)
VALUES ('build-photos', 'build-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'build-photos');

CREATE POLICY "Authenticated upload photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'build-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated delete photos" ON storage.objects
  FOR DELETE USING (bucket_id = 'build-photos' AND auth.role() = 'authenticated');
