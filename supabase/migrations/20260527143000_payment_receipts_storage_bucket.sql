-- Storage bucket for manual payment receipts.
-- Used by lib/manualPayments/storage.ts to upload and generate signed URLs.

INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES (
  'payment-receipts',
  'payment-receipts',
  false,
  5242880,
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf'
  ]::text[]
)
ON CONFLICT (id) DO NOTHING;

