-- Add explicit rate unit (kg vs cbm) to pricing templates.
-- This avoids silently assuming "kg" everywhere and lets admin choose/display correctly.

ALTER TABLE IF EXISTS public.air_pricing_templates
  ADD COLUMN IF NOT EXISTS rate_unit text NOT NULL DEFAULT 'kg';

ALTER TABLE IF EXISTS public.express_pricing_templates
  ADD COLUMN IF NOT EXISTS rate_unit text NOT NULL DEFAULT 'kg';

ALTER TABLE IF EXISTS public.sea_pricing_templates
  ADD COLUMN IF NOT EXISTS rate_unit text NOT NULL DEFAULT 'cbm';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'air_pricing_templates_rate_unit_check'
  ) THEN
    ALTER TABLE public.air_pricing_templates
      ADD CONSTRAINT air_pricing_templates_rate_unit_check
      CHECK (rate_unit IN ('kg', 'cbm'));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'express_pricing_templates_rate_unit_check'
  ) THEN
    ALTER TABLE public.express_pricing_templates
      ADD CONSTRAINT express_pricing_templates_rate_unit_check
      CHECK (rate_unit IN ('kg', 'cbm'));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'sea_pricing_templates_rate_unit_check'
  ) THEN
    ALTER TABLE public.sea_pricing_templates
      ADD CONSTRAINT sea_pricing_templates_rate_unit_check
      CHECK (rate_unit IN ('kg', 'cbm'));
  END IF;
END
$$;

