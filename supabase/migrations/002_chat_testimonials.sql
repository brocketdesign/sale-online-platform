-- ============================================================
-- Chat Testimonials (WhatsApp-style screenshot reviews)
-- Run this in your Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.chat_testimonials (
  id            UUID      DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id    UUID      REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  seller_id     UUID      REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  -- Sender info
  sender_name       TEXT    NOT NULL DEFAULT 'Happy Customer',
  sender_avatar_url TEXT,             -- AI-generated or uploaded

  -- Chat content
  message       TEXT    NOT NULL,
  display_time  TEXT    NOT NULL DEFAULT '09:41',   -- e.g. "09:41"
  display_date  TEXT    NOT NULL DEFAULT 'Today',   -- e.g. "Today", "Yesterday"

  -- Reactions / likes shown below the bubble
  reactions     JSONB   NOT NULL DEFAULT '[]',      -- [{emoji, count}]
  likes_count   INTEGER NOT NULL DEFAULT 0,

  -- Visual customisation
  background_url  TEXT,   -- AI-generated chat background
  chat_bg_color   TEXT    NOT NULL DEFAULT '#ECE5DD',   -- fallback bg colour

  -- Status
  is_active       BOOLEAN NOT NULL DEFAULT true,
  sort_order      INTEGER NOT NULL DEFAULT 0,

  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for quick look-ups per product
CREATE INDEX IF NOT EXISTS idx_chat_testimonials_product
  ON public.chat_testimonials (product_id, is_active, sort_order);

-- RLS
ALTER TABLE public.chat_testimonials ENABLE ROW LEVEL SECURITY;

-- Anyone can read active testimonials for published products
CREATE POLICY "public_read_active_testimonials"
  ON public.chat_testimonials FOR SELECT
  USING (is_active = true);

-- Only the owning seller can insert / update / delete
CREATE POLICY "seller_manage_testimonials"
  ON public.chat_testimonials FOR ALL
  USING (seller_id = auth.uid())
  WITH CHECK (seller_id = auth.uid());

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_chat_testimonials_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END $$;

CREATE TRIGGER trg_chat_testimonials_updated_at
  BEFORE UPDATE ON public.chat_testimonials
  FOR EACH ROW EXECUTE FUNCTION update_chat_testimonials_updated_at();
