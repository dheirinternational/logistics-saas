-- Add PCS (pieces), LD (loading_date), EDD (expected_arrival_date) to shipment_requests and shipments tables

ALTER TABLE shipment_requests
ADD COLUMN IF NOT EXISTS total_pieces INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS loading_date DATE,
ADD COLUMN IF NOT EXISTS expected_arrival_date DATE;

ALTER TABLE shipments
ADD COLUMN IF NOT EXISTS total_pieces INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS loading_date DATE,
ADD COLUMN IF NOT EXISTS expected_arrival_date DATE;
