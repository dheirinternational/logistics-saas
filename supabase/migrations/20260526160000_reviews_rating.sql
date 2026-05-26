-- Star rating for customer reviews (1–5)
ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS rating smallint;

UPDATE reviews
SET rating = 5
WHERE rating IS NULL;

ALTER TABLE reviews
  ALTER COLUMN rating SET DEFAULT 5;

ALTER TABLE reviews
  ALTER COLUMN rating SET NOT NULL;

ALTER TABLE reviews
  DROP CONSTRAINT IF EXISTS reviews_rating_check;

ALTER TABLE reviews
  ADD CONSTRAINT reviews_rating_check CHECK (rating >= 1 AND rating <= 5);
