-- Add show_sales_count flag so sellers can control whether the sales count is visible
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS show_sales_count BOOLEAN NOT NULL DEFAULT FALSE;
