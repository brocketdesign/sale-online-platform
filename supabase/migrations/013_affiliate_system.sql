-- ============================================================
-- Affiliate System
-- ============================================================

-- 1. Add affiliate settings to products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS affiliate_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS affiliate_commission_rate INTEGER NOT NULL DEFAULT 0
    CHECK (affiliate_commission_rate >= 0 AND affiliate_commission_rate <= 100);

-- 2. Add affiliate balance to profiles (in cents, same unit as prices)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS affiliate_balance INTEGER NOT NULL DEFAULT 0;

-- 3. Affiliate links — one per (affiliate_user, product)
CREATE TABLE IF NOT EXISTS public.affiliate_links (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id      UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  affiliate_id    UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  code            TEXT UNIQUE NOT NULL,
  clicks          INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (product_id, affiliate_id)
);

-- 4. Affiliate commissions — one record per purchase driven by an affiliate link
CREATE TABLE IF NOT EXISTS public.affiliate_commissions (
  id                  UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  affiliate_link_id   UUID REFERENCES public.affiliate_links(id) ON DELETE SET NULL,
  affiliate_id        UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
  product_id          UUID REFERENCES public.products(id) ON DELETE SET NULL,
  order_id            UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  commission_amount   INTEGER NOT NULL DEFAULT 0, -- in cents
  currency            TEXT NOT NULL DEFAULT 'usd',
  status              TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  created_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. RLS policies for affiliate_links
ALTER TABLE public.affiliate_links ENABLE ROW LEVEL SECURITY;

-- Affiliates can view their own links
CREATE POLICY "affiliate_links_select_own"
  ON public.affiliate_links FOR SELECT
  USING (affiliate_id = auth.uid());

-- Sellers can view links for their own products
CREATE POLICY "affiliate_links_select_seller"
  ON public.affiliate_links FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_id AND p.seller_id = auth.uid()
    )
  );

-- Any authenticated user can create an affiliate link for affiliate-enabled products
CREATE POLICY "affiliate_links_insert"
  ON public.affiliate_links FOR INSERT
  WITH CHECK (
    affiliate_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_id AND p.affiliate_enabled = TRUE
    )
  );

-- Affiliates can delete their own links
CREATE POLICY "affiliate_links_delete_own"
  ON public.affiliate_links FOR DELETE
  USING (affiliate_id = auth.uid());

-- 6. RLS policies for affiliate_commissions
ALTER TABLE public.affiliate_commissions ENABLE ROW LEVEL SECURITY;

-- Affiliates can see their own commissions
CREATE POLICY "affiliate_commissions_select_own"
  ON public.affiliate_commissions FOR SELECT
  USING (affiliate_id = auth.uid());

-- Sellers can see commissions related to their products
CREATE POLICY "affiliate_commissions_select_seller"
  ON public.affiliate_commissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_id AND p.seller_id = auth.uid()
    )
  );

-- Service role can insert (done server-side on purchase success)
-- No INSERT policy needed for anon/authenticated — inserts happen via service role

-- 7. Index for performance
CREATE INDEX IF NOT EXISTS idx_affiliate_links_code ON public.affiliate_links (code);
CREATE INDEX IF NOT EXISTS idx_affiliate_links_product ON public.affiliate_links (product_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_links_affiliate ON public.affiliate_links (affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_affiliate ON public.affiliate_commissions (affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_order ON public.affiliate_commissions (order_id);

-- 8. Function to increment affiliate link clicks (safe concurrent update)
CREATE OR REPLACE FUNCTION public.increment_affiliate_clicks(link_code TEXT)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.affiliate_links SET clicks = clicks + 1 WHERE code = link_code;
END;
$$;

-- 9. Function to increment affiliate balance (safe concurrent update)
CREATE OR REPLACE FUNCTION public.increment_affiliate_balance(user_id UUID, amount INTEGER)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles SET affiliate_balance = affiliate_balance + amount WHERE id = user_id;
END;
$$;
