-- ============================================================
-- Email tracking columns on purchases
-- ============================================================

-- Track when the purchase confirmation email was sent
ALTER TABLE public.purchases
  ADD COLUMN IF NOT EXISTS purchase_email_sent_at TIMESTAMPTZ;

-- Track when the review-request email was sent (after 3 days)
ALTER TABLE public.purchases
  ADD COLUMN IF NOT EXISTS review_request_sent_at TIMESTAMPTZ;

-- Index for efficiently finding purchases due a review-request email
CREATE INDEX IF NOT EXISTS purchases_review_request_idx
  ON public.purchases (created_at, review_request_sent_at)
  WHERE review_request_sent_at IS NULL;
