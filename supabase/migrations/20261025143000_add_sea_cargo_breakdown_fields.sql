-- Add Sea Cargo specific weight, cost, pieces, LD, and EDD columns to shipment_requests and shipments
ALTER TABLE shipment_requests 
ADD COLUMN IF NOT EXISTS sea_weight NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS sea_weight_unit VARCHAR(10) DEFAULT 'cbm',
ADD COLUMN IF NOT EXISTS sea_cost NUMERIC(12,2),
ADD COLUMN IF NOT EXISTS sea_pieces INTEGER,
ADD COLUMN IF NOT EXISTS sea_loading_date DATE,
ADD COLUMN IF NOT EXISTS sea_expected_arrival_date DATE;

ALTER TABLE shipments 
ADD COLUMN IF NOT EXISTS sea_weight NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS sea_weight_unit VARCHAR(10) DEFAULT 'cbm',
ADD COLUMN IF NOT EXISTS sea_cost NUMERIC(12,2),
ADD COLUMN IF NOT EXISTS sea_pieces INTEGER,
ADD COLUMN IF NOT EXISTS sea_loading_date DATE,
ADD COLUMN IF NOT EXISTS sea_expected_arrival_date DATE;
