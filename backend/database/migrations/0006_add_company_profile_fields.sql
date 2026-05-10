-- Add missing fields to companies table for complete company profiles
-- Migration: 0006_add_company_profile_fields.sql

-- Add mission column
ALTER TABLE companies ADD COLUMN mission TEXT NULL AFTER description;

-- Add founded_year column
ALTER TABLE companies ADD COLUMN founded_year YEAR NULL AFTER mission;

-- Update existing companies with default values if needed
UPDATE companies SET mission = 'Our mission is to deliver excellence' WHERE mission IS NULL;
