-- Add missing RLS write policies for properties, property_translations, property_images, and property_features
-- This allows authenticated agents and admins to manage (insert, update, delete) records.

-- PROPERTIES write policy
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'properties' 
          AND policyname = 'Allow agents and admins to manage properties'
    ) THEN
        CREATE POLICY "Allow agents and admins to manage properties" ON properties
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM agents 
              WHERE agents.user_id = auth.uid() 
                AND (agents.role = 'agent' OR agents.role = 'senior' OR agents.role = 'admin')
            )
          );
    END IF;
END $$;

-- PROPERTY TRANSLATIONS write policy
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'property_translations' 
          AND policyname = 'Allow agents and admins to manage translations'
    ) THEN
        CREATE POLICY "Allow agents and admins to manage translations" ON property_translations
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM agents 
              WHERE agents.user_id = auth.uid() 
                AND (agents.role = 'agent' OR agents.role = 'senior' OR agents.role = 'admin')
            )
          );
    END IF;
END $$;

-- PROPERTY IMAGES write policy
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'property_images' 
          AND policyname = 'Allow agents and admins to manage images'
    ) THEN
        CREATE POLICY "Allow agents and admins to manage images" ON property_images
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM agents 
              WHERE agents.user_id = auth.uid() 
                AND (agents.role = 'agent' OR agents.role = 'senior' OR agents.role = 'admin')
            )
          );
    END IF;
END $$;

-- PROPERTY FEATURES write policy
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'property_features' 
          AND policyname = 'Allow agents and admins to manage features'
    ) THEN
        CREATE POLICY "Allow agents and admins to manage features" ON property_features
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM agents 
              WHERE agents.user_id = auth.uid() 
                AND (agents.role = 'agent' OR agents.role = 'senior' OR agents.role = 'admin')
            )
          );
    END IF;
END $$;
