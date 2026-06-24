-- Remove DEFAULT constraint from descriptive boolean columns in properties table
ALTER TABLE properties ALTER COLUMN has_water_tank DROP DEFAULT;
ALTER TABLE properties ALTER COLUMN has_hot_water DROP DEFAULT;
ALTER TABLE properties ALTER COLUMN has_generator DROP DEFAULT;
ALTER TABLE properties ALTER COLUMN has_internet DROP DEFAULT;
ALTER TABLE properties ALTER COLUMN has_security_24h DROP DEFAULT;
ALTER TABLE properties ALTER COLUMN has_electric_gate DROP DEFAULT;
ALTER TABLE properties ALTER COLUMN has_cctv DROP DEFAULT;
ALTER TABLE properties ALTER COLUMN has_electric_fence DROP DEFAULT;
ALTER TABLE properties ALTER COLUMN has_intercom DROP DEFAULT;
ALTER TABLE properties ALTER COLUMN has_armored_door DROP DEFAULT;
ALTER TABLE properties ALTER COLUMN has_elevator DROP DEFAULT;
ALTER TABLE properties ALTER COLUMN has_ac DROP DEFAULT;
ALTER TABLE properties ALTER COLUMN has_heating DROP DEFAULT;
ALTER TABLE properties ALTER COLUMN allows_pets DROP DEFAULT;
ALTER TABLE properties ALTER COLUMN allows_cooking DROP DEFAULT;
ALTER TABLE properties ALTER COLUMN has_independent_entrance DROP DEFAULT;
ALTER TABLE properties ALTER COLUMN has_own_water DROP DEFAULT;

-- Reset existing mock properties descriptive booleans to NULL for clean dev state
UPDATE properties SET
  has_water_tank = NULL,
  has_hot_water = NULL,
  has_generator = NULL,
  has_internet = NULL,
  has_security_24h = NULL,
  has_electric_gate = NULL,
  has_cctv = NULL,
  has_electric_fence = NULL,
  has_intercom = NULL,
  has_armored_door = NULL,
  has_elevator = NULL,
  has_ac = NULL,
  has_heating = NULL,
  allows_pets = NULL,
  allows_cooking = NULL,
  has_independent_entrance = NULL,
  has_own_water = NULL;

-- Update completeness calculation trigger function to trust the client score
CREATE OR REPLACE FUNCTION calculate_property_completeness()
RETURNS TRIGGER AS $$
BEGIN
    -- Validate and clamp completeness_score
    IF NEW.completeness_score IS NULL OR NEW.completeness_score < 0 THEN
        NEW.completeness_score := 0;
    ELSIF NEW.completeness_score > 100 THEN
        NEW.completeness_score := 100;
    END IF;

    -- Assign badge based on completeness_score ONLY if NEW.listing_badge is NULL, empty, or one of the default tiers.
    IF NEW.listing_badge IS NULL 
       OR NEW.listing_badge = '' 
       OR NEW.listing_badge = 'basico' 
       OR NEW.listing_badge = 'completo' 
       OR NEW.listing_badge = 'premium' 
    THEN
        IF NEW.completeness_score <= 40 THEN
            NEW.listing_badge := 'basico';
        ELSIF NEW.completeness_score <= 70 THEN
            NEW.listing_badge := 'completo';
        ELSE
            NEW.listing_badge := 'premium';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
