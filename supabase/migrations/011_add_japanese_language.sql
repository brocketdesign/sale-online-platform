-- Extend page_language CHECK constraint to include Japanese
ALTER TABLE products
  DROP CONSTRAINT IF EXISTS products_page_language_check;

ALTER TABLE products
  ADD CONSTRAINT products_page_language_check
  CHECK (page_language IN ('en', 'fr', 'es', 'ja'));
