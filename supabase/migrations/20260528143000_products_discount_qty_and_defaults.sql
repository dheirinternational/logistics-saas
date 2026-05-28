BEGIN;

ALTER TABLE public.products
  ALTER COLUMN low_stock_threshold SET DEFAULT 0;

ALTER TABLE public.products
  ALTER COLUMN cost_price SET DEFAULT 0;

ALTER TABLE public.products
  ALTER COLUMN weight TYPE numeric(10,2) USING weight::numeric;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS discount_min_qty bigint;

UPDATE public.products
SET discount_price = 0
WHERE discount_price IS NULL;

COMMIT;
