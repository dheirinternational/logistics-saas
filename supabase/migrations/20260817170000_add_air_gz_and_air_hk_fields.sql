-- Add Air GZ and Air HK specific weight, cost, pieces, LD, and EDD columns to shipment_requests and shipments
ALTER TABLE shipment_requests 
ADD COLUMN IF NOT EXISTS air_gz_weight NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS air_gz_cost NUMERIC(12,2),
ADD COLUMN IF NOT EXISTS air_gz_pieces INTEGER,
ADD COLUMN IF NOT EXISTS air_gz_loading_date DATE,
ADD COLUMN IF NOT EXISTS air_gz_expected_arrival_date DATE,
ADD COLUMN IF NOT EXISTS air_hk_weight NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS air_hk_cost NUMERIC(12,2),
ADD COLUMN IF NOT EXISTS air_hk_pieces INTEGER,
ADD COLUMN IF NOT EXISTS air_hk_loading_date DATE,
ADD COLUMN IF NOT EXISTS air_hk_expected_arrival_date DATE;

ALTER TABLE shipments 
ADD COLUMN IF NOT EXISTS air_gz_weight NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS air_gz_cost NUMERIC(12,2),
ADD COLUMN IF NOT EXISTS air_gz_pieces INTEGER,
ADD COLUMN IF NOT EXISTS air_gz_loading_date DATE,
ADD COLUMN IF NOT EXISTS air_gz_expected_arrival_date DATE,
ADD COLUMN IF NOT EXISTS air_hk_weight NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS air_hk_cost NUMERIC(12,2),
ADD COLUMN IF NOT EXISTS air_hk_pieces INTEGER,
ADD COLUMN IF NOT EXISTS air_hk_loading_date DATE,
ADD COLUMN IF NOT EXISTS air_hk_expected_arrival_date DATE;
