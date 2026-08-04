-- Add total_price to shipment_requests so accepted requests can display the finalized amount
ALTER TABLE shipment_requests ADD COLUMN IF NOT EXISTS total_price NUMERIC(12, 2);
