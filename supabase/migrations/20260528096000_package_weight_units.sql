-- Add explicit weight/volume unit across logistics flows (kg vs cbm).
-- Shop products remain kg-only; this migration is for packages/shipments.

ALTER TABLE IF EXISTS public.packages
  ADD COLUMN IF NOT EXISTS weight_unit text NOT NULL DEFAULT 'kg';

ALTER TABLE IF EXISTS public.incoming_packages
  ADD COLUMN IF NOT EXISTS declared_item_weight_unit text NOT NULL DEFAULT 'kg';

ALTER TABLE IF EXISTS public.shipment_requests
  ADD COLUMN IF NOT EXISTS total_weight_unit text NOT NULL DEFAULT 'kg';

ALTER TABLE IF EXISTS public.shipments
  ADD COLUMN IF NOT EXISTS total_weight_unit text NOT NULL DEFAULT 'kg';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'packages_weight_unit_check') THEN
    ALTER TABLE public.packages
      ADD CONSTRAINT packages_weight_unit_check
      CHECK (weight_unit IN ('kg', 'cbm'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'incoming_packages_declared_item_weight_unit_check') THEN
    ALTER TABLE public.incoming_packages
      ADD CONSTRAINT incoming_packages_declared_item_weight_unit_check
      CHECK (declared_item_weight_unit IN ('kg', 'cbm'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'shipment_requests_total_weight_unit_check') THEN
    ALTER TABLE public.shipment_requests
      ADD CONSTRAINT shipment_requests_total_weight_unit_check
      CHECK (total_weight_unit IN ('kg', 'cbm'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'shipments_total_weight_unit_check') THEN
    ALTER TABLE public.shipments
      ADD CONSTRAINT shipments_total_weight_unit_check
      CHECK (total_weight_unit IN ('kg', 'cbm'));
  END IF;
END
$$;

