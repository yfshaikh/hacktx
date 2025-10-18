-- Create the vehicles table in Supabase
-- Run this in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.vehicles (
    -- Primary key
    id TEXT PRIMARY KEY NOT NULL,
    
    -- Basic Info
    make TEXT,
    model TEXT,
    year TEXT,
    basemodel TEXT,
    
    -- Pricing
    msrp DOUBLE PRECISION,
    "youSave/spend" TEXT,
    
    -- Fuel and Performance
    "fuelType" TEXT,
    "fuelType1" TEXT,
    "fuelType2" TEXT,
    "annualPetroleumConsumptionForFuelType1" DOUBLE PRECISION,
    "annualPetroleumConsumptionForFuelType2" DOUBLE PRECISION,
    "annualFuelCostForFuelType1" TEXT,
    "annualFuelCostForFuelType2" TEXT,
    
    -- MPG Data
    "cityMpgForFuelType1" INTEGER,
    "unroundedCityMpgForFuelType1 (2)" DOUBLE PRECISION,
    "cityMpgForFuelType2" INTEGER,
    "unroundedCityMpgForFuelType2" DOUBLE PRECISION,
    "highwayMpgForFuelType1" TEXT,
    "unroundedHighwayMpgForFuelType1" TEXT,
    "highwayMpgForFuelType2" TEXT,
    "unroundedHighwayMpgForFuelType2" TEXT,
    "combinedMpgForFuelType1" INTEGER,
    "unroundedCombinedMpgForFuelType1" DOUBLE PRECISION,
    "combinedMpgForFuelType2" INTEGER,
    "unroundedCombinedMpgForFuelType2" DOUBLE PRECISION,
    "unadjustedCityMpgForFuelType1" TEXT,
    "unadjustedCityMpgForFuelType2" TEXT,
    "unadjustedHighwayMpgForFuelType1" TEXT,
    "unadjustedHighwayMpgForFuelType2" TEXT,
    
    -- Consumption
    "cityGasolineConsumption" DOUBLE PRECISION,
    "cityElectricityConsumption" DOUBLE PRECISION,
    "highwayGasolineConsumption" TEXT,
    "highwayElectricityConsumption" TEXT,
    "combinedElectricityConsumption" DOUBLE PRECISION,
    "combinedGasolineConsumption" DOUBLE PRECISION,
    
    -- Utility Factors
    "epaCityUtilityFactor" DOUBLE PRECISION,
    "epaHighwayUtilityFactor" TEXT,
    "epaCombinedUtilityFactor" DOUBLE PRECISION,
    
    -- CO2 Emissions
    "co2FuelType1" INTEGER,
    "co2FuelType2" INTEGER,
    "co2TailpipeForFuelType1" DOUBLE PRECISION,
    "co2TailpipeForFuelType2" DOUBLE PRECISION,
    
    -- Engine
    cylinders INTEGER,
    "engineDisplacement" DOUBLE PRECISION,
    "engineDescriptor" TEXT,
    transmission TEXT,
    "transmissionDescriptor" TEXT,
    drive TEXT,
    
    -- EPA Scores
    "epaModelTypeIndex" TEXT,
    "epaFuelEconomyScore" TEXT,
    "ghgScore" TEXT,
    "ghgScoreAlternativeFuel" TEXT,
    
    -- Volume/Space
    "hatchbackLuggageVolume" TEXT,
    "hatchbackPassengerVolume" TEXT,
    "2DoorLuggageVolume" TEXT,
    "4DoorLuggageVolume" TEXT,
    "2DoorPassengerVolume" TEXT,
    "4DoorPassengerVolume" TEXT,
    
    -- Vehicle Class
    "vehicleSizeClass" TEXT,
    "atvType" TEXT,
    
    -- Range
    "rangeForFuelType1" TEXT,
    "rangeCityForFuelType1" TEXT,
    "rangeCityForFuelType2" TEXT,
    "rangeHighwayForFuelType1" TEXT,
    "rangeHighwayForFuelType2" TEXT,
    "epaRangeForFuelType2" TEXT,
    
    -- Charging
    "timeToChargeAt120V" DOUBLE PRECISION,
    "timeToChargeAt240V" DOUBLE PRECISION,
    "charge240B" TEXT,
    "c240Dscr" TEXT,
    "c240BDscr" TEXT,
    "tCharger" TEXT,
    "sCharger" TEXT,
    
    -- Electric/Hybrid
    "electricMotor" TEXT,
    "phevBlended" TEXT,
    "phevCity" TEXT,
    "phevHighway" TEXT,
    "phevCombined" TEXT,
    
    -- Other
    "mpgData" TEXT,
    guzzler TEXT,
    "startStop" TEXT,
    "mfrCode" TEXT,
    "createdOn" TEXT,
    "modifiedOn" TEXT,
    
    -- Visual Data (for your car display)
    "has3D" BOOLEAN,
    "colorNames" TEXT,
    "colorCodes" TEXT,
    "color_codes" TEXT,  -- Some data might use this format
    "colorHexCodes" TEXT,
    "color_hex_codes" TEXT,  -- Some data might use this format
    "modelGrade" TEXT,
    "model_grade" TEXT,  -- Some data might use this format
    "modelTag" TEXT,
    "model_tag" TEXT,  -- Some data might use this format
    "imageName" TEXT,
    "image_name" TEXT,  -- Some data might use this format
    "imageCount" INTEGER,
    "image_count" INTEGER,  -- Some data might use this format
    url TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for fast searching
CREATE INDEX IF NOT EXISTS idx_vehicles_make ON public.vehicles(make);
CREATE INDEX IF NOT EXISTS idx_vehicles_model ON public.vehicles(model);
CREATE INDEX IF NOT EXISTS idx_vehicles_year ON public.vehicles(year);
CREATE INDEX IF NOT EXISTS idx_vehicles_make_model ON public.vehicles(make, model);

-- Enable Row Level Security (optional, but recommended)
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow public read access (you can modify this based on your needs)
CREATE POLICY "Allow public read access to vehicles" 
ON public.vehicles 
FOR SELECT 
USING (true);

-- Comment on table
COMMENT ON TABLE public.vehicles IS 'Vehicle data for car recommendations and display';

