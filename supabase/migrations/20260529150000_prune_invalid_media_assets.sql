-- Remove folder placeholders (e.g. storage_path = 'media-library') mistaken for files.

DELETE FROM public.media_assets
WHERE NOT (
  storage_path ~* '\.(jpg|jpeg|png|webp|gif|heic|heif|avif|mp4|mov|webm|m4v|mkv)$'
);
