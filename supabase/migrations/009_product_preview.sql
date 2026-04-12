-- Add preview settings to products table
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS preview_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS preview_page_count INTEGER NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS preview_blur BOOLEAN NOT NULL DEFAULT FALSE;

-- Product preview images table
CREATE TABLE IF NOT EXISTS public.product_preview_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- RLS for product_preview_images
ALTER TABLE public.product_preview_images ENABLE ROW LEVEL SECURITY;

-- Anyone can read preview images for published products
DROP POLICY IF EXISTS "preview_images_public_read" ON public.product_preview_images;
CREATE POLICY "preview_images_public_read" ON public.product_preview_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = product_preview_images.product_id
        AND products.status = 'published'
        AND products.preview_enabled = TRUE
    )
  );

-- Sellers can manage their own product preview images
DROP POLICY IF EXISTS "preview_images_seller_manage" ON public.product_preview_images;
CREATE POLICY "preview_images_seller_manage" ON public.product_preview_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = product_preview_images.product_id
        AND products.seller_id = auth.uid()
    )
  );

-- ============================================================
-- Storage bucket for product preview images (public read)
-- Path convention: {seller-uuid}/{product-uuid}/preview-{timestamp}-{index}.{ext}
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-previews', 'product-previews', true)
ON CONFLICT (id) DO NOTHING;

-- Public read
DROP POLICY IF EXISTS "Public product-previews access" ON storage.objects;
CREATE POLICY "Public product-previews access" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-previews');

-- Sellers can upload into their own folder
DROP POLICY IF EXISTS "Sellers can upload product previews" ON storage.objects;
CREATE POLICY "Sellers can upload product previews" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-previews'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Sellers can overwrite their own preview files
DROP POLICY IF EXISTS "Sellers can update product previews" ON storage.objects;
CREATE POLICY "Sellers can update product previews" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'product-previews'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Sellers can delete their own preview files
DROP POLICY IF EXISTS "Sellers can delete product previews" ON storage.objects;
CREATE POLICY "Sellers can delete product previews" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-previews'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
