-- Add explicit unit for item pricing methods (kg vs cbm).
-- Keep legacy `price_per_kg` for backwards compatibility, but prefer `price_per_unit`.

ALTER TABLE IF EXISTS public.item_pricing_methods
  ADD COLUMN IF NOT EXISTS price_per_unit numeric;

ALTER TABLE IF EXISTS public.item_pricing_methods
  ADD COLUMN IF NOT EXISTS rate_unit text NOT NULL DEFAULT 'kg';

UPDATE public.item_pricing_methods
SET price_per_unit = COALESCE(price_per_unit, price_per_kg);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'item_pricing_methods_rate_unit_check'
  ) THEN
    ALTER TABLE public.item_pricing_methods
      ADD CONSTRAINT item_pricing_methods_rate_unit_check
      CHECK (rate_unit IN ('kg', 'cbm'));
  END IF;
END
$$;

