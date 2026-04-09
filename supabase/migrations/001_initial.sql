-- ============================================================
-- Sale Online Platform — Initial Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  tagline TEXT,
  avatar_url TEXT,
  website_url TEXT,
  twitter_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- PRODUCTS
-- ============================================================
DO $$ BEGIN
  CREATE TYPE product_status AS ENUM ('draft', 'published');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE product_format AS ENUM ('pdf', 'mp3', 'mp4', 'epub', 'zip', 'software', 'other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  banner_url TEXT,
  price INTEGER NOT NULL DEFAULT 0, -- in cents
  currency TEXT NOT NULL DEFAULT 'usd',
  status product_status NOT NULL DEFAULT 'draft',
  tags TEXT[] NOT NULL DEFAULT '{}',
  product_format product_format NOT NULL DEFAULT 'other',
  conversion_message TEXT,
  sales_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(seller_id, slug)
);

-- ============================================================
-- PRODUCT FILES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.product_files (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  body TEXT,
  verified_buyer BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(product_id, reviewer_id)
);

-- ============================================================
-- ORDERS
-- ============================================================
DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('pending', 'paid', 'failed', 'refunded', 'completed', 'disputed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  stripe_session_id TEXT UNIQUE NOT NULL,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  buyer_email TEXT NOT NULL,
  buyer_name TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT 'US',
  total_amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  tip_amount INTEGER NOT NULL DEFAULT 0,
  status order_status NOT NULL DEFAULT 'pending',
  gift_recipient_email TEXT,
  gift_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- ORDER ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- PURCHASES (grants access to files)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  buyer_email TEXT NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  amount_paid INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'usd',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- EMAIL SUBSCRIBERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.email_subscribers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(seller_id, email)
);

-- ============================================================
-- TRIGGERS — updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS products_updated_at ON public.products;
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TRIGGER — auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  username_val TEXT;
BEGIN
  -- Use email prefix as default username, with random suffix to ensure uniqueness
  username_val := LOWER(REGEXP_REPLACE(SPLIT_PART(NEW.email, '@', 1), '[^a-z0-9]', '', 'g'));
  IF LENGTH(username_val) < 3 THEN
    username_val := 'user' || FLOOR(RANDOM() * 90000 + 10000)::TEXT;
  ELSE
    username_val := username_val || FLOOR(RANDOM() * 900 + 100)::TEXT;
  END IF;

  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    username_val,
    COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_subscribers ENABLE ROW LEVEL SECURITY;

-- PROFILES
DROP POLICY IF EXISTS "Profiles are publicly viewable" ON public.profiles;
CREATE POLICY "Profiles are publicly viewable" ON public.profiles
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- PRODUCTS
DROP POLICY IF EXISTS "Published products are publicly viewable" ON public.products;
CREATE POLICY "Published products are publicly viewable" ON public.products
  FOR SELECT USING (status = 'published' OR seller_id = auth.uid());

DROP POLICY IF EXISTS "Sellers can insert own products" ON public.products;
CREATE POLICY "Sellers can insert own products" ON public.products
  FOR INSERT WITH CHECK (seller_id = auth.uid());

DROP POLICY IF EXISTS "Sellers can update own products" ON public.products;
CREATE POLICY "Sellers can update own products" ON public.products
  FOR UPDATE USING (seller_id = auth.uid());

DROP POLICY IF EXISTS "Sellers can delete own products" ON public.products;
CREATE POLICY "Sellers can delete own products" ON public.products
  FOR DELETE USING (seller_id = auth.uid());

-- PRODUCT FILES
DROP POLICY IF EXISTS "Product files viewable by owner or purchaser" ON public.product_files;
CREATE POLICY "Product files viewable by owner or purchaser" ON public.product_files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_id AND p.seller_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.purchases pu
      WHERE pu.product_id = product_files.product_id
        AND (pu.buyer_id = auth.uid() OR pu.buyer_email = auth.jwt()->>'email')
    )
  );

DROP POLICY IF EXISTS "Sellers can manage own product files" ON public.product_files;
CREATE POLICY "Sellers can manage own product files" ON public.product_files
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_id AND p.seller_id = auth.uid()
    )
  );

-- REVIEWS
DROP POLICY IF EXISTS "Reviews are publicly viewable" ON public.reviews;
CREATE POLICY "Reviews are publicly viewable" ON public.reviews
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Verified buyers can insert reviews" ON public.reviews;
CREATE POLICY "Verified buyers can insert reviews" ON public.reviews
  FOR INSERT WITH CHECK (
    auth.uid() = reviewer_id
    AND EXISTS (
      SELECT 1 FROM public.purchases pu
      WHERE pu.product_id = reviews.product_id
        AND pu.buyer_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own reviews" ON public.reviews;
CREATE POLICY "Users can update own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = reviewer_id);

-- ORDERS
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (
    buyer_id = auth.uid()
    OR buyer_email = (auth.jwt()->>'email')
  );

-- ORDER ITEMS
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
CREATE POLICY "Users can view own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id
        AND (o.buyer_id = auth.uid() OR o.buyer_email = (auth.jwt()->>'email'))
    )
  );

-- PURCHASES
DROP POLICY IF EXISTS "Users can view own purchases" ON public.purchases;
CREATE POLICY "Users can view own purchases" ON public.purchases
  FOR SELECT USING (
    buyer_id = auth.uid()
    OR buyer_email = (auth.jwt()->>'email')
  );

-- EMAIL SUBSCRIBERS
DROP POLICY IF EXISTS "Sellers can view own subscribers" ON public.email_subscribers;
CREATE POLICY "Sellers can view own subscribers" ON public.email_subscribers
  FOR SELECT USING (seller_id = auth.uid());

DROP POLICY IF EXISTS "Anyone can subscribe" ON public.email_subscribers;
CREATE POLICY "Anyone can subscribe" ON public.email_subscribers
  FOR INSERT WITH CHECK (TRUE);

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================
CREATE OR REPLACE FUNCTION public.increment_sales_count(product_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.products
  SET sales_count = sales_count + 1
  WHERE id = product_id;
END;
$$;

-- ============================================================
-- STORAGE BUCKETS
-- Run these separately in Supabase Dashboard > Storage
-- or use the Supabase CLI
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('product-banners', 'product-banners', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('product-files', 'product-files', false);

-- Storage policies for product-banners (public read)
-- CREATE POLICY "Public banner access" ON storage.objects FOR SELECT USING (bucket_id = 'product-banners');
-- CREATE POLICY "Sellers can upload banners" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-banners' AND auth.uid() IS NOT NULL);
-- CREATE POLICY "Sellers can update own banners" ON storage.objects FOR UPDATE USING (bucket_id = 'product-banners' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Sellers can delete own banners" ON storage.objects FOR DELETE USING (bucket_id = 'product-banners' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for product-files (private — served via signed URLs)
-- CREATE POLICY "Sellers can upload product files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-files' AND auth.uid() IS NOT NULL);
-- CREATE POLICY "Service role can read product files" ON storage.objects FOR SELECT USING (bucket_id = 'product-files');
