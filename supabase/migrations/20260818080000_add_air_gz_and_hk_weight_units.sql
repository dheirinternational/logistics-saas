-- Add air_gz_weight_unit and air_hk_weight_unit to shipments and shipment_requests
ALTER TABLE shipments 
  ADD COLUMN IF NOT EXISTS air_gz_weight_unit VARCHAR(10) DEFAULT 'kg',
  ADD COLUMN IF NOT EXISTS air_hk_weight_unit VARCHAR(10) DEFAULT 'kg';

ALTER TABLE shipment_requests 
  ADD COLUMN IF NOT EXISTS air_gz_weight_unit VARCHAR(10) DEFAULT 'kg',
  ADD COLUMN IF NOT EXISTS air_hk_weight_unit VARCHAR(10) DEFAULT 'kg';
