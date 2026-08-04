-- Add rejection_note column to public.shipment_requests table
ALTER TABLE public.shipment_requests 
  ADD COLUMN IF NOT EXISTS rejection_note text NULL;
