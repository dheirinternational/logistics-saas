BEGIN;

ALTER TABLE IF EXISTS public.products
  ADD COLUMN IF NOT EXISTS weight_unit text NOT NULL DEFAULT 'kg';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_weight_unit_check') THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_weight_unit_check
      CHECK (weight_unit IN ('kg', 'cbm'));
  END IF;
END
$$;

COMMIT;
