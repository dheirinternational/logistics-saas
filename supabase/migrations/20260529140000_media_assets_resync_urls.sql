-- Re-import media_assets from any attachment URLs (idempotent).
-- Storage files are synced at runtime when admins open the Media page.

INSERT INTO public.media_assets (storage_bucket, storage_path, public_url, media_type, file_name)
SELECT DISTINCT ON (storage_bucket, storage_path)
  storage_bucket,
  storage_path,
  public_url,
  CASE
    WHEN lower(storage_path) ~ '\.(mp4|mov|webm|m4v|mkv)$' THEN 'video'
    ELSE 'image'
  END,
  COALESCE(NULLIF(regexp_replace(storage_path, '^.*/', ''), ''), 'media')
FROM (
  SELECT
    image_url AS public_url,
    CASE
      WHEN image_url LIKE '%/storage/v1/object/public/products/%' THEN 'products'
      WHEN image_url LIKE '%/storage/v1/object/public/packages/%' THEN 'packages'
      WHEN image_url LIKE '%/storage/v1/object/public/shipments/%' THEN 'shipments'
      ELSE NULL
    END AS storage_bucket,
    CASE
      WHEN image_url LIKE '%/storage/v1/object/public/products/%' THEN
        substring(image_url from '.*/storage/v1/object/public/products/(.+)$')
      WHEN image_url LIKE '%/storage/v1/object/public/packages/%' THEN
        substring(image_url from '.*/storage/v1/object/public/packages/(.+)$')
      WHEN image_url LIKE '%/storage/v1/object/public/shipments/%' THEN
        substring(image_url from '.*/storage/v1/object/public/shipments/(.+)$')
      ELSE NULL
    END AS storage_path
  FROM (
    SELECT image_url FROM public.product_images
    UNION ALL
    SELECT image_url FROM public.package_images
    UNION ALL
    SELECT image_url FROM public.shipment_images
  ) existing_urls
) parsed
WHERE storage_bucket IS NOT NULL
  AND storage_path IS NOT NULL
  AND length(trim(storage_path)) > 0
ON CONFLICT (storage_bucket, storage_path) DO NOTHING;

UPDATE public.product_images pi
SET media_asset_id = ma.id
FROM public.media_assets ma
WHERE pi.media_asset_id IS NULL
  AND pi.image_url = ma.public_url;

UPDATE public.package_images pi
SET media_asset_id = ma.id, media_type = ma.media_type
FROM public.media_assets ma
WHERE pi.media_asset_id IS NULL
  AND pi.image_url = ma.public_url;

UPDATE public.shipment_images si
SET media_asset_id = ma.id, media_type = ma.media_type
FROM public.media_assets ma
WHERE si.media_asset_id IS NULL
  AND si.image_url = ma.public_url;
