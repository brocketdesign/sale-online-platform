-- Add page_language field to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS page_language TEXT NOT NULL DEFAULT 'en'
  CHECK (page_language IN ('en', 'fr', 'es'));
