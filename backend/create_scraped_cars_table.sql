-- Create the scraped_cars table in Supabase
-- Run this in the Supabase SQL Editor
-- This table stores car data scraped from cars.com and carapi.app

CREATE TABLE IF NOT EXISTS public.scraped_cars (
    -- Primary key (format: year_modelname)
    id TEXT PRIMARY KEY NOT NULL,
    
    -- Basic Info
    name TEXT NOT NULL,
    year INTEGER NOT NULL,
    make TEXT DEFAULT 'toyota',
    
    -- Pricing
    price NUMERIC,
    
    -- Images (stored as JSONB for flexible image dictionary)
    images JSONB,
    
    -- Key Specs from cars.com (stored as flexible fields)
    horsepower TEXT,
    mpg TEXT,
    seating_capacity TEXT,
    cargo_space TEXT,
    towing_capacity TEXT,
    fuel_tank_capacity TEXT,
    curb_weight TEXT,
    ground_clearance TEXT,
    
    -- Additional specs (JSONB for any other scraped data)
    additional_specs JSONB,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Source tracking
    source_url TEXT,
    last_scraped_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for fast searching
CREATE INDEX IF NOT EXISTS idx_scraped_cars_make ON public.scraped_cars(make);
CREATE INDEX IF NOT EXISTS idx_scraped_cars_name ON public.scraped_cars(name);
CREATE INDEX IF NOT EXISTS idx_scraped_cars_year ON public.scraped_cars(year);
CREATE INDEX IF NOT EXISTS idx_scraped_cars_make_year ON public.scraped_cars(make, year);
CREATE INDEX IF NOT EXISTS idx_scraped_cars_images ON public.scraped_cars USING gin(images);

-- Enable Row Level Security (optional, but recommended)
ALTER TABLE public.scraped_cars ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow public read access
CREATE POLICY "Allow public read access to scraped_cars" 
ON public.scraped_cars 
FOR SELECT 
USING (true);

-- Create a policy to allow authenticated insert/update (if needed)
-- Uncomment if you need to allow updates through the API
-- CREATE POLICY "Allow authenticated insert access to scraped_cars" 
-- ON public.scraped_cars 
-- FOR INSERT 
-- WITH CHECK (auth.role() = 'authenticated');

-- CREATE POLICY "Allow authenticated update access to scraped_cars" 
-- ON public.scraped_cars 
-- FOR UPDATE 
-- USING (auth.role() = 'authenticated');

-- Comment on table
COMMENT ON TABLE public.scraped_cars IS 'Scraped car data from cars.com and carapi.app for display and comparison';

-- Comment on columns
COMMENT ON COLUMN public.scraped_cars.images IS 'JSONB object with numbered keys (0, 1, 2...) pointing to image URLs';
COMMENT ON COLUMN public.scraped_cars.additional_specs IS 'JSONB object for any additional specs extracted from scraping';

