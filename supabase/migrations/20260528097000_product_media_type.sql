-- Support product videos alongside images.

ALTER TABLE IF EXISTS public.product_images
  ADD COLUMN IF NOT EXISTS media_type text NOT NULL DEFAULT 'image';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'product_images_media_type_check'
  ) THEN
    ALTER TABLE public.product_images
      ADD CONSTRAINT product_images_media_type_check
      CHECK (media_type IN ('image', 'video'));
  END IF;
END
$$;

